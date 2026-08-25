'use client'

import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatUSD, formatVES, type CartItem } from '@/lib/types'

interface CartDrawerProps {
  items: CartItem[]
  total: number
  rate: number
  onChangeQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onClose: () => void
  onCheckout: () => void
}

/** Drawer del carrito global con totales USD y VES. */
export function CartDrawer({ items, total, rate, onChangeQuantity, onRemove, onClose, onCheckout }: CartDrawerProps) {
  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-[#173b3b]/30 backdrop-blur-sm" aria-label="Cerrar carrito" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f7f9f7] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d37c52]">Tu selección</p>
            <h2 className="mt-1 font-serif text-3xl font-bold">Carrito</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#66817a] hover:bg-white" aria-label="Cerrar"><X className="size-5" /></button>
        </div>

        <div className="mt-8 flex flex-1 flex-col gap-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="m-auto text-center">
              <ShoppingBag className="mx-auto size-10 text-[#abc0b5]" />
              <p className="mt-4 font-serif text-xl font-bold">Tu carrito está vacío</p>
              <p className="mt-2 text-sm text-[#829990]">Agrega algo bonito para ellos.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#e1ebe6]">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-sm text-[#0d5c5b]">{formatUSD(item.price)} · {formatVES(item.price, rate)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => onChangeQuantity(item.id, -1)} className="flex size-6 items-center justify-center rounded-lg bg-[#edf3ef]"><Minus className="size-3" /></button>
                    <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => onChangeQuantity(item.id, 1)} className="flex size-6 items-center justify-center rounded-lg bg-[#edf3ef]"><Plus className="size-3" /></button>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} aria-label={`Eliminar ${item.name}`} className="self-start p-1 text-[#a5b7ae]"><Trash2 className="size-4" /></button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#dce7e2] pt-5">
          <div className="flex items-end justify-between">
            <span className="text-sm text-[#829990]">Total</span>
            <span className="text-right">
              <b className="block font-serif text-2xl">{formatUSD(total)}</b>
              <small className="text-xs text-[#d37c52]">{formatVES(total, rate)}</small>
            </span>
          </div>
          <button disabled={items.length === 0} onClick={onCheckout} className="mt-5 w-full rounded-xl bg-[#0d5c5b] py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Enviar a caja</button>
        </div>
      </aside>
    </div>
  )
}