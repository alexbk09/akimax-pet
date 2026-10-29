import { dataStore } from '@/lib/data-store'
import { fallbackPets, fallbackServices } from '@/lib/mock-data'
import type { Appointment } from '@/lib/types'

const PAGE_SIZE = 20
export interface AppointmentFilters { page?: number; pageSize?: number; status?: string; from?: string; to?: string; customerId?: number; professionalId?: string }

type EnrichedAppointment = Appointment & { pet_name: string; service_name: string; customer_name: string; professional_name: string }
const enrich = (appointment: Appointment): EnrichedAppointment => ({ ...appointment, pet_name: fallbackPets.find((pet) => pet.id === appointment.pet_id)?.name ?? 'Mascota', service_name: fallbackServices.find((service) => service.id === appointment.service_id)?.name ?? 'Servicio', customer_name: 'Cliente local', professional_name: appointment.professional_id === 'vet-1' ? 'Dra. Valentina Rojas' : appointment.professional_id === 'groom-1' ? 'Ana Gómez' : 'Equipo Akimax' })

export async function getAppointments(filters: AppointmentFilters = {}) {
  const { page = 1, pageSize = PAGE_SIZE, ...query } = filters
  const all = (await dataStore.appointments(query)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const start = (page - 1) * pageSize
  return { data: all.slice(start, start + pageSize).map(enrich), count: all.length }
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'> & { end_time?: string | null }) { return dataStore.addAppointment(appointment) }
export async function updateAppointment(id: number, patch: Partial<Appointment>) { const updated = await dataStore.updateAppointment(id, patch); if (!updated) throw new Error('Cita no encontrada'); return updated }
export async function changeAppointmentStatus(id: number, status: Appointment['status']) { await updateAppointment(id, { status }) }
export async function deleteAppointment(id: number) { await dataStore.removeAppointment(id) }
export async function getTodayAppointments() { const today = new Date().toISOString().slice(0, 10); return getAppointments({ from: today, to: today, pageSize: 50 }) }
export async function getAppointmentsByCustomer(customerId: number) { return (await dataStore.appointments({ customerId })).map(enrich) }
