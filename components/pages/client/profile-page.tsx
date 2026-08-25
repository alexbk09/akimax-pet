'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Mail, Phone, User } from 'lucide-react'
import { changePassword, updateProfile } from '@/lib/services/auth'
import { useAuth } from '@/lib/hooks'
import type { Toast } from '@/lib/types'
import { PageContainer, PageHeader } from '@/components/pages/shared/page-header'

/** Página de perfil: editar datos personales y cambiar contraseña. */
export function ProfilePage({ showToast }: { showToast: Toast }) {
  const { profile, refresh } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() })
      await refresh()
      showToast('Perfil actualizado correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }
    setChangingPassword(true)
    try {
      await changePassword(newPassword)
      showToast('Contraseña actualizada. Úsala en tu próximo inicio de sesión.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No pudimos cambiar la contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Mi cuenta"
        title="Mi perfil"
        description="Mantén tus datos al día para recibir recordatorios y un mejor servicio."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSave} className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#e8dfd1] font-serif text-lg font-bold text-[#6d5847]">{profile?.full_name?.slice(0, 2).toUpperCase() ?? 'US'}</span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#173b3b]">Información personal</h2>
              <p className="text-sm text-[#78918a]">{profile?.role ?? ''} · {profile?.email ?? ''}</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <Field label="Nombre completo" icon={<User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Correo electrónico" icon={<Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
              <input type="email" value={profile?.email ?? ''} disabled className={`${inputClass} opacity-60`} />
            </Field>
            <Field label="Teléfono" icon={<Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+58 412-000.00.00" className={inputClass} />
            </Field>
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="rounded-3xl bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#e7f1eb] text-[#0d5c5b]"><KeyRound className="size-6" /></span>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#173b3b]">Cambiar contraseña</h2>
              <p className="text-sm text-[#78918a]">Usa al menos 6 caracteres.</p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <Field label="Nueva contraseña" icon={<KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
              <input type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="••••••••" className={inputClass} />
            </Field>
            <Field label="Confirmar contraseña" icon={<KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
              <input type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repite tu contraseña" className={inputClass} />
            </Field>
          </div>

          {passwordError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{passwordError}</p>}

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
            {changingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </PageContainer>
  )
}

const inputClass = 'w-full rounded-2xl border-0 bg-[#f7f9f7] py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]'

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#173b3b]">{label}</span>
      <div className="relative mt-2">
        {icon}
        {children}
      </div>
    </label>
  )
}