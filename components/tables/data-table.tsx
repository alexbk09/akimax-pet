import type { ReactNode } from 'react'

export type TableColumn<T> = { key: string; label: string; render?: (row: T) => ReactNode }
export function DataTable<T extends { id: number | string }>({ columns, rows, empty = 'No hay registros.' }: { columns: TableColumn<T>[]; rows: T[]; empty?: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-[#e8efea] text-xs uppercase tracking-wide text-[#91a79e]">{columns.map((column) => <th key={column.key} className="px-3 pb-3 font-semibold">{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-[#edf2ee] last:border-0">{columns.map((column) => <td key={column.key} className="px-3 py-4 text-[#52756c]">{column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="p-8 text-center text-sm text-[#78918a]">{empty}</p>}</div>
}
