import { supabase } from '@/lib/supabase/client'
import type { Category, Product, Service } from '@/lib/types'
import type { PaginatedResult } from './shared'

const PAGE_SIZE = 12

/** Obtiene los productos activos con paginación y filtros. */
export async function getProducts(options: {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  status?: 'Activo' | 'Borrador'
} = {}): Promise<PaginatedResult<Product>> {
  const { page = 1, pageSize = PAGE_SIZE, search = '', category = '', status = 'Activo' } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*, categories(name)', { count: 'exact' })
    .eq('status', status)
    .order('name', { ascending: true })
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)
  if (category && category !== 'Todos') {
    const cat = await getCategoryByName(category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map((row) => ({
    ...row,
    category: (row as unknown as { categories: { name: string } | null }).categories?.name ?? null,
  }))

  return { data: rows as Product[], count: count ?? 0, hasMore: (count ?? 0) > from + rows.length }
}

/** Obtiene los servicios activos con paginación y filtros. */
export async function getServices(options: {
  page?: number
  pageSize?: number
  search?: string
  area?: string
  category?: string
  status?: 'Activo' | 'Inactivo'
} = {}): Promise<PaginatedResult<Service>> {
  const { page = 1, pageSize = PAGE_SIZE, search = '', area = '', category = '', status = 'Activo' } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('services')
    .select('*, service_prices(*)', { count: 'exact' })
    .eq('status', status)
    .order('name', { ascending: true })
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)
  if (area && area !== 'Todos') query = query.eq('area', area)
  if (category && category !== 'Todos') query = query.ilike('description', `%${category}%`)

  const { data, error, count } = await query
  if (error) throw error

  const rows = (data ?? []).map((row) => ({
    ...row,
    prices: (row as unknown as { service_prices: unknown[] }).service_prices ?? [],
    category: 'Servicios',
  }))

  return { data: rows as Service[], count: count ?? 0, hasMore: (count ?? 0) > from + rows.length }
}

/** Obtiene todas las categorías visibles. */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'Visible')
    .order('name')
  if (error) throw error
  return (data ?? []) as Category[]
}

/** Busca una categoría por nombre. */
async function getCategoryByName(name: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .maybeSingle()
  if (error || !data) return null
  return data as Category
}

/** Crea un producto en el catálogo. */
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data as Product
}

/** Actualiza un producto existente. */
export async function updateProduct(id: number, patch: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase.from('products').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Product
}

/** Elimina un producto. */
export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}