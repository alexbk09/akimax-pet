'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Hook de búsqueda con debounce para inputs de filtrado. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}

interface UsePaginationResult {
  page: number
  totalPages: number
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  reset: () => void
}

/** Hook de paginación para tablas y listas paginadas. */
export function usePagination(totalItems: number, pageSize = 10): UsePaginationResult {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const nextPage = useCallback(() => setPage((current) => Math.min(current + 1, totalPages)), [totalPages])
  const prevPage = useCallback(() => setPage((current) => Math.max(current - 1, 1)), [])
  const goToPage = useCallback((target: number) => setPage(Math.min(Math.max(target, 1), totalPages)), [totalPages])
  const reset = useCallback(() => setPage(1), [])

  return useMemo(() => ({ page, totalPages, nextPage, prevPage, goToPage, reset }), [page, totalPages, nextPage, prevPage, goToPage, reset])
}

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
}

/** Hook de scroll infinito con IntersectionObserver para catálogos. */
export function useInfiniteScroll({ hasMore, loading, onLoadMore, threshold = 400 }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(onLoadMore)

  useEffect(() => {
    callbackRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldLoad = entries[0]?.isIntersecting === true && hasMore && !loading
        if (shouldLoad) callbackRef.current()
      },
      { rootMargin: `${threshold}px` },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, threshold])

  return sentinelRef
}

interface UseAsyncResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/** Hook genérico para cargar datos desde un service con estado de carga y error. */
export function useAsync<T>(fetcher: () => Promise<T>, dependencies: unknown[] = []): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  // Identificador de petición: se incrementa en cada carga y al desmontar.
  // Permite ignorar respuestas obsoletas y evitar setState tras desmontar.
  const requestIdRef = useRef(0)

  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      // Petición reemplazada o componente desmontado: descartar resultado.
      if (requestId !== requestIdRef.current) return
      setData(result)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err instanceof Error ? err.message : 'Error al cargar los datos')
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies])

  useEffect(() => {
    void load()
    // Al desmontar (cambio de vista, navegación, recarga) se invalida
    // cualquier petición pendiente: ninguna promesa hará setState.
    return () => {
      requestIdRef.current += 1
    }
  }, [load])

  return { data, loading, error, reload: load }
}
