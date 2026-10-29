'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCurrentProfile, getPermissionsForRole } from '@/lib/services/auth'
import type { Permission, Profile } from '@/lib/types'

const PROFILE_STORAGE_KEY = 'akimax:profile'
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => { const current = await getCurrentProfile(); setProfile(current); if (current) localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(current)); else localStorage.removeItem(PROFILE_STORAGE_KEY); setLoading(false) }, [])
  useEffect(() => { void refresh(); const handler = () => void refresh(); window.addEventListener('akimax:auth', handler); return () => window.removeEventListener('akimax:auth', handler) }, [refresh])
  const permissions = profile ? getPermissionsForRole(profile.role) : []
  const hasPermission = (permission: Permission) => permissions.includes(permission)
  return { profile, permissions, loading, isAuthenticated: Boolean(profile), hasPermission, refresh }
}
