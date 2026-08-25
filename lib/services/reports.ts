import { supabase } from '@/lib/supabase/client'

export interface DashboardMetrics {
  todaySalesUsd: number
  todaySalesVes: number
  todayAppointments: number
  activeCustomers: number
  lowStockProducts: number
}

/** KPIs principales del panel operativo. */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const today = new Date().toISOString().slice(0, 10)

  const [salesRes, appointmentsRes, customersRes, stockRes] = await Promise.all([
    supabase.from('sales').select('total_usd,total_ves').gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`),
    supabase.from('appointments').select('id', { count: 'exact' }).eq('date', today),
    supabase.from('customers').select('id', { count: 'exact' }).eq('status', 'Activo'),
    supabase.from('products').select('id', { count: 'exact' }).lt('stock', 5).eq('status', 'Activo'),
  ])

  return {
    todaySalesUsd: (salesRes.data ?? []).reduce((sum, row) => sum + Number(row.total_usd), 0),
    todaySalesVes: (salesRes.data ?? []).reduce((sum, row) => sum + Number(row.total_ves), 0),
    todayAppointments: appointmentsRes.count ?? 0,
    activeCustomers: customersRes.count ?? 0,
    lowStockProducts: stockRes.count ?? 0,
  }
}

/** Ventas agrupadas por día para el reporte de actividad. */
export async function getSalesByDay(days = 7) {
  const from = new Date()
  from.setDate(from.getDate() - days + 1)
  const fromIso = from.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('sales')
    .select('created_at, total_usd')
    .gte('created_at', `${fromIso}T00:00:00`)
    .order('created_at', { ascending: true })

  if (error) throw error

  const daily: Record<string, number> = {}
  for (const row of data ?? []) {
    const day = (row.created_at as string).slice(0, 10)
    daily[day] = (daily[day] ?? 0) + Number(row.total_usd)
  }
  return Object.entries(daily).map(([date, total]) => ({ date, total }))
}

/** Distribución de ventas por área para el reporte. */
export async function getSalesByArea() {
  const { data, error } = await supabase
    .from('sale_items')
    .select('kind, price, quantity')
    .limit(1000)

  if (error) throw error

  const totals: Record<string, number> = { Veterinaria: 0, 'Peluquería': 0, 'Pet shop': 0 }
  for (const row of data ?? []) {
    const amount = Number(row.price) * Number(row.quantity)
    if (row.kind === 'Servicio') {
      totals.Veterinaria += amount * 0.7
      totals['Peluquería'] += amount * 0.3
    } else {
      totals['Pet shop'] += amount
    }
  }
  return totals
}

/** Ingresos mensuales comparados con el mes anterior. */
export async function getRevenueComparison() {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonth = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('sales')
    .select('created_at, total_usd')
    .gte('created_at', `${previousMonth}-01T00:00:00`)

  if (error) throw error

  const current = (data ?? []).filter((row) => (row.created_at as string).startsWith(currentMonth))
    .reduce((sum, row) => sum + Number(row.total_usd), 0)
  const previousTotal = (data ?? []).filter((row) => (row.created_at as string).startsWith(previousMonth))
    .reduce((sum, row) => sum + Number(row.total_usd), 0)

  return { current, previousTotal, percentChange: previousTotal > 0 ? ((current - previousTotal) / previousTotal) * 100 : 0 }
}