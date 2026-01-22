/**
 * NivelModal - Modal para criar novo nível hierárquico
 */

import { useState, useCallback, memo } from 'react'
import { X, Save, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils'
import type { NivelHierarquico } from '@/types'

interface NivelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<NivelHierarquico, 'id' | 'subniveis'>) => Promise<void>
}

export const NivelModal = memo(function NivelModal({
  isOpen,
  onClose,
  onSave,
}: NivelModalProps) {
  const [formData, setFormData] = useState({
    nivel: 0,
    nome: '',
    descricao: '',
    cor: '#6B7280',
    corTexto: '#ffffff',
    ordem: 0,
    ativo: 1,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!onSave) {
        onClose()
        return
      }

      setIsSaving(true)
      setSaveError(null)

      try {
        await onSave(formData)
        // Resetar form
        setFormData({
          nivel: 0,
          nome: '',
          descricao: '',
          cor: '#6B7280',
          corTexto: '#ffffff',
          ordem: 0,
          ativo: 1,
        })
        onClose()
      } catch (error) {
        console.error('Erro ao salvar nível:', error)
        setSaveError(
          error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.'
        )
      } finally {
        setIsSaving(false)
      }
    },
    [formData, onSave, onClose]
  )

  const handleCancel = useCallback(() => {
    // Resetar form
    setFormData({
      nivel: 0,
      nome: '',
      descricao: '',
      cor: '#6B7280',
      corTexto: '#ffffff',
      ordem: 0,
      ativo: 1,
    })
    setSaveError(null)
    onClose()
  }, [onClose])

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
            <h2 className="text-lg font-semibold text-gray-900">
              Novo Nível Hierárquico
            </h2>
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
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome*
              </label>
              <input
                type="text"
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
                placeholder="Ex: Diretoria, Gerência, Coordenação..."
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
                placeholder="Descrição opcional do nível..."
              />
            </div>

            {/* Número do Nível */}
            <div>
              <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                Número do Nível*
              </label>
              <input
                type="number"
                id="nivel"
                required
                min="0"
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: Number(e.target.value) })}
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                0 = mais alto (Diretoria), valores maiores = mais baixo na hierarquia
              </p>
            </div>

            {/* Ordem */}
            <div>
              <label htmlFor="ordem" className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Exibição*
              </label>
              <input
                type="number"
                id="ordem"
                required
                min="0"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: Number(e.target.value) })}
                className={cn(
                  'w-full px-3 py-2 text-sm',
                  'border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                )}
              />
              <p className="mt-1 text-xs text-gray-500">
                Define a ordem de exibição na lista (menor = primeiro)
              </p>
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cor de Fundo */}
              <div>
                <label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-1">
                  Cor de Fundo*
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="cor"
                    required
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm',
                      'border border-gray-300 rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                    )}
                    placeholder="#6B7280"
                  />
                </div>
              </div>

              {/* Cor do Texto */}
              <div>
                <label htmlFor="corTexto" className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Texto*
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="corTexto"
                    required
                    value={formData.corTexto}
                    onChange={(e) => setFormData({ ...formData, corTexto: e.target.value })}
                    className="h-10 w-16 cursor-pointer border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.corTexto}
                    onChange={(e) => setFormData({ ...formData, corTexto: e.target.value })}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm',
                      'border border-gray-300 rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-aztech-primary/50 focus:border-aztech-primary'
                    )}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div
                className="px-4 py-2 rounded-lg text-center font-medium"
                style={{
                  backgroundColor: formData.cor,
                  color: formData.corTexto,
                }}
              >
                {formData.nome || 'Nome do Nível'}
              </div>
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
              disabled={isSaving || !formData.nome}
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
                  Criar Nível
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

NivelModal.displayName = 'NivelModal'
