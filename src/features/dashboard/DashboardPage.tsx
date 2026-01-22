/**
 * DashboardPage - Pagina principal do Dashboard
 *
 * Exibe metricas, resumo por empresa, timeline e disponibilidade.
 */

import { useEffect, useMemo, useCallback, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  RefreshCw,
  Briefcase,
  DollarSign,
  Users,
  CheckCircle,
  Calendar,
  UserPlus,
} from 'lucide-react'

import { useDashboardStore } from '@/stores/dashboardStore'
import { useConfigStore } from '@/stores/configStore'
import {
  MetricCard,
  EmpresaCard,
  TimelineChart,
  DisponibilidadeList,
  AlocacaoModal,
  OverloadChart,
} from './components'

export function DashboardPage() {
  // ============ HOOKS (SEMPRE NO TOPO) ============

  const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false)

  const {
    resumoGeral,
    resumoEmpresas,
    timeline,
    disponibilidade,
    sobrecargaTemporal,
    isLoading,
    error,
    filters,
    _hasHydrated,
    fetchAll,
    setFilters,
  } = useDashboardStore(
    useShallow((state) => ({
      resumoGeral: state.resumoGeral,
      resumoEmpresas: state.resumoEmpresas,
      timeline: state.timeline,
      disponibilidade: state.disponibilidade,
      sobrecargaTemporal: state.sobrecargaTemporal,
      isLoading: state.isLoading,
      error: state.error,
      filters: state.filters,
      _hasHydrated: state._hasHydrated,
      fetchAll: state.fetchAll,
      setFilters: state.setFilters,
    }))
  )

  const setores = useConfigStore(
    useShallow((state) => state.setores)
  )

  // Anos disponiveis (atual + proximo)
  const anosDisponiveis = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 1, currentYear, currentYear + 1]
  }, [])

  // Empresas unicas do resumo
  const empresasDisponiveis = useMemo(() => {
    return resumoEmpresas.map((e) => e.empresa)
  }, [resumoEmpresas])

  // Formatar moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }, [])

  // ============ EFFECTS ============

  useEffect(() => {
    if (_hasHydrated) {
      fetchAll()
    }
  }, [_hasHydrated, fetchAll])

  // ============ HANDLERS ============

  const handleRefresh = useCallback(() => {
    fetchAll()
  }, [fetchAll])

  const handleAnoChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters({ ano: Number(e.target.value) })
    },
    [setFilters]
  )

  const handleEmpresaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setFilters({ empresa: value || null })
    },
    [setFilters]
  )

  const handleSetorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setFilters({ setor_id: value ? Number(value) : null })
    },
    [setFilters]
  )

  const handleOpenAlocacaoModal = useCallback(() => {
    setIsAlocacaoModalOpen(true)
  }, [])

  const handleCloseAlocacaoModal = useCallback(() => {
    setIsAlocacaoModalOpen(false)
  }, [])

  // ============ LOADING STATE ============

  if (!_hasHydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-aztech-primary" />
      </div>
    )
  }

  // ============ RENDER ============

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Visao geral de projetos e alocacao de pessoal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAlocacaoModal}
            className="flex items-center gap-2 rounded-lg border border-aztech-primary px-4 py-2 text-aztech-primary transition-colors hover:bg-aztech-primary/10"
          >
            <UserPlus className="h-4 w-4" />
            Nova Alocacao
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-aztech-primary px-4 py-2 text-white transition-colors hover:bg-aztech-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Metricas Gerais */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projetos"
          value={resumoGeral?.total_projetos ?? 0}
          subtitle={`${resumoGeral?.projetos_em_andamento ?? 0} em andamento`}
          icon={Briefcase}
          color="primary"
        />
        <MetricCard
          title="Carteira Total"
          value={formatCurrency(resumoGeral?.valor_total_carteira ?? 0)}
          subtitle="Valor estimado"
          icon={DollarSign}
          color="success"
        />
        <MetricCard
          title="Equipe Alocada"
          value={resumoGeral?.total_colaboradores_alocados ?? 0}
          subtitle={`${resumoGeral?.percentual_equipe_alocada ?? 0}% da equipe`}
          icon={Users}
          color="info"
        />
        <MetricCard
          title="Concluidos"
          value={resumoGeral?.projetos_concluidos ?? 0}
          subtitle={`${resumoGeral?.projetos_planejados ?? 0} planejados`}
          icon={CheckCircle}
          color="warning"
        />
      </div>

      {/* Resumo por Empresa */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Resumo por Empresa
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumoEmpresas.map((empresa) => (
            <EmpresaCard key={empresa.empresa} data={empresa} />
          ))}
          {resumoEmpresas.length === 0 && !isLoading && (
            <div className="col-span-full rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              Nenhum projeto cadastrado
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Timeline de Projetos
            </h2>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.ano}
              onChange={handleAnoChange}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>

            <select
              value={filters.empresa ?? ''}
              onChange={handleEmpresaChange}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">Todas empresas</option>
              {empresasDisponiveis.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TimelineChart data={timeline} ano={filters.ano} />

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-500" />
            <span className="text-xs text-gray-600">Planejado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-xs text-gray-600">Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <span className="text-xs text-gray-600">Concluido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-500" />
            <span className="text-xs text-gray-600">Pausado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-xs text-gray-600">Cancelado</span>
          </div>
        </div>
      </div>

      {/* Sobrecarga Temporal */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Sobrecarga Temporal - {filters.ano}
          </h2>
        </div>
        <OverloadChart data={sobrecargaTemporal} ano={filters.ano} />
      </div>

      {/* Disponibilidade de Pessoal */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Disponibilidade de Pessoal
            </h2>
          </div>

          <select
            value={filters.setor_id ?? ''}
            onChange={handleSetorChange}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Todos setores</option>
            {(setores ?? []).map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>

        <DisponibilidadeList data={disponibilidade} />
      </div>

      {/* Modal de Alocacao */}
      <AlocacaoModal
        isOpen={isAlocacaoModalOpen}
        onClose={handleCloseAlocacaoModal}
      />
    </div>
  )
}
