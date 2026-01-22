/**
 * Página principal do módulo Fluxo Operacional
 *
 * Apresenta o ciclo de vida de um serviço AZ TECH em formato visual
 * para treinamento e consulta da equipe
 */

import { useState } from 'react'
import { GitBranch, Table, Users, Info } from 'lucide-react'
import { FluxoTimeline, MapeamentoSetorTable, FuncoesServicoCard } from './components'
import { FASES, MAPEAMENTO_SETOR_FASE, FUNCOES_SERVICO } from './data/fluxoData'

type ViewMode = 'timeline' | 'mapeamento' | 'funcoes'

export function FluxoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-8 w-8 text-aztech-primary" />
          <h1 className="text-2xl font-bold text-gray-900">
            Fluxo Operacional AZ TECH
          </h1>
        </div>
        <p className="text-gray-600">
          Ciclo de vida de um servico - da captacao ate a execucao
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Documento Vivo</p>
          <p>
            Este fluxo e continuamente atualizado conforme aprendizados e
            refinamentos do processo operacional da empresa. A Fase 4 (Execucao)
            ainda sera definida em conjunto.
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'timeline'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          Timeline
        </button>
        <button
          onClick={() => setViewMode('mapeamento')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'mapeamento'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Table className="h-4 w-4" />
          Setor x Fase
        </button>
        <button
          onClick={() => setViewMode('funcoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'funcoes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipe do Servico
        </button>
      </div>

      {/* Content */}
      {viewMode === 'timeline' && <FluxoTimeline fases={FASES} />}

      {viewMode === 'mapeamento' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Mapeamento Setor x Fase
              </h2>
              <p className="text-sm text-gray-600">
                Participacao de cada setor em cada fase do ciclo de vida
              </p>
            </div>
            <MapeamentoSetorTable dados={MAPEAMENTO_SETOR_FASE} />
          </div>
        </div>
      )}

      {viewMode === 'funcoes' && (
        <div className="space-y-4">
          <FuncoesServicoCard funcoes={FUNCOES_SERVICO} />

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Quando definir a equipe?
            </h3>
            <p className="text-sm text-gray-600">
              A equipe do servico e definida durante a{' '}
              <span className="font-medium text-purple-700">
                Fase 3 - Kick-off
              </span>
              , na subfase 3.2 "Definicao da Equipe do Servico". Essas funcoes
              sao registradas no sistema e acompanham o servico durante toda a
              execucao.
            </p>
          </div>
        </div>
      )}

      {/* Diagrama resumo - sempre visível */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4 text-center">
          Visao Geral do Ciclo de Vida
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
            <span className="font-bold text-blue-800">1</span>
            <span className="text-blue-800">Pre-Servico</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg">
            <span className="font-bold text-amber-800">2</span>
            <span className="text-amber-800">Preparacao</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg">
            <span className="font-bold text-purple-800">3</span>
            <span className="text-purple-800">Kick-off</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
            <span className="font-bold text-green-800">4</span>
            <span className="text-green-800">Execucao</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-center text-gray-600">
          <div>Comercial, Tecnico, Suprimentos, Financeiro</div>
          <div>Engenharia, RH, Suprimentos</div>
          <div>Todos os setores</div>
          <div>Campo, Gestao</div>
        </div>
      </div>
    </div>
  )
}
