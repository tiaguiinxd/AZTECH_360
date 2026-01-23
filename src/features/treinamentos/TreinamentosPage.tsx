/**
 * Página de Treinamentos - Entregas por Setor
 *
 * Exibe as entregas principais de cada setor da AZ TECH
 * para fins de treinamento e consulta
 */

import { useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { SetorCard } from './components'
import { SETORES } from './data/entregasData'

export function TreinamentosPage() {
  const [expandedSetor, setExpandedSetor] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSetorToggle = (setorId: string) => {
    setExpandedSetor(expandedSetor === setorId ? null : setorId)
  }

  // Filtro por busca
  const setoresFiltrados = searchTerm
    ? SETORES.map((setor) => ({
        ...setor,
        entregas: setor.entregas.filter(
          (entrega) =>
            entrega.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entrega.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entrega.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((setor) => setor.entregas.length > 0)
    : SETORES

  const totalEntregas = SETORES.reduce((acc, setor) => acc + setor.entregas.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Treinamentos - Entregas por Setor
              </h1>
              <p className="text-sm text-gray-600">
                Material de referência das principais entregas de cada setor da AZ TECH
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar entregas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>{SETORES.length}</strong> setores
              </span>
              <span className="text-gray-300">|</span>
              <span>
                <strong>{totalEntregas}</strong> entregas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {searchTerm && setoresFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma entrega encontrada para "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {setoresFiltrados.map((setor) => (
              <SetorCard
                key={setor.id}
                setor={setor}
                isExpanded={expandedSetor === setor.id}
                onToggle={() => handleSetorToggle(setor.id)}
              />
            ))}
          </div>
        )}

        {/* Rodapé informativo */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Como usar este material
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Clique em um setor para ver suas responsabilidades e entregas</li>
            <li>Clique em uma entrega para ver detalhes, prazos e criterios de qualidade</li>
            <li>
              Este material e editavel diretamente no arquivo:
              <code className="ml-1 px-1 bg-blue-100 rounded">
                src/features/treinamentos/data/entregasData.ts
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
