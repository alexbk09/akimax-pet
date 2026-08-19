'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Scissors, Stethoscope } from 'lucide-react'

type Area = 'Peluquería' | 'Veterinaria'
type CalendarView = 'Día' | 'Semana' | 'Mes'
type Appointment = { area: Area; professional: string; date: string; time: string; service: string; pet: string; status: string }

const appointments: Appointment[] = [
  { area: 'Peluquería', professional: 'Valentina Rojas', date: '2026-06-19', time: '09:00', service: 'Baño y corte', pet: 'Luna', status: 'Confirmada' },
  { area: 'Peluquería', professional: 'Carlos Méndez', date: '2026-06-19', time: '10:30', service: 'Spa completo', pet: 'Bruno', status: 'En espera' },
  { area: 'Peluquería', professional: 'Valentina Rojas', date: '2026-06-20', time: '11:00', service: 'Corte de uñas', pet: 'Milo', status: 'Confirmada' },
  { area: 'Veterinaria', professional: 'Dra. Camila Suárez', date: '2026-06-19', time: '09:30', service: 'Consulta general', pet: 'Simón', status: 'Confirmada' },
  { area: 'Veterinaria', professional: 'Dr. Andrés León', date: '2026-06-19', time: '12:00', service: 'Vacunación', pet: 'Toby', status: 'Confirmada' },
  { area: 'Veterinaria', professional: 'Dra. Camila Suárez', date: '2026-06-21', time: '15:00', service: 'Control preventivo', pet: 'Nala', status: 'En espera' },
]

const professionals: Record<Area, string[]> = { Peluquería: ['Todos', 'Valentina Rojas', 'Carlos Méndez'], Veterinaria: ['Todos', 'Dra. Camila Suárez', 'Dr. Andrés León'] }
const weekDays = ['Lun 15', 'Mar 16', 'Mié 17', 'Jue 18', 'Vie 19', 'Sáb 20', 'Dom 21']
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export default function OperationsCalendar() {
  const [area, setArea] = useState<Area>('Veterinaria')
  const [professional, setProfessional] = useState('Todos')
  const [view, setView] = useState<CalendarView>('Semana')
  const visible = useMemo(() => appointments.filter((item) => item.area === area && (professional === 'Todos' || item.professional === professional)), [area, professional])
  const tone = area === 'Veterinaria' ? 'bg-[#e4eff2] text-[#12616a]' : 'bg-[#f5e8dc] text-[#a05b3e]'

  function selectArea(next: Area) { setArea(next); setProfessional('Todos') }
  function appointmentAt(hour: string, dayIndex: number) { return visible.find((item) => item.time === hour && item.date.endsWith(String(15 + dayIndex).padStart(2, '0'))) }

  return (
    <section className="mt-12 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Agenda operativa</p><h2 className="font-serif text-3xl font-bold tracking-tight text-[#173b3b]">La clínica, en tiempo real</h2><p className="mt-2 text-sm leading-6 text-[#78918a]">Consulta disponibilidad, profesionales y horas ocupadas desde un mismo calendario.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => selectArea('Veterinaria')} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${area === 'Veterinaria' ? 'bg-[#0d5c5b] text-white' : 'bg-[#f3f7f4] text-[#66817a]'}`}><Stethoscope className="size-4" /> Veterinaria</button><button onClick={() => selectArea('Peluquería')} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${area === 'Peluquería' ? 'bg-[#0d5c5b] text-white' : 'bg-[#f3f7f4] text-[#66817a]'}`}><Scissors className="size-4" /> Peluquería</button></div>
      </div>
      <div className="mt-7 flex flex-col gap-3 border-y border-[#edf2ee] py-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2"><button aria-label="Semana anterior" className="rounded-lg p-2 text-[#66817a] hover:bg-[#f3f7f4]"><ChevronLeft className="size-4" /></button><span className="min-w-32 text-center text-sm font-bold text-[#173b3b]">15 — 21 Jun, 2026</span><button aria-label="Semana siguiente" className="rounded-lg p-2 text-[#66817a] hover:bg-[#f3f7f4]"><ChevronRight className="size-4" /></button></div><div className="flex flex-wrap items-center gap-2"><select aria-label="Filtrar profesional" value={professional} onChange={(event) => setProfessional(event.target.value)} className="rounded-xl border-0 bg-[#f3f7f4] px-3 py-2 text-sm font-semibold text-[#426b63] outline-none">{professionals[area].map((person) => <option key={person} value={person}>{person === 'Todos' ? 'Todos los profesionales' : person}</option>)}</select><div className="flex rounded-xl bg-[#f3f7f4] p-1">{(['Día', 'Semana', 'Mes'] as CalendarView[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === item ? 'bg-white text-[#0d5c5b] shadow-sm' : 'text-[#78918a]'}`}>{item}</button>)}</div></div></div>
      {view === 'Mes' ? <MonthView visible={visible} /> : <ScheduleGrid view={view} area={area} visible={visible} tone={tone} />}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-[#78918a]"><span className="font-bold text-[#173b3b]">{visible.length} citas visibles</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#79a88e]" /> Confirmada</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#d37c52]" /> En espera</span></div>
    </section>
  )
}

function ScheduleGrid({ view, area, visible, tone }: { view: CalendarView; area: Area; visible: Appointment[]; tone: string }) {
  const columns = view === 'Semana' ? weekDays : ['Vie 19']
  return <div className="mt-6 overflow-x-auto"><div className="min-w-[700px]">{view === 'Semana' && <div className="grid grid-cols-8 gap-px rounded-t-xl bg-[#edf2ee] text-center text-xs font-bold text-[#78918a]"><div className="bg-white p-3 text-left">Hora</div>{weekDays.map((day) => <div key={day} className={`bg-white p-3 ${day === 'Vie 19' ? 'text-[#0d5c5b]' : ''}`}>{day}</div>)}</div>}{view === 'Día' && <div className="rounded-t-xl bg-[#e7f1eb] p-4 text-sm font-bold text-[#0d5c5b]">Viernes 19 de junio · {area}</div>}<div className="divide-y divide-[#edf2ee] rounded-b-xl border border-t-0 border-[#edf2ee]">{hours.map((hour) => <div key={hour} className="grid min-h-16 grid-cols-8"><div className="border-r border-[#edf2ee] p-3 text-xs font-semibold text-[#9aafa7]">{hour}</div>{columns.map((_, index) => { const item = visible.find((entry) => entry.time === hour && entry.date.endsWith(String(15 + (view === 'Semana' ? index : 4)).padStart(2, '0'))); return <div key={`${hour}-${index}`} className="relative border-r border-[#edf2ee] p-1">{item && <div className={`min-h-14 rounded-lg p-2 text-[10px] font-semibold ${tone}`}><b className="block truncate">{item.service}</b><span className="block truncate">{item.pet} · {item.professional}</span><span className="mt-1 flex items-center gap-1 opacity-70"><Clock3 className="size-3" />{item.status}</span></div>}</div> })}</div>)}</div></div></div>
}

function MonthView({ visible }: { visible: Appointment[] }) {
  return <div className="mt-6 grid grid-cols-7 gap-2">{Array.from({ length: 35 }, (_, index) => { const day = index - 1; const count = visible.filter((item) => Number(item.date.slice(-2)) === day).length; return <div key={index} className={`min-h-20 rounded-xl border p-2 ${day === 19 ? 'border-[#0d5c5b] bg-[#e7f1eb]' : 'border-[#edf2ee]'}`}><span className="text-xs font-bold text-[#78918a]">{day > 0 && day <= 30 ? day : ''}</span>{count > 0 && <span className="mt-4 flex items-center gap-1 text-[10px] font-bold text-[#0d5c5b]"><span className="size-1.5 rounded-full bg-[#d37c52]" />{count} cita{count > 1 ? 's' : ''}</span>}</div> })}</div>
}
