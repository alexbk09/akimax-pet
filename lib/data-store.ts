import { fallbackProducts, fallbackPets, fallbackServices } from './mock-data'
import type { Product, Pet } from './types'

type Store = { products: Product[]; pets: Pet[]; services: typeof fallbackServices }

const seed: Store = { products: fallbackProducts, pets: fallbackPets, services: fallbackServices }
let store: Store = structuredClone(seed)

const delay = <T>(value: T) => Promise.resolve(structuredClone(value))

export const dataStore = {
  products: () => delay(store.products),
  pets: (customerId?: number) => delay(customerId ? store.pets.filter((pet) => pet.customer_id === customerId) : store.pets),
  addPet: (pet: Omit<Pet, 'id' | 'created_at'>) => { const saved = { ...pet, id: Math.max(0, ...store.pets.map((item) => item.id)) + 1, created_at: new Date().toISOString() } as Pet; store.pets = [...store.pets, saved]; return delay(saved) },
  updatePet: (id: number, patch: Partial<Pet>) => { store.pets = store.pets.map((item) => item.id === id ? { ...item, ...patch } : item); return delay(store.pets.find((item) => item.id === id)) },
  services: () => delay(store.services),
  addProduct: (product: Product) => { store.products = [...store.products, product]; return delay(product) },
  updateProduct: (id: number, patch: Partial<Product>) => { store.products = store.products.map((item) => item.id === id ? { ...item, ...patch } : item); return delay(store.products.find((item) => item.id === id)) },
  removeProduct: (id: number) => { store.products = store.products.filter((item) => item.id !== id); return delay(true) },
  reset: () => { store = structuredClone(seed); return delay(true) },
}

