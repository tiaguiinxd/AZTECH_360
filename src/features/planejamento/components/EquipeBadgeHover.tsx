/**
 * EquipeBadgeHover - Badge de equipe com preview ao passar mouse
 *
 * Mostra quantidade de pessoas alocadas e, ao hover, exibe lista com:
 * - Nome do colaborador
 * - Função
 * - % Dedicação
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { Users } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useDashboardStore } from '@/stores/dashboardStore'
import { FUNCAO_LABELS } from '@/types/dashboard'
import type { FuncaoAlocacao } from '@/types/dashboard'

interface EquipeBadgeHoverProps {
  projetoId: number
}

export function EquipeBadgeHover({ projetoId }: EquipeBadgeHoverProps) {
  // ============ HOOKS ============

  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const alocacoes = useDashboardStore(
    useShallow((state) => state.alocacoes)
  )

  // Filtrar alocacoes ativas deste projeto (com tratamento NULL)
  const alocacoesProjeto = useMemo(() => {
    return (alocacoes ?? []).filter(
      (a) => a.projeto_id === projetoId && a.status === 'ativa'
    )
  }, [alocacoes, projetoId])

  const totalAlocados = alocacoesProjeto.length
  const isOpen = isHovered || isFocused

  // ============ EFFECTS ============

  // Fechar ao pressionar Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false)
        setIsHovered(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // ============ HANDLERS ============

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)
  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  // ============ RENDER ============

  if (totalAlocados === 0) return null

  return (
    <div className="relative" ref={containerRef}>
      {/* Badge */}
      <div
        className="flex items-center gap-1 px-2 py-0.5 bg-aztech-primary/10 text-aztech-primary rounded-full cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="button"
        tabIndex={0}
        aria-label={`${totalAlocados} pessoa${totalAlocados > 1 ? 's' : ''} alocada${totalAlocados > 1 ? 's' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Users className="h-3 w-3" />
        <span className="text-xs font-medium">{totalAlocados}</span>
      </div>

      {/* Popover com lista de equipe */}
      {isOpen && (
        <div
          className="absolute z-50 w-80 top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Equipe Alocada
          </h4>
          <div className="space-y-2">
            {alocacoesProjeto.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Avatar com iniciais */}
                  <div className="h-7 w-7 rounded-full bg-aztech-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-medium text-aztech-primary">
                      {a.colaborador_nome
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 truncate">
                      {a.colaborador_nome}
                    </div>
                    <div className="text-gray-500 truncate">
                      {FUNCAO_LABELS[a.funcao as FuncaoAlocacao]}
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 font-medium ml-2 flex-shrink-0">
                </div>
              </div>
            ))}
            {alocacoesProjeto.length > 6 && (
              <div className="text-xs text-gray-500 pt-1 text-center">
                +{alocacoesProjeto.length - 6} pessoa{alocacoesProjeto.length - 6 > 1 ? 's' : ''}...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
