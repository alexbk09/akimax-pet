import { supabase } from '@/lib/supabase/client'
import type { Permission, Profile, Role, RoleName } from '@/lib/types'

/**
 * Obtiene el perfil del usuario autenticado.
 * Si el perfil no existe (trigger no aplicado a usuarios previos),
 * lo crea automáticamente desde los metadatos de auth.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (data) return data as Profile

  // El perfil no existe → intentar crearlo automáticamente
  if (!error) {
    const fullName = (user.user_metadata?.full_name as string) ?? user.email?.split('@')[0] ?? 'Usuario'
    const phone = (user.user_metadata?.phone as string) ?? null
    const profile: Partial<Profile> = {
      id: user.id,
      full_name: fullName,
      email: user.email ?? '',
      phone,
      role: 'Cliente',
      active: true,
    }
    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single()
    if (!insertError && created) return created as Profile
  }

  return null
}

/** Inicia sesión con email y contraseña. */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** Registra un nuevo usuario (rol por defecto: Cliente). */
export async function signUp(email: string, password: string, fullName: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  })
  if (error) throw error
  return data
}

/** Cierra la sesión del usuario actual. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/** Actualiza el perfil del usuario autenticado (nombre y teléfono). */
export async function updateProfile(patch: { full_name?: string; phone?: string | null }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
  if (error) throw error

  // Mantener el registro de cliente vinculado sincronizado
  await supabase.from('customers').update({ name: patch.full_name, phone: patch.phone ?? null }).eq('user_id', user.id)
}

/** Cambia la contraseña del usuario autenticado. */
export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/** Devuelve todos los roles con sus permisos (solo administrador). */
export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from('roles').select('*').order('id')
  if (error) throw error
  return (data ?? []) as Role[]
}

/** Crea un nuevo rol con sus permisos. */
export async function createRole(role: Omit<Role, 'id'>): Promise<Role> {
  const { data, error } = await supabase.from('roles').insert(role).select().single()
  if (error) throw error
  return data as Role
}

/** Actualiza un rol existente. */
export async function updateRole(id: number, patch: Partial<Role>): Promise<Role> {
  const { data, error } = await supabase.from('roles').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Role
}

/** Elimina un rol. */
export async function deleteRole(id: number): Promise<void> {
  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) throw error
}

/** Lista de usuarios con sus perfiles (solo administrador). */
export async function getUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** Actualiza el rol de un usuario (solo administrador). */
export async function assignRole(userId: string, role: RoleName): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) throw error
}

/** Permisos por defecto según rol (fallback si no hay BD). */
const DEFAULT_PERMISSIONS: Record<RoleName, Permission[]> = {
  Administrador: ['dashboard:view', 'catalog:view', 'catalog:manage', 'appointments:view', 'appointments:manage', 'patients:view', 'patients:manage', 'cash:view', 'cash:manage', 'sales:view', 'sales:manage', 'customers:view', 'customers:manage', 'users:manage', 'roles:manage', 'reports:view', 'inventory:manage'],
  Veterinario: ['dashboard:view', 'appointments:view', 'appointments:manage', 'patients:view', 'patients:manage', 'catalog:view', 'reports:view'],
  Caja: ['dashboard:view', 'cash:view', 'cash:manage', 'sales:view', 'sales:manage', 'customers:view', 'customers:manage', 'catalog:view', 'reports:view'],
  Cliente: ['dashboard:view', 'appointments:view', 'patients:view'],
}

/** Devuelve los permisos efectivos de un rol. */
export function getPermissionsForRole(role: RoleName): Permission[] {
  return DEFAULT_PERMISSIONS[role] ?? []
}