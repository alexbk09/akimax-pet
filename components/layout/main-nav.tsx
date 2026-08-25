'use client'
import { Bell, LogOut, Menu, PawPrint, ShoppingCart, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signOut } from '@/lib/services/auth'
import type { Permission, View } from '@/lib/types'

type MainNavProps = {
  view: View
  setView: (view: View) => void
  cartCount: number
  openCart: () => void
  showToast: (message: string) => void
}

interface NavLink {
  id: View
  label: string
  permission?: Permission
}

const publicLinks: NavLink[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'tienda', label: 'Pet shop' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'contacto', label: 'Contacto' },
]

const authedLinks: NavLink[] = [
  { id: 'inicio', label: 'Inicio', permission: 'dashboard:view' },
  { id: 'tienda', label: 'Pet shop', permission: 'catalog:view' },
  { id: 'servicios', label: 'Servicios', permission: 'catalog:view' },
  { id: 'citas', label: 'Citas', permission: 'appointments:view' },
  { id: 'pacientes', label: 'Mis mascotas', permission: 'patients:view' },
  { id: 'cliente', label: 'Mi panel', permission: 'dashboard:view' },
  { id: 'operaciones', label: 'Panel operativo', permission: 'dashboard:view' },
  { id: 'caja', label: 'Caja', permission: 'cash:view' },
  { id: 'administracion', label: 'Administración', permission: 'catalog:manage' },
  { id: 'roles', label: 'Roles', permission: 'roles:manage' },
  { id: 'reportes', label: 'Reportes', permission: 'reports:view' },
]

export function MainNav({ view, setView, cartCount, openCart, showToast }: MainNavProps) {
  const { profile, isAuthenticated, hasPermission } = useAuth()
  const links = isAuthenticated
    ? authedLinks.filter((link) => !link.permission || hasPermission(link.permission))
    : publicLinks

  async function handleLogout() {
    await signOut()
    setView('inicio')
    showToast('Sesión cerrada')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#dce7e2] bg-[#f7f9f7]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <button onClick={() => setView('inicio')} className="flex items-center gap-3 text-left">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#0d5c5b] text-[#e7f1df]"><PawPrint className="size-5" /></span>
          <span><span className="block font-serif text-xl font-bold tracking-tight">akimax</span><span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#79938a]">pet clinic & shop</span></span>
        </button>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#66817a] lg:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <button key={link.id} onClick={() => setView(link.id)} className={`transition-colors hover:text-[#0d5c5b] ${view === link.id ? 'font-bold text-[#0d5c5b]' : ''}`}>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="Notificaciones" className="hidden rounded-xl p-2.5 text-[#66817a] hover:bg-white sm:block"><Bell className="size-5" /></button>
          <button onClick={openCart} className="relative rounded-xl p-2.5 text-[#0d5c5b] hover:bg-white" aria-label="Abrir carrito">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#d37c52] text-[10px] font-bold text-white">{cartCount}</span>}
          </button>

          {isAuthenticated ? (
            <>
              <button className="hidden items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#e1ebe6] sm:flex">
                <span className="flex size-8 items-center justify-center rounded-xl bg-[#e8dfd1] text-xs font-bold text-[#6d5847]">{profile?.full_name?.slice(0, 2).toUpperCase() ?? 'AM'}</span>
                <span className="pr-1 text-left text-xs">
                  <b className="block text-[#173b3b]">{profile?.full_name?.split(' ')[0] ?? 'Usuario'}</b>
                  <span className="text-[#86a096]">{profile?.role ?? 'Invitado'}</span>
                </span>
              </button>
              <button onClick={handleLogout} className="hidden rounded-xl p-2.5 text-[#66817a] hover:bg-white lg:block" aria-label="Cerrar sesión"><LogOut className="size-5" /></button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button onClick={() => setView('login')} className="rounded-xl px-4 py-2 text-sm font-bold text-[#0d5c5b] hover:bg-white">Iniciar sesión</button>
              <button onClick={() => setView('registro')} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
                <UserPlus className="size-4" /> Crear cuenta
              </button>
            </div>
          )}

          <button className="rounded-xl p-2.5 text-[#0d5c5b] lg:hidden" aria-label="Abrir menú"><Menu className="size-5" /></button>
        </div>
      </div>
    </header>
  )
}