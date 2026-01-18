/**
 * ApprovalDialog - Modal de confirmação para aprovar rascunho
 *
 * Exibe resumo das mudanças e pede confirmação antes de tornar oficial
 */

import { memo, useState } from 'react'
import { Check, AlertTriangle, X, Users, Edit3 } from 'lucide-react'
import { cn } from '@/utils'
import type { OrganoVersion, VersionChange } from '@/types/version'

interface ApprovalDialogProps {
  isOpen: boolean
  version: OrganoVersion | null
  changes: VersionChange[]
  isApproving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ApprovalDialog = memo(function ApprovalDialog({
  isOpen,
  version,
  changes,
  isApproving,
  onConfirm,
  onCancel,
}: ApprovalDialogProps) {
  const [confirmed, setConfirmed] = useState(false)

  if (!isOpen || !version) return null

  const hierarchyChanges = changes.filter((c) => c.changeType === 'hierarchy')
  const dataChanges = changes.filter((c) => c.changeType === 'data')

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Aprovar Rascunho</h2>
                <p className="text-sm text-white/80">{version.nome}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Atenção!</p>
              <p className="mt-1">
                Ao aprovar, todas as mudanças serão aplicadas permanentemente ao banco de dados.
                Esta ação não pode ser desfeita facilmente.
              </p>
            </div>
          </div>

          {/* Resumo das mudanças */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Resumo das Mudanças</h3>

            {changes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma mudança para aplicar.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Hierarquia</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {hierarchyChanges.length}
                  </p>
                  <p className="text-xs text-blue-600">movimentações</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Edit3 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Dados</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {dataChanges.length}
                  </p>
                  <p className="text-xs text-purple-600">alterações</p>
                </div>
              </div>
            )}
          </div>

          {/* Checkbox de confirmação */}
          <label className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Entendo que esta ação aplicará as mudanças permanentemente
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isApproving}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-white border border-gray-300 text-gray-700',
              'hover:bg-gray-50 transition-colors',
              isApproving && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed || isApproving}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'bg-green-600 text-white',
              'hover:bg-green-700 transition-colors',
              (!confirmed || isApproving) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isApproving ? 'Aprovando...' : 'Confirmar Aprovação'}
          </button>
        </div>
      </div>
    </div>
  )
})

ApprovalDialog.displayName = 'ApprovalDialog'
