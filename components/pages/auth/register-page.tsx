'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Lock, Mail, PawPrint, Phone, User } from 'lucide-react'
import { signUp } from '@/lib/services/auth'
import type { SetView } from '@/lib/types'

/**
 * Registro de clientes.
 * Crea la cuenta de acceso y da la bienvenida al panel de cliente.
 */
export function RegisterPage({ setView }: { setView: SetView }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await signUp(email.trim(), password, fullName.trim(), phone.trim())
      setSuccess('Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[#0d5c5b] text-[#e7f1df]"><PawPrint className="size-7" /></span>
        <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-[#173b3b]">Crea tu cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-[#78918a]">Regístrate para agendar citas y llevar el control de tus mascotas.</p>
      </div>
      <RegisterForm
        fullName={fullName}
        email={email}
        phone={phone}
        password={password}
        confirmPassword={confirmPassword}
        loading={loading}
        error={error}
        success={success}
        onFullName={setFullName}
        onEmail={setEmail}
        onPhone={setPhone}
        onPassword={setPassword}
        onConfirmPassword={setConfirmPassword}
        onSubmit={handleSubmit}
      />
      <p className="mt-6 text-center text-sm text-[#78918a]">
        ¿Ya tienes cuenta?{' '}
        <button onClick={() => setView('login')} className="font-bold text-[#0d5c5b] hover:underline">Inicia sesión</button>
      </p>
    </div>
  )
}

function RegisterForm({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
  loading,
  error,
  success,
  onFullName,
  onEmail,
  onPhone,
  onPassword,
  onConfirmPassword,
  onSubmit,
}: {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  loading: boolean
  error: string
  success: string
  onFullName: (value: string) => void
  onEmail: (value: string) => void
  onPhone: (value: string) => void
  onPassword: (value: string) => void
  onConfirmPassword: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  const inputClass = 'w-full rounded-2xl border-0 bg-[#f7f9f7] py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]'
  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] sm:p-8">
      <Field label="Nombre completo" icon={<User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
        <input type="text" required value={fullName} onChange={(event) => onFullName(event.target.value)} placeholder="María Fernanda Soto" className={inputClass} />
      </Field>
      <Field label="Correo electrónico" icon={<Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
        <input type="email" required value={email} onChange={(event) => onEmail(event.target.value)} placeholder="tucorreo@ejemplo.com" className={inputClass} />
      </Field>
      <Field label="Teléfono" icon={<Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
        <input type="tel" value={phone} onChange={(event) => onPhone(event.target.value)} placeholder="+58 412-000.00.00" className={inputClass} />
      </Field>
      <Field label="Contraseña" icon={<Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
        <input type="password" required value={password} onChange={(event) => onPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
      </Field>
      <Field label="Confirmar contraseña" icon={<Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />}>
        <input type="password" required value={confirmPassword} onChange={(event) => onConfirmPassword(event.target.value)} placeholder="Repite tu contraseña" className={inputClass} />
      </Field>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

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