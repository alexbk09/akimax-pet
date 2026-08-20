export type View = 'inicio' | 'tienda' | 'servicios' | 'citas' | 'pacientes' | 'operaciones' | 'administracion' | 'caja' | 'roles' | 'reportes'
export type Product = { id: number; name: string; category: string; price: number; stock: number; tone: string; icon: string }
export type CartItem = Product & { quantity: number }
export type Pet = { name: string; species: string; initials: string; color: string; owner: string; last: string }
export type Role = 'Administrador' | 'Veterinario' | 'Caja'
export type SetView = (view: View) => void
export type Toast = (message: string) => void

export const rate = 131.42
export function formatVES(value: number) {
  return `Bs. ${(value * rate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
