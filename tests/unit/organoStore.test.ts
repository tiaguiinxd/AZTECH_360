/**
 * Testes do organoStore
 *
 * NOTA: Os dados reais vêm da API (ADR-004).
 * Estes testes validam o comportamento do store usando fixtures.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useOrganoStore } from '@/stores'
import { MOCK_COLABORADORES } from '../fixtures'

describe('organoStore', () => {
  beforeEach(() => {
    // Reset store to clean state before each test
    // Usar setColaboradores para inicializar com fixtures
    useOrganoStore.setState({
      colaboradores: [...MOCK_COLABORADORES],
      selectedId: null,
      expandedIds: [],
      filters: { search: '', setorId: null, nivelId: null },
      isLoading: false,
      error: null,
    })
  })

  describe('Estado Inicial', () => {
    it('deve ter colaboradores carregados', () => {
      const { colaboradores } = useOrganoStore.getState()
      expect(colaboradores).toHaveLength(MOCK_COLABORADORES.length)
    })

    it('deve iniciar sem colaborador selecionado', () => {
      const { selectedId } = useOrganoStore.getState()
      expect(selectedId).toBeNull()
    })

    it('deve iniciar com expandedIds vazio', () => {
      const { expandedIds } = useOrganoStore.getState()
      expect(expandedIds.length).toBe(0)
    })

    it('deve iniciar com filtros vazios', () => {
      const { filters } = useOrganoStore.getState()
      expect(filters.search).toBe('')
      expect(filters.setorId).toBeNull()
      expect(filters.nivelId).toBeNull()
    })
  })

  describe('CRUD de Colaboradores', () => {
    it('deve adicionar um novo colaborador', async () => {
      const { colaboradores: before } = useOrganoStore.getState()

      // Simular adição local (em produção usaria API)
      const newColaborador = {
        id: 100,
        nome: 'João Teste',
        cargo: 'Desenvolvedor',
        setorId: 5,
        nivelId: 4,
        permissoes: ['tecnico' as const],
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }

      useOrganoStore.setState((state) => ({
        colaboradores: [...state.colaboradores, newColaborador],
      }))

      const { colaboradores: after } = useOrganoStore.getState()

      expect(after.length).toBe(before.length + 1)
      expect(after.find((c) => c.id === 100)?.nome).toBe('João Teste')
    })

    it('deve atualizar um colaborador existente', () => {
      const { colaboradores } = useOrganoStore.getState()
      const firstId = colaboradores[0].id

      useOrganoStore.setState((state) => ({
        colaboradores: state.colaboradores.map((c) =>
          c.id === firstId ? { ...c, cargo: 'Novo Cargo' } : c
        ),
      }))

      const { colaboradores: updated } = useOrganoStore.getState()
      const updatedColaborador = updated.find((c) => c.id === firstId)

      expect(updatedColaborador?.cargo).toBe('Novo Cargo')
    })

    it('deve deletar um colaborador', () => {
      const { colaboradores: before } = useOrganoStore.getState()
      const firstId = before[0].id

      useOrganoStore.setState((state) => ({
        colaboradores: state.colaboradores.filter((c) => c.id !== firstId),
      }))

      const { colaboradores: after } = useOrganoStore.getState()
      expect(after.length).toBe(before.length - 1)
      expect(after.find((c) => c.id === firstId)).toBeUndefined()
    })
  })

  describe('Seleção', () => {
    it('deve selecionar um colaborador', () => {
      const { setSelectedId, colaboradores } = useOrganoStore.getState()
      const firstId = colaboradores[0].id

      setSelectedId(firstId)

      const { selectedId } = useOrganoStore.getState()
      expect(selectedId).toBe(firstId)
    })

    it('deve limpar a seleção', () => {
      const { setSelectedId, colaboradores } = useOrganoStore.getState()
      const firstId = colaboradores[0].id

      setSelectedId(firstId)
      setSelectedId(null)

      const { selectedId } = useOrganoStore.getState()
      expect(selectedId).toBeNull()
    })
  })

  describe('Expansão/Colapso', () => {
    it('deve expandir um nó', () => {
      const { toggleExpanded, colaboradores } = useOrganoStore.getState()
      const firstId = colaboradores[0].id

      toggleExpanded(firstId)

      const { expandedIds } = useOrganoStore.getState()
      expect(expandedIds.includes(firstId)).toBe(true)
    })

    it('deve colapsar um nó expandido', () => {
      const { toggleExpanded, colaboradores } = useOrganoStore.getState()
      const firstId = colaboradores[0].id

      toggleExpanded(firstId) // expand
      toggleExpanded(firstId) // collapse

      const { expandedIds } = useOrganoStore.getState()
      expect(expandedIds.includes(firstId)).toBe(false)
    })

    it('deve expandir todos os nós', () => {
      const { expandAll, colaboradores } = useOrganoStore.getState()

      expandAll()

      const { expandedIds } = useOrganoStore.getState()
      expect(expandedIds.length).toBe(colaboradores.length)
    })

    it('deve colapsar todos os nós', () => {
      const { expandAll, collapseAll } = useOrganoStore.getState()

      expandAll()
      collapseAll()

      const { expandedIds } = useOrganoStore.getState()
      expect(expandedIds.length).toBe(0)
    })
  })

  describe('Filtros', () => {
    it('deve aplicar filtro de busca', () => {
      const { setFilters } = useOrganoStore.getState()

      setFilters({ search: 'Samuel' })

      const { filters } = useOrganoStore.getState()
      expect(filters.search).toBe('Samuel')
    })

    it('deve aplicar filtro de setor', () => {
      const { setFilters } = useOrganoStore.getState()

      setFilters({ setorId: 5 }) // Engenharia

      const { filters } = useOrganoStore.getState()
      expect(filters.setorId).toBe(5)
    })

    it('deve aplicar filtro de nível', () => {
      const { setFilters } = useOrganoStore.getState()

      setFilters({ nivelId: 1 }) // Diretoria

      const { filters } = useOrganoStore.getState()
      expect(filters.nivelId).toBe(1)
    })

    it('deve limpar todos os filtros', () => {
      const { setFilters, clearFilters } = useOrganoStore.getState()

      setFilters({ search: 'test', setorId: 1, nivelId: 1 })
      clearFilters()

      const { filters } = useOrganoStore.getState()
      expect(filters.search).toBe('')
      expect(filters.setorId).toBeNull()
      expect(filters.nivelId).toBeNull()
    })
  })
})
