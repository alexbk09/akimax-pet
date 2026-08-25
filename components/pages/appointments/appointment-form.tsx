'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock3, Loader2, Stethoscope } from 'lucide-react'
import type { Appointment, Pet, Service, Toast } from '@/lib/types'
import { getServices } from '@/lib/services/catalog'
import { getAvailableSlots, getProfessionals, type TimeSlot } from '@/lib/services/availability'
import { createAppointment } from '@/lib/services/appointments'
import { getMyPets } from '@/lib/services/client-area'

interface AppointmentFormProps {
  customerId: number
  showToast: Toast
  onCreated?: (appointment: Appointment) => void
}

/**
 * Formulario de agendamiento de citas.
 * Selecciona mascota → servicio → profesional → fecha → hora disponible.
 * Las horas disponibles se calculan según el horario del profesional,
 * la duración del servicio y las citas ya reservadas.
 */
export default function AppointmentForm({ customerId, showToast, onCreated }: AppointmentFormProps) {
  const [pets, setPets] = useState<Pet[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<{ id: string; full_name: string }[]>([])
  const [selectedPet, setSelectedPet] = useState<number | ''>('')
  const [selectedService, setSelectedService] = useState<number | ''>('')
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales (mascotas, servicios, profesionales)
  useEffect(() => {
    void (async () => {
      try {
        const [petsData, servicesData, professionalsData] = await Promise.all([
          getMyPets(customerId),
          getServices({ pageSize: 100 }),
          getProfessionals(),
        ])
        setPets(petsData)
        setServices(servicesData.data)
        setProfessionals(professionalsData)
        if (servicesData.data.length > 0) setSelectedService(servicesData.data[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos')
      } finally {
        setLoadingInitial(false)
      }
    })()
  }, [customerId])

  // Cargar slots cuando cambian profesional, fecha o servicio
  useEffect(() => {
    if (!selectedProfessional || !date || !selectedService) {
      setSlots([])
      setSelectedSlot('')
      return
    }
    const service = services.find((item) => item.id === selectedService)
    if (!service) return

    setLoadingSlots(true)
    setSelectedSlot('')
    void getAvailableSlots(selectedProfessional, date, { id: service.id, duration_minutes: service.duration_minutes ?? 30 })
      .then((result) => setSlots(result.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedProfessional, date, selectedService, services])

  const minDate = new Date().toISOString().slice(0, 10)

  /** Guarda la cita seleccionada. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedPet || !selectedService || !selectedProfessional || !date || !selectedSlot) {
      setError('Completa mascota, servicio, profesional, fecha y hora')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const appointment = await createAppointment({
        customer_id: customerId,
        pet_id: Number(selectedPet),
        service_id: Number(selectedService),
        professional_id: selectedProfessional,
        date,
        time: selectedSlot,
        end_time: slots.find((slot) => slot.time === selectedSlot)?.endTime ?? null,
        status: 'Confirmada',
        notes: notes.trim() || null,
      })
      showToast('Cita reservada correctamente')
      onCreated?.(appointment)
      setSelectedPet('')
      setDate('')
      setSelectedSlot('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar la cita')
    } finally {
      setSaving(false)
    }
  }

  /** Formatea "HH:MM" a formato amigable (ej. 08:00 AM). */
  function formatSlot(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`
  }

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#0d5c5b]" />
      </div>
    )
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-[#e1ebe6]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f4f8f5] text-[#829990]"><Stethoscope className="size-6" /></span>
        <h3 className="mt-4 font-serif text-xl font-bold text-[#173b3b]">Primero registra tu mascota</h3>
        <p className="mt-2 max-w-md text-sm text-[#78918a]">Necesitamos al menos una mascota registrada para poder agendar su cita.</p>
        <button onClick={() => showToast('Dirígete a Mis mascotas para registrarla')} className="mt-6 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">Registrar mascota</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <p className="rounded-xl bg-[#fbede7] px-4 py-3 text-sm font-semibold text-[#b56a51]">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">¿Quién es el paciente? *</span>
          <select value={selectedPet} onChange={(event) => setSelectedPet(event.target.value === '' ? '' : Number(event.target.value))} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]">
            <option value="">Selecciona tu mascota...</option>
            {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Servicio *</span>
          <select value={selectedService} onChange={(event) => setSelectedService(event.target.value === '' ? '' : Number(event.target.value))} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]">
            <option value="">Selecciona el servicio...</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name} · {service.duration}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Profesional *</span>
        <div className="flex flex-wrap gap-2">
          {professionals.length === 0 && (
            <p className="text-sm text-[#829990]">No hay veterinarios registrados aún.</p>
          )}
          {professionals.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => { setSelectedProfessional(prof.id); setSelectedSlot(''); setSlots([]) }}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${selectedProfessional === prof.id ? 'bg-[#0d5c5b] text-white' : 'bg-white text-[#5f7a71] ring-1 ring-[#e1ebe6] hover:ring-[#9ec6b0]'}`}
            >
              {prof.full_name}
            </button>
          ))}
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Fecha *</span>
        <div className="relative max-w-md">
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
          <input type="date" min={minDate} value={date} onChange={(event) => { setDate(event.target.value); setSelectedSlot('') }} className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]" />
        </div>
      </label>

      {selectedProfessional && date && selectedService && (
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#5f7a71]">
            <Clock3 className="size-3.5" /> Horas disponibles
          </span>
          {loadingSlots ? (
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-4 text-sm text-[#78918a] ring-1 ring-[#e1ebe6]">
              <Loader2 className="size-4 animate-spin text-[#0d5c5b]" /> Calculando disponibilidad...
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-4 text-sm text-[#829990] ring-1 ring-[#e1ebe6]">No hay horarios disponibles para esta combinación.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                    !slot.available
                      ? 'cursor-not-allowed bg-[#f4f6f4] text-[#c0cdc8] line-through'
                      : selectedSlot === slot.time
                        ? 'bg-[#0d5c5b] text-white'
                        : 'bg-white text-[#0d5c5b] ring-1 ring-[#e1ebe6] hover:ring-[#9ec6b0]'
                  }`}
                >
                  {formatSlot(slot.time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Notas (opcional)</span>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Cuéntanos algo que debamos saber..." className="w-full resize-none rounded-xl border-0 bg-white px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
      </label>

      <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50">
        {saving && <Loader2 className="size-4 animate-spin" />}
        Reservar cita
      </button>
    </form>
  )
}