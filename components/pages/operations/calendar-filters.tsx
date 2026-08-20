import { ChevronLeft, ChevronRight, Scissors, Stethoscope } from 'lucide-react'

type Area = 'Peluquería' | 'Veterinaria'
type CalendarView = 'Día' | 'Semana' | 'Mes'

export function CalendarFilters({ area, professional, view, professionals, onAreaChange, onProfessionalChange, onViewChange }: { area: Area; professional: string; view: CalendarView; professionals: string[]; onAreaChange: (area: Area) => void; onProfessionalChange: (professional: string) => void; onViewChange: (view: CalendarView) => void }) {
  return (
    <div className="flex flex-col gap-3 border-y border-[#edf2ee] py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2">
        <button aria-label="Periodo anterior" className="rounded-lg p-2 text-[#66817a] hover:bg-[#f3f7f4]"><ChevronLeft className="size-4" /></button>
        <span className="min-w-32 text-center text-sm font-bold text-[#173b3b]">15 — 21 Jun, 2026</span>
        <button aria-label="Periodo siguiente" className="rounded-lg p-2 text-[#66817a] hover:bg-[#f3f7f4]"><ChevronRight className="size-4" /></button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onAreaChange('Veterinaria')} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${area === 'Veterinaria' ? 'bg-[#0d5c5b] text-white' : 'bg-[#f3f7f4] text-[#66817a]'}`}><Stethoscope className="size-4" /> Veterinaria</button>
        <button onClick={() => onAreaChange('Peluquería')} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${area === 'Peluquería' ? 'bg-[#0d5c5b] text-white' : 'bg-[#f3f7f4] text-[#66817a]'}`}><Scissors className="size-4" /> Peluquería</button>
        <select aria-label="Filtrar profesional" value={professional} onChange={(event) => onProfessionalChange(event.target.value)} className="rounded-xl border-0 bg-[#f3f7f4] px-3 py-2 text-sm font-semibold text-[#426b63] outline-none">{professionals.map((person) => <option key={person} value={person}>{person === 'Todos' ? 'Todos los profesionales' : person}</option>)}</select>
        <div className="flex rounded-xl bg-[#f3f7f4] p-1">{(['Día', 'Semana', 'Mes'] as CalendarView[]).map((item) => <button key={item} onClick={() => onViewChange(item)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === item ? 'bg-white text-[#0d5c5b] shadow-sm' : 'text-[#78918a]'}`}>{item}</button>)}</div>
      </div>
    </div>
  )
}
