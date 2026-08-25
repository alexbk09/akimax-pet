import { AlertTriangle, Inbox } from 'lucide-react'

/** Estado vacío reutilizable para listas y tablas. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white p-12 text-center ring-1 ring-[#e1ebe6]">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eef3ef] text-[#8aa096]">
        <Inbox className="size-6" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-bold text-[#173b3b]">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-[#78918a]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/** Estado de error reutilizable con reintento. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white p-12 text-center ring-1 ring-[#e1ebe6]">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#fbede7] text-[#b56a51]">
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="mt-4 font-serif text-xl font-bold text-[#173b3b]">Algo salió mal</h3>
      <p className="mt-2 max-w-sm text-sm text-[#78918a]">{message ?? 'No pudimos cargar la información. Intenta de nuevo.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-6 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">
          Reintentar
        </button>
      )}
    </div>
  )
}