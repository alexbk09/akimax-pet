'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Lock, Mail, PawPrint } from 'lucide-react'
import { signIn } from '@/lib/services/auth'
import type { SetView, Toast } from '@/lib/types'

export function LoginPage({ setView, showToast }: { setView: SetView; showToast: Toast }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      showToast('¡Sesión iniciada correctamente!')
      // El hook useAuth escucha onAuthStateChange y actualiza el estado.
      // Redirigir a inicio: allí se muestra el dashboard si la sesión persiste.
      setView('inicio')
    } catch {
      setError('Credenciales incorrectas. Revisa tu correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[#0d5c5b] text-[#e7f1df]"><PawPrint className="size-7" /></span>
        <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-[#173b3b]">Bienvenido de nuevo</h1>
        <p className="mt-2 text-sm leading-6 text-[#78918a]">Inicia sesión para gestionar tus mascotas, citas y compras.</p>
      </div>
      <LoginForm
        email={email}
        password={password}
        loading={loading}
        error={error}
        onEmail={setEmail}
        onPassword={setPassword}
        onSubmit={handleSubmit}
      />
      <p className="mt-6 text-center text-sm text-[#78918a]">
        ¿No tienes cuenta?{' '}
        <button onClick={() => setView('registro')} className="font-bold text-[#0d5c5b] hover:underline">Regístrate gratis</button>
      </p>
    </div>
  )
}

function LoginForm({
  email,
  password,
  loading,
  error,
  onEmail,
  onPassword,
  onSubmit,
}: {
  email: string
  password: string
  loading: boolean
  error: string
  onEmail: (value: string) => void
  onPassword: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e1ebe6] sm:p-8">
      <label className="block">
        <span className="text-sm font-semibold text-[#173b3b]">Correo electrónico</span>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full rounded-2xl border-0 bg-[#f7f9f7] py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]"
          />
        </div>
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-[#173b3b]">Contraseña</span>
        <div className="relative mt-2">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8ca59c]" />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => onPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border-0 bg-[#f7f9f7] py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[#e1ebe6] placeholder:text-[#a0b4ac] focus:ring-2 focus:ring-[#9ec6b0]"
          />
        </div>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-5 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}