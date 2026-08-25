'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { ProfessionalSchedule, Toast } from '@/lib/types'
import { getProfessionals, dayOfWeekName } from '@/lib/services/availability'
import { getAllSchedules, upsertSchedule } from '@/lib/services/pets-schedule'
import { PageLoader } from '@/components/ui'

const DAYS = Array.from({ length: 7 }, (_, index) => index)

/**
 * Gestor de horarios de profesionales (vet/admin).
 * Permite configurar día a día la hora de entrada y salida
 * de cada veterinario para calcular la disponibilidad de citas.
 */
export default function ScheduleManager({ showToast }: { showToast: Toast }) {
  const [professionals, setProfessionals] = useState<{ id: string; full_name: string }[]>([])
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([])
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [drafts, setDrafts] = useState<Record<string, { start_time: string; end_time: string; is_working: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadAll = useCallback(async (professionalId: string) => {
    try {
      const [professionalsData, schedulesData] = await Promise.all([
        getProfessionals(),
        getAllSchedules(),
      ])
      setProfessionals(professionalsData)
      setSchedules(schedulesData)
      // Reiniciar borradores para el profesional seleccionado
      const nextDrafts: Record<string, { start_time: string; end_time: string; is_working: boolean }> = {}
      for (const day of DAYS) {
        const existing = schedulesData.find((schedule) => schedule.professional_id === professionalId && schedule.day_of_week === day)
        nextDrafts[String(day)] = {
          start_time: existing?.start_time ?? '08:00',
          end_time: existing?.end_time ?? '18:00',
          is_working: existing?.is_working ?? true,
        }
      }
      setDrafts(nextDrafts)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudieron cargar los horarios')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (selectedProfessional) void loadAll(selectedProfessional)
    else setLoading(false)
  }, [selectedProfessional, loadAll])

  /** Guarda todos los horarios del profesional seleccionado. */
  async function handleSaveAll() {
    if (!selectedProfessional) return
    setSaving(true)
    try {
      for (const day of DAYS) {
        const draft = drafts[String(day)]
        if (!draft) continue
        await upsertSchedule({
          professional_id: selectedProfessional,
          day_of_week: day,
          start_time: draft.start_time,
          end_time: draft.end_time,
          is_working: draft.is_working,
        })
      }
      showToast('Horarios guardados correctamente')
      void loadAll(selectedProfessional)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudieron guardar los horarios')
    } finally {
      setSaving(false)
    }
  }

  /** Actualiza un borrador por día. */
  function updateDraft(day: number, patch: Partial<{ start_time: string; end_time: string; is_working: boolean }>) {
    setDrafts((current) => ({
      ...current,
      [String(day)]: { ...current[String(day)], ...patch },
    }))
  }

  if (loading) return <PageLoader label="Cargando horarios..." />

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Agenda</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">Horarios de profesionales</h3>
          <p className="mt-1 text-sm text-[#78918a]">Define las horas de atención de cada veterinario. Las citas se calculan según estos rangos.</p>
        </div>
      </div>

      {/* Selector de profesional */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((prof) => (
          <button
            key={prof.id}
            onClick={() => setSelectedProfessional(prof.id)}
            className={`rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors ${selectedProfessional === prof.id ? 'bg-[#0d5c5b] text-white' : 'bg-[#f4f8f5] text-[#5f7a71] ring-1 ring-[#e1ebe6] hover:ring-[#9ec6b0]'}`}
          >
            {prof.full_name}
          </button>
        ))}
        {professionals.length === 0 && (
          <p className="text-sm text-[#829990]">No hay veterinarios registrados aún. Asigna el rol Veterinario a un usuario para configurar su horario.</p>
        )}
      </div>

      {selectedProfessional && (
        <>
          <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-[#e1ebe6]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f4f8f5] text-xs font-bold uppercase tracking-wide text-[#5f7a71]">
                  <th className="px-4 py-3">Día</th>
                  <th className="px-4 py-3">Atiende</th>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Salida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2ee]">
                {DAYS.map((day) => {
                  const draft = drafts[String(day)]
                  if (!draft) return null
                  return (
                    <tr key={day} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-[#173b3b]">{dayOfWeekName(day)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateDraft(day, { is_working: !draft.is_working })}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${draft.is_working ? 'bg-[#e7f1eb] text-[#0d5c5b]' : 'bg-[#f4f6f4] text-[#829990]'}`}
                        >
                          {draft.is_working ? 'Sí' : 'No'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input type="time" value={draft.start_time} disabled={!draft.is_working} onChange={(event) => updateDraft(day, { start_time: event.target.value })} className="rounded-lg border-0 bg-[#f6f8f6] px-3 py-2 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0] disabled:opacity-40" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="time" value={draft.end_time} disabled={!draft.is_working} onChange={(event) => updateDraft(day, { end_time: event.target.value })} className="rounded-lg border-0 bg-[#f6f8f6] px-3 py-2 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0] disabled:opacity-40" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={() => void handleSaveAll()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Guardar horarios
            </button>
          </div>
        </>
      )}
    </div>
  )
}