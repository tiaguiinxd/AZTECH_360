/**
 * VersionToolbar - Barra de ferramentas para versionamento do organograma
 *
 * Exibe controles diferentes baseado no modo:
 * - VIEW: Botão para criar rascunho e ver histórico
 * - DRAFT: Undo/Redo, Salvar, Aprovar, Descartar
 */

import { memo } from 'react'
import {
  Undo2,
  Redo2,
  Save,
  Check,
  X,
  FileEdit,
  History,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utils'
import type { EditMode, OrganoVersion } from '@/types/version'

interface VersionToolbarProps {
  editMode: EditMode
  currentDraft: OrganoVersion | null
  hasUnsavedChanges: boolean
  changesCount: number
  canUndo: boolean
  canRedo: boolean
  isSaving: boolean
  onCreateDraft: () => void
  onSaveDraft: () => void
  onApproveDraft: () => void
  onDiscardDraft: () => void
  onUndo: () => void
  onRedo: () => void
  onShowHistory?: () => void
  className?: string
}

export const VersionToolbar = memo(function VersionToolbar({
  editMode,
  currentDraft,
  hasUnsavedChanges,
  changesCount,
  canUndo,
  canRedo,
  isSaving,
  onCreateDraft,
  onSaveDraft,
  onApproveDraft,
  onDiscardDraft,
  onUndo,
  onRedo,
  onShowHistory,
  className,
}: VersionToolbarProps) {
  if (editMode === 'view') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200',
          className
        )}
      >
        <button
          onClick={onCreateDraft}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'bg-aztech-primary text-white',
            'hover:bg-aztech-primary/90 transition-colors',
            'text-sm font-medium'
          )}
        >
          <FileEdit className="h-4 w-4" />
          Criar Rascunho
        </button>

        {onShowHistory && (
          <button
            onClick={onShowHistory}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'bg-gray-100 text-gray-700',
              'hover:bg-gray-200 transition-colors',
              'text-sm font-medium'
            )}
          >
            <History className="h-4 w-4" />
            Histórico
          </button>
        )}

        <span className="ml-auto text-xs text-gray-500">
          Modo visualização
        </span>
      </div>
    )
  }

  // Modo DRAFT
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-amber-50 border-b-2 border-amber-400',
        className
      )}
    >
      {/* Indicador de modo rascunho */}
      <div className="flex items-center gap-2 px-2 py-1 bg-amber-100 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">RASCUNHO</span>
      </div>

      {/* Nome do rascunho */}
      {currentDraft && (
        <span className="text-sm text-gray-600 truncate max-w-[200px]">
          {currentDraft.nome}
        </span>
      )}

      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'p-1.5 rounded hover:bg-amber-100 transition-colors',
            canUndo ? 'text-gray-700' : 'text-gray-300 cursor-not-allowed'
          )}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'p-1.5 rounded hover:bg-amber-100 transition-colors',
            canRedo ? 'text-gray-700' : 'text-gray-300 cursor-not-allowed'
          )}
          title="Refazer (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* Separador */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* Salvar */}
      <button
        onClick={onSaveDraft}
        disabled={!hasUnsavedChanges || isSaving}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'transition-colors',
          hasUnsavedChanges && !isSaving
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        )}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Salvar
      </button>

      {/* Aprovar */}
      <button
        onClick={onApproveDraft}
        disabled={isSaving}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'bg-green-600 text-white hover:bg-green-700 transition-colors',
          isSaving && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Check className="h-4 w-4" />
        Aprovar
      </button>

      {/* Descartar */}
      <button
        onClick={onDiscardDraft}
        disabled={isSaving}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'bg-red-100 text-red-700 hover:bg-red-200 transition-colors',
          isSaving && 'opacity-50 cursor-not-allowed'
        )}
      >
        <X className="h-4 w-4" />
        Descartar
      </button>

      {/* Status */}
      <div className="ml-auto flex items-center gap-3 text-xs">
        {changesCount > 0 && (
          <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-medium">
            {changesCount} {changesCount === 1 ? 'mudança' : 'mudanças'}
          </span>
        )}
        {hasUnsavedChanges && (
          <span className="text-amber-600 font-medium">
            Não salvo
          </span>
        )}
      </div>
    </div>
  )
})

VersionToolbar.displayName = 'VersionToolbar'
