import type { ElementType } from 'react'

export function MetricCard({ icon: Icon, label, value, note }: { icon: ElementType; label: string; value: string; note: string }) {
  return <article className="rounded-2xl bg-white p-5 ring-1 ring-[#e1ebe6]"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#829990]">{label}</span><Icon className="size-4 text-[#d37c52]" /></div><p className="mt-3 font-serif text-2xl font-bold text-[#173b3b]">{value}</p><p className="mt-1 text-xs text-[#7b9b8b]">{note}</p></article>
}
