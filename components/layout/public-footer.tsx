'use client'
import { AtSign, Clock3, Heart, Mail, MapPin, MessageCircle, PawPrint, Phone, Share2 } from 'lucide-react'
import type { View } from '@/lib/types'

/** Footer público mostrado en todas las páginas con contacto, horarios y redes. */
export function PublicFooter({ setView }: { setView: (view: View) => void }) {
  return (
    <footer className="border-t border-[#dce7e2] bg-[#173b3b] text-[#bfd5cb]">
      <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <Brand setView={setView} />
          <NavLinks setView={setView} />
          <ContactInfo />
          <Schedule />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#8faea2] md:flex-row">
          <p>© {new Date().getFullYear()} akimax pet — Clínica veterinaria & pet shop. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">Hecho con <Heart className="size-3 text-[#e1a175] fill-[#e1a175]" /> para ellos.</p>
        </div>
      </div>
    </footer>
  )
}

function Brand({ setView }: { setView: (view: View) => void }) {
  const socials = [
    { icon: AtSign, label: 'Instagram' },
    { icon: MessageCircle, label: 'WhatsApp' },
    { icon: Share2, label: 'TikTok / X' },
    { icon: Mail, label: 'Correo' },
  ]
  return (
    <div>
      <div className="flex items-center gap-3">
        <button onClick={() => setView('inicio')} className="flex items-center gap-3 text-left">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e7f1df] text-[#0d5c5b]"><PawPrint className="size-5" /></span>
          <span>
            <span className="block font-serif text-xl font-bold tracking-tight text-[#f3f8f4]">akimax</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8faea2]">pet clinic & shop</span>
          </span>
        </button>
      </div>
      <p className="mt-5 max-w-xs text-sm leading-6 text-[#9dbbae]">
        Clínica veterinaria y pet shop. Cuidado, salud y productos para que tu familia multiespecie viva más y mejor.
      </p>
      <div className="mt-6 flex items-center gap-2">
        {socials.map(({ icon: Icon, label }) => (
          <a key={label} href="#" aria-label={label} onClick={(event) => event.preventDefault()} className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-[#cfe0d6] ring-1 ring-white/10 transition-colors hover:bg-[#e7f1df] hover:text-[#0d5c5b]">
            <Icon className="size-4" />
          </a>
        ))}
      </div>
    </div>
  )
}

function NavLinks({ setView }: { setView: (view: View) => void }) {
  const links: { id: View; label: string }[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'tienda', label: 'Pet shop' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'citas', label: 'Citas' },
    { id: 'contacto', label: 'Contacto' },
  ]
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1a175]">Navegación</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.id}>
            <button onClick={() => setView(link.id)} className="transition-colors hover:text-[#e7f1df]">{link.label}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactInfo() {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1a175]">Contacto</h3>
      <ul className="mt-5 space-y-4 text-sm">
        <li className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-[#e1a175]" />
          <span>Av. Principal, Local 7<br />Urb. La Estancia, Caracas</span>
        </li>
        <li>
          <a href="tel:+582123456789" className="flex items-center gap-3 transition-colors hover:text-[#e7f1df]">
            <Phone className="size-4 shrink-0 text-[#e1a175]" /> +58 212-345.67.89
          </a>
        </li>
        <li>
          <a href="mailto:hola@akimax.pet" className="flex items-center gap-3 transition-colors hover:text-[#e7f1df]">
            <Mail className="size-4 shrink-0 text-[#e1a175]" /> hola@akimax.pet
          </a>
        </li>
      </ul>
    </div>
  )
}

function Schedule() {
  const rows = [
    { days: 'Lun – Vie', hours: '8:00 – 18:00' },
    { days: 'Sábados', hours: '8:00 – 14:00' },
    { days: 'Domingos', hours: 'Urgencias' },
  ]
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1a175]">Horarios</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {rows.map((row) => (
          <li key={row.days} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-[#9dbbae]"><Clock3 className="size-4 text-[#e1a175]" />{row.days}</span>
            <span className="font-semibold text-[#e7f1df]">{row.hours}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}