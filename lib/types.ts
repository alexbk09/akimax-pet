// ============================================================
// akimax pet — Tipos centrales del dominio
// Organizados por módulo para mantener la escalabilidad.
// Todo acceso a BD debe pasar por los services (regla del proyecto).
// ============================================================

// ---------- Navegación ----------
export type View =
  | 'inicio'
  | 'tienda'
  | 'servicios'
  | 'citas'
  | 'pacientes'
  | 'cliente'
  | 'perfil'
  | 'operaciones'
  | 'administracion'
  | 'caja'
  | 'roles'
  | 'reportes'
  | 'login'
  | 'registro'
  | 'contacto'

export type SetView = (view: View) => void
export type Toast = (message: string) => void

// ---------- Autenticación y roles ----------
export type RoleName = 'Administrador' | 'Veterinario' | 'Peluquero' | 'Caja' | 'Cliente'
export type Permission =
  | 'dashboard:view'
  | 'catalog:view'
  | 'catalog:manage'
  | 'appointments:view'
  | 'appointments:manage'
  | 'patients:view'
  | 'patients:manage'
  | 'cash:view'
  | 'cash:manage'
  | 'sales:view'
  | 'sales:manage'
  | 'customers:view'
  | 'customers:manage'
  | 'users:manage'
  | 'roles:manage'
  | 'reports:view'
  | 'inventory:manage'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string | null
  role: RoleName
  avatar_url?: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: RoleName
  slug: string
  description: string
  permissions: Permission[]
}

// ---------- Catálogo ----------
export interface Category {
  id: number
  name: string
  slug: string
  type: 'Producto' | 'Servicio'
  status: 'Visible' | 'Oculta'
  created_at: string
}

export interface Product {
  id: number
  name: string
  slug: string
  category_id: number | null
  category?: string
  price: number
  stock: number
  weight?: string | null
  sku?: string | null
  description?: string | null
  status: 'Activo' | 'Borrador'
  image_url?: string | null
  tone: string
  icon: string
  created_at: string
}

export interface ServicePrice {
  id: number
  service_id: number
  label: string
  price: number
}

export interface Service {
  id: number
  name: string
  slug: string
  category_id: number | null
  category?: string
  area: 'Veterinaria' | 'Peluquería'
  duration: string
  duration_minutes?: number
  description: string
  status: 'Activo' | 'Inactivo'
  prices: ServicePrice[]
  tone: string
  icon: string
  created_at: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  kind: 'Producto' | 'Servicio'
  image_url?: string | null
}

// ---------- Clientes y pacientes ----------
export interface Customer {
  id: number
  user_id?: string | null
  name: string
  email?: string | null
  phone?: string | null
  document?: string | null
  address?: string | null
  status: 'Activo' | 'Inactivo'
  created_at: string
}

export interface Breed {
  id: number
  species_id: number
  name: string
  slug: string
  created_at: string
}

export interface Species {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  status: 'Activo' | 'Inactivo'
  created_at: string
}

export interface Pet {
  id: number
  customer_id: number
  name: string
  species: string
  species_id?: number | null
  breed?: string | null
  birth_date?: string | null
  weight_kg?: number | null
  size?: 'Pequeño' | 'Mediano' | 'Grande' | null
  color?: string | null
  image_url?: string | null
  initials: string
  owner?: string | null
  last?: string | null
  created_at: string
}

export interface ProfessionalSchedule {
  id: number
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
  created_at: string
}

export interface MedicalRecord {
  id: number
  pet_id: number
  date: string
  title: string
  detail: string
  type: 'Control' | 'Vacuna' | 'Desparasitación' | 'Cirugía' | 'Otro'
  created_by: string | null
  created_at: string
}

// ---------- Citas ----------
export type AppointmentStatus = 'Confirmada' | 'En espera' | 'Completada' | 'Cancelada'

export interface Appointment {
  id: number
  customer_id: number
  pet_id: number
  service_id: number
  professional_id: string | null
  date: string
  time: string
  end_time?: string | null
  status: AppointmentStatus
  notes?: string | null
  created_at: string
}

// ---------- Caja y ventas ----------
export type PaymentMethod = 'Efectivo USD' | 'Efectivo VES' | 'Tarjeta' | 'Pago móvil'

export interface SaleItem {
  id: string
  sale_id: number | null
  item_id: string
  name: string
  kind: 'Producto' | 'Servicio'
  price: number
  quantity: number
}

export interface Sale {
  id: number
  customer_id: number | null
  user_id: string | null
  subtotal_usd: number
  total_usd: number
  total_ves: number
  payment_method: PaymentMethod
  status: 'Pagada' | 'Pendiente' | 'Anulada'
  created_at: string
}

export interface CashRegister {
  id: number
  user_id: string
  opening_amount: number
  closing_amount: number | null
  status: 'Abierta' | 'Cerrada'
  opened_at: string
  closed_at: string | null
}

// ---------- Inventario ----------
export interface InventoryMovement {
  id: number
  product_id: number
  type: 'Entrada' | 'Salida' | 'Ajuste'
  quantity: number
  reason?: string | null
  user_id: string | null
  created_at: string
}

// ---------- Tasa de cambio ----------
export interface ExchangeRate {
  id: number
  currency: string
  rate: number
  source: 'dolarapi' | 'manual'
  fetched_at: string
}

// ---------- Reportes ----------
export interface ReportFilters {
  from?: string
  to?: string
  area?: string
  professional?: string
  search?: string
}

// ---------- Formato de moneda ----------
export const RATE_FALLBACK = 100

export function formatVES(value: number, rateValue: number = RATE_FALLBACK) {
  if (!Number.isFinite(value)) return 'Bs. 0,00'
  return `Bs. ${(value * rateValue).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatUSD(value: number) {
  if (!Number.isFinite(value)) return '$0.00'
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}