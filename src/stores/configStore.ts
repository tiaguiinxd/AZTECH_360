/**
 * Store Zustand para gerenciamento das Configurações
 *
 * ARQUITETURA:
 * - PostgreSQL é a única fonte de verdade para DADOS (setores, níveis, cargos)
 * - localStorage armazena apenas ESTADO UI e configurações locais
 * - Todas as operações CRUD chamam a API primeiro, depois atualizam o estado local
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NivelHierarquico, Subnivel, Setor, Subsetor, Cargo, ID } from '@/types'
import {
  setoresApi,
  niveisApi,
  cargosApi,
  tiposProjetoApi,
  apiToSetor,
  apiToSubsetor,
  apiToNivel,
  apiToCargo,
  apiToTipoProjeto,
} from '@/services/api'

// Types (TipoProjeto agora vem de @/types)
import type { TipoProjeto } from '@/types'

interface ConfigState {
  // Data (carregado da API)
  niveis: NivelHierarquico[]
  setores: Setor[]
  subsetores: Subsetor[]
  cargos: Cargo[]
  tiposProjeto: TipoProjeto[]
  isLoading: boolean
  error: string | null

  // Hydration state
  _hasHydrated: boolean

  // Actions - Data Loading
  loadSetores: () => Promise<void>
  loadNiveis: () => Promise<void>
  loadCargos: () => Promise<void>
  loadTiposProjeto: () => Promise<void>
  loadAll: () => Promise<void>

  // Actions - Níveis
  updateNivel: (id: ID, updates: Partial<Omit<NivelHierarquico, 'id'>>) => void
  addSubnivel: (nivelId: ID, subnivel: Omit<Subnivel, 'id' | 'ordem'>) => void
  updateSubnivel: (nivelId: ID, subnivelId: ID, updates: Partial<Omit<Subnivel, 'id'>>) => void
  removeSubnivel: (nivelId: ID, subnivelId: ID) => void
  reorderSubniveis: (nivelId: ID, orderedIds: ID[]) => void
  reorderNiveis: (orderedIds: ID[]) => Promise<void>
  toggleNivelAtivo: (id: ID) => Promise<void>

  // Actions - Setores
  addSetor: (setor: Omit<Setor, 'id'>) => Setor
  updateSetor: (id: ID, updates: Partial<Omit<Setor, 'id'>>) => void
  deleteSetor: (id: ID) => void
  addSubsetor: (subsetor: Omit<Subsetor, 'id'>) => Subsetor
  updateSubsetor: (id: ID, updates: Partial<Omit<Subsetor, 'id'>>) => void
  deleteSubsetor: (id: ID) => void

  // Actions - Cargos
  addCargo: (cargo: Omit<Cargo, 'id'>) => Cargo
  updateCargo: (id: ID, updates: Partial<Omit<Cargo, 'id'>>) => void
  deleteCargo: (id: ID) => void

  // Actions - Tipos de Projeto
  addTipoProjeto: (tipo: Omit<TipoProjeto, 'id'>) => TipoProjeto
  updateTipoProjeto: (id: ID, updates: Partial<Omit<TipoProjeto, 'id'>>) => void
  deleteTipoProjeto: (id: ID) => void

  // Actions - Data Management
  setHasHydrated: (state: boolean) => void

  // Actions - API Sync
  setSetores: (setores: Setor[]) => void
  setNiveis: (niveis: NivelHierarquico[]) => void
}

// Helpers
function generateId<T extends { id: ID }>(items: T[]): ID {
  const maxId = items.reduce((max, item) => Math.max(max, item.id), 0)
  return maxId + 1
}

// NOTE: Dados iniciais removidos - Todos os dados vêm da API (PostgreSQL)
// Ver ADR-004 em docs/PLANO_REVISAO.md

// Store
export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial data (vazio, será carregado da API)
      niveis: [],
      setores: [],
      subsetores: [],
      cargos: [],
      tiposProjeto: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      // Data Loading
      loadSetores: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiSetores = await setoresApi.list()
          const setores = apiSetores.map(apiToSetor)
          const subsetores = apiSetores.flatMap((s) =>
            s.subsetores.map(apiToSubsetor)
          )
          set({ setores, subsetores, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar setores',
            isLoading: false,
          })
        }
      },

      loadNiveis: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiNiveis = await niveisApi.list()
          const niveis = apiNiveis.map(apiToNivel)
          set({ niveis, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar níveis',
            isLoading: false,
          })
        }
      },

      loadCargos: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiCargos = await cargosApi.list()
          const cargos = apiCargos.map(apiToCargo)
          set({ cargos, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar cargos',
            isLoading: false,
          })
        }
      },

      loadTiposProjeto: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiTipos = await tiposProjetoApi.list()
          const tiposProjeto = apiTipos.map(apiToTipoProjeto)
          set({ tiposProjeto, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar tipos de projeto',
            isLoading: false,
          })
        }
      },

      loadAll: async () => {
        set({ isLoading: true, error: null })
        try {
          const [apiSetores, apiNiveis, apiCargos, apiTipos] = await Promise.all([
            setoresApi.list(),
            niveisApi.list(),
            cargosApi.list(),
            tiposProjetoApi.list(),
          ])

          const setores = apiSetores.map(apiToSetor)
          const subsetores = apiSetores.flatMap((s) =>
            s.subsetores.map(apiToSubsetor)
          )
          const niveis = apiNiveis.map(apiToNivel)
          const cargos = apiCargos.map(apiToCargo)
          const tiposProjeto = apiTipos.map(apiToTipoProjeto)

          set({ setores, subsetores, niveis, cargos, tiposProjeto, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao carregar configurações',
            isLoading: false,
          })
        }
      },

      // Níveis Actions (local por enquanto, pode ser expandido para API)
      updateNivel: (id, updates) => {
        set((state) => ({
          niveis: state.niveis.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        }))
      },

      addSubnivel: (nivelId, data) => {
        set((state) => ({
          niveis: state.niveis.map((n) => {
            if (n.id !== nivelId) return n

            const subniveis = n.subniveis ?? []
            const newId = subniveis.length > 0
              ? Math.max(...subniveis.map((s) => s.id)) + 1
              : 1
            const newOrdem = subniveis.length > 0
              ? Math.max(...subniveis.map((s) => s.ordem)) + 1
              : 1

            return {
              ...n,
              subniveis: [
                ...subniveis,
                { ...data, id: newId, ordem: newOrdem },
              ],
            }
          }),
        }))
      },

      updateSubnivel: (nivelId, subnivelId, updates) => {
        set((state) => ({
          niveis: state.niveis.map((n) => {
            if (n.id !== nivelId) return n
            return {
              ...n,
              subniveis: n.subniveis?.map((s) =>
                s.id === subnivelId ? { ...s, ...updates } : s
              ),
            }
          }),
        }))
      },

      removeSubnivel: (nivelId, subnivelId) => {
        set((state) => ({
          niveis: state.niveis.map((n) => {
            if (n.id !== nivelId) return n
            return {
              ...n,
              subniveis: n.subniveis?.filter((s) => s.id !== subnivelId),
            }
          }),
        }))
      },

      reorderSubniveis: (nivelId, orderedIds) => {
        set((state) => ({
          niveis: state.niveis.map((n) => {
            if (n.id !== nivelId || !n.subniveis) return n
            const reordered = orderedIds
              .map((id, index) => {
                const subnivel = n.subniveis?.find((s) => s.id === id)
                return subnivel ? { ...subnivel, ordem: index + 1 } : null
              })
              .filter((s): s is Subnivel => s !== null)
            return { ...n, subniveis: reordered }
          }),
        }))
      },

      reorderNiveis: async (orderedIds) => {
        set({ isLoading: true, error: null })
        try {
          await niveisApi.reorder(orderedIds)
          // Atualizar ordem local após sucesso
          set((state) => ({
            niveis: orderedIds
              .map((id, index) => {
                const nivel = state.niveis.find((n) => n.id === id)
                return nivel ? { ...nivel, ordem: index + 1 } : null
              })
              .filter((n): n is NivelHierarquico => n !== null),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao reordenar níveis',
            isLoading: false,
          })
        }
      },

      toggleNivelAtivo: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const updatedNivel = await niveisApi.toggleAtivo(id)
          const nivel = apiToNivel(updatedNivel)
          set((state) => ({
            niveis: state.niveis.map((n) => (n.id === id ? nivel : n)),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Erro ao alterar status do nível',
            isLoading: false,
          })
        }
      },

      // Setores Actions (local por enquanto, pode ser expandido para API)
      addSetor: (data) => {
        const newSetor: Setor = {
          ...data,
          id: generateId(get().setores),
        }
        set((state) => ({
          setores: [...state.setores, newSetor],
        }))
        return newSetor
      },

      updateSetor: (id, updates) => {
        set((state) => ({
          setores: state.setores.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
      },

      deleteSetor: (id) => {
        set((state) => ({
          setores: state.setores.filter((s) => s.id !== id),
          subsetores: state.subsetores.filter((s) => s.setorId !== id),
        }))
      },

      addSubsetor: (data) => {
        const newSubsetor: Subsetor = {
          ...data,
          id: generateId(get().subsetores),
        }
        set((state) => ({
          subsetores: [...state.subsetores, newSubsetor],
        }))
        return newSubsetor
      },

      updateSubsetor: (id, updates) => {
        set((state) => ({
          subsetores: state.subsetores.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
      },

      deleteSubsetor: (id) => {
        set((state) => ({
          subsetores: state.subsetores.filter((s) => s.id !== id),
        }))
      },

      // Cargos Actions
      addCargo: (data) => {
        const newCargo: Cargo = {
          ...data,
          id: generateId(get().cargos),
        }
        set((state) => ({
          cargos: [...state.cargos, newCargo],
        }))
        return newCargo
      },

      updateCargo: (id, updates) => {
        set((state) => ({
          cargos: state.cargos.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }))
      },

      deleteCargo: (id) => {
        set((state) => ({
          cargos: state.cargos.filter((c) => c.id !== id),
        }))
      },

      // Tipos de Projeto Actions
      addTipoProjeto: (data) => {
        const newTipo: TipoProjeto = {
          ...data,
          id: generateId(get().tiposProjeto),
        }
        set((state) => ({
          tiposProjeto: [...state.tiposProjeto, newTipo],
        }))
        return newTipo
      },

      updateTipoProjeto: (id, updates) => {
        set((state) => ({
          tiposProjeto: state.tiposProjeto.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTipoProjeto: (id) => {
        set((state) => ({
          tiposProjeto: state.tiposProjeto.filter((t) => t.id !== id),
        }))
      },

      // Data Management
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      // API Sync
      setSetores: (setores) => {
        set({ setores })
      },

      setNiveis: (niveis) => {
        set({ niveis })
      },
    }),
    {
      name: 'aztech-config-ui-storage',
      // ADR-004: Todos os dados vêm da API (PostgreSQL é a fonte de verdade)
      // localStorage apenas armazena estado de UI, não dados de negócio
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Selectors
export const selectNiveis = (state: ConfigState) => state.niveis
export const selectSetores = (state: ConfigState) => state.setores
export const selectSubsetores = (state: ConfigState) => state.subsetores
export const selectCargos = (state: ConfigState) => state.cargos
export const selectTiposProjeto = (state: ConfigState) => state.tiposProjeto
export const selectIsLoading = (state: ConfigState) => state.isLoading
export const selectError = (state: ConfigState) => state.error

export const selectSetorById = (id: ID) => (state: ConfigState) =>
  state.setores.find((s) => s.id === id)

export const selectNivelById = (id: ID) => (state: ConfigState) =>
  state.niveis.find((n) => n.id === id)

export const selectSubsetoresBySetorId = (setorId: ID) => (state: ConfigState) =>
  state.subsetores.filter((s) => s.setorId === setorId)

export const selectCargosByNivelId = (nivelId: ID) => (state: ConfigState) =>
  state.cargos.filter((c) => c.nivelId === nivelId)
