'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, ChevronRight, CircleDollarSign, HeartPulse, Loader2, PawPrint, Plus, ShoppingBag, Syringe } from 'lucide-react'
import { useAuth } from '@/lib/hooks'
import { createMyPet, getMyCustomer, getMyPets, getMySpending, getMyUpcomingAppointments, getNextPetCare, getMyMedicalRecords } from '@/lib/services'
import type { MyAppointment } from '@/lib/services/client-area'
import type { MedicalRecord, Pet, SetView, Toast } from '@/lib/types'
import { PageLoader, EmptyState } from '@/components/ui'

/** Dashboard del cliente autenticado conectado a Supabase. */
export default function ClientPage({ setView, showToast }: { setView: SetView; showToast: Toast }) {
  const { profile } = useAuth()
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [spending, setSpending] = useState({ totalUsd: 0, serviceSpend: 0, shopSpend: 0, itemsByCategory: [] as { label: string; value: number; detail: string }[] })
  const [records, setRecords] = useState<Record<number, MedicalRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddPet, setShowAddPet] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const customer = await getMyCustomer()
      if (!customer) {
        setLoading(false)
        return
      }
      setCustomerId(customer.id)
      const [petsData, appointmentsData, spendingData] = await Promise.all([
        getMyPets(customer.id),
        getMyUpcomingAppointments(customer.id),
        getMySpending(customer.id),
      ])
      setPets(petsData)
      setAppointments(appointmentsData)
      setSpending(spendingData)

      // Cargar historias clínicas de cada mascota para el próximo cuidado
      const recordsMap: Record<number, MedicalRecord[]> = {}
      await Promise.all(petsData.map(async (pet) => {
        try {
          recordsMap[pet.id] = await getMyMedicalRecords(pet.id)
        } catch {
          recordsMap[pet.id] = []
        }
      }))
      setRecords(recordsMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cliente'
  const nextAppointment = appointments[0]
  const totalMonth = spending.totalUsd

  async function handleAddPet(input: { name: string; species: string; breed: string; birth_date: string; weight_kg: string; color: string }) {
    if (!customerId) return
    try {
      await createMyPet(customerId, {
        name: input.name.trim(),
        species: input.species.trim(),
        breed: input.breed.trim() || null,
        birth_date: input.birth_date || null,
        weight_kg: input.weight_kg ? Number(input.weight_kg) : null,
        color: input.color || null,
      })
      setShowAddPet(false)
      showToast(`${input.name.trim()} agregado(a) a tu familia`)
      await loadAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No pudimos agregar la mascota')
    }
  }

  if (loading) return <PageLoader label="Cargando tu espacio..." />
  if (error && pets.length === 0) {
    return (
      <div className="mx-auto max-w-[1000px] px-6 py-12">
        <EmptyState title="No pudimos cargar tus datos" description={error} action={<button onClick={() => void loadAll()} className="rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">Reintentar</button>} />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Mi espacio</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173b3b]">Hola, {firstName}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#78918a]">Todo lo importante de tus mascotas, reunido en un solo lugar.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setView('perfil')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0d5c5b] ring-1 ring-[#e1ebe6]">Mi perfil</button>
          <button onClick={() => setView('citas')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Agendar cita</button>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Mascotas" value={String(pets.length)} detail={pets.length === 1 ? 'En tu familia' : 'En tu familia'} icon={PawPrint} />
        <Summary label="Próxima cita" value={nextAppointment ? formatDay(nextAppointment.date) : '—'} detail={nextAppointment ? nextAppointment.service_name : 'Sin citas próximas'} icon={CalendarDays} />
        <Summary label="Invertido" value={`$${totalMonth.toFixed(2)}`} detail="En cuidados y compras" icon={CircleDollarSign} />
        <Summary label="Cuidados al día" value={String(pets.filter((pet) => getNextPetCare(records[pet.id] ?? []).startsWith('Refuerzo')).length)} detail="Vacunas por reforzar" icon={Syringe} />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <SectionHeading eyebrow="Mi familia" title={`Mis mascotas (${pets.length})`} action={<button onClick={() => setShowAddPet(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0d5c5b]"><Plus className="size-4" /> Agregar</button>} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {pets.length > 0 ? pets.map((pet) => (
              <article key={pet.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]">
                <div className="flex items-start justify-between">
                  <span className={`flex size-14 items-center justify-center rounded-2xl ${pet.color ?? 'bg-[#e7f0df]'} text-[#0d5c5b]`}><PawPrint className="size-6" /></span>
                  <button onClick={() => setView('pacientes')} aria-label={`Ver ficha de ${pet.name}`} className="rounded-xl p-2 text-[#8aa096] hover:bg-[#f1f6f2]"><ChevronRight className="size-4" /></button>
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold text-[#173b3b]">{pet.name}</h3>
                <p className="mt-1 text-sm text-[#78918a]">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                <div className="mt-5 border-t border-[#e7eee9] pt-4 text-xs">
                  <span className="font-bold uppercase tracking-wide text-[#9aafa7]">Próximo cuidado</span>
                  <p className="mt-1 font-semibold text-[#52756c]">{getNextPetCare(records[pet.id] ?? [])}</p>
                </div>
              </article>
            )) : (
              <div className="sm:col-span-2">
                <EmptyState title="Aún no tienes mascotas" description="Agrega tu primera mascota para empezar." action={<button onClick={() => setShowAddPet(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-2.5 text-sm font-bold text-white"><Plus className="size-4" /> Agregar mascota</button>} />
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="Agenda" title="Próximas citas" action={<button onClick={() => setView('citas')} className="flex items-center gap-1 text-sm font-bold text-[#0d5c5b]">Ver agenda <ChevronRight className="size-4" /></button>} />
          <div className="mt-5 flex flex-col gap-3">
            {appointments.length > 0 ? appointments.slice(0, 4).map((appointment) => (
              <article key={appointment.id} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#e1ebe6]">
                <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#e7f1eb] py-3 text-center">
                  <b className="text-xs font-bold text-[#0d5c5b]">{formatDay(appointment.date)}</b>
                  <span className="mt-1 text-[10px] font-semibold text-[#78918a]">{formatTime(appointment.time)}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#173b3b]">{appointment.service_name}</h3>
                  <p className="mt-1 text-sm text-[#78918a]">{appointment.pet_name}{appointment.professional_name ? ` · ${appointment.professional_name}` : ''}</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#f1f6f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#648278]">{appointment.status}</span>
                </div>
              </article>
            )) : (
              <EmptyState title="Sin citas próximas" description="Agenda una cita cuando lo necesites." action={<button onClick={() => setView('citas')} className="rounded-xl bg-[#0d5c5b] px-4 py-2.5 text-sm font-bold text-white">Agendar cita</button>} />
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <div>
          <SectionHeading eyebrow="Resumen" title="Tus gastos" />
          <div className="mt-5 flex flex-col gap-3">
            {spending.itemsByCategory.length > 0 ? spending.itemsByCategory.map((expense) => (
              <div key={expense.label} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-[#e1ebe6]">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]">{expense.label.includes('Servicios') ? <HeartPulse className="size-4" /> : <ShoppingBag className="size-4" />}</span>
                  <div><p className="text-sm font-semibold text-[#173b3b]">{expense.label}</p><p className="text-xs text-[#8aa096]">{expense.detail}</p></div>
                </div>
                <b className="text-[#0d5c5b]">${expense.value.toFixed(2)}</b>
              </div>
            )) : (
              <EmptyState title="Sin gastos registrados" description="Tus compras y servicios aparecerán aquí." />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#173b3b] p-7 text-[#eef6ef] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b5d8bf]">Recomendación para ti</p>
          <h2 className="mt-4 max-w-md font-serif text-3xl font-bold">La prevención también es una forma de cariño.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#bfd5cb]">
            {pets.length > 0
              ? `${pets.map((pet) => pet.name).join(', ')} ${pets.length === 1 ? 'tiene' : 'tienen'} espacio en tu agenda para su próximo cuidado. Mantén su historial actualizado y recibe recordatorios.`
              : 'Agrega tu primera mascota y empieza a llevar su salud, vacunas y citas en un mismo lugar.'}
          </p>
          <button onClick={() => setShowAddPet(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e7f1eb] px-4 py-3 text-sm font-bold text-[#0d5c5b]"><Plus className="size-4" /> {pets.length > 0 ? 'Agregar mascota' : 'Registrar mi mascota'}</button>
        </div>
      </section>

      {showAddPet && (
        <AddPetModal
          onClose={() => setShowAddPet(false)}
          onSave={handleAddPet}
        />
      )}
    </main>
  )
}

function Summary({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof PawPrint }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]"><Icon className="size-4" /></span>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#8aa096]">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">{value}</p>
      <p className="mt-1 text-xs text-[#78918a]">{detail}</p>
    </article>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">{eyebrow}</p><h2 className="mt-2 font-serif text-2xl font-bold text-[#173b3b]">{title}</h2></div>
      {action}
    </div>
  )
}

function AddPetModal({ onClose, onSave }: { onClose: () => void; onSave: (input: { name: string; species: string; breed: string; birth_date: string; weight_kg: string; color: string }) => Promise<void> }) {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [color, setColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) { setError('Escribe el nombre de tu mascota.'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({ name, species, breed, birth_date: birthDate, weight_kg: weight, color })
    } catch {
      setError('No pudimos guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-xl border-0 bg-[#f7f9f7] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]"><PawPrint className="size-6" /></span>
          <div><h2 className="font-serif text-2xl font-bold text-[#173b3b]">Nueva mascota</h2><p className="text-sm text-[#78918a]">Cuéntanos sobre tu compañero(a).</p></div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-sm font-semibold text-[#173b3b]">Nombre *</span>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Luna" className={`mt-1.5 ${inputClass}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm font-semibold text-[#173b3b]">Especie</span>
              <select value={species} onChange={(e) => setSpecies(e.target.value)} className={`mt-1.5 ${inputClass}`}>
                <option>Perro</option>
                <option>Gato</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <span className="text-sm font-semibold text-[#173b3b]">Raza</span>
              <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Golden Retriever" className={`mt-1.5 ${inputClass}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-sm font-semibold text-[#173b3b]">Fecha de nacimiento</span>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={`mt-1.5 ${inputClass}`} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#173b3b]">Peso (kg)</span>
              <input type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="12.5" className={`mt-1.5 ${inputClass}`} />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-[#173b3b]">Color / tono</span>
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Dorado" className={`mt-1.5 ${inputClass}`} />
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[#f1f6f2] px-5 py-3 text-sm font-bold text-[#52756c]">Cancelar</button>
          <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function formatDay(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = Number(h)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${m} ${suffix}`
}