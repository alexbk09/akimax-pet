#!/usr/bin/env node
// ============================================================
// Script de migraciones y seeders automatizados para Supabase
//
// Uso:
//   npm run supabase:setup
//   node supabase/run.mjs             # Igual que el anterior
//   node supabase/run.mjs --only-seed # Solo ejecuta seeders
//   node supabase/run.mjs --verify    # Verifica el estado actual
//
// Requisitos en .env (ver .env.development.local):
//   SUPABASE_URL=https://kxjbwizjmblrgdcnoral.supabase.co/
//   SUPABASE_DB_PASSWORD=TU_PASSWORD_DE_LA_BASE_DE_DATOS
//       (o DATABASE_URL con la password incluida; el host se detecta solo)
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (de settings > API keys)
//   SUPABASE_ADMIN_EMAIL=admin@ilumax.ve          (opcional, default)
//   SUPABASE_ADMIN_PASSWORD=CambiaEstaClave123!   (opcional, default)
//
// El script detecta automáticamente el host de conexión correcto:
//   1. Prueba los poolers de Supabase (aws-0-<region>.pooler.supabase.com)
//      para todas las regiones disponibles
//   2. Prueba hosts legacy (db.<ref>.supabase.co, <ref>.supabase.co)
//   3. Usa el primero que responda
// ============================================================

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import pg from 'pg'

// Cargar variables de entorno
config({ path: ['.env.development.local', '.env.local', '.env'] })

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, 'migrations')
const SEED_DIR = join(__dirname, 'seed')
const MIGRATIONS_TABLE = '_migrations'
const MIGRATIONS_HISTORY_TABLE = '_migrations_history'

// Regiones AWS donde Supabase despliega proyectos (ordenadas por probabilidad)
const POOLER_REGIONS = [
  'sa-east-1',       // São Paulo (probable para Venezuela/LatAm)
  'us-east-1',       // N. Virginia (default común)
  'us-west-1',       // N. California
  'us-west-2',       // Oregon
  'us-east-2',       // Ohio
  'eu-central-1',    // Frankfurt
  'eu-west-1',       // Ireland
  'eu-west-2',       // London
  'eu-north-1',      // Stockholm
  'ap-southeast-1',  // Singapore
  'ap-southeast-2',  // Sydney
  'ap-northeast-1',  // Tokyo
  'ap-northeast-2',  // Seoul
  'ap-south-1',      // Mumbai
  'ca-central-1',    // Canada
  'me-central-1',    // Bahrain
]

// ─── Utilidades ──────────────────────────────────────────────────

/** Imprime con color para diferenciar migraciones de seeders */
function printStep(message) { console.log(`\n\x1b[1;36m▶ ${message}\x1b[0m`) }
function printOk(message) { console.log(`  \x1b[1;32m✓\x1b[0m ${message}`) }
function printSkip(message) { console.log(`  \x1b[1;33m•\x1b[0m ${message}`) }
function printWarn(message) { console.log(`  \x1b[1;33m⚠\x1b[0m ${message}`) }
function printError(message) { console.error(`  \x1b[1;31m✗\x1b[0m ${message}`) }
function printInfo(message) { console.log(message) }

/** Filtra archivos .sql de un directorio, ignorando archivos que empiezan con _ o . */
function getSqlFiles(dir) {
  if (!dir) return []
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.sql') && !f.startsWith('_') && !f.startsWith('.'))
      .sort()
  } catch {
    return []
  }
}

/** Reemplaza placeholders {{KEY}} en el SQL del seeder */
function replacePlaceholders(sql, replacements) {
  let result = sql
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(`{{${key}}}`).join(value ?? '')
  }
  return result
}

/** Extrae el project ref de la URL de Supabase (ej: kxjbwizjmblrgdcnoral) */
function getProjectRef(supabaseUrl) {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match?.[1] ?? null
}

/**
 * Descubre automáticamente el host de PostgreSQL correcto.
 * Prueba los poolers por región y hosts legacy, usando la password real.
 * Devuelve la connection string que funciona, o null.
 */
async function discoverConnectionString(ref, dbPassword, existingDatabaseUrl) {
  // Si el usuario ya configuró DATABASE_URL, extraemos su password
  let password = dbPassword
  if (!password && existingDatabaseUrl) {
    try { password = new URL(existingDatabaseUrl).password } catch {}
  }
  if (!password) return null

  const encodedPassword = encodeURIComponent(password)

  const candidates = [
    // 1) Poolers modernos (sesión, puerto 5432)
    ...POOLER_REGIONS.map(r =>
      `postgresql://postgres.${ref}:${encodedPassword}@aws-0-${r}.pooler.supabase.com:5432/postgres`
    ),
    // 2) Legacy directo
    `postgresql://postgres:${encodedPassword}@${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres:${encodedPassword}@db.${ref}.supabase.co:5432/postgres`,
  ]

  // Si el usuario ya tenía DATABASE_URL con host propio, probarlo primero
  if (existingDatabaseUrl && !existingDatabaseUrl.includes('[YOUR-PASSWORD]')) {
    candidates.unshift(existingDatabaseUrl)
  }

  printInfo('  Probando hosts de conexión...')
  for (const candidate of candidates) {
    const host = new URL(candidate).hostname
    process.stdout.write(`    ${host} ... `)

    const client = new pg.Client({
      connectionString: candidate,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    })

    try {
      await client.connect()
      await client.query('select 1')
      await client.end()
      console.log('✓')
      printOk(`Conexión establecida con: ${host}`)
      return candidate
    } catch {
      console.log('✗')
      try { await client.end() } catch {}
    }
  }

  return null
}

/**
 * Crea el usuario admin en Supabase Auth (si no existe) usando la API REST
 * con la service_role key. Necesario porque auth.admin_create_user no es
 * ejecutable desde una conexión directa de PostgreSQL.
 */
async function ensureAdminUser(supabaseUrl, serviceRoleKey, adminEmail, adminPassword) {
  const baseUrl = supabaseUrl.replace(/\/+$/, '')
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }

  // 1) Buscar si el usuario ya existe (listar por email)
  const searchRes = await fetch(
    `${baseUrl}/auth/v1/admin/users?per_page=1000`,
    { headers }
  )

  if (!searchRes.ok) {
    throw new Error(`No se pudo consultar usuarios admin (${searchRes.status}): ${await searchRes.text()}`)
  }

  const { users } = await searchRes.json()
  const existing = users?.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase())

  if (existing) {
    printSkip(`El usuario admin ${adminEmail} ya existe en Supabase Auth`)
    return existing.id
  }

  // 2) Crear el usuario
  printInfo(`  Creando usuario admin ${adminEmail}...`)
  const createRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador akimax',
        role: 'Administrador',
      },
    }),
  })

  if (!createRes.ok) {
    const errorBody = await createRes.text()
    // Si el error dice que ya existe, lo tratamos como éxito (idempotencia)
    if (createRes.status === 422 && errorBody.includes('already been registered')) {
      printWarn(`El usuario admin ${adminEmail} ya está registrado (confirmado en API)`)
      // Buscarlo de nuevo
      const reSearch = await fetch(`${baseUrl}/auth/v1/admin/users?per_page=1000`, { headers })
      const { users: reUsers } = await reSearch.json()
      const re = reUsers?.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase())
      return re?.id
    }
    throw new Error(`Error creando usuario admin (${createRes.status}): ${errorBody}`)
  }

  const created = await createRes.json()
  printOk(`Usuario admin ${adminEmail} creado en Supabase Auth`)
  return created.id
}

// ─── Lógica principal ────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const onlySeed = args.includes('--only-seed')
  const verify = args.includes('--verify')

  // ── 1) Verificar configuración ────────────────────────────────
  printStep('Verificando configuración...')

  const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = requiredEnv.filter(key => !process.env[key])
  if (missing.length > 0) {
    printError(`Faltan variables de entorno: ${missing.join(', ')}`)
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const existingDatabaseUrl = process.env.DATABASE_URL
  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL || 'admin@akimax.pet'
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD || 'CambiaEstaClave123!'

  const ref = getProjectRef(supabaseUrl)
  if (!ref) {
    printError(`No se pudo extraer el project ref de SUPABASE_URL: ${supabaseUrl}`)
    process.exit(1)
  }

  printOk('Variables de entorno cargadas')
  printInfo(`  Project ref       : ${ref}`)
  printInfo(`  Admin email       : ${adminEmail}`)
  if (existingDatabaseUrl && !existingDatabaseUrl.includes('[YOUR-PASSWORD]')) {
    printOk('  DATABASE_URL       : definida (password detectada)')
  } else if (process.env.SUPABASE_DB_PASSWORD) {
    printOk('  SUPABASE_DB_PASSWORD: definida')
  } else {
    printWarn('  Password de DB     : NO definida')
    printWarn('  → Agrega SUPABASE_DB_PASSWORD=tu_password en .env.development.local')
    printWarn('    (o reemplaza [YOUR-PASSWORD] en DATABASE_URL)')
  }

  // ── 2) Descubrir conexión ─────────────────────────────────────
  printStep('Descubriendo host de PostgreSQL...')

  const connectionString = await discoverConnectionString(ref, process.env.SUPABASE_DB_PASSWORD, existingDatabaseUrl)

  if (!connectionString) {
    printError(`
No se pudo conectar a ninguna base de datos.

Posibles causas y soluciones:
1. La password de la DB es incorrecta.
   → Supabase Dashboard → Project Settings → Database → Reset database password
   → Actualiza SUPABASE_DB_PASSWORD en .env.development.local

2. El proyecto está en pausa o sin acceso por IP.
   → Supabase Dashboard → Project Settings → Database → Connection pooling
   → Copia la connection string del pooler (IPv4) directamente a DATABASE_URL

3. Bloqueo de red local.
   → Algunas redes corporativas bloquean puertos postgres (5432).
`)
    process.exit(1)
  }

  // ── 3) Conectar a PostgreSQL ──────────────────────────────────
  printStep('Conectando a Supabase...')

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    printOk('Conexión exitosa a la base de datos')
  } catch (error) {
    printError(`No se pudo conectar: ${error.message}`)
    process.exit(1)
  }

  // ── 4) Crear tablas de registro de migraciones ────────────────
  // RLS habilitado: son tablas internas; el rol postgres (este script)
  // y service_role bypassan RLS, pero la API REST (anon/authenticated)
  // queda bloqueada por completo.
  await client.query(`
    create table if not exists public.${MIGRATIONS_TABLE} (
      id serial primary key,
      filename text not null unique,
      applied_at timestamptz not null default now()
    );

    create table if not exists public.${MIGRATIONS_HISTORY_TABLE} (
      id serial primary key,
      filename text not null,
      status text not null check (status in ('applied', 'failed', 'skipped')),
      detail text,
      run_at timestamptz not null default now()
    );

    alter table public.${MIGRATIONS_TABLE} enable row level security;
    alter table public.${MIGRATIONS_HISTORY_TABLE} enable row level security;

    revoke all on public.${MIGRATIONS_TABLE} from anon, authenticated;
    revoke all on public.${MIGRATIONS_HISTORY_TABLE} from anon, authenticated;

    grant all on public.${MIGRATIONS_TABLE} to service_role;
    grant all on public.${MIGRATIONS_HISTORY_TABLE} to service_role;
  `)

  // ── 5) Modo verify ────────────────────────────────────────────
  if (verify) {
    printStep('Verificando estado actual...')
    const { rows: appliedRows } = await client.query(`select filename, applied_at from public.${MIGRATIONS_TABLE} order by id`)
    const appliedSet = new Set(appliedRows.map(r => r.filename))
    const migrationFiles = getSqlFiles(MIGRATIONS_DIR)

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        printOk(`Migración ${file} → aplicada (${appliedRows.find(r => r.filename === file).applied_at})`)
      } else {
        printSkip(`Migración ${file} → NO aplicada`)
      }
    }

    // Verificación de tablas
    const { rows: tables } = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      and table_name in ('profiles','roles','categories','products','services','service_prices','customers','pets','medical_records','appointments','sales','sale_items','cash_registers','inventory_movements','exchange_rates','_migrations')
      order by table_name
    `)
    const existingTables = new Set(tables.map(t => t.table_name))
    const expectedTables = ['profiles','roles','categories','products','services','service_prices','customers','pets','medical_records','appointments','sales','sale_items','cash_registers','inventory_movements','exchange_rates','_migrations']
    printInfo('\n  Tablas:')
    for (const t of expectedTables) {
      if (existingTables.has(t)) printOk(`${t}`)
      else printWarn(`${t} → NO existe`)
    }

    // Verificación de bucket
    const { rows: buckets } = await client.query(`select id, public from storage.buckets`)
    printInfo('\n  Storage:')
    if (buckets.length > 0) buckets.forEach(b => printOk(`Bucket ${b.id} (public=${b.public})`))
    else printWarn('No hay buckets creados')

    // Verificación de roles y módulos
    const { rows: roles } = await client.query(`select name from public.roles order by name`)
    printInfo('\n  Roles:')
    if (roles.length > 0) roles.forEach(r => printOk(r.name))
    else printWarn('No hay roles insertados todavía')

    // Verificación de RLS en todas las tablas public
    const { rows: rlsRows } = await client.query(`
      select
        c.relname as table_name,
        c.relrowsecurity as rls_enabled
      from pg_class c
      left join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
      order by c.relname
    `)
    printInfo('\n  Row Level Security:')
    const tablesWithoutRls = rlsRows.filter(r => !r.rls_enabled)
    for (const t of rlsRows) {
      if (t.rls_enabled) printOk(`${t.table_name} → RLS habilitado`)
      else printWarn(`${t.table_name} → RLS DESHABILITADO`)
    }
    if (tablesWithoutRls.length > 0) {
      printWarn(`\n  ⚠ ${tablesWithoutRls.length} tabla(s) sin RLS: ${tablesWithoutRls.map(t => t.table_name).join(', ')}`)
    } else {
      printOk('Todas las tablas tienen RLS habilitado')
    }

    await client.end()
    return
  }

  // ── 6) Ejecutar migraciones (si no es --only-seed) ────────────
  if (!onlySeed) {
    printStep('Ejecutando migraciones...')
    const migrationFiles = getSqlFiles(MIGRATIONS_DIR)
    if (migrationFiles.length === 0) {
      printWarn('No hay archivos de migración en supabase/migrations/')
    }

    // Obtener migraciones ya aplicadas
    const { rows: appliedRows } = await client.query(`select filename from public.${MIGRATIONS_TABLE} order by id`)
    const appliedSet = new Set(appliedRows.map(r => r.filename))

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        printSkip(`Migración ${file} → ya aplicada anteriormente`)
        continue
      }

      printInfo(`\n  Aplicando migración: ${file}`)
      const filePath = join(MIGRATIONS_DIR, file)
      const sql = readFileSync(filePath, 'utf8')

      try {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query(`insert into public.${MIGRATIONS_TABLE} (filename) values ($1)`, [file])
        await client.query(`insert into public.${MIGRATIONS_HISTORY_TABLE} (filename, status) values ($1, 'applied')`, [file])
        await client.query('COMMIT')
        printOk(`Migración ${file} aplicada con éxito`)
      } catch (error) {
        await client.query('ROLLBACK')
        printError(`Migración ${file} falló: ${error.message}`)
        try {
          await client.query(`insert into public.${MIGRATIONS_HISTORY_TABLE} (filename, status, detail) values ($1, 'failed', $2)`, [file, error.message])
        } catch {}
      }
    }
  }

  // ── 7) Crear usuario admin vía API (antes de seeders SQL) ─────
  if (!onlySeed) {
    printStep('Creando usuario administrador en Supabase Auth...')
    try {
      await ensureAdminUser(supabaseUrl, serviceRoleKey, adminEmail, adminPassword)
    } catch (error) {
      printError(`No se pudo crear/verificar el usuario admin: ${error.message}`)
      printWarn('Continúa con los seeders. Revisa SUPABASE_SERVICE_ROLE_KEY si el problema persiste.')
    }
  }

  // ── 8) Ejecutar seeders ───────────────────────────────────────
  printStep('Ejecutando seeders (idempotentes)...')
  const seedFiles = getSqlFiles(SEED_DIR)

  for (const file of seedFiles) {
    printInfo(`\n  Ejecutando seeder: ${file}`)
    const filePath = join(SEED_DIR, file)
    let sql = readFileSync(filePath, 'utf8')

    // Reemplazar placeholders en el seeder del admin
    sql = replacePlaceholders(sql, {
      ADMIN_EMAIL: adminEmail,
      ADMIN_PASSWORD: adminPassword,
    })

    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
      printOk(`Seeder ${file} ejecutado correctamente`)
    } catch (error) {
      await client.query('ROLLBACK')
      printError(`Seeder ${file} falló: ${error.message}`)
    }
  }

  // ── 9) Resumen final ──────────────────────────────────────────
  printStep('Resumen')
  const { rows: migrationCount } = await client.query(`select count(*)::int as count from public.${MIGRATIONS_TABLE}`)
  const { rows: roleCount } = await client.query(`select count(*)::int as count from public.roles`)
  const { rows: adminCount } = await client.query(`select count(*)::int as count from public.profiles where role = 'Administrador'`)
  const { rows: adminAuthCount } = await client.query(`select count(*)::int as count from auth.users where email = $1`, [adminEmail])

  printOk(`Migraciones aplicadas: ${migrationCount[0].count}`)
  printOk(`Roles insertados: ${roleCount[0].count}`)
  printOk(`Usuarios admin: ${adminCount[0].count}`)
  if (adminAuthCount[0].count > 0) {
    printOk(`Usuario ${adminEmail} existe en auth.users`)
  } else {
    printWarn(`Usuario ${adminEmail} NO existe en auth.users`)
  }

  if (adminCount[0].count === 0) {
    printWarn('No hay perfiles con rol admin. Revisa SUPABASE_ADMIN_EMAIL / SUPABASE_ADMIN_PASSWORD y el seeder 0002')
  }

  await client.end()
  printInfo('\n\x1b[1;32m✔ Proceso completado.\x1b[0m\n')
}

// Manejo de errores globales
main().catch(error => {
  console.error('\x1b[1;31mError fatal:\x1b[0m', error.message)
  process.exit(1)
})