'use client'

import { CalendarDays, Filter, Search } from 'lucide-react'

export type ReportFilters = { period: string; area: string; professional: string; search: string }

type Props = { value: ReportFilters; onChange: (value: ReportFilters) => void }

export function ReportFilters({ value, onChange }: Props) {
  const update = (key: keyof ReportFilters, next: string) => onChange({ ...value, [key]: next })
  return <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e1ebe6]">
    <div className="flex flex-wrap items-center gap-3"><Filter className="size-4 text-[#0d5c5b]" /><b className="text-sm text-[#173b3b]">Filtros del reporte</b><span className="text-xs text-[#89a198]">Actualización en tiempo real</span></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" /><input value={value.search} onChange={(e) => update('search', e.target.value)} placeholder="Buscar cliente o servicio" className="w-full rounded-xl bg-[#f5f8f5] py-3 pl-9 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-[#9cc2af]" /></label>
      <label className="relative"><CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" /><select value={value.period} onChange={(e) => update('period', e.target.value)} className="w-full appearance-none rounded-xl bg-[#f5f8f5] py-3 pl-9 pr-3 text-sm outline-none"><option value="30">Últimos 30 días</option><option value="7">Últimos 7 días</option><option value="90">Últimos 90 días</option><option value="365">Este año</option></select></label>
      <select value={value.area} onChange={(e) => update('area', e.target.value)} className="rounded-xl bg-[#f5f8f5] px-3 py-3 text-sm outline-none"><option value="Todas">Todas las áreas</option><option>Veterinaria</option><option>Peluquería</option><option>Pet shop</option></select>
      <select value={value.professional} onChange={(e) => update('professional', e.target.value)} className="rounded-xl bg-[#f5f8f5] px-3 py-3 text-sm outline-none"><option value="Todos">Todos los profesionales</option><option>Dr. Carlos Méndez</option><option>Dra. Sofía Rivas</option><option>Mariana López</option></select>
    </div>
  </section>
}
