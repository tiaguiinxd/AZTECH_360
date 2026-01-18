/**
 * TiposProjetoConfig - Configuração de Tipos de Projeto
 *
 * Funcionalidades:
 * - Listar todos os tipos de projeto
 * - CRUD completo de tipos
 * - Configurar código, nome, descrição e cor
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
  GripVertical,
  FolderKanban,
} from 'lucide-react'
import { useConfigStore } from '@/stores/configStore'
import type { ID, TipoProjeto } from '@/types'

interface EditingTipo {
  id: ID | null // null = creating new
  codigo: string
  nome: string
  descricao: string
  cor: string
  ordem: number
}

export const TiposProjetoConfig = memo(function TiposProjetoConfig() {
  const { tiposProjeto, addTipoProjeto, updateTipoProjeto, deleteTipoProjeto } = useConfigStore(
    useShallow((state) => ({
      tiposProjeto: state.tiposProjeto,
      addTipoProjeto: state.addTipoProjeto,
      updateTipoProjeto: state.updateTipoProjeto,
      deleteTipoProjeto: state.deleteTipoProjeto,
    }))
  )

  const [editingTipo, setEditingTipo] = useState<EditingTipo | null>(null)

  // Sorted tipos by ordem
  const sortedTipos = [...tiposProjeto].sort((a, b) => a.ordem - b.ordem)

  // Start creating new tipo
  const startCreateTipo = useCallback(() => {
    const maxOrdem = tiposProjeto.reduce((max, t) => Math.max(max, t.ordem), 0)
    setEditingTipo({
      id: null,
      codigo: '',
      nome: '',
      descricao: '',
      cor: '#3B82F6',
      ordem: maxOrdem + 1,
    })
  }, [tiposProjeto])

  // Start editing tipo
  const startEditTipo = useCallback((tipo: TipoProjeto) => {
    setEditingTipo({
      id: tipo.id,
      codigo: tipo.codigo,
      nome: tipo.nome,
      descricao: tipo.descricao ?? '',
      cor: tipo.cor ?? '#3B82F6',
      ordem: tipo.ordem,
    })
  }, [])

  // Save tipo
  const saveTipo = useCallback(() => {
    if (!editingTipo || !editingTipo.nome || !editingTipo.codigo) return

    if (editingTipo.id === null) {
      // Creating new
      addTipoProjeto({
        codigo: editingTipo.codigo,
        nome: editingTipo.nome,
        descricao: editingTipo.descricao,
        cor: editingTipo.cor,
        ordem: editingTipo.ordem,
      })
    } else {
      // Updating existing
      updateTipoProjeto(editingTipo.id, {
        codigo: editingTipo.codigo,
        nome: editingTipo.nome,
        descricao: editingTipo.descricao,
        cor: editingTipo.cor,
        ordem: editingTipo.ordem,
      })
    }
    setEditingTipo(null)
  }, [editingTipo, addTipoProjeto, updateTipoProjeto])

  // Delete tipo
  const handleDeleteTipo = useCallback(
    (id: ID) => {
      if (window.confirm('Tem certeza que deseja excluir este tipo de projeto?')) {
        deleteTipoProjeto(id)
      }
    },
    [deleteTipoProjeto]
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex-1 mr-4">
          <p className="text-sm text-blue-800">
            <strong>Tipos de Projeto</strong> categorizam os projetos da empresa.
            <br />
            Cada tipo possui um código curto (ex: EXT, CIV) e uma cor para identificação visual.
          </p>
        </div>
        <button
          onClick={startCreateTipo}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Novo Tipo
        </button>
      </div>

      {/* New tipo form */}
      {editingTipo?.id === null && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-dashed border-aztech-primary">
          <h3 className="font-semibold text-gray-900 mb-3">Novo Tipo de Projeto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                value={editingTipo.codigo}
                onChange={(e) =>
                  setEditingTipo({ ...editingTipo, codigo: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 text-sm border rounded-lg uppercase"
                placeholder="EXT"
                maxLength={4}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={editingTipo.nome}
                onChange={(e) => setEditingTipo({ ...editingTipo, nome: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Estrutura Metálica"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={editingTipo.descricao}
                onChange={(e) => setEditingTipo({ ...editingTipo, descricao: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Fabricação e montagem de estruturas metálicas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingTipo.cor}
                  onChange={(e) => setEditingTipo({ ...editingTipo, cor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={editingTipo.cor}
                  onChange={(e) => setEditingTipo({ ...editingTipo, cor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg font-mono"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingTipo(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={saveTipo}
              disabled={!editingTipo.nome || !editingTipo.codigo}
              className={cn(
                'px-4 py-2 text-sm rounded-lg',
                editingTipo.nome && editingTipo.codigo
                  ? 'bg-aztech-primary text-white hover:bg-aztech-primary-hover'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Criar Tipo
            </button>
          </div>
        </div>
      )}

      {/* Tipos list */}
      <div className="space-y-3">
        {sortedTipos.map((tipo) => {
          const isEditing = editingTipo?.id === tipo.id

          return (
            <div
              key={tipo.id}
              className={cn(
                'bg-white rounded-lg border shadow-sm overflow-hidden',
                isEditing && 'ring-2 ring-aztech-primary'
              )}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Drag handle */}
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

                {/* Color indicator */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: isEditing ? editingTipo.cor : tipo.cor }}
                >
                  <FolderKanban className="h-6 w-6" />
                </div>

                {/* Content */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={editingTipo.codigo}
                      onChange={(e) =>
                        setEditingTipo({ ...editingTipo, codigo: e.target.value.toUpperCase() })
                      }
                      className="px-3 py-2 text-sm border rounded-lg uppercase"
                      placeholder="Código"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      value={editingTipo.nome}
                      onChange={(e) => setEditingTipo({ ...editingTipo, nome: e.target.value })}
                      className="px-3 py-2 text-sm border rounded-lg"
                      placeholder="Nome"
                    />
                    <input
                      type="text"
                      value={editingTipo.descricao}
                      onChange={(e) => setEditingTipo({ ...editingTipo, descricao: e.target.value })}
                      className="px-3 py-2 text-sm border rounded-lg md:col-span-2"
                      placeholder="Descrição"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: tipo.cor }}
                      >
                        {tipo.codigo}
                      </span>
                      <h3 className="font-semibold text-gray-900">{tipo.nome}</h3>
                    </div>
                    {tipo.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{tipo.descricao}</p>
                    )}
                  </div>
                )}

                {/* Color picker when editing */}
                {isEditing && (
                  <input
                    type="color"
                    value={editingTipo.cor}
                    onChange={(e) => setEditingTipo({ ...editingTipo, cor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                    title="Cor do tipo"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveTipo}
                        disabled={!editingTipo.nome || !editingTipo.codigo}
                        className={cn(
                          'p-2 rounded transition-colors',
                          editingTipo.nome && editingTipo.codigo
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-300 cursor-not-allowed'
                        )}
                        title="Salvar"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingTipo(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditTipo(tipo)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTipo(tipo.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {sortedTipos.length === 0 && !editingTipo && (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
            <FolderKanban className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum tipo de projeto cadastrado.</p>
            <button
              onClick={startCreateTipo}
              className="mt-4 text-sm text-aztech-primary hover:underline"
            >
              Criar primeiro tipo
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

TiposProjetoConfig.displayName = 'TiposProjetoConfig'
