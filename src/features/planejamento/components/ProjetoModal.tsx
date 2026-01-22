/**
 * ProjetoModal - Modal de criacao/edicao de projetos de planejamento
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import type { Projeto, StatusProjeto } from '@/types/planejamento'

interface ProjetoModalProps {
  isOpen: boolean
  projeto: Projeto | null
  opcoesEmpresas: string[]
  opcoesClientes: string[]
  opcoesCategorias: string[]
  onSave: (data: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<void>
  onClose: () => void
}

const STATUS_OPTIONS: { value: StatusProjeto; label: string }[] = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const initialFormData = {
  codigo: '',
  nome: '',
  descricao: '',
  empresa: '',
  cliente: '',
  categoria: '',
  subcategoria: '',
  tipo: '',
  valorEstimado: '',
  dataInicioPrevista: '',
  dataFimPrevista: '',
  dataInicioReal: '',
  dataFimReal: '',
  status: 'planejado' as StatusProjeto,
  percentualConclusao: 0,
}

export const ProjetoModal = memo(function ProjetoModal({
  isOpen,
  projeto,
  opcoesEmpresas,
  opcoesClientes,
  opcoesCategorias,
  onSave,
  onClose,
}: ProjetoModalProps) {
  const [formData, setFormData] = useState(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = useMemo(() => projeto !== null, [projeto])
  const title = useMemo(() => (isEditing ? 'Editar Projeto' : 'Novo Projeto'), [isEditing])

  useEffect(() => {
    if (projeto) {
      setFormData({
        codigo: projeto.codigo,
        nome: projeto.nome,
        descricao: projeto.descricao || '',
        empresa: projeto.empresa,
        cliente: projeto.cliente,
        categoria: projeto.categoria,
        subcategoria: projeto.subcategoria || '',
        tipo: projeto.tipo || '',
        valorEstimado: projeto.valorEstimado?.toString() || '',
        dataInicioPrevista: projeto.dataInicioPrevista?.split('T')[0] || '',
        dataFimPrevista: projeto.dataFimPrevista?.split('T')[0] || '',
        dataInicioReal: projeto.dataInicioReal?.split('T')[0] || '',
        dataFimReal: projeto.dataFimReal?.split('T')[0] || '',
        status: projeto.status,
        percentualConclusao: projeto.percentualConclusao,
      })
    } else {
      setFormData(initialFormData)
    }
    setError(null)
  }, [projeto, isOpen])

  const handleChange = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      // Validacao basica
      if (!formData.codigo.trim()) {
        setError('Codigo e obrigatorio')
        return
      }
      if (!formData.nome.trim()) {
        setError('Nome e obrigatorio')
        return
      }
      if (!formData.empresa.trim()) {
        setError('Empresa e obrigatoria')
        return
      }
      if (!formData.cliente.trim()) {
        setError('Cliente e obrigatorio')
        return
      }
      if (!formData.categoria.trim()) {
        setError('Categoria e obrigatoria')
        return
      }

      // Validacao de datas
      if (formData.dataInicioPrevista && formData.dataFimPrevista) {
        if (new Date(formData.dataInicioPrevista) > new Date(formData.dataFimPrevista)) {
          setError('Data de termino prevista deve ser posterior a data de inicio')
          return
        }
      }
      if (formData.dataInicioReal && formData.dataFimReal) {
        if (new Date(formData.dataInicioReal) > new Date(formData.dataFimReal)) {
          setError('Data de termino real deve ser posterior a data de inicio')
          return
        }
      }

      setIsSaving(true)
      try {
        await onSave({
          codigo: formData.codigo.trim(),
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          empresa: formData.empresa.trim(),
          cliente: formData.cliente.trim(),
          categoria: formData.categoria.trim(),
          subcategoria: formData.subcategoria.trim() || null,
          tipo: formData.tipo.trim() || null,
          valorEstimado: formData.valorEstimado ? parseFloat(formData.valorEstimado) : null,
          dataInicioPrevista: formData.dataInicioPrevista || null,
          dataFimPrevista: formData.dataFimPrevista || null,
          dataInicioReal: formData.dataInicioReal || null,
          dataFimReal: formData.dataFimReal || null,
          status: formData.status,
          percentualConclusao: formData.percentualConclusao,
        })
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar projeto')
      } finally {
        setIsSaving(false)
      }
    },
    [formData, onSave, onClose]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Codigo e Nome */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codigo *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="PRJ-001"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="Nome do projeto"
                />
              </div>
            </div>

            {/* Empresa, Cliente, Categoria */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <input
                  type="text"
                  list="empresas-list"
                  value={formData.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="AZ TECH"
                />
                <datalist id="empresas-list">
                  {opcoesEmpresas.map((emp) => (
                    <option key={emp} value={emp} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  list="clientes-list"
                  value={formData.cliente}
                  onChange={(e) => handleChange('cliente', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="NGD"
                />
                <datalist id="clientes-list">
                  {opcoesClientes.map((cli) => (
                    <option key={cli} value={cli} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <input
                  type="text"
                  list="categorias-list"
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="CIVIL"
                />
                <datalist id="categorias-list">
                  {opcoesCategorias.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Subcategoria e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria
                </label>
                <input
                  type="text"
                  value={formData.subcategoria}
                  onChange={(e) => handleChange('subcategoria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="Subcategoria (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="Tipo de projeto (opcional)"
                />
              </div>
            </div>

            {/* Descricao */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descricao
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent resize-none"
                placeholder="Descricao do projeto (opcional)"
              />
            </div>

            {/* Valor e Status */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorEstimado}
                  onChange={(e) => handleChange('valorEstimado', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as StatusProjeto)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conclusao (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentualConclusao}
                  onChange={(e) => handleChange('percentualConclusao', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Datas Previstas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio Previsto
                </label>
                <input
                  type="date"
                  value={formData.dataInicioPrevista}
                  onChange={(e) => handleChange('dataInicioPrevista', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termino Previsto
                </label>
                <input
                  type="date"
                  value={formData.dataFimPrevista}
                  onChange={(e) => handleChange('dataFimPrevista', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Datas Reais */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio Real
                </label>
                <input
                  type="date"
                  value={formData.dataInicioReal}
                  onChange={(e) => handleChange('dataInicioReal', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termino Real
                </label>
                <input
                  type="date"
                  value={formData.dataFimReal}
                  onChange={(e) => handleChange('dataFimReal', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-aztech-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                isSaving
                  ? 'bg-aztech-primary/70 cursor-not-allowed'
                  : 'bg-aztech-primary hover:bg-aztech-primary/90'
              )}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

ProjetoModal.displayName = 'ProjetoModal'
