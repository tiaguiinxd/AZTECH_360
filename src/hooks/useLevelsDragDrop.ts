/**
 * Hook para gerenciar Drag-and-Drop de Níveis Hierárquicos
 * Usa @dnd-kit/sortable para reordenar níveis
 */

import { useState, useCallback, useEffect } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DndContext,
  closestCenter,
} from '@dnd-kit/core'
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { NivelHierarquico, ID } from '@/types'

export interface UseLevelsDragDropOptions {
  niveis: NivelHierarquico[]
  onReorder: (orderedIds: ID[]) => void | Promise<void>
  isEnabled: boolean
}

export interface UseLevelsDragDropReturn {
  sensors: ReturnType<typeof useSensors>
  activeId: ID | null
  isDragging: boolean
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
  sortedNiveis: NivelHierarquico[]
  DndContext: typeof DndContext
  SortableContext: typeof SortableContext
  verticalListSortingStrategy: typeof verticalListSortingStrategy
}

/**
 * Hook para drag-and-drop de níveis hierárquicos
 */
export function useLevelsDragDrop({
  niveis,
  onReorder,
  isEnabled,
}: UseLevelsDragDropOptions): UseLevelsDragDropReturn {
  const [activeId, setActiveId] = useState<ID | null>(null)
  const [sortedNiveis, setSortedNiveis] = useState<NivelHierarquico[]>(niveis)

  // Sincronizar com niveis externos
  useEffect(() => {
    setSortedNiveis(niveis)
  }, [niveis])

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

  // Handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!isEnabled) return
      setActiveId(event.active.id as ID)
    },
    [isEnabled]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!isEnabled || activeId === null) return

      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = sortedNiveis.findIndex((n) => n.id === active.id)
        const newIndex = sortedNiveis.findIndex((n) => n.id === over.id)

        const reordered = arrayMove(sortedNiveis, oldIndex, newIndex)
        setSortedNiveis(reordered)

        // Chamar callback com IDs na nova ordem
        const orderedIds = reordered.map((n) => n.id)
        onReorder(orderedIds)
      }

      setActiveId(null)
    },
    [isEnabled, activeId, sortedNiveis, onReorder]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  return {
    sensors,
    activeId,
    isDragging: activeId !== null,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    sortedNiveis,
    DndContext,
    SortableContext,
    verticalListSortingStrategy,
  }
}
