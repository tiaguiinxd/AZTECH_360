/**
 * DisponibilidadeList - Lista de disponibilidade de pessoal
 */

import { User, Briefcase } from 'lucide-react'
import type { DisponibilidadeColaborador } from '@/types/dashboard'

interface DisponibilidadeListProps {
  data: DisponibilidadeColaborador[]
}

function OccupancyBar({ percent }: { percent: number }) {
  const getColor = (p: number) => {
    if (p >= 100) return 'bg-red-500'
    if (p >= 80) return 'bg-amber-500'
    if (p >= 50) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className={`h-full transition-all ${getColor(percent)}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-gray-700">
        {percent}%
      </span>
    </div>
  )
}

export function DisponibilidadeList({ data }: DisponibilidadeListProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-500">
        Nenhum colaborador encontrado
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-auto">
      <table className="min-w-full">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
              Colaborador
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
              Cargo
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
              Setor
            </th>
            <th className="w-40 px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
              Ocupacao
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium uppercase text-gray-500">
              Projetos
            </th>
            <th className="px-4 py-2 text-center text-xs font-medium uppercase text-gray-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((colab) => (
            <tr key={colab.colaborador_id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{colab.nome}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {colab.cargo}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {colab.setor}
              </td>
              <td className="px-4 py-3">
                <OccupancyBar percent={colab.percentual_ocupado} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{colab.projetos_ativos}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center">
                {colab.disponivel ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                    Disponivel
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    Ocupado
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
