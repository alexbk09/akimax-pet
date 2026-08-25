'use client'

import { useCallback, useEffect, useState } from 'react'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { useDebounce, useAsync } from '@/lib/hooks'
import { getProducts, getServices, getCategories, deleteProduct } from '@/lib/services/catalog'
import { getCustomers } from '@/lib/services/customers'
import { getUsers } from '@/lib/services/auth'
import { Pagination, TableSkeleton, EmptyState } from '@/components/ui'

type AdminSection = 'productos' | 'servicios' | 'categorias' | 'usuarios' | 'clientes'
const PAGE_SIZE = 5

const sectionLabels: { id: AdminSection; label: string }[] = [
  { id: 'productos', label: 'Productos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'clientes', label: 'Clientes' },
]

/**
 * Centro de control con conexión real a Supabase.
 * Cada sección carga desde services y usa paginación + skeleton.
 */
export default function AdminModule({ showToast }: { showToast: (message: string) => void }) {
  const [section, setSection] = useState<AdminSection>('productos')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<unknown>(null)
  const debouncedQuery = useDebounce(query, 300)

  const fetcher = useCallback(async () => {
    if (section === 'productos') return (await getProducts({ page, pageSize: PAGE_SIZE, search: debouncedQuery })).data
    if (section === 'servicios') return (await getServices({ page, pageSize: PAGE_SIZE, search: debouncedQuery })).data
    if (section === 'categorias') return await getCategories()
    if (section === 'usuarios') return await getUsers()
    return (await getCustomers({ page, pageSize: PAGE_SIZE, search: debouncedQuery })).data
  }, [section, page, debouncedQuery])

  const { data, loading, error, reload } = useAsync<unknown[]>(fetcher, [fetcher])

  useEffect(() => setPage(1), [section, debouncedQuery])

  const rows = data ?? []
  const totalItems = rows.length

  function open(item?: unknown) {
    setEditing(item ?? null)
    setModal(true)
  }

  function handleDelete(id: number) {
    if (section === 'productos') {
      void deleteProduct(id).then(() => { reload(); showToast('Producto eliminado') }).catch(() => showToast('No se pudo eliminar'))
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Administración</p>
          <h2 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#173b3b]">Centro de control</h2>
          <p className="mt-2 text-sm text-[#78918a]">Gestiona tu catálogo, equipo y cartera de clientes.</p>
        </div>
        <button onClick={() => open()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5c5b] px-4 py-3 text-sm font-bold text-white"><Plus className="size-4" /> Nuevo {section === 'productos' ? 'producto' : section === 'servicios' ? 'servicio' : section === 'categorias' ? 'categoría' : section === 'usuarios' ? 'usuario' : 'cliente'}</button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {sectionLabels.map((item) => (
          <button key={item.id} onClick={() => { setSection(item.id); setQuery('') }} className={`rounded-2xl p-4 text-left ring-1 transition ${section === item.id ? 'bg-[#0d5c5b] text-white ring-[#0d5c5b]' : 'bg-white text-[#52756c] ring-[#e1ebe6] hover:bg-[#f1f7f3]'}`}>
            <p className="text-xs font-semibold opacity-75">Módulo</p>
            <p className="mt-1 font-serif text-lg font-bold">{item.label}</p>
            <p className="mt-2 text-xs opacity-75">{loading ? 'Cargando...' : `${totalItems} registros`}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-[#e1ebe6] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#173b3b]">{sectionLabels.find((x) => x.id === section)?.label}</h3>
            <p className="mt-1 text-sm text-[#8aa096]">Busca, revisa y actualiza la información.</p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8aa096]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="w-full rounded-xl border-0 bg-[#f5f8f5] py-2.5 pl-10 pr-3 text-sm outline-none ring-1 ring-[#e1ebe6] focus:ring-2 focus:ring-[#9ec6b4]" />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={5} cols={section === 'clientes' ? 6 : 5} />
          ) : error ? (
            <EmptyState title="No pudimos cargar los datos" description={error} />
          ) : (
            <AdminTable section={section} rows={rows} onEdit={open} onDelete={(id) => handleDelete(id)} />
          )}
        </div>

        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {modal && <AdminForm section={section} initial={editing} onClose={() => setModal(false)} onSave={(value) => { setModal(false); reload(); showToast(`${section.slice(0, -1)} guardado correctamente`) }} />}
    </div>
  )
}

function AdminTable({ section, rows, onEdit, onDelete }: { section: AdminSection; rows: unknown[]; onEdit: (row: unknown) => void; onDelete: (id: number) => void }) {
  const columns = section === 'productos' ? ['Producto', 'Categoría', 'Precio', 'Stock', 'Estado'] : section === 'servicios' ? ['Servicio', 'Área', 'Duración', 'Estado'] : section === 'categorias' ? ['Categoría', 'Tipo', 'Estado'] : section === 'usuarios' ? ['Usuario', 'Contacto', 'Rol'] : ['Cliente', 'Contacto', 'Estado']

  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead>
        <tr className="border-b border-[#e8efea] text-xs uppercase tracking-wide text-[#91a79e]">
          {columns.map((head) => <th key={head} className="px-3 pb-3 font-semibold">{head}</th>)}
          <th className="px-3 pb-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const typed = row as Record<string, unknown>
          return (
            <tr key={String(typed.id)} className="border-b border-[#edf2ee] last:border-0">
              <td className="px-3 py-4 font-semibold text-[#173b3b]">{String(typed.name ?? typed.full_name ?? '')}</td>
              <td className="px-3 py-4 text-[#52756c]">{String(typed.category ?? typed.area ?? typed.type ?? typed.email ?? typed.phone ?? '')}</td>
              <td className="px-3 py-4 text-[#52756c]">{typed.price !== undefined ? `$${Number(typed.price).toFixed(2)}` : String(typed.duration ?? typed.role ?? typed.phone ?? '')}</td>
              <td className="px-3 py-4 text-[#52756c]">{typed.stock !== undefined ? `${typed.stock} un.` : String(typed.status ?? '')}</td>
              <td className="px-3 py-4 text-[#52756c]"><Status value={String(typed.status ?? 'Activo')} /></td>
              <td className="px-3 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(row)} className="rounded-lg p-2 text-[#66817a] hover:bg-[#e7f1eb]" aria-label="Editar"><Edit3 className="size-4" /></button>
                  <button onClick={() => onDelete(Number(typed.id))} className="rounded-lg p-2 text-[#b56a51] hover:bg-[#fbede7]" aria-label="Eliminar"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Status({ value }: { value: string }) {
  const active = value === 'Activo' || value === 'Visible'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-[#e3f1e6] text-[#477b5c]' : 'bg-[#f6e8df] text-[#b56a51]'}`}>{value}</span>
}

function AdminForm({ section, initial, onClose, onSave }: { section: AdminSection; initial: unknown; onClose: () => void; onSave: (value: unknown) => void }) {
  const original = (initial ?? {}) as Record<string, unknown>
  const [form, setForm] = useState<Record<string, unknown>>({ name: '', slug: '', category: '', price: 0, stock: 0, status: 'Activo', ...original })

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173b3b]/35 backdrop-blur-sm md:items-center md:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl md:rounded-[2rem] md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d37c52]">Formulario</p>
            <h3 className="mt-1 font-serif text-3xl font-bold text-[#173b3b]">{initial ? 'Editar' : 'Nuevo'} {section.slice(0, -1)}</h3>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#78918a] hover:bg-[#f1f6f2]"><X className="size-5" /></button>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre"><input value={String(form.name ?? '')} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Slug"><input value={String(form.slug ?? '')} onChange={(e) => set('slug', e.target.value)} /></Field>
          {section === 'productos' && <><Field label="Precio USD"><input type="number" value={Number(form.price) || 0} onChange={(e) => set('price', Number(e.target.value))} /></Field><Field label="Stock"><input type="number" value={Number(form.stock) || 0} onChange={(e) => set('stock', Number(e.target.value))} /></Field></>}
          {section === 'servicios' && <><Field label="Duración"><input value={String(form.duration ?? '30 min')} onChange={(e) => set('duration', e.target.value)} /></Field><Field label="Área"><select value={String(form.area ?? 'Veterinaria')} onChange={(e) => set('area', e.target.value)}><option>Veterinaria</option><option>Peluquería</option></select></Field></>}
          <Field label="Estado" full><select value={String(form.status ?? 'Activo')} onChange={(e) => set('status', e.target.value)}><option>Activo</option><option>Borrador</option><option>Inactivo</option></select></Field>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-bold text-[#66817a]">Cancelar</button>
          <button onClick={() => onSave(form)} className="rounded-xl bg-[#0d5c5b] px-5 py-3 text-sm font-bold text-white">Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`flex flex-col gap-2 text-xs font-bold text-[#52756c] ${full ? 'sm:col-span-2' : ''}`}>{label}{children}</label>
}