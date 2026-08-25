'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCurrentProfile, getPermissionsForRole } from '@/lib/services/auth'
import { supabase } from '@/lib/supabase/client'
import type { Permission, Profile } from '@/lib/types'

interface UseAuthResult {
  profile: Profile | null
  permissions: Permission[]
  loading: boolean
  isAuthenticated: boolean
  hasPermission: (permission: Permission) => boolean
  refresh: () => Promise<void>
}

/**
 * Hook de autenticación y permisos.
 * Expone el perfil, los permisos efectivos del rol y una función
 * para verificar acceso a módulos específicos.
 */
export function useAuth(): UseAuthResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const current = await getCurrentProfile()
      setProfile(current)
      setPermissions(current ? getPermissionsForRole(current.role) : [])
    } catch {
      setProfile(null)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    // Escuchar cambios de sesión (login/logout)
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      void refresh()
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
    isAuthenticated: Boolean(profile),
    hasPermission,
    refresh,
  }
}