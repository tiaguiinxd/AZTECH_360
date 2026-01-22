/**
 * Badge para exibir a prioridade de um serviço
 * ADR-009: Indicadores visuais de prioridade
 */

interface PrioridadeBadgeProps {
  prioridade: number  // 1=Crítica, 2=Alta, 3=Média, 4=Baixa, 5=Muito Baixa
  size?: 'sm' | 'md' | 'lg'
}

const PRIORIDADE_CONFIG = {
  1: { label: 'Crítica', color: 'bg-red-100 text-red-800 border-red-300' },
  2: { label: 'Alta', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  3: { label: 'Média', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  4: { label: 'Baixa', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  5: { label: 'Muito Baixa', color: 'bg-gray-100 text-gray-800 border-gray-300' },
} as const

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
} as const

export function PrioridadeBadge({ prioridade, size = 'md' }: PrioridadeBadgeProps) {
  const config = PRIORIDADE_CONFIG[prioridade as keyof typeof PRIORIDADE_CONFIG] || PRIORIDADE_CONFIG[3]
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold ${config.color} ${sizeClass}`}
      title={`Prioridade: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
