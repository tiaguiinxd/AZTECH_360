/**
 * SetoresConfig - Configuração de Setores e Subsetores
 *
 * Funcionalidades:
 * - Listar todos os setores
 * - CRUD completo de setores
 * - Gerenciar subsetores por setor
 * - Configurar cores e diretor responsável
 */

import { useState, memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Building2,
} from 'lucide-react'
import { useConfigStore } from '@/stores/configStore'
import { useOrganoStore } from '@/stores/organoStore'
import type { Setor, Subsetor, ID } from '@/types'

interface EditingSetor {
  id: ID | null // null = creating new
  codigo: string
  nome: string
  nomeCompleto: string
  cor: string
  corTexto: string
  diretorId: ID | undefined
  ordem: number
}

interface EditingSubsetor {
  id: ID | null // null = creating new
  setorId: ID
  nome: string
  cor: string
  corTexto: string
}

export const SetoresConfig = memo(function SetoresConfig() {
  const { setores, subsetores, addSetor, updateSetor, deleteSetor, addSubsetor, updateSubsetor, deleteSubsetor } =
    useConfigStore(
      useShallow((state) => ({
        setores: state.setores,
        subsetores: state.subsetores,
        addSetor: state.addSetor,
        updateSetor: state.updateSetor,
        deleteSetor: state.deleteSetor,
        addSubsetor: state.addSubsetor,
        updateSubsetor: state.updateSubsetor,
        deleteSubsetor: state.deleteSubsetor,
      }))
    )

  const colaboradores = useOrganoStore((state) => state.colaboradores)

  // Diretores potenciais (níveis 1-2)
  const diretores = colaboradores.filter((c) => c.nivelId <= 2)

  const [expandedSetores, setExpandedSetores] = useState<Set<ID>>(new Set())
  const [editingSetor, setEditingSetor] = useState<EditingSetor | null>(null)
  const [editingSubsetor, setEditingSubsetor] = useState<EditingSubsetor | null>(null)

  // Toggle expanded
  const toggleExpanded = useCallback((id: ID) => {
    setExpandedSetores((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Get subsetores for a setor
  const getSubsetoresForSetor = useCallback(
    (setorId: ID) => subsetores.filter((s) => s.setorId === setorId),
    [subsetores]
  )

  // Start creating new setor
  const startCreateSetor = useCallback(() => {
    const maxOrdem = setores.reduce((max, s) => Math.max(max, s.ordem), 0)
    setEditingSetor({
      id: null,
      codigo: '',
      nome: '',
      nomeCompleto: '',
      cor: '#E5E7EB',
      corTexto: '#1e293b',
      diretorId: undefined,
      ordem: maxOrdem + 1,
    })
  }, [setores])

  // Start editing setor
  const startEditSetor = useCallback((setor: Setor) => {
    setEditingSetor({
      id: setor.id,
      codigo: setor.codigo,
      nome: setor.nome,
      nomeCompleto: setor.nomeCompleto ?? '',
      cor: setor.cor,
      corTexto: setor.corTexto,
      diretorId: setor.diretorId,
      ordem: setor.ordem,
    })
  }, [])

  // Save setor
  const saveSetor = useCallback(() => {
    if (!editingSetor) return

    if (editingSetor.id === null) {
      // Creating new
      addSetor({
        codigo: editingSetor.codigo,
        nome: editingSetor.nome,
        nomeCompleto: editingSetor.nomeCompleto,
        cor: editingSetor.cor,
        corTexto: editingSetor.corTexto,
        diretorId: editingSetor.diretorId,
        ordem: editingSetor.ordem,
      })
    } else {
      // Updating existing
      updateSetor(editingSetor.id, {
        codigo: editingSetor.codigo,
        nome: editingSetor.nome,
        nomeCompleto: editingSetor.nomeCompleto,
        cor: editingSetor.cor,
        corTexto: editingSetor.corTexto,
        diretorId: editingSetor.diretorId,
        ordem: editingSetor.ordem,
      })
    }
    setEditingSetor(null)
  }, [editingSetor, addSetor, updateSetor])

  // Delete setor
  const handleDeleteSetor = useCallback(
    (id: ID) => {
      const setorSubsetores = getSubsetoresForSetor(id)
      const message =
        setorSubsetores.length > 0
          ? `Este setor possui ${setorSubsetores.length} subsetor(es). Tem certeza que deseja excluí-lo? Os subsetores também serão removidos.`
          : 'Tem certeza que deseja excluir este setor?'

      if (window.confirm(message)) {
        deleteSetor(id)
      }
    },
    [deleteSetor, getSubsetoresForSetor]
  )

  // Start creating new subsetor
  const startCreateSubsetor = useCallback((setorId: ID) => {
    const setor = setores.find((s) => s.id === setorId)
    setEditingSubsetor({
      id: null,
      setorId,
      nome: '',
      cor: setor?.cor ?? '#E5E7EB',
      corTexto: setor?.corTexto ?? '#1e293b',
    })
  }, [setores])

  // Start editing subsetor
  const startEditSubsetor = useCallback((subsetor: Subsetor) => {
    setEditingSubsetor({
      id: subsetor.id,
      setorId: subsetor.setorId,
      nome: subsetor.nome,
      cor: subsetor.cor ?? '#E5E7EB',
      corTexto: subsetor.corTexto ?? '#1e293b',
    })
  }, [])

  // Save subsetor
  const saveSubsetor = useCallback(() => {
    if (!editingSubsetor) return

    if (editingSubsetor.id === null) {
      // Creating new
      addSubsetor({
        setorId: editingSubsetor.setorId,
        nome: editingSubsetor.nome,
        cor: editingSubsetor.cor,
        corTexto: editingSubsetor.corTexto,
      })
    } else {
      // Updating existing
      updateSubsetor(editingSubsetor.id, {
        nome: editingSubsetor.nome,
        cor: editingSubsetor.cor,
        corTexto: editingSubsetor.corTexto,
      })
    }
    setEditingSubsetor(null)
  }, [editingSubsetor, addSubsetor, updateSubsetor])

  // Delete subsetor
  const handleDeleteSubsetor = useCallback(
    (id: ID) => {
      if (window.confirm('Tem certeza que deseja excluir este subsetor?')) {
        deleteSubsetor(id)
      }
    },
    [deleteSubsetor]
  )

  // Get director name
  const getDiretorNome = useCallback(
    (diretorId: ID | undefined) => {
      if (!diretorId) return 'Não definido'
      const diretor = colaboradores.find((c) => c.id === diretorId)
      return diretor ? diretor.nome : 'Não encontrado'
    },
    [colaboradores]
  )

  return (
    <div className="p-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex-1 mr-4">
          <p className="text-sm text-blue-800">
            <strong>Setores</strong> são os departamentos da empresa.
            <br />
            <strong>Subsetores</strong> são divisões dentro de um setor (ex: Engenharia Civil, Engenharia Mecânica).
          </p>
        </div>
        <button
          onClick={startCreateSetor}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Novo Setor
        </button>
      </div>

      {/* New setor form */}
      {editingSetor?.id === null && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-aztech-primary">
          <h3 className="font-semibold text-gray-900 mb-3">Novo Setor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              value={editingSetor.codigo}
              onChange={(e) => setEditingSetor({ ...editingSetor, codigo: e.target.value })}
              className="px-3 py-2 text-sm border rounded-lg"
              placeholder="Código (ex: 1, X)"
            />
            <input
              type="text"
              value={editingSetor.nome}
              onChange={(e) => setEditingSetor({ ...editingSetor, nome: e.target.value })}
              className="px-3 py-2 text-sm border rounded-lg"
              placeholder="Nome curto"
            />
            <input
              type="text"
              value={editingSetor.nomeCompleto}
              onChange={(e) => setEditingSetor({ ...editingSetor, nomeCompleto: e.target.value })}
              className="px-3 py-2 text-sm border rounded-lg col-span-2"
              placeholder="Nome completo"
            />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Cor:</label>
              <input
                type="color"
                value={editingSetor.cor}
                onChange={(e) => setEditingSetor({ ...editingSetor, cor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Texto:</label>
              <input
                type="color"
                value={editingSetor.corTexto}
                onChange={(e) => setEditingSetor({ ...editingSetor, corTexto: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <select
                value={editingSetor.diretorId ?? ''}
                onChange={(e) =>
                  setEditingSetor({
                    ...editingSetor,
                    diretorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">Sem diretor responsável</option>
                {diretores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome} - {d.cargo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingSetor(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={saveSetor}
              disabled={!editingSetor.nome}
              className={cn(
                'px-4 py-2 text-sm rounded-lg',
                editingSetor.nome
                  ? 'bg-aztech-primary text-white hover:bg-aztech-primary-hover'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Criar Setor
            </button>
          </div>
        </div>
      )}

      {/* Setores list */}
      <div className="space-y-3">
        {setores.map((setor) => {
          const isExpanded = expandedSetores.has(setor.id)
          const isEditing = editingSetor?.id === setor.id
          const setorSubsetores = getSubsetoresForSetor(setor.id)
          const hasSubsetores = setorSubsetores.length > 0

          return (
            <div key={setor.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Setor header */}
              <div
                className="flex items-center gap-3 p-4"
                style={{ backgroundColor: setor.cor + '40' }}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpanded(setor.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title={isExpanded ? 'Recolher' : 'Expandir'}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {/* Drag handle */}
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

                {/* Color badge */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: setor.cor, color: setor.corTexto }}
                >
                  <Building2 className="h-5 w-5" />
                </div>

                {/* Content */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={editingSetor.codigo}
                      onChange={(e) => setEditingSetor({ ...editingSetor, codigo: e.target.value })}
                      className="px-2 py-1 text-sm border rounded w-full"
                      placeholder="Código"
                    />
                    <input
                      type="text"
                      value={editingSetor.nome}
                      onChange={(e) => setEditingSetor({ ...editingSetor, nome: e.target.value })}
                      className="px-2 py-1 text-sm border rounded w-full"
                      placeholder="Nome"
                    />
                    <input
                      type="text"
                      value={editingSetor.nomeCompleto}
                      onChange={(e) =>
                        setEditingSetor({ ...editingSetor, nomeCompleto: e.target.value })
                      }
                      className="px-2 py-1 text-sm border rounded w-full col-span-2"
                      placeholder="Nome completo"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-700 text-white rounded text-xs font-mono">
                        {setor.codigo}
                      </span>
                      <h3 className="font-semibold text-gray-900">{setor.nome}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {setor.nomeCompleto} • Responsável: {getDiretorNome(setor.diretorId)}
                    </p>
                  </div>
                )}

                {/* Subsetores count */}
                {hasSubsetores && !isExpanded && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    {setorSubsetores.length} subsetor(es)
                  </span>
                )}

                {/* Color pickers when editing */}
                {isEditing && (
                  <>
                    <input
                      type="color"
                      value={editingSetor.cor}
                      onChange={(e) => setEditingSetor({ ...editingSetor, cor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                      title="Cor de fundo"
                    />
                    <input
                      type="color"
                      value={editingSetor.corTexto}
                      onChange={(e) => setEditingSetor({ ...editingSetor, corTexto: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                      title="Cor do texto"
                    />
                  </>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveSetor}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Salvar"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSetor(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditSetor(setor)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Editar setor"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSetor(setor.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Excluir setor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Subsetores section */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Subsetores</h4>
                    <button
                      onClick={() => startCreateSubsetor(setor.id)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded',
                        'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
                      )}
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar Subsetor
                    </button>
                  </div>

                  {/* Subsetores list */}
                  {hasSubsetores ? (
                    <div className="space-y-2">
                      {setorSubsetores.map((subsetor) => {
                        const isEditingThis = editingSubsetor?.id === subsetor.id

                        return (
                          <div
                            key={subsetor.id}
                            className="flex items-center gap-3 p-3 bg-white rounded border"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />

                            <div
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: subsetor.cor }}
                            />

                            {isEditingThis ? (
                              <>
                                <input
                                  type="text"
                                  value={editingSubsetor.nome}
                                  onChange={(e) =>
                                    setEditingSubsetor({ ...editingSubsetor, nome: e.target.value })
                                  }
                                  className="px-2 py-1 text-sm border rounded flex-1"
                                  placeholder="Nome do subsetor"
                                />
                                <input
                                  type="color"
                                  value={editingSubsetor.cor}
                                  onChange={(e) =>
                                    setEditingSubsetor({ ...editingSubsetor, cor: e.target.value })
                                  }
                                  className="w-8 h-8 rounded cursor-pointer"
                                />
                                <button
                                  onClick={saveSubsetor}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Salvar"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSubsetor(null)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-gray-900 flex-1">
                                  {subsetor.nome}
                                </span>
                                <button
                                  onClick={() => startEditSubsetor(subsetor)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubsetor(subsetor.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic py-2">
                      Este setor não possui subsetores.
                    </p>
                  )}

                  {/* New subsetor form */}
                  {editingSubsetor?.setorId === setor.id && editingSubsetor.id === null && (
                    <div className="flex items-center gap-3 p-3 mt-2 bg-white rounded border border-dashed border-aztech-primary">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: editingSubsetor.cor }}
                      />
                      <input
                        type="text"
                        value={editingSubsetor.nome}
                        onChange={(e) =>
                          setEditingSubsetor({ ...editingSubsetor, nome: e.target.value })
                        }
                        className="px-2 py-1 text-sm border rounded flex-1"
                        placeholder="Nome do subsetor"
                        autoFocus
                      />
                      <input
                        type="color"
                        value={editingSubsetor.cor}
                        onChange={(e) =>
                          setEditingSubsetor({ ...editingSubsetor, cor: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button
                        onClick={saveSubsetor}
                        disabled={!editingSubsetor.nome}
                        className={cn(
                          'p-1.5 rounded',
                          editingSubsetor.nome
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-300 cursor-not-allowed'
                        )}
                        title="Salvar"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingSubsetor(null)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

SetoresConfig.displayName = 'SetoresConfig'
