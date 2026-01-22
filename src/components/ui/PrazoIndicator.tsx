/**
 * Indicador de prazo para serviços
 * ADR-009: Indicadores visuais de urgência de prazo
 */
import { Clock, AlertTriangle } from 'lucide-react'

interface PrazoIndicatorProps {
  diasAtePrazo: number | null
  prazoRigido: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'text-xs gap-1',
  md: 'text-sm gap-1.5',
  lg: 'text-base gap-2',
} as const

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
} as const

export function PrazoIndicator({ diasAtePrazo, prazoRigido, size = 'md' }: PrazoIndicatorProps) {
  if (diasAtePrazo === null) {
    return (
      <span className={`inline-flex items-center text-gray-400 ${SIZE_CLASSES[size]}`}>
        <Clock size={ICON_SIZES[size]} />
        <span>Sem prazo</span>
      </span>
    )
  }

  // Define cor baseada na urgência
  let colorClass = 'text-gray-600'
  let bgClass = 'bg-gray-50'

  if (diasAtePrazo < 0) {
    // Atrasado
    colorClass = 'text-red-700'
    bgClass = 'bg-red-50'
  } else if (diasAtePrazo <= 7) {
    // Menos de 1 semana
    colorClass = 'text-red-600'
    bgClass = 'bg-red-50'
  } else if (diasAtePrazo <= 15) {
    // Menos de 15 dias
    colorClass = 'text-orange-600'
    bgClass = 'bg-orange-50'
  } else if (diasAtePrazo <= 30) {
    // Menos de 1 mês
    colorClass = 'text-yellow-600'
    bgClass = 'bg-yellow-50'
  }

  const texto = diasAtePrazo < 0
    ? `Atrasado ${Math.abs(diasAtePrazo)}d`
    : diasAtePrazo === 0
    ? 'Prazo hoje'
    : `${diasAtePrazo}d restantes`

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 font-medium ${colorClass} ${bgClass} ${SIZE_CLASSES[size]}`}
      title={prazoRigido ? 'Prazo rígido (multas contratuais)' : 'Prazo flexível'}
    >
      {prazoRigido ? <AlertTriangle size={ICON_SIZES[size]} /> : <Clock size={ICON_SIZES[size]} />}
      <span>{texto}</span>
    </span>
  )
}
