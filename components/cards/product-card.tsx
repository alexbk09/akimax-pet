import { Plus } from 'lucide-react'
import { formatVES } from '@/lib/types'
import type { Product } from '@/lib/types'

export function ProductCard({ product, onAdd, compact = false }: { product: Product; onAdd: () => void; compact?: boolean }) {
  const symbol = product.icon === 'bone' ? '◒' : product.icon === 'bag' ? '▰' : product.icon === 'bed' ? '◓' : product.icon === 'drop' ? '◆' : '●'
  return <article className={`rounded-3xl bg-white p-3 shadow-sm ring-1 ring-[#e1ebe6] ${compact ? '' : 'p-4'}`}>
    <div className={`relative flex ${compact ? 'h-32' : 'h-44'} items-center justify-center rounded-2xl ${product.tone}`}><span className="text-6xl opacity-60">{symbol}</span><span className="absolute left-3 top-3 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#66817a]">{product.category}</span></div>
    <div className="px-1 pt-4"><h3 className="font-serif font-bold text-[#173b3b]">{product.name}</h3><div className="mt-2 flex items-end justify-between gap-2"><span><b className="block text-base text-[#0d5c5b]">${product.price.toFixed(2)}</b><small className="text-xs text-[#8aa096]">{formatVES(product.price)}</small></span><button onClick={onAdd} aria-label={`Agregar ${product.name}`} className="flex size-9 items-center justify-center rounded-xl bg-[#e7f1eb] text-[#0d5c5b] hover:bg-[#0d5c5b] hover:text-white"><Plus className="size-4" /></button></div></div>
  </article>
}
