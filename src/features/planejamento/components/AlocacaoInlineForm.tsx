/**
 * AlocacaoInlineForm - Form inline para adicionar alocacao rapida
 *
 * Form compacto para alocar colaborador em projeto com funcao especifica.
 */

import { useState, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Save, X, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { ColaboradorCombobox } from './ColaboradorCombobox'
import type { Colaborador } from '@/types/colaborador'
import type { FuncaoAlocacao, AlocacaoCreate } from '@/types/dashboard'
import { FUNCAO_LABELS } from '@/types/dashboard'

interface AlocacaoInlineFormProps {
  projetoId: number
  projetoCodigo: string
  colaboradores: Colaborador[]
  onCancel: () => void
  onSuccess: () => void
}

const FUNCOES_OPTIONS: FuncaoAlocacao[] = [
  'gerente_projeto',
  'coordenador',
  'engenheiro',
  'tecnico',
  'encarregado',
  'auxiliar',
  'fiscal',
  'comprador',
]

export function AlocacaoInlineForm({
  projetoId,
  projetoCodigo,
  colaboradores,
  onCancel,
  onSuccess,
}: AlocacaoInlineFormProps) {
  // ============ HOOKS ============

  const [funcao, setFuncao] = useState<FuncaoAlocacao>('engenheiro')
  const [colaboradorId, setColaboradorId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { alocacoes, disponibilidade, createAlocacao } = useDashboardStore(
    useShallow((state) => ({
      alocacoes: state.alocacoes,
      disponibilidade: state.disponibilidade,
      createAlocacao: state.createAlocacao,
    }))
  )

  // ============ HANDLERS ============

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!colaboradorId) {
        setError('Selecione um colaborador')
        return
      }

      setIsSaving(true)
      try {
        const dataInicio = new Date().toISOString().split('T')[0] // Data de hoje

        const data: AlocacaoCreate = {
          colaborador_id: colaboradorId,
          projeto_id: projetoId,
          funcao,
          data_inicio: dataInicio,
          status: 'ativa',
        }

        await createAlocacao(data)
        onSuccess()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao adicionar alocação')
      } finally {
        setIsSaving(false)
      }
    },
    [colaboradorId, projetoId, funcao, createAlocacao, onSuccess]
  )

  // ============ RENDER ============

  // Colaboradores disponíveis (ativos e não alocados neste projeto)
  const colaboradoresDisponiveis = useMemo(() => {
    // IDs já alocados neste projeto
    const alocadosIds = new Set(
      alocacoes
        .filter((a) => a.projeto_id === projetoId && a.status === 'ativa')
        .map((a) => a.colaborador_id)
    )

    return colaboradores.filter((c) => c.ativo && !alocadosIds.has(c.id))
  }, [colaboradores, alocacoes, projetoId])

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-blue-50 border border-blue-200 rounded space-y-2"
    >
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Funcao */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Função *</label>
          <select
            value={funcao}
            onChange={(e) => setFuncao(e.target.value as FuncaoAlocacao)}
            className="w-full px-2 py-1.5 text-xs border rounded focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
            disabled={isSaving}
          >
            {FUNCOES_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {FUNCAO_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        {/* Colaborador */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Colaborador *
          </label>
          <ColaboradorCombobox
            colaboradores={colaboradoresDisponiveis}
            value={colaboradorId}
            onChange={setColaboradorId}
            placeholder="Buscar colaborador..."
            disabled={isSaving}
            disponibilidades={disponibilidade}
            showDisponibilidade={true}
          />
        </div>
      </div>

      {/* Acoes */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 text-xs text-gray-600 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <X className="h-3 w-3" />
        </button>
        <button
          type="submit"
          disabled={isSaving || !colaboradorId}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-aztech-primary rounded hover:bg-aztech-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-3 w-3" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
