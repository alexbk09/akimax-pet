'use client'

import { useState } from 'react'
import AdminModule from '@/components/pages/admin/admin-page'
import OperationsCalendar from '@/components/pages/operations/operations-calendar'
import SpeciesManager from '@/components/pages/operations/species-manager'
import ScheduleManager from '@/components/pages/operations/schedule-manager'
import ServicesPage from '@/components/pages/services/services-page'
import ShopPage from '@/components/pages/shop/shop-page'
import PatientsPage from '@/components/pages/patients/patients-page'
import AppointmentsPage from '@/components/pages/appointments/appointments-page'
import CashPage from '@/components/pages/cash/cash-page'
import RolesPage from '@/components/pages/admin/roles-page'
import ReportsPage from '@/components/pages/reports/reports-page'
import ClientPage from '@/components/pages/client/client-page'
import { ProfilePage } from '@/components/pages/client/profile-page'
import { LandingPage } from '@/components/pages/landing/landing-page'
import { DashboardView } from '@/components/pages/landing/dashboard-view'
import { LoginPage } from '@/components/pages/auth/login-page'
import { RegisterPage } from '@/components/pages/auth/register-page'
import { ContactPage } from '@/components/pages/contact/contact-page'
import { MainNav } from '@/components/layout/main-nav'
import { PublicFooter } from '@/components/layout/public-footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { RoleGuard } from '@/components/ui'
import { useAuth, useCart, useExchangeRate } from '@/lib/hooks'
import type { View } from '@/lib/types'

/**
 * Shell principal: orquesta módulos, control de acceso por permisos
 * y estado global (auth, carrito, tasa de cambio).
 */
export default function AppShell() {
  const [view, setView] = useState<View>('inicio')
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const { loading: authLoading, isAuthenticated } = useAuth()
  const { items, count, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { rate } = useExchangeRate()

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  function requireLogin() {
    setView('login')
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-sm font-semibold text-[#78918a]">Cargando sesión...</p></div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9f7] text-[#173b3b]">
      <MainNav view={view} setView={setView} cartCount={count} openCart={() => setCartOpen(true)} showToast={showToast} />

      <main className="flex-1">
        {view === 'login' && <LoginPage setView={setView} showToast={showToast} />}
        {view === 'registro' && <RegisterPage setView={setView} />}
        {view === 'contacto' && <ContactPage setView={setView} />}

        {view === 'inicio' && (isAuthenticated ? <DashboardView setView={setView} /> : <LandingPage setView={setView} />)}
        {view === 'tienda' && <ShopPage setView={setView} />}
        {view === 'servicios' && <ServicesPage setView={setView} />}
        {view === 'citas' && <RoleGuard permission="appointments:view" onAuthRequired={requireLogin}><AppointmentsPage showToast={showToast} /></RoleGuard>}
        {view === 'pacientes' && <RoleGuard permission="patients:view" onAuthRequired={requireLogin}><PatientsPage showToast={showToast} /></RoleGuard>}
        {view === 'cliente' && <RoleGuard permission="dashboard:view" onAuthRequired={requireLogin}><ClientPage setView={setView} showToast={showToast} /></RoleGuard>}
        {view === 'perfil' && <RoleGuard permission="dashboard:view" onAuthRequired={requireLogin}><ProfilePage showToast={showToast} /></RoleGuard>}
        {view === 'operaciones' && <RoleGuard permission="dashboard:view" onAuthRequired={requireLogin}><Operations showToast={showToast} /></RoleGuard>}
        {view === 'caja' && <RoleGuard permission="cash:view" onAuthRequired={requireLogin}><CashPage showToast={showToast} /></RoleGuard>}
        {view === 'administracion' && <RoleGuard permission="catalog:manage" onAuthRequired={requireLogin}><AdminModule showToast={showToast} /></RoleGuard>}
        {view === 'roles' && <RoleGuard permission="roles:manage" onAuthRequired={requireLogin}><RolesPage showToast={showToast} /></RoleGuard>}
        {view === 'reportes' && <RoleGuard permission="reports:view" onAuthRequired={requireLogin}><ReportsPage /></RoleGuard>}
      </main>

      <PublicFooter setView={setView} />

      {cartOpen && <CartDrawer items={items} total={subtotal} rate={rate} onChangeQuantity={updateQuantity} onRemove={removeItem} onClose={() => setCartOpen(false)} onCheckout={() => { clearCart(); setCartOpen(false); showToast('Pedido enviado a caja') }} />}
      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[#173b3b] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  )
}


function Operations({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <OperationsCalendar />
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Vista operativa</p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#173b3b]">El equipo, en sintonía</h2>
          <p className="mt-2 text-sm leading-6 text-[#78918a]">Gestiona la operación diaria desde un mismo lugar.</p>
        </div>
        <button onClick={() => showToast('Datos actualizados')} className="rounded-xl bg-[#e7f1eb] px-3 py-2 text-xs font-bold text-[#0d5c5b]">Actualizar</button>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        <SpeciesManager showToast={showToast} />
        <ScheduleManager showToast={showToast} />
      </div>
    </div>
  )
}
