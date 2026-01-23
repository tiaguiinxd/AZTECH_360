/**
 * Card de um setor com suas entregas
 *
 * Exibe um setor com suas entregas expansíveis
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Briefcase,
  Wrench,
  Package,
  DollarSign,
  Cog,
  Users,
  HardHat,
  Building2,
  Target,
  ListChecks,
} from 'lucide-react'
import type { SetorInfo } from '../types'
import { EntregaItem } from './EntregaItem'

interface SetorCardProps {
  setor: SetorInfo
  isExpanded?: boolean
  onToggle?: () => void
}

const SETOR_ICONES: Record<string, React.ElementType> = {
  Briefcase,
  Wrench,
  Package,
  DollarSign,
  Cog,
  Users,
  HardHat,
  Building2,
}

// Mapa de cores para classes Tailwind do header
const COR_HEADER_MAP: Record<SetorInfo['cor'], string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
}

// Mapa de cores para classes Tailwind do background
const COR_BG_MAP: Record<SetorInfo['cor'], string> = {
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  amber: 'bg-amber-50 border-amber-200',
  green: 'bg-green-50 border-green-200',
  indigo: 'bg-indigo-50 border-indigo-200',
  pink: 'bg-pink-50 border-pink-200',
  orange: 'bg-orange-50 border-orange-200',
  gray: 'bg-gray-50 border-gray-200',
}

export function SetorCard({ setor, isExpanded = false, onToggle }: SetorCardProps) {
  const Icone = SETOR_ICONES[setor.icone] || Briefcase
  const corHeader = COR_HEADER_MAP[setor.cor]
  const corBg = COR_BG_MAP[setor.cor]

  return (
    <div className={`rounded-lg border-2 overflow-hidden shadow-sm ${corBg}`}>
      {/* Header do setor */}
      <button
        onClick={onToggle}
        className={`w-full ${corHeader} text-white p-4 hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Icone className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold">{setor.nome}</h3>
              <p className="text-sm text-white/80">{setor.descricao}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-white/80">{setor.entregas.length} entregas</div>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-6 w-6" />
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="bg-white">
          {/* Responsabilidades Principais */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Responsabilidades Principais
                </h4>
                <ul className="space-y-1.5">
                  {setor.responsabilidadesPrincipais.map((resp, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-blue-500 font-bold select-none mt-0.5">✓</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Entregas */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Entregas Principais
              </h4>
            </div>
            <div className="space-y-2">
              {setor.entregas.map((entrega, idx) => (
                <EntregaItem
                  key={entrega.id}
                  entrega={entrega}
                  isLast={idx === setor.entregas.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
