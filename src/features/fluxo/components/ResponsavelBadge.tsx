/**
 * Badge para exibir o setor responsável
 *
 * Exibe um badge colorido com ícone representando o setor responsável
 */

import {
  Briefcase,
  Wrench,
  Package,
  DollarSign,
  Cog,
  Users,
  HardHat,
} from 'lucide-react'
import type { ResponsavelSetor } from '../types'
import { SETOR_CONFIG } from '../types'

interface ResponsavelBadgeProps {
  setor: ResponsavelSetor
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const ICONES: Record<ResponsavelSetor, React.ElementType> = {
  comercial: Briefcase,
  tecnico: Wrench,
  suprimentos: Package,
  financeiro: DollarSign,
  engenharia: Cog,
  rh: Users,
  campo: HardHat,
  todos: Users,
}

export function ResponsavelBadge({
  setor,
  size = 'md',
  showLabel = true,
}: ResponsavelBadgeProps) {
  const config = SETOR_CONFIG[setor]
  const Icone = ICONES[setor]

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.cor} ${sizeClasses[size]}`}
    >
      <Icone size={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
