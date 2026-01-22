/**
 * Item de etapa dentro de uma subfase
 *
 * Exibe uma etapa com seu código, ação e entregável
 * Com expansão inline para prazo estimado e checklist de validação
 */

import { useState, useCallback, useMemo } from 'react'
import { CheckCircle2, Circle, Info, ChevronDown, ChevronRight, Clock, CheckSquare } from 'lucide-react'
import type { Etapa } from '../types'

interface EtapaItemProps {
  etapa: Etapa
  isLast?: boolean
}

export function EtapaItem({ etapa, isLast = false }: EtapaItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Handler para toggle de expansão
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  // Verifica se há detalhes extras para exibir
  const hasExtraDetails = useMemo(
    () => Boolean(etapa.prazoEstimado || etapa.checklistValidacao),
    [etapa.prazoEstimado, etapa.checklistValidacao]
  )

  return (
    <div className={`relative flex gap-3 ${!isLast ? 'pb-4' : ''}`}>
      {/* Linha conectora */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-gray-200" />
      )}

      {/* Ícone */}
      <div className="relative z-10 flex-shrink-0">
        <Circle className="h-6 w-6 text-gray-400" fill="white" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {etapa.codigo}
          </span>
          <p className="text-sm text-gray-900 flex-1">{etapa.acao}</p>

          {/* Botão de expansão (só aparece se houver detalhes extras) */}
          {hasExtraDetails && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isExpanded ? 'Recolher detalhes' : 'Ver detalhes'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-600">{etapa.entregavel}</span>
        </div>

        {etapa.detalhes && (
          <div className="mt-1 flex items-start gap-1.5 text-xs text-gray-500">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>{etapa.detalhes}</span>
          </div>
        )}

        {/* Detalhes expandidos */}
        {isExpanded && hasExtraDetails && (
          <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md border border-gray-200 transition-all duration-200">
            {/* Prazo estimado */}
            {etapa.prazoEstimado && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">Prazo Estimado</p>
                  <p className="text-xs text-gray-600 mt-0.5">{etapa.prazoEstimado}</p>
                </div>
              </div>
            )}

            {/* Checklist de validação */}
            {etapa.checklistValidacao && etapa.checklistValidacao.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">Checklist de Validação</p>
                  <ul className="mt-1.5 space-y-1">
                    {etapa.checklistValidacao.map((item, index) => (
                      <li key={`${etapa.id}-checklist-${index}`} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-gray-400 select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
