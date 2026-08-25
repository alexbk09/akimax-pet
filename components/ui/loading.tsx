import { Loader2 } from 'lucide-react'

/** Skeleton para tarjetas de catálogo (productos/servicios). */
export function CatalogCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-[#e1ebe6]">
      <div className="flex h-44 animate-pulse items-center justify-center rounded-2xl bg-[#eef3ef]" />
      <div className="space-y-3 px-1 pt-4">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#e7ece8]" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded-full bg-[#e7ece8]" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#edf1ee]" />
          </div>
          <div className="size-9 animate-pulse rounded-xl bg-[#e7ece8]" />
        </div>
      </div>
    </div>
  )
}

/** Spinner centrado para cargas de página. */
export function PageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-[#78918a]">
      <Loader2 className="size-8 animate-spin text-[#0d5c5b]" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  )
}

/** Skeleton para filas de tablas. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }, (_, colIndex) => (
            <div key={colIndex} className="h-4 flex-1 animate-pulse rounded-full bg-[#e7ece8]" />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Skeleton para el catálogo completo (grid de tarjetas). */
export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => <CatalogCardSkeleton key={index} />)}
    </div>
  )
}