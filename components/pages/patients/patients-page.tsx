'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronRight, HeartPulse, Pencil, Plus, Search } from 'lucide-react'
import type { MedicalRecord, Pet, Toast } from '@/lib/types'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'
import { getPets, getMedicalRecords } from '@/lib/services/customers'
import { getMyCustomer } from '@/lib/services/client-area'
import PetFormModal from '@/components/pages/patients/pet-form-modal'
import { PageLoader, EmptyState, Pagination } from '@/components/ui'

const PAGE_SIZE = 6

/**
 * Módulo de pacientes conectado a Supabase.
 * Carga mascotas con paginación, filtro por nombre,
 * historia clínica de la seleccionada y modal de registro/edición.
 */
export default function PatientsPage({ showToast }: { showToast: Toast }) {
  const [pets, setPets] = useState<(Pet & { customer_name: string; species_name: string | null })[]>([])
  const [history, setHistory] = useState<MedicalRecord[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [myCustomerId, setMyCustomerId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const loadPets = useCallback(async (targetPage: number = 1, term: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const [result, customer] = await Promise.all([
        getPets({ page: targetPage, pageSize: PAGE_SIZE, search: term }),
        getMyCustomer(),
      ])
      setPets(result.data)
      setTotal(result.count)
      setMyCustomerId(customer?.id ?? null)
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
    void loadPets(page, search)
  }, [page, search, loadPets])

  const activePet = pets.find((pet) => pet.id === selected) ?? null
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  /** Abre el modal para nueva mascota. */
  function openCreateModal() {
    setEditingPet(null)
    setModalOpen(true)
  }

  /** Abre el modal para editar una mascota. */
  function openEditModal() {
    if (activePet) {
      setEditingPet(activePet)
      setModalOpen(true)
    }
  }

  /**
   * Recarga la lista tras guardar y selecciona la mascota recién
   * creada/editada para que el detalle se actualice al instante.
   */
  function handleSaved(savedPet: Pet) {
    setModalOpen(false)
    setSelected(savedPet.id)
    void loadPets(page, search).then(() => {
      void loadHistory(savedPet.id)
    })
  }

  /** Cambia de página manteniendo la búsqueda. */
  function changePage(nextPage: number) {
    setPage(nextPage)
    setSelected(null)
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Mi familia"
        title="Mis mascotas"
        description="Sus historias, vacunas y próximos cuidados en un solo lugar."
        action={<button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Agregar mascota</button>}
      />

      {/* Filtro de búsqueda */}
      <div className="relative mt-8 max-w-md">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
        <input
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected(null) }}
          placeholder="Buscar por nombre de mascota..."
          className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]"
        />
      </div>

      {loading ? (
        <div className="mt-6"><PageLoader label="Cargando pacientes..." /></div>
      ) : error && pets.length === 0 ? (
        <div className="mt-6"><EmptyState title="No pudimos cargar los pacientes" description={error} /></div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          {/* Lista con paginación */}
          <div className="flex flex-col gap-4">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => { setSelected(pet.id); void loadHistory(pet.id) }}
                className={`rounded-3xl bg-white p-4 text-left ring-1 transition-all ${selected === pet.id ? 'ring-[#9fc9b5] shadow-md' : 'ring-[#e1ebe6]'}`}
              >
                <div className="flex items-center gap-4">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="size-14 rounded-2xl object-cover" />
                  ) : (
                    <span className={`flex size-14 items-center justify-center rounded-2xl ${pet.color ?? 'bg-[#e7f0df]'} font-serif font-bold text-[#477267]`}>{pet.name.slice(0, 2).toUpperCase()}</span>
                  )}
                  <span>
                    <b className="font-serif text-xl text-[#173b3b]">{pet.name}</b>
                    <span className="mt-1 block text-sm text-[#829990]">{pet.species_name ?? pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</span>
                  </span>
                  <ChevronRight className="ml-auto size-5 text-[#a0b5ac]" />
                </div>
                <p className="mt-4 border-t border-[#edf1ee] pt-3 text-xs text-[#829990]">{pet.last ?? 'Sin citas previas'}</p>
              </button>
            ))}
            {pets.length === 0 && !loading && <EmptyState title="Sin mascotas" description="Agrega tu primera mascota o prueba otra búsqueda." />}
            <Pagination page={page} totalPages={totalPages} totalItems={total} pageSize={PAGE_SIZE} onPageChange={changePage} />
          </div>

          {/* Detalle e historia clínica */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
            {activePet ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Historia clínica</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-[#173b3b]">{activePet.name}</h2>
                    <p className="mt-1 text-sm text-[#829990]">{activePet.species_name ?? activePet.species}{activePet.breed ? ` · ${activePet.breed}` : ''}{activePet.weight_kg ? ` · ${activePet.weight_kg} kg` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={openEditModal} className="rounded-xl bg-[#f4f8f5] p-2.5 text-[#0d5c5b] ring-1 ring-[#e1ebe6] transition-colors hover:bg-[#e7f1eb]" aria-label="Editar mascota">
                      <Pencil className="size-4" />
                    </button>
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]"><HeartPulse className="size-5" /></span>
                  </div>
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

      {modalOpen && (
        <PetFormModal
          pet={editingPet}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
          showToast={showToast}
        />
      )}
    </PageContainer>
  )
}