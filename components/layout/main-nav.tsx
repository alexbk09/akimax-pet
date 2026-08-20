'use client'

import { Bell, Menu, PawPrint, ShoppingCart } from 'lucide-react'

type View = 'inicio' | 'tienda' | 'servicios' | 'citas' | 'pacientes' | 'operaciones' | 'administracion' | 'caja' | 'roles'

type MainNavProps = {
  view: View
  setView: (view: View) => void
  cartCount: number
  openCart: () => void
  showToast: (message: string) => void
}

const links: [View, string][] = [
  ['inicio', 'Inicio'],
  ['tienda', 'Pet shop'],
  ['servicios', 'Servicios'],
  ['citas', 'Citas'],
  ['pacientes', 'Mis mascotas'],
  ['operaciones', 'Panel operativo'],
  ['caja', 'Caja'],
  ['administracion', 'Administración'],
  ['roles', 'Roles'],
]

export function MainNav({ view, setView, cartCount, openCart, showToast }: MainNavProps) {
  return <header className="sticky top-0 z-40 border-b border-[#dce7e2] bg-[#f7f9f7]/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
      <button onClick={() => setView('inicio')} className="flex items-center gap-3 text-left">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#0d5c5b] text-[#e7f1df]"><PawPrint className="size-5" /></span>
        <span><span className="block font-serif text-xl font-bold tracking-tight">akimax</span><span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#79938a]">pet clinic & shop</span></span>
      </button>
      <nav className="hidden items-center gap-8 text-sm font-medium text-[#66817a] lg:flex" aria-label="Navegación principal">
        {links.map(([id, label]) => <button key={id} onClick={() => setView(id)} className={`transition-colors hover:text-[#0d5c5b] ${view === id ? 'font-bold text-[#0d5c5b]' : ''}`}>{label}</button>)}
      </nav>
      <div className="flex items-center gap-2">
        <button aria-label="Notificaciones" className="hidden rounded-xl p-2.5 text-[#66817a] hover:bg-white sm:block"><Bell className="size-5" /></button>
        <button onClick={openCart} className="relative rounded-xl p-2.5 text-[#0d5c5b] hover:bg-white" aria-label="Abrir carrito"><ShoppingCart className="size-5" />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#d37c52] text-[10px] font-bold text-white">{cartCount}</span>}</button>
        <button onClick={() => showToast('Perfil de Ana María abierto')} className="hidden items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#e1ebe6] sm:flex"><span className="flex size-8 items-center justify-center rounded-xl bg-[#e8dfd1] text-xs font-bold text-[#6d5847]">AM</span><span className="pr-1 text-left text-xs"><b className="block text-[#173b3b]">Ana María</b><span className="text-[#86a096]">Cliente</span></span></button>
        <button className="rounded-xl p-2.5 text-[#0d5c5b] lg:hidden" aria-label="Menú"><Menu className="size-5" /></button>
      </div>
    </div>
  </header>
}
