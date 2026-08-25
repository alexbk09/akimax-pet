import { supabase } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/types'

const PAGE_SIZE = 20

export interface AppointmentFilters {
  page?: number
  pageSize?: number
  status?: string
  from?: string
  to?: string
}

/** Obtiene citas con filtros y paginación. */
export async function getAppointments(filters: AppointmentFilters = {}) {
  const { page = 1, pageSize = PAGE_SIZE, status = '', from = '', to = '' } = filters
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  let query = supabase
    .from('appointments')
    .select('*, pets(name), services(name), customers(name), profiles(full_name)', { count: 'exact' })
    .order('date', { ascending: true })
    .range(start, end)

  if (status) query = query.eq('status', status)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map((row) => {
    const raw = row as unknown as {
      pets: { name: string } | null
      services: { name: string } | null
      customers: { name: string } | null
      profiles: { full_name: string } | null
    }
    return {
      ...row,
      pet_name: raw.pets?.name ?? '',
      service_name: raw.services?.name ?? '',
      customer_name: raw.customers?.name ?? 'Cliente mostrador',
      professional_name: raw.profiles?.full_name ?? '',
    }
  })

  return { data: rows as (Appointment & { pet_name: string; service_name: string; customer_name: string; professional_name: string })[], count: count ?? 0 }
}

/** Crea una nueva cita (con hora fin para detectar conflictos). */
export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'> & { end_time?: string | null }): Promise<Appointment> {
  const { data, error } = await supabase.from('appointments').insert(appointment).select().single()
  if (error) throw error
  return data as Appointment
}

/** Actualiza una cita (estado, fecha, notas, hora fin, etc). */
export async function updateAppointment(id: number, patch: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase.from('appointments').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Appointment
}

/** Cambia el estado de una cita. */
export async function changeAppointmentStatus(id: number, status: Appointment['status']): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

/** Elimina una cita. */
export async function deleteAppointment(id: number): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

/** Obtiene las citas del día para el panel operativo. */
export async function getTodayAppointments() {
  const today = new Date().toISOString().slice(0, 10)
  return getAppointments({ from: today, to: today, pageSize: 50 })
}

/** Obtiene las citas de un cliente específico. */
export async function getAppointmentsByCustomer(customerId: number) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('customer_id', customerId)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as (Appointment & { services: { name: string } | null })[]
}