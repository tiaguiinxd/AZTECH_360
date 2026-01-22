/**
 * Store de Planejamento
 *
 * Gerencia projetos/obras de planejamento.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Projeto, ProjetoFilters, StatusProjeto } from '@/types/planejamento'
import { projetosPlanejamentoApi, apiToProjeto, projetoToApi } from '@/services/api'

interface PlanejamentoState {
  // Dados
  projetos: Projeto[]
  opcoesEmpresas: string[]
  opcoesClientes: string[]
  opcoesCategorias: string[]

  // UI State
  filters: ProjetoFilters
  selectedId: number | null
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
}

interface PlanejamentoActions {
  // CRUD
  loadProjetos: () => Promise<void>
  createProjeto: (data: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<Projeto>
  updateProjeto: (id: number, data: Partial<Projeto>) => Promise<Projeto>
  deleteProjeto: (id: number) => Promise<void>

  // Opcoes
  loadOpcoes: () => Promise<void>

  // UI
  setFilters: (filters: Partial<ProjetoFilters>) => void
  setSelectedId: (id: number | null) => void
  clearFilters: () => void
  setHasHydrated: (state: boolean) => void
}

const initialFilters: ProjetoFilters = {
  empresa: null,
  cliente: null,
  categoria: null,
  status: null,
  busca: '',
}

export const usePlanejamentoStore = create<PlanejamentoState & PlanejamentoActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      projetos: [],
      opcoesEmpresas: [],
      opcoesClientes: [],
      opcoesCategorias: [],
      filters: initialFilters,
      selectedId: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // CRUD
      loadProjetos: async () => {
        set({ isLoading: true, error: null })
        try {
          const filters = get().filters
          const apiFilters: Record<string, string> = {}
          if (filters.empresa) apiFilters.empresa = filters.empresa
          if (filters.cliente) apiFilters.cliente = filters.cliente
          if (filters.categoria) apiFilters.categoria = filters.categoria
          if (filters.status) apiFilters.status = filters.status

          const response = await projetosPlanejamentoApi.list(apiFilters as Parameters<typeof projetosPlanejamentoApi.list>[0])
          const projetos = response.map(apiToProjeto)
          set({ projetos, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar projetos',
            isLoading: false,
          })
        }
      },

      createProjeto: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const apiData = projetoToApi(data as Projeto)
          const response = await projetosPlanejamentoApi.create(apiData)
          const projeto = apiToProjeto(response)
          set((state) => ({
            projetos: [...state.projetos, projeto],
            isLoading: false,
          }))
          return projeto
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao criar projeto',
            isLoading: false,
          })
          throw error
        }
      },

      updateProjeto: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
          const apiData: Record<string, unknown> = {}
          if (data.codigo !== undefined) apiData.codigo = data.codigo
          if (data.nome !== undefined) apiData.nome = data.nome
          if (data.descricao !== undefined) apiData.descricao = data.descricao
          if (data.empresa !== undefined) apiData.empresa = data.empresa
          if (data.cliente !== undefined) apiData.cliente = data.cliente
          if (data.categoria !== undefined) apiData.categoria = data.categoria
          if (data.subcategoria !== undefined) apiData.subcategoria = data.subcategoria
          if (data.tipo !== undefined) apiData.tipo = data.tipo
          if (data.valorEstimado !== undefined) apiData.valor_estimado = data.valorEstimado
          if (data.dataInicioPrevista !== undefined) apiData.data_inicio_prevista = data.dataInicioPrevista
          if (data.dataFimPrevista !== undefined) apiData.data_fim_prevista = data.dataFimPrevista
          if (data.dataInicioReal !== undefined) apiData.data_inicio_real = data.dataInicioReal
          if (data.dataFimReal !== undefined) apiData.data_fim_real = data.dataFimReal
          if (data.status !== undefined) apiData.status = data.status
          if (data.percentualConclusao !== undefined) apiData.percentual_conclusao = data.percentualConclusao

          const response = await projetosPlanejamentoApi.update(id, apiData as Parameters<typeof projetosPlanejamentoApi.update>[1])
          const projeto = apiToProjeto(response)
          set((state) => ({
            projetos: state.projetos.map((p) => (p.id === id ? projeto : p)),
            isLoading: false,
          }))
          return projeto
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao atualizar projeto',
            isLoading: false,
          })
          throw error
        }
      },

      deleteProjeto: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await projetosPlanejamentoApi.delete(id)
          set((state) => ({
            projetos: state.projetos.filter((p) => p.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao deletar projeto',
            isLoading: false,
          })
          throw error
        }
      },

      // Opcoes
      loadOpcoes: async () => {
        try {
          const [empresas, clientes, categorias] = await Promise.all([
            projetosPlanejamentoApi.getOpcoesEmpresas(),
            projetosPlanejamentoApi.getOpcoesClientes(),
            projetosPlanejamentoApi.getOpcoesCategorias(),
          ])
          set({
            opcoesEmpresas: empresas,
            opcoesClientes: clientes,
            opcoesCategorias: categorias,
          })
        } catch (error) {
          console.error('Erro ao carregar opcoes:', error)
        }
      },

      // UI
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }))
      },

      setSelectedId: (id) => set({ selectedId: id }),

      clearFilters: () => set({ filters: initialFilters }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'planejamento-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        // Apenas persistir filtros e UI state, nao dados
        filters: state.filters,
      }),
    }
  )
)

// Selectors
export const selectProjetos = (state: PlanejamentoState) => state.projetos ?? []
export const selectFilters = (state: PlanejamentoState) => state.filters
export const selectSelectedId = (state: PlanejamentoState) => state.selectedId
export const selectIsLoading = (state: PlanejamentoState) => state.isLoading
export const selectError = (state: PlanejamentoState) => state.error
export const selectHasHydrated = (state: PlanejamentoState) => state._hasHydrated
export const selectOpcoesEmpresas = (state: PlanejamentoState) => state.opcoesEmpresas ?? []
export const selectOpcoesClientes = (state: PlanejamentoState) => state.opcoesClientes ?? []
export const selectOpcoesCategorias = (state: PlanejamentoState) => state.opcoesCategorias ?? []

// Selector filtrado
export const selectProjetosFiltrados = (state: PlanejamentoState): Projeto[] => {
  const projetos = state.projetos ?? []
  const { empresa, cliente, categoria, status, busca } = state.filters

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
}
