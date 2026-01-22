/**
 * Timeline vertical do fluxo operacional
 *
 * Exibe as 4 fases conectadas por uma linha vertical
 */

import { useState } from 'react'
import type { Fase } from '../types'
import { FASE_CORES } from '../types'
import { FaseCard } from './FaseCard'

interface FluxoTimelineProps {
  fases: Fase[]
}

export function FluxoTimeline({ fases }: FluxoTimelineProps) {
  const [expandedFases, setExpandedFases] = useState<Set<string>>(new Set())

  const toggleFase = (faseId: string) => {
    setExpandedFases((prev) => {
      const next = new Set(prev)
      if (next.has(faseId)) {
        next.delete(faseId)
      } else {
        next.add(faseId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedFases(new Set(fases.map((f) => f.id)))
  }

  const collapseAll = () => {
    setExpandedFases(new Set())
  }

  return (
    <div className="relative">
      {/* Controles */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={expandAll}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Expandir Todas
        </button>
        <button
          onClick={collapseAll}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Recolher Todas
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha vertical conectora */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-amber-500 via-purple-500 to-green-500 rounded-full" />

        {/* Fases */}
        <div className="space-y-6">
          {fases.map((fase, index) => (
            <div key={fase.id} className="relative flex gap-6">
              {/* Indicador de conexão */}
              <div className="relative flex-shrink-0 w-16">
                <div
                  className={`absolute left-6 top-8 w-4 h-4 rounded-full border-4 border-white shadow ${FASE_CORES[fase.cor].timeline}`}
                />
                {index < fases.length - 1 && (
                  <div className="absolute left-[30px] top-12 bottom-0 w-0.5 bg-gray-200" />
                )}
              </div>

              {/* Card da fase */}
              <div className="flex-1">
                <FaseCard
                  fase={fase}
                  isExpanded={expandedFases.has(fase.id)}
                  onToggle={() => toggleFase(fase.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
