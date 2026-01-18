/**
 * Testes do componente OrgNode
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrgNode } from '@/components/organograma'
import type { Colaborador } from '@/types'

const mockColaborador: Colaborador = {
  id: 1,
  nome: 'João Silva',
  cargo: 'Desenvolvedor',
  setorId: 5, // Engenharia
  nivelId: 4, // Supervisão
  permissoes: ['tecnico'],
  criadoEm: '2026-01-01T00:00:00.000Z',
  atualizadoEm: '2026-01-01T00:00:00.000Z',
}

describe('OrgNode', () => {
  it('deve renderizar o nome do colaborador', () => {
    render(<OrgNode colaborador={mockColaborador} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('deve renderizar o cargo do colaborador', () => {
    render(<OrgNode colaborador={mockColaborador} />)
    expect(screen.getByText('Desenvolvedor')).toBeInTheDocument()
  })

  it('deve renderizar as iniciais do colaborador', () => {
    render(<OrgNode colaborador={mockColaborador} />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('deve chamar onSelect ao clicar', () => {
    const onSelect = vi.fn()
    render(<OrgNode colaborador={mockColaborador} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(mockColaborador.id)
  })

  it('deve mostrar botão de expandir quando hasChildren=true', () => {
    render(<OrgNode colaborador={mockColaborador} hasChildren={true} />)

    const expandButton = screen.getByLabelText(/expandir subordinados/i)
    expect(expandButton).toBeInTheDocument()
  })

  it('deve chamar onToggleExpand ao clicar no botão de expandir', () => {
    const onToggleExpand = vi.fn()
    render(
      <OrgNode
        colaborador={mockColaborador}
        hasChildren={true}
        onToggleExpand={onToggleExpand}
      />
    )

    fireEvent.click(screen.getByLabelText(/expandir subordinados/i))
    expect(onToggleExpand).toHaveBeenCalledWith(mockColaborador.id)
  })

  it('deve mostrar estado selecionado corretamente', () => {
    const { container } = render(
      <OrgNode colaborador={mockColaborador} isSelected={true} />
    )

    const node = container.firstChild as HTMLElement
    // Card selecionado tem ring de destaque
    expect(node).toHaveClass('ring-2')
  })

  it('deve ter atributo aria-selected correto', () => {
    render(<OrgNode colaborador={mockColaborador} isSelected={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-selected', 'true')
  })
})
