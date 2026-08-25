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

/** Obtiene todas las mascotas (con dueño) con paginación. */
export async function getPets(options: {
  page?: number
  pageSize?: number
  search?: string
} = {}): Promise<PaginatedResult<Pet & { customer_name: string; last_record?: string | null }>> {
  const { page = 1, pageSize = PAGE_SIZE, search = '' } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('pets')
    .select('*, customers(name)', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map((row) => ({
    ...row,
    customer_name: (row as unknown as { customers: { name: string } }).customers?.name ?? '',
  }))

  return {
    data: rows as (Pet & { customer_name: string })[],
    count: count ?? 0,
    hasMore: (count ?? 0) > from + (data?.length ?? 0),
  }
}

/** Crea una mascota. */
export async function createPet(pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> {
  const { data, error } = await supabase.from('pets').insert(pet).select().single()
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