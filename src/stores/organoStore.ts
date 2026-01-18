/**
 * Store Zustand para gerenciamento do Organograma
 *
 * ARQUITETURA:
 * - PostgreSQL é a única fonte de verdade para DADOS (colaboradores)
 * - localStorage armazena apenas ESTADO UI (expandedIds, selectedId)
 * - Todas as operações CRUD chamam a API primeiro, depois atualizam o estado local
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Colaborador, ID } from '@/types'
import {
  colaboradoresApi,
  apiToColaborador,
  colaboradorToApi,
} from '@/services/api'

// Types
interface OrganoFilters {
  search: string
  setorId: ID | null
  nivelId: ID | null
}

interface OrganoState {
  // Data (carregado da API)
  colaboradores: Colaborador[]
  isLoading: boolean
  error: string | null

  // UI State (persistido em localStorage)
  selectedId: ID | null
  expandedIds: ID[]
  filters: OrganoFilters

  // Hydration state
  _hasHydrated: boolean

  // Actions - Data Loading
  loadColaboradores: () => Promise<void>

  // Actions - CRUD (chamam API)
  addColaborador: (colaborador: Omit<Colaborador, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<Colaborador>
  updateColaborador: (id: ID, updates: Partial<Omit<Colaborador, 'id' | 'criadoEm'>>) => Promise<void>
  deleteColaborador: (id: ID) => Promise<void>

  // Actions - Selection
  setSelectedId: (id: ID | null) => void

  // Actions - Expansion
  toggleExpanded: (id: ID) => void
  expandAll: () => void
  collapseAll: () => void
  isExpanded: (id: ID) => boolean

  // Actions - Filters
  setFilters: (filters: Partial<OrganoFilters>) => void
  clearFilters: () => void

  // Actions - Data Management
  setHasHydrated: (state: boolean) => void
  setColaboradores: (colaboradores: Colaborador[]) => void
}

// Initial state
const initialFilters: OrganoFilters = {
  search: '',
  setorId: null,
  nivelId: null,
}

// Store
export const useOrganoStore = create<OrganoState>()(
  persist(
    (set, get) => ({
      // Initial data
      colaboradores: [],
      isLoading: false,
      error: null,
      selectedId: null,
      expandedIds: [] as ID[],
      filters: initialFilters,
      _hasHydrated: false,

      // Data Loading - Carrega da API
      loadColaboradores: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiColaboradores = await colaboradoresApi.list()
          const colaboradores = apiColaboradores.map(apiToColaborador)
          set({ colaboradores, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar colaboradores',
            isLoading: false,
          })
        }
      },

      // CRUD Actions - Todas chamam API primeiro
      addColaborador: async (data) => {
        set({ isLoading: true, error: null })
        try {
          // Cria um colaborador temporário para enviar à API
          const tempColaborador: Colaborador = {
            ...data,
            id: 0, // será substituído pela API
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          }

          const apiData = colaboradorToApi(tempColaborador)
          const created = await colaboradoresApi.create(apiData)
          const newColaborador = apiToColaborador(created)

          set((state) => ({
            colaboradores: [...state.colaboradores, newColaborador],
            isLoading: false,
          }))

          return newColaborador
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao criar colaborador',
            isLoading: false,
          })
          throw error
        }
      },

      updateColaborador: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          // Converte updates para formato API
          const apiUpdates: Record<string, unknown> = {}
          if (updates.nome !== undefined) apiUpdates.nome = updates.nome
          if (updates.cargo !== undefined) apiUpdates.cargo = updates.cargo
          if (updates.setorId !== undefined) apiUpdates.setor_id = updates.setorId
          if (updates.subsetorId !== undefined) apiUpdates.subsetor_id = updates.subsetorId ?? null
          if (updates.nivelId !== undefined) apiUpdates.nivel_id = updates.nivelId
          if (updates.subnivelId !== undefined) apiUpdates.subnivel_id = updates.subnivelId ?? null
          if (updates.superiorId !== undefined) apiUpdates.superior_id = updates.superiorId ?? null
          if (updates.permissoes !== undefined) apiUpdates.permissoes = updates.permissoes
          if (updates.fotoUrl !== undefined) apiUpdates.foto_url = updates.fotoUrl ?? null
          if (updates.email !== undefined) apiUpdates.email = updates.email ?? null
          if (updates.telefone !== undefined) apiUpdates.telefone = updates.telefone ?? null

          const updated = await colaboradoresApi.update(id, apiUpdates)
          const updatedColaborador = apiToColaborador(updated)

          set((state) => ({
            colaboradores: state.colaboradores.map((c) =>
              c.id === id ? updatedColaborador : c
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao atualizar colaborador',
            isLoading: false,
          })
          throw error
        }
      },

      deleteColaborador: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await colaboradoresApi.delete(id)

          // RN-ORG-005: Ao excluir superior, subordinados ficam órfãos
          // Isso já deve ser tratado pelo backend, mas atualizamos localmente também
          set((state) => ({
            colaboradores: state.colaboradores.filter((c) => c.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao excluir colaborador',
            isLoading: false,
          })
          throw error
        }
      },

      // Selection Actions
      setSelectedId: (id) => {
        set({ selectedId: id })
      },

      // Expansion Actions
      toggleExpanded: (id) => {
        set((state) => {
          const isCurrentlyExpanded = state.expandedIds.includes(id)
          return {
            expandedIds: isCurrentlyExpanded
              ? state.expandedIds.filter((expandedId) => expandedId !== id)
              : [...state.expandedIds, id],
          }
        })
      },

      expandAll: () => {
        set((state) => ({
          expandedIds: state.colaboradores.map((c) => c.id),
        }))
      },

      collapseAll: () => {
        set({ expandedIds: [] })
      },

      isExpanded: (id) => {
        return get().expandedIds.includes(id)
      },

      // Filter Actions
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }))
      },

      clearFilters: () => {
        set({ filters: initialFilters })
      },

      // Data Management
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      setColaboradores: (colaboradores) => {
        set({ colaboradores })
      },
    }),
    {
      name: 'aztech-organo-ui-storage',
      // Apenas estado UI é persistido - NÃO persiste colaboradores!
      partialize: (state) => ({
        expandedIds: state.expandedIds,
        selectedId: state.selectedId,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Selectors (para evitar re-renders desnecessários)
export const selectColaboradores = (state: OrganoState) => state.colaboradores
export const selectSelectedId = (state: OrganoState) => state.selectedId
export const selectExpandedIds = (state: OrganoState) => state.expandedIds
export const selectFilters = (state: OrganoState) => state.filters
export const selectHasHydrated = (state: OrganoState) => state._hasHydrated
export const selectIsLoading = (state: OrganoState) => state.isLoading
export const selectError = (state: OrganoState) => state.error

// Selector para colaboradores filtrados
export const selectFilteredColaboradores = (state: OrganoState) => {
  const { colaboradores, filters } = state

  return colaboradores.filter((c) => {
    // Filtro por busca
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchesName = c.nome.toLowerCase().includes(search)
      const matchesCargo = c.cargo.toLowerCase().includes(search)
      if (!matchesName && !matchesCargo) return false
    }

    // Filtro por setor
    if (filters.setorId !== null && c.setorId !== filters.setorId) {
      return false
    }

    // Filtro por nível
    if (filters.nivelId !== null && c.nivelId !== filters.nivelId) {
      return false
    }

    return true
  })
}

// Selector para obter subordinados de um colaborador
export const selectSubordinados = (superiorId: ID) => (state: OrganoState) =>
  state.colaboradores.filter((c) => c.superiorId === superiorId)

// Selector para obter colaborador por ID
export const selectColaboradorById = (id: ID) => (state: OrganoState) =>
  state.colaboradores.find((c) => c.id === id)

// Selector para obter colaboradores raiz (sem superior - nível 0)
export const selectRootColaboradores = (state: OrganoState) =>
  state.colaboradores.filter((c) => c.superiorId === undefined)

/**
 * Verifica se atribuir newSuperiorId como superior de colaboradorId criaria um ciclo.
 * Retorna true se um ciclo seria criado, false caso contrário.
 *
 * @param colaboradores Lista de todos os colaboradores
 * @param colaboradorId ID do colaborador que receberá novo superior
 * @param newSuperiorId ID do novo superior proposto
 */
export function checkHierarchyCycle(
  colaboradores: Colaborador[],
  colaboradorId: ID,
  newSuperiorId: ID | undefined
): boolean {
  if (newSuperiorId === undefined) {
    return false
  }

  // Não pode ser seu próprio superior
  if (colaboradorId === newSuperiorId) {
    return true
  }

  // Verifica se o novo superior está na cadeia de subordinação do colaborador
  // Ou seja, se newSuperiorId é subordinado (direto ou indireto) de colaboradorId
  const visited = new Set<ID>()
  let currentId: ID | undefined = newSuperiorId

  while (currentId !== undefined) {
    if (visited.has(currentId)) {
      return true // Ciclo detectado
    }
    if (currentId === colaboradorId) {
      return true // Novo superior é subordinado do colaborador
    }

    visited.add(currentId)
    const current = colaboradores.find((c) => c.id === currentId)
    if (!current) break
    currentId = current.superiorId
  }

  return false
}

/**
 * Retorna todos os subordinados (diretos e indiretos) de um colaborador.
 * Útil para validar que um colaborador não pode ter como superior
 * alguém que está em sua cadeia de subordinação.
 */
export function getAllSubordinados(
  colaboradores: Colaborador[],
  colaboradorId: ID
): Colaborador[] {
  const result: Colaborador[] = []
  const directSubordinados = colaboradores.filter((c) => c.superiorId === colaboradorId)

  for (const sub of directSubordinados) {
    result.push(sub)
    result.push(...getAllSubordinados(colaboradores, sub.id))
  }

  return result
}

/**
 * Retorna colaboradores válidos como superior direto.
 *
 * Regras de validação:
 * 1. Não pode ser a si mesmo
 * 2. Deve estar no mesmo setor (setorId)
 * 3. Deve ter nível hierárquico igual ou superior (nivelId menor ou igual)
 * 4. Não pode criar ciclos na hierarquia
 *
 * @param colaboradores Lista de todos os colaboradores
 * @param colaboradorId ID do colaborador que receberá novo superior (0 para novo colaborador)
 * @param colaboradorSetorId ID do setor do colaborador
 * @param colaboradorNivelId ID do nível hierárquico do colaborador
 * @returns Lista de colaboradores válidos como superior
 */
export function getValidSuperiors(
  colaboradores: Colaborador[],
  colaboradorId: ID,
  colaboradorSetorId: ID,
  colaboradorNivelId: ID
): Colaborador[] {
  return colaboradores.filter((c) => {
    // 1. Não pode ser si mesmo
    if (c.id === colaboradorId) return false

    // 2. Deve estar no mesmo setor
    if (c.setorId !== colaboradorSetorId) return false

    // 3. Nível deve ser igual ou superior (nivelId menor = mais alto na hierarquia)
    // Ex: Diretor (1) pode supervisionar Gerente (2), mas não vice-versa
    if (c.nivelId > colaboradorNivelId) return false

    // 4. Não pode criar ciclos (não pode ser subordinado do colaborador)
    if (colaboradorId !== 0 && checkHierarchyCycle(colaboradores, colaboradorId, c.id)) return false

    return true
  })
}
