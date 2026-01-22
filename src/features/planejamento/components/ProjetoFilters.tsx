/**
 * ProjetoFilters - Filtros da lista de projetos
 */

import { memo, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import type { ProjetoFilters as Filters, StatusProjeto } from '@/types/planejamento'

interface ProjetoFiltersProps {
  filters: Filters
  opcoesEmpresas: string[]
  opcoesClientes: string[]
  opcoesCategorias: string[]
  onFilterChange: (filters: Partial<Filters>) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS: { value: StatusProjeto | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export const ProjetoFilters = memo(function ProjetoFilters({
  filters,
  opcoesEmpresas,
  opcoesClientes,
  opcoesCategorias,
  onFilterChange,
  onClearFilters,
}: ProjetoFiltersProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ busca: e.target.value })
    },
    [onFilterChange]
  )

  const handleEmpresaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ empresa: e.target.value || null })
    },
    [onFilterChange]
  )

  const handleClienteChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ cliente: e.target.value || null })
    },
    [onFilterChange]
  )

  const handleCategoriaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ categoria: e.target.value || null })
    },
    [onFilterChange]
  )

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as StatusProjeto | ''
      onFilterChange({ status: value || null })
    },
    [onFilterChange]
  )

  const hasActiveFilters =
    filters.busca || filters.empresa || filters.cliente || filters.categoria || filters.status

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex flex-wrap gap-4">
        {/* Busca */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.busca}
              onChange={handleSearchChange}
              placeholder="Buscar por codigo, nome ou descricao..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Empresa */}
        <div className="w-40">
          <select
            value={filters.empresa || ''}
            onChange={handleEmpresaChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
          >
            <option value="">Todas empresas</option>
            {opcoesEmpresas.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente */}
        <div className="w-40">
          <select
            value={filters.cliente || ''}
            onChange={handleClienteChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
          >
            <option value="">Todos clientes</option>
            {opcoesClientes.map((cli) => (
              <option key={cli} value={cli}>
                {cli}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div className="w-40">
          <select
            value={filters.categoria || ''}
            onChange={handleCategoriaChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
          >
            <option value="">Todas categorias</option>
            {opcoesCategorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="w-40">
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  )
})

ProjetoFilters.displayName = 'ProjetoFilters'
