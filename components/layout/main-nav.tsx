'use client'
import { useState } from 'react'
import { Bell, ChevronDown, HeartPulse, LayoutDashboard, LogOut, Menu, PawPrint, ShoppingCart, User as UserIcon, UserPlus, X } from 'lucide-react'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const links = isAuthenticated
    ? authedLinks.filter((link) => !link.permission || hasPermission(link.permission))
    : publicLinks

  async function handleLogout() {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
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
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#e1ebe6] transition-colors hover:bg-[#f1f6f2]"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-[#e8dfd1] text-xs font-bold text-[#6d5847]">{profile?.full_name?.slice(0, 2).toUpperCase() ?? 'AM'}</span>
                  <span className="pr-1 text-left text-xs">
                    <b className="block text-[#173b3b]">{profile?.full_name?.split(' ')[0] ?? 'Usuario'}</b>
                    <span className="text-[#86a096]">{profile?.role ?? 'Invitado'}</span>
                  </span>
                  <ChevronDown className={`size-4 text-[#86a096] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                    <div role="menu" className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[#e1ebe6]">
                      <div className="border-b border-[#edf1ee] bg-[#f7f9f7] px-5 py-4">
                        <p className="text-sm font-bold text-[#173b3b]">{profile?.full_name}</p>
                        <p className="mt-0.5 text-xs text-[#86a096]">{profile?.email}</p>
                      </div>
                      <div className="p-2">
                        <MenuItem icon={<LayoutDashboard className="size-4" />} label="Mi panel" onClick={() => { setUserMenuOpen(false); setView('cliente') }} />
                        <MenuItem icon={<HeartPulse className="size-4" />} label="Mis mascotas" onClick={() => { setUserMenuOpen(false); setView('pacientes') }} />
                        <MenuItem icon={<UserIcon className="size-4" />} label="Mi perfil" onClick={() => { setUserMenuOpen(false); setView('perfil') }} />
                        <MenuItem icon={<ShoppingCart className="size-4" />} label="Pet shop" onClick={() => { setUserMenuOpen(false); setView('tienda') }} />
                      </div>
                      <div className="border-t border-[#edf1ee] p-2">
                        <MenuItem icon={<LogOut className="size-4" />} label="Cerrar sesión" danger onClick={handleLogout} />
                      </div>
                    </div>
                  </>
                )}
              </div>
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

          <button className="rounded-xl p-2.5 text-[#0d5c5b] lg:hidden" aria-label="Abrir menú" onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#dce7e2] bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {links.map((link) => (
              <button key={link.id} onClick={() => { setMobileMenuOpen(false); setView(link.id) }} className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#66817a] hover:bg-[#f1f6f2] hover:text-[#0d5c5b]">
                {link.label}
              </button>
            ))}
          </nav>
          {isAuthenticated && (
            <div className="mt-3 border-t border-[#edf1ee] pt-3">
              <button onClick={() => { setMobileMenuOpen(false); setView('perfil') }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#66817a] hover:bg-[#f1f6f2]">
                <UserIcon className="size-4" /> Mi perfil
              </button>
              <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                <LogOut className="size-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button role="menuitem" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#66817a] hover:bg-[#f1f6f2] hover:text-[#0d5c5b]'}`}>
      {icon}
      {label}
    </button>
  )
}