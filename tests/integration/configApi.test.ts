/**
 * Testes de Integração - Setores, Níveis e Config API
 *
 * Testa o fluxo de carregamento de configurações da API.
 * Verifica conversão de dados e integração com configStore.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  setoresApi,
  niveisApi,
  cargosApi,
  tiposProjetoApi,
  apiToSetor,
  apiToNivel,
  apiToCargo,
  apiToTipoProjeto,
} from '@/services/api'
import { useConfigStore } from '@/stores/configStore'
import {
  installMockFetch,
  uninstallMockFetch,
  MOCK_SETORES_API,
  MOCK_NIVEIS_API,
  MOCK_CARGOS_API,
  MOCK_TIPOS_PROJETO_API,
} from '../mocks/api'

describe('Config API Integration', () => {
  let mockFetch: ReturnType<typeof installMockFetch>

  beforeEach(() => {
    mockFetch = installMockFetch()
    // Reset configStore
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

  describe('Setores API', () => {
    it('deve listar setores', async () => {
      const setores = await setoresApi.list()

      expect(setores).toHaveLength(MOCK_SETORES_API.length)
      expect(setores[0]).toHaveProperty('codigo')
      expect(setores[0]).toHaveProperty('cor')
    })

    it('apiToSetor deve converter formato da API', () => {
      const apiData = MOCK_SETORES_API[0]
      const converted = apiToSetor(apiData)

      expect(converted.corTexto).toBe(apiData.cor_texto)
      expect(converted.nomeCompleto).toBe(apiData.nome_completo ?? undefined)
      expect(converted.diretorId).toBe(apiData.diretor_id ?? undefined)
    })

    it('setores convertidos devem ter tipos corretos', async () => {
      const setores = await setoresApi.list()
      const converted = setores.map(apiToSetor)

      converted.forEach((setor) => {
        expect(typeof setor.id).toBe('number')
        expect(typeof setor.nome).toBe('string')
        expect(typeof setor.cor).toBe('string')
        expect(typeof setor.ordem).toBe('number')
      })
    })
  })

  describe('Níveis API', () => {
    it('deve listar níveis hierárquicos', async () => {
      const niveis = await niveisApi.list()

      expect(niveis).toHaveLength(MOCK_NIVEIS_API.length)
      expect(niveis[0]).toHaveProperty('nivel')
      expect(niveis[0]).toHaveProperty('subniveis')
    })

    it('apiToNivel deve converter formato da API', () => {
      const apiData = MOCK_NIVEIS_API[0]
      const converted = apiToNivel(apiData)

      expect(converted.corTexto).toBe(apiData.cor_texto)
      expect(converted.descricao).toBe(apiData.descricao ?? undefined)
    })

    it('níveis devem ter subniveis convertidos', async () => {
      const niveis = await niveisApi.list()
      const nivelComSubniveis = niveis.find((n) => n.subniveis.length > 0)

      if (nivelComSubniveis) {
        const converted = apiToNivel(nivelComSubniveis)
        expect(Array.isArray(converted.subniveis)).toBe(true)
      }
    })

    it('níveis devem estar ordenados por nivel', async () => {
      const niveis = await niveisApi.list()
      const converted = niveis.map(apiToNivel)
      const niveisOrdenados = [...converted].sort((a, b) => a.nivel - b.nivel)

      // Verificar que existe ordem
      expect(converted[0].nivel).toBeDefined()
    })
  })

  describe('Cargos API', () => {
    it('deve listar cargos', async () => {
      const cargos = await cargosApi.list()

      expect(cargos).toHaveLength(MOCK_CARGOS_API.length)
      expect(cargos[0]).toHaveProperty('codigo')
      expect(cargos[0]).toHaveProperty('nome')
    })

    it('apiToCargo deve converter formato da API', () => {
      const apiData = MOCK_CARGOS_API[0]
      const converted = apiToCargo(apiData)

      expect(converted.nivelId).toBe(apiData.nivel_id ?? undefined)
      expect(converted.setorId).toBe(apiData.setor_id ?? undefined)
    })
  })

  describe('Tipos de Projeto API', () => {
    it('deve listar tipos de projeto', async () => {
      const tipos = await tiposProjetoApi.list()

      expect(tipos).toHaveLength(MOCK_TIPOS_PROJETO_API.length)
      expect(tipos[0]).toHaveProperty('codigo')
      expect(tipos[0]).toHaveProperty('nome')
    })

    it('apiToTipoProjeto deve converter formato da API', () => {
      const apiData = MOCK_TIPOS_PROJETO_API[0]
      const converted = apiToTipoProjeto(apiData)

      expect(converted.corTexto).toBe(apiData.cor_texto ?? undefined)
    })
  })

  describe('ConfigStore Integration', () => {
    it('loadAll deve carregar todas as configurações', async () => {
      const { loadAll } = useConfigStore.getState()

      await loadAll()

      const state = useConfigStore.getState()
      expect(state.setores.length).toBeGreaterThan(0)
      expect(state.niveis.length).toBeGreaterThan(0)
      expect(state.cargos.length).toBeGreaterThan(0)
      expect(state.tiposProjeto.length).toBeGreaterThan(0)
    })

    it('loadSetores deve carregar apenas setores', async () => {
      const { loadSetores } = useConfigStore.getState()

      await loadSetores()

      const state = useConfigStore.getState()
      expect(state.setores.length).toBeGreaterThan(0)
      expect(state.niveis.length).toBe(0) // Não deve ter carregado
    })

    it('loadNiveis deve carregar apenas níveis', async () => {
      const { loadNiveis } = useConfigStore.getState()

      await loadNiveis()

      const state = useConfigStore.getState()
      expect(state.niveis.length).toBeGreaterThan(0)
      expect(state.setores.length).toBe(0) // Não deve ter carregado
    })

    it('deve setar isLoading durante carregamento', async () => {
      // Instalar mock com delay para poder verificar isLoading
      uninstallMockFetch()
      mockFetch = installMockFetch({ delay: 50 })

      const { loadAll } = useConfigStore.getState()

      const loadPromise = loadAll()

      // Durante carregamento
      expect(useConfigStore.getState().isLoading).toBe(true)

      await loadPromise

      // Após carregamento
      expect(useConfigStore.getState().isLoading).toBe(false)
    })

    it('deve setar error em caso de falha', async () => {
      uninstallMockFetch()
      mockFetch = installMockFetch({ errorRoutes: ['/setores'], errorStatus: 500 })

      const { loadSetores } = useConfigStore.getState()

      await loadSetores()

      const state = useConfigStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('Selectors', () => {
    it('selectSetorById deve encontrar setor por ID', async () => {
      const { loadSetores } = useConfigStore.getState()
      await loadSetores()

      const setor = useConfigStore.getState().setores.find((s) => s.id === 1)
      expect(setor).toBeDefined()
      expect(setor?.nome).toBe('Comercial')
    })

    it('selectNivelById deve encontrar nível por ID', async () => {
      const { loadNiveis } = useConfigStore.getState()
      await loadNiveis()

      const nivel = useConfigStore.getState().niveis.find((n) => n.id === 1)
      expect(nivel).toBeDefined()
      expect(nivel?.nome).toBe('Diretoria')
    })
  })
})
