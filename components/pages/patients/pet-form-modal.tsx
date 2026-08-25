'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Loader2, Search, X } from 'lucide-react'
import type { Breed, Pet, Species, Toast } from '@/lib/types'
import { createPet, updatePet } from '@/lib/services/customers'
import { getBreedsBySpecies, getSpecies } from '@/lib/services/pets-schedule'
import { getMyCustomer } from '@/lib/services/client-area'
import { uploadImage } from '@/lib/services/storage'

interface PetFormModalProps {
  customerId?: number | null
  pet?: Pet | null
  onClose: () => void
  onSaved: (pet: Pet) => void
  showToast: Toast
}

const SIZES = ['Pequeño', 'Mediano', 'Grande'] as const

/**
 * Modal de registro/edición de mascota (ancho amplio max-w-3xl).
 * Es el MISMO componente usado desde "Mis mascotas" y "Mi panel".
 * - Foto opcional: cualquier formato de imagen se convierte a WebP (canvas)
 * - Especie: lista con buscador
 * - Raza: lista con buscador según la especie elegida
 * - Fecha nacimiento, peso, tamaño, color
 */
export default function PetFormModal({ customerId, pet, onClose, onSaved, showToast }: PetFormModalProps) {
  const [resolvedCustomerId, setResolvedCustomerId] = useState<number | null>(customerId ?? null)
  const [name, setName] = useState(pet?.name ?? '')
  const [speciesId, setSpeciesId] = useState<number | ''>(pet?.species_id ?? '')
  const [speciesSearch, setSpeciesSearch] = useState('')
  const [speciesOpen, setSpeciesOpen] = useState(false)
  const [breedId, setBreedId] = useState<number | ''>('')
  const [breedSearch, setBreedSearch] = useState('')
  const [breedOpen, setBreedOpen] = useState(false)
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [birthDate, setBirthDate] = useState(pet?.birth_date ?? '')
  const [weight, setWeight] = useState(pet?.weight_kg?.toString() ?? '')
  const [size, setSize] = useState<'Pequeño' | 'Mediano' | 'Grande' | ''>(pet?.size ?? '')
  const [color, setColor] = useState(pet?.color ?? '')
  const [imageUrl, setImageUrl] = useState(pet?.image_url ?? null)
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Autocontenido: si no recibimos customerId del padre, lo obtenemos aquí
  useEffect(() => {
    if (resolvedCustomerId) return
    void getMyCustomer().then((customer) => {
      if (customer) setResolvedCustomerId(customer.id)
    }).catch(() => { /* sin perfil */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar especies al montar
  useEffect(() => {
    void getSpecies().then(setSpeciesList).catch(() => setSpeciesList([]))
  }, [])

  // Cargar razas de la especie elegida
  useEffect(() => {
    if (!speciesId) {
      setBreeds([])
      setBreedId('')
      return
    }
    void getBreedsBySpecies(Number(speciesId)).then(setBreeds).catch(() => setBreeds([]))
  }, [speciesId])

  // Al editar: prellenar raza y especies
  useEffect(() => {
    if (pet?.species) {
      setSpeciesSearch(pet.species)
    }
    if (pet?.species_id) {
      void getBreedsBySpecies(pet.species_id).then((list) => {
        setBreeds(list)
        const match = pet.breed ? list.find((item) => item.name.toLowerCase() === pet.breed?.toLowerCase()) : undefined
        if (match) setBreedId(match.id)
      }).catch(() => setBreeds([]))
    }
    if (pet?.breed) setBreedSearch(pet.breed)
  }, [pet])

  // Especies filtradas por búsqueda
  const filteredSpecies = useMemo(() => {
    const term = speciesSearch.toLowerCase().trim()
    if (!term) return speciesList
    return speciesList.filter((item) => item.name.toLowerCase().includes(term))
  }, [speciesList, speciesSearch])

  // Razas filtradas por búsqueda
  const filteredBreeds = useMemo(() => {
    const term = breedSearch.toLowerCase().trim()
    if (!term) return breeds
    return breeds.filter((item) => item.name.toLowerCase().includes(term))
  }, [breeds, breedSearch])

  const selectedSpecies = speciesList.find((item) => item.id === speciesId)
  const selectedBreed = breeds.find((item) => item.id === breedId)

  /** Sube la imagen: acepta cualquier formato y guarda SOLO la WebP convertida. */
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await uploadImage('pet-avatars', file, `mascotas/${resolvedCustomerId ?? 'temp'}`)
      setImageUrl(result.url)
      showToast('Foto convertida a WebP y guardada')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /** Selecciona una especie del buscador. */
  function selectSpecies(id: number, name: string) {
    setSpeciesId(id)
    setSpeciesSearch(name)
    setSpeciesOpen(false)
    setBreedId('')
    setBreedSearch('')
  }

  /** Selecciona una raza del buscador. */
  function selectBreed(id: number, name: string) {
    setBreedId(id)
    setBreedSearch(name)
    setBreedOpen(false)
  }

  /** Guarda la mascota (crea o actualiza). */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!resolvedCustomerId) {
      setError('No encontramos tu perfil de cliente. Completa tu registro en Mi perfil para poder guardar.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: name.trim(),
        species: selectedSpecies?.name ?? (speciesSearch.trim() || 'Otro'),
        species_id: selectedSpecies?.id ?? null,
        breed: selectedBreed?.name ?? (breedSearch.trim() || null),
        birth_date: birthDate || null,
        weight_kg: weight ? Number(weight) : null,
        size: (size as Pet['size']) || null,
        color: color.trim() || null,
        image_url: imageUrl,
      }
      const saved = pet
        ? await updatePet(pet.id, { ...payload } as Partial<Pet>)
        : await createPet({ ...payload, customer_id: resolvedCustomerId } as Omit<Pet, 'id' | 'created_at' | 'initials'> & { initials?: string })
      onSaved(saved)
      showToast(pet ? 'Mascota actualizada' : 'Mascota registrada')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la mascota')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173b3b]/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf2ee] px-8 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">{pet ? 'Editar' : 'Nuevo'} paciente</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#173b3b]">{pet ? 'Actualiza su ficha' : 'Registra tu mascota'}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#78918a] transition-colors hover:bg-[#f4f8f5] hover:text-[#173b3b]" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-8">
          {/* Foto grande — acepta cualquier formato de imagen */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative">
              {imageUrl ? (
                <img src={imageUrl} alt={name || 'Mascota'} className="size-24 rounded-3xl object-cover ring-1 ring-[#e1ebe6]" />
              ) : (
                <span className="flex size-24 items-center justify-center rounded-3xl bg-[#e7f1eb] font-serif text-3xl font-bold text-[#477267]">
                  {name ? name.slice(0, 2).toUpperCase() : <Camera className="size-8 text-[#477267]" />}
                </span>
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/60">
                  <Loader2 className="size-6 animate-spin text-[#0d5c5b]" />
                </span>
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">
                {imageUrl ? 'Cambiar foto' : 'Agregar foto'}
              </button>
              <p className="mt-2 text-xs text-[#829990]">Cualquier formato. Se convierte a WebP automáticamente (solo se guarda la convertida).</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          {/* Nombre */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Nombre *</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Toby" className="w-full rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
          </label>

          {/* Especie con buscador */}
          <div className="relative">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Especie *</span>
            <button type="button" onClick={() => { setSpeciesOpen((open) => !open); setBreedOpen(false) }} className="flex w-full items-center justify-between rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]">
              <span className={selectedSpecies ? 'text-[#173b3b]' : 'text-[#a0b4ac]'}>{selectedSpecies?.name ?? 'Buscar y seleccionar especie...'}</span>
              <Search className="size-4 text-[#8ca59c]" />
            </button>
            {speciesOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[#e1ebe6]">
                <input
                  autoFocus
                  value={speciesSearch}
                  onChange={(event) => setSpeciesSearch(event.target.value)}
                  placeholder="Filtrar especies..."
                  className="w-full border-b border-[#edf2ee] px-4 py-3 text-sm outline-none"
                />
                <div className="max-h-52 overflow-y-auto">
                  {filteredSpecies.length === 0 && <p className="px-4 py-3 text-sm text-[#829990]">Sin resultados</p>}
                  {filteredSpecies.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectSpecies(item.id, item.name)}
                      className="block w-full px-4 py-2.5 text-left text-sm text-[#173b3b] transition-colors hover:bg-[#e7f1eb]"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Raza con buscador (según la especie elegida) */}
          <div className="relative">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Raza</span>
            <button type="button" onClick={() => { setBreedOpen((open) => !open); setSpeciesOpen(false) }} disabled={!speciesId || breeds.length === 0} className="flex w-full items-center justify-between rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0] disabled:cursor-not-allowed disabled:opacity-50">
              <span className={selectedBreed ? 'text-[#173b3b]' : 'text-[#a0b4ac]'}>
                {selectedBreed?.name ?? (speciesId ? 'Buscar raza...' : 'Primero elige una especie')}
              </span>
              <Search className="size-4 text-[#8ca59c]" />
            </button>
            {breedOpen && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-[#e1ebe6]">
                <input
                  autoFocus
                  value={breedSearch}
                  onChange={(event) => setBreedSearch(event.target.value)}
                  placeholder="Buscar raza..."
                  className="w-full border-b border-[#edf2ee] px-4 py-3 text-sm outline-none"
                />
                <div className="max-h-52 overflow-y-auto">
                  {filteredBreeds.length === 0 && <p className="px-4 py-3 text-sm text-[#829990]">Sin resultados</p>}
                  {filteredBreeds.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectBreed(item.id, item.name)}
                      className="block w-full px-4 py-2.5 text-left text-sm text-[#173b3b] transition-colors hover:bg-[#e7f1eb]"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fecha nacimiento, peso, tamaño y color */}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Fecha de nacimiento</span>
              <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="w-full rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Peso (kg)</span>
              <input type="number" step="0.1" min="0" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Ej. 12.5" className="w-full rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Tamaño</span>
              <div className="flex gap-2">
                {SIZES.map((item) => (
                  <button key={item} type="button" onClick={() => setSize(size === item ? '' : item)} className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors ${size === item ? 'bg-[#0d5c5b] text-white' : 'bg-[#f6f8f6] text-[#78918a] ring-1 ring-[#e1ebe6]'}`}>{item}</button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#5f7a71]">Color / señas</span>
              <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="Ej. Marrón y blanco" className="w-full rounded-xl border-0 bg-[#f6f8f6] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]" />
            </label>
          </div>

          {error && <p className="rounded-xl bg-[#fbede7] px-4 py-3 text-sm font-semibold text-[#b56a51]">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[#f4f8f5] px-4 py-3.5 text-sm font-bold text-[#5f7a71] ring-1 ring-[#e1ebe6]">Cancelar</button>
            <button type="submit" disabled={saving || uploading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {pet ? 'Guardar cambios' : 'Registrar mascota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}