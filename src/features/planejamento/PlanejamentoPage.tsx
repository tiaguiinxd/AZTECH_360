/**
 * PlanejamentoPage - Pagina principal do modulo Planejamento
 *
 * Gerencia projetos/obras com cronogramas, prazos e valores.
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Plus, RefreshCw, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import { usePlanejamentoStore } from '@/stores/planejamentoStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { Projeto } from '@/types/planejamento'
import { ProjetoTable, ProjetoFilters, ProjetoModal } from './components'

export const PlanejamentoPage = memo(function PlanejamentoPage() {
  // Store state
  const {
    projetos,
    filters,
    opcoesEmpresas,
    opcoesClientes,
    opcoesCategorias,
    isLoading,
    error,
    _hasHydrated,
  } = usePlanejamentoStore(
    useShallow((state) => ({
      projetos: state.projetos,
      filters: state.filters,
      opcoesEmpresas: state.opcoesEmpresas,
      opcoesClientes: state.opcoesClientes,
      opcoesCategorias: state.opcoesCategorias,
      isLoading: state.isLoading,
      error: state.error,
      _hasHydrated: state._hasHydrated,
    }))
  )

  // Store actions
  const loadProjetos = usePlanejamentoStore((state) => state.loadProjetos)
  const loadOpcoes = usePlanejamentoStore((state) => state.loadOpcoes)
  const createProjeto = usePlanejamentoStore((state) => state.createProjeto)
  const updateProjeto = usePlanejamentoStore((state) => state.updateProjeto)
  const deleteProjeto = usePlanejamentoStore((state) => state.deleteProjeto)
  const setFilters = usePlanejamentoStore((state) => state.setFilters)
  const clearFilters = usePlanejamentoStore((state) => state.clearFilters)

  // Dashboard actions - para carregar alocacoes
  const fetchAlocacoes = useDashboardStore((state) => state.fetchAlocacoes)

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Projeto | null>(null)

  // Filtrar projetos localmente
  const projetosFiltrados = useMemo(() => {
    const { empresa, cliente, categoria, status, busca } = filters

    return projetos.filter((p) => {
      if (empresa && p.empresa !== empresa) return false
      if (cliente && p.cliente !== cliente) return false
      if (categoria && p.categoria !== categoria) return false
      if (status && p.status !== status) return false
      if (busca) {
        const searchLower = busca.toLowerCase()
        const matchNome = p.nome.toLowerCase().includes(searchLower)
        const matchCodigo = p.codigo.toLowerCase().includes(searchLower)
        const matchDescricao = p.descricao?.toLowerCase().includes(searchLower)
        if (!matchNome && !matchCodigo && !matchDescricao) return false
      }
      return true
    })
  }, [projetos, filters])

  // Carregar dados ao montar
  useEffect(() => {
    if (_hasHydrated) {
      loadProjetos()
      loadOpcoes()
      // Carregar todas as alocacoes para exibir badges de equipe
      fetchAlocacoes()
    }
  }, [_hasHydrated, loadProjetos, loadOpcoes, fetchAlocacoes])

  // Handlers
  const handleNewProjeto = useCallback(() => {
    setEditingProjeto(null)
    setIsModalOpen(true)
  }, [])

  const handleEditProjeto = useCallback((projeto: Projeto) => {
    setEditingProjeto(projeto)
    setIsModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((projeto: Projeto) => {
    setDeleteConfirm(projeto)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      try {
        await deleteProjeto(deleteConfirm.id)
        setDeleteConfirm(null)
      } catch (err) {
        console.error('Erro ao deletar projeto:', err)
      }
    }
  }, [deleteConfirm, deleteProjeto])

  const handleSaveProjeto = useCallback(
    async (data: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      if (editingProjeto) {
        await updateProjeto(editingProjeto.id, data)
      } else {
        await createProjeto(data)
      }
      await loadOpcoes() // Atualizar opcoes caso nova empresa/cliente/categoria
    },
    [editingProjeto, updateProjeto, createProjeto, loadOpcoes]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingProjeto(null)
  }, [])

  const handleRefresh = useCallback(() => {
    loadProjetos()
    loadOpcoes()
    fetchAlocacoes()
  }, [loadProjetos, loadOpcoes, fetchAlocacoes])

  // Aguardar hidratacao
  if (!_hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aztech-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-aztech-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Planejamento</h1>
              <p className="text-sm text-gray-500">
                Gestao de projetos e obras - cronogramas, prazos e valores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Atualizar
            </button>
            <button
              onClick={handleNewProjeto}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-aztech-primary rounded-lg hover:bg-aztech-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Projeto
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <ProjetoFilters
          filters={filters}
          opcoesEmpresas={opcoesEmpresas}
          opcoesClientes={opcoesClientes}
          opcoesCategorias={opcoesCategorias}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && projetos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aztech-primary mx-auto mb-2" />
              <p className="text-sm text-gray-500">Carregando projetos...</p>
            </div>
          </div>
        ) : projetosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              {projetos.length === 0 ? 'Nenhum projeto cadastrado' : 'Nenhum projeto encontrado'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {projetos.length === 0
                ? 'Comece adicionando seu primeiro projeto de planejamento.'
                : 'Tente ajustar os filtros para ver mais resultados.'}
            </p>
            {projetos.length === 0 && (
              <button
                onClick={handleNewProjeto}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-aztech-primary rounded-lg hover:bg-aztech-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Projeto
              </button>
            )}
          </div>
        ) : (
          <ProjetoTable
            projetos={projetosFiltrados}
            onEdit={handleEditProjeto}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modal de criacao/edicao */}
      <ProjetoModal
        isOpen={isModalOpen}
        projeto={editingProjeto}
        opcoesEmpresas={opcoesEmpresas}
        opcoesClientes={opcoesClientes}
        opcoesCategorias={opcoesCategorias}
        onSave={handleSaveProjeto}
        onClose={handleCloseModal}
      />

      {/* Dialog de confirmacao de exclusao */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar Exclusao</h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o projeto{' '}
              <span className="font-medium">{deleteConfirm.codigo}</span>?
            </p>
            <p className="text-sm text-gray-500 mb-4">Esta acao nao pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

PlanejamentoPage.displayName = 'PlanejamentoPage'
