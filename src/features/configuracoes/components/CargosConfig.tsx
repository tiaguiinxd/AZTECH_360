/**
 * CargosConfig - Configuração de Cargos
 *
 * Funcionalidades:
 * - Listar todos os cargos
 * - CRUD completo de cargos
 * - Associar cargo a nível hierárquico
 * - Associar cargo a setor (opcional)
 */

import { useState, memo, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Briefcase,
  Filter,
} from 'lucide-react'
import { useConfigStore } from '@/stores/configStore'
import type { Cargo, ID } from '@/types'

interface EditingCargo {
  id: ID | null // null = creating new
  codigo: string
  nome: string
  nivelId: ID
  setorId: ID | undefined
  descricao: string
  ordem: number
}

export const CargosConfig = memo(function CargosConfig() {
  const { cargos, niveis, setores, addCargo, updateCargo, deleteCargo } = useConfigStore(
    useShallow((state) => ({
      cargos: state.cargos,
      niveis: state.niveis,
      setores: state.setores,
      addCargo: state.addCargo,
      updateCargo: state.updateCargo,
      deleteCargo: state.deleteCargo,
    }))
  )

  const [editingCargo, setEditingCargo] = useState<EditingCargo | null>(null)
  const [filterNivelId, setFilterNivelId] = useState<ID | null>(null)
  const [filterSetorId, setFilterSetorId] = useState<ID | null>(null)

  // Filtered cargos
  const filteredCargos = useMemo(() => {
    return cargos.filter((cargo) => {
      if (filterNivelId !== null && cargo.nivelId !== filterNivelId) return false
      if (filterSetorId !== null && cargo.setorId !== filterSetorId) return false
      return true
    })
  }, [cargos, filterNivelId, filterSetorId])

  // Group cargos by nivel
  const cargosByNivel = useMemo(() => {
    const grouped = new Map<ID, Cargo[]>()
    filteredCargos.forEach((cargo) => {
      const nivelId = cargo.nivelId ?? 0 // Fallback para cargos sem nível
      const existing = grouped.get(nivelId) ?? []
      grouped.set(nivelId, [...existing, cargo])
    })
    return grouped
  }, [filteredCargos])

  // Get setor name
  const getSetorNome = useCallback(
    (setorId: ID | undefined) => {
      if (!setorId) return 'Todos os setores'
      return setores.find((s) => s.id === setorId)?.nome ?? 'Desconhecido'
    },
    [setores]
  )

  // Start creating new cargo
  const startCreateCargo = useCallback(() => {
    const maxOrdem = cargos.reduce((max, c) => Math.max(max, c.ordem), 0)
    setEditingCargo({
      id: null,
      codigo: '',
      nome: '',
      nivelId: niveis[0]?.id ?? 1,
      setorId: undefined,
      descricao: '',
      ordem: maxOrdem + 1,
    })
  }, [niveis, cargos])

  // Start editing cargo
  const startEditCargo = useCallback((cargo: Cargo) => {
    setEditingCargo({
      id: cargo.id,
      codigo: cargo.codigo,
      nome: cargo.nome,
      nivelId: cargo.nivelId ?? niveis[0]?.id ?? 1,
      setorId: cargo.setorId,
      descricao: cargo.descricao ?? '',
      ordem: cargo.ordem,
    })
  }, [niveis])

  // Save cargo
  const saveCargo = useCallback(() => {
    if (!editingCargo || !editingCargo.nome) return

    if (editingCargo.id === null) {
      // Creating new
      addCargo({
        codigo: editingCargo.codigo || editingCargo.nome.substring(0, 3).toUpperCase(),
        nome: editingCargo.nome,
        nivelId: editingCargo.nivelId,
        setorId: editingCargo.setorId,
        descricao: editingCargo.descricao || undefined,
        ordem: editingCargo.ordem,
      })
    } else {
      // Updating existing
      updateCargo(editingCargo.id, {
        nome: editingCargo.nome,
        nivelId: editingCargo.nivelId,
        setorId: editingCargo.setorId,
        descricao: editingCargo.descricao || undefined,
      })
    }
    setEditingCargo(null)
  }, [editingCargo, addCargo, updateCargo])

  // Delete cargo
  const handleDeleteCargo = useCallback(
    (id: ID) => {
      if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
        deleteCargo(id)
      }
    },
    [deleteCargo]
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilterNivelId(null)
    setFilterSetorId(null)
  }, [])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex-1 mr-4">
          <p className="text-sm text-blue-800">
            <strong>Cargos</strong> definem as funções disponíveis na empresa.
            <br />
            Cada cargo está associado a um <strong>nível hierárquico</strong> e opcionalmente a um{' '}
            <strong>setor específico</strong>.
          </p>
        </div>
        <button
          onClick={startCreateCargo}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-aztech-primary text-white hover:bg-aztech-primary-hover transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          Novo Cargo
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Nível:</label>
          <select
            value={filterNivelId ?? ''}
            onChange={(e) => setFilterNivelId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 text-sm border rounded-lg"
          >
            <option value="">Todos</option>
            {niveis.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Setor:</label>
          <select
            value={filterSetorId ?? ''}
            onChange={(e) => setFilterSetorId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 text-sm border rounded-lg"
          >
            <option value="">Todos</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>
        {(filterNivelId !== null || filterSetorId !== null) && (
          <button onClick={clearFilters} className="text-sm text-aztech-primary hover:underline">
            Limpar filtros
          </button>
        )}
        <div className="flex-1" />
        <span className="text-sm text-gray-500">
          {filteredCargos.length} cargo{filteredCargos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* New cargo form */}
      {editingCargo?.id === null && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-dashed border-aztech-primary">
          <h3 className="font-semibold text-gray-900 mb-3">Novo Cargo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cargo *</label>
              <input
                type="text"
                value={editingCargo.nome}
                onChange={(e) => setEditingCargo({ ...editingCargo, nome: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Ex: Engenheiro de Projetos"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível Hierárquico *
              </label>
              <select
                value={editingCargo.nivelId}
                onChange={(e) =>
                  setEditingCargo({ ...editingCargo, nivelId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                {niveis.map((nivel) => (
                  <option key={nivel.id} value={nivel.id}>
                    {nivel.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor (opcional)
              </label>
              <select
                value={editingCargo.setorId ?? ''}
                onChange={(e) =>
                  setEditingCargo({
                    ...editingCargo,
                    setorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">Todos os setores</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={editingCargo.descricao}
                onChange={(e) => setEditingCargo({ ...editingCargo, descricao: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                placeholder="Breve descrição do cargo"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingCargo(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={saveCargo}
              disabled={!editingCargo.nome}
              className={cn(
                'px-4 py-2 text-sm rounded-lg',
                editingCargo.nome
                  ? 'bg-aztech-primary text-white hover:bg-aztech-primary-hover'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Criar Cargo
            </button>
          </div>
        </div>
      )}

      {/* Cargos grouped by nivel */}
      <div className="space-y-6">
        {niveis.map((nivel) => {
          const nivelCargos = cargosByNivel.get(nivel.id) ?? []
          if (nivelCargos.length === 0 && filterNivelId !== null) return null

          return (
            <div key={nivel.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Nivel header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: nivel.cor + '30' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: nivel.cor, color: nivel.corTexto }}
                >
                  {nivel.nivel}
                </div>
                <h3 className="font-semibold text-gray-900">{nivel.nome}</h3>
                <span className="text-sm text-gray-500">
                  {nivelCargos.length} cargo{nivelCargos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Cargos list */}
              <div className="p-4">
                {nivelCargos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nivelCargos.map((cargo) => {
                      const isEditing = editingCargo?.id === cargo.id

                      return (
                        <div
                          key={cargo.id}
                          className={cn(
                            'p-3 rounded-lg border',
                            isEditing ? 'border-aztech-primary bg-blue-50' : 'bg-gray-50'
                          )}
                        >
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingCargo.nome}
                                onChange={(e) =>
                                  setEditingCargo({ ...editingCargo, nome: e.target.value })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                                placeholder="Nome do cargo"
                              />
                              <select
                                value={editingCargo.nivelId}
                                onChange={(e) =>
                                  setEditingCargo({
                                    ...editingCargo,
                                    nivelId: Number(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                              >
                                {niveis.map((n) => (
                                  <option key={n.id} value={n.id}>
                                    {n.nome}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editingCargo.setorId ?? ''}
                                onChange={(e) =>
                                  setEditingCargo({
                                    ...editingCargo,
                                    setorId: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                              >
                                <option value="">Todos os setores</option>
                                {setores.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nome}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={editingCargo.descricao}
                                onChange={(e) =>
                                  setEditingCargo({ ...editingCargo, descricao: e.target.value })
                                }
                                className="w-full px-2 py-1 text-sm border rounded"
                                placeholder="Descrição"
                              />
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={saveCargo}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingCargo(null)}
                                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{cargo.nome}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEditCargo(cargo)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCargo(cargo.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                {cargo.setorId && (
                                  <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                                    {getSetorNome(cargo.setorId)}
                                  </span>
                                )}
                                {cargo.descricao && (
                                  <span className="text-xs text-gray-500 truncate">
                                    {cargo.descricao}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nenhum cargo cadastrado para este nível.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

CargosConfig.displayName = 'CargosConfig'
