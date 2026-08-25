'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Species, Toast } from '@/lib/types'
import { createSpecies, deleteSpecies, getSpecies, updateSpecies } from '@/lib/services/pets-schedule'
import { PageLoader, EmptyState } from '@/components/ui'

/**
 * Gestor de especies (staff/admin).
 * Permite crear, editar y desactivar especies que se usan
 * en el registro de mascotas y para recomendar alimentos/medicamentos.
 */
export default function SpeciesManager({ showToast }: { showToast: Toast }) {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSpecies = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getSpecies()
      setSpecies(list)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudieron cargar las especies')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadSpecies()
  }, [loadSpecies])

  /** Inicia la edición de una especie. */
  function startEdit(item: Species) {
    setEditingId(item.id)
    setDraftName(item.name)
    setDraftDescription(item.description)
  }

  /** Guarda una especie nueva o editada. */
  async function handleSave(item: Species | null) {
    if (!draftName.trim()) {
      showToast('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const slug = draftName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      if (item) {
        await updateSpecies(item.id, { name: draftName.trim(), slug, description: draftDescription.trim() })
        showToast('Especie actualizada')
      } else {
        await createSpecies({ name: draftName.trim(), slug, description: draftDescription.trim(), icon: 'paw-print', status: 'Activo' })
        showToast('Especie creada')
      }
      setEditingId(null)
      setCreating(false)
      setDraftName('')
      setDraftDescription('')
      void loadSpecies()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo guardar la especie')
    } finally {
      setSaving(false)
    }
  }

  /** Desactiva una especie. */
  async function handleToggle(item: Species) {
    try {
      await updateSpecies(item.id, { status: item.status === 'Activo' ? 'Inactivo' : 'Activo' })
      void loadSpecies()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar el estado')
    }
  }

  /** Elimina una especie. */
  async function handleDelete(item: Species) {
    if (!window.confirm(`¿Eliminar la especie "${item.name}"?`)) return
    try {
      await deleteSpecies(item.id)
      showToast('Especie eliminada')
      void loadSpecies()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar la especie')
    }
  }

  if (loading) return <PageLoader label="Cargando especies..." />

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Catálogo</p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">Especies</h3>
          <p className="mt-1 text-sm text-[#78918a]">Usadas en el registro de mascotas y para sugerir alimentos y medicamentos.</p>
        </div>
        <button onClick={() => { setCreating(true); setEditingId(null); setDraftName(''); setDraftDescription('') }} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="size-4" /> Nueva especie
        </button>
      </div>

      {(creating || editingId !== null) && (
        <div className="mt-5 rounded-2xl bg-[#f4f8f5] p-4 ring-1 ring-[#dce7e2]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Nombre *</span>
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Ej. Hurón" className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Descripción</span>
              <input value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder="Recomendaciones y cuidados..." className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => handleSave(editingId ? species.find((item) => item.id === editingId) ?? null : null)} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />}
              <Check className="size-4" /> Guardar
            </button>
            <button onClick={() => { setCreating(false); setEditingId(null); setDraftName(''); setDraftDescription('') }} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#5f7a71] ring-1 ring-[#e1ebe6]">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {species.length === 0 ? (
        <div className="mt-6"><EmptyState title="Sin especies" description="Agrega la primera especie del catálogo." /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-[#e1ebe6]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f4f8f5] text-xs font-bold uppercase tracking-wide text-[#5f7a71]">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ee]">
              {species.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="px-4 py-3 font-semibold text-[#173b3b]">{item.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-[#78918a]">{item.description || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => void handleToggle(item)} className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${item.status === 'Activo' ? 'bg-[#e7f1eb] text-[#0d5c5b]' : 'bg-[#f4f6f4] text-[#829990]'}`}>
                      {item.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="rounded-lg p-1.5 text-[#5f7a71] transition-colors hover:bg-[#e7f1eb]" aria-label="Editar">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => void handleDelete(item)} className="rounded-lg p-1.5 text-[#b56a51] transition-colors hover:bg-[#fbede7]" aria-label="Eliminar">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}