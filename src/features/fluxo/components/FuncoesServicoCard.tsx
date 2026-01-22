/**
 * Card com as funções de equipe de um serviço
 *
 * Exibe as 6 funções definidas no kick-off de um serviço
 */

import { Users } from 'lucide-react'
import type { FuncaoServico } from '../types'

interface FuncoesServicoCardProps {
  funcoes: FuncaoServico[]
}

export function FuncoesServicoCard({ funcoes }: FuncoesServicoCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-purple-500 text-white p-4 flex items-center gap-3">
        <Users className="h-5 w-5" />
        <h3 className="font-semibold">Funcoes da Equipe do Servico</h3>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Funcoes definidas no Kick-off e registradas no sistema:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {funcoes.map((f, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="font-medium text-gray-900 text-sm">{f.funcao}</div>
              <div className="text-xs text-gray-600 mt-1">{f.responsabilidade}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
