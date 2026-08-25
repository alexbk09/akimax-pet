'use client'

import { ArrowRight, Filter, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ProductCard } from '@/components/cards/product-card'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'
import { CatalogGridSkeleton, EmptyState } from '@/components/ui'
import { fallbackProducts } from '@/lib/mock-data'
import { useDebounce, useInfiniteScroll } from '@/lib/hooks'
import { getProducts } from '@/lib/services/catalog'
import type { Product, SetView } from '@/lib/types'

const PAGE_SIZE = 6
const categories = ['Todos', 'Alimentos', 'Accesorios', 'Cuidado']

/**
 * Tienda con catálogo real desde Supabase.
 * Scroll infinito con skeleton mientras carga cada página.
 * Si Supabase no está configurado, usa datos de respaldo.
 */
export default function ShopPage({ setView }: { setView: SetView }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [products, setProducts] = useState<Product[]>([])
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
      const result = await getProducts({ page: targetPage, pageSize: PAGE_SIZE, search: debouncedSearch, category })
      const rows = result.data.length > 0 ? result.data : fallbackProducts.slice((targetPage - 1) * PAGE_SIZE, targetPage * PAGE_SIZE)
      setProducts((current) => replace ? rows : [...current, ...rows])
      setHasMore(result.hasMore || rows.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
      setProducts(fallbackProducts)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [debouncedSearch, category])

  // Cargar página inicial al cambiar filtros
  useEffect(() => {
    setPage(1)
    setProducts([])
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
    <PageContainer>
      <PageHeader
        eyebrow="Akimax pet shop"
        title="Todo lo que mueve sus patitas"
        description="Productos seleccionados para una vida más sana, cómoda y feliz."
        action={<button onClick={() => setView('servicios')} className="flex items-center gap-2 text-sm font-bold text-[#0d5c5b]">Ver servicios <ArrowRight className="size-4" /></button>}
      />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <ShopFilters category={category} setCategory={setCategory} />
        <div className="min-w-0 flex-1">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="w-full rounded-2xl border-0 bg-white py-4 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]"
            />
          </div>

          {error && products.length === 0 ? (
            <EmptyState title="No pudimos cargar la tienda" description={error} />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => setView('caja')} />
                ))}
              </div>
              {loading && <div className="mt-6"><CatalogGridSkeleton count={3} /></div>}
              {products.length === 0 && !loading && (
                <EmptyState title="No encontramos productos" description="Prueba con otra búsqueda o categoría." />
              )}
              <div ref={sentinelRef} className="h-10" />
              {loadingMore && <p className="py-4 text-center text-sm font-semibold text-[#78918a]">Cargando más productos...</p>}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function ShopFilters({ category, setCategory }: { category: string; setCategory: (value: string) => void }) {
  return (
    <aside className="h-fit shrink-0 rounded-3xl bg-white p-5 ring-1 ring-[#e1ebe6] lg:w-60">
      <div className="flex items-center justify-between">
        <b className="text-[#173b3b]">Filtrar por</b>
        <Filter className="size-4 text-[#829990]" />
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto lg:flex-col">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm ${category === item ? 'bg-[#e7f1eb] font-bold text-[#0d5c5b]' : 'text-[#78918a] hover:bg-[#f4f8f5]'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-8 hidden border-t border-[#e7eee9] pt-5 text-sm text-[#66817a] lg:block">
        <p className="text-xs font-bold uppercase tracking-wide text-[#829990]">Stock disponible</p>
        <p className="mt-4">En existencia</p>
        <p className="mt-3">Últimas unidades</p>
      </div>
    </aside>
  )
}