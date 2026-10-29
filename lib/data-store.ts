import { fallbackProducts, fallbackPets, fallbackServices } from './mock-data'
import type { Product, Pet } from './types'

type Store = { products: Product[]; pets: Pet[]; services: typeof fallbackServices }

const seed: Store = { products: fallbackProducts, pets: fallbackPets, services: fallbackServices }
let store: Store = structuredClone(seed)

const delay = <T>(value: T) => Promise.resolve(structuredClone(value))

export const dataStore = {
  products: () => delay(store.products),
  pets: () => delay(store.pets),
  services: () => delay(store.services),
  addProduct: (product: Product) => { store.products = [...store.products, product]; return delay(product) },
  updateProduct: (id: number, patch: Partial<Product>) => { store.products = store.products.map((item) => item.id === id ? { ...item, ...patch } : item); return delay(store.products.find((item) => item.id === id)) },
  removeProduct: (id: number) => { store.products = store.products.filter((item) => item.id !== id); return delay(true) },
  reset: () => { store = structuredClone(seed); return delay(true) },
}

