/**
 * TimelineChart - Grafico de linha temporal (Gantt simples)
 */

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { TimelineItemDashboard } from '@/types/dashboard'

interface TimelineChartProps {
  data: TimelineItemDashboard[]
  ano: number
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const STATUS_COLORS: Record<string, string> = {
  planejado: '#6B7280',
  em_andamento: '#3B82F6',
  concluido: '#10B981',
  cancelado: '#EF4444',
  pausado: '#F59E0B',
}

interface GanttItem {
  nome: string
  codigo: string
  empresa: string
  offset: number // meses antes do inicio (para posicionar)
  duracao: number // duracao em meses
  mesInicio: number // mes de inicio (1-12)
  mesFim: number // mes de fim (1-12)
  status: string
  alocados: number
}

export function TimelineChart({ data, ano }: TimelineChartProps) {
  const ganttData = useMemo(() => {
    return data
      .filter((p) => p.data_inicio && p.data_fim)
      .map((p): GanttItem => {
        const dataInicio = new Date(p.data_inicio!)
        const dataFim = new Date(p.data_fim!)

        // Calcular mes de inicio (1-12) dentro do ano
        let mesInicio = dataInicio.getMonth() + 1
        if (dataInicio.getFullYear() < ano) mesInicio = 1
        if (dataInicio.getFullYear() > ano) mesInicio = 13 // fora do ano

        // Calcular mes de fim (1-12) dentro do ano
        let mesFim = dataFim.getMonth() + 1
        if (dataFim.getFullYear() < ano) mesFim = 0 // fora do ano
        if (dataFim.getFullYear() > ano) mesFim = 12

        // Se projeto está fora do ano selecionado, pular
        if (mesInicio > 12 || mesFim < 1) {
          return null as unknown as GanttItem
        }

        // Ajustar limites
        mesInicio = Math.max(1, mesInicio)
        mesFim = Math.min(12, mesFim)

        const duracao = Math.max(1, mesFim - mesInicio + 1)
        const offset = mesInicio - 1 // offset começa em 0

        return {
          nome: p.nome.length > 30 ? `${p.nome.substring(0, 27)}...` : p.nome,
          codigo: p.codigo,
          empresa: p.empresa,
          offset,
          duracao,
          mesInicio,
          mesFim,
          status: p.status,
          alocados: p.total_alocados,
        }
      })
      .filter(Boolean) // Remover nulls
      .slice(0, 20) // Limitar a 20 projetos para visualizacao
  }, [data, ano])

  if (ganttData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Nenhum projeto com datas definidas para {ano}
      </div>
    )
  }

  return (
    <div style={{ height: Math.max(400, ganttData.length * 28 + 60) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={ganttData}
          margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
          barSize={18}
        >
          <XAxis
            type="number"
            domain={[0, 12]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            tickFormatter={(v) => (v === 0 ? '' : MESES[v - 1] || '')}
          />
          <YAxis
            type="category"
            dataKey="codigo"
            width={130}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]?.payload as GanttItem
              if (!item) return null
              return (
                <div className="rounded-lg border bg-white p-3 shadow-lg">
                  <p className="font-semibold text-gray-900">{item.nome}</p>
                  <p className="text-sm text-gray-600">{item.codigo}</p>
                  <p className="mt-1 text-sm font-medium">
                    {MESES[item.mesInicio - 1]} - {MESES[item.mesFim - 1]} ({item.duracao} {item.duracao === 1 ? 'mes' : 'meses'})
                  </p>
                  <p className="text-sm text-gray-500">{item.empresa}</p>
                  {item.alocados > 0 && (
                    <p className="text-sm text-blue-600">{item.alocados} alocados</p>
                  )}
                </div>
              )
            }}
          />
          {/* Barra invisivel para offset (posicionamento) */}
          <Bar
            dataKey="offset"
            stackId="gantt"
            fill="transparent"
          />
          {/* Barra colorida para duracao */}
          <Bar
            dataKey="duracao"
            stackId="gantt"
            radius={[4, 4, 4, 4]}
          >
            {ganttData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status] || '#6B7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
