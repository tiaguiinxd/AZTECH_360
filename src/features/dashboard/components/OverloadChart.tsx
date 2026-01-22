/**
 * OverloadChart - Grafico de sobrecarga temporal (ocupacao ao longo dos meses)
 */

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { SobrecargaMensal } from '@/types/dashboard'

interface OverloadChartProps {
  data: SobrecargaMensal[]
  ano: number
}

export function OverloadChart({ data, ano }: OverloadChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      // Retornar dados vazios para todos os meses
      const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return MESES.map((mes, index) => ({
        nome_mes: mes,
        percentual_ocupacao: 0,
        total_pessoas: 0,
        sobrecarga: false,
      }))
    }
    return data
  }, [data])

  // Encontrar pico de sobrecarga
  const picoSobrecarga = useMemo(() => {
    return chartData.reduce((max, item) =>
      item.percentual_ocupacao > max.percentual_ocupacao ? item : max
    , chartData[0])
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Nenhum dado de sobrecarga para {ano}
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorSobrecarga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="nome_mes"
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis
            label={{ value: 'Ocupação (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]?.payload as SobrecargaMensal
              if (!item) return null
              return (
                <div className="rounded-lg border bg-white p-3 shadow-lg">
                  <p className="font-semibold text-gray-900">{item.nome_mes} {ano}</p>
                  <p className="text-sm text-gray-600">
                    {item.total_pessoas} {item.total_pessoas === 1 ? 'pessoa' : 'pessoas'} alocada{item.total_pessoas === 1 ? '' : 's'}
                  </p>
                  <p className={`mt-1 text-lg font-bold ${item.sobrecarga ? 'text-red-600' : 'text-blue-600'}`}>
                    {item.percentual_ocupacao.toFixed(1)}% ocupação
                  </p>
                  {item.sobrecarga && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      ⚠️ Sobrecarga detectada
                    </p>
                  )}
                </div>
              )
            }}
          />
          {/* Linha de referencia em 100% */}
          <ReferenceLine
            y={100}
            label="100%"
            stroke="#EF4444"
            strokeDasharray="3 3"
          />
          <Area
            type="monotone"
            dataKey="percentual_ocupacao"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorOcupacao)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Info sobre pico */}
      {picoSobrecarga.sobrecarga && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-600">Pico de sobrecarga:</span>
          <span className="font-semibold text-red-600">
            {picoSobrecarga.nome_mes} ({picoSobrecarga.percentual_ocupacao.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  )
}
