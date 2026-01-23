/**
 * ProjetoFuncoesGaps - Analise de gaps de funcoes em um projeto
 *
 * Mostra todas as funcoes possiveis e seu status:
 * - Alocada (verde) - tem pessoa
 * - Gap (amarelo) - nao tem pessoa e nao marcada como "nao necessaria"
 * - Nao necessaria (cinza) - marcada como nao necessaria
 */

import { useMemo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { CheckCircle, AlertTriangle, XCircle, Users } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { FUNCAO_LABELS, type FuncaoAlocacao } from '@/types/dashboard'

// Todas as funcoes possiveis
const TODAS_FUNCOES: FuncaoAlocacao[] = [
  'gerente_projeto',
  'coordenador',
  'engenheiro',
  'tecnico',
  'encarregado',
  'auxiliar',
  'fiscal',
  'comprador',
]

type StatusFuncao = 'alocada' | 'gap' | 'nao_necessaria'

interface FuncaoStatus {
  funcao: FuncaoAlocacao
  label: string
  status: StatusFuncao
  qtdAlocados: number
  alocados: string[] // nomes dos colaboradores
}

interface ProjetoFuncoesGapsProps {
  projetoId: number
  funcoesNaoNecessarias: string[]
  onToggleFuncaoNaoNecessaria: (funcao: FuncaoAlocacao) => void
}

export function ProjetoFuncoesGaps({
  projetoId,
  funcoesNaoNecessarias,
  onToggleFuncaoNaoNecessaria,
}: ProjetoFuncoesGapsProps) {
  // Buscar alocacoes do projeto
  const alocacoes = useDashboardStore(
    useShallow((state) => state.alocacoes.filter((a) => a.projeto_id === projetoId && a.status === 'ativa'))
  )

  // Calcular status de cada funcao
  const funcoesStatus: FuncaoStatus[] = useMemo(() => {
    return TODAS_FUNCOES.map((funcao) => {
      const alocadosNaFuncao = alocacoes.filter((a) => a.funcao === funcao)
      const ehNaoNecessaria = funcoesNaoNecessarias.includes(funcao)

      let status: StatusFuncao
      if (alocadosNaFuncao.length > 0) {
        status = 'alocada'
      } else if (ehNaoNecessaria) {
        status = 'nao_necessaria'
      } else {
        status = 'gap'
      }

      return {
        funcao,
        label: FUNCAO_LABELS[funcao],
        status,
        qtdAlocados: alocadosNaFuncao.length,
        alocados: alocadosNaFuncao.map((a) => a.colaborador_nome),
      }
    })
  }, [alocacoes, funcoesNaoNecessarias])

  // Contar gaps
  const totalGaps = useMemo(() => funcoesStatus.filter((f) => f.status === 'gap').length, [funcoesStatus])

  const handleToggle = useCallback(
    (funcao: FuncaoAlocacao) => {
      onToggleFuncaoNaoNecessaria(funcao)
    },
    [onToggleFuncaoNaoNecessaria]
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Funcoes do Projeto</h3>
        </div>
        {totalGaps > 0 && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
            {totalGaps} {totalGaps === 1 ? 'gap' : 'gaps'}
          </span>
        )}
      </div>

      {/* Lista de funcoes */}
      <div className="space-y-2">
        {funcoesStatus.map(({ funcao, label, status, qtdAlocados, alocados }) => {
          const ehNaoNecessaria = status === 'nao_necessaria'
          const ehGap = status === 'gap'
          const ehAlocada = status === 'alocada'

          return (
            <div
              key={funcao}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                ehAlocada
                  ? 'bg-green-50 border-green-200'
                  : ehGap
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Icone de status */}
              <div className="flex-shrink-0">
                {ehAlocada && <CheckCircle className="h-5 w-5 text-green-600" />}
                {ehGap && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                {ehNaoNecessaria && <XCircle className="h-5 w-5 text-gray-400" />}
              </div>

              {/* Conteudo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      ehAlocada
                        ? 'text-green-700'
                        : ehGap
                          ? 'text-yellow-700'
                          : 'text-gray-500 line-through'
                    }`}
                  >
                    {label}
                  </span>
                  {ehAlocada && (
                    <span className="px-1.5 py-0.5 bg-green-600 text-white text-xs font-medium rounded">
                      {qtdAlocados}
                    </span>
                  )}
                </div>

                {/* Info adicional */}
                <div className="text-xs mt-0.5">
                  {ehAlocada && (
                    <span className="text-green-600">{alocados.join(', ')}</span>
                  )}
                  {ehGap && <span className="text-yellow-600">Nenhuma pessoa alocada</span>}
                  {ehNaoNecessaria && <span className="text-gray-500">Funcao nao necessaria neste projeto</span>}
                </div>
              </div>

              {/* Checkbox "Nao necessaria" */}
              <div className="flex-shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                  <input
                    type="checkbox"
                    checked={ehNaoNecessaria}
                    onChange={() => handleToggle(funcao)}
                    className="rounded border-gray-300 text-aztech-primary focus:ring-aztech-primary cursor-pointer"
                  />
                  <span>Nao necessaria</span>
                </label>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <span>Alocada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
              <span>Gap (falta alocar)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-gray-400" />
              <span>Nao necessaria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
