/**
 * SetorMultiSelect - Dropdown com seleção múltipla de setores
 *
 * Funcionalidades:
 * - Checkboxes para selecionar múltiplos setores
 * - Drag-and-drop para reordenar setores selecionados
 * - Mostra contagem de setores selecionados
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import { cn } from '@/utils'
import type { Setor, ID } from '@/types'

interface SetorMultiSelectProps {
  setores: Setor[]
  selectedIds: ID[]
  displayOrder: ID[]
  onChange: (selectedIds: ID[], displayOrder: ID[]) => void
}

export const SetorMultiSelect = memo(function SetorMultiSelect({
  setores,
  selectedIds,
  displayOrder,
  onChange,
}: SetorMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Ordenar setores de acordo com displayOrder
  const orderedSetores = [...setores].sort((a, b) => {
    const indexA = displayOrder.indexOf(a.id)
    const indexB = displayOrder.indexOf(b.id)

    // Se ambos estão na ordem, respeitar a ordem
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // Se apenas A está na ordem, A vem primeiro
    if (indexA !== -1) return -1

    // Se apenas B está na ordem, B vem primeiro
    if (indexB !== -1) return 1

    // Se nenhum está na ordem, manter ordem original (por ordem do setor)
    return a.ordem - b.ordem
  })

  // Toggle seleção de setor
  const handleToggle = useCallback(
    (setorId: ID) => {
      const newSelectedIds = selectedIds.includes(setorId)
        ? selectedIds.filter(id => id !== setorId) // Remove
        : [...selectedIds, setorId] // Adiciona

      // Atualizar displayOrder para incluir apenas setores selecionados
      const newDisplayOrder = displayOrder.filter(id => newSelectedIds.includes(id))

      // Adicionar novos setores selecionados ao final da ordem
      newSelectedIds.forEach(id => {
        if (!newDisplayOrder.includes(id)) {
          newDisplayOrder.push(id)
        }
      })

      onChange(newSelectedIds, newDisplayOrder)
    },
    [selectedIds, displayOrder, onChange]
  )

  // Selecionar/Desselecionar todos
  const handleToggleAll = useCallback(() => {
    if (selectedIds.length === setores.length) {
      // Desselecionar todos
      onChange([], [])
    } else {
      // Selecionar todos
      const allIds = setores.map(s => s.id)
      onChange(allIds, allIds)
    }
  }, [selectedIds.length, setores, onChange])

  // Drag and drop
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newDisplayOrder = [...displayOrder]
    const draggedId = newDisplayOrder[draggedIndex]

    // Remove do índice antigo
    newDisplayOrder.splice(draggedIndex, 1)

    // Insere no novo índice
    newDisplayOrder.splice(index, 0, draggedId)

    onChange(selectedIds, newDisplayOrder)
    setDraggedIndex(index)
  }, [draggedIndex, displayOrder, selectedIds, onChange])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
  }, [])

  // Texto do botão
  const buttonText = selectedIds.length === 0
    ? 'Todos os setores'
    : selectedIds.length === setores.length
    ? 'Todos os setores'
    : `${selectedIds.length} setor${selectedIds.length > 1 ? 'es' : ''}`

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2 text-sm',
          'border rounded-lg bg-white hover:bg-gray-50 transition-colors',
          'min-w-[200px]',
          isOpen && 'ring-2 ring-aztech-primary/50 border-aztech-primary'
        )}
      >
        <span className="text-gray-700">{buttonText}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[300px] bg-white border rounded-lg shadow-lg">
          {/* Header com "Selecionar todos" */}
          <div className="border-b p-2">
            <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === setores.length}
                onChange={handleToggleAll}
                className="w-4 h-4 text-aztech-primary border-gray-300 rounded focus:ring-aztech-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Selecionar todos
              </span>
            </label>
          </div>

          {/* Lista de setores */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {orderedSetores.map((setor, index) => {
              const isSelected = selectedIds.includes(setor.id)
              const isDragging = draggedIndex === index
              const orderIndex = displayOrder.indexOf(setor.id)

              return (
                <div
                  key={setor.id}
                  draggable={isSelected}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded mb-1',
                    'hover:bg-gray-50 transition-colors',
                    isDragging && 'opacity-50',
                    isSelected && 'bg-blue-50'
                  )}
                >
                  {/* Drag handle (apenas se selecionado) */}
                  {isSelected && (
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                  )}

                  {/* Checkbox */}
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(setor.id)}
                      className="w-4 h-4 text-aztech-primary border-gray-300 rounded focus:ring-aztech-primary"
                    />

                    {/* Badge de cor do setor */}
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: setor.cor }}
                    />

                    {/* Nome do setor */}
                    <span className="text-sm text-gray-700">{setor.nome}</span>

                    {/* Indicador de ordem (se selecionado) */}
                    {isSelected && orderIndex !== -1 && (
                      <span className="ml-auto text-xs text-gray-400">
                        #{orderIndex + 1}
                      </span>
                    )}
                  </label>
                </div>
              )
            })}
          </div>

          {/* Footer com dica */}
          {selectedIds.length > 1 && (
            <div className="border-t p-2 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Arraste para reordenar os setores selecionados
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

SetorMultiSelect.displayName = 'SetorMultiSelect'
