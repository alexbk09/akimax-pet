import { Activity, Stethoscope, Syringe } from 'lucide-react'
import type { Pet, Product } from './types'

export const products: Product[] = [
  { id: 1, name: 'Alimento VitalCan Adulto', category: 'Alimentos', price: 24.9, stock: 12, tone: 'bg-[#e8f3ef]', icon: 'bag' },
  { id: 2, name: 'Collar Soft Touch', category: 'Accesorios', price: 12.5, stock: 8, tone: 'bg-[#f1eee7]', icon: 'collar' },
  { id: 3, name: 'Pipeta Antipulgas', category: 'Cuidado', price: 8.75, stock: 4, tone: 'bg-[#e8eef4]', icon: 'drop' },
  { id: 4, name: 'Cama Nube Mediana', category: 'Accesorios', price: 39, stock: 7, tone: 'bg-[#edf0e7]', icon: 'bed' },
  { id: 5, name: 'Snacks Dentales', category: 'Alimentos', price: 6.4, stock: 20, tone: 'bg-[#f4ede6]', icon: 'bone' },
  { id: 6, name: 'Shampoo Dermoprotector', category: 'Cuidado', price: 15.2, stock: 9, tone: 'bg-[#e8f0f0]', icon: 'bottle' },
]

export const pets: Pet[] = [
  { name: 'Luna', species: 'Golden Retriever · 4 años', initials: 'LU', color: 'bg-[#e7f0df]', owner: 'Tu mascota', last: 'Control anual · 12 Jun' },
  { name: 'Simón', species: 'Gato mestizo · 2 años', initials: 'SI', color: 'bg-[#e9e6f1]', owner: 'Tu mascota', last: 'Vacuna triple · 03 Abr' },
]

export const featuredServices = [
  { name: 'Consulta general', detail: 'Cuidado preventivo y diagnóstico', price: '$25', icon: Stethoscope },
  { name: 'Peluquería & spa', detail: 'Una experiencia que se nota', price: '$18', icon: Activity },
  { name: 'Cirugía especializada', detail: 'Tecnología, cuidado y confianza', price: 'Desde $120', icon: Syringe },
]
