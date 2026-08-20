import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173b3b]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#78918a]">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">{children}</div>
}
