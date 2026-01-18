/**
 * OrganoramaPage - Página principal do módulo Organograma
 * Integra todos os componentes: toolbar, tree, modal, versionamento
 *
 * FUNCIONALIDADES:
 * - Modo VIEW: Visualização do organograma oficial
 * - Modo DRAFT: Edição com edição inline nos cards
 * - Versionamento: Criar rascunhos, salvar, aprovar
 *
 * NOTA: Usar useShallow em TODOS os selectors que retornam objetos/arrays
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  OrgTreeV2,
  OrgToolbar,
  ColaboradorModal,
} from '@/components/organograma'
import { VersionToolbar } from '@/components/organograma/VersionToolbar'
import { ChangesPanel } from '@/components/organograma/ChangesPanel'
import { ApprovalDialog } from '@/components/organograma/ApprovalDialog'
import { useOrganoStore, useConfigStore } from '@/stores'
import { useVersionStore } from '@/stores/versionStore'
import { persistToSource } from '@/services/persistService'
import type { Colaborador, ID } from '@/types'

type ModalMode = 'view' | 'edit' | 'create' | null

export function OrganoramaPage() {
  // ========== STORES ==========

  // Organo Store (dados oficiais)
  const {
    colaboradores: officialColaboradores,
    selectedId,
    expandedIds,
    filters,
  } = useOrganoStore(
    useShallow((state) => ({
      colaboradores: state.colaboradores,
      selectedId: state.selectedId,
      expandedIds: state.expandedIds,
      filters: state.filters,
    }))
  )

  const {
    setSelectedId,
    toggleExpanded,
    expandAll,
    collapseAll,
    setFilters,
    clearFilters,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    loadColaboradores,
  } = useOrganoStore(
    useShallow((state) => ({
      setSelectedId: state.setSelectedId,
      toggleExpanded: state.toggleExpanded,
      expandAll: state.expandAll,
      collapseAll: state.collapseAll,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      addColaborador: state.addColaborador,
      updateColaborador: state.updateColaborador,
      deleteColaborador: state.deleteColaborador,
      loadColaboradores: state.loadColaboradores,
    }))
  )

  // Version Store (rascunhos)
  const {
    editMode,
    currentDraft,
    draftColaboradores,
    hasUnsavedChanges,
    undoStack,
    redoStack,
    isSaving: isVersionSaving,
  } = useVersionStore(
    useShallow((state) => ({
      editMode: state.editMode,
      currentDraft: state.currentDraft,
      draftColaboradores: state.draftColaboradores,
      hasUnsavedChanges: state.hasUnsavedChanges,
      undoStack: state.undoStack,
      redoStack: state.redoStack,
      isSaving: state.isSaving,
    }))
  )

  const {
    enterDraftMode,
    saveDraft,
    approveDraft,
    discardDraft,
    updateDraftColaborador,
    undo,
    redo,
    calculateChanges,
  } = useVersionStore(
    useShallow((state) => ({
      enterDraftMode: state.enterDraftMode,
      saveDraft: state.saveDraft,
      approveDraft: state.approveDraft,
      discardDraft: state.discardDraft,
      updateDraftColaborador: state.updateDraftColaborador,
      undo: state.undo,
      redo: state.redo,
      calculateChanges: state.calculateChanges,
    }))
  )

  // Config store data
  const { setores, subsetores, niveis } = useConfigStore(
    useShallow((state) => ({
      setores: state.setores,
      subsetores: state.subsetores,
      niveis: state.niveis,
    }))
  )

  // ========== LOCAL STATE ==========

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showChangesPanel, setShowChangesPanel] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)

  // ========== COMPUTED VALUES ==========

  // Colaboradores ativos (oficial ou rascunho)
  const activeColaboradores = editMode === 'draft' ? draftColaboradores : officialColaboradores

  // Filtrar colaboradores
  const colaboradores = useMemo(() => {
    return activeColaboradores.filter((c) => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesName = c.nome.toLowerCase().includes(search)
        const matchesCargo = c.cargo.toLowerCase().includes(search)
        if (!matchesName && !matchesCargo) return false
      }
      if (filters.setorId !== null && c.setorId !== filters.setorId) return false
      if (filters.nivelId !== null && c.nivelId !== filters.nivelId) return false
      return true
    })
  }, [activeColaboradores, filters])

  // Mudanças pendentes
  const pendingChanges = useMemo(() => {
    if (editMode !== 'draft') return []
    return calculateChanges(officialColaboradores, draftColaboradores)
  }, [editMode, officialColaboradores, draftColaboradores, calculateChanges])

  // ========== HANDLERS ==========

  const handleSelect = useCallback(
    (id: ID) => {
      setSelectedId(id)
      const colaborador = activeColaboradores.find((c) => c.id === id)
      if (colaborador) {
        setEditingColaborador(colaborador)
        setModalMode('view')
      }
    },
    [activeColaboradores, setSelectedId]
  )

  const handleEdit = useCallback(
    (id: ID) => {
      const colaborador = activeColaboradores.find((c) => c.id === id)
      if (colaborador) {
        setEditingColaborador(colaborador)
        setModalMode('edit')
      }
    },
    [activeColaboradores]
  )

  const handleAddColaborador = useCallback(() => {
    setEditingColaborador(null)
    setModalMode('create')
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalMode(null)
    setEditingColaborador(null)
  }, [])

  const handleSave = useCallback(
    async (data: Partial<Colaborador>) => {
      try {
        if (modalMode === 'create') {
          await addColaborador({
            nome: data.nome ?? '',
            cargo: data.cargo ?? '',
            setorId: data.setorId ?? 1,
            nivelId: data.nivelId ?? 5,
            superiorId: data.superiorId,
            permissoes: data.permissoes ?? [],
          })
        } else if (modalMode === 'edit' && editingColaborador) {
          if (editMode === 'draft') {
            updateDraftColaborador(editingColaborador.id, data)
          } else {
            await updateColaborador(editingColaborador.id, data)
          }
        }
        handleCloseModal()
      } catch (error) {
        console.error('Erro ao salvar colaborador:', error)
        // O erro já é tratado pelo store, apenas logamos aqui
      }
    },
    [modalMode, editingColaborador, editMode, addColaborador, updateColaborador, updateDraftColaborador, handleCloseModal]
  )

  const handleDelete = useCallback(
    async (id: ID) => {
      try {
        await deleteColaborador(id)
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error)
      }
    },
    [deleteColaborador]
  )

  const handleRefresh = useCallback(async () => {
    await loadColaboradores()
  }, [loadColaboradores])

  // Edição inline no modo draft
  const handleInlineEdit = useCallback(
    (id: ID, updates: { nome?: string; cargo?: string }) => {
      if (editMode === 'draft') {
        updateDraftColaborador(id, updates)
      }
    },
    [editMode, updateDraftColaborador]
  )

  // Versionamento handlers
  const handleCreateDraft = useCallback(async () => {
    await enterDraftMode()
    setShowChangesPanel(true)
  }, [enterDraftMode])

  const handleSaveDraft = useCallback(async () => {
    await saveDraft()
  }, [saveDraft])

  const handleApproveDraft = useCallback(() => {
    setShowApprovalDialog(true)
  }, [])

  const handleConfirmApproval = useCallback(async () => {
    await approveDraft()
    setShowApprovalDialog(false)
    setShowChangesPanel(false)
    // Recarregar dados oficiais
    await loadColaboradores()
  }, [approveDraft, loadColaboradores])

  const handleDiscardDraft = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('Você tem mudanças não salvas. Deseja realmente descartar?')
      if (!confirmed) return
    }
    discardDraft()
    setShowChangesPanel(false)
  }, [hasUnsavedChanges, discardDraft])

  // Salvar no código-fonte
  const handleSaveToCode = useCallback(async () => {
    setIsSaving(true)
    try {
      const result = await persistToSource({
        colaboradores: officialColaboradores,
        setores,
        subsetores,
        niveis,
      })

      if (result.success) {
        alert(`Dados salvos com sucesso!\n\n${result.message}`)
      } else {
        alert(`Erro ao salvar:\n${result.error}`)
      }
    } catch (error) {
      alert(`Erro inesperado: ${error}`)
    } finally {
      setIsSaving(false)
    }
  }, [officialColaboradores, setores, subsetores, niveis])

  // Keyboard shortcuts para undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editMode !== 'draft') return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveDraft()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, undo, redo, saveDraft])

  // ========== RENDER ==========

  return (
    <div className="flex flex-col h-full">
      {/* Version Toolbar */}
      <VersionToolbar
        editMode={editMode}
        currentDraft={currentDraft}
        hasUnsavedChanges={hasUnsavedChanges}
        changesCount={pendingChanges.length}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        isSaving={isVersionSaving}
        onCreateDraft={handleCreateDraft}
        onSaveDraft={handleSaveDraft}
        onApproveDraft={handleApproveDraft}
        onDiscardDraft={handleDiscardDraft}
        onUndo={undo}
        onRedo={redo}
        onShowHistory={() => setShowChangesPanel(!showChangesPanel)}
      />

      {/* Original Toolbar */}
      <OrgToolbar
        searchValue={filters.search}
        setorFilter={filters.setorId}
        nivelFilter={filters.nivelId}
        onSearchChange={(value) => setFilters({ search: value })}
        onSetorChange={(id) => setFilters({ setorId: id })}
        onNivelChange={(id) => setFilters({ nivelId: id })}
        onClearFilters={clearFilters}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onAddColaborador={editMode === 'view' ? handleAddColaborador : undefined}
        onResetData={editMode === 'view' ? handleRefresh : undefined}
        onSaveToCode={editMode === 'view' ? handleSaveToCode : undefined}
        isSaving={isSaving}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Tree View */}
        <div className="flex-1 overflow-hidden">
          <OrgTreeV2
            colaboradores={colaboradores}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={handleSelect}
            onToggleExpand={toggleExpanded}
            onEdit={handleEdit}
            onDelete={editMode === 'view' ? handleDelete : undefined}
            isEditable={editMode === 'draft'}
            onInlineEdit={handleInlineEdit}
          />
        </div>

        {/* Changes Panel */}
        {editMode === 'draft' && (
          <ChangesPanel
            changes={pendingChanges}
            isOpen={showChangesPanel}
            onClose={() => setShowChangesPanel(false)}
            onHighlightChange={(id) => setSelectedId(id)}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-white border-t text-sm text-gray-500 flex items-center justify-between">
        <span>
          {colaboradores.length} colaborador{colaboradores.length !== 1 ? 'es' : ''} exibido{colaboradores.length !== 1 ? 's' : ''}
          {activeColaboradores.length !== colaboradores.length && (
            <span className="text-gray-400"> de {activeColaboradores.length} total</span>
          )}
        </span>
        <span>
          {selectedId !== null && (
            <>
              Selecionado: <strong>{activeColaboradores.find((c) => c.id === selectedId)?.nome}</strong>
            </>
          )}
        </span>
      </div>

      {/* Modal */}
      <ColaboradorModal
        colaborador={editingColaborador}
        allColaboradores={activeColaboradores}
        isOpen={modalMode !== null}
        mode={modalMode ?? 'view'}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={editMode === 'view' ? handleDelete : undefined}
      />

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={showApprovalDialog}
        version={currentDraft}
        changes={pendingChanges}
        isApproving={isVersionSaving}
        onConfirm={handleConfirmApproval}
        onCancel={() => setShowApprovalDialog(false)}
      />
    </div>
  )
}
