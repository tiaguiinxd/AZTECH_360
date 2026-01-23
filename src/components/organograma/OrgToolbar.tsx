/**
 * OrgToolbar - Barra de ferramentas do organograma
 * Controles de zoom, expansão, filtros e ações
 *
 * NOTA: Usa configStore para obter setores e níveis dinâmicos
 * ADR-006: Inclui indicador de sincronização com polling
 */

import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  Search,
  Maximize2,
  Minimize2,
  RotateCcw,
  Filter,
} from 'lucide-react'
import { cn } from '@/utils'
import type { ID } from '@/types'
import { useConfigStore } from '@/stores/configStore'
import { SyncIndicator } from './SyncIndicator'

interface SyncStatus {
  lastUpdatedFormatted: string
  isFetching: boolean
  isPolling: boolean
  error: string | null
  onRefresh: () => void
}

interface OrgToolbarProps {
  // Filters
  searchValue: string
  setorFilter: ID | null
  nivelFilter: ID | null
  onSearchChange: (value: string) => void
  onSetorChange: (id: ID | null) => void
  onNivelChange: (id: ID | null) => void
  onClearFilters: () => void

  // Actions
  onExpandAll: () => void
  onCollapseAll: () => void
  onResetData?: () => void

  // Sync (ADR-006)
  syncStatus?: SyncStatus

  className?: string
}

export const OrgToolbar = memo(function OrgToolbar({
  searchValue,
  setorFilter,
  nivelFilter,
  onSearchChange,
  onSetorChange,
  onNivelChange,
  onClearFilters,
  onExpandAll,
  onCollapseAll,
  onResetData,
  syncStatus,
  className,
}: OrgToolbarProps) {
  // Usar dados do configStore (dinâmicos)
  const { setores, niveis } = useConfigStore(
    useShallow((state) => ({
      setores: state.setores,
      niveis: state.niveis,
    }))
  )

  const hasFilters = searchValue || setorFilter !== null || nivelFilter !== null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 p-4 bg-white border-b',
        className
      )}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar colaborador..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-9 pr-3 py-2 text-sm',
            'border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
          )}
        />
      </div>

      {/* Setor Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="setor-filter" className="text-sm text-gray-600">
          Setor:
        </label>
        <select
          id="setor-filter"
          value={setorFilter ?? ''}
          onChange={(e) => onSetorChange(e.target.value ? Number(e.target.value) : null)}
          className={cn(
            'px-3 py-2 text-sm',
            'border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
          )}
        >
          <option value="">Todos</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Nivel Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="nivel-filter" className="text-sm text-gray-600">
          Nível:
        </label>
        <select
          id="nivel-filter"
          value={nivelFilter ?? ''}
          onChange={(e) => onNivelChange(e.target.value ? Number(e.target.value) : null)}
          className={cn(
            'px-3 py-2 text-sm',
            'border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
          )}
        >
          <option value="">Todos</option>
          {niveis.map((nivel) => (
            <option key={nivel.id} value={nivel.id}>
              {nivel.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm',
            'text-gray-600 hover:text-gray-800',
            'hover:bg-gray-100 rounded-lg transition-colors'
          )}
        >
          <Filter className="h-4 w-4" />
          Limpar
        </button>
      )}

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mx-2" />

      {/* Expand/Collapse */}
      <div className="flex items-center gap-1">
        <button
          onClick={onExpandAll}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm',
            'text-gray-600 hover:text-gray-800',
            'hover:bg-gray-100 rounded-lg transition-colors'
          )}
          title="Expandir todos"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={onCollapseAll}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm',
            'text-gray-600 hover:text-gray-800',
            'hover:bg-gray-100 rounded-lg transition-colors'
          )}
          title="Recolher todos"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mx-2" />

      {/* Reset */}
      {onResetData && (
        <button
          onClick={onResetData}
          className={cn(
            'flex items-center gap-1 px-3 py-2 text-sm',
            'text-red-600 hover:text-red-800',
            'hover:bg-red-50 rounded-lg transition-colors'
          )}
          title="Restaurar dados iniciais"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}

      {/* Sync Indicator (ADR-006) */}
      {syncStatus && (
        <>
          <div className="flex-1" /> {/* Spacer to push sync to the right */}
          <SyncIndicator
            lastUpdatedFormatted={syncStatus.lastUpdatedFormatted}
            isFetching={syncStatus.isFetching}
            isPolling={syncStatus.isPolling}
            error={syncStatus.error}
            onRefresh={syncStatus.onRefresh}
          />
        </>
      )}
    </div>
  )
})

OrgToolbar.displayName = 'OrgToolbar'
