'use client'

import { useState } from 'react'
import { PawPrint } from 'lucide-react'
import type { View } from '@/lib/types'

const slides = [
  { kicker: 'Cuidado que se siente', title: 'Su bienestar, nuestra forma de estar cerca.', cta: 'Agendar cita', target: 'citas' as View },
  { kicker: 'Tu pet shop de confianza', title: 'Pequeños rituales. Grandes colas felices.', cta: 'Explorar tienda', target: 'tienda' as View },
  { kicker: 'Una nueva forma de acompañar', title: 'Más etapas. Más historias. Más vida juntos.', cta: 'Ver servicios', target: 'servicios' as View },
]

const stages = [
  ['Cachorros', 'Rutinas, vacunas y nutrición para empezar bien.', 'bg-[#e7f1eb]'],
  ['Adultos', 'Prevención y energía para todos sus días.', 'bg-[#e8eef4]'],
  ['Seniors', 'Más confort, seguimiento y tiempo juntos.', 'bg-[#f1eee7]'],
  ['Familias multiespecie', 'Un mismo equipo para todas sus historias.', 'bg-[#f3e8e2]'],
] as const

/** Dashboard de inicio para usuarios autenticados. */
export function DashboardView({ setView }: { setView: (view: View) => void }) {
  const [hero, setHero] = useState(0)
  const active = slides[hero]

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#dfeee7] p-8 md:p-12 lg:min-h-[330px] lg:p-16">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#d37c52]">{active.kicker}</p>
          <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#0d5c5b] md:text-6xl">{active.title}</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#52756c]">Todo lo que tu mascota necesita, en un mismo lugar y con un equipo que sí conoce su nombre.</p>
          <button onClick={() => setView(active.target)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">{active.cta}</button>
        </div>
        <div className="pointer-events-none absolute -right-12 bottom-0 hidden h-full w-[44%] lg:block">
          <div className="absolute right-16 top-16 flex size-56 items-center justify-center rounded-full border-[22px] border-[#b9d9ca] bg-[#f1f4e9]"><PawPrint className="size-24 text-[#0d5c5b]/25" /></div>
          <div className="absolute bottom-0 right-0 text-[190px] leading-none text-[#0d5c5b]/10">✦</div>
        </div>
        <div className="absolute bottom-6 right-8 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setHero(i)} aria-label={`Slide ${i + 1}`} className={`size-2.5 rounded-full ${hero === i ? 'bg-[#0d5c5b]' : 'bg-[#a7c9ba]'}`} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader eyebrow="Akimax por etapas" title="Una forma más inteligente de acompañar" detail="Programas creados para la vida real de cada familia." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map(([title, text, tone]) => (
            <button key={title} onClick={() => setView('servicios')} className={`group rounded-3xl ${tone} p-5 text-left transition-transform hover:-translate-y-1`}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-[#0d5c5b]"><PawPrint className="size-4" /></span>
              <b className="mt-8 block font-serif text-xl text-[#173b3b]">{title}</b>
              <span className="mt-2 block text-sm leading-5 text-[#66817a]">{text}</span>
              <span className="mt-5 flex items-center gap-1 text-xs font-bold text-[#0d5c5b]">Explorar programa</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">{eyebrow}</p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#173b3b]">{title}</h2>
        {detail && <p className="mt-2 text-sm leading-6 text-[#78918a]">{detail}</p>}
      </div>
      {action}
    </div>
  )
}