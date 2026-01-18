/**
 * Testes de Integração - useApiSync Hook
 *
 * Testa o hook de sincronização incluindo polling (ADR-006).
 * Verifica fluxo completo de carregamento e atualização de dados.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiSync } from '@/hooks/useApiSync'
import { useOrganoStore } from '@/stores/organoStore'
import { useConfigStore } from '@/stores/configStore'
import { installMockFetch, uninstallMockFetch, MOCK_COLABORADORES_API } from '../mocks/api'

describe('useApiSync Integration', () => {
  let mockFetch: ReturnType<typeof installMockFetch>

  beforeEach(() => {
    mockFetch = installMockFetch()

    // Reset stores
    useOrganoStore.setState({
      colaboradores: [],
      selectedId: null,
      expandedIds: [],
      filters: { search: '', setorId: null, nivelId: null },
      isLoading: false,
      error: null,
    })

    useConfigStore.setState({
      setores: [],
      subsetores: [],
      niveis: [],
      cargos: [],
      tiposProjeto: [],
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    uninstallMockFetch()
  })

  describe('loadFromApi', () => {
    it('deve carregar dados da API para os stores', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      await act(async () => {
        await result.current.loadFromApi()
      })

      // Verifica se colaboradores foram carregados no organoStore
      const organoState = useOrganoStore.getState()
      expect(organoState.colaboradores.length).toBeGreaterThan(0)

      // Verifica se setores foram carregados no configStore
      const configState = useConfigStore.getState()
      expect(configState.setores.length).toBeGreaterThan(0)
      expect(configState.niveis.length).toBeGreaterThan(0)
    })

    it('deve converter dados da API para formato do store', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      await act(async () => {
        await result.current.loadFromApi()
      })

      const { colaboradores } = useOrganoStore.getState()
      const primeiro = colaboradores[0]

      // Deve estar em camelCase (formato do store)
      expect(primeiro).toHaveProperty('setorId')
      expect(primeiro).toHaveProperty('nivelId')
      expect(primeiro).not.toHaveProperty('setor_id')
    })

    it('deve retornar true em sucesso e false em erro', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      let sucesso: boolean | undefined
      await act(async () => {
        sucesso = await result.current.loadFromApi()
      })

      expect(sucesso).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('deve tratar erro de API graciosamente', async () => {
      uninstallMockFetch()
      mockFetch = installMockFetch({ errorRoutes: ['/colaboradores'], errorStatus: 500 })

      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      await act(async () => {
        await result.current.loadFromApi()
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Polling (ADR-006)', () => {
    it('deve iniciar polling quando pollingEnabled=true', async () => {
      const { result } = renderHook(() =>
        useApiSync({ pollingEnabled: true, pollingInterval: 1000 })
      )

      expect(result.current.isPolling).toBe(true)
    })

    it('não deve iniciar polling quando pollingEnabled=false', async () => {
      const { result } = renderHook(() =>
        useApiSync({ pollingEnabled: false })
      )

      expect(result.current.isPolling).toBe(false)
    })

    it('deve formatar lastUpdated corretamente após refresh', async () => {
      const { result } = renderHook(() =>
        useApiSync({ pollingEnabled: false })
      )

      // Força refresh manual
      await act(async () => {
        await result.current.refresh()
      })

      // Deve ter formato legível
      expect(result.current.lastUpdatedFormatted).toBeTruthy()
      expect(typeof result.current.lastUpdatedFormatted).toBe('string')
      expect(result.current.lastUpdated).not.toBeNull()
    })

    it('refresh deve forçar atualização imediata', async () => {
      const { result } = renderHook(() =>
        useApiSync({ pollingEnabled: false })
      )

      // Store começa vazio
      expect(useOrganoStore.getState().colaboradores.length).toBe(0)

      await act(async () => {
        await result.current.refresh()
      })

      // Após refresh, dados devem estar carregados
      expect(useOrganoStore.getState().colaboradores.length).toBeGreaterThan(0)
    })

    it('deve expor funções startPolling e stopPolling', () => {
      const { result } = renderHook(() =>
        useApiSync({ pollingEnabled: false })
      )

      expect(typeof result.current.startPolling).toBe('function')
      expect(typeof result.current.stopPolling).toBe('function')
    })
  })

  describe('CRUD Operations', () => {
    it('saveColaborador deve criar e retornar novo colaborador', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      const novoColaborador = {
        nome: 'Teste Save',
        cargo: 'Cargo Teste',
        setorId: 5,
        nivelId: 4,
        permissoes: ['tecnico' as const],
      }

      let criado
      await act(async () => {
        criado = await result.current.saveColaborador(novoColaborador)
      })

      expect(criado).toBeDefined()
      expect(criado!.nome).toBe('Teste Save')
      expect(criado!.id).toBeGreaterThan(0)
    })

    it('updateColaborador deve atualizar colaborador existente', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      let atualizado
      await act(async () => {
        atualizado = await result.current.updateColaborador(1, {
          cargo: 'Cargo Atualizado via Hook',
        })
      })

      expect(atualizado).toBeDefined()
      expect(atualizado!.cargo).toBe('Cargo Atualizado via Hook')
    })

    it('deleteColaborador deve remover colaborador', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      // Carrega dados primeiro
      await act(async () => {
        await result.current.loadFromApi()
      })

      let sucesso
      await act(async () => {
        sucesso = await result.current.deleteColaborador(1)
      })

      expect(sucesso).toBe(true)
    })
  })

  describe('checkApi', () => {
    it('deve verificar disponibilidade da API com health endpoint', async () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      // O mock padrão retorna sucesso para /health
      let disponivel
      await act(async () => {
        disponivel = await result.current.checkApi()
      })

      // checkApiHealth faz fetch para /health que o mock responde
      expect(typeof disponivel).toBe('boolean')
    })

    it('deve retornar false quando API indisponível', async () => {
      uninstallMockFetch()
      mockFetch = installMockFetch({ errorRoutes: ['/health'], errorStatus: 500 })

      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      let disponivel
      await act(async () => {
        disponivel = await result.current.checkApi()
      })

      expect(disponivel).toBe(false)
      expect(result.current.apiAvailable).toBe(false)
    })
  })

  describe('Estado do Hook', () => {
    it('deve expor todas as propriedades necessárias', () => {
      const { result } = renderHook(() => useApiSync({ pollingEnabled: false }))

      // Estado
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('apiAvailable')

      // API Operations
      expect(result.current).toHaveProperty('checkApi')
      expect(result.current).toHaveProperty('loadFromApi')
      expect(result.current).toHaveProperty('saveColaborador')
      expect(result.current).toHaveProperty('updateColaborador')
      expect(result.current).toHaveProperty('deleteColaborador')

      // Polling (ADR-006)
      expect(result.current).toHaveProperty('lastUpdated')
      expect(result.current).toHaveProperty('lastUpdatedFormatted')
      expect(result.current).toHaveProperty('isPolling')
      expect(result.current).toHaveProperty('isFetching')
      expect(result.current).toHaveProperty('pollingError')
      expect(result.current).toHaveProperty('startPolling')
      expect(result.current).toHaveProperty('stopPolling')
      expect(result.current).toHaveProperty('refresh')
    })

    it('deve aceitar opções de configuração', () => {
      const { result: resultWithPolling } = renderHook(() =>
        useApiSync({ pollingEnabled: true, pollingInterval: 5000 })
      )

      const { result: resultWithoutPolling } = renderHook(() =>
        useApiSync({ pollingEnabled: false })
      )

      expect(resultWithPolling.current.isPolling).toBe(true)
      expect(resultWithoutPolling.current.isPolling).toBe(false)
    })
  })
})
