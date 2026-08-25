import type { Pet, Product } from './types'

/**
 * Datos de respaldo para desarrollo offline.
 * Cuando Supabase esté configurado, los services reemplazan estos datos.
 */
export const fallbackProducts: Product[] = [
  { id: 1, name: 'Alimento VitalCan Adulto', category: 'Alimentos', price: 24.9, stock: 12, tone: 'bg-[#e8f3ef]', icon: 'bag', slug: 'alimento-vitalcan-adulto', status: 'Activo', category_id: 1, created_at: new Date().toISOString() },
  { id: 2, name: 'Collar Soft Touch', category: 'Accesorios', price: 12.5, stock: 8, tone: 'bg-[#f1eee7]', icon: 'collar', slug: 'collar-soft-touch', status: 'Activo', category_id: 2, created_at: new Date().toISOString() },
  { id: 3, name: 'Pipeta Antipulgas', category: 'Cuidado', price: 8.75, stock: 4, tone: 'bg-[#e8eef4]', icon: 'drop', slug: 'pipeta-antipulgas', status: 'Activo', category_id: 3, created_at: new Date().toISOString() },
  { id: 4, name: 'Cama Nube Mediana', category: 'Accesorios', price: 39, stock: 7, tone: 'bg-[#edf0e7]', icon: 'bed', slug: 'cama-nube-mediana', status: 'Activo', category_id: 2, created_at: new Date().toISOString() },
  { id: 5, name: 'Snacks Dentales', category: 'Alimentos', price: 6.4, stock: 20, tone: 'bg-[#f4ede6]', icon: 'bone', slug: 'snacks-dentales', status: 'Activo', category_id: 1, created_at: new Date().toISOString() },
  { id: 6, name: 'Shampoo Dermoprotector', category: 'Cuidado', price: 15.2, stock: 9, tone: 'bg-[#e8f0f0]', icon: 'bottle', slug: 'shampoo-dermoprotector', status: 'Activo', category_id: 3, created_at: new Date().toISOString() },
]

export const fallbackPets: Pet[] = [
  { id: 1, customer_id: 1, name: 'Luna', species: 'Golden Retriever', breed: 'Golden Retriever', initials: 'LU', color: 'bg-[#e7f0df]', owner: 'María Fernanda Soto', last: 'Control anual · 12 Jun', created_at: new Date().toISOString() },
  { id: 2, customer_id: 1, name: 'Simón', species: 'Gato mestizo', breed: 'Mestizo', initials: 'SI', color: 'bg-[#e9e6f1]', owner: 'María Fernanda Soto', last: 'Vacuna triple · 03 Abr', created_at: new Date().toISOString() },
]

export const fallbackServices = [
  { id: 1, name: 'Consulta general', detail: 'Cuidado preventivo y diagnóstico', duration: '30 min', area: 'Veterinaria' as const, price: 25 },
  { id: 2, name: 'Peluquería & spa', detail: 'Una experiencia que se nota', duration: '90 min', area: 'Peluquería' as const, price: 18 },
  { id: 3, name: 'Cirugía especializada', detail: 'Tecnología, cuidado y confianza', duration: 'Según procedimiento', area: 'Veterinaria' as const, price: 120 },
]