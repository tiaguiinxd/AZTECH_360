/**
 * ChangesPanel - Painel lateral mostrando mudanças pendentes no rascunho
 *
 * Exibe:
 * - Lista de mudanças de hierarquia (movimentações)
 * - Lista de mudanças de dados (nome, cargo, etc)
 * - Botão para reverter mudanças individuais
 */

import { memo } from 'react'
import { ArrowRight, Edit3, Users, ChevronRight, X } from 'lucide-react'
import { cn } from '@/utils'
import type { VersionChange } from '@/types/version'

interface ChangesPanelProps {
  changes: VersionChange[]
  isOpen: boolean
  onClose: () => void
  onHighlightChange?: (colaboradorId: number) => void
  className?: string
}

export const ChangesPanel = memo(function ChangesPanel({
  changes,
  isOpen,
  onClose,
  onHighlightChange,
  className,
}: ChangesPanelProps) {
  if (!isOpen) return null

  const hierarchyChanges = changes.filter((c) => c.changeType === 'hierarchy')
  const dataChanges = changes.filter((c) => c.changeType === 'data')

  return (
    <div
      className={cn(
        'w-80 bg-white border-l border-gray-200 flex flex-col',
        'shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Mudanças</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {changes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma mudança ainda</p>
            <p className="text-xs mt-1">
              Arraste cards ou edite informações para ver as mudanças aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mudanças de hierarquia */}
            {hierarchyChanges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-gray-700">
                    Hierarquia ({hierarchyChanges.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {hierarchyChanges.map((change, idx) => (
                    <div
                      key={`${change.colaboradorId}-${idx}`}
                      className={cn(
                        'p-2 bg-blue-50 rounded-lg border border-blue-100',
                        'cursor-pointer hover:bg-blue-100 transition-colors'
                      )}
                      onClick={() => onHighlightChange?.(change.colaboradorId)}
                    >
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium text-blue-800">
                          {change.colaboradorNome}
                        </span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <span className="text-red-600 line-through">
                          {change.oldValue ? `ID ${change.oldValue}` : 'Raiz'}
                        </span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="text-green-600">
                          {change.newValue ? `ID ${change.newValue}` : 'Raiz'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mudanças de dados */}
            {dataChanges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-medium text-gray-700">
                    Dados ({dataChanges.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {dataChanges.map((change, idx) => (
                    <div
                      key={`${change.colaboradorId}-${change.field}-${idx}`}
                      className={cn(
                        'p-2 bg-purple-50 rounded-lg border border-purple-100',
                        'cursor-pointer hover:bg-purple-100 transition-colors'
                      )}
                      onClick={() => onHighlightChange?.(change.colaboradorId)}
                    >
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium text-purple-800">
                          {change.colaboradorNome}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({change.field})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <span className="text-red-600 line-through truncate max-w-[100px]">
                          {String(change.oldValue)}
                        </span>
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span className="text-green-600 truncate max-w-[100px]">
                          {String(change.newValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {changes.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Total: {changes.length} {changes.length === 1 ? 'mudança' : 'mudanças'}
          </p>
        </div>
      )}
    </div>
  )
})

ChangesPanel.displayName = 'ChangesPanel'
