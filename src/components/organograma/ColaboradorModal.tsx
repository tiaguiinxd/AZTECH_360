/**
 * ColaboradorModal - Modal para visualizar/editar colaborador
 *
 * NOTA: Usa configStore para obter setores e níveis dinâmicos
 *
 * VALIDAÇÃO DE SUPERIOR:
 * - Superior deve estar no mesmo setor
 * - Superior deve ter nível hierárquico igual ou superior
 * - Não pode criar ciclos na hierarquia
 */

import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { X, User, Briefcase, Building2, Users, Save, Trash2, Award, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils'
import type { Colaborador, ID } from '@/types'
import { useConfigStore } from '@/stores/configStore'
import { getValidSuperiors } from '@/stores/organoStore'

interface ColaboradorModalProps {
  colaborador: Colaborador | null
  allColaboradores: Colaborador[]
  isOpen: boolean
  mode: 'view' | 'edit' | 'create'
  onClose: () => void
  onSave?: (data: Partial<Colaborador>) => Promise<void>
  onDelete?: (id: ID) => void
}

type FormData = {
  nome: string
  cargo: string
  setorId: ID
  nivelId: ID
  subnivelId: ID | undefined
  superiorId: ID | undefined
}

export const ColaboradorModal = memo(function ColaboradorModal({
  colaborador,
  allColaboradores,
  isOpen,
  mode,
  onClose,
  onSave,
  onDelete,
}: ColaboradorModalProps) {
  // Usar dados do configStore (dinâmicos)
  const { setores, niveis, hasHydrated } = useConfigStore(
    useShallow((state) => ({
      setores: state.setores,
      niveis: state.niveis,
      hasHydrated: state._hasHydrated,
    }))
  )

  // Verificar se os dados estão carregados
  const isDataReady = hasHydrated && setores.length > 0 && niveis.length > 0

  // Helper functions usando dados do store
  const getSetorById = useCallback(
    (id: ID) => setores.find((s) => s.id === id),
    [setores]
  )

  const getNivelById = useCallback(
    (id: ID) => niveis.find((n) => n.id === id),
    [niveis]
  )

  const getSubnivelById = useCallback(
    (nivelId: ID, subnivelId: ID) => {
      const nivel = getNivelById(nivelId)
      return nivel?.subniveis?.find((s) => s.id === subnivelId)
    },
    [getNivelById]
  )

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cargo: '',
    setorId: setores[0]?.id ?? 1,
    nivelId: niveis[0]?.id ?? 1,
    subnivelId: undefined,
    superiorId: undefined,
  })

  // Reset form when colaborador changes
  useEffect(() => {
    if (colaborador) {
      setFormData({
        nome: colaborador.nome,
        cargo: colaborador.cargo,
        setorId: colaborador.setorId,
        nivelId: colaborador.nivelId,
        subnivelId: colaborador.subnivelId,
        superiorId: colaborador.superiorId,
      })
    } else {
      // Default: último nível (Operacional)
      const defaultNivelId = niveis.length > 0 ? niveis[niveis.length - 1].id : 5
      setFormData({
        nome: '',
        cargo: '',
        setorId: setores[0]?.id ?? 1,
        nivelId: defaultNivelId,
        subnivelId: undefined,
        superiorId: undefined,
      })
    }
  }, [colaborador, setores, niveis])

  // Filtrar superiores válidos com base em:
  // - Mesmo setor
  // - Nível hierárquico igual ou superior
  // - Sem criar ciclos
  // IMPORTANTE: Hooks devem ser chamados antes de qualquer return
  const potentialSuperiors = useMemo(() => {
    if (!isDataReady) return []
    return getValidSuperiors(
      allColaboradores,
      colaborador?.id ?? 0,
      formData.setorId,
      formData.nivelId
    )
  }, [isDataReady, allColaboradores, colaborador?.id, formData.setorId, formData.nivelId])

  // Verificar se o superior atual é válido (após mudança de setor/nível)
  const isSuperiorValid = useMemo(() => {
    if (!formData.superiorId) return true
    return potentialSuperiors.some(s => s.id === formData.superiorId)
  }, [formData.superiorId, potentialSuperiors])

  // Estado de salvamento - DEVE estar antes de qualquer return
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Early returns DEPOIS de todos os hooks
  if (!isOpen) return null

  // Mostrar loading se os dados ainda não estão prontos
  if (!isDataReady) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-aztech-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  const setor = colaborador ? getSetorById(colaborador.setorId) : null
  const nivel = colaborador ? getNivelById(colaborador.nivelId) : null
  const superior = colaborador?.superiorId
    ? allColaboradores.find((c) => c.id === colaborador.superiorId)
    : null

  const isEditing = mode === 'edit' || mode === 'create'
  const title = mode === 'create' ? 'Novo Colaborador' : mode === 'edit' ? 'Editar Colaborador' : 'Detalhes do Colaborador'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSave) {
      onClose()
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await onSave({
        ...formData,
        permissoes: colaborador?.permissoes ?? [],
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error)
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar. Tente novamente.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (colaborador && onDelete && window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      onDelete(colaborador.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: setor?.cor ?? '#f3f4f6',
          }}
        >
          <h2
            id="modal-title"
            className="text-lg font-semibold"
            style={{ color: setor?.corTexto ?? '#1e293b' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              'hover:bg-black/10 transition-colors'
            )}
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" style={{ color: setor?.corTexto ?? '#1e293b' }} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Nome */}
            <div className="space-y-1">
              <label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Nome
              </label>
              {isEditing ? (
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                  required
                />
              ) : (
                <p className="text-gray-900">{colaborador?.nome}</p>
              )}
            </div>

            {/* Cargo */}
            <div className="space-y-1">
              <label htmlFor="cargo" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Briefcase className="h-4 w-4" />
                Cargo
              </label>
              {isEditing ? (
                <input
                  id="cargo"
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                  required
                />
              ) : (
                <p className="text-gray-900">{colaborador?.cargo}</p>
              )}
            </div>

            {/* Setor */}
            <div className="space-y-1">
              <label htmlFor="setor" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4" />
                Setor
              </label>
              {isEditing ? (
                <select
                  id="setor"
                  value={formData.setorId}
                  onChange={(e) => setFormData({
                    ...formData,
                    setorId: Number(e.target.value),
                    superiorId: undefined // Reset superior ao mudar setor
                  })}
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                >
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 text-sm rounded"
                    style={{
                      backgroundColor: setor?.cor,
                      color: setor?.corTexto,
                    }}
                  >
                    {setor?.nome}
                  </span>
                </div>
              )}
            </div>

            {/* Nível */}
            <div className="space-y-1">
              <label htmlFor="nivel" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Nível Hierárquico
              </label>
              {isEditing ? (
                <select
                  id="nivel"
                  value={formData.nivelId}
                  onChange={(e) => setFormData({
                    ...formData,
                    nivelId: Number(e.target.value),
                    subnivelId: undefined, // Limpa subnível ao mudar nível
                    superiorId: undefined  // Reset superior ao mudar nível
                  })}
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                >
                  {niveis.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 text-sm rounded"
                    style={{
                      backgroundColor: nivel?.cor,
                      color: nivel?.corTexto,
                    }}
                  >
                    {nivel?.nome}
                  </span>
                </div>
              )}
            </div>

            {/* Subnível (Senioridade) - só aparece se o nível tiver subníveis */}
            {(() => {
              const nivelSelecionado = getNivelById(formData.nivelId)
              const subniveis = nivelSelecionado?.subniveis ?? []
              const subnivelAtual = colaborador?.subnivelId
                ? getSubnivelById(colaborador.nivelId, colaborador.subnivelId)
                : null

              if (subniveis.length === 0 && !subnivelAtual) return null

              return (
                <div className="space-y-1">
                  <label htmlFor="subnivel" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Award className="h-4 w-4" />
                    Senioridade
                  </label>
                  {isEditing ? (
                    subniveis.length > 0 ? (
                      <select
                        id="subnivel"
                        value={formData.subnivelId ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subnivelId: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className={cn(
                          'w-full px-3 py-2 text-sm',
                          'border border-gray-300 rounded-lg',
                          'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                        )}
                      >
                        <option value="">Não definido</option>
                        {subniveis.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome} ({s.abreviacao})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Este nível não possui subníveis de senioridade
                      </p>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      {subnivelAtual ? (
                        <span className="px-2 py-1 text-sm rounded bg-gray-700 text-white">
                          {subnivelAtual.nome} ({subnivelAtual.abreviacao})
                        </span>
                      ) : (
                        <span className="text-gray-500">Não definido</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Superior */}
            <div className="space-y-1">
              <label htmlFor="superior" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Superior Imediato
              </label>
              {isEditing ? (
                <>
                  <select
                    id="superior"
                    value={formData.superiorId ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        superiorId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className={cn(
                      'w-full px-3 py-2 text-sm',
                      'border rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary',
                      !isSuperiorValid
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300'
                    )}
                  >
                    <option value="">Sem superior (raiz)</option>
                    {potentialSuperiors.map((s) => {
                      const superiorNivel = niveis.find(n => n.id === s.nivelId)
                      return (
                        <option key={s.id} value={s.id}>
                          {s.nome} - {s.cargo} ({superiorNivel?.nome})
                        </option>
                      )
                    })}
                  </select>
                  {/* Alerta se superior atual ficou inválido */}
                  {!isSuperiorValid && formData.superiorId && (
                    <div className="flex items-start gap-2 p-2 mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        O superior atual não é válido para este setor/nível.
                        Selecione um novo superior do mesmo setor com nível hierárquico igual ou superior.
                      </span>
                    </div>
                  )}
                  {/* Mensagem informativa */}
                  {potentialSuperiors.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Não há colaboradores elegíveis como superior neste setor/nível.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-900">
                  {superior ? `${superior.nome} - ${superior.cargo}` : 'Sem superior (raiz)'}
                </p>
              )}
            </div>

            {/* Mensagem de erro */}
            {saveError && (
              <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Erro ao salvar</p>
                  <p>{saveError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            {/* Delete Button */}
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm',
                  'text-red-600 hover:text-red-800',
                  'hover:bg-red-50 rounded-lg transition-colors'
                )}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            )}

            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-4 py-2 text-sm',
                  'text-gray-600 hover:text-gray-800',
                  'hover:bg-gray-100 rounded-lg transition-colors'
                )}
              >
                {isEditing ? 'Cancelar' : 'Fechar'}
              </button>

              {isEditing && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm',
                    'bg-aztech-primary text-white',
                    'hover:bg-aztech-primary-hover rounded-lg transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
})

ColaboradorModal.displayName = 'ColaboradorModal'
