'use client'

import { useEffect, useMemo, useState } from 'react'
import { Banknote, Calculator, CircleDollarSign, LockKeyhole, Receipt } from 'lucide-react'
import { formatUSD, formatVES, type PaymentMethod, type Toast } from '@/lib/types'
import { CashCatalog, type CatalogItem } from './cash-catalog'
import { CustomerSelector } from './customer-selector'
import { SaleCart, type SaleItem } from './sale-cart'
import { useExchangeRate } from '@/lib/hooks'
import { createSale, openRegister, closeRegister, getTodaySalesSummary } from '@/lib/services/sales'

/**
 * Módulo de caja conectado a Supabase.
 * Usa la tasa de cambio real (dolarapi) y persiste ventas, caja y clientes.
 */
export default function CashPage({ showToast }: { showToast: Toast }) {
  const [open, setOpen] = useState(false)
  const [opening, setOpening] = useState('100')
  const [customer, setCustomer] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('Efectivo USD')
  const [items, setItems] = useState<SaleItem[]>([])
  const [today, setToday] = useState({ totalUsd: 0, totalVes: 0, count: 0 })
  const { rate, source, loading: rateLoading } = useExchangeRate()

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const add = (item: CatalogItem) =>
    setItems((current) => {
      const found = current.find((line) => line.id === item.id)
      return found
        ? current.map((line) => (line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line))
        : [...current, { ...item, quantity: 1 }]
    })

  const charge = async () => {
    if (!items.length || !customer) return showToast('Selecciona un cliente y agrega al menos un artículo')
    try {
      await createSale({ customerId: null, items, paymentMethod: payment, exchangeRate: rate })
      showToast(`Factura emitida por ${formatUSD(subtotal)} · ${formatVES(subtotal, rate)}`)
      setItems([])
      setCustomer('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo emitir la factura')
    }
  }

  const toggleRegister = async () => {
    try {
      if (open) {
        await closeRegister(0, subtotal)
        setOpen(false)
        showToast('Caja cerrada. Jornada conciliada')
      } else {
        const register = await openRegister(Number(opening) || 0)
        setOpen(true)
        showToast('Caja abierta correctamente')
      }
    } catch {
      showToast('No se pudo cambiar el estado de la caja')
    }
  }

  const loadToday = async () => {
    try {
      const summary = await getTodaySalesSummary()
      setToday(summary)
    } catch {
      // Sin conexión: mantener valores por defecto
    }
  }

  // Cargar el resumen de ventas del día al montar
  useEffect(() => {
    void loadToday()
  }, [])

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
      <Header open={open} setOpen={toggleRegister} showToast={showToast} />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] bg-[#e4efe8] p-7">
          <Calculator className="size-7 text-[#0d5c5b]" />
          <h2 className="mt-5 font-serif text-2xl font-bold text-[#173b3b]">{open ? 'Caja abierta' : 'Caja cerrada'}</h2>
          <p className="mt-2 text-sm text-[#66817a]">{open ? 'Registra ventas y emite facturas.' : 'Ingresa el fondo inicial para comenzar.'}</p>
          {!open && <div className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3"><span className="text-sm text-[#78918a]">$</span><input aria-label="Fondo inicial" value={opening} onChange={(e) => setOpening(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" /></div>}
          {rateLoading ? <p className="mt-4 text-xs text-[#78918a]">Cargando tasa...</p> : <p className="mt-4 text-xs font-semibold text-[#0d5c5b]">Tasa del día: Bs. {rate.toFixed(2)} · {source === 'dolarapi' ? 'dolarapi' : 'manual'}</p>}
        </div>
        <Summary icon={<CircleDollarSign />} label="Ventas de hoy USD" value={formatUSD(today.totalUsd)} />
        <Summary icon={<Receipt />} label="Facturas emitidas hoy" value={String(today.count)} />
      </div>

      {open && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-6">
            <CashCatalog onAdd={add} />
            <SaleCart items={items} onChange={setItems} />
          </div>
          <aside className="flex flex-col gap-5">
            <CustomerSelector value={customer} onChange={setCustomer} />
            <div className="rounded-[2rem] bg-[#173b3b] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8d8c8]">Resumen de factura</p>
              <div className="mt-6 flex items-end justify-between">
                <span className="text-sm text-[#b8d8c8]">Total USD</span>
                <strong className="font-serif text-4xl">{formatUSD(subtotal)}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-sm text-[#b8d8c8]">Total VES · tasa {rate}</span>
                <strong>{formatVES(subtotal, rate)}</strong>
              </div>
              <select aria-label="Método de pago" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)} className="mt-6 w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white outline-none">
                <option className="text-[#173b3b]">Efectivo USD</option>
                <option className="text-[#173b3b]">Efectivo VES</option>
                <option className="text-[#173b3b]">Tarjeta</option>
                <option className="text-[#173b3b]">Pago móvil</option>
              </select>
              <button onClick={charge} disabled={!items.length || rateLoading} className="mt-4 w-full rounded-xl bg-[#d37c52] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
                Emitir factura
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}

function Header({ open, setOpen, showToast }: { open: boolean; setOpen: () => void; showToast: Toast }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Ventas</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[#173b3b]">Caja</h1>
        <p className="mt-2 text-sm text-[#78918a]">Productos, servicios, clientes y facturación con tasa real.</p>
      </div>
      <button onClick={setOpen} className="inline-flex items-center gap-2 rounded-xl bg-[#d37c52] px-4 py-3 text-sm font-bold text-white">
        {open ? <LockKeyhole className="size-4" /> : <Banknote className="size-4" />}
        {open ? 'Cerrar caja' : 'Abrir caja'}
      </button>
    </header>
  )
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-7 ring-1 ring-[#e1ebe6]">
      <span className="text-[#0d5c5b]">{icon}</span>
      <p className="mt-6 text-sm text-[#78918a]">{label}</p>
      <b className="mt-1 block font-serif text-3xl text-[#173b3b]">{value}</b>
    </div>
  )
}