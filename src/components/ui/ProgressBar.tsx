/**
 * Barra de progresso para serviços
 * ADR-009: Indicador visual de percentual de conclusão
 */

interface ProgressBarProps {
  percentual: number  // 0-100
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
} as const

const VARIANT_COLORS = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
} as const

export function ProgressBar({
  percentual,
  showLabel = false,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  // Garantir que o percentual está entre 0 e 100
  const valor = Math.max(0, Math.min(100, percentual))

  // Auto-detectar variant baseado no percentual se não especificado
  let color = variant
  if (variant === 'default') {
    if (valor >= 90) {
      color = 'success'
    } else if (valor >= 60) {
      color = 'default'
    } else if (valor >= 30) {
      color = 'warning'
    } else {
      color = 'danger'
    }
  }

  const barColor = VARIANT_COLORS[color]
  const heightClass = SIZE_CLASSES[size]

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">Progresso</span>
          <span className="font-semibold text-gray-900">{valor}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${heightClass}`}>
        <div
          className={`${heightClass} ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${valor}%` }}
          role="progressbar"
          aria-valuenow={valor}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
