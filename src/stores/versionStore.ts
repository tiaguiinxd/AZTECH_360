/**
 * Store Zustand para Versionamento do Organograma
 *
 * Gerencia:
 * - Modo de edição (view vs draft)
 * - Rascunhos (drafts) com edições locais
 * - Undo/Redo para edições
 * - Sincronização com API de versões
 */

import { create } from 'zustand'
import type { Colaborador, ID } from '@/types'
import type {
  OrganoVersion,
  OrganoVersionSummary,
  EditMode,
  DraftSnapshot,
  ColaboradorSnapshot,
  VersionChange,
} from '@/types/version'
import {
  versionsApi,
  colaboradorToApi,
  type ColaboradorAPI,
} from '@/services/api'

// Máximo de itens no undo stack
const MAX_UNDO_STACK = 50

interface VersionState {
  // Modo de edição
  editMode: EditMode

  // Versão/Rascunho atual
  currentDraft: OrganoVersion | null
  draftColaboradores: Colaborador[]

  // Lista de versões
  versions: OrganoVersionSummary[]

  // Undo/Redo
  undoStack: DraftSnapshot[]
  redoStack: DraftSnapshot[]

  // Mudanças pendentes
  pendingChanges: VersionChange[]
  hasUnsavedChanges: boolean

  // Loading/Error
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Actions - Modo
  enterDraftMode: (nome?: string) => Promise<void>
  exitDraftMode: (discard?: boolean) => void
  loadDraft: (versionId: number) => Promise<void>

  // Actions - Edições no rascunho (não vão para API até salvar)
  updateDraftColaborador: (id: ID, updates: Partial<Colaborador>) => void
  moveDraftColaborador: (colaboradorId: ID, newSuperiorId: ID | undefined) => void

  // Actions - Persistência
  saveDraft: () => Promise<void>
  approveDraft: () => Promise<void>
  discardDraft: () => void

  // Actions - Undo/Redo
  undo: () => void
  redo: () => void
  pushUndoState: (description?: string) => void

  // Actions - Versões
  loadVersions: () => Promise<void>
  deleteVersion: (id: number) => Promise<void>

  // Helpers
  setDraftColaboradores: (colaboradores: Colaborador[]) => void
  calculateChanges: (official: Colaborador[], draft: Colaborador[]) => VersionChange[]
}

/**
 * Converte ColaboradorSnapshot (API) para Colaborador
 */
function snapshotToColaborador(s: ColaboradorSnapshot | ColaboradorAPI): Colaborador {
  // Verificar se é formato API (com campos snake_case)
  const snapshot = s as ColaboradorAPI
  return {
    id: snapshot.id,
    nome: snapshot.nome,
    cargo: snapshot.cargo,
    setorId: snapshot.setor_id,
    subsetorId: snapshot.subsetor_id ?? undefined,
    nivelId: snapshot.nivel_id,
    subnivelId: snapshot.subnivel_id ?? undefined,
    superiorId: snapshot.superior_id ?? undefined,
    permissoes: (snapshot.permissoes || []) as Colaborador['permissoes'],
    fotoUrl: snapshot.foto_url ?? undefined,
    email: snapshot.email ?? undefined,
    telefone: snapshot.telefone ?? undefined,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }
}

export const useVersionStore = create<VersionState>()((set, get) => ({
  // Initial state
  editMode: 'view',
  currentDraft: null,
  draftColaboradores: [],
  versions: [],
  undoStack: [],
  redoStack: [],
  pendingChanges: [],
  hasUnsavedChanges: false,
  isLoading: false,
  isSaving: false,
  error: null,

  // Entrar no modo rascunho
  enterDraftMode: async (nome?: string) => {
    set({ isLoading: true, error: null })
    try {
      // Criar novo rascunho via API
      const draftName = nome || `Rascunho ${new Date().toLocaleDateString('pt-BR')}`
      const apiVersion = await versionsApi.create({ nome: draftName })

      // Converter snapshot para colaboradores
      const colaboradores = apiVersion.snapshot.map(snapshotToColaborador)

      set({
        editMode: 'draft',
        currentDraft: {
          id: apiVersion.id,
          nome: apiVersion.nome,
          descricao: apiVersion.descricao,
          status: apiVersion.status as OrganoVersion['status'],
          snapshot: apiVersion.snapshot as unknown as ColaboradorSnapshot[],
          changesSummary: apiVersion.changes_summary ? {
            totalChanges: apiVersion.changes_summary.total_changes,
            hierarchyChanges: apiVersion.changes_summary.hierarchy_changes.map(c => ({
              colaboradorId: c.colaborador_id,
              colaboradorNome: c.colaborador_nome,
              changeType: c.change_type as VersionChange['changeType'],
              field: c.field ?? undefined,
              oldValue: c.old_value,
              newValue: c.new_value,
            })),
            dataChanges: apiVersion.changes_summary.data_changes.map(c => ({
              colaboradorId: c.colaborador_id,
              colaboradorNome: c.colaborador_nome,
              changeType: c.change_type as VersionChange['changeType'],
              field: c.field ?? undefined,
              oldValue: c.old_value,
              newValue: c.new_value,
            })),
          } : null,
          createdAt: apiVersion.created_at || new Date().toISOString(),
          updatedAt: apiVersion.updated_at || new Date().toISOString(),
          approvedAt: apiVersion.approved_at,
        },
        draftColaboradores: colaboradores,
        undoStack: [],
        redoStack: [],
        pendingChanges: [],
        hasUnsavedChanges: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao criar rascunho',
        isLoading: false,
      })
      throw error
    }
  },

  // Carregar um rascunho existente
  loadDraft: async (versionId: number) => {
    set({ isLoading: true, error: null })
    try {
      const apiVersion = await versionsApi.get(versionId)
      const colaboradores = apiVersion.snapshot.map(snapshotToColaborador)

      set({
        editMode: 'draft',
        currentDraft: {
          id: apiVersion.id,
          nome: apiVersion.nome,
          descricao: apiVersion.descricao,
          status: apiVersion.status as OrganoVersion['status'],
          snapshot: apiVersion.snapshot as unknown as ColaboradorSnapshot[],
          changesSummary: apiVersion.changes_summary ? {
            totalChanges: apiVersion.changes_summary.total_changes,
            hierarchyChanges: apiVersion.changes_summary.hierarchy_changes.map(c => ({
              colaboradorId: c.colaborador_id,
              colaboradorNome: c.colaborador_nome,
              changeType: c.change_type as VersionChange['changeType'],
              field: c.field ?? undefined,
              oldValue: c.old_value,
              newValue: c.new_value,
            })),
            dataChanges: apiVersion.changes_summary.data_changes.map(c => ({
              colaboradorId: c.colaborador_id,
              colaboradorNome: c.colaborador_nome,
              changeType: c.change_type as VersionChange['changeType'],
              field: c.field ?? undefined,
              oldValue: c.old_value,
              newValue: c.new_value,
            })),
          } : null,
          createdAt: apiVersion.created_at || new Date().toISOString(),
          updatedAt: apiVersion.updated_at || new Date().toISOString(),
          approvedAt: apiVersion.approved_at,
        },
        draftColaboradores: colaboradores,
        undoStack: [],
        redoStack: [],
        hasUnsavedChanges: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar rascunho',
        isLoading: false,
      })
      throw error
    }
  },

  // Sair do modo rascunho
  exitDraftMode: (discard = false) => {
    const { hasUnsavedChanges } = get()

    if (hasUnsavedChanges && !discard) {
      // Se há mudanças não salvas, não sair automaticamente
      return
    }

    set({
      editMode: 'view',
      currentDraft: null,
      draftColaboradores: [],
      undoStack: [],
      redoStack: [],
      pendingChanges: [],
      hasUnsavedChanges: false,
    })
  },

  // Atualizar colaborador no rascunho
  updateDraftColaborador: (id: ID, updates: Partial<Colaborador>) => {
    const state = get()
    if (state.editMode !== 'draft') return

    // Salvar estado atual para undo
    state.pushUndoState('Editar colaborador')

    set((s) => ({
      draftColaboradores: s.draftColaboradores.map((c) =>
        c.id === id ? { ...c, ...updates, atualizadoEm: new Date().toISOString() } : c
      ),
      hasUnsavedChanges: true,
      redoStack: [], // Limpar redo ao fazer nova edição
    }))
  },

  // Mover colaborador (mudar superior)
  moveDraftColaborador: (colaboradorId: ID, newSuperiorId: ID | undefined) => {
    const state = get()
    if (state.editMode !== 'draft') return

    // Salvar estado atual para undo
    state.pushUndoState('Mover colaborador')

    set((s) => ({
      draftColaboradores: s.draftColaboradores.map((c) =>
        c.id === colaboradorId
          ? { ...c, superiorId: newSuperiorId, atualizadoEm: new Date().toISOString() }
          : c
      ),
      hasUnsavedChanges: true,
      redoStack: [],
    }))
  },

  // Salvar rascunho na API (mas ainda como draft)
  saveDraft: async () => {
    const { currentDraft, draftColaboradores } = get()
    if (!currentDraft) return

    set({ isSaving: true, error: null })
    try {
      // Converter para formato API
      const snapshot = draftColaboradores.map((c) => {
        const apiFormat = colaboradorToApi(c)
        return {
          id: c.id,
          ...apiFormat,
        }
      })

      await versionsApi.update(currentDraft.id, { snapshot })

      set({ hasUnsavedChanges: false, isSaving: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao salvar rascunho',
        isSaving: false,
      })
      throw error
    }
  },

  // Aprovar rascunho (tornar oficial)
  approveDraft: async () => {
    const { currentDraft, saveDraft } = get()
    if (!currentDraft) return

    set({ isSaving: true, error: null })
    try {
      // Primeiro salvar mudanças pendentes
      await saveDraft()

      // Depois aprovar
      await versionsApi.approve(currentDraft.id)

      // Sair do modo draft
      set({
        editMode: 'view',
        currentDraft: null,
        draftColaboradores: [],
        undoStack: [],
        redoStack: [],
        pendingChanges: [],
        hasUnsavedChanges: false,
        isSaving: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao aprovar rascunho',
        isSaving: false,
      })
      throw error
    }
  },

  // Descartar rascunho
  discardDraft: () => {
    set({
      editMode: 'view',
      currentDraft: null,
      draftColaboradores: [],
      undoStack: [],
      redoStack: [],
      pendingChanges: [],
      hasUnsavedChanges: false,
    })
  },

  // Undo
  undo: () => {
    const { undoStack } = get()
    if (undoStack.length === 0) return

    const previousState = undoStack[undoStack.length - 1]

    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [
        ...s.redoStack,
        {
          colaboradores: s.draftColaboradores,
          timestamp: Date.now(),
        },
      ],
      draftColaboradores: previousState.colaboradores,
      hasUnsavedChanges: true,
    }))
  },

  // Redo
  redo: () => {
    const { redoStack } = get()
    if (redoStack.length === 0) return

    const nextState = redoStack[redoStack.length - 1]

    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [
        ...s.undoStack,
        {
          colaboradores: s.draftColaboradores,
          timestamp: Date.now(),
        },
      ],
      draftColaboradores: nextState.colaboradores,
      hasUnsavedChanges: true,
    }))
  },

  // Salvar estado para undo
  pushUndoState: (description?: string) => {
    set((s) => ({
      undoStack: [
        ...s.undoStack.slice(-MAX_UNDO_STACK + 1),
        {
          colaboradores: [...s.draftColaboradores],
          timestamp: Date.now(),
          description,
        },
      ],
    }))
  },

  // Carregar lista de versões
  loadVersions: async () => {
    set({ isLoading: true, error: null })
    try {
      const apiVersions = await versionsApi.list()
      const versions: OrganoVersionSummary[] = apiVersions.map((v) => ({
        id: v.id,
        nome: v.nome,
        descricao: v.descricao,
        status: v.status as OrganoVersion['status'],
        changesCount: v.changes_count,
        createdAt: v.created_at || new Date().toISOString(),
        updatedAt: v.updated_at || new Date().toISOString(),
      }))

      set({ versions, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar versões',
        isLoading: false,
      })
    }
  },

  // Deletar versão
  deleteVersion: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await versionsApi.delete(id)
      set((s) => ({
        versions: s.versions.filter((v) => v.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao deletar versão',
        isLoading: false,
      })
      throw error
    }
  },

  // Helper para setar colaboradores do rascunho
  setDraftColaboradores: (colaboradores: Colaborador[]) => {
    set({ draftColaboradores: colaboradores })
  },

  // Calcular mudanças entre oficial e rascunho
  calculateChanges: (official: Colaborador[], draft: Colaborador[]): VersionChange[] => {
    const changes: VersionChange[] = []
    const officialMap = new Map(official.map((c) => [c.id, c]))

    for (const draftColab of draft) {
      const officialColab = officialMap.get(draftColab.id)
      if (!officialColab) continue

      // Mudança de hierarquia
      if (draftColab.superiorId !== officialColab.superiorId) {
        changes.push({
          colaboradorId: draftColab.id,
          colaboradorNome: draftColab.nome,
          changeType: 'hierarchy',
          field: 'superiorId',
          oldValue: officialColab.superiorId,
          newValue: draftColab.superiorId,
        })
      }

      // Mudanças de dados
      for (const field of ['nome', 'cargo', 'setorId', 'nivelId'] as const) {
        if (draftColab[field] !== officialColab[field]) {
          changes.push({
            colaboradorId: draftColab.id,
            colaboradorNome: draftColab.nome,
            changeType: 'data',
            field,
            oldValue: officialColab[field],
            newValue: draftColab[field],
          })
        }
      }
    }

    return changes
  },
}))

// Selectors
export const selectEditMode = (state: VersionState) => state.editMode
export const selectCurrentDraft = (state: VersionState) => state.currentDraft
export const selectDraftColaboradores = (state: VersionState) => state.draftColaboradores
export const selectVersions = (state: VersionState) => state.versions
export const selectHasUnsavedChanges = (state: VersionState) => state.hasUnsavedChanges
export const selectCanUndo = (state: VersionState) => state.undoStack.length > 0
export const selectCanRedo = (state: VersionState) => state.redoStack.length > 0
export const selectIsLoading = (state: VersionState) => state.isLoading
export const selectIsSaving = (state: VersionState) => state.isSaving
export const selectError = (state: VersionState) => state.error
