import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Valores sintácticamente válidos. Cuando faltan las NEXT_PUBLIC_* env vars
// (p. ej. durante el prerender estático de Next.js en el build/SSR), NO
// podemos pasar cadenas vacías a createClient() porque lanza
// "supabaseUrl is required". Las llamadas reales a la BD sólo ocurren en
// el navegador, donde las env vars públicas siempre están inyectadas.
// Si llegara a usarse en servidor sin configurar, la petición fallará con
// un error de red claro en lugar de romper el build.
const FALLBACK_URL = 'https://fallback.supabase.co'
const FALLBACK_KEY = 'public-anon-key-fallback'

const resolvedUrl = supabaseUrl && !supabaseUrl.includes('TU_PROYECTO') ? supabaseUrl : FALLBACK_URL
const resolvedKey = supabaseAnonKey && !supabaseAnonKey.includes('TU_PROYECTO') ? supabaseAnonKey : FALLBACK_KEY

/**
 * Cliente singleton de Supabase.
 * Todas las llamadas a la BD deben pasar por services (regla del proyecto).
 * No lanza durante el prerender estático; avisa por consola si faltan credenciales.
 */
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('TU_PROYECTO')) {
    console.warn(
      '[supabase] Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local',
    )
  }
  return createClient(resolvedUrl, resolvedKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export const supabase: SupabaseClient = createSupabaseClient()
