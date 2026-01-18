/**
 * OrgTree - Visualização hierárquica do organograma
 * Renderiza a árvore de colaboradores com conexões visuais
 */

import { memo, useMemo } from 'react'
import { cn } from '@/utils'
import type { Colaborador, ID } from '@/types'
import { OrgNode } from './OrgNode'

interface OrgTreeProps {
  colaboradores: Colaborador[]
  selectedId: ID | null
  expandedIds: ID[] // Usar Array ao invés de Set para serialização
  onSelect: (id: ID) => void
  onToggleExpand: (id: ID) => void
  onEdit?: (id: ID) => void
  onDelete?: (id: ID) => void
  className?: string
}

interface TreeNode {
  colaborador: Colaborador
  children: TreeNode[]
}

// Constrói a árvore hierárquica a partir da lista de colaboradores
function buildTree(colaboradores: Colaborador[]): TreeNode[] {
  const nodeMap = new Map<ID, TreeNode>()

  // Criar nós para todos colaboradores
  colaboradores.forEach((c) => {
    nodeMap.set(c.id, { colaborador: c, children: [] })
  })

  const roots: TreeNode[] = []

  // Construir relações pai-filho
  colaboradores.forEach((c) => {
    const node = nodeMap.get(c.id)!
    if (c.superiorId && nodeMap.has(c.superiorId)) {
      const parent = nodeMap.get(c.superiorId)!
      parent.children.push(node)
    } else {
      // Sem superior = raiz
      roots.push(node)
    }
  })

  // Ordenar filhos por nível e nome
  const sortChildren = (nodes: TreeNode[]) => {
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

// Componente recursivo para renderizar um nó e seus filhos
const OrgTreeNode = memo(function OrgTreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  node: TreeNode
  depth: number
  selectedId: ID | null
  expandedIds: ID[]
  onSelect: (id: ID) => void
  onToggleExpand: (id: ID) => void
  onEdit?: (id: ID) => void
  onDelete?: (id: ID) => void
}) {
  const { colaborador, children } = node
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.includes(colaborador.id)
  const isSelected = selectedId === colaborador.id

  return (
    <div className="flex flex-col items-center">
      {/* Linha vertical de cima (conecta ao pai) */}
      {depth > 0 && (
        <div className="w-px h-4 bg-gray-300" />
      )}

      {/* Node */}
      <OrgNode
        colaborador={colaborador}
        isSelected={isSelected}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onSelect={onSelect}
        onToggleExpand={onToggleExpand}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          {/* Linha vertical de baixo (conecta aos filhos) */}
          <div className="w-px h-4 bg-gray-300" />

          {/* Container horizontal dos filhos */}
          <div className="relative flex gap-6">
            {/* Linha horizontal conectando os filhos */}
            {children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-gray-300"
                style={{
                  left: '50%',
                  right: '50%',
                  transform: `translateX(-50%)`,
                  width: `calc(100% - 140px)`,
                }}
              />
            )}

            {/* Filhos */}
            {children.map((child) => (
              <OrgTreeNode
                key={child.colaborador.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export const OrgTree = memo(function OrgTree({
  colaboradores,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  className,
}: OrgTreeProps) {
  // Constrói a árvore a partir dos colaboradores
  const tree = useMemo(() => buildTree(colaboradores), [colaboradores])

  if (tree.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-gray-500">Nenhum colaborador encontrado</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-8 p-8',
        'overflow-auto',
        className
      )}
    >
      {tree.map((node) => (
        <OrgTreeNode
          key={node.colaborador.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
})

OrgTree.displayName = 'OrgTree'
