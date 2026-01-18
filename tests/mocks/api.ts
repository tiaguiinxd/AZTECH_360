/**
 * Mocks de API para testes de integração
 *
 * Simula respostas da API FastAPI para testes isolados do frontend.
 * Usa vi.fn() para permitir verificar chamadas e modificar respostas.
 */

import { vi } from 'vitest'
import type { ColaboradorAPI, SetorAPI, NivelAPI, CargoAPI, TipoProjetoAPI } from '@/services/api'
import { MOCK_COLABORADORES, MOCK_SETORES, MOCK_NIVEIS } from '../fixtures'

// ============ MOCK DATA (formato API) ============

export const MOCK_COLABORADORES_API: ColaboradorAPI[] = MOCK_COLABORADORES.map((c) => ({
  id: c.id,
  nome: c.nome,
  cargo: c.cargo,
  setor_id: c.setorId,
  subsetor_id: c.subsetorId ?? null,
  nivel_id: c.nivelId,
  subnivel_id: c.subnivelId ?? null,
  superior_id: c.superiorId ?? null,
  permissoes: c.permissoes,
  foto_url: c.fotoUrl ?? null,
  email: c.email ?? null,
  telefone: c.telefone ?? null,
  created_at: c.criadoEm,
  updated_at: c.atualizadoEm,
}))

export const MOCK_SETORES_API: SetorAPI[] = MOCK_SETORES.map((s) => ({
  id: s.id,
  codigo: s.codigo,
  nome: s.nome,
  nome_completo: s.nomeCompleto ?? null,
  cor: s.cor,
  cor_texto: s.corTexto,
  icone: s.icone ?? null,
  diretor_id: s.diretorId ?? null,
  ordem: s.ordem,
  subsetores: [],
}))

export const MOCK_NIVEIS_API: NivelAPI[] = MOCK_NIVEIS.map((n) => ({
  id: n.id,
  nivel: n.nivel,
  nome: n.nome,
  descricao: n.descricao ?? null,
  cor: n.cor,
  cor_texto: n.corTexto,
  ordem: n.ordem,
  subniveis: (n.subniveis ?? []).map((s) => ({
    id: s.id,
    nivel_id: n.id,
    nome: s.nome,
    abreviacao: s.abreviacao ?? null,
    ordem: s.ordem,
  })),
}))

export const MOCK_CARGOS_API: CargoAPI[] = [
  { id: 1, codigo: 'DIR', nome: 'Diretor', descricao: null, nivel_id: 1, setor_id: null, ordem: 1 },
  { id: 2, codigo: 'GER', nome: 'Gerente', descricao: null, nivel_id: 2, setor_id: null, ordem: 2 },
  { id: 3, codigo: 'ENG', nome: 'Engenheiro', descricao: null, nivel_id: 4, setor_id: 5, ordem: 3 },
]

export const MOCK_TIPOS_PROJETO_API: TipoProjetoAPI[] = [
  { id: 1, codigo: 'ENG', nome: 'Engenharia', descricao: null, icone: null, cor: '#87CEEB', cor_texto: '#1e293b', ordem: 1 },
  { id: 2, codigo: 'MAN', nome: 'Manutenção', descricao: null, icone: null, cor: '#FFFF99', cor_texto: '#1e293b', ordem: 2 },
]

// ============ MOCK FETCH ============

interface MockFetchOptions {
  /** Simular delay de rede (ms) */
  delay?: number
  /** Forçar erro em determinadas rotas */
  errorRoutes?: string[]
  /** Status HTTP do erro */
  errorStatus?: number
}

/**
 * Cria um mock de fetch que simula a API FastAPI
 */
export function createMockFetch(options: MockFetchOptions = {}) {
  const { delay = 0, errorRoutes = [], errorStatus = 500 } = options

  // Estado interno para simular CRUD
  let colaboradores = [...MOCK_COLABORADORES_API]
  let nextColaboradorId = Math.max(...colaboradores.map((c) => c.id)) + 1

  const mockFetch = vi.fn(async (url: string, init?: RequestInit) => {
    // Simular delay de rede
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    const method = init?.method || 'GET'
    const path = url.replace(/^.*\/api\/v1/, '').replace(/\/$/, '')

    // Verificar se rota deve retornar erro
    if (errorRoutes.some((route) => path.includes(route))) {
      return {
        ok: false,
        status: errorStatus,
        json: async () => ({ detail: 'Erro simulado' }),
      }
    }

    // Health check
    if (path === '/health') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      }
    }

    // ============ COLABORADORES ============
    if (path === '/colaboradores' || path.startsWith('/colaboradores?')) {
      if (method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => colaboradores,
        }
      }
      if (method === 'POST') {
        const body = JSON.parse(init?.body as string)
        const newColaborador: ColaboradorAPI = {
          ...body,
          id: nextColaboradorId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        colaboradores.push(newColaborador)
        return {
          ok: true,
          status: 201,
          json: async () => newColaborador,
        }
      }
    }

    const colaboradorMatch = path.match(/^\/colaboradores\/(\d+)$/)
    if (colaboradorMatch) {
      const id = parseInt(colaboradorMatch[1], 10)
      const index = colaboradores.findIndex((c) => c.id === id)

      if (index === -1) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ detail: 'Colaborador não encontrado' }),
        }
      }

      if (method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => colaboradores[index],
        }
      }

      if (method === 'PUT') {
        const body = JSON.parse(init?.body as string)
        colaboradores[index] = {
          ...colaboradores[index],
          ...body,
          updated_at: new Date().toISOString(),
        }
        return {
          ok: true,
          status: 200,
          json: async () => colaboradores[index],
        }
      }

      if (method === 'DELETE') {
        colaboradores = colaboradores.filter((c) => c.id !== id)
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
        }
      }
    }

    // ============ SETORES ============
    if (path === '/setores') {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_SETORES_API,
      }
    }

    // ============ NÍVEIS ============
    if (path === '/niveis') {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_NIVEIS_API,
      }
    }

    // ============ CARGOS ============
    if (path === '/cargos') {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_CARGOS_API,
      }
    }

    // ============ TIPOS PROJETO ============
    if (path === '/tipos-projeto') {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_TIPOS_PROJETO_API,
      }
    }

    // Rota não encontrada
    return {
      ok: false,
      status: 404,
      json: async () => ({ detail: `Rota não encontrada: ${path}` }),
    }
  })

  // Helper para resetar estado
  mockFetch.resetState = () => {
    colaboradores = [...MOCK_COLABORADORES_API]
    nextColaboradorId = Math.max(...colaboradores.map((c) => c.id)) + 1
  }

  return mockFetch
}

/**
 * Instala o mock fetch globalmente
 */
export function installMockFetch(options: MockFetchOptions = {}) {
  const mockFetch = createMockFetch(options)
  vi.stubGlobal('fetch', mockFetch)
  return mockFetch
}

/**
 * Remove o mock fetch
 */
export function uninstallMockFetch() {
  vi.unstubAllGlobals()
}
