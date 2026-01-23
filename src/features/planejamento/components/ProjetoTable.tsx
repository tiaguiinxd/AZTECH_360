/**
 * ProjetoTable - Visualização de projetos em formato de tabela
 *
 * Substitui ProjetoCard para melhor visualização de dados tabulares.
 * Recursos: ordenação, linhas expansíveis, responsiva, acessível.
 */

import { memo, useCallback, useMemo, useState, useRef } from 'react'
import {
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  FileText,
  Users,
  Target,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import type { Projeto, StatusProjeto } from '@/types/planejamento'
import type { FuncaoAlocacao } from '@/types/dashboard'
import { EquipeBadgeHover } from './EquipeBadgeHover'
import { ProjetoAlocacaoList } from './ProjetoAlocacaoList'
import { ProjetoFuncoesGaps } from './ProjetoFuncoesGaps'
import { usePlanejamentoStore } from '@/stores/planejamentoStore'

interface ProjetoTableProps {
  projetos: Projeto[]
  onEdit: (projeto: Projeto) => void
  onDelete: (projeto: Projeto) => void
}

type SortField = 'codigo' | 'nome' | 'empresa' | 'cliente' | 'categoria' | 'valor' | 'status' | 'dataInicio' | 'percentual'
type SortOrder = 'asc' | 'desc'
type ExpandedRowView = 'detalhes' | 'equipe' | 'funcoes'

const STATUS_CONFIG: Record<StatusProjeto, { label: string; color: string; bg: string }> = {
  planejado: { label: 'Planejado', color: 'text-blue-700', bg: 'bg-blue-100' },
  em_andamento: { label: 'Em Andamento', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  concluido: { label: 'Concluido', color: 'text-green-700', bg: 'bg-green-100' },
  pausado: { label: 'Pausado', color: 'text-gray-700', bg: 'bg-gray-100' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatDateRange(inicio: string | null, fim: string | null): string {
  if (!inicio && !fim) return 'Sem data'
  if (!inicio) return `até ${formatDate(fim)}`
  if (!fim) return `${formatDate(inicio)} -`
  return `${formatDate(inicio)} - ${formatDate(fim)}`
}

export const ProjetoTable = memo(function ProjetoTable({
  projetos,
  onEdit,
  onDelete,
}: ProjetoTableProps) {
  // Estado de ordenação
  const [sortField, setSortField] = useState<SortField>('codigo')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [expandedRowView, setExpandedRowView] = useState<Record<number, ExpandedRowView>>({})

  // Nota: Alocações são carregadas pelo PlanejamentoPage no mount
  // Este componente apenas CONSOME os dados do dashboardStore.alocacoes
  // EquipeBadgeHover e ProjetoAlocacaoList filtram as alocações por projeto_id automaticamente

  // Store para atualizar funções não necessárias
  const updateProjeto = usePlanejamentoStore((state) => state.updateProjeto)

  // Ref para prevenir race condition (multiplos toggles rapidos)
  const updatingProjetosRef = useRef<Set<number>>(new Set())

  // Ordenar projetos
  const projetosOrdenados = useMemo(() => {
    const sorted = [...projetos]

    sorted.sort((a, b) => {
      let compareResult = 0

      switch (sortField) {
        case 'codigo':
          compareResult = a.codigo.localeCompare(b.codigo, 'pt-BR', { sensitivity: 'base' })
          break
        case 'nome':
          compareResult = a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
          break
        case 'empresa':
          compareResult = a.empresa.localeCompare(b.empresa, 'pt-BR', { sensitivity: 'base' })
          break
        case 'cliente':
          compareResult = a.cliente.localeCompare(b.cliente, 'pt-BR', { sensitivity: 'base' })
          break
        case 'categoria':
          compareResult = a.categoria.localeCompare(b.categoria, 'pt-BR', { sensitivity: 'base' })
          break
        case 'valor':
          compareResult = (a.valorEstimado ?? 0) - (b.valorEstimado ?? 0)
          break
        case 'status':
          compareResult = a.status.localeCompare(b.status)
          break
        case 'dataInicio':
          compareResult = (a.dataInicioPrevista ?? '').localeCompare(b.dataInicioPrevista ?? '')
          break
        case 'percentual':
          compareResult = a.percentualConclusao - b.percentualConclusao
          break
        default:
          compareResult = 0
      }

      return sortOrder === 'asc' ? compareResult : -compareResult
    })

    return sorted
  }, [projetos, sortField, sortOrder])

  // Handler de ordenação
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
        return prev
      } else {
        setSortOrder('asc')
        return field
      }
    })
  }, [])

  // Toggle expansão de linha
  const toggleExpand = useCallback((id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        // Limpar view ao fechar
        setExpandedRowView((prev) => {
          const { [id]: _, ...rest } = prev
          return rest
        })
      } else {
        newSet.add(id)
        // Definir view padrão como 'detalhes'
        setExpandedRowView((prev) => ({
          ...prev,
          [id]: 'detalhes'
        }))
      }
      return newSet
    })
  }, [])

  // Toggle view dentro da linha expandida
  const toggleView = useCallback((id: number, view: ExpandedRowView) => {
    setExpandedRowView((prev) => ({
      ...prev,
      [id]: view
    }))
  }, [])

  // Toggle função não necessária
  const handleToggleFuncaoNaoNecessaria = useCallback(
    async (projeto: Projeto, funcao: FuncaoAlocacao) => {
      // Prevenir race condition: bloquear se ja estiver atualizando este projeto
      if (updatingProjetosRef.current.has(projeto.id)) {
        console.warn('Atualização em progresso, aguarde...')
        return
      }

      updatingProjetosRef.current.add(projeto.id)

      try {
        const funcoesAtuais = projeto.funcoesNaoNecessarias || []
        const novasFuncoes = funcoesAtuais.includes(funcao)
          ? funcoesAtuais.filter((f) => f !== funcao) // Remover
          : [...funcoesAtuais, funcao] // Adicionar

        await updateProjeto(projeto.id, { funcoesNaoNecessarias: novasFuncoes })
      } catch (error) {
        console.error('Erro ao atualizar função:', error)
        alert('Erro ao salvar alteração. Tente novamente.')
      } finally {
        updatingProjetosRef.current.delete(projeto.id)
      }
    },
    [updateProjeto]
  )

  // Componente de cabeçalho ordenável
  const SortableHeader = useCallback(
    ({
      field,
      children,
      className = '',
    }: {
      field: SortField
      children: React.ReactNode
      className?: string
    }) => {
      const isActive = sortField === field
      const Icon = isActive
        ? sortOrder === 'asc'
          ? ChevronUp
          : ChevronDown
        : ChevronsUpDown

      return (
        <th
          className={cn(
            'px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none',
            className
          )}
          onClick={() => handleSort(field)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleSort(field)
            }
          }}
          aria-sort={
            isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined
          }
        >
          <div className="flex items-center gap-1">
            {children}
            <Icon className={cn('h-4 w-4', isActive ? 'text-aztech-primary' : 'text-gray-400')} />
          </div>
        </th>
      )
    },
    [sortField, sortOrder, handleSort]
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Tabela de projetos de planejamento</caption>
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-12" aria-label="Expandir detalhes"></th>
              <SortableHeader field="codigo">Código</SortableHeader>
              <SortableHeader field="nome" className="min-w-[200px]">
                Nome
              </SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="empresa">Empresa</SortableHeader>
              <SortableHeader field="cliente">Cliente</SortableHeader>
              <SortableHeader field="categoria">Categoria</SortableHeader>
              <SortableHeader field="valor">Valor</SortableHeader>
              <SortableHeader field="dataInicio">Período</SortableHeader>
              <SortableHeader field="percentual">Conclusão</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Equipe
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                aria-label="Ações"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projetosOrdenados.map((projeto) => {
              const statusConfig = STATUS_CONFIG[projeto.status]
              const isExpanded = expandedRows.has(projeto.id)

              return (
                <>
                  <tr
                    key={projeto.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      isExpanded && 'bg-gray-50'
                    )}
                  >
                  {/* Coluna de expansão */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(projeto.id)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </td>

                  {/* Código */}
                  <td className="px-4 py-3 text-sm font-mono text-gray-700 whitespace-nowrap">
                    {projeto.codigo}
                  </td>

                  {/* Nome */}
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium line-clamp-1">{projeto.nome}</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        statusConfig.bg,
                        statusConfig.color
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* Empresa */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {projeto.empresa}
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {projeto.cliente}
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {projeto.categoria}
                  </td>

                  {/* Valor */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                      {formatCurrency(projeto.valorEstimado)}
                    </div>
                  </td>

                  {/* Período */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDateRange(projeto.dataInicioPrevista, projeto.dataFimPrevista)}
                    </div>
                  </td>

                  {/* Conclusão */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            projeto.percentualConclusao >= 100
                              ? 'bg-green-500'
                              : projeto.percentualConclusao >= 50
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                          )}
                          style={{ width: `${Math.min(projeto.percentualConclusao, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium min-w-[35px] text-right">
                        {projeto.percentualConclusao}%
                      </span>
                    </div>
                  </td>

                  {/* Equipe */}
                  <td className="px-4 py-3 text-sm">
                    <EquipeBadgeHover projetoId={projeto.id} />
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(projeto)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-aztech-primary transition-colors"
                        title="Editar"
                        aria-label={`Editar projeto ${projeto.codigo}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(projeto)}
                        className="p-1.5 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                        title="Excluir"
                        aria-label={`Excluir projeto ${projeto.codigo}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Linha expandida com mini-tabs - ATENÇÃO: colspan={12} deve ser igual ao número de th no thead */}
                {isExpanded && (
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={12} className="px-4 py-4">
                      {/* Mini-tabs */}
                      <div role="tablist" aria-label="Informações do projeto" className="flex gap-2 mb-4 border-b border-gray-300 pb-2">
                        <button
                          type="button"
                          role="tab"
                          id={`tab-detalhes-${projeto.id}`}
                          aria-selected={!expandedRowView[projeto.id] || expandedRowView[projeto.id] === 'detalhes'}
                          aria-controls={`panel-detalhes-${projeto.id}`}
                          onClick={() => toggleView(projeto.id, 'detalhes')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors',
                            !expandedRowView[projeto.id] || expandedRowView[projeto.id] === 'detalhes'
                              ? 'border-aztech-primary text-aztech-primary bg-white'
                              : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          Detalhes
                        </button>
                        <button
                          type="button"
                          role="tab"
                          id={`tab-equipe-${projeto.id}`}
                          aria-selected={expandedRowView[projeto.id] === 'equipe'}
                          aria-controls={`panel-equipe-${projeto.id}`}
                          onClick={() => toggleView(projeto.id, 'equipe')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors',
                            expandedRowView[projeto.id] === 'equipe'
                              ? 'border-aztech-primary text-aztech-primary bg-white'
                              : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                          )}
                        >
                          <Users className="h-4 w-4" />
                          Equipe
                        </button>
                        <button
                          type="button"
                          role="tab"
                          id={`tab-funcoes-${projeto.id}`}
                          aria-selected={expandedRowView[projeto.id] === 'funcoes'}
                          aria-controls={`panel-funcoes-${projeto.id}`}
                          onClick={() => toggleView(projeto.id, 'funcoes')}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors',
                            expandedRowView[projeto.id] === 'funcoes'
                              ? 'border-aztech-primary text-aztech-primary bg-white'
                              : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                          )}
                        >
                          <Target className="h-4 w-4" />
                          Funcoes
                        </button>
                      </div>

                      {/* Conteúdo baseado em activeView */}
                      {expandedRowView[projeto.id] === 'equipe' ? (
                        <div
                          role="tabpanel"
                          id={`panel-equipe-${projeto.id}`}
                          aria-labelledby={`tab-equipe-${projeto.id}`}
                        >
                          <ProjetoAlocacaoList
                            projetoId={projeto.id}
                            projetoCodigo={projeto.codigo}
                            mode="full"
                          />
                        </div>
                      ) : expandedRowView[projeto.id] === 'funcoes' ? (
                        <div
                          role="tabpanel"
                          id={`panel-funcoes-${projeto.id}`}
                          aria-labelledby={`tab-funcoes-${projeto.id}`}
                        >
                          <ProjetoFuncoesGaps
                            projetoId={projeto.id}
                            funcoesNaoNecessarias={projeto.funcoesNaoNecessarias || []}
                            onToggleFuncaoNaoNecessaria={(funcao) =>
                              handleToggleFuncaoNaoNecessaria(projeto, funcao)
                            }
                          />
                        </div>
                      ) : (
                        <div
                          role="tabpanel"
                          id={`panel-detalhes-${projeto.id}`}
                          aria-labelledby={`tab-detalhes-${projeto.id}`}
                          className="space-y-3"
                        >
                          {/* Descrição */}
                          {projeto.descricao && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-1">
                                Descrição
                              </h4>
                              <p className="text-sm text-gray-600">{projeto.descricao}</p>
                            </div>
                          )}

                          {/* Subcategoria e Tipo */}
                          {(projeto.subcategoria || projeto.tipo) && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-1">
                                Informações Adicionais
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {projeto.subcategoria && (
                                  <span className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border">
                                    Subcategoria: {projeto.subcategoria}
                                  </span>
                                )}
                                {projeto.tipo && (
                                  <span className="px-2 py-0.5 bg-white text-gray-700 rounded text-xs border">
                                    Tipo: {projeto.tipo}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Empty state */}
                          {!projeto.descricao && !projeto.subcategoria && !projeto.tipo && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              Nenhum detalhe adicional cadastrado
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state (caso não haja projetos) */}
      {projetos.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhum projeto para exibir</p>
        </div>
      )}
    </div>
  )
})

ProjetoTable.displayName = 'ProjetoTable'
