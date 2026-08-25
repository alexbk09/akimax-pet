import { supabase } from '@/lib/supabase/client'
import { getMedicalRecords } from './customers'
import type { Appointment, Customer, MedicalRecord, Pet, Sale, SaleItem } from '@/lib/types'

/**
 * Obtiene el registro de cliente vinculado al usuario autenticado.
 * El trigger de la migración 0011 vincula automáticamente por user_id.
 */
export async function getMyCustomer(): Promise<Customer | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as Customer
}

/** Mascotas del cliente autenticado, ordenadas por nombre. */
export async function getMyPets(customerId: number): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', customerId)
    .order('name')
  if (error) throw error
  return (data ?? []) as Pet[]
}

/** Crea una mascota para el cliente autenticado. */
export async function createMyPet(
  customerId: number,
  pet: Omit<Pet, 'id' | 'customer_id' | 'created_at' | 'initials' | 'owner' | 'last'>,
): Promise<Pet> {
  const initials = pet.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const { data, error } = await supabase
    .from('pets')
    .insert({ ...pet, customer_id: customerId, initials })
    .select()
    .single()
  if (error) throw error
  return data as Pet
}

/** Actualiza una mascota del cliente autenticado. */
export async function updateMyPet(petId: number, patch: Partial<Pet>): Promise<Pet> {
  const { data, error } = await supabase.from('pets').update(patch).eq('id', petId).select().single()
  if (error) throw error
  return data as Pet
}

interface MyAppointmentRow extends Appointment {
  services: { name: string; area: string } | null
  pets: { name: string } | null
  profiles: { full_name: string } | null
}

export interface MyAppointment extends Appointment {
  service_name: string
  pet_name: string
  professional_name: string
}

/** Próximas citas del cliente autenticado (fecha >= hoy, no canceladas). */
export async function getMyUpcomingAppointments(customerId: number): Promise<MyAppointment[]> {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, area), pets(name), profiles(full_name)')
    .eq('customer_id', customerId)
    .gte('date', today)
    .neq('status', 'Cancelada')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(10)

  if (error) throw error

  return (data ?? []).map(mapAppointmentRow)
}

function mapAppointmentRow(row: MyAppointmentRow): MyAppointment {
  return {
    ...row,
    service_name: row.services?.name ?? '',
    pet_name: row.pets?.name ?? '',
    professional_name: row.profiles?.full_name ?? '',
  }
}

/** Historial completo de citas del cliente autenticado. */
export async function getMyAllAppointments(customerId: number): Promise<MyAppointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, area), pets(name), profiles(full_name)')
    .eq('customer_id', customerId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).map(mapAppointmentRow)
}

/** Resumen de gastos del cliente en servicios y pet shop (ventas pagadas). */
export async function getMySpending(customerId: number): Promise<{
  totalUsd: number
  serviceSpend: number
  shopSpend: number
  itemsByCategory: { label: string; value: number; detail: string }[]
}> {
  const { data: sales, error } = await supabase
    .from('sales')
    .select('id, total_usd')
    .eq('customer_id', customerId)
    .eq('status', 'Pagada')
    .order('created_at', { ascending: false })

  if (error) throw error

  const salesList = (sales ?? []) as Pick<Sale, 'id' | 'total_usd'>[]
  const totalUsd = salesList.reduce((sum, sale) => sum + Number(sale.total_usd), 0)

  const itemsByCategory: { label: string; value: number; detail: string }[] = []
  let serviceSpend = 0
  let shopSpend = 0

  if (salesList.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('sale_id, kind, price, quantity')
      .in('sale_id', salesList.map((sale) => sale.id))

    if (!itemsError && items) {
      const rows = items as Pick<SaleItem, 'kind' | 'price' | 'quantity'>[]
      const serviceItems = rows.filter((item) => item.kind === 'Servicio')
      const storeItems = rows.filter((item) => item.kind === 'Producto')

      serviceSpend = serviceItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
      shopSpend = storeItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

      if (serviceSpend > 0) itemsByCategory.push({ label: 'Servicios veterinarios', value: serviceSpend, detail: `${serviceItems.length} atención(es)` })
      if (shopSpend > 0) itemsByCategory.push({ label: 'Pet shop', value: shopSpend, detail: `${storeItems.length} producto(s)` })
    }
  }

  return { totalUsd, serviceSpend, shopSpend, itemsByCategory }
}

/** Devuelve el próximo cuidado pendiente de una mascota (por tipo de historia). */
export function getNextPetCare(records: MedicalRecord[]): string {
  if (records.length === 0) return 'Sin atenciones registradas'
  const latest = records[0]
  if (latest.type === 'Vacuna') return `Refuerzo de vacuna · ${latest.title}`
  return `${latest.title} · ${latest.date}`
}

export { getMedicalRecords as getMyMedicalRecords }