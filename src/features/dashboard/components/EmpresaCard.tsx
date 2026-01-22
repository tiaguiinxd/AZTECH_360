/**
 * EmpresaCard - Card de resumo por empresa
 */

import { Building2, Users, TrendingUp, CheckCircle } from 'lucide-react'
import type { ResumoEmpresaDashboard } from '@/types/dashboard'

interface EmpresaCardProps {
  data: ResumoEmpresaDashboard
}

export function EmpresaCard({ data }: EmpresaCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  // Cor baseada na empresa
  const isAzTech = data.empresa.toUpperCase().includes('AZ TECH')
  const bgColor = isAzTech ? 'bg-aztech-primary' : 'bg-indigo-600'

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className={`${bgColor} px-4 py-3`}>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-white" />
          <h3 className="font-semibold text-white">{data.empresa}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{data.total_projetos}</p>
          <p className="text-sm text-gray-500">projetos</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{data.projetos_em_andamento}</p>
              <p className="text-xs text-gray-500">em andamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{data.projetos_concluidos}</p>
              <p className="text-xs text-gray-500">concluidos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{data.colaboradores_alocados}</p>
              <p className="text-xs text-gray-500">alocados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-emerald-600">R$</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(data.valor_total)}</p>
              <p className="text-xs text-gray-500">carteira</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
