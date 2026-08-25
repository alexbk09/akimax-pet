import { supabase } from '@/lib/supabase/client'
import type { Breed, ProfessionalSchedule, Species } from '@/lib/types'

// ============================================================
// Catálogo local de respaldo
// Garantiza que el buscador de especies/razas SIEMPRE tenga datos,
// incluso antes de aplicar las migraciones 0016-0018 en Supabase.
// ============================================================
const FALLBACK_SPECIES: (Omit<Species, 'created_at' | 'status'> & { id: number; status: 'Activo' })[] = [
  { id: 1, name: 'Perro', slug: 'perro', description: 'Compañero fiel.', icon: 'paw-print', status: 'Activo' },
  { id: 2, name: 'Gato', slug: 'gato', description: 'Independiente y curioso.', icon: 'cat', status: 'Activo' },
  { id: 3, name: 'Ave', slug: 'ave', description: 'Ave doméstica.', icon: 'bird', status: 'Activo' },
  { id: 4, name: 'Conejo', slug: 'conejo', description: 'Herbívoro.', icon: 'rabbit', status: 'Activo' },
  { id: 5, name: 'Roedor', slug: 'roedor', description: 'Hámster, cobaya, etc.', icon: 'rat', status: 'Activo' },
  { id: 6, name: 'Reptil', slug: 'reptil', description: 'Tortugas, lagartos.', icon: 'lizard', status: 'Activo' },
  { id: 7, name: 'Pez', slug: 'pez', description: 'Pez de acuario.', icon: 'fish', status: 'Activo' },
  { id: 8, name: 'Equino', slug: 'equino', description: 'Caballos y ponis.', icon: 'horse', status: 'Activo' },
  { id: 9, name: 'Hurón', slug: 'huron', description: 'Pequeño carnívoro.', icon: 'paw-print', status: 'Activo' },
  { id: 10, name: 'Cerdo', slug: 'cerdo', description: 'Cerdo miniatura o granja.', icon: 'pig', status: 'Activo' },
  { id: 11, name: 'Cabro', slug: 'cabro', description: 'Caprino doméstico.', icon: 'goat', status: 'Activo' },
  { id: 12, name: 'Oveja', slug: 'oveja', description: 'Oveja doméstica.', icon: 'sheep', status: 'Activo' },
  { id: 13, name: 'Vaca', slug: 'vaca', description: 'Bovino.', icon: 'cow', status: 'Activo' },
  { id: 14, name: 'Anfibio', slug: 'anfibio', description: 'Ranas y sapos.', icon: 'frog', status: 'Activo' },
  { id: 15, name: 'Araña', slug: 'arana', description: 'Tarántulas y arácnidos.', icon: 'spider', status: 'Activo' },
  { id: 16, name: 'Escorpión', slug: 'escorpion', description: 'Escorpiones.', icon: 'scorpion', status: 'Activo' },
  { id: 17, name: 'Otro', slug: 'otro', description: 'Otra especie no listada.', icon: 'paw-print', status: 'Activo' },
]

const FALLBACK_BREEDS: Record<number, string[]> = {
  1: ['Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés', 'Poodle (Caniche)', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund (Salchicha)', 'Boxer', 'Siberian Husky', 'Chihuahua', 'Shih Tzu', 'Pomerania', 'Dálmata', 'Pug (Carlino)', 'Cocker Spaniel', 'Border Collie', 'Maltés', 'Pitbull Terrier', 'Doberman', 'Gran Danés', 'San Bernardo', 'Corgi Galés', 'Schnauzer Miniatura', 'Jack Russell Terrier', 'Bichón Frisé', 'Boston Terrier', 'Akita Inu', 'Shiba Inu', 'Galgo Español', 'Mestizo/Criollo'],
  2: ['Siamés', 'Persa', 'Maine Coon', 'Bengalí', 'Sphynx', 'British Shorthair', 'Gato Común Europeo', 'Ragdoll', 'Azul Ruso', 'Siberiano', 'Munchkin', 'Abisinio', 'Birmano', 'Devon Rex', 'Cornish Rex', 'Himalayo', 'Scottish Fold', 'Mestizo/Criollo'],
  3: ['Periquito Australiano', 'Cacatúa', 'Loro (Papagayo)', 'Guacamayo', 'Canario', 'Agapornis (Inseparable)', 'Cotorra Argentina', 'Yaco (Loro Gris Africano)', 'Ninfa (Carolina)', 'Diamante Mandarín', 'Jilguero', 'Otra raza'],
  4: ['Conejo Enano', 'Angora', 'Holland Lop', 'Mini Lop', 'Rex', 'Flandes', 'Belier', 'Californiano', 'Mestizo/Criollo'],
  5: ['Hámster Ruso', 'Hámster Sirio', 'Cobaya (Cuy)', 'Rata Doméstica', 'Ratón Doméstico', 'Jerbo', 'Degú', 'Chinchilla', 'Ardilla', 'Mestizo/Criollo'],
  6: ['Tortuga de Tierra', 'Tortuga de Agua', 'Gecko Leopardo', 'Camaleón', 'Iguana Verde', 'Serpiente del Maíz', 'Pitón Real', 'Dragón Barbudo', 'Lagarto Tejú', 'Mestizo/Criollo'],
  7: ['Goldfish (Carpín Dorado)', 'Betta', 'Guppy', 'Neón Chino', 'Molly', 'Platy', 'Tetra', 'Disco', 'Escalar (Pez Ángel)', 'Carpa Koi', 'Mestizo/Criollo'],
  8: ['Caballo Pura Sangre', 'Caballo Cuarto de Milla', 'Poni Shetland', 'Caballo Árabe', 'Caballo Frisón', 'Caballo Criollo Venezolano', 'Caballo Appaloosa', 'Mestizo/Criollo'],
  9: ['Hurón Sable', 'Hurón Albino', 'Hurón Chocolate', 'Hurón Panda', 'Hurón Canela', 'Mestizo/Criollo'],
  10: ['Cerdo Vietnamita', 'Cerdo Mini', 'Cerdo Yorkshire', 'Cerdo Landrace', 'Cerdo Duroc', 'Mestizo/Criollo'],
  11: ['Cabro Alpino', 'Cabro Saanen', 'Cabro Nubio', 'Cabro Enano Nigeriano', 'Cabro Boer', 'Mestizo/Criollo'],
  12: ['Oveja Suffolk', 'Oveja Merina', 'Oveja Dorper', 'Oveja Hampshire', 'Oveja Pelibuey', 'Mestizo/Criollo'],
  13: ['Vaca Holstein', 'Vaca Brahman', 'Vaca Angus', 'Vaca Jersey', 'Vaca Simmental', 'Vaca Hereford', 'Mestizo/Criollo'],
  14: ['Rana Arbórea', 'Rana Pacman', 'Sapo Común', 'Tritón', 'Ajolote', 'Mestizo/Criollo'],
  15: ['Tarántula Mexicana', 'Tarántula Chilena', 'Lobo (Lycosa)', 'Mestizo/Criollo'],
  16: ['Escorpión Emperador', 'Escorpión de Corteza', 'Escorpión Negro', 'Escorpión de Roca', 'Mestizo/Criollo'],
}

/** Obtiene todas las especies activas, con fallback local si la tabla no existe. */
export async function getSpecies(): Promise<Species[]> {
  try {
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('status', 'Activo')
      .order('name')
    if (!error && data && data.length > 0) {
      return (data ?? []) as Species[]
    }
  } catch {
    // Si la tabla no existe o hay error de conexión, usa el catálogo local
  }
  return FALLBACK_SPECIES as Species[]
}

/** Obtiene las razas de una especie, con fallback local si la tabla no existe. */
export async function getBreedsBySpecies(speciesId: number): Promise<Breed[]> {
  try {
    const { data, error } = await supabase
      .from('breeds')
      .select('*')
      .eq('species_id', speciesId)
      .order('name')
    if (!error && data && data.length > 0) {
      return (data ?? []) as Breed[]
    }
  } catch {
    // Si la tabla no existe, usa el catálogo local
  }
  const names = FALLBACK_BREEDS[speciesId] ?? []
  return names.map((name, index) => ({
    id: index + 1,
    species_id: speciesId,
    name,
    slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    created_at: new Date().toISOString(),
  }))
}

/** Crea una raza nueva. */
export async function createBreed(breed: Omit<Breed, 'id' | 'created_at'>): Promise<Breed> {
  const { data, error } = await supabase.from('breeds').insert(breed).select().single()
  if (error) throw error
  return data as Breed
}

/** Crea una nueva especie. */
export async function createSpecies(species: Omit<Species, 'id' | 'created_at'>): Promise<Species> {
  const { data, error } = await supabase.from('species').insert(species).select().single()
  if (error) throw error
  return data as Species
}

/** Actualiza una especie existente. */
export async function updateSpecies(id: number, patch: Partial<Species>): Promise<Species> {
  const { data, error } = await supabase.from('species').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Species
}

/** Elimina una especie. */
export async function deleteSpecies(id: number): Promise<void> {
  const { error } = await supabase.from('species').delete().eq('id', id)
  if (error) throw error
}

/** Obtiene los horarios de un profesional. */
export async function getSchedulesByProfessional(professionalId: string): Promise<ProfessionalSchedule[]> {
  const { data, error } = await supabase
    .from('professional_schedules')
    .select('*')
    .eq('professional_id', professionalId)
    .order('day_of_week')
  if (error) throw error
  return (data ?? []) as ProfessionalSchedule[]
}

/** Obtiene todos los horarios de todos los profesionales. */
export async function getAllSchedules(): Promise<ProfessionalSchedule[]> {
  const { data, error } = await supabase
    .from('professional_schedules')
    .select('*')
    .order('day_of_week')
  if (error) throw error
  return (data ?? []) as ProfessionalSchedule[]
}

/** Inserta o actualiza el horario de un profesional para un día. */
export async function upsertSchedule(schedule: Omit<ProfessionalSchedule, 'id' | 'created_at'>): Promise<ProfessionalSchedule> {
  const { data, error } = await supabase
    .from('professional_schedules')
    .upsert(schedule, { onConflict: 'professional_id,day_of_week' })
    .select()
    .single()
  if (error) throw error
  return data as ProfessionalSchedule
}

/** Elimina un horario. */
export async function deleteSchedule(id: number): Promise<void> {
  const { error } = await supabase.from('professional_schedules').delete().eq('id', id)
  if (error) throw error
}