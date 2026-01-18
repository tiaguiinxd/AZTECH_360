/**
 * Testes de Integração - Colaboradores API
 *
 * Testa o fluxo completo de CRUD de colaboradores usando mock fetch.
 * Verifica conversão de dados, tratamento de erros e estado do store.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { colaboradoresApi, apiToColaborador, colaboradorToApi } from '@/services/api'
import { installMockFetch, uninstallMockFetch, MOCK_COLABORADORES_API } from '../mocks/api'

describe('Colaboradores API Integration', () => {
  let mockFetch: ReturnType<typeof installMockFetch>

  beforeEach(() => {
    mockFetch = installMockFetch()
  })

  afterEach(() => {
    uninstallMockFetch()
  })

  describe('GET /colaboradores', () => {
    it('deve listar todos os colaboradores', async () => {
      const colaboradores = await colaboradoresApi.list()

      expect(colaboradores).toHaveLength(MOCK_COLABORADORES_API.length)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('deve retornar dados no formato API (snake_case)', async () => {
      const colaboradores = await colaboradoresApi.list()
      const primeiro = colaboradores[0]

      // Verifica formato snake_case da API
      expect(primeiro).toHaveProperty('setor_id')
      expect(primeiro).toHaveProperty('nivel_id')
      expect(primeiro).toHaveProperty('superior_id')
      expect(primeiro).toHaveProperty('foto_url')
    })
  })

  describe('GET /colaboradores/:id', () => {
    it('deve obter colaborador por ID', async () => {
      const colaborador = await colaboradoresApi.get(1)

      expect(colaborador.id).toBe(1)
      expect(colaborador.nome).toBe('Samuel Menezes')
    })

    it('deve retornar erro 404 para ID inexistente', async () => {
      await expect(colaboradoresApi.get(999)).rejects.toThrow('Colaborador não encontrado')
    })
  })

  describe('POST /colaboradores', () => {
    it('deve criar novo colaborador', async () => {
      const novoColaborador = {
        nome: 'Novo Colaborador',
        cargo: 'Analista',
        setor_id: 5,
        subsetor_id: null,
        nivel_id: 4,
        subnivel_id: null,
        superior_id: 3,
        permissoes: ['tecnico'],
        foto_url: null,
        email: 'novo@aztech.com',
        telefone: null,
      }

      const criado = await colaboradoresApi.create(novoColaborador)

      expect(criado.id).toBeGreaterThan(0)
      expect(criado.nome).toBe('Novo Colaborador')
      expect(criado.created_at).toBeDefined()
    })

    it('colaborador criado deve aparecer na listagem', async () => {
      const novoColaborador = {
        nome: 'Colaborador Teste',
        cargo: 'Teste',
        setor_id: 5,
        subsetor_id: null,
        nivel_id: 4,
        subnivel_id: null,
        superior_id: null,
        permissoes: ['tecnico'],
        foto_url: null,
        email: null,
        telefone: null,
      }

      await colaboradoresApi.create(novoColaborador)
      const lista = await colaboradoresApi.list()

      expect(lista.some((c) => c.nome === 'Colaborador Teste')).toBe(true)
    })
  })

  describe('PUT /colaboradores/:id', () => {
    it('deve atualizar colaborador existente', async () => {
      const atualizado = await colaboradoresApi.update(1, {
        cargo: 'Novo Cargo Atualizado',
      })

      expect(atualizado.cargo).toBe('Novo Cargo Atualizado')
      expect(atualizado.updated_at).toBeDefined()
    })

    it('atualização deve persistir', async () => {
      await colaboradoresApi.update(1, { cargo: 'Cargo Persistido' })
      const colaborador = await colaboradoresApi.get(1)

      expect(colaborador.cargo).toBe('Cargo Persistido')
    })

    it('deve retornar erro 404 para ID inexistente', async () => {
      await expect(
        colaboradoresApi.update(999, { cargo: 'Teste' })
      ).rejects.toThrow('Colaborador não encontrado')
    })
  })

  describe('DELETE /colaboradores/:id', () => {
    it('deve deletar colaborador', async () => {
      const listaAntes = await colaboradoresApi.list()
      const tamanhoAntes = listaAntes.length

      await colaboradoresApi.delete(1)
      const listaDepois = await colaboradoresApi.list()

      expect(listaDepois.length).toBe(tamanhoAntes - 1)
      expect(listaDepois.find((c) => c.id === 1)).toBeUndefined()
    })

    it('deve retornar erro 404 para ID inexistente', async () => {
      await expect(colaboradoresApi.delete(999)).rejects.toThrow('Colaborador não encontrado')
    })
  })

  describe('Conversores API ↔ Store', () => {
    it('apiToColaborador deve converter snake_case para camelCase', () => {
      const apiData = MOCK_COLABORADORES_API[0]
      const converted = apiToColaborador(apiData)

      expect(converted.setorId).toBe(apiData.setor_id)
      expect(converted.nivelId).toBe(apiData.nivel_id)
      expect(converted.superiorId).toBe(apiData.superior_id ?? undefined)
      expect(converted.fotoUrl).toBe(apiData.foto_url ?? undefined)
      expect(converted.criadoEm).toBe(apiData.created_at)
      expect(converted.atualizadoEm).toBe(apiData.updated_at)
    })

    it('colaboradorToApi deve converter camelCase para snake_case', () => {
      const storeData = {
        id: 1,
        nome: 'Teste',
        cargo: 'Cargo',
        setorId: 5,
        nivelId: 4,
        superiorId: 3,
        fotoUrl: 'http://foto.jpg',
        permissoes: ['tecnico' as const],
        criadoEm: '2026-01-01T00:00:00.000Z',
        atualizadoEm: '2026-01-01T00:00:00.000Z',
      }
      const converted = colaboradorToApi(storeData)

      expect(converted.setor_id).toBe(storeData.setorId)
      expect(converted.nivel_id).toBe(storeData.nivelId)
      expect(converted.superior_id).toBe(storeData.superiorId)
      expect(converted.foto_url).toBe(storeData.fotoUrl)
    })

    it('conversão deve ser bidirecional', async () => {
      const original = await colaboradoresApi.get(1)
      const toStore = apiToColaborador(original)
      const backToApi = colaboradorToApi(toStore)

      // Campos principais devem coincidir
      expect(backToApi.nome).toBe(original.nome)
      expect(backToApi.setor_id).toBe(original.setor_id)
      expect(backToApi.nivel_id).toBe(original.nivel_id)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de rede graciosamente', async () => {
      // Reinstalar com rota de erro
      uninstallMockFetch()
      mockFetch = installMockFetch({ errorRoutes: ['/colaboradores'], errorStatus: 500 })

      await expect(colaboradoresApi.list()).rejects.toThrow('Erro simulado')
    })

    it('deve tratar erro 404 com mensagem apropriada', async () => {
      await expect(colaboradoresApi.get(999)).rejects.toThrow('Colaborador não encontrado')
    })
  })
})
