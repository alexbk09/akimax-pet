'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight, HeartPulse, Plus } from 'lucide-react'
import type { Toast } from '@/lib/types'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'
import { getPets, getMedicalRecords } from '@/lib/services/customers'
import { PageLoader, EmptyState } from '@/components/ui'
import type { MedicalRecord, Pet } from '@/lib/types'

/**
 * Módulo de pacientes conectado a Supabase.
 * Carga mascotas con su dueño y la historia clínica de la seleccionada.
 */
export default function PatientsPage({ showToast }: { showToast: Toast }) {
  const [pets, setPets] = useState<(Pet & { customer_name: string })[]>([])
  const [history, setHistory] = useState<MedicalRecord[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPets({ pageSize: 50 })
      setPets(result.data)
      if (result.data.length > 0 && selected === null) {
        const first = result.data[0]
        setSelected(first.id)
        void loadHistory(first.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las mascotas')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected === null])

  const loadHistory = useCallback(async (petId: number) => {
    try {
      const records = await getMedicalRecords(petId)
      setHistory(records)
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    void loadPets()
  }, [loadPets])

  const activePet = pets.find((pet) => pet.id === selected) ?? null

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Mi familia"
        title="Mis mascotas"
        description="Sus historias, vacunas y próximos cuidados en un solo lugar."
        action={<button onClick={() => showToast('Formulario para registrar mascota abierto')} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Agregar mascota</button>}
      />

      {loading ? (
        <PageLoader label="Cargando pacientes..." />
      ) : error && pets.length === 0 ? (
        <EmptyState title="No pudimos cargar los pacientes" description={error} />
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-4">
            {pets.map((pet, index) => (
              <button
                key={pet.id}
                onClick={() => { setSelected(pet.id); void loadHistory(pet.id) }}
                className={`rounded-3xl bg-white p-5 text-left ring-1 transition-all ${selected === pet.id ? 'ring-[#9fc9b5] shadow-md' : 'ring-[#e1ebe6]'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex size-14 items-center justify-center rounded-2xl ${pet.color ?? 'bg-[#e7f0df]'} font-serif font-bold text-[#477267]`}>{pet.name.slice(0, 2).toUpperCase()}</span>
                  <span>
                    <b className="font-serif text-xl text-[#173b3b]">{pet.name}</b>
                    <span className="mt-1 block text-sm text-[#829990]">{pet.species}{pet.customer_name ? ` · ${pet.customer_name}` : ''}</span>
                  </span>
                  <ChevronRight className="ml-auto size-5 text-[#a0b5ac]" />
                </div>
                <p className="mt-5 border-t border-[#edf1ee] pt-4 text-xs text-[#829990]">{pet.last ?? 'Sin citas previas'}</p>
              </button>
            ))}
            {pets.length === 0 && !loading && <EmptyState title="Aún no hay pacientes" description="Agrega tu primera mascota para comenzar." />}
          </div>

          <section className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
            {activePet ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Historia clínica</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-[#173b3b]">{activePet.name}</h2>
                    <p className="mt-1 text-sm text-[#829990]">{activePet.species}{activePet.breed ? ` · ${activePet.breed}` : ''}{activePet.weight_kg ? ` · ${activePet.weight_kg} kg` : ''}</p>
                  </div>
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]"><HeartPulse className="size-6" /></span>
                </div>
                <div className="mt-8 flex flex-col gap-7 border-l border-[#dce7e2] pl-6">
                  {history.length > 0 ? history.map((record) => (
                    <div key={record.id} className="relative">
                      <span className="absolute -left-[31px] top-1 size-2.5 rounded-full bg-[#d37c52] ring-4 ring-white" />
                      <p className="text-xs font-bold text-[#d37c52]">{record.date}</p>
                      <h3 className="mt-1 font-serif text-xl font-bold text-[#173b3b]">{record.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#78918a]">{record.detail}</p>
                    </div>
                  )) : (
                    <p className="py-6 text-center text-sm text-[#78918a]">Sin registros clínicos aún.</p>
                  )}
                </div>
              </>
            ) : (
              <EmptyState title="Selecciona una mascota" description="Elige una mascota para ver su historia clínica." />
            )}
          </section>
        </div>
      )}
    </PageContainer>
  )
}