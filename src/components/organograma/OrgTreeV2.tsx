/**
 * OrgTreeV2 - Visualização hierárquica aprimorada do organograma
 *
 * LAYOUT BASEADO EM NÍVEL HIERÁRQUICO (nivel_id):
 * - A posição Y é calculada pelo nivel_id do colaborador
 * - Colaboradores com o mesmo nivel_id ficam na mesma linha horizontal
 * - Isso representa corretamente a estrutura hierárquica da empresa
 * - Ex: Diretores (nivel=1) na linha 1, Gerentes (nivel=2) na linha 2, etc.
 *
 * ADR-005: Posicionamento vertical do organograma baseado em nivel_id
 * - Isso corrige o problema onde subordinados apareciam na mesma altura
 *   que colaboradores de níveis diferentes
 *
 * INDICADORES DE NÍVEL:
 * - Mostra os nomes dos níveis hierárquicos (Diretoria, Gerência, etc.)
 * - Cada linha representa um nível hierárquico específico
 */

import { memo, useMemo, useRef, useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/utils'
import type { Colaborador, ID } from '@/types'
import { useConfigStore, selectNiveis } from '@/stores/configStore'
import { OrgNode } from './OrgNode'
import { OrgConnector, OrgConnectorLayer } from './OrgConnector'

// Constantes de layout
const NODE_WIDTH = 220
const NODE_HEIGHT = 76 // Altura do card OrgNode
const HORIZONTAL_GAP = 24
const LEVEL_HEIGHT = 120 // Altura fixa entre níveis hierárquicos
const PADDING_TOP = 30
const PADDING_LEFT = 140 // Espaço para os labels de nível
const PADDING_RIGHT = 50

// NUM_LEVELS agora é dinâmico baseado no configStore

interface OrgTreeV2Props {
  colaboradores: Colaborador[]
  selectedId: ID | null
  expandedIds: ID[]
  onSelect: (id: ID) => void
  onToggleExpand: (id: ID) => void
  onEdit?: (id: ID) => void
  onDelete?: (id: ID) => void
  className?: string
  // Props para modo de edição/versionamento
  isEditable?: boolean
  onInlineEdit?: (id: ID, updates: { nome?: string; cargo?: string }) => void
}

interface PositionedNode {
  colaborador: Colaborador
  x: number
  y: number
  children: PositionedNode[]
  subtreeWidth: number
}

interface Connection {
  fromId: ID
  toId: ID
  fromX: number
  fromY: number
  toX: number
  toY: number
}

// Constrói a árvore hierárquica a partir da lista de colaboradores
function buildTree(colaboradores: Colaborador[]): PositionedNode[] {
  const nodeMap = new Map<ID, PositionedNode>()

  // Criar nós para todos colaboradores
  colaboradores.forEach((c) => {
    nodeMap.set(c.id, {
      colaborador: c,
      x: 0,
      y: 0,
      children: [],
      subtreeWidth: NODE_WIDTH,
    })
  })

  const roots: PositionedNode[] = []

  // Construir relações pai-filho
  colaboradores.forEach((c) => {
    const node = nodeMap.get(c.id)!
    if (c.superiorId && nodeMap.has(c.superiorId)) {
      const parent = nodeMap.get(c.superiorId)!
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Ordenar filhos por nível e nome
  const sortChildren = (nodes: PositionedNode[]) => {
    nodes.sort((a, b) => {
      const nivelDiff = a.colaborador.nivelId - b.colaborador.nivelId
      if (nivelDiff !== 0) return nivelDiff
      return a.colaborador.nome.localeCompare(b.colaborador.nome)
    })
    nodes.forEach((n) => sortChildren(n.children))
  }

  sortChildren(roots)
  return roots
}

// Calcula a largura da subárvore recursivamente
// Todos os filhos diretos são posicionados lado a lado horizontalmente
// IMPORTANTE: Quando pai e filho têm o mesmo nivel_id, eles ficam lado a lado
// (não empilhados verticalmente), então a largura deve somar ambos
function calculateSubtreeWidth(node: PositionedNode, expandedIds: ID[]): number {
  const isExpanded = expandedIds.includes(node.colaborador.id)

  if (!isExpanded || node.children.length === 0) {
    node.subtreeWidth = NODE_WIDTH
    return NODE_WIDTH
  }

  // Calcular largura somando todas as subárvores dos filhos
  let childrenWidth = 0
  node.children.forEach((child, index) => {
    childrenWidth += calculateSubtreeWidth(child, expandedIds)
    if (index < node.children.length - 1) {
      childrenWidth += HORIZONTAL_GAP
    }
  })

  // Verificar se há filhos no mesmo nível do pai
  // Se sim, o pai e os filhos ficam lado a lado, então precisamos
  // somar a largura do pai com a dos filhos do mesmo nível
  const sameNivelChildren = node.children.filter(
    child => child.colaborador.nivelId === node.colaborador.nivelId
  )

  if (sameNivelChildren.length > 0) {
    // Pai e filhos do mesmo nível ficam lado a lado
    // Largura = NODE_WIDTH (pai) + GAP + largura dos filhos do mesmo nível
    let sameNivelWidth = NODE_WIDTH + HORIZONTAL_GAP
    sameNivelChildren.forEach((child, index) => {
      sameNivelWidth += child.subtreeWidth
      if (index < sameNivelChildren.length - 1) {
        sameNivelWidth += HORIZONTAL_GAP
      }
    })

    // Filhos de outros níveis ficam centralizados sob o grupo pai+filhos_mesmo_nivel
    const otherNivelChildren = node.children.filter(
      child => child.colaborador.nivelId !== node.colaborador.nivelId
    )
    let otherNivelWidth = 0
    otherNivelChildren.forEach((child, index) => {
      otherNivelWidth += child.subtreeWidth
      if (index < otherNivelChildren.length - 1) {
        otherNivelWidth += HORIZONTAL_GAP
      }
    })

    node.subtreeWidth = Math.max(sameNivelWidth, otherNivelWidth)
  } else {
    node.subtreeWidth = Math.max(NODE_WIDTH, childrenWidth)
  }

  return node.subtreeWidth
}

// Calcula posições X e Y dos nós
// Y é baseado no NIVEL_ID do colaborador (nível hierárquico)
// Isso garante que colaboradores do mesmo nível fiquem alinhados horizontalmente
// Ex: Todos os Diretores (nivel=1) ficam na linha 1, Gerentes (nivel=2) na linha 2
function calculatePositions(
  nodes: PositionedNode[],
  expandedIds: ID[],
  startX: number,
  nivelIndexMap: Map<number, number>
): { maxX: number; maxY: number; usedNivelIds: Set<number> } {
  let maxX = startX
  let maxY = 0
  const usedNivelIds = new Set<number>()

  // Calcular larguras das subárvores
  nodes.forEach((node) => {
    calculateSubtreeWidth(node, expandedIds)
  })

  // Posicionar nós recursivamente
  // Y é baseado no nivel_id do colaborador (nível hierárquico)
  function positionNode(node: PositionedNode, x: number) {
    // Y é baseado no ÍNDICE ORDENADO do nível (usando campo 'ordem')
    // Níveis são ordenados por 'ordem', não por nivel_id
    const nivelIndex = nivelIndexMap.get(node.colaborador.nivelId) ?? 0
    node.y = PADDING_TOP + nivelIndex * LEVEL_HEIGHT

    const isExpanded = expandedIds.includes(node.colaborador.id)

    // Separar filhos do mesmo nível e de outros níveis
    const sameNivelChildren = isExpanded
      ? node.children.filter(c => c.colaborador.nivelId === node.colaborador.nivelId)
      : []
    const otherNivelChildren = isExpanded
      ? node.children.filter(c => c.colaborador.nivelId !== node.colaborador.nivelId)
      : []

    if (sameNivelChildren.length > 0) {
      // Pai e filhos do mesmo nível ficam lado a lado na mesma linha
      // O pai fica à esquerda
      node.x = x

      // Filhos do mesmo nível ficam à direita do pai
      let childX = x + NODE_WIDTH + HORIZONTAL_GAP
      sameNivelChildren.forEach((child) => {
        positionNode(child, childX)
        childX += child.subtreeWidth + HORIZONTAL_GAP
      })

      // Filhos de outros níveis ficam centralizados sob todo o grupo
      if (otherNivelChildren.length > 0) {
        let otherChildrenWidth = 0
        otherNivelChildren.forEach((child, index) => {
          otherChildrenWidth += child.subtreeWidth
          if (index < otherNivelChildren.length - 1) {
            otherChildrenWidth += HORIZONTAL_GAP
          }
        })

        let otherChildX = x + (node.subtreeWidth - otherChildrenWidth) / 2
        otherNivelChildren.forEach((child) => {
          positionNode(child, otherChildX)
          otherChildX += child.subtreeWidth + HORIZONTAL_GAP
        })
      }
    } else {
      // Comportamento padrão: X é centralizado na subárvore
      node.x = x + (node.subtreeWidth - NODE_WIDTH) / 2

      if (isExpanded && node.children.length > 0) {
        // Posicionar filhos lado a lado
        let childX = x
        node.children.forEach((child) => {
          positionNode(child, childX)
          childX += child.subtreeWidth + HORIZONTAL_GAP
        })
      }
    }

    maxX = Math.max(maxX, node.x + NODE_WIDTH)
    maxY = Math.max(maxY, node.y + NODE_HEIGHT)
    usedNivelIds.add(node.colaborador.nivelId)
  }

  // Posicionar todas as raízes
  let currentX = startX
  nodes.forEach((node) => {
    positionNode(node, currentX)
    currentX += node.subtreeWidth + HORIZONTAL_GAP
  })

  return { maxX, maxY, usedNivelIds }
}

// Coleta todas as conexões da árvore
// Conexões podem ser verticais (pai acima do filho) ou laterais (mesmo nível)
function collectConnections(
  nodes: PositionedNode[],
  expandedIds: ID[]
): Connection[] {
  const connections: Connection[] = []

  function traverse(node: PositionedNode) {
    const isExpanded = expandedIds.includes(node.colaborador.id)

    if (isExpanded && node.children.length > 0) {
      node.children.forEach((child) => {
        const isSameNivel = node.colaborador.nivelId === child.colaborador.nivelId

        if (isSameNivel) {
          // Conexão lateral: sai do lado direito do pai, entra no lado esquerdo do filho
          connections.push({
            fromId: node.colaborador.id,
            toId: child.colaborador.id,
            fromX: node.x + NODE_WIDTH,
            fromY: node.y + NODE_HEIGHT / 2,
            toX: child.x,
            toY: child.y + NODE_HEIGHT / 2,
          })
        } else {
          // Conexão vertical: sai do fundo do pai, entra no topo do filho
          connections.push({
            fromId: node.colaborador.id,
            toId: child.colaborador.id,
            fromX: node.x + NODE_WIDTH / 2,
            fromY: node.y + NODE_HEIGHT,
            toX: child.x + NODE_WIDTH / 2,
            toY: child.y,
          })
        }
        traverse(child)
      })
    }
  }

  nodes.forEach(traverse)
  return connections
}

// Coleta todos os nós visíveis
function collectVisibleNodes(
  nodes: PositionedNode[],
  expandedIds: ID[]
): PositionedNode[] {
  const visible: PositionedNode[] = []

  function traverse(node: PositionedNode) {
    visible.push(node)
    const isExpanded = expandedIds.includes(node.colaborador.id)

    if (isExpanded) {
      node.children.forEach(traverse)
    }
  }

  nodes.forEach(traverse)
  return visible
}

// Componente de controles de zoom
const ZoomControls = memo(function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
      <button
        onClick={onZoomIn}
        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-colors"
        title="Aumentar zoom"
      >
        <ZoomIn className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-colors"
        title="Diminuir zoom"
      >
        <ZoomOut className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={onReset}
        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-colors"
        title="Resetar visualização"
      >
        <Maximize2 className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  )
})

// Informação de nível para cada linha do organograma
interface NivelLineInfo {
  nivelId: number
  nivelNome: string
  nivelCor: string
  ordenIndex: number // Índice baseado no campo 'ordem' (0-based)
}

// Componente de indicadores de nível (linhas de fundo para cada nível hierárquico)
const LevelIndicators = memo(function LevelIndicators({
  width,
  nivelLineMap,
}: {
  width: number
  nivelLineMap: NivelLineInfo[]
}) {
  return (
    <>
      {nivelLineMap.map(({ nivelId, nivelNome, nivelCor, ordenIndex }) => {
        // Y é baseado no índice da ordem configurada (0 = topo, 1 = segunda linha, etc.)
        const y = PADDING_TOP + ordenIndex * LEVEL_HEIGHT

        return (
          <div
            key={nivelId}
            className="absolute flex items-center pointer-events-none"
            style={{
              top: y,
              left: 0,
              height: NODE_HEIGHT,
              width: width,
            }}
          >
            {/* Linha de fundo sutil */}
            <div
              className="absolute h-px bg-gray-100"
              style={{
                left: PADDING_LEFT,
                right: 0,
                top: NODE_HEIGHT / 2,
              }}
            />

            {/* Label do nível hierárquico com nome e cor */}
            <div
              className="absolute px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap border"
              style={{
                left: 8,
                top: (NODE_HEIGHT - 22) / 2,
                backgroundColor: `${nivelCor}15`,
                borderColor: `${nivelCor}40`,
                color: nivelCor,
              }}
            >
              {nivelNome}
            </div>
          </div>
        )
      })}
    </>
  )
})

export const OrgTreeV2 = memo(function OrgTreeV2({
  colaboradores,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  className,
  isEditable = false,
  onInlineEdit,
}: OrgTreeV2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [, setDimensions] = useState({ width: 0, height: 0 })

  // Carregar níveis do configStore para mostrar nomes significativos
  const niveis = useConfigStore(useShallow(selectNiveis))

  // Constrói e calcula layout da árvore
  const { tree, connections, visibleNodes, canvasSize, nivelLineMap } = useMemo(() => {
    const tree = buildTree(colaboradores)

    // Criar mapa de nivelId → índice ordenado (usando campo 'ordem')
    // Níveis ordenados por 'ordem' crescente
    const niveisOrdenados = [...niveis].sort((a, b) => a.ordem - b.ordem)
    const nivelIndexMap = new Map<number, number>(
      niveisOrdenados.map((nivel, index) => [nivel.id, index])
    )

    // Calcular posições (cards começam após PADDING_LEFT)
    // Y é baseado no índice do nível na ordem configurada
    const { maxX, maxY, usedNivelIds } = calculatePositions(tree, expandedIds, PADDING_LEFT, nivelIndexMap)

    // Coletar conexões e nós visíveis
    const connections = collectConnections(tree, expandedIds)
    const visibleNodes = collectVisibleNodes(tree, expandedIds)

    // Criar array de informações de nível para cada nivel_id usado
    // Ordenado pelo campo 'ordem' (configurável pelo usuário)
    const niveisUsados = Array.from(usedNivelIds)
      .map(nivelId => niveis.find(n => n.id === nivelId))
      .filter((n): n is NonNullable<typeof n> => n !== undefined)
      .sort((a, b) => a.ordem - b.ordem)

    const nivelLineMap: NivelLineInfo[] = niveisUsados.map((nivel, index) => ({
      nivelId: nivel.id,
      nivelNome: nivel.nome || `Nível ${nivel.id}`,
      nivelCor: nivel.cor || '#6B7280',
      ordenIndex: index, // 0 = topo, 1 = segundo, etc.
    }))

    // Canvas deve acomodar todos os níveis renderizados
    // Altura baseada no número de níveis visíveis, não no nivelId
    const numNiveisVisiveis = nivelLineMap.length || 1
    const minHeight = PADDING_TOP + (numNiveisVisiveis * LEVEL_HEIGHT) + 50

    return {
      tree,
      connections,
      visibleNodes,
      canvasSize: {
        width: Math.max(maxX + PADDING_RIGHT, 800),
        height: Math.max(maxY + PADDING_TOP + 50, minHeight),
      },
      nivelLineMap,
    }
  }, [colaboradores, expandedIds, niveis])

  // Atualizar dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  if (tree.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-gray-500">Nenhum colaborador encontrado</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full', className)}>
      <TransformWrapper
        initialScale={0.85}
        minScale={0.3}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <ZoomControls
              onZoomIn={() => zoomIn()}
              onZoomOut={() => zoomOut()}
              onReset={() => resetTransform()}
            />

            {/* Indicador de arrastar */}
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-gray-400 z-10">
              <Move className="h-3 w-3" />
              <span>Arraste para mover</span>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            >
              <div
                className="relative"
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                }}
              >
                {/* Indicadores de nível (linhas de fundo com nomes dos níveis) */}
                <LevelIndicators
                  width={canvasSize.width}
                  nivelLineMap={nivelLineMap}
                />

                {/* Camada de conexões SVG */}
                <OrgConnectorLayer
                  width={canvasSize.width}
                  height={canvasSize.height}
                >
                  {connections.map((conn) => (
                    <OrgConnector
                      key={`${conn.fromId}-${conn.toId}`}
                      from={{ x: conn.fromX, y: conn.fromY }}
                      to={{ x: conn.toX, y: conn.toY }}
                      highlighted={
                        selectedId === conn.fromId || selectedId === conn.toId
                      }
                    />
                  ))}
                </OrgConnectorLayer>

                {/* Camada de nós */}
                {visibleNodes.map((node) => (
                  <div
                    key={node.colaborador.id}
                    className="absolute transition-all duration-300"
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_WIDTH,
                    }}
                  >
                    <OrgNode
                      colaborador={node.colaborador}
                      isSelected={selectedId === node.colaborador.id}
                      isExpanded={expandedIds.includes(node.colaborador.id)}
                      hasChildren={node.children.length > 0}
                      onSelect={onSelect}
                      onToggleExpand={onToggleExpand}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isEditable={isEditable}
                      onInlineEdit={onInlineEdit}
                    />
                  </div>
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
})

OrgTreeV2.displayName = 'OrgTreeV2'
