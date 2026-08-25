import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

/** Paginador reutilizable para tablas con filtros y conteo. */
export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-[#edf2ee] px-2 py-4 sm:flex-row">
      <p className="text-xs text-[#78918a]">
        Mostrando <b className="text-[#173b3b]">{from}–{to}</b> de <b className="text-[#173b3b]">{totalItems}</b> registros
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="flex size-8 items-center justify-center rounded-lg text-[#66817a] hover:bg-[#f3f7f4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((item) => (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`flex size-8 items-center justify-center rounded-lg text-sm font-bold ${page === item ? 'bg-[#0d5c5b] text-white' : 'text-[#66817a] hover:bg-[#f3f7f4]'}`}
          >
            {item}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          className="flex size-8 items-center justify-center rounded-lg text-[#66817a] hover:bg-[#f3f7f4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}