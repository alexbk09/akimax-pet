import { supabase } from '@/lib/supabase/client'

type StorageBucket = 'products' | 'services' | 'pet-avatars' | 'receipts'
type StorageFormat = 'webp' | 'avif'

export interface UploadResult {
  url: string
  format: StorageFormat
  width: number
  height: number
  sizeBytes: number
}

const MAX_DIMENSION = 1200
const WEBP_QUALITY = 0.82
const AVIF_QUALITY = 0.7

/**
 * Sistema unificado de subida de imágenes.
 * TODAS las imágenes (pet-avatars, products, services) pasan por este flujo:
 * 1. Valida tipo
 * 2. Detecta el mejor formato soportado por el navegador: AVIF si es posible, si no WebP
 * 3. Procesa en canvas: redimensiona a máx 1200px
 * 4. Convierte al formato óptimo (AVIF → WebP)
 * 5. Sube a Supabase Storage en el bucket indicado (SOLO la convertida)
 * 6. Devuelve la URL pública + metadatos
 */
export async function uploadImage(bucket: StorageBucket, file: File, folder = 'catalogo'): Promise<UploadResult> {
  // 1. Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen (PNG, JPG, WebP, GIF, etc.)')
  }

  // 2. Elegir formato soportado por el navegador
  const format = await detectBestFormat()
  const mimeType = format === 'avif' ? 'image/avif' : 'image/webp'

  // 3. Procesar y comprimir la imagen en el navegador (canvas)
  const processed = await processImage(file, format)
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${format}`

  // 4. Subir SOLO la imagen convertida (nunca la original)
  const { error } = await supabase.storage.from(bucket).upload(fileName, processed.blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: mimeType,
  })
  if (error) throw error

  // 5. URL pública
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

  return {
    url: publicUrl,
    format,
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.blob.size,
  }
}

/** Detecta el mejor formato de imagen soportado por el navegador (AVIF > WebP). */
function detectBestFormat(): Promise<StorageFormat> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve('webp')
      return
    }
    canvas.toBlob((blob) => resolve(blob ? 'avif' : 'webp'), 'image/avif', 0.1)
  })
}

/**
 * Procesa una imagen en el navegador usando canvas:
 * redimensiona (mantiene proporción) y convierte al formato indicado (avif/webp).
 * Devuelve el blob resultante y las dimensiones finales.
 */
async function processImage(file: File, format: StorageFormat): Promise<{ blob: Blob; width: number; height: number }> {
  const image = await createImageBitmap(file)

  // Calcular nuevas dimensiones manteniendo proporción
  let { width, height } = image
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Dibujar en canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se pudo procesar la imagen')

  context.drawImage(image, 0, 0, width, height)
  image.close()

  // Convertir al formato óptimo
  const mimeType = format === 'avif' ? 'image/avif' : 'image/webp'
  const quality = format === 'avif' ? AVIF_QUALITY : WEBP_QUALITY
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality)
  })
  if (!blob) throw new Error('No se pudo comprimir la imagen')

  return { blob, width, height }
}

/** Elimina una imagen del bucket extrayendo el path de la URL pública. */
export async function deleteImage(bucket: StorageBucket, url: string): Promise<void> {
  const base = `${supabase.storage.from(bucket).getPublicUrl('').data.publicUrl}`
  const path = url.replace(base, '')
  if (!path || path === url) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/** Sube un PDF (recibos/facturas) al bucket privado receipts sin procesar. */
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