'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
 *
 * El primer refresco muestra el loader; los refrescos posteriores
 * (p. ej. al volver a la pestaña) son silenciosos: la UI sigue usando
 * la tasa ya cargada y la nueva llega en segundo plano sin "cargando".
 */
export function useExchangeRate(): UseExchangeRateResult {
  const [rate, setRate] = useState(0)
  const [source, setSource] = useState<ExchangeRate['source']>('manual')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Indica si ya hay una tasa visible: evita mostrar el loader en refrescos.
  const hasRateRef = useRef(false)

  const refresh = useCallback(async () => {
    // Solo la primera carga (sin tasa previa) muestra el loader.
    if (!hasRateRef.current) setLoading(true)
    setError(null)
    try {
      const exchange = await fetchExchangeRate()
      hasRateRef.current = true
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