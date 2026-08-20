'use client'

import { useState } from 'react'
import { Check, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import type { Toast } from '@/lib/types'

const initialRoles = [
  { id: 1, name: 'Administrador', description: 'Acceso completo al sistema.', users: 1, permissions: ['Dashboard', 'Caja', 'Catálogo', 'Usuarios'] },
  { id: 2, name: 'Veterinario', description: 'Agenda, pacientes e historias clínicas.', users: 3, permissions: ['Agenda', 'Pacientes', 'Historias'] },
  { id: 3, name: 'Caja', description: 'Ventas, caja y facturación.', users: 2, permissions: ['Caja', 'Ventas', 'Clientes'] },
]

export default function RolesPage({ showToast }: { showToast: Toast }) {
  const [roles, setRoles] = useState(initialRoles)
  const [selected, setSelected] = useState(roles[0])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  function createRole() {
    if (!name.trim()) return
    const role = { id: Date.now(), name, description: 'Rol personalizado para el equipo.', users: 0, permissions: ['Dashboard'] }
    setRoles((current) => [...current, role]); setSelected(role); setName(''); setCreating(false); showToast('Rol creado correctamente')
  }

  return <section className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Administración</p><h1 className="mt-2 font-serif text-4xl font-bold text-[#173b3b]">Roles y permisos</h1><p className="mt-2 text-sm text-[#78918a]">Define qué puede ver y hacer cada perfil.</p></div><button onClick={() => setCreating(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Nuevo rol</button></header>
    <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]"> <div className="flex gap-3 overflow-x-auto lg:flex-col">{roles.map((role) => <button key={role.id} onClick={() => setSelected(role)} className={`min-w-56 rounded-2xl p-4 text-left ring-1 ${selected.id === role.id ? 'bg-[#0d5c5b] text-white ring-[#0d5c5b]' : 'bg-white text-[#173b3b] ring-[#e1ebe6]'}`}><ShieldCheck className="size-5" /><b className="mt-3 block font-serif text-lg">{role.name}</b><span className="mt-1 block text-xs opacity-75">{role.users} usuarios</span></button>)}</div><article className="rounded-[2rem] bg-white p-6 ring-1 ring-[#e1ebe6] md:p-8"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl font-bold text-[#173b3b]">{selected.name}</h2><p className="mt-2 text-sm text-[#78918a]">{selected.description}</p></div><button onClick={() => { setRoles((current) => current.filter((role) => role.id !== selected.id)); showToast('Rol eliminado') }} className="rounded-xl p-2 text-[#b56a51] hover:bg-[#f6e8df]" aria-label="Eliminar rol"><Trash2 className="size-4" /></button></div><div className="mt-8 grid gap-3 sm:grid-cols-2">{['Dashboard', 'Agenda', 'Pacientes', 'Caja', 'Ventas', 'Catálogo', 'Usuarios', 'Clientes'].map((permission) => <div key={permission} className="flex items-center gap-3 rounded-xl bg-[#f5f8f5] px-4 py-3 text-sm font-semibold text-[#52756c]"><span className={`flex size-6 items-center justify-center rounded-lg ${selected.permissions.includes(permission) ? 'bg-[#dcefe2] text-[#477b5c]' : 'bg-[#e9efeb] text-[#a0b1a9]'}`}><Check className="size-3" /></span>{permission}</div>)}</div></article></div>
    {creating && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173b3b]/35 p-6"><div className="w-full max-w-md rounded-[2rem] bg-white p-7"><h2 className="font-serif text-2xl font-bold text-[#173b3b]">Nuevo rol</h2><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del rol" className="mt-6 w-full rounded-xl bg-[#f5f8f5] px-4 py-3 text-sm outline-none ring-1 ring-[#e1ebe6]" /><div className="mt-6 flex justify-end gap-3"><button onClick={() => setCreating(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#78918a]">Cancelar</button><button onClick={createRole} className="rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white">Crear rol</button></div></div></div>}
  </section>
}
