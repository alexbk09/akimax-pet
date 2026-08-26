'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, Loader2, Scissors, Search, Stethoscope } from 'lucide-react'
import type { Appointment, Pet, Service, Toast } from '@/lib/types'
import { getServices } from '@/lib/services/catalog'
import { getAvailableSlots, getProfessionals, type TimeSlot } from '@/lib/services/availability'
import { createAppointment } from '@/lib/services/appointments'
import { getMyPets } from '@/lib/services/client-area'

interface ProfessionalOption {
  id: string
  full_name: string
  role: string
}

const ROLE_LABEL: Record<string, string> = {
  Veterinario: 'Veterinario/a',
  Peluquero: 'Peluquero/a',
}

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
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([])
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
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)

  // Servicios filtrados por el buscador
  const filteredServices = useMemo(() => {
    const term = serviceSearch.trim().toLowerCase()
    if (!term) return services
    return services.filter((service) =>
      service.name.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      service.area.toLowerCase().includes(term)
    )
  }, [services, serviceSearch])

  // Servicio seleccionado (para mostrar duración y área)
  const selectedServiceData = useMemo(
    () => services.find((item) => item.id === selectedService) ?? null,
    [services, selectedService]
  )

  // Cargar datos iniciales (mascotas y servicios)
  useEffect(() => {
    void (async () => {
      try {
        const [petsData, servicesData] = await Promise.all([
          getMyPets(customerId),
          getServices({ pageSize: 100 }),
        ])
        setPets(petsData)
        setServices(servicesData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos')
      } finally {
        setLoadingInitial(false)
      }
    })()
  }, [customerId])

  // Cargar profesionales según el área del servicio seleccionado
  useEffect(() => {
    if (!selectedServiceData) {
      setProfessionals([])
      setSelectedProfessional('')
      return
    }
    setSelectedProfessional('')
    setSelectedSlot('')
    setSlots([])
    void getProfessionals(selectedServiceData.area)
      .then(setProfessionals)
      .catch(() => setProfessionals([]))
  }, [selectedServiceData])

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

  /** Selecciona un servicio y limpia profesional/fecha/hora. */
  function handleSelectService(serviceId: number) {
    setSelectedService(serviceId)
    setServiceDropdownOpen(false)
    setServiceSearch('')
    setSelectedProfessional('')
    setDate('')
    setSelectedSlot('')
    setSlots([])
  }

  /** Formatea "HH:MM" a formato amigable (ej. 08:00 AM). */
  function formatSlot(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`
  }

  /** Formatea minutos a "Xh Ymin" o "Xmin". */
  function formatDuration(minutes?: number): string {
    if (!minutes || minutes <= 0) return 'Duración variable'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`
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

        <div className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Servicio *</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(event) => { setServiceSearch(event.target.value); setServiceDropdownOpen(true) }}
              onFocus={() => setServiceDropdownOpen(true)}
              onBlur={() => setTimeout(() => setServiceDropdownOpen(false), 150)}
              placeholder="Busca un servicio (baño, consulta, vacuna...)"
              className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]"
            />
            {serviceDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#e1ebe6] bg-white p-1.5 shadow-lg">
                {filteredServices.length === 0 && (
                  <p className="px-3 py-2 text-sm text-[#829990]">No se encontraron servicios.</p>
                )}
                {filteredServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onMouseDown={() => handleSelectService(service.id)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${selectedService === service.id ? 'bg-[#e7f1eb]' : 'hover:bg-[#f4f8f5]'}`}
                  >
                    <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${service.area === 'Veterinaria' ? 'bg-[#e7f1eb] text-[#0d5c5b]' : 'bg-[#f2ede5] text-[#b0813f]'}`}>
                      {service.area === 'Veterinaria' ? <Stethoscope className="size-4" /> : <Scissors className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold ${selectedService === service.id ? 'text-[#0d5c5b]' : 'text-[#173b3b]'}`}>
                        {service.name}
                        {selectedService === service.id && <span className="ml-2 text-[10px] uppercase tracking-wide text-[#0d5c5b]">✓ Seleccionado</span>}
                      </span>
                      <span className="block truncate text-xs text-[#78918a]">
                        {service.area} · {formatDuration(service.duration_minutes)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedServiceData && (
            <div className={`mt-2 flex items-start gap-3 rounded-xl px-4 py-3 ${selectedServiceData.area === 'Veterinaria' ? 'bg-[#e7f1eb]' : 'bg-[#f2ede5]'}`}>
              {selectedServiceData.area === 'Veterinaria'
                ? <Stethoscope className="mt-0.5 size-4 shrink-0 text-[#0d5c5b]" />
                : <Scissors className="mt-0.5 size-4 shrink-0 text-[#b0813f]" />}
              <div>
                <p className="text-sm font-bold text-[#173b3b]">{selectedServiceData.name}</p>
                <p className="text-xs text-[#78918a]">{selectedServiceData.area}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-lg bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0d5c5b]">
                ⏱ {formatDuration(selectedServiceData.duration_minutes)}
              </span>
            </div>
          )}
        </div>
      </div>

      {selectedServiceData && (
        <div className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">
            ¿Quién lo atenderá? * <span className="normal-case text-[#829990]">({selectedServiceData.area})</span>
          </span>
          {professionals.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-4 text-sm text-[#829990] ring-1 ring-[#e1ebe6]">
              No hay {selectedServiceData.area === 'Veterinaria' ? 'veterinarios' : 'peluqueros'} registrados. Contacta al equipo por WhatsApp.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => { setSelectedProfessional(prof.id); setSelectedSlot(''); setSlots([]) }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${selectedProfessional === prof.id ? 'bg-[#0d5c5b] text-white' : 'bg-white text-[#5f7a71] ring-1 ring-[#e1ebe6] hover:ring-[#9ec6b0]'}`}
                >
                  {prof.full_name}
                  <span className={`ml-1.5 text-[10px] font-semibold uppercase tracking-wide ${selectedProfessional === prof.id ? 'text-white/70' : 'text-[#829990]'}`}>
                    {ROLE_LABEL[prof.role] ?? ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedProfessional && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Fecha *</span>
          <div className="relative max-w-md">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
            <input type="date" min={minDate} value={date} onChange={(event) => { setDate(event.target.value); setSelectedSlot('') }} className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]" />
          </div>
        </label>
      )}

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