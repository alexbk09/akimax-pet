'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Clock3, Filter, Search, Sparkles, Stethoscope, Syringe } from 'lucide-react'
import { useDebounce, useInfiniteScroll } from '@/lib/hooks'
import { getServices } from '@/lib/services/catalog'
import { CatalogGridSkeleton, EmptyState } from '@/components/ui'
import type { Service } from '@/lib/types'

const PAGE_SIZE = 6
const filters = ['Todos', 'Veterinaria', 'Peluquería', 'Preventivo', 'Especializado']

/**
 * Catálogo de servicios con conexión real a Supabase.
 * Scroll infinito con skeleton mientras carga cada página.
 */
export default function ServicesPage({ setView }: { setView: (view: 'citas') => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const loadPage = useCallback(async (targetPage: number, replace: boolean) => {
    if (replace) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    try {
      const result = await getServices({ page: targetPage, pageSize: PAGE_SIZE, search: debouncedSearch, area: filter })
      setServices((current) => replace ? result.data : [...current, ...result.data])
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar servicios')
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, filter])

  useEffect(() => {
    setPage(1)
    setServices([])
    void loadPage(1, true)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    void loadPage(nextPage, false)
  }, [page, loading, loadingMore, hasMore, loadPage])

  const sentinelRef = useInfiniteScroll({ hasMore, loading: loading || loadingMore, onLoadMore: loadMore })

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] bg-[#173b3b] p-8 text-[#eef6ef] md:p-12 lg:flex lg:items-end lg:justify-between lg:p-16">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#e1a175]">Akimax services</p>
          <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">Cuidado que se adapta a su historia.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#bfd5cb]">Explora servicios pensados para cada etapa. Reserva en pocos pasos.</p>
        </div>
        <button onClick={() => setView('citas')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e7f1eb] px-5 py-3 text-sm font-bold text-[#0d5c5b] lg:mt-0">Agendar ahora <ArrowRight className="size-4" /></button>
      </section>

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar consulta, baño, vacuna..." className="w-full rounded-2xl border-0 bg-white py-4 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="size-4 shrink-0 text-[#829990]" />
          {filters.map((item) => <button key={item} onClick={() => { setFilter(item); setPage(1) }} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${filter === item ? 'bg-[#0d5c5b] text-white' : 'bg-white text-[#78918a] ring-1 ring-[#e1ebe6]'}`}>{item}</button>)}
        </div>
      </div>

      {error && services.length === 0 ? (
        <div className="mt-6"><EmptyState title="No pudimos cargar los servicios" description={error} /></div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <article key={item.id} className="group flex min-h-72 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] transition-all hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]"><ServiceIcon icon={item.icon} /></div>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#d37c52]">{item.area}</p>
                      <h2 className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">{item.name}</h2>
                    </div>
                    <span className="rounded-lg bg-[#f4f8f5] px-2 py-1 text-[10px] font-bold text-[#78918a]">{item.category ?? 'Servicio'}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#78918a]">{item.description}</p>
                </div>
                <div className="mt-7 flex items-end justify-between border-t border-[#edf2ee] pt-4">
                  <div>
                    <p className="font-serif text-xl font-bold text-[#0d5c5b]">{item.prices?.[0] ? `$${item.prices[0].price.toFixed(2)}` : 'Consultar'}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#93a9a0]"><Clock3 className="size-3" />{item.duration}</p>
                  </div>
                  <button onClick={() => setView('citas')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Reservar <ArrowRight className="size-4" /></button>
                </div>
              </article>
            ))}
          </div>
          {loading && <div className="mt-6"><CatalogGridSkeleton count={3} /></div>}
          {services.length === 0 && !loading && <EmptyState title="No encontramos ese servicio" description="Prueba otra palabra o explora todas las categorías." />}
          <div ref={sentinelRef} className="h-10" />
          {loadingMore && <p className="py-4 text-center text-sm font-semibold text-[#78918a]">Cargando más servicios...</p>}
        </>
      )}
    </div>
  )
}

function ServiceIcon({ icon }: { icon: string }) {
  if (icon === 'sparkles') return <Sparkles className="size-5" />
  if (icon === 'syringe') return <Syringe className="size-5" />
  return <Stethoscope className="size-5" />
}