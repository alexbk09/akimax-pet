'use client'

import { Download, FileBarChart, MoreHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'
import { ReportFilters, type ReportFilters as Filters } from './report-filters'
import { ReportKpis } from './report-kpis'

const rows = [
  { date: '18 Jun 2024', type: 'Consulta general', area: 'Veterinaria', professional: 'Dr. Carlos Méndez', customer: 'Ana María Torres', amount: 25, status: 'Pagada' },
  { date: '18 Jun 2024', type: 'Peluquería & spa', area: 'Peluquería', professional: 'Mariana López', customer: 'Luis Ramírez', amount: 18, status: 'Pagada' },
  { date: '17 Jun 2024', type: 'Alimento VitalCan Adulto', area: 'Pet shop', professional: 'Caja', customer: 'Carolina Silva', amount: 24.9, status: 'Pagada' },
  { date: '17 Jun 2024', type: 'Vacuna antirrábica', area: 'Veterinaria', professional: 'Dra. Sofía Rivas', customer: 'Pedro González', amount: 22, status: 'Pendiente' },
]

const reportTypes = ['Resumen de ventas', 'Rendimiento por profesional', 'Servicios y citas', 'Inventario y productos', 'Clientes y pacientes', 'Caja y métodos de pago']

export default function ReportsPage() {
  const [filters, setFilters] = useState<Filters>({ period: '30', area: 'Todas', professional: 'Todos', search: '' })
  const [report, setReport] = useState(reportTypes[0])
  const visibleRows = useMemo(() => rows.filter((row) => (filters.area === 'Todas' || row.area === filters.area) && (filters.professional === 'Todos' || row.professional === filters.professional) && (!filters.search || `${row.customer} ${row.type}`.toLowerCase().includes(filters.search.toLowerCase()))), [filters])
  const exportReport = () => window.alert(`Reporte exportado: ${report}`)
  return <PageContainer><PageHeader eyebrow="Control y decisiones" title="Reportes" description="Convierte la operación diaria en información clara para crecer con intención." action={<button onClick={exportReport} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white"><Download className="size-4" /> Exportar</button>} />
    <div className="mt-8 flex gap-2 overflow-x-auto pb-1">{reportTypes.map((item) => <button key={item} onClick={() => setReport(item)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${report === item ? 'bg-[#0d5c5b] text-white' : 'bg-white text-[#66817a] ring-1 ring-[#e1ebe6]'}`}>{item}</button>)}</div>
    <div className="mt-6"><ReportFilters value={filters} onChange={setFilters} /></div>
    <div className="mt-6"><ReportKpis /></div>
    <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <article className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d37c52]">{report}</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#173b3b]">Actividad del periodo</h2></div><FileBarChart className="size-5 text-[#0d5c5b]" /></div><div className="mt-6 flex h-44 items-end gap-3 border-b border-[#e5eee9] px-2">{[42, 65, 48, 78, 58, 88, 72, 94, 62, 76, 84, 68].map((height, index) => <div key={index} className="group flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-lg bg-[#b9d9ca] transition-colors group-hover:bg-[#0d5c5b]" style={{ height: `${height}%` }} /><span className="text-[10px] text-[#9aafa7]">{index + 1}</span></div>)}</div></article>
      <article className="rounded-3xl bg-[#173b3b] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#b5d8bf]">Distribución</p><h2 className="mt-2 font-serif text-2xl font-bold">Áreas con mayor movimiento</h2><div className="mt-7 flex flex-col gap-5">{[['Veterinaria', '52%', 'bg-[#b5d8bf]'], ['Peluquería', '28%', 'bg-[#e1a175]'], ['Pet shop', '20%', 'bg-[#e7dfb5]']].map(([label, value, tone]) => <div key={label}><div className="flex justify-between text-sm"><span>{label}</span><b>{value}</b></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className={`h-2 rounded-full ${tone}`} style={{ width: value }} /></div></div>)}</div></article>
    </section>
    <section className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-[#e1ebe6]"><div className="flex items-center justify-between border-b border-[#e8efeb] px-6 py-5"><div><h2 className="font-serif text-2xl font-bold text-[#173b3b]">Detalle de operaciones</h2><p className="mt-1 text-sm text-[#78918a]">{visibleRows.length} registros encontrados</p></div><button className="rounded-xl p-2 text-[#78918a] hover:bg-[#f3f7f4]" aria-label="Más opciones"><MoreHorizontal className="size-5" /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f6f9f6] text-xs uppercase tracking-wide text-[#89a198]"><tr>{['Fecha', 'Concepto', 'Área', 'Profesional', 'Cliente', 'Monto', 'Estado'].map((head) => <th key={head} className="px-6 py-3 font-bold">{head}</th>)}</tr></thead><tbody className="divide-y divide-[#edf2ee]">{visibleRows.map((row) => <tr key={`${row.date}-${row.type}`} className="text-[#52756c]"><td className="px-6 py-4 whitespace-nowrap">{row.date}</td><td className="px-6 py-4 font-semibold text-[#173b3b]">{row.type}</td><td className="px-6 py-4">{row.area}</td><td className="px-6 py-4">{row.professional}</td><td className="px-6 py-4">{row.customer}</td><td className="px-6 py-4 font-bold text-[#0d5c5b]">${row.amount.toFixed(2)}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.status === 'Pagada' ? 'bg-[#e4f1e6] text-[#4d8663]' : 'bg-[#fff0df] text-[#a66538]'}`}>{row.status}</span></td></tr>)}</tbody></table></div></section>
  </PageContainer>
}
