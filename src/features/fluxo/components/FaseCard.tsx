/**
 * Card de uma fase do fluxo operacional
 *
 * Exibe uma fase com suas subfases expansíveis
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FileSearch,
  ClipboardList,
  Rocket,
  Play,
  Target,
  CheckSquare,
} from 'lucide-react'
import type { Fase, SubFase } from '../types'
import { FASE_CORES } from '../types'
import { ResponsavelBadge } from './ResponsavelBadge'
import { EtapaItem } from './EtapaItem'

interface FaseCardProps {
  fase: Fase
  isExpanded?: boolean
  onToggle?: () => void
}

const FASE_ICONES: Record<string, React.ElementType> = {
  FileSearch,
  ClipboardList,
  Rocket,
  Play,
}

function SubFaseSection({ subFase }: { subFase: SubFase }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {subFase.codigo}
          </span>
          <span className="font-medium text-gray-900">{subFase.titulo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {subFase.responsaveis.map((resp) => (
            <ResponsavelBadge key={resp} setor={resp} size="sm" showLabel={false} />
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 pl-11 bg-gray-50/50">
          {subFase.etapas.map((etapa, idx) => (
            <EtapaItem
              key={etapa.id}
              etapa={etapa}
              isLast={idx === subFase.etapas.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FaseCard({ fase, isExpanded = false, onToggle }: FaseCardProps) {
  const cores = FASE_CORES[fase.cor]
  const Icone = FASE_ICONES[fase.icone] || FileSearch

  const totalEtapas = fase.subFases.reduce(
    (acc, sf) => acc + sf.etapas.length,
    0
  )

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden shadow-sm ${cores.border} ${cores.bg}`}
    >
      {/* Header da fase */}
      <button
        onClick={onToggle}
        className={`w-full ${cores.header} text-white p-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Icone className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">FASE {fase.numero}</span>
                <span className="text-white/80">|</span>
                <span className="text-lg font-semibold">{fase.titulo}</span>
              </div>
              <p className="text-sm text-white/80">{fase.subtitulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-white/80">{fase.subFases.length} subfases</div>
              <div className="text-white/80">{totalEtapas} etapas</div>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-6 w-6" />
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </div>
        </div>

        {/* Responsáveis principais */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/70">Responsaveis:</span>
          {fase.responsaveisPrincipais.map((resp) => (
            <ResponsavelBadge key={resp} setor={resp} size="sm" />
          ))}
        </div>
      </button>

      {/* Objetivo e Resultados Esperados */}
      {isExpanded && (
        <div className="bg-white border-b-2 border-gray-100 p-4 space-y-4">
          {/* Objetivo */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Por que esta fase existe?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{fase.objetivo}</p>
            </div>
          </div>

          {/* Resultados Esperados */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Resultados esperados ao final desta fase:
              </h4>
              <ul className="space-y-1.5">
                {fase.resultadosEsperados.map((resultado, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold select-none mt-0.5">✓</span>
                    <span>{resultado}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Subfases */}
      {isExpanded && (
        <div className="bg-white">
          {fase.subFases.map((subFase) => (
            <SubFaseSection key={subFase.id} subFase={subFase} />
          ))}
        </div>
      )}
    </div>
  )
}
