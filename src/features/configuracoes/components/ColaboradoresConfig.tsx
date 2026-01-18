/**
 * ColaboradoresConfig - Configuração de Colaboradores
 *
 * Funcionalidades:
 * - Listar todos os colaboradores em tabela
 * - Busca e filtros por setor/nível
 * - CRUD completo de colaboradores
 * - Modal para criar/editar colaborador
 */

import { useState, memo, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Users,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { useOrganoStore } from '@/stores/organoStore'
import { useConfigStore } from '@/stores/configStore'
import { ColaboradorModal } from '@/components/organograma/ColaboradorModal'
import type { Colaborador, ID } from '@/types'

type SortField = 'nome' | 'cargo' | 'setor' | 'nivel'
type SortDirection = 'asc' | 'desc'

export const ColaboradoresConfig = memo(function ColaboradoresConfig() {
  const {
    colaboradores,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    loadColaboradores,
  } = useOrganoStore(
    useShallow((state) => ({
      colaboradores: state.colaboradores,
      addColaborador: state.addColaborador,
      updateColaborador: state.updateColaborador,
      deleteColaborador: state.deleteColaborador,
      loadColaboradores: state.loadColaboradores,
    }))
  )

  const { niveis, setores } = useConfigStore(
    useShallow((state) => ({
      niveis: state.niveis,
      setores: state.setores,
    }))
  )

  // UI state
  const [search, setSearch] = useState('')
  const [filterSetorId, setFilterSetorId] = useState<ID | null>(null)
  const [filterNivelId, setFilterNivelId] = useState<ID | null>(null)
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Modal state
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null)
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null)

  // Helper functions
  const getSetorNome = useCallback(
    (setorId: ID) => setores.find((s) => s.id === setorId)?.nome ?? 'Desconhecido',
    [setores]
  )

  const getSetorCor = useCallback(
    (setorId: ID) => setores.find((s) => s.id === setorId)?.cor ?? '#E5E7EB',
    [setores]
  )

  const getNivelNome = useCallback(
    (nivelId: ID) => niveis.find((n) => n.id === nivelId)?.nome ?? 'Desconhecido',
    [niveis]
  )

  const getNivelCor = useCallback(
    (nivelId: ID) => niveis.find((n) => n.id === nivelId)?.cor ?? '#E5E7EB',
    [niveis]
  )

  // Filtered and sorted colaboradores
  const filteredColaboradores = useMemo(() => {
    let result = colaboradores

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.cargo.toLowerCase().includes(searchLower)
      )
    }

    // Filter by setor
    if (filterSetorId !== null) {
      result = result.filter((c) => c.setorId === filterSetorId)
    }

    // Filter by nivel
    if (filterNivelId !== null) {
      result = result.filter((c) => c.nivelId === filterNivelId)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valueA: string
      let valueB: string

      switch (sortField) {
        case 'nome':
          valueA = a.nome
          valueB = b.nome
          break
        case 'cargo':
          valueA = a.cargo
          valueB = b.cargo
          break
        case 'setor':
          valueA = getSetorNome(a.setorId)
          valueB = getSetorNome(b.setorId)
          break
        case 'nivel':
          valueA = getNivelNome(a.nivelId)
          valueB = getNivelNome(b.nivelId)
          break
        default:
          return 0
      }

      const comparison = valueA.localeCompare(valueB, 'pt-BR')
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [colaboradores, search, filterSetorId, filterNivelId, sortField, sortDirection, getSetorNome, getNivelNome])

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortDirection('asc')
      return field
    })
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearch('')
    setFilterSetorId(null)
    setFilterNivelId(null)
  }, [])

  // Open modal for create
  const handleCreate = useCallback(() => {
    setSelectedColaborador(null)
    setModalMode('create')
  }, [])

  // Open modal for edit
  const handleEdit = useCallback((colaborador: Colaborador) => {
    setSelectedColaborador(colaborador)
    setModalMode('edit')
  }, [])

  // Open modal for view
  const handleView = useCallback((colaborador: Colaborador) => {
    setSelectedColaborador(colaborador)
    setModalMode('view')
  }, [])

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalMode(null)
    setSelectedColaborador(null)
  }, [])

  // Save colaborador - retorna Promise para o modal aguardar
  const handleSave = useCallback(
    async (data: Partial<Colaborador>): Promise<void> => {
      if (modalMode === 'create') {
        await addColaborador({
          nome: data.nome ?? '',
          cargo: data.cargo ?? '',
          setorId: data.setorId ?? 1,
          nivelId: data.nivelId ?? 5,
          subnivelId: data.subnivelId,
          superiorId: data.superiorId,
          permissoes: data.permissoes ?? [],
        })
      } else if (modalMode === 'edit' && selectedColaborador) {
        await updateColaborador(selectedColaborador.id, data)
      }
      // Fecha o modal após sucesso - controlado pelo ColaboradorModal
    },
    [modalMode, selectedColaborador, addColaborador, updateColaborador]
  )

  // Delete colaborador
  const handleDelete = useCallback(
    async (id: ID) => {
      try {
        await deleteColaborador(id)
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error)
      }
    },
    [deleteColaborador]
  )

  // Refresh data from API
  const handleRefresh = useCallback(async () => {
    await loadColaboradores()
  }, [loadColaboradores])

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Users className="h-6 w-6 text-gray-400" />
          <div>
            <h2 className="font-semibold text-gray-900">
              {filteredColaboradores.length} colaborador
              {filteredColaboradores.length !== 1 ? 'es' : ''}
            </h2>
            {colaboradores.length !== filteredColaboradores.length && (
              <p className="text-sm text-gray-500">de {colaboradores.length} total</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Atualizar dados da API"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          <button
            onClick={handleCreate}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Novo Colaborador
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
            placeholder="Buscar nome ou cargo..."
          />
        </div>

        <Filter className="h-4 w-4 text-gray-500" />

        {/* Filter by setor */}
        <select
          value={filterSetorId ?? ''}
          onChange={(e) => setFilterSetorId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">Todos os setores</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>

        {/* Filter by nivel */}
        <select
          value={filterNivelId ?? ''}
          onChange={(e) => setFilterNivelId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 text-sm border rounded-lg"
        >
          <option value="">Todos os níveis</option>
          {niveis.map((nivel) => (
            <option key={nivel.id} value={nivel.id}>
              {nivel.nome}
            </option>
          ))}
        </select>

        {(search || filterSetorId !== null || filterNivelId !== null) && (
          <button onClick={clearFilters} className="text-sm text-aztech-primary hover:underline">
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-1">
                  Nome
                  {renderSortIndicator('nome')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cargo')}
              >
                <div className="flex items-center gap-1">
                  Cargo
                  {renderSortIndicator('cargo')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('setor')}
              >
                <div className="flex items-center gap-1">
                  Setor
                  {renderSortIndicator('setor')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nivel')}
              >
                <div className="flex items-center gap-1">
                  Nível
                  {renderSortIndicator('nivel')}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredColaboradores.map((colaborador) => (
              <tr
                key={colaborador.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleView(colaborador)}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{colaborador.nome}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{colaborador.cargo}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: getSetorCor(colaborador.setorId) + '40',
                      color: '#1e293b',
                    }}
                  >
                    {getSetorNome(colaborador.setorId)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: getNivelCor(colaborador.nivelId),
                      color: niveis.find((n) => n.id === colaborador.nivelId)?.corTexto ?? '#fff',
                    }}
                  >
                    {getNivelNome(colaborador.nivelId)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(colaborador)
                      }}
                      className="p-1.5 text-gray-400 hover:text-aztech-primary hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Excluir ${colaborador.nome}?`)) {
                          handleDelete(colaborador.id)
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredColaboradores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ColaboradorModal
        colaborador={selectedColaborador}
        allColaboradores={colaboradores}
        isOpen={modalMode !== null}
        mode={modalMode ?? 'view'}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
})

ColaboradoresConfig.displayName = 'ColaboradoresConfig'
