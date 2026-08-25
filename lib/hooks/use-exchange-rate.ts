'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchExchangeRate } from '@/lib/services/exchange-rate'
import type { ExchangeRate } from '@/lib/types'

interface UseExchangeRateResult {
  rate: number
  source: ExchangeRate['source']
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook que expone la tasa de cambio USD->VES.
 * Fuentes en orden: caché local -> dolarapi -> BD -> fallback.
 * Permite refrescar manualmente cuando cambian los montos.
 */
export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState(0)
  const [source, setSource] = useState<ExchangeRate['source']>('manual')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const exchange = await fetchExchangeRate()
      setRate(exchange.rate)
      setSource(exchange.source)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo obtener la tasa')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { rate, source, loading, error, refresh }
}