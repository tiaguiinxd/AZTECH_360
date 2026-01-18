/**
 * NiveisConfig - Configuração de Níveis Hierárquicos e Subníveis
 *
 * Funcionalidades:
 * - Listar todos os níveis hierárquicos
 * - Editar nome, descrição, cores
 * - Gerenciar subníveis (senioridade) por nível
 * - Adicionar/remover subníveis
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
} from 'lucide-react'
import { useConfigStore } from '@/stores/configStore'
import type { NivelHierarquico, Subnivel, ID } from '@/types'

interface EditingNivel {
  id: ID
  nome: string
  descricao: string
  cor: string
  corTexto: string
}

interface EditingSubnivel {
  nivelId: ID
  subnivel: Subnivel | null // null = creating new
  nome: string
  abreviacao: string
}

export const NiveisConfig = memo(function NiveisConfig() {
  const { niveis, updateNivel, addSubnivel, updateSubnivel, removeSubnivel } = useConfigStore(
    useShallow((state) => ({
      niveis: state.niveis,
      updateNivel: state.updateNivel,
      addSubnivel: state.addSubnivel,
      updateSubnivel: state.updateSubnivel,
      removeSubnivel: state.removeSubnivel,
    }))
  )

  const [expandedNiveis, setExpandedNiveis] = useState<Set<ID>>(new Set())
  const [editingNivel, setEditingNivel] = useState<EditingNivel | null>(null)
  const [editingSubnivel, setEditingSubnivel] = useState<EditingSubnivel | null>(null)

  // Toggle expanded
  const toggleExpanded = useCallback((id: ID) => {
    setExpandedNiveis((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Start editing nivel
  const startEditNivel = useCallback((nivel: NivelHierarquico) => {
    setEditingNivel({
      id: nivel.id,
      nome: nivel.nome,
      descricao: nivel.descricao ?? '',
      cor: nivel.cor,
      corTexto: nivel.corTexto,
    })
  }, [])

  // Save nivel
  const saveNivel = useCallback(() => {
    if (!editingNivel) return
    updateNivel(editingNivel.id, {
      nome: editingNivel.nome,
      descricao: editingNivel.descricao,
      cor: editingNivel.cor,
      corTexto: editingNivel.corTexto,
    })
    setEditingNivel(null)
  }, [editingNivel, updateNivel])

  // Start editing subnivel
  const startEditSubnivel = useCallback((nivelId: ID, subnivel: Subnivel | null) => {
    setEditingSubnivel({
      nivelId,
      subnivel,
      nome: subnivel?.nome ?? '',
      abreviacao: subnivel?.abreviacao ?? '',
    })
  }, [])

  // Save subnivel
  const saveSubnivel = useCallback(() => {
    if (!editingSubnivel) return

    if (editingSubnivel.subnivel) {
      // Editing existing
      updateSubnivel(editingSubnivel.nivelId, editingSubnivel.subnivel.id, {
        nome: editingSubnivel.nome,
        abreviacao: editingSubnivel.abreviacao,
      })
    } else {
      // Creating new
      addSubnivel(editingSubnivel.nivelId, {
        nome: editingSubnivel.nome,
        abreviacao: editingSubnivel.abreviacao,
      })
    }
    setEditingSubnivel(null)
  }, [editingSubnivel, updateSubnivel, addSubnivel])

  // Delete subnivel
  const handleDeleteSubnivel = useCallback(
    (nivelId: ID, subnivelId: ID) => {
      if (window.confirm('Tem certeza que deseja remover este subnível?')) {
        removeSubnivel(nivelId, subnivelId)
      }
    },
    [removeSubnivel]
  )

  return (
    <div className="p-6">
      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Níveis Hierárquicos</strong> definem a posição vertical no organograma.
          <br />
          <strong>Subníveis</strong> definem senioridade dentro do mesmo nível (ex: Sênior, Pleno, Júnior).
        </p>
      </div>

      {/* Níveis list */}
      <div className="space-y-3">
        {niveis.map((nivel) => {
          const isExpanded = expandedNiveis.has(nivel.id)
          const isEditing = editingNivel?.id === nivel.id
          const hasSubniveis = (nivel.subniveis?.length ?? 0) > 0

          return (
            <div
              key={nivel.id}
              className="bg-white rounded-lg border shadow-sm overflow-hidden"
            >
              {/* Nivel header */}
              <div
                className="flex items-center gap-3 p-4"
                style={{ backgroundColor: nivel.cor + '20' }}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpanded(nivel.id)}
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
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: nivel.cor, color: nivel.corTexto }}
                >
                  {nivel.nivel}
                </div>

                {/* Content */}
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={editingNivel.nome}
                      onChange={(e) =>
                        setEditingNivel({ ...editingNivel, nome: e.target.value })
                      }
                      className="px-2 py-1 text-sm border rounded w-40"
                      placeholder="Nome"
                    />
                    <input
                      type="text"
                      value={editingNivel.descricao}
                      onChange={(e) =>
                        setEditingNivel({ ...editingNivel, descricao: e.target.value })
                      }
                      className="px-2 py-1 text-sm border rounded flex-1"
                      placeholder="Descrição"
                    />
                    <input
                      type="color"
                      value={editingNivel.cor}
                      onChange={(e) =>
                        setEditingNivel({ ...editingNivel, cor: e.target.value })
                      }
                      className="w-8 h-8 rounded cursor-pointer"
                      title="Cor de fundo"
                    />
                    <input
                      type="color"
                      value={editingNivel.corTexto}
                      onChange={(e) =>
                        setEditingNivel({ ...editingNivel, corTexto: e.target.value })
                      }
                      className="w-8 h-8 rounded cursor-pointer"
                      title="Cor do texto"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{nivel.nome}</h3>
                    <p className="text-sm text-gray-500">{nivel.descricao}</p>
                  </div>
                )}

                {/* Subniveis count */}
                {hasSubniveis && !isExpanded && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    {nivel.subniveis?.length} subnível(is)
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveNivel}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Salvar"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingNivel(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditNivel(nivel)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                      title="Editar nível"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subniveis section */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Subníveis de Senioridade
                    </h4>
                    <button
                      onClick={() => startEditSubnivel(nivel.id, null)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded',
                        'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
                      )}
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar Subnível
                    </button>
                  </div>

                  {/* Subniveis list */}
                  {hasSubniveis ? (
                    <div className="space-y-2">
                      {nivel.subniveis?.map((subnivel) => {
                        const isEditingThis =
                          editingSubnivel?.nivelId === nivel.id &&
                          editingSubnivel?.subnivel?.id === subnivel.id

                        return (
                          <div
                            key={subnivel.id}
                            className="flex items-center gap-3 p-3 bg-white rounded border"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />

                            <span className="w-6 h-6 rounded bg-gray-700 text-white flex items-center justify-center text-xs font-bold">
                              {subnivel.ordem}
                            </span>

                            {isEditingThis ? (
                              <>
                                <input
                                  type="text"
                                  value={editingSubnivel.nome}
                                  onChange={(e) =>
                                    setEditingSubnivel({
                                      ...editingSubnivel,
                                      nome: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 text-sm border rounded w-32"
                                  placeholder="Nome"
                                />
                                <input
                                  type="text"
                                  value={editingSubnivel.abreviacao}
                                  onChange={(e) =>
                                    setEditingSubnivel({
                                      ...editingSubnivel,
                                      abreviacao: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 text-sm border rounded w-16"
                                  placeholder="Abrev"
                                />
                                <div className="flex-1" />
                                <button
                                  onClick={saveSubnivel}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Salvar"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSubnivel(null)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-gray-900">
                                  {subnivel.nome}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                                  {subnivel.abreviacao}
                                </span>
                                <div className="flex-1" />
                                <button
                                  onClick={() => startEditSubnivel(nivel.id, subnivel)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubnivel(nivel.id, subnivel.id)}
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
                      Este nível não possui subníveis de senioridade.
                    </p>
                  )}

                  {/* New subnivel form */}
                  {editingSubnivel?.nivelId === nivel.id &&
                    editingSubnivel.subnivel === null && (
                      <div className="flex items-center gap-3 p-3 mt-2 bg-white rounded border border-dashed border-aztech-primary">
                        <span className="w-6 h-6 rounded bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
                          ?
                        </span>
                        <input
                          type="text"
                          value={editingSubnivel.nome}
                          onChange={(e) =>
                            setEditingSubnivel({
                              ...editingSubnivel,
                              nome: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-sm border rounded w-32"
                          placeholder="Nome (ex: Sênior)"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editingSubnivel.abreviacao}
                          onChange={(e) =>
                            setEditingSubnivel({
                              ...editingSubnivel,
                              abreviacao: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-sm border rounded w-16"
                          placeholder="Sr"
                        />
                        <div className="flex-1" />
                        <button
                          onClick={saveSubnivel}
                          disabled={!editingSubnivel.nome || !editingSubnivel.abreviacao}
                          className={cn(
                            'p-1.5 rounded',
                            editingSubnivel.nome && editingSubnivel.abreviacao
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-300 cursor-not-allowed'
                          )}
                          title="Salvar"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingSubnivel(null)}
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

NiveisConfig.displayName = 'NiveisConfig'
