import { supabase } from '@/lib/supabase/client'
import type { ExchangeRate } from '@/lib/types'
import { RATE_FALLBACK } from '@/lib/types'

const DOLARAPI_URL = 'https://api.dolarapi.com/v1/dolares/oficial'
const CACHE_KEY = 'akimax:exchange-rate'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutos

interface DolarApiResponse {
  fecha: string
  promedio?: number
  rate?: number
  [key: string]: unknown
}

function isRateFresh(cached: { rate: number; fetchedAt: number }): boolean {
  return Date.now() - cached.fetchedAt < CACHE_TTL_MS
}

/** Obtiene la última tasa registrada en BD como fallback. */
async function getLatestFromDatabase(): Promise<number | null> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return Number(data.rate)
}

/**
 * Consulta la tasa de cambio oficial de USD a VES.
 * Prioridad: caché local -> dolarapi -> BD -> fallback.
 * Devuelve la tasa y su fuente para trazabilidad.
 */
export async function fetchExchangeRate(): Promise<ExchangeRate> {
  // 1. Caché local en localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw) as { rate: number; fetchedAt: number }
        if (isRateFresh(cached)) {
          return { id: 0, currency: 'USD', rate: cached.rate, source: 'dolarapi', fetched_at: new Date(cached.fetchedAt).toISOString() }
        }
      }
    } catch {
      // localStorage no disponible: continúa
    }
  }

  // 2. dolarapi
  try {
    const response = await fetch(DOLARAPI_URL, { cache: 'no-store' })
    if (response.ok) {
      const data = (await response.json()) as DolarApiResponse
      const rate = Number(data.promedio ?? data.rate ?? 0)
      if (rate > 0) {
        void persistRate(rate)
        return { id: 0, currency: 'USD', rate, source: 'dolarapi', fetched_at: new Date().toISOString() }
      }
    }
  } catch {
    // API no disponible: continúa con siguientes fuentes
  }

  // 3. BD (última tasa persistida)
  const dbRate = await getLatestFromDatabase()
  if (dbRate) {
    return { id: 0, currency: 'USD', rate: dbRate, source: 'manual', fetched_at: new Date().toISOString() }
  }

  // 4. Fallback constante
  return { id: 0, currency: 'USD', rate: RATE_FALLBACK, source: 'manual', fetched_at: new Date().toISOString() }
}

/** Guarda la tasa en BD y en caché local. */
async function persistRate(rate: number): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, fetchedAt: Date.now() }))
    } catch {
      // Ignorar errores de localStorage
    }
  }
  try {
    await supabase.from('exchange_rates').insert({ currency: 'USD', rate, source: 'dolarapi' })
  } catch {
    // Si falla la persistencia en BD, la tasa ya fue devuelta
  }
}