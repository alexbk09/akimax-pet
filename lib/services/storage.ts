import { supabase } from '@/lib/supabase/client'

type StorageBucket = 'products' | 'services' | 'pet-avatars' | 'receipts'

/**
 * Sube una imagen a un bucket de Supabase Storage.
 * Los buckets públicos (products, services, pet-avatars) devuelven URL pública.
 */
export async function uploadImage(bucket: StorageBucket, file: File, folder = 'catalogo'): Promise<string> {
  const fileExt = file.name.split('.').pop() ?? 'png'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicUrl
}

/** Elimina una imagen del bucket extrayendo el path de la URL pública. */
export async function deleteImage(bucket: StorageBucket, url: string): Promise<void> {
  const base = `${supabase.storage.from(bucket).getPublicUrl('').data.publicUrl}`
  const path = url.replace(base, '')
  if (!path || path === url) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/** Sube un archivo PDF (recibos/facturas) al bucket privado receipts. */
export async function uploadReceipt(file: File, saleId: number): Promise<string> {
  const fileExt = file.name.split('.').pop() ?? 'pdf'
  const fileName = `facturas/factura-${saleId}-${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from('receipts').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return data.path
}