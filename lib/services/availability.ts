import { supabase } from '@/lib/supabase/client'
import type { Appointment, ProfessionalSchedule, Service } from '@/lib/types'

export interface TimeSlot {
  time: string
  endTime: string
  available: boolean
}

export interface AvailabilityResult {
  slots: TimeSlot[]
  professionalId: string | null
  schedule: ProfessionalSchedule | null
}

const DEFAULT_START = '08:00'
const DEFAULT_END = '18:00'
const DEFAULT_SLOT_MINUTES = 30

/** Convierte "HH:MM" a minutos desde medianoche. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + (minutes || 0)
}

/** Convierte minutos desde medianoche a "HH:MM". */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Convierte day_of_week JS (0=Dom..6=Sáb) a nombre en español. */
export function dayOfWeekName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[day] ?? ''
}

/**
 * Calcula los slots disponibles para un profesional en una fecha concreta.
 * Usa su horario del día, la duración del servicio y descarta las citas
 * ya reservadas en ese rango (incluyendo status diferentes a Cancelada).
 */
export async function getAvailableSlots(
  professionalId: string,
  date: string,
  service: Pick<Service, 'id' | 'duration_minutes'>,
): Promise<AvailabilityResult> {
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay()

  // 1. Horario del profesional para ese día
  const { data: scheduleRows } = await supabase
    .from('professional_schedules')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_working', true)
    .maybeSingle()

  const schedule = (scheduleRows ?? null) as ProfessionalSchedule | null

  // Si el profesional no tiene horario configurado para ese día o no trabaja,
  // no hay disponibilidad (es obligatorio configurar su agenda).
  if (!schedule || !schedule.is_working) {
    return { slots: [], professionalId, schedule }
  }

  const startTime = schedule.start_time ?? DEFAULT_START
  const endTime = schedule.end_time ?? DEFAULT_END
  const durationMinutes = service.duration_minutes ?? DEFAULT_SLOT_MINUTES

  // 2. Citas existentes del profesional ese día (no canceladas)
  const { data: appointmentRows } = await supabase
    .from('appointments')
    .select('time, end_time')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .neq('status', 'Cancelada')

  const appointments = (appointmentRows ?? []) as Pick<Appointment, 'time' | 'end_time'>[]

  // 3. Generar slots cada 30 minutos dentro del horario
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const slots: TimeSlot[] = []

  for (let current = startMinutes; current + durationMinutes <= endMinutes; current += 30) {
    const slotStart = minutesToTime(current)
    const slotEnd = minutesToTime(current + durationMinutes)

    // Verificar si el slot colisiona con alguna cita existente
    const conflicts = appointments.some((appointment) => {
      const bookedStart = timeToMinutes(appointment.time)
      const bookedEnd = appointment.end_time ? timeToMinutes(appointment.end_time) : bookedStart + durationMinutes
      return current < bookedEnd && (current + durationMinutes) > bookedStart
    })

    slots.push({
      time: slotStart,
      endTime: slotEnd,
      available: !conflicts,
    })
  }

  return { slots, professionalId, schedule }
}

/**
 * Obtiene los profesionales activos para el selector de cita.
 * El área del servicio determina qué profesionales mostrar:
 * 'Veterinaria' → Veterinarios, 'Peluquería' → Peluqueros.
 */
export async function getProfessionals(area?: string): Promise<{ id: string; full_name: string; role: string }[]> {
  let query = supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('active', true)
    .in('role', ['Veterinario', 'Peluquero'])
    .order('full_name')

  if (area === 'Veterinaria') query = query.eq('role', 'Veterinario')
  else if (area === 'Peluquería') query = query.eq('role', 'Peluquero')

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as { id: string; full_name: string; role: string }[]
}
