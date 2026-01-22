/**
 * MetricCard - Card de metrica individual
 */

import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const colorClasses = {
  primary: 'bg-aztech-primary text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-red-500 text-white',
  info: 'bg-sky-500 text-white',
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
}: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow">
      <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}
