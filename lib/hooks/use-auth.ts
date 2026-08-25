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
 * La sesión se basa en la sesión real de Supabase (auth.getUser),
 * no en la existencia del perfil: así la sesión persiste aunque el
 * perfil aún no se haya creado en la tabla profiles.
 */
export function useAuth(): UseAuthResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionActive, setSessionActive] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Verificar la sesión real en Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        setPermissions([])
        setSessionActive(false)
        return
      }

      // 2. Sesión activa: cargar (o crear) el perfil
      setSessionActive(true)
      const current = await getCurrentProfile()
      setProfile(current)
      setPermissions(current ? getPermissionsForRole(current.role) : [])
    } catch {
      setProfile(null)
      setPermissions([])
      setSessionActive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    // Escuchar cambios de sesión (login/logout) para mantener el estado al día
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
    isAuthenticated: sessionActive,
    hasPermission,
    refresh,
  }
}