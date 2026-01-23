/**
 * ProjetoAlocacaoList - Lista de alocacoes da equipe em um projeto
 *
 * Exibe colaboradores alocados com suas funcoes em formato de lista.
 * Permite adicionar e remover alocacoes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Users, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useOrganoStore } from '@/stores/organoStore'
import type { AlocacaoComDetalhes, FuncaoAlocacao } from '@/types/dashboard'
import { FUNCAO_LABELS } from '@/types/dashboard'
import { AlocacaoInlineForm } from './AlocacaoInlineForm'

interface ProjetoAlocacaoListProps {
  projetoId: number
  projetoCodigo: string
  mode?: 'full' | 'compact' // full: com form inline, compact: só visualização
}

export function ProjetoAlocacaoList({
  projetoId,
  projetoCodigo,
  mode = 'full',
}: ProjetoAlocacaoListProps) {
  // ============ HOOKS ============

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  // Dashboard store - Alocacoes
  const { alocacoes, error: dashboardError, fetchAlocacoes, deleteAlocacao } = useDashboardStore(
    useShallow((state) => ({
      alocacoes: state.alocacoes,
      error: state.error,
      fetchAlocacoes: state.fetchAlocacoes,
      deleteAlocacao: state.deleteAlocacao,
    }))
  )

  // Filtrar alocacoes apenas deste projeto
  const alocacoesProjeto = useMemo(() => {
    return alocacoes.filter((a) => a.projeto_id === projetoId && a.status === 'ativa')
  }, [alocacoes, projetoId])

  // Organo store - Colaboradores
  const colaboradores = useOrganoStore(useShallow((state) => state.colaboradores))

  // ============ EFFECTS ============

  useEffect(() => {
    const loadAlocacoes = async () => {
      setIsLoading(true)
      setLocalError(null)
      try {
        await fetchAlocacoes(projetoId, undefined)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Erro ao carregar alocações')
      } finally {
        setIsLoading(false)
      }
    }

    loadAlocacoes()
  }, [projetoId, fetchAlocacoes])

  // ============ HANDLERS ============

  const handleAddClick = useCallback(() => {
    setIsAddingNew(true)
  }, [])

  const handleCancelAdd = useCallback(() => {
    setIsAddingNew(false)
  }, [])

  const handleSuccessAdd = useCallback(() => {
    setIsAddingNew(false)
    // fetchAlocacoes é chamado automaticamente pelo dashboardStore
  }, [])

  const handleDelete = useCallback(
    async (alocacaoId: number) => {
      if (
        !window.confirm(
          'Tem certeza que deseja remover esta alocação? Esta ação não pode ser desfeita.'
        )
      ) {
        return
      }

      try {
        await deleteAlocacao(alocacaoId)
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Erro ao remover alocação')
      }
    },
    [deleteAlocacao]
  )

  // ============ RENDER ============

  const error = localError || dashboardError

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aztech-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">
            Equipe Alocada ({alocacoesProjeto.length})
          </h3>
        </div>
        {mode === 'full' && !isAddingNew && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 text-xs text-aztech-primary hover:text-aztech-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Pessoa
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 text-red-700 rounded text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de alocacoes */}
      <div className="space-y-2">
        {alocacoesProjeto.length === 0 && !isAddingNew ? (
          <div className="text-center py-4 text-sm text-gray-500">
            Nenhuma pessoa alocada ainda.
            {mode === 'full' && (
              <button
                onClick={handleAddClick}
                className="block mx-auto mt-2 text-aztech-primary hover:underline"
              >
                Adicionar primeira pessoa
              </button>
            )}
          </div>
        ) : (
          alocacoesProjeto.map((alocacao) => (
            <div
              key={alocacao.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-aztech-primary">
                    {FUNCAO_LABELS[alocacao.funcao as FuncaoAlocacao]}
                  </span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-xs text-gray-700 truncate">
                    {alocacao.colaborador_nome}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {alocacao.colaborador_cargo}
                </div>
              </div>
              {mode === 'full' && (
                <button
                  onClick={() => handleDelete(alocacao.id)}
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Remover alocação"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}

        {/* Form inline para adicionar */}
        {mode === 'full' && isAddingNew && (
          <AlocacaoInlineForm
            projetoId={projetoId}
            projetoCodigo={projetoCodigo}
            colaboradores={colaboradores}
            onCancel={handleCancelAdd}
            onSuccess={handleSuccessAdd}
          />
        )}
      </div>
    </div>
  )
}
