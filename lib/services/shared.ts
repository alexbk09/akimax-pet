/** Resultado paginado genérico para todos los services. */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  hasMore: boolean
}