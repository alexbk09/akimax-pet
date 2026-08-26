import { supabase } from '@/lib/supabase/client'
import type { Customer, MedicalRecord, Pet } from '@/lib/types'
import type { PaginatedResult } from './shared'

const PAGE_SIZE = 10

/** Obtiene clientes con paginación y búsqueda. */
export async function getCustomers(options: {
  page?: number
  pageSize?: number
  search?: string
} = {}): Promise<PaginatedResult<Customer>> {
  const { page = 1, pageSize = PAGE_SIZE, search = '' } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    data: (data ?? []) as Customer[],
    count: count ?? 0,
    hasMore: (count ?? 0) > from + (data?.length ?? 0),
  }
}

/** Crea un cliente. */
export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert(customer).select().single()
  if (error) throw error
  return data as Customer
}

/** Actualiza un cliente. */
export async function updateCustomer(id: number, patch: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabase.from('customers').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Customer
}

/** Elimina un cliente. */
export async function deleteCustomer(id: number): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

/** Obtiene las mascotas de un cliente. */
export async function getPetsByCustomer(customerId: number): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', customerId)
    .order('name')
  if (error) throw error
  return (data ?? []) as Pet[]
}

/** Obtiene todas las mascotas (con dueño y especie) con paginación. */
export async function getPets(options: {
  page?: number
  pageSize?: number
  search?: string
} = {}): Promise<PaginatedResult<Pet & { customer_name: string; species_name: string | null }>> {
  const { page = 1, pageSize = PAGE_SIZE, search = '' } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('pets')
    .select('*, customers(name), species(name)', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map((row) => {
    const raw = row as unknown as {
      customers: { name: string } | null
      species: { name: string } | null
    }
    return {
      ...row,
      customer_name: raw.customers?.name ?? '',
      species_name: raw.species?.name ?? null,
    }
  })

  return {
    data: rows as (Pet & { customer_name: string; species_name: string | null })[],
    count: count ?? 0,
    hasMore: (count ?? 0) > from + (data?.length ?? 0),
  }
}

/**
 * Crea una mascota con todos los campos (imagen, especie, tamaño).
 * Es tolerante a esquemas: si la BD no tiene las columnas nuevas
 * (species_id, image_url, size, initials — migraciones 0014/0020 no aplicadas),
 * reintenta con el esquema base de la migración 0003.
 */
export async function createPet(pet: Omit<Pet, 'id' | 'created_at' | 'initials'> & { initials?: string }): Promise<Pet> {
  const initials = pet.initials ?? pet.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // 1er intento: con todas las columnas nuevas
  const { data, error } = await supabase.from('pets').insert({ ...pet, initials }).select().single()
  if (!error && data) return data as Pet

  // Si el error es por columna inexistente, reintenta con el esquema base (0003)
  const message = error?.message ?? ''
  if (message.toLowerCase().includes('column') || message.toLowerCase().includes('does not exist') || message.toLowerCase().includes('undefined')) {
    const base: Record<string, unknown> = {
      customer_id: pet.customer_id,
      name: pet.name,
      species: pet.species,
    }
    if (pet.breed !== undefined) base.breed = pet.breed
    if (pet.birth_date !== undefined) base.birth_date = pet.birth_date
    if (pet.weight_kg !== undefined) base.weight_kg = pet.weight_kg
    if (pet.color !== undefined) base.color = pet.color

    const { data: retryData, error: retryError } = await supabase.from('pets').insert(base).select().single()
    if (retryError) throw retryError
    return retryData as Pet
  }

  if (error) throw error
  return data as Pet
}

/** Actualiza una mascota existente. */
export async function updatePet(petId: number, patch: Partial<Pet>): Promise<Pet> {
  const { data, error } = await supabase.from('pets').update(patch).eq('id', petId).select().single()
  if (error) throw error
  return data as Pet
}

/** Obtiene la historia clínica de una mascota. */
export async function getMedicalRecords(petId: number): Promise<MedicalRecord[]> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as MedicalRecord[]
}

/** Crea una nota en la historia clínica. */
export async function createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at'>): Promise<MedicalRecord> {
  const { data, error } = await supabase.from('medical_records').insert(record).select().single()
  if (error) throw error
  return data as MedicalRecord
}