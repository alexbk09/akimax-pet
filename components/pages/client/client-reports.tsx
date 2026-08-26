'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, CircleDollarSign, Download, FileBarChart, HeartPulse, PawPrint, ShoppingBag, Syringe } from 'lucide-react'
import { getMyCustomer, getMyPets, getMyAllAppointments, getMySpending, getMyMedicalRecords } from '@/lib/services'
import type { MyAppointment } from '@/lib/services/client-area'
import type { MedicalRecord, Pet, Toast } from '@/lib/types'
import { PageLoader, EmptyState } from '@/components/ui'

interface Spending {
  totalUsd: number
  serviceSpend: number
  shopSpend: number
  itemsByCategory: { label: string; value: number; detail: string }[]
}

const EMPTY_SPENDING: Spending = { totalUsd: 0, serviceSpend: 0, shopSpend: 0, itemsByCategory: [] }

/** Informes del cliente: historial de citas, gastos y salud de mascotas. */
export default function ClientReports({ showToast }: { showToast: Toast }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [spending, setSpending] = useState<Spending>(EMPTY_SPENDING)
  const [records, setRecords] = useState<Record<number, MedicalRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const customer = await getMyCustomer()
      if (!customer) { setLoading(false); return }
      const [petsData, appointmentsData, spendingData] = await Promise.all([
        getMyPets(customer.id), getMyAllAppointments(customer.id), getMySpending(customer.id),
      ])
      setPets(petsData); setAppointments(appointmentsData); setSpending(spendingData)
      const recordsMap: Record<number, MedicalRecord[]> = {}
      await Promise.all(petsData.map(async (pet) => {
        try { recordsMap[pet.id] = await getMyMedicalRecords(pet.id) } catch { recordsMap[pet.id] = [] }
      }))
      setRecords(recordsMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus informes')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadAll() }, [loadAll])

  const completed = appointments.filter((a) => a.status === 'Completada')
  const upcoming = appointments.filter((a) => a.status === 'Confirmada' || a.status === 'En espera')
  const cancelled = appointments.filter((a) => a.status === 'Cancelada')
  const totalRecords = Object.values(records).reduce((sum, list) => sum + list.length, 0)
  const avgTicket = completed.length > 0 ? spending.totalUsd / completed.length : 0

  const petHealth = useMemo(() => pets.map((pet) => {
    const list = records[pet.id] ?? []
    return { pet, vaccines: list.filter((r) => r.type === 'Vacuna').length, controls: list.filter((r) => r.type === 'Control' || r.type === 'Desparasitación').length, total: list.length }
  }), [pets, records])

  function exportReport() {
    const lines = [
      'INFORME DEL CLIENTE — akimax pet',
      `Generado: ${new Date().toLocaleDateString('es-ES')}`,
      '',
      `Total invertido: $${spending.totalUsd.toFixed(2)}`,
      `Servicios: $${spending.serviceSpend.toFixed(2)}`,
      `Pet shop: $${spending.shopSpend.toFixed(2)}`,
      '',
      `Mascotas registradas: ${pets.length}`,
      `Citas completadas: ${completed.length}`,
      `Citas próximas: ${upcoming.length}`,
      '',
      'HISTORIAL DE CITAS:',
      ...appointments.map((a) => `- ${a.date} ${a.time} | ${a.service_name} | ${a.pet_name} | ${a.status}`),
      '',
      'GASTOS POR CATEGORÍA:',
      ...spending.itemsByCategory.map((item) => `- ${item.label}: $${item.value.toFixed(2)} (${item.detail})`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `informe-cliente-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Informe exportado correctamente')
  }

  if (loading) return <PageLoader label="Preparando tus informes..." />
  if (error) {
    return <EmptyState title="No pudimos cargar tus informes" description={error} action={<button onClick={() => void loadAll()} className="rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">Reintentar</button>} />
  }

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Tus informes</p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#173b3b]">Resumen de tu actividad</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#78918a]">Historial de citas, gastos y salud de tus mascotas en un solo reporte.</p>
        </div>
        <button onClick={exportReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          <Download className="size-4" /> Exportar informe
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total invertido" value={`$${spending.totalUsd.toFixed(2)}`} detail="Histórico de compras y servicios" icon={CircleDollarSign} />
        <Kpi label="Citas completadas" value={String(completed.length)} detail={`${upcoming.length} próximas · ${cancelled.length} canceladas`} icon={CalendarDays} />
        <Kpi label="Mascotas registradas" value={String(pets.length)} detail={`${totalRecords} atenciones en historial`} icon={PawPrint} />
        <Kpi label="Ticket promedio" value={`$${avgTicket.toFixed(2)}`} detail="Por cita completada" icon={FileBarChart} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]"><CircleDollarSign className="size-5" /></span>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#173b3b]">Gastos por categoría</h3>
              <p className="text-xs text-[#8aa096]">Servicios veterinarios y pet shop</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            <Bar label="Servicios veterinarios" value={spending.serviceSpend} color="bg-[#0d5c5b]" icon={<HeartPulse className="size-4" />} />
            <Bar label="Pet shop" value={spending.shopSpend} color="bg-[#e1a175]" icon={<ShoppingBag className="size-4" />} />
          </div>
          {spending.itemsByCategory.length === 0 && (
            <p className="mt-6 rounded-xl bg-[#f5f8f5] px-4 py-3 text-sm text-[#78918a]">Aún no hay gastos registrados para mostrar.</p>
          )}
        </article>

        <article className="rounded-3xl bg-[#173b3b] p-6 text-white shadow-sm md:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-[#b5d8bf]"><Syringe className="size-5" /></span>
            <div>
              <h3 className="font-serif text-xl font-bold">Salud por mascota</h3>
              <p className="text-xs text-[#bfd5cb]">Vacunas, controles y atenciones</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {petHealth.length > 0 ? petHealth.map(({ pet, vaccines, controls, total }) => (
              <div key={pet.id} className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-10 items-center justify-center rounded-xl ${pet.color ?? 'bg-white/10'} text-[#0d5c5b]`}><PawPrint className="size-4" /></span>
                    <div>
                      <p className="font-semibold">{pet.name}</p>
                      <p className="text-xs text-[#bfd5cb]">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                    </div>
                  </div>
                  <b className="text-sm text-[#b5d8bf]">{total} atención(es)</b>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#b5d8bf]">{vaccines} Vacunas</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#bfd5cb]">{controls} Controles</span>
                </div>
              </div>
            )) : (
              <p className="rounded-2xl bg-white/5 p-4 text-sm text-[#bfd5cb]">Registra una mascota para ver su informe de salud.</p>
            )}
          </div>
        </article>
      </div>

      <article className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#e1ebe6]">
        <div className="flex flex-col gap-3 border-b border-[#e8efeb] px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#173b3b]">Historial de citas</h3>
            <p className="mt-1 text-sm text-[#78918a]">{appointments.length} registros · ordenados del más reciente al más antiguo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#e4f1e6] px-3 py-1.5 text-xs font-bold text-[#4d8663]">{completed.length} Completadas</span>
            <span className="rounded-full bg-[#e7f1eb] px-3 py-1.5 text-xs font-bold text-[#0d5c5b]">{upcoming.length} Próximas</span>
            {cancelled.length > 0 && <span className="rounded-full bg-[#fbede7] px-3 py-1.5 text-xs font-bold text-[#b56a51]">{cancelled.length} Canceladas</span>}
          </div>
        </div>
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f6f9f6] text-xs uppercase tracking-wide text-[#89a198]">
                <tr>{['Fecha', 'Hora', 'Servicio', 'Mascota', 'Profesional', 'Estado'].map((head) => <th key={head} className="px-6 py-3 font-bold">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#edf2ee]">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="text-[#52756c]">
                    <td className="whitespace-nowrap px-6 py-4">{formatDay(appointment.date)}</td>
                    <td className="px-6 py-4">{formatTime(appointment.time)}</td>
                    <td className="px-6 py-4 font-semibold text-[#173b3b]">{appointment.service_name}</td>
                    <td className="px-6 py-4">{appointment.pet_name}</td>
                    <td className="px-6 py-4">{appointment.professional_name || '—'}</td>
                    <td className="px-6 py-4"><AppointmentBadge status={appointment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6"><EmptyState title="Sin citas registradas" description="Cuando tengas citas aparecerán aquí con su estado y detalle." /></div>
        )}
      </article>
    </section>
  )
}

function Kpi({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof CircleDollarSign }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#8aa096]">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b]"><Icon className="size-4" /></span>
      </div>
      <b className="mt-5 block font-serif text-3xl text-[#173b3b]">{value}</b>
      <span className="mt-1 block text-xs font-semibold text-[#6f9c82]">{detail}</span>
    </article>
  )
}

function Bar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold text-[#52756c]">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#e7f1eb] text-[#0d5c5b]">{icon}</span>
          {label}
        </span>
        <div className="text-right">
          <b className="block text-[#173b3b]">${value.toFixed(2)}</b>
          <span className="text-xs text-[#8aa096]">del total</span>
        </div>
      </div>
      <div className="mt-2 h-2.5 rounded-full bg-[#edf2ee]">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(2, (value / Math.max(value, 1)) * 100))}%` }} />
      </div>
    </div>
  )
}

function AppointmentBadge({ status }: { status: string }) {
  const tone = status === 'Completada' ? 'bg-[#e4f1e6] text-[#4d8663]' : status === 'Cancelada' ? 'bg-[#fbede7] text-[#b56a51]' : 'bg-[#e7f1eb] text-[#0d5c5b]'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{status}</span>
}

function formatDay(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = Number(h)
  const suffix = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${m} ${suffix}`
}