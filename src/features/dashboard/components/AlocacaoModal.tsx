/**
 * AlocacaoModal - Modal para alocar colaborador em projeto
 */

import { useState, useCallback, useEffect, memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { X, Save, AlertTriangle, UserPlus } from 'lucide-react'
import { cn } from '@/utils'
import { useOrganoStore } from '@/stores/organoStore'
import { usePlanejamentoStore } from '@/stores/planejamentoStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import type {
  AlocacaoCreate,
  FuncaoAlocacao,
} from '@/types/dashboard'

interface AlocacaoModalProps {
  isOpen: boolean
  onClose: () => void
}

const FUNCOES: { value: FuncaoAlocacao; label: string }[] = [
  { value: 'gerente_projeto', label: 'Gerente de Projeto' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'engenheiro', label: 'Engenheiro' },
  { value: 'tecnico', label: 'Tecnico' },
  { value: 'encarregado', label: 'Encarregado' },
  { value: 'auxiliar', label: 'Auxiliar' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'comprador', label: 'Comprador' },
]

export const AlocacaoModal = memo(function AlocacaoModal({
  isOpen,
  onClose,
}: AlocacaoModalProps) {
  // ============ STORES ============
  const colaboradores = useOrganoStore(
    useShallow((state) => state.colaboradores)
  )
  const loadColaboradores = useOrganoStore((state) => state.loadColaboradores)

  const projetos = usePlanejamentoStore(
    useShallow((state) => state.projetos)
  )
  const loadProjetos = usePlanejamentoStore((state) => state.loadProjetos)

  const createAlocacao = useDashboardStore((state) => state.createAlocacao)

  // ============ STATE ============
  const [formData, setFormData] = useState<AlocacaoCreate>({
    colaborador_id: 0,
    projeto_id: 0,
    funcao: 'engenheiro',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: null,
    horas_semanais: 40,
    percentual_dedicacao: 100,
    status: 'ativa',
    observacoes: null,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ============ EFFECTS ============
  useEffect(() => {
    if (isOpen) {
      // Carregar dados se necessário
      if (colaboradores.length === 0) {
        loadColaboradores()
      }
      if (projetos.length === 0) {
        loadProjetos()
      }
    }
  }, [isOpen, colaboradores.length, projetos.length, loadColaboradores, loadProjetos])

  // ============ HANDLERS ============
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (formData.colaborador_id === 0 || formData.projeto_id === 0) {
        setSaveError('Selecione um colaborador e um projeto.')
        return
      }

      setIsSaving(true)
      setSaveError(null)

      try {
        await createAlocacao(formData)
        // Resetar form
        setFormData({
          colaborador_id: 0,
          projeto_id: 0,
          funcao: 'engenheiro',
          data_inicio: new Date().toISOString().split('T')[0],
          data_fim: null,
          horas_semanais: 40,
          percentual_dedicacao: 100,
          status: 'ativa',
          observacoes: null,
        })
        onClose()
      } catch (error) {
        console.error('Erro ao salvar alocacao:', error)
        setSaveError(
          error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.'
        )
      } finally {
        setIsSaving(false)
      }
    },
    [formData, createAlocacao, onClose]
  )

  const handleCancel = useCallback(() => {
    setFormData({
      colaborador_id: 0,
      projeto_id: 0,
      funcao: 'engenheiro',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: null,
      horas_semanais: 40,
      percentual_dedicacao: 100,
      status: 'ativa',
      observacoes: null,
    })
    setSaveError(null)
    onClose()
  }, [onClose])

  // ============ RENDER ============
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-aztech-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                Nova Alocacao
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Colaborador */}
            <div>
              <label htmlFor="colaborador" className="block text-sm font-medium text-gray-700 mb-1">
                Colaborador*
              </label>
              <select
                id="colaborador"
                required
                value={formData.colaborador_id}
                onChange={(e) =>
                  setFormData({ ...formData, colaborador_id: Number(e.target.value) })
                }
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
              >
                <option value={0}>Selecione um colaborador...</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.cargo}
                  </option>
                ))}
              </select>
            </div>

            {/* Projeto */}
            <div>
              <label htmlFor="projeto" className="block text-sm font-medium text-gray-700 mb-1">
                Projeto*
              </label>
              <select
                id="projeto"
                required
                value={formData.projeto_id}
                onChange={(e) =>
                  setFormData({ ...formData, projeto_id: Number(e.target.value) })
                }
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
              >
                <option value={0}>Selecione um projeto...</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Funcao */}
            <div>
              <label htmlFor="funcao" className="block text-sm font-medium text-gray-700 mb-1">
                Funcao no Projeto*
              </label>
              <select
                id="funcao"
                required
                value={formData.funcao}
                onChange={(e) =>
                  setFormData({ ...formData, funcao: e.target.value as FuncaoAlocacao })
                }
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
              >
                {FUNCOES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicio*
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  required
                  value={formData.data_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, data_inicio: e.target.value })
                  }
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                />
              </div>
              <div>
                <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  id="dataFim"
                  value={formData.data_fim ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_fim: e.target.value || null,
                    })
                  }
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                />
              </div>
            </div>

            {/* Horas e Percentual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="horasSemanais" className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Semanais
                </label>
                <input
                  type="number"
                  id="horasSemanais"
                  min="1"
                  max="60"
                  value={formData.horas_semanais}
                  onChange={(e) =>
                    setFormData({ ...formData, horas_semanais: Number(e.target.value) })
                  }
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                />
              </div>
              <div>
                <label htmlFor="percentual" className="block text-sm font-medium text-gray-700 mb-1">
                  Percentual Dedicacao (%)
                </label>
                <input
                  type="number"
                  id="percentual"
                  min="1"
                  max="100"
                  value={formData.percentual_dedicacao}
                  onChange={(e) =>
                    setFormData({ ...formData, percentual_dedicacao: Number(e.target.value) })
                  }
                  className={cn(
                    'w-full px-3 py-2 text-sm',
                    'border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                  )}
                />
              </div>
            </div>

            {/* Observacoes */}
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observacoes
              </label>
              <textarea
                id="observacoes"
                value={formData.observacoes ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacoes: e.target.value || null,
                  })
                }
                rows={2}
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
                placeholder="Observacoes opcionais..."
              />
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
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                'px-4 py-2 text-sm',
                'text-gray-700 hover:text-gray-900',
                'hover:bg-gray-100 rounded-lg transition-colors'
              )}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || formData.colaborador_id === 0 || formData.projeto_id === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm',
                'bg-aztech-primary text-white',
                'hover:bg-aztech-primary/90 rounded-lg transition-colors',
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
                  Criar Alocacao
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

AlocacaoModal.displayName = 'AlocacaoModal'
