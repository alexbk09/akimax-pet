# akimax pet — Clínica veterinaria & pet shop

Sistema completo con Next.js 16 + React 19 + Supabase + Tailwind 4, arquitectura escalable con **services** como única capa de acceso a datos.

## Arquitectura

```
app/                      → Página principal (AppShell)
components/
  pages/                  → Módulos (admin, caja, clientes, operaciones, pacientes, reportes, servicios, tienda)
  layout/                 → Shell y navegación con permisos
  cart/                   → Carrito global con persistencia
  cards/ tables/ ui/      → Componentes atómicos (skeleton, paginator, role-guard, estados)
lib/
  types.ts                → Tipos del dominio organizados por módulo
  services/               → ÚNICA capa de acceso a BD (nunca supabase.from() en componentes)
    auth.ts               → Autenticación, roles y usuarios
    catalog.ts            → Productos y servicios con paginación
    customers.ts          → Clientes, mascotas e historias clínicas
    appointments.ts       → Citas
    sales.ts              → Ventas, caja e inventario
    reports.ts            → KPIs y reportes
    exchange-rate.ts      → Tasa de cambio (dolarapi)
  hooks/                  → useAuth, useCart, useExchangeRate, useInfiniteScroll, usePagination
  supabase/client.ts      → Singleton de Supabase
supabase/
  migrations/             → 0001-0006 esquema completo + RLS + triggers
  seed.sql                → Roles y permisos
  seed-catalog.sql        → Categorías, productos, servicios
  seed-data.sql           → Clientes, mascotas, citas, ventas demo
```

## Configuración inicial

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia `.env.local.example` a `.env.local` y completa:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
   ```
3. Ejecuta las migraciones en orden (`0001` → `0006`) en el SQL Editor
4. Ejecuta los seeders (`seed.sql`, `seed-catalog.sql`, `seed-data.sql`)

## Reglas de oro

- **No direct calls**: Prohibido `supabase.from()` en componentes. Todo pasa por `lib/services/`
- **Componentización**: UI independiente de la lógica de Supabase (diseño atómico)
- **Permisos**: `RoleGuard` protege cada módulo y `MainNav` oculta enlaces sin permiso
- **Loading**: Cada tabla/lista usa skeleton; catálogos usan scroll infinito
- **Tasa de cambio**: `useExchangeRate` consulta [dolarapi](https://dolarapi.com) con caché de 30 min y fallback a BD/localStorage

## Roles del sistema

| Rol | Accesos |
|-----|---------|
| Administrador | Todos los módulos + gestión de usuarios/roles |
| Veterinario | Agenda, pacientes, historias clínicas, reportes |
| Caja | Ventas, facturación, clientes, catálogo |
| Cliente | Panel personal, citas, mascotas |

## Scripts

```bash
pnpm dev        # Desarrollo
pnpm build      # Producción
pnpm start      # Servir producción