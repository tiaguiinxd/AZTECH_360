/**
 * Utilitários de formatação
 */

/**
 * Formata valor monetário em Real brasileiro
 */
export function formatCurrency(value: number | null): string {
  if (value === null) return 'N/A'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata data ISO para formato brasileiro
 */
export function formatDate(date: string | null): string {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('pt-BR')
}

/**
 * Formata data e hora ISO para formato brasileiro
 */
export function formatDateTime(date: string | null): string {
  if (!date) return 'N/A'

  return new Date(date).toLocaleString('pt-BR')
}

/**
 * Formata número com separador de milhares
 */
export function formatNumber(value: number | null, decimals = 0): string {
  if (value === null) return 'N/A'

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
