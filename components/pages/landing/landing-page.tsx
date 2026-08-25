'use client'

import { useState } from 'react'
import { ArrowRight, CalendarCheck2, HeartPulse, PawPrint, Phone, ShieldCheck, Sparkles, Stethoscope, Syringe } from 'lucide-react'
import { fallbackProducts, fallbackServices } from '@/lib/mock-data'
import type { SetView, View } from '@/lib/types'

const slides = [
  { kicker: 'Cuidado que se siente', title: 'Su bienestar, nuestra forma de estar cerca.', detail: 'Consulta, prevención y mucho cariño en un mismo lugar.', cta: 'Agendar cita', target: 'citas' as View },
  { kicker: 'Tu pet shop de confianza', title: 'Pequeños rituales. Grandes colas felices.', detail: 'Alimentos, accesorios y cuidado seleccionado para ellos.', cta: 'Explorar tienda', target: 'tienda' as View },
  { kicker: 'Una nueva forma de acompañar', title: 'Más etapas. Más historias. Más vida juntos.', detail: 'Servicios para cada etapa de tu familia multiespecie.', cta: 'Ver servicios', target: 'servicios' as View },
]

const stages = [
  { title: 'Cachorros', text: 'Rutinas, vacunas y nutrición para empezar bien.', tone: 'bg-[#e7f1eb]' },
  { title: 'Adultos', text: 'Prevención y energía para todos sus días.', tone: 'bg-[#e8eef4]' },
  { title: 'Seniors', text: 'Más confort, seguimiento y tiempo juntos.', tone: 'bg-[#f1eee7]' },
  { title: 'Familias multiespecie', text: 'Un mismo equipo para todas sus historias.', tone: 'bg-[#f3e8e2]' },
]

export function LandingPage({ setView }: { setView: SetView }) {
  const [slide, setSlide] = useState(0)
  const [openService, setOpenService] = useState<number | null>(null)
  const active = slides[slide]
  const features = [
    { icon: <Stethoscope className="size-4" />, title: 'Atención veterinaria', text: 'Diagnóstico, vacunas y cirugía con tecnología moderna.' },
    { icon: <HeartPulse className="size-4" />, title: 'Peluquería & spa', text: 'Baño, corte y cuidado estético para que luzcan geniales.' },
    { icon: <ShieldCheck className="size-4" />, title: 'Prevención', text: 'Planes de salud por etapa para una vida más larga.' },
    { icon: <PawPrint className="size-4" />, title: 'Pet shop completo', text: 'Alimentos, accesorios y todo lo que necesitan.' },
  ]

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#dfeee7] p-8 md:p-12 lg:min-h-[360px] lg:p-16">
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#d37c52]">{active.kicker}</p>
          <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#0d5c5b] md:text-6xl">{active.title}</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#52756c]">{active.detail}</p>
          <button onClick={() => setView(active.target)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">{active.cta} <ArrowRight className="size-4" /></button>
        </div>
        <div className="pointer-events-none absolute -right-12 bottom-0 hidden h-full w-[44%] lg:block">
          <div className="absolute right-16 top-16 flex size-56 items-center justify-center rounded-full border-[22px] border-[#b9d9ca] bg-[#f1f4e9]"><PawPrint className="size-24 text-[#0d5c5b]/25" /></div>
          <div className="absolute bottom-0 right-0 text-[190px] leading-none text-[#0d5c5b]/10">✦</div>
        </div>
        <div className="absolute bottom-6 right-8 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`size-2.5 rounded-full ${slide === i ? 'bg-[#0d5c5b]' : 'bg-[#a7c9ba]'}`} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <button key={feature.title} onClick={() => setView('servicios')} className="rounded-3xl bg-white p-5 text-left ring-1 ring-[#e1ebe6] transition-transform hover:-translate-y-1">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]">{feature.icon}</span>
              <b className="mt-8 block font-serif text-xl text-[#173b3b]">{feature.title}</b>
              <span className="mt-2 block text-sm leading-5 text-[#66817a]">{feature.text}</span>
            </button>
          ))}
        </div>
      </section>

      <ServicesSection openService={openService} setOpenService={setOpenService} setView={setView} />
      <ShopSection setView={setView} />
      <StagesSection setView={setView} />
      <AboutSection />
      <FinalCta setView={setView} />
    </div>
  )
}

function ServicesSection({ openService, setOpenService, setView }: { openService: number | null; setOpenService: (id: number | null) => void; setView: SetView }) {
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Servicios" title="Cuidado que se adapta a su historia" detail="Explora lo que podemos hacer por ellos." action={<button onClick={() => setView('servicios')} className="flex items-center gap-2 text-sm font-bold text-[#0d5c5b]">Ver todos <ArrowRight className="size-4" /></button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {fallbackServices.map((service) => (
          <article key={service.id} className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6]">
            <p className="text-xs font-bold uppercase tracking-wide text-[#d37c52]">{service.area}</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#173b3b]">{service.name}</h3>
            <p className="mt-2 text-sm leading-5 text-[#78918a]">{service.detail}</p>
            <div className="mt-5 flex items-end justify-between border-t border-[#edf2ee] pt-4">
              <div>
                <p className="font-serif text-lg font-bold text-[#0d5c5b]">${service.price.toFixed(2)}</p>
                <p className="text-xs text-[#93a9a0]">{service.duration}</p>
              </div>
              <button onClick={() => setOpenService(openService === service.id ? null : service.id)} className="text-sm font-bold text-[#0d5c5b]">{openService === service.id ? 'Menos' : 'Detalles'}</button>
            </div>
            {openService === service.id && (
              <p className="mt-4 rounded-xl bg-[#f4f8f5] p-4 text-sm leading-6 text-[#66817a]">Incluye evaluación previa, plan personalizado y seguimiento por nuestro equipo. Agéndalo desde la sección de citas.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function ShopSection({ setView }: { setView: SetView }) {
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Pet shop" title="Todo lo que mueve sus patitas" detail="Productos seleccionados para una vida más sana y feliz." action={<button onClick={() => setView('tienda')} className="flex items-center gap-2 text-sm font-bold text-[#0d5c5b]">Ver tienda <ArrowRight className="size-4" /></button>} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fallbackProducts.slice(0, 3).map((product) => (
          <article key={product.id} className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6]">
            <p className="text-xs font-bold uppercase tracking-wide text-[#d37c52]">{product.category}</p>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#173b3b]">{product.name}</h3>
            <div className="mt-5 flex items-center justify-between border-t border-[#edf2ee] pt-4">
              <p className="font-serif text-lg font-bold text-[#0d5c5b]">${product.price.toFixed(2)}</p>
              <button onClick={() => setView('tienda')} className="rounded-xl bg-[#0d5c5b] px-4 py-2 text-xs font-bold text-white">Comprar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function StagesSection({ setView }: { setView: SetView }) {
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Akimax por etapas" title="Una forma más inteligente de acompañar" detail="Programas creados para la vida real de cada familia." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <button key={stage.title} onClick={() => setView('servicios')} className={`rounded-3xl ${stage.tone} p-5 text-left transition-transform hover:-translate-y-1`}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-[#0d5c5b]"><Sparkles className="size-4" /></span>
            <b className="mt-8 block font-serif text-xl text-[#173b3b]">{stage.title}</b>
            <span className="mt-2 block text-sm leading-5 text-[#66817a]">{stage.text}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  const stats = [
    { value: '+800', label: 'mascotas atendidas' },
    { value: '12', label: 'años de experiencia' },
    { value: '24/7', label: 'urgencias veterinarias' },
  ]
  return (
    <section className="mt-14 rounded-[2rem] bg-[#173b3b] p-8 text-[#eef6ef] md:p-12 lg:flex lg:items-center lg:justify-between lg:p-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e1a175]">La clínica</p>
        <h2 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-5xl">Un equipo que sí conoce su nombre.</h2>
        <p className="mt-4 text-base leading-7 text-[#bfd5cb]">En akimax creemos que cada mascota es parte de la familia. Por eso combinamos medicina veterinaria moderna, productos de calidad y un trato cercano en cada visita.</p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-6 text-center lg:mt-0 lg:grid-cols-1 lg:gap-4 lg:text-left">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <b className="font-serif text-3xl text-[#e1a175]">{stat.value}</b>
            <p className="mt-1 text-xs text-[#9dbbae]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCta({ setView }: { setView: SetView }) {
  return (
    <section className="mt-14 rounded-[2rem] bg-[#f3e8e2] p-8 text-center md:p-14">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d37c52]">¿Listos para empezar?</p>
      <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-[#173b3b] md:text-5xl">Agenda su próxima visita hoy mismo.</h2>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button onClick={() => setView('citas')} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"><CalendarCheck2 className="size-4" />Agendar cita</button>
        <button onClick={() => setView('registro')} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#0d5c5b] ring-1 ring-[#e1ebe6] transition-transform hover:-translate-y-0.5"><Phone className="size-4" />Crear mi cuenta</button>
      </div>
    </section>
  )
}

function SectionHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#173b3b]">{title}</h2>
        {detail && <p className="mt-2 text-sm leading-6 text-[#78918a]">{detail}</p>}
      </div>
      {action}
    </div>
  )
}