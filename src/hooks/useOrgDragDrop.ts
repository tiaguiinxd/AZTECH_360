/**
 * Hook para gerenciar Drag-and-Drop no Organograma
 * Usa @dnd-kit/core para arrastar cards e reorganizar hierarquia
 */

import { useState, useCallback } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Colaborador, ID } from '@/types'
import { checkHierarchyCycle, getAllSubordinados } from '@/stores/organoStore'

export interface DropTargetInfo {
  colaboradorId: ID | null
  isValid: boolean
  message?: string
}

export interface UseOrgDragDropOptions {
  colaboradores: Colaborador[]
  onMoveColaborador: (colaboradorId: ID, newSuperiorId: ID | undefined) => void
  isEnabled: boolean
}

export interface UseOrgDragDropReturn {
  sensors: ReturnType<typeof useSensors>
  activeId: ID | null
  overId: ID | null
  isDragging: boolean
  dropTargetInfo: DropTargetInfo | null
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
  getDropZoneStyle: (colaboradorId: ID) => React.CSSProperties
  isDropTarget: (colaboradorId: ID) => boolean
  isBeingDragged: (colaboradorId: ID) => boolean
}

/**
 * Hook para drag-and-drop no organograma
 */
export function useOrgDragDrop({
  colaboradores,
  onMoveColaborador,
  isEnabled,
}: UseOrgDragDropOptions): UseOrgDragDropReturn {
  const [activeId, setActiveId] = useState<ID | null>(null)
  const [overId, setOverId] = useState<ID | null>(null)
  const [dropTargetInfo, setDropTargetInfo] = useState<DropTargetInfo | null>(null)

  // Configurar sensores
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mínimo de pixels antes de iniciar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Validar se um drop é permitido
  const validateDrop = useCallback(
    (draggedId: ID, targetId: ID | null): DropTargetInfo => {
      // Se não tem alvo, é drop para raiz (sem superior)
      if (targetId === null) {
        return {
          colaboradorId: null,
          isValid: true,
          message: 'Mover para raiz (sem superior)',
        }
      }

      // Não pode soltar em si mesmo
      if (draggedId === targetId) {
        return {
          colaboradorId: targetId,
          isValid: false,
          message: 'Não pode ser seu próprio superior',
        }
      }

      // Verificar ciclo: não pode soltar em um subordinado
      if (checkHierarchyCycle(colaboradores, draggedId, targetId)) {
        return {
          colaboradorId: targetId,
          isValid: false,
          message: 'Não pode mover para um subordinado (criaria ciclo)',
        }
      }

      // Verificar se o alvo é subordinado direto ou indireto
      const subordinados = getAllSubordinados(colaboradores, draggedId)
      if (subordinados.some((s) => s.id === targetId)) {
        return {
          colaboradorId: targetId,
          isValid: false,
          message: 'Não pode mover para um subordinado',
        }
      }

      const target = colaboradores.find((c) => c.id === targetId)
      return {
        colaboradorId: targetId,
        isValid: true,
        message: `Mover como subordinado de ${target?.nome || 'desconhecido'}`,
      }
    },
    [colaboradores]
  )

  // Handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!isEnabled) return
      setActiveId(event.active.id as ID)
    },
    [isEnabled]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!isEnabled || activeId === null) return

      const overId = event.over?.id as ID | null
      setOverId(overId ?? null)

      if (overId !== null || event.over === null) {
        const info = validateDrop(activeId, overId)
        setDropTargetInfo(info)
      }
    },
    [isEnabled, activeId, validateDrop]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!isEnabled || activeId === null) return

      const overId = event.over?.id as ID | null

      // Validar novamente antes de mover
      const info = validateDrop(activeId, overId)

      if (info.isValid) {
        // Se overId é null, move para raiz (undefined)
        // Se overId é um ID, move como subordinado desse colaborador
        onMoveColaborador(activeId, overId ?? undefined)
      }

      // Limpar estado
      setActiveId(null)
      setOverId(null)
      setDropTargetInfo(null)
    },
    [isEnabled, activeId, validateDrop, onMoveColaborador]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
    setDropTargetInfo(null)
  }, [])

  // Helpers para estilos
  const getDropZoneStyle = useCallback(
    (colaboradorId: ID): React.CSSProperties => {
      if (!isEnabled || activeId === null) return {}

      const isOver = overId === colaboradorId
      const info = isOver ? dropTargetInfo : null

      if (!isOver) return {}

      return {
        outline: info?.isValid ? '2px dashed #22c55e' : '2px dashed #ef4444',
        outlineOffset: '4px',
        borderRadius: '8px',
      }
    },
    [isEnabled, activeId, overId, dropTargetInfo]
  )

  const isDropTarget = useCallback(
    (colaboradorId: ID): boolean => {
      return overId === colaboradorId && dropTargetInfo?.isValid === true
    },
    [overId, dropTargetInfo]
  )

  const isBeingDragged = useCallback(
    (colaboradorId: ID): boolean => {
      return activeId === colaboradorId
    },
    [activeId]
  )

  return {
    sensors,
    activeId,
    overId,
    isDragging: activeId !== null,
    dropTargetInfo,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getDropZoneStyle,
    isDropTarget,
    isBeingDragged,
  }
}
