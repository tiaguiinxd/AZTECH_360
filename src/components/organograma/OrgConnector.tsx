/**
 * OrgConnector - Componente SVG para conexões entre nós do organograma
 * Desenha linhas curvas suaves entre pai e filhos
 */

import { memo } from 'react'

interface Point {
  x: number
  y: number
}

interface OrgConnectorProps {
  /** Ponto de origem (pai) */
  from: Point
  /** Ponto de destino (filho) */
  to: Point
  /** Cor da linha */
  color?: string
  /** Espessura da linha */
  strokeWidth?: number
  /** Se a conexão está destacada */
  highlighted?: boolean
}

/**
 * Gera o path SVG para uma curva Bezier entre dois pontos
 * Cria uma conexão suave no estilo "cotovelo arredondado"
 *
 * Suporta dois tipos de conexão:
 * 1. Vertical (pai acima do filho) - curva Bezier vertical
 * 2. Lateral (mesmo nível) - linha horizontal com pequena curva
 */
function generatePath(from: Point, to: Point): string {
  const deltaY = Math.abs(to.y - from.y)
  const deltaX = to.x - from.x

  // Se a diferença vertical é pequena (< 30px), é uma conexão lateral (mesmo nível)
  if (deltaY < 30) {
    // Conexão lateral - linha horizontal com pequenas curvas nas pontas
    const curveRadius = Math.min(10, Math.abs(deltaX) / 4)

    if (deltaX > 0) {
      // Indo para a direita
      return `M ${from.x} ${from.y}
              L ${from.x + curveRadius} ${from.y}
              Q ${from.x + curveRadius * 2} ${from.y}, ${from.x + curveRadius * 2} ${from.y - curveRadius}
              L ${from.x + curveRadius * 2} ${to.y + curveRadius}
              Q ${from.x + curveRadius * 2} ${to.y}, ${from.x + curveRadius * 3} ${to.y}
              L ${to.x} ${to.y}`
    } else {
      // Indo para a esquerda
      return `M ${from.x} ${from.y}
              L ${to.x} ${to.y}`
    }
  }

  // Conexão vertical padrão - curva Bezier vertical
  const midY = from.y + (to.y - from.y) / 2

  return `M ${from.x} ${from.y}
          C ${from.x} ${midY},
            ${to.x} ${midY},
            ${to.x} ${to.y}`
}

export const OrgConnector = memo(function OrgConnector({
  from,
  to,
  color = '#CBD5E1', // slate-300
  strokeWidth = 2,
  highlighted = false,
}: OrgConnectorProps) {
  const path = generatePath(from, to)

  return (
    <path
      d={path}
      fill="none"
      stroke={highlighted ? '#3B82F6' : color}
      strokeWidth={highlighted ? strokeWidth + 1 : strokeWidth}
      strokeLinecap="round"
      className="transition-all duration-200"
    />
  )
})

OrgConnector.displayName = 'OrgConnector'

/**
 * Container SVG para múltiplas conexões
 * Deve envolver todos os OrgConnector
 */
interface OrgConnectorLayerProps {
  width: number
  height: number
  children: React.ReactNode
  className?: string
}

export const OrgConnectorLayer = memo(function OrgConnectorLayer({
  width,
  height,
  children,
  className,
}: OrgConnectorLayerProps) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  )
})

OrgConnectorLayer.displayName = 'OrgConnectorLayer'
