/**
 * SortableNivelItem - Item de nível hierárquico arrastável
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { NivelHierarquico, ID } from '@/types'
import { cn } from '@/utils'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
  Save,
  X,
  Power,
} from 'lucide-react'

interface SortableNivelItemProps {
  nivel: NivelHierarquico
  isExpanded: boolean
  isEditing: boolean
  editingData: {
    nome: string
    descricao: string
    cor: string
    corTexto: string
  } | null
  canMoveUp: boolean
  canMoveDown: boolean
  onToggleExpand: () => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditChange: (field: string, value: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleAtivo: () => void
  children?: React.ReactNode
}

export function SortableNivelItem({
  nivel,
  isExpanded,
  isEditing,
  editingData,
  canMoveUp,
  canMoveDown,
  onToggleExpand,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onMoveUp,
  onMoveDown,
  onToggleAtivo,
  children,
}: SortableNivelItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nivel.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasSubniveis = (nivel.subniveis?.length ?? 0) > 0
  const isInativo = nivel.ativo === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-lg border shadow-sm overflow-hidden',
        isInativo && 'opacity-60'
      )}
    >
      {/* Nivel header */}
      <div
        className="flex items-center gap-3 p-4"
        style={{ backgroundColor: nivel.cor + '20' }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-black/10 rounded transition-colors cursor-grab active:cursor-grabbing"
          title="Arrastar para reordenar"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-black/10 rounded transition-colors"
          title={isExpanded ? 'Recolher' : 'Expandir'}
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Color badge */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: nivel.cor, color: nivel.corTexto }}
        >
          {nivel.nivel}
        </div>

        {/* Content */}
        {isEditing && editingData ? (
          <div className="flex-1 flex items-center gap-3">
            <input
              type="text"
              value={editingData.nome}
              onChange={(e) => onEditChange('nome', e.target.value)}
              className="px-2 py-1 text-sm border rounded w-40"
              placeholder="Nome"
            />
            <input
              type="text"
              value={editingData.descricao}
              onChange={(e) => onEditChange('descricao', e.target.value)}
              className="px-2 py-1 text-sm border rounded flex-1"
              placeholder="Descrição"
            />
            <input
              type="color"
              value={editingData.cor}
              onChange={(e) => onEditChange('cor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Cor de fundo"
            />
            <input
              type="color"
              value={editingData.corTexto}
              onChange={(e) => onEditChange('corTexto', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Cor do texto"
            />
          </div>
        ) : (
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {nivel.nome}
              {isInativo && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                  Inativo
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{nivel.descricao}</p>
          </div>
        )}

        {/* Subniveis count */}
        {hasSubniveis && !isExpanded && (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
            {nivel.subniveis?.length} subnível(is)
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={onSaveEdit}
                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Salvar"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                title="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {/* Move up */}
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={cn(
                  'p-2 rounded transition-colors',
                  canMoveUp
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                )}
                title="Mover para cima"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              {/* Move down */}
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={cn(
                  'p-2 rounded transition-colors',
                  canMoveDown
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                )}
                title="Mover para baixo"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Toggle ativo */}
              <button
                onClick={onToggleAtivo}
                className={cn(
                  'p-2 rounded transition-colors',
                  isInativo
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                )}
                title={isInativo ? 'Ativar nível' : 'Desativar nível'}
              >
                <Power className="h-4 w-4" />
              </button>
              {/* Edit */}
              <button
                onClick={onStartEdit}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                title="Editar nível"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subniveis section */}
      {isExpanded && children}
    </div>
  )
}
