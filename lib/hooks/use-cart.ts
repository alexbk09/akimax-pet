'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/lib/types'

const CART_STORAGE_KEY = 'akimax:cart'

interface UseCartResult {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, delta: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

/**
 * Hook del carrito de compras con persistencia local.
 * Unifica el carrito de tienda y el de caja bajo la misma lógica.
 */
export function useCart(): UseCartResult {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito persistido al montar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      // Sin carrito previo
    }
  }, [])

  // Persistir carrito en cada cambio
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage no disponible
    }
  }, [items])

  /** Agrega un artículo o incrementa su cantidad si ya existe. */
  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const found = current.find((existing) => existing.id === item.id)
      if (found) {
        return current.map((existing) =>
          existing.id === item.id ? { ...existing, quantity: existing.quantity + item.quantity } : existing,
        )
      }
      return [...current, item]
    })
  }, [])

  /** Cambia la cantidad de un artículo (mínimo 1). */
  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((current) =>
      current.flatMap((item) =>
        item.id === id
          ? item.quantity + delta > 0
            ? [{ ...item, quantity: item.quantity + delta }]
            : []
          : [item],
      ),
    )
  }, [])

  /** Elimina un artículo del carrito. */
  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  /** Vacía el carrito. */
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  return { items, count, subtotal, addItem, updateQuantity, removeItem, clearCart }
}