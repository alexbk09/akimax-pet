'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getCurrentProfile, getPermissionsForRole } from '@/lib/services/auth'
import { supabase } from '@/lib/supabase/client'
import type { Permission, Profile } from '@/lib/types'

const PROFILE_STORAGE_KEY = 'akimax:profile'

/** Perfil + permisos cacheados para arranque instantáneo (stale-while-revalidate). */
interface CachedAuth {
  profile: Profile
  permissions: Permission[]
}

/** Lee el perfil cacheado en localStorage (si existe) para arrancar sin red. */
function readCachedProfile(): CachedAuth | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedAuth
    return parsed.profile?.id ? parsed : null
  } catch {
    return null
  }
}

/** Persiste el perfil y sus permisos para el próximo arranque. */
function persistProfile(profile: Profile, permissions: Permission[]): void {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ profile, permissions }))
  } catch {
    // localStorage no disponible: la caché es solo una optimización.
  }
}

/** Elimina el perfil cacheado al cerrar sesión o si la sesión expiró. */
function clearCachedProfile(): void {
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY)
  } catch {
    // No hacer nada: el siguiente arranque simplemente irá a la red.
  }
}

interface UseAuthResult {
  profile: Profile | null
  permissions: Permission[]
  loading: boolean
  isAuthenticated: boolean
  hasPermission: (permission: Permission) => boolean
  refresh: (options?: { silent?: boolean }) => Promise<void>
}

/**
 * Hook de autenticación y permisos.
 * La sesión se basa en la sesión real de Supabase (auth.getUser),
 * no en la existencia del perfil: así la sesión persiste aunque el
 * perfil aún no se haya creado en la tabla profiles.
 *
 * Optimizaciones para evitar la pantalla de carga al volver a la pestaña:
 * 1. El estado NUNCA se inicializa desde localStorage (evita mismatch de
 *    hidratación SSR/cliente que hacía re-renderizar todo el árbol).
 *    La caché se aplica en useLayoutEffect: antes del primer pintado,
 *    así la UI aparece al instante sin mostrar "Cargando sesión...".
 * 2. TOKEN_REFRESHED de Supabase (al volver a la pestaña) se maneja con
 *    un refresh silencioso que NO vuelve a mostrar el loader.
 */
export function useAuth(): UseAuthResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionActive, setSessionActive] = useState(false)

  // Indica si ya hay una sesión (del caché o del servidor): permite que
  // los refrescos posteriores sean silenciosos sin volver al loader.
  const hasSessionRef = useRef(false)

  // Aplicar la caché local ANTES del primer pintado (sin mismatch SSR).
  // El servidor y el primer render del cliente coinciden (sin sesión);
  // luego, antes de que el usuario vea algo, restauramos la sesión.
  useLayoutEffect(() => {
    const cached = readCachedProfile()
    if (!cached) return
    hasSessionRef.current = true
    setProfile(cached.profile)
    setPermissions(cached.permissions)
    setSessionActive(true)
    setLoading(false)
  }, [])

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true
    // Con una sesión ya visible (caché o previa), nunca mostramos el loader.
    const effectiveSilent = silent || hasSessionRef.current
    if (!effectiveSilent) setLoading(true)
    try {
      // 1. Verificar la sesión real en Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        hasSessionRef.current = false
        clearCachedProfile()
        setProfile(null)
        setPermissions([])
        setSessionActive(false)
        return
      }

      // 2. Sesión activa: cargar (o crear) el perfil y cachearlo
      hasSessionRef.current = true
      setSessionActive(true)
      const current = await getCurrentProfile()
      const currentPermissions = current ? getPermissionsForRole(current.role) : []
      if (current) persistProfile(current, currentPermissions)
      setProfile(current)
      setPermissions(currentPermissions)
    } catch {
      // Error transitorio (red/API): conservar la última sesión conocida
      // para no "desloguear" visualmente al usuario al volver a la pestaña.
      // El siguiente evento de auth (o refresh manual) corregirá el estado.
      if (!hasSessionRef.current) {
        clearCachedProfile()
        setProfile(null)
        setPermissions([])
        setSessionActive(false)
      }
    } finally {
      if (!effectiveSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    // Escuchar cambios de sesión (login/logout) para mantener el estado al día.
    // TOKEN_REFRESHED ocurre al volver a la pestaña con token por expirar:
    // se refresca en silencio para NO mostrar la pantalla de carga.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        void refresh()
      } else if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        void refresh({ silent: true })
      }
    })

    return () => {
      void subscription.subscription.unsubscribe()
    }
  }, [refresh])

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  )

  return {
    profile,
    permissions,
    loading,
    isAuthenticated: sessionActive,
    hasPermission,
    refresh,
  }
}