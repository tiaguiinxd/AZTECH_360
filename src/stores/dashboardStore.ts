/**
 * Dashboard Store - Alocacao de Pessoal e Volume de Obra
 *
 * Store para gerenciar dados do dashboard de alocacao.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  DashboardState,
  DashboardActions,
  DashboardFilters,
  Alocacao,
  AlocacaoCreate,
  AlocacaoUpdate,
  AlocacaoComDetalhes,
  ResumoGeralDashboard,
  ResumoEmpresaDashboard,
  TimelineItemDashboard,
  DisponibilidadeColaborador,
} from '@/types/dashboard'

import {
  alocacoesApi,
  apiToAlocacao,
  apiToAlocacaoComDetalhes,
} from '@/services/api'

const DEFAULT_FILTERS: DashboardFilters = {
  ano: new Date().getFullYear(),
  empresa: null,
  setor_id: null,
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      // ============ STATE ============
      resumoGeral: null,
      resumoEmpresas: [],
      timeline: [],
      disponibilidade: [],
      alocacoes: [],
      sobrecargaTemporal: [],

      isLoading: false,
      error: null,
      filters: DEFAULT_FILTERS,

      _hasHydrated: false,

      // ============ DATA FETCHING ============

      fetchResumoGeral: async () => {
        set({ isLoading: true, error: null })
        try {
          const data = await alocacoesApi.getResumoGeral()
          set({ resumoGeral: data, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar resumo geral',
            isLoading: false,
          })
        }
      },

      fetchResumoEmpresas: async () => {
        set({ isLoading: true, error: null })
        try {
          const data = await alocacoesApi.getResumoEmpresas()
          set({ resumoEmpresas: data, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar resumo empresas',
            isLoading: false,
          })
        }
      },

      fetchTimeline: async (ano?: number, empresa?: string) => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const data = await alocacoesApi.getTimeline(
            ano ?? filters.ano,
            empresa ?? filters.empresa ?? undefined
          )
          set({ timeline: data, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar timeline',
            isLoading: false,
          })
        }
      },

      fetchDisponibilidade: async (setor_id?: number) => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const data = await alocacoesApi.getDisponibilidade(
            setor_id ?? filters.setor_id ?? undefined
          )
          set({ disponibilidade: data, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar disponibilidade',
            isLoading: false,
          })
        }
      },

      fetchSobrecargaTemporal: async (ano?: number) => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()
          const data = await alocacoesApi.getSobrecargaTemporal(
            ano ?? filters.ano
          )
          set({ sobrecargaTemporal: data, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar sobrecarga temporal',
            isLoading: false,
          })
        }
      },

      fetchAlocacoes: async (projeto_id?: number, colaborador_id?: number) => {
        set({ isLoading: true, error: null })
        try {
          const data = await alocacoesApi.list({
            projeto_id,
            colaborador_id,
          })
          set({
            alocacoes: data.map(apiToAlocacaoComDetalhes),
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar alocacoes',
            isLoading: false,
          })
        }
      },

      fetchAll: async () => {
        set({ isLoading: true, error: null })
        try {
          const { filters } = get()

          const [resumoGeral, resumoEmpresas, timeline, disponibilidade, sobrecargaTemporal] = await Promise.all([
            alocacoesApi.getResumoGeral(),
            alocacoesApi.getResumoEmpresas(),
            alocacoesApi.getTimeline(filters.ano, filters.empresa ?? undefined),
            alocacoesApi.getDisponibilidade(filters.setor_id ?? undefined),
            alocacoesApi.getSobrecargaTemporal(filters.ano),
          ])

          set({
            resumoGeral,
            resumoEmpresas,
            timeline,
            disponibilidade,
            sobrecargaTemporal,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar dashboard',
            isLoading: false,
          })
        }
      },

      // ============ CRUD ALOCACOES ============

      createAlocacao: async (data: AlocacaoCreate) => {
        set({ isLoading: true, error: null })
        try {
          const response = await alocacoesApi.create(data)
          const alocacao = apiToAlocacao(response)

          // Refresh dashboard data
          const { fetchAll } = get()
          await fetchAll()

          return alocacao
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao criar alocacao',
            isLoading: false,
          })
          throw error
        }
      },

      updateAlocacao: async (id: number, data: AlocacaoUpdate) => {
        set({ isLoading: true, error: null })
        try {
          const response = await alocacoesApi.update(id, data)
          const alocacao = apiToAlocacao(response)

          // Refresh dashboard data
          const { fetchAll } = get()
          await fetchAll()

          return alocacao
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao atualizar alocacao',
            isLoading: false,
          })
          throw error
        }
      },

      deleteAlocacao: async (id: number) => {
        set({ isLoading: true, error: null })
        try {
          await alocacoesApi.delete(id)

          // Refresh dashboard data
          const { fetchAll } = get()
          await fetchAll()
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao deletar alocacao',
            isLoading: false,
          })
          throw error
        }
      },

      // ============ FILTERS ============

      setFilters: (newFilters: Partial<DashboardFilters>) => {
        const { filters, fetchAll } = get()
        set({ filters: { ...filters, ...newFilters } })
        // Refresh data with new filters
        fetchAll()
      },

      resetFilters: () => {
        const { fetchAll } = get()
        set({ filters: DEFAULT_FILTERS })
        fetchAll()
      },

      // ============ HYDRATION ============

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'aztech-dashboard',
      onRehydrateStorage: () => (state) => {
        // Setar _hasHydrated para true após hidratação (ou se não houver dados)
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        // Persistir apenas UI state (filtros)
        filters: state.filters,
      }),
    }
  )
)

// Garantir que _hasHydrated seja true mesmo na primeira carga (sem dados persistidos)
// O onRehydrateStorage só é chamado se houver dados, então precisamos setar manualmente
if (typeof window !== 'undefined') {
  // Aguardar um tick para garantir que o store foi inicializado
  setTimeout(() => {
    const state = useDashboardStore.getState()
    if (!state._hasHydrated) {
      state.setHasHydrated(true)
    }
  }, 0)
}
