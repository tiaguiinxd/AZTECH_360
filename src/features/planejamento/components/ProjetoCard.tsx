/**
 * ProjetoCard - Card de projeto na lista
 */

import { memo, useCallback, useMemo, useEffect } from 'react'
import { Calendar, DollarSign, Pencil, Trash2, Building2, User } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import type { Projeto, StatusProjeto } from '@/types/planejamento'
import { useDashboardStore } from '@/stores/dashboardStore'
import { EquipeBadgeHover } from './EquipeBadgeHover'

interface ProjetoCardProps {
  projeto: Projeto
  onEdit: (projeto: Projeto) => void
  onDelete: (projeto: Projeto) => void
}

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
  }).format(value)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

export const ProjetoCard = memo(function ProjetoCard({
  projeto,
  onEdit,
  onDelete,
}: ProjetoCardProps) {
  const statusConfig = useMemo(() => STATUS_CONFIG[projeto.status], [projeto.status])

  // Dashboard store - Carregar alocacoes
  const fetchAlocacoes = useDashboardStore((state) => state.fetchAlocacoes)

  // Carregar alocacoes ao montar
  useEffect(() => {
    let isMounted = true

    const loadAlocacoes = async () => {
      try {
        await fetchAlocacoes(projeto.id, undefined)
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao carregar alocações:', err)
        }
      }
    }

    loadAlocacoes()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projeto.id]) // Removido fetchAlocacoes para evitar loop infinito

  const handleEdit = useCallback(() => {
    onEdit(projeto)
  }, [onEdit, projeto])

  const handleDelete = useCallback(() => {
    onDelete(projeto)
  }, [onDelete, projeto])

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-500">{projeto.codigo}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              statusConfig.bg,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
          <EquipeBadgeHover projetoId={projeto.id} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-aztech-primary transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">{projeto.nome}</h3>

        {projeto.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{projeto.descricao}</p>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span>{projeto.empresa}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <User className="h-4 w-4 text-gray-400" />
            <span>{projeto.cliente}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
            {projeto.categoria}
          </span>
          {projeto.subcategoria && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {projeto.subcategoria}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span>{formatCurrency(projeto.valorEstimado)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            {projeto.dataInicioPrevista
              ? `${formatDate(projeto.dataInicioPrevista)} - ${formatDate(projeto.dataFimPrevista)}`
              : 'Sem data'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Conclusao</span>
          <span>{projeto.percentualConclusao}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
      </div>
    </div>
  )
})

ProjetoCard.displayName = 'ProjetoCard'
