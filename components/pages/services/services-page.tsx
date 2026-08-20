'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Clock3, Filter, Search, Sparkles, Stethoscope, Syringe } from 'lucide-react'

const catalog = [
  { id: 1, name: 'Consulta general', detail: 'Evaluación preventiva, diagnóstico y plan de cuidado.', area: 'Veterinaria', category: 'Preventivo', duration: '30 min', price: '$25', tone: 'bg-[#e7f1eb]', icon: Stethoscope },
  { id: 2, name: 'Peluquería esencial', detail: 'Baño, secado, cepillado y perfume hipoalergénico.', area: 'Peluquería', category: 'Cuidado', duration: '60 min', price: 'Desde $18', tone: 'bg-[#f2ede5]', icon: Sparkles },
  { id: 3, name: 'Vacunación preventiva', detail: 'Esquema guiado según edad, especie y estilo de vida.', area: 'Veterinaria', category: 'Preventivo', duration: '20 min', price: '$22', tone: 'bg-[#e6eef2]', icon: Syringe },
  { id: 4, name: 'Peluquería premium', detail: 'Corte personalizado, spa de almohadillas y nutrición del manto.', area: 'Peluquería', category: 'Cuidado', duration: '90 min', price: 'Desde $32', tone: 'bg-[#f3e8e2]', icon: Sparkles },
  { id: 5, name: 'Cirugía especializada', detail: 'Procedimientos con evaluación preoperatoria y seguimiento.', area: 'Veterinaria', category: 'Especializado', duration: 'Según procedimiento', price: 'Desde $120', tone: 'bg-[#e8e9f0]', icon: Syringe },
  { id: 6, name: 'Odontología preventiva', detail: 'Revisión dental, limpieza y recomendaciones para casa.', area: 'Veterinaria', category: 'Preventivo', duration: '45 min', price: 'Desde $40', tone: 'bg-[#e5f0eb]', icon: Stethoscope },
  { id: 7, name: 'Baño medicado', detail: 'Tratamiento dermoprotector para piel sensible y alergias.', area: 'Peluquería', category: 'Especializado', duration: '60 min', price: 'Desde $26', tone: 'bg-[#eaf0ed]', icon: Sparkles },
  { id: 8, name: 'Perfil senior', detail: 'Chequeo integral para acompañar mejor cada nueva etapa.', area: 'Veterinaria', category: 'Especializado', duration: '60 min', price: '$55', tone: 'bg-[#f0ece5]', icon: Stethoscope },
]

export default function ServicesPage({ setView }: { setView: (view: 'citas') => void }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [visible, setVisible] = useState(6)
  const filters = ['Todos', 'Veterinaria', 'Peluquería', 'Preventivo', 'Especializado']
  const results = useMemo(() => catalog.filter((item) => {
    const matchesSearch = `${item.name} ${item.detail}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Todos' || item.area === filter || item.category === filter
    return matchesSearch && matchesFilter
  }), [search, filter])

  return <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-14">
    <section className="rounded-[2rem] bg-[#173b3b] p-8 text-[#eef6ef] md:p-12 lg:flex lg:items-end lg:justify-between lg:p-16">
      <div className="max-w-2xl"><p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#e1a175]">Akimax services</p><h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">Cuidado que se adapta a su historia.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#bfd5cb]">Explora servicios pensados para cada etapa, tamaño y personalidad. Reserva en pocos pasos y deja que nosotros cuidemos el resto.</p></div><button onClick={() => setView('citas')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e7f1eb] px-5 py-3 text-sm font-bold text-[#0d5c5b] lg:mt-0">Agendar ahora <ArrowRight className="size-4" /></button>
    </section>
    <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="relative max-w-xl flex-1"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisible(6) }} placeholder="Buscar consulta, baño, vacuna..." className="w-full rounded-2xl border-0 bg-white py-4 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" /></div><div className="flex items-center gap-2 overflow-x-auto"><Filter className="size-4 shrink-0 text-[#829990]" />{filters.map((item) => <button key={item} onClick={() => { setFilter(item); setVisible(6) }} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${filter === item ? 'bg-[#0d5c5b] text-white' : 'bg-white text-[#78918a] ring-1 ring-[#e1ebe6]'}`}>{item}</button>)}</div></div>
    <div className="mt-8 flex items-center justify-between"><p className="text-sm text-[#78918a]"><b className="text-[#173b3b]">{Math.min(visible, results.length)}</b> de {results.length} servicios</p><span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a0b4ac]">Precios desde</span></div>
    {results.length === 0 ? <div className="mt-6 rounded-3xl bg-white p-14 text-center ring-1 ring-[#e1ebe6]"><Search className="mx-auto size-8 text-[#9eb5aa]" /><h2 className="mt-4 font-serif text-2xl font-bold text-[#173b3b]">No encontramos ese servicio</h2><p className="mt-2 text-sm text-[#78918a]">Prueba otra palabra o explora todas las categorías.</p></div> : <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{results.slice(0, visible).map((item) => <article key={item.id} className="group flex min-h-72 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] transition-all hover:-translate-y-1 hover:shadow-lg"><div><div className={`flex size-12 items-center justify-center rounded-2xl ${item.tone} text-[#0d5c5b]`}><item.icon className="size-5" /></div><div className="mt-5 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#d37c52]">{item.area}</p><h2 className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">{item.name}</h2></div><span className="rounded-lg bg-[#f4f8f5] px-2 py-1 text-[10px] font-bold text-[#78918a]">{item.category}</span></div><p className="mt-3 text-sm leading-6 text-[#78918a]">{item.detail}</p></div><div className="mt-7 flex items-end justify-between border-t border-[#edf2ee] pt-4"><div><p className="font-serif text-xl font-bold text-[#0d5c5b]">{item.price}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#93a9a0]"><Clock3 className="size-3" />{item.duration}</p></div><button onClick={() => setView('citas')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Reservar <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div></article>)}</div>}
    {visible < results.length && <div className="mt-10 flex justify-center"><button onClick={() => setVisible((current) => current + 3)} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0d5c5b] ring-1 ring-[#cfe0d6] hover:bg-[#e7f1eb]">Cargar más servicios</button></div>}
  </div>
}
