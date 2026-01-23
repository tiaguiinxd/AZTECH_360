/**
 * Item de entrega de um setor
 *
 * Exibe uma entrega com detalhes expansíveis
 */

import { useState, useCallback, useMemo } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Clock,
  CheckSquare,
  FileCode,
  Link2,
} from 'lucide-react'
import type { Entrega } from '../types'
import { CATEGORIA_CORES } from '../types'

interface EntregaItemProps {
  entrega: Entrega
  isLast?: boolean
}

export function EntregaItem({ entrega, isLast = false }: EntregaItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const hasExtraDetails = useMemo(
    () => Boolean(
      entrega.descricao ||
      entrega.prazoTipico ||
      entrega.criteriosQualidade ||
      entrega.exemplos ||
      entrega.dependencias
    ),
    [entrega]
  )

  const categoriaClasses = CATEGORIA_CORES[entrega.categoria]

  return (
    <div className={`relative flex gap-3 ${!isLast ? 'pb-4' : ''}`}>
      {/* Linha conectora */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-0.5 bg-gray-200" />
      )}

      {/* Ícone */}
      <div className="relative z-10 flex-shrink-0">
        <FileText className="h-6 w-6 text-gray-400" fill="white" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border ${categoriaClasses}`}
          >
            {entrega.categoria}
          </span>
          <p className="text-sm font-medium text-gray-900 flex-1">{entrega.nome}</p>

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

        {entrega.formato && (
          <div className="mt-1 flex items-center gap-1.5">
            <FileCode className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-gray-600">Formato: {entrega.formato}</span>
          </div>
        )}

        {/* Detalhes expandidos */}
        {isExpanded && hasExtraDetails && (
          <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md border border-gray-200 transition-all duration-200">
            {/* Descrição */}
            {entrega.descricao && (
              <div>
                <p className="text-sm text-gray-700">{entrega.descricao}</p>
              </div>
            )}

            {/* Prazo típico */}
            {entrega.prazoTipico && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">Prazo Típico</p>
                  <p className="text-xs text-gray-600 mt-0.5">{entrega.prazoTipico}</p>
                </div>
              </div>
            )}

            {/* Critérios de qualidade */}
            {entrega.criteriosQualidade && entrega.criteriosQualidade.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">
                    Critérios de Qualidade
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {entrega.criteriosQualidade.map((criterio, index) => (
                      <li
                        key={`${entrega.id}-criterio-${index}`}
                        className="flex items-start gap-1.5 text-xs text-gray-600"
                      >
                        <span className="text-gray-400 select-none">•</span>
                        <span>{criterio}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Exemplos/Templates */}
            {entrega.exemplos && entrega.exemplos.length > 0 && (
              <div className="flex items-start gap-2">
                <FileCode className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">
                    Exemplos/Templates
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {entrega.exemplos.map((exemplo, index) => (
                      <li
                        key={`${entrega.id}-exemplo-${index}`}
                        className="flex items-start gap-1.5 text-xs text-purple-600"
                      >
                        <span className="text-purple-400 select-none">→</span>
                        <span>{exemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Dependências (O que é necessário de outros setores) */}
            {entrega.dependencias && entrega.dependencias.length > 0 && (
              <div className="flex items-start gap-2 pt-2 border-t border-gray-300">
                <Link2 className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-700">
                    Necessita Receber de Outros Setores
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {entrega.dependencias.map((dep, index) => (
                      <li
                        key={`${entrega.id}-dep-${index}`}
                        className="flex items-start gap-1.5 text-xs"
                      >
                        <span className="text-orange-400 select-none font-bold">←</span>
                        <div className="flex-1">
                          <span className="font-medium text-orange-700 uppercase">
                            {dep.setorOrigem}
                          </span>
                          {dep.entregaId && (
                            <span className="text-gray-500"> ({dep.entregaId})</span>
                          )}
                          <span className="text-gray-600">: {dep.descricao}</span>
                        </div>
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
