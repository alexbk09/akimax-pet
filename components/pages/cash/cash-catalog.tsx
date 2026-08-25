'use client'

import * as React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useDebounce, useAsync } from '@/lib/hooks'
import { getProducts, getServices } from '@/lib/services/catalog'
import { CatalogGridSkeleton } from '@/components/ui'
import type { Product, Service } from '@/lib/types'

type CatalogItem = { id: string; name: string; category: string; price: number; stock?: number; kind: 'Producto' | 'Servicio' }

/**
 * Catálogo de caja con conexión real a Supabase.
 * Muestra productos y servicios con skeleton mientras carga.
 */
export function CashCatalog({ onAdd }: { onAdd: (item: CatalogItem) => void }) {
  const [query, setQuery] = React.useState('')
  const [kind, setKind] = React.useState<'Todos' | 'Producto' | 'Servicio'>('Todos')
  const debouncedQuery = useDebounce(query, 300)

  const { data, loading, error } = useAsync(async () => {
    const [products, services] = await Promise.all([
      getProducts({ search: debouncedQuery, status: 'Activo', pageSize: 30 }),
      getServices({ search: debouncedQuery, status: 'Activo', pageSize: 30 }),
    ])
    const productItems: CatalogItem[] = (products.data as Product[]).map((item) => ({ id: `p-${item.id}`, name: item.name, category: item.category ?? 'Productos', price: item.price, stock: item.stock, kind: 'Producto' as const }))
    const serviceItems: CatalogItem[] = (services.data as Service[]).map((item) => ({ id: `s-${item.id}`, name: item.name, category: item.area, price: item.prices?.[0]?.price ?? 25, kind: 'Servicio' as const }))
    return [...productItems, ...serviceItems]
  }, [debouncedQuery, kind])

  const filtered = (data ?? []).filter((item) => kind === 'Todos' || item.kind === kind)

  return (
    <div className="rounded-[2rem] bg-white p-6 ring-1 ring-[#e1ebe6]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Catálogo</p>
          <h2 className="font-serif text-2xl font-bold text-[#173b3b]">Agregar a la venta</h2>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 rounded-xl bg-[#f3f7f3] px-3 py-2">
            <Search className="size-4 text-[#78918a]" />
            <input aria-label="Buscar productos o servicios" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="w-32 bg-transparent text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-[#f3f7f3] px-3 py-2">
            <SlidersHorizontal className="size-4 text-[#78918a]" />
            <select aria-label="Filtrar catálogo" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="bg-transparent text-sm font-semibold outline-none">
              <option>Todos</option>
              <option>Producto</option>
              <option>Servicio</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="mt-5"><CatalogGridSkeleton count={4} /></div>
      ) : error ? (
        <p className="mt-5 rounded-2xl bg-[#fbede7] p-4 text-sm text-[#b56a51]">No se pudo cargar el catálogo: {error}</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => onAdd(item)} className="flex items-center justify-between rounded-2xl bg-[#f7faf7] p-4 text-left transition hover:bg-[#e8f3ef]">
              <span>
                <b className="block text-sm text-[#173b3b]">{item.name}</b>
                <small className="text-xs text-[#78918a]">{item.kind} · {item.category}{item.stock !== undefined ? ` · ${item.stock} disponibles` : ''}</small>
              </span>
              <strong className="text-sm text-[#0d5c5b]">${item.price.toFixed(2)}</strong>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-[#78918a]">No encontramos coincidencias.</p>}
        </div>
      )}
    </div>
  )
}

export type { CatalogItem }