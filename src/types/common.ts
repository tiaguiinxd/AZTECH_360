/**
 * Tipos comuns utilizados em todo o sistema
 */

/** ID único (número auto-incrementado) */
export type ID = number

/** Data no formato ISO string */
export type ISODateString = string

/** Resultado de validação */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

/** Status genérico para entidades */
export type EntityStatus = 'ativo' | 'inativo'

/** Ordenação */
export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

/** Paginação */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

/** Filtro genérico */
export interface FilterConfig {
  search?: string
  status?: EntityStatus
}
