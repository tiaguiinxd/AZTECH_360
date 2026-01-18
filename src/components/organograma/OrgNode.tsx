/**
 * OrgNode - Card de colaborador no organograma
 * Exibe informações do colaborador com cor do setor e ações
 *
 * Funcionalidades:
 * - Visualização com cor do setor/nível
 * - Edição inline de nome e cargo (quando isEditable=true)
 * - Expand/collapse de subordinados
 *
 * NOTA: Usa configStore para obter setores e níveis dinâmicos
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ChevronDown, ChevronUp, MoreVertical, Check, X } from 'lucide-react'
import { cn } from '@/utils'
import type { Colaborador, ID } from '@/types'
import { useConfigStore } from '@/stores/configStore'

interface OrgNodeProps {
  colaborador: Colaborador
  isSelected?: boolean
  isExpanded?: boolean
  hasChildren?: boolean
  onSelect?: (id: number) => void
  onToggleExpand?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  className?: string
  // Props para modo de edição
  isEditable?: boolean
  onInlineEdit?: (id: number, updates: { nome?: string; cargo?: string }) => void
}

export const OrgNode = memo(function OrgNode({
  colaborador,
  isSelected = false,
  isExpanded = false,
  hasChildren = false,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  className,
  isEditable = false,
  onInlineEdit,
}: OrgNodeProps) {
  // Estado para edição inline
  const [isEditingNome, setIsEditingNome] = useState(false)
  const [isEditingCargo, setIsEditingCargo] = useState(false)
  const [editedNome, setEditedNome] = useState(colaborador.nome)
  const [editedCargo, setEditedCargo] = useState(colaborador.cargo)
  const nomeInputRef = useRef<HTMLInputElement>(null)
  const cargoInputRef = useRef<HTMLInputElement>(null)

  // Usar dados do configStore (dinâmicos)
  const { setores, niveis, hasHydrated } = useConfigStore(
    useShallow((state) => ({
      setores: state.setores,
      niveis: state.niveis,
      hasHydrated: state._hasHydrated,
    }))
  )

  // Verificar se os dados estão carregados
  const isDataReady = hasHydrated && setores.length > 0 && niveis.length > 0

  // Helper functions usando dados do store
  const getSetorById = useCallback(
    (id: ID) => setores.find((s) => s.id === id),
    [setores]
  )

  const getNivelById = useCallback(
    (id: ID) => niveis.find((n) => n.id === id),
    [niveis]
  )

  const getSubnivelAbreviacao = useCallback(
    (nivelId: ID, subnivelId?: ID) => {
      if (!subnivelId) return undefined
      const nivel = getNivelById(nivelId)
      const subnivel = nivel?.subniveis?.find((s) => s.id === subnivelId)
      return subnivel?.abreviacao
    },
    [getNivelById]
  )

  // Usar valores com fallback seguro para quando os dados não estão prontos
  const setor = isDataReady ? getSetorById(colaborador.setorId) : null
  const nivel = isDataReady ? getNivelById(colaborador.nivelId) : null
  const subnivelAbrev = isDataReady ? getSubnivelAbreviacao(colaborador.nivelId, colaborador.subnivelId) : undefined

  // Atualizar estado local quando colaborador mudar
  useEffect(() => {
    setEditedNome(colaborador.nome)
    setEditedCargo(colaborador.cargo)
  }, [colaborador.nome, colaborador.cargo])

  // Focus no input quando entrar em modo edição
  useEffect(() => {
    if (isEditingNome && nomeInputRef.current) {
      nomeInputRef.current.focus()
      nomeInputRef.current.select()
    }
  }, [isEditingNome])

  useEffect(() => {
    if (isEditingCargo && cargoInputRef.current) {
      cargoInputRef.current.focus()
      cargoInputRef.current.select()
    }
  }, [isEditingCargo])

  const handleClick = () => {
    if (!isEditingNome && !isEditingCargo) {
      onSelect?.(colaborador.id)
    }
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand?.(colaborador.id)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(colaborador.id)
  }

  // Edição inline - Nome
  const handleNomeDoubleClick = (e: React.MouseEvent) => {
    if (!isEditable) return
    e.stopPropagation()
    setIsEditingNome(true)
  }

  const handleNomeSave = () => {
    const trimmedNome = editedNome.trim()
    if (trimmedNome && trimmedNome !== colaborador.nome) {
      onInlineEdit?.(colaborador.id, { nome: trimmedNome })
    } else {
      setEditedNome(colaborador.nome)
    }
    setIsEditingNome(false)
  }

  const handleNomeCancel = () => {
    setEditedNome(colaborador.nome)
    setIsEditingNome(false)
  }

  const handleNomeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNomeSave()
    } else if (e.key === 'Escape') {
      handleNomeCancel()
    }
  }

  // Edição inline - Cargo
  const handleCargoDoubleClick = (e: React.MouseEvent) => {
    if (!isEditable) return
    e.stopPropagation()
    setIsEditingCargo(true)
  }

  const handleCargoSave = () => {
    const trimmedCargo = editedCargo.trim()
    if (trimmedCargo && trimmedCargo !== colaborador.cargo) {
      onInlineEdit?.(colaborador.id, { cargo: trimmedCargo })
    } else {
      setEditedCargo(colaborador.cargo)
    }
    setIsEditingCargo(false)
  }

  const handleCargoCancel = () => {
    setEditedCargo(colaborador.cargo)
    setIsEditingCargo(false)
  }

  const handleCargoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCargoSave()
    } else if (e.key === 'Escape') {
      handleCargoCancel()
    }
  }

  // Gerar iniciais (máximo 2 letras)
  const iniciais = colaborador.nome
    .split(' ')
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'relative flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer',
        'transition-all duration-200 hover:shadow-lg',
        'w-full bg-white border-l-4 overflow-hidden',
        isSelected
          ? 'ring-2 ring-aztech-primary/50 shadow-lg'
          : 'shadow-md hover:shadow-lg',
        className
      )}
      style={{
        borderLeftColor: setor?.cor ?? '#6b7280',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      {/* Expand/Collapse Button */}
      {hasChildren && (
        <button
          className={cn(
            'absolute -bottom-2.5 left-1/2 -translate-x-1/2',
            'w-5 h-5 rounded-full bg-white border border-gray-300',
            'flex items-center justify-center z-10',
            'hover:bg-aztech-primary hover:border-aztech-primary hover:text-white transition-colors',
            'shadow-sm text-gray-500'
          )}
          onClick={handleToggleExpand}
          aria-label={isExpanded ? 'Recolher subordinados' : 'Expandir subordinados'}
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
        style={{
          backgroundColor: nivel?.cor ?? '#6b7280',
          color: nivel?.corTexto ?? '#ffffff',
        }}
      >
        {iniciais}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Nome - editável com double-click */}
        {isEditingNome ? (
          <div className="flex items-center gap-1">
            <input
              ref={nomeInputRef}
              type="text"
              value={editedNome}
              onChange={(e) => setEditedNome(e.target.value)}
              onBlur={handleNomeSave}
              onKeyDown={handleNomeKeyDown}
              className="font-semibold text-sm text-gray-900 bg-white border border-aztech-primary rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-aztech-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNomeSave()
              }}
              className="p-0.5 text-green-600 hover:bg-green-100 rounded"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNomeCancel()
              }}
              className="p-0.5 text-red-600 hover:bg-red-100 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <h3
            className={cn(
              'font-semibold text-sm text-gray-900 truncate leading-tight',
              isEditable && 'hover:bg-gray-100 rounded px-1 -mx-1 cursor-text'
            )}
            title={isEditable ? 'Clique duplo para editar' : colaborador.nome}
            onDoubleClick={handleNomeDoubleClick}
          >
            {colaborador.nome}
          </h3>
        )}

        {/* Cargo - editável com double-click */}
        {isEditingCargo ? (
          <div className="flex items-center gap-1 mt-0.5">
            <input
              ref={cargoInputRef}
              type="text"
              value={editedCargo}
              onChange={(e) => setEditedCargo(e.target.value)}
              onBlur={handleCargoSave}
              onKeyDown={handleCargoKeyDown}
              className="text-xs text-gray-500 bg-white border border-aztech-primary rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-aztech-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCargoSave()
              }}
              className="p-0.5 text-green-600 hover:bg-green-100 rounded"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCargoCancel()
              }}
              className="p-0.5 text-red-600 hover:bg-red-100 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <p
            className={cn(
              'text-xs text-gray-500 truncate leading-tight',
              isEditable && 'hover:bg-gray-100 rounded px-1 -mx-1 cursor-text'
            )}
            title={isEditable ? 'Clique duplo para editar' : colaborador.cargo}
            onDoubleClick={handleCargoDoubleClick}
          >
            {colaborador.cargo}
          </p>
        )}

        <div className="flex items-center gap-1 mt-1 overflow-hidden">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium truncate max-w-[60px]"
            style={{
              backgroundColor: nivel?.cor ?? '#6b7280',
              color: nivel?.corTexto ?? '#ffffff',
            }}
            title={nivel?.nome}
          >
            {nivel?.nome ?? 'N/A'}
          </span>
          {subnivelAbrev && (
            <span
              className="text-[9px] px-1 py-0.5 rounded font-semibold bg-gray-700 text-white"
              title={`Senioridade: ${subnivelAbrev}`}
            >
              {subnivelAbrev}
            </span>
          )}
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium truncate max-w-[70px]"
            style={{
              backgroundColor: setor?.cor ?? '#f3f4f6',
              color: setor?.corTexto ?? '#1e293b',
            }}
            title={setor?.nome}
          >
            {setor?.nome ?? 'N/A'}
          </span>
        </div>
      </div>

      {/* Actions Menu */}
      {(onEdit || onDelete) && (
        <button
          className={cn(
            'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
            'hover:bg-gray-100 transition-colors'
          )}
          onClick={handleEditClick}
          aria-label="Opções do colaborador"
        >
          <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}
    </div>
  )
})

OrgNode.displayName = 'OrgNode'
