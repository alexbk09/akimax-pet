'use client'

import { useState } from 'react'
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import type { SetView } from '@/lib/types'

/**
 * Página de contacto con información de la clínica
 * y formulario de mensaje (demo, sin backend todavía).
 */
export function ContactPage({ setView }: { setView: SetView }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Estamos aquí para ellos</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173b3b] md:text-5xl">Hablemos de tu mascota</h1>
        <p className="mt-3 text-sm leading-6 text-[#78918a]">Escríbenos, llámanos o visítanos. Nuestro equipo responde con el mismo cariño con el que cuidamos a cada paciente.</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <InfoCard icon={<MapPin className="size-5" />} title="Dirección" lines={['Av. Principal, Local 7', 'Urb. La Estancia, Caracas']} />
          <InfoCard icon={<Phone className="size-5" />} title="Teléfonos" lines={['+58 212-345.67.89', '+58 414-123.45.67 (WhatsApp)']} />
          <InfoCard icon={<Mail className="size-5" />} title="Correo" lines={['hola@akimax.pet']} />
          <InfoCard icon={<Clock3 className="size-5" />} title="Horarios" lines={['Lun – Vie · 8:00 – 18:00', 'Sábados · 8:00 – 14:00', 'Domingos · Urgencias']} />
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] sm:p-8 lg:col-span-3">
          <h2 className="font-serif text-2xl font-bold text-[#173b3b]">Envíanos un mensaje</h2>
          <p className="mt-1 text-sm text-[#78918a]">Te respondemos en menos de 24 horas hábiles.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#173b3b]">Nombre</span>
              <input type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" className="mt-2 w-full rounded-2xl border-0 bg-[#f7f9f7] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#173b3b]">Correo</span>
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tucorreo@ejemplo.com" className="mt-2 w-full rounded-2xl border-0 bg-[#f7f9f7] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-[#173b3b]">Mensaje</span>
            <textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Cuéntanos sobre tu mascota o tu consulta..." className="mt-2 w-full resize-none rounded-2xl border-0 bg-[#f7f9f7] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
          </label>

          {sent ? (
            <div role="status" className="mt-5 rounded-2xl bg-green-50 px-4 py-4 text-sm font-semibold text-green-700">
              ¡Gracias! Hemos recibido tu mensaje. Te escribiremos muy pronto.
            </div>
          ) : (
            <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
              <Send className="size-4" /> Enviar mensaje
            </button>
          )}

          <button onClick={() => setView('citas')} className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0d5c5b] hover:underline">
            <MessageCircle className="size-4" /> Prefiero agendar una cita
          </button>
        </form>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-[#173b3b]">{title}</h3>
        {lines.map((line) => <p key={line} className="mt-1 text-sm text-[#78918a]">{line}</p>)}
      </div>
    </div>
  )
}