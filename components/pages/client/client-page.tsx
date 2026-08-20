'use client'

import { CalendarDays, ChevronRight, CircleDollarSign, HeartPulse, PawPrint, Plus, ShoppingBag, Syringe } from 'lucide-react'
import type { SetView } from '@/lib/types'

const pets = [
  { name: 'Luna', detail: 'Golden Retriever · 4 años', next: 'Control anual', tone: 'bg-[#e7f0df]' },
  { name: 'Simón', detail: 'Gato mestizo · 2 años', next: 'Vacuna triple', tone: 'bg-[#e9e6f1]' },
]

const appointments = [
  { date: '19 JUN', time: '10:30 am', title: 'Control general', pet: 'Luna', professional: 'Dra. Valentina Ríos', tone: 'bg-[#e7f1eb]' },
  { date: '27 JUN', time: '3:00 pm', title: 'Peluquería & spa', pet: 'Simón', professional: 'Carlos Méndez', tone: 'bg-[#f3e8e2]' },
]

const expenses = [
  { label: 'Servicios veterinarios', value: '$86.00', detail: '3 atenciones', icon: HeartPulse },
  { label: 'Pet shop', value: '$48.90', detail: '5 compras', icon: ShoppingBag },
]

export default function ClientPage({ setView }: { setView: SetView }) {
  return <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Mi espacio</p><h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173b3b]">Hola, Ana María</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#78918a]">Todo lo importante de tus mascotas, reunido en un solo lugar.</p></div>
      <button onClick={() => setView('citas')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Agendar cita</button>
    </header>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Summary label="Mascotas" value="2" detail="En tu familia" icon={PawPrint} />
      <Summary label="Próxima cita" value="19 Jun" detail="Control de Luna" icon={CalendarDays} />
      <Summary label="Este mes" value="$134.90" detail="En cuidados y compras" icon={CircleDollarSign} />
      <Summary label="Salud al día" value="92%" detail="Sin recordatorios vencidos" icon={Syringe} />
    </section>

    <section className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
      <div><SectionHeading eyebrow="Mi familia" title="Mis mascotas" action={<button onClick={() => setView('pacientes')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Ver fichas <ChevronRight className="size-4" /></button>} /><div className="mt-5 grid gap-4 sm:grid-cols-2">{pets.map((pet) => <article key={pet.name} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]"><div className="flex items-start justify-between"><span className={`flex size-14 items-center justify-center rounded-2xl ${pet.tone} text-[#0d5c5b]`}><PawPrint className="size-6" /></span><button onClick={() => setView('pacientes')} aria-label={`Ver ficha de ${pet.name}`} className="rounded-xl p-2 text-[#8aa096] hover:bg-[#f1f6f2]"><ChevronRight className="size-4" /></button></div><h3 className="mt-5 font-serif text-2xl font-bold text-[#173b3b]">{pet.name}</h3><p className="mt-1 text-sm text-[#78918a]">{pet.detail}</p><div className="mt-5 border-t border-[#e7eee9] pt-4 text-xs"><span className="font-bold uppercase tracking-wide text-[#9aafa7]">Próximo cuidado</span><p className="mt-1 font-semibold text-[#52756c]">{pet.next}</p></div></article>)}</div></div>
      <div><SectionHeading eyebrow="Agenda" title="Próximas citas" action={<button onClick={() => setView('citas')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Ver agenda <ChevronRight className="size-4" /></button>} /><div className="mt-5 flex flex-col gap-3">{appointments.map((appointment) => <article key={`${appointment.date}-${appointment.title}`} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e1ebe6]"><div className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${appointment.tone} py-3 text-center`}><b className="text-xs font-bold text-[#0d5c5b]">{appointment.date}</b><span className="mt-1 text-[10px] font-semibold text-[#78918a]">{appointment.time}</span></div><div className="min-w-0"><h3 className="font-semibold text-[#173b3b]">{appointment.title}</h3><p className="mt-1 text-sm text-[#78918a]">{appointment.pet} · {appointment.professional}</p><span className="mt-3 inline-flex rounded-full bg-[#f1f6f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#648278]">Confirmada</span></div></article>)}</div></div>
    </section>

    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.35fr]">
      <div><SectionHeading eyebrow="Resumen" title="Tus gastos" action={<button onClick={() => setView('reportes')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Ver detalle <ChevronRight className="size-4" /></button>} /><div className="mt-5 flex flex-col gap-3">{expenses.map((expense) => <div key={expense.label} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-[#e1ebe6]"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]"><expense.icon className="size-4" /></span><div><p className="text-sm font-semibold text-[#173b3b]">{expense.label}</p><p className="text-xs text-[#8aa096]">{expense.detail}</p></div></div><b className="text-[#0d5c5b]">{expense.value}</b></div>)}</div></div>
      <div className="rounded-[2rem] bg-[#173b3b] p-7 text-[#eef6ef] md:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b5d8bf]">Recomendación para ti</p><h2 className="mt-4 max-w-md font-serif text-3xl font-bold">La prevención también es una forma de cariño.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#bfd5cb]">Luna tiene pendiente su refuerzo anual. Mantén su historial actualizado y recibe recordatorios antes de cada cuidado.</p><button onClick={() => setView('citas')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e7f1eb] px-4 py-3 text-sm font-bold text-[#0d5c5b]">Agendar refuerzo <ChevronRight className="size-4" /></button></div>
    </section>
  </main>
}

function Summary({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof PawPrint }) { return <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]"><span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]"><Icon className="size-4" /></span><p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#8aa096]">{label}</p><p className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">{value}</p><p className="mt-1 text-xs text-[#78918a]">{detail}</p></article> }
function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">{eyebrow}</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#173b3b]">{title}</h2></div>{action}</div> }
