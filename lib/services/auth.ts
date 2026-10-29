import type { Permission, Profile, Role, RoleName } from '@/lib/types'

const SESSION_KEY = 'akimax:session'
const USERS_KEY = 'akimax:users'

const DEFAULT_PERMISSIONS: Record<RoleName, Permission[]> = {
  Administrador: ['dashboard:view', 'catalog:view', 'catalog:manage', 'appointments:view', 'appointments:manage', 'patients:view', 'patients:manage', 'cash:view', 'cash:manage', 'sales:view', 'sales:manage', 'customers:view', 'customers:manage', 'users:manage', 'roles:manage', 'reports:view', 'inventory:manage'],
  Veterinario: ['dashboard:view', 'appointments:view', 'appointments:manage', 'patients:view', 'patients:manage', 'catalog:view', 'reports:view'],
  Peluquero: ['dashboard:view', 'appointments:view', 'appointments:manage', 'patients:view', 'catalog:view'],
  Caja: ['dashboard:view', 'cash:view', 'cash:manage', 'sales:view', 'sales:manage', 'customers:view', 'customers:manage', 'catalog:view', 'reports:view'],
  Cliente: ['dashboard:view', 'catalog:view', 'appointments:view', 'patients:view'],
}

const DEMO_ACCOUNTS: Record<string, { password: string; name: string; role: RoleName }> = {
  'admin@akimax.pet': { password: 'admin123', name: 'Akimax Administrador', role: 'Administrador' },
  'cliente@akimax.pet': { password: 'cliente123', name: 'María Fernanda Soto', role: 'Cliente' },
}

const now = () => new Date().toISOString()
const profile = (email: string, name: string, role: RoleName = 'Cliente'): Profile => ({ id: `local-${email}`, full_name: name, email, role, active: true, created_at: now(), updated_at: now() })

function readUsers(): Profile[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as Profile[] } catch { return [] }
}

function writeSession(value: Profile | null) {
  if (typeof window === 'undefined') return
  if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value))
  else localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event('akimax:auth'))
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Profile | null } catch { return null }
}

export async function signIn(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const demo = DEMO_ACCOUNTS[normalizedEmail]
  if (!normalizedEmail || password.length < 4) throw new Error('Credenciales inválidas')
  if (demo && demo.password !== password) throw new Error('Credenciales inválidas')
  const users = readUsers()
  const current = demo ? profile(normalizedEmail, demo.name, demo.role) : users.find((item) => item.email.toLowerCase() === normalizedEmail) ?? profile(normalizedEmail, normalizedEmail.split('@')[0] || 'Cliente')
  if (!users.some((item) => item.email.toLowerCase() === normalizedEmail)) localStorage.setItem(USERS_KEY, JSON.stringify([...users, current]))
  writeSession(current)
  return { user: current }
}

export async function signUp(email: string, password: string, fullName: string, phone?: string) {
  if (!email || password.length < 4 || fullName.trim().length < 2) throw new Error('Completa los datos requeridos')
  const current = { ...profile(email, fullName.trim()), phone: phone || null }
  localStorage.setItem(USERS_KEY, JSON.stringify([...readUsers(), current]))
  writeSession(current)
  return { user: current }
}

export async function signOut() { writeSession(null) }
export async function updateProfile(patch: { full_name?: string; phone?: string | null }) { const current = await getCurrentProfile(); if (!current) throw new Error('Usuario no autenticado'); writeSession({ ...current, ...patch, updated_at: now() }) }
export async function changePassword(newPassword: string) { if (newPassword.length < 4) throw new Error('La contraseña es muy corta') }
export async function getRoles(): Promise<Role[]> { return (Object.keys(DEFAULT_PERMISSIONS) as RoleName[]).map((name, id) => ({ id, name, slug: name.toLowerCase(), description: `Permisos para ${name}`, permissions: DEFAULT_PERMISSIONS[name] })) }
export async function createRole(role: Omit<Role, 'id'>) { return { ...role, id: Date.now() } }
export async function updateRole(id: number, patch: Partial<Role>) { return { id, name: 'Cliente' as RoleName, slug: 'cliente', description: '', permissions: [], ...patch } }
export async function deleteRole(_id: number) {}
export async function getUsers() { return readUsers() }
export async function assignRole(userId: string, role: RoleName) { const users = readUsers().map((item) => item.id === userId ? { ...item, role } : item); localStorage.setItem(USERS_KEY, JSON.stringify(users)) }
export function getPermissionsForRole(role: RoleName) { return DEFAULT_PERMISSIONS[role] ?? [] }
