/**
 * Tabela de mapeamento Setor x Fase
 *
 * Exibe uma matriz mostrando a participação de cada setor em cada fase
 */

import type { MapeamentoSetorFase } from '../types'
import { ResponsavelBadge } from './ResponsavelBadge'

interface MapeamentoSetorTableProps {
  dados: MapeamentoSetorFase[]
}

export function MapeamentoSetorTable({ dados }: MapeamentoSetorTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Setor
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
              Pre-Servico
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-amber-50">
              Preparacao
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50">
              Kick-off
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
              Execucao
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((row) => (
            <tr key={row.setor} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <ResponsavelBadge setor={row.setor} />
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700 bg-blue-50/30">
                {row.preServico === '-' ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  row.preServico
                )}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700 bg-amber-50/30">
                {row.preparacao === '-' ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  row.preparacao
                )}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700 bg-purple-50/30">
                {row.kickoff === '-' ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  row.kickoff
                )}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-700 bg-green-50/30">
                {row.execucao === '-' ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  row.execucao
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
