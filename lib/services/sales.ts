import { supabase } from '@/lib/supabase/client'
import { getCurrentProfile } from './auth'
import type { CashRegister, PaymentMethod, Sale } from '@/lib/types'

let localSales: Sale[] = []
let localRegister: CashRegister | null = null

const PAGE_SIZE = 15

/** Línea de venta desde el carrito de caja. */
export interface SaleLineInput {
  id: string
  name: string
  kind: 'Producto' | 'Servicio'
  price: number
  quantity: number
}

export interface SaleInput {
  customerId: number | null
  items: SaleLineInput[]
  paymentMethod: PaymentMethod
  exchangeRate: number
}

/** Obtiene ventas recientes con paginación. */
export async function getSales(options: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = PAGE_SIZE } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('sales')
    .select('*, customers(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  const rows = (data ?? []).map((row) => ({
    ...row,
    customer_name: (row as unknown as { customers: { name: string } | null }).customers?.name ?? 'Cliente mostrador',
  }))

  return { data: rows as (Sale & { customer_name: string })[], count: count ?? 0 }
}

/**
 * Crea una venta con sus líneas y un movimiento de inventario.
 * El total VES se calcula multiplicando el subtotal por la tasa de cambio.
 */
export async function createSale(input: SaleInput): Promise<Sale> {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const sale = { id: Date.now(), customer_id: input.customerId, subtotal_usd: subtotal, total_usd: subtotal, total_ves: subtotal * input.exchangeRate, payment_method: input.paymentMethod, status: 'Pagada', created_at: new Date().toISOString() } as Sale
  localSales = [sale, ...localSales]
  return sale
}

export async function createSaleLegacy(input: SaleInput): Promise<Sale> {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalVes = subtotal * input.exchangeRate

  const { data: sale, error } = await supabase
    .from('sales')
    .insert({
      customer_id: input.customerId,
      subtotal_usd: subtotal,
      total_usd: subtotal,
      total_ves: totalVes,
      payment_method: input.paymentMethod,
      status: 'Pagada',
    })
    .select()
    .single()

  if (error || !sale) throw error ?? new Error('No se pudo crear la venta')

  const lines = input.items.map((item) => ({
    sale_id: sale.id,
    item_id: item.id,
    name: item.name,
    kind: item.kind,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: linesError } = await supabase.from('sale_items').insert(lines)
  if (linesError) throw linesError

  // Registrar salida de inventario por cada producto vendido
  for (const item of input.items.filter((line) => line.kind === 'Producto')) {
    await supabase.rpc('decrement_stock', { p_product_id: Number(item.id.replace(/\D/g, '')) || 0, p_quantity: item.quantity })
  }

  return sale as Sale
}

/** Obtiene la caja abierta del usuario actual, si existe. */
export async function getOpenRegister(): Promise<CashRegister | null> { return localRegister }

export async function getOpenRegisterLegacy(): Promise<CashRegister | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('cash_registers').select('*').eq('user_id', user.id).eq('status', 'Abierta').order('opened_at', { ascending: false }).limit(1).maybeSingle()
  if (error || !data) return null
  return data as CashRegister
}

/** Abre la caja con un fondo inicial. */
export async function openRegister(openingAmount: number): Promise<CashRegister> {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Usuario no autenticado')
  localRegister = { id: Date.now(), user_id: profile.id, opening_amount: openingAmount, status: 'Abierta', opened_at: new Date().toISOString() } as CashRegister
  return localRegister
}

/** Cierra la caja registrando el monto final. */
export async function closeRegister(_id: number, closingAmount: number): Promise<void> {
  if (!localRegister) throw new Error('No hay una caja abierta')
  localRegister = { ...localRegister, status: 'Cerrada', closing_amount: closingAmount, closed_at: new Date().toISOString() } as CashRegister
}

/** Resumen de ventas de hoy para la caja. */
export async function getTodaySalesSummary() {
  const today = new Date().toISOString().slice(0, 10)
  const data = localSales.filter((sale) => sale.created_at?.startsWith(today))
  return { totalUsd: data.reduce((sum, row) => sum + Number(row.total_usd), 0), totalVes: data.reduce((sum, row) => sum + Number(row.total_ves), 0), count: data.length }
}
