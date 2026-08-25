'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'
import AppointmentForm from '@/components/pages/appointments/appointment-form'
import { getMyCustomer, getMyUpcomingAppointments, type MyAppointment } from '@/lib/services/client-area'
import { PageLoader, EmptyState } from '@/components/ui'
import type { Toast } from '@/lib/types'

/**
 * Página de citas: permite al cliente agendar una cita
 * (mascota → servicio → profesional → fecha → hora según disponibilidad)
 * y ver sus próximas citas.
 */
export default function AppointmentsPage({ showToast }: { showToast: Toast }) {
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async (id: number) => {
    try {
      const data = await getMyUpcomingAppointments(id)
      setAppointments(data)
    } catch {
      setAppointments([])
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const customer = await getMyCustomer()
        if (customer) {
          setCustomerId(customer.id)
          await loadAppointments(customer.id)
        } else {
          setError('No encontramos tu perfil de cliente. Completa tu registro para poder agendar.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información')
      } finally {
        setLoading(false)
      }
    })()
  }, [loadAppointments])

  if (loading) return <PageLoader label="Cargando tus citas..." />

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Agenda sin llamadas"
        title="Reserva un momento para ellos"
        description="Elige tu mascota, el servicio y el profesional. Te mostramos las horas realmente disponibles según su agenda."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Formulario */}
        <section className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
          {error ? (
            <p className="rounded-xl bg-[#fbede7] px-4 py-3 text-sm font-semibold text-[#b56a51]">{error}</p>
          ) : customerId ? (
            <AppointmentForm customerId={customerId} showToast={showToast} onCreated={() => void loadAppointments(customerId)} />
          ) : null}
        </section>

        {/* Próximas citas */}
        <aside>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">
            <CalendarCheck className="size-4" /> Próximas citas
          </p>
          {appointments.length === 0 ? (
            <EmptyState title="Sin citas próximas" description="Cuando reserves, tus citas aparecerán aquí." />
          ) : (
            <div className="flex flex-col gap-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl bg-white p-4 ring-1 ring-[#e1ebe6]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#d37c52]">{appointment.service_name}</p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#173b3b]">{appointment.pet_name}</h3>
                  <p className="mt-1 text-sm text-[#78918a]">
                    {appointment.date} · {appointment.time}
                    {appointment.professional_name ? ` · ${appointment.professional_name}` : ''}
                  </p>
                  <span className="mt-3 inline-block rounded-lg bg-[#e7f1eb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0d5c5b]">{appointment.status}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  )
}