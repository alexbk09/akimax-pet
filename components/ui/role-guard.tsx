'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import type { Permission } from '@/lib/types'
import { PageLoader } from './loading'
import { AlertTriangle, LogIn } from 'lucide-react'

interface RoleGuardProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
  onAuthRequired?: () => void
}

/**
 * Protege un módulo o acción verificando el permiso del rol actual.
 * Muestra un loader mientras carga la sesión y ofrece iniciar
 * sesión cuando el visitante no está autenticado.
 */
export function RoleGuard({ permission, children, fallback, onAuthRequired }: RoleGuardProps) {
  const { loading, isAuthenticated, hasPermission } = useAuth()

  if (loading) return <PageLoader label="Verificando permisos..." />

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-[#e1ebe6]">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]">
          <LogIn className="size-6" />
        </span>
        <h3 className="font-serif text-xl font-bold text-[#173b3b]">Inicia sesión para continuar</h3>
        <p className="max-w-sm text-sm text-[#78918a]">
          Esta sección requiere una cuenta. Crea la tuya gratis o inicia sesión para acceder.
        </p>
        {onAuthRequired && (
          <button
            onClick={onAuthRequired}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <LogIn className="size-4" /> Iniciar sesión
          </button>
        )}
      </div>
    )
  }

  if (!hasPermission(permission)) {
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-[#e1ebe6]">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#fbede7] text-[#b56a51]">
          <AlertTriangle className="size-6" />
        </span>
        <h3 className="font-serif text-xl font-bold text-[#173b3b]">Acceso restringido</h3>
        <p className="max-w-sm text-sm text-[#78918a]">
          Tu rol actual no tiene permisos para ver este módulo. Contacta a un administrador si necesitas acceso.
        </p>
      </div>
    )
  }

  return <>{children}</>
}