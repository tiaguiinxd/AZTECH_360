/**
 * Testes das fixtures de teste
 *
 * NOTA: Estes testes validam as fixtures usadas nos outros testes.
 * Os dados reais vêm da API (ADR-004).
 */

import { describe, it, expect } from 'vitest'
import {
  MOCK_COLABORADORES,
  MOCK_SETORES,
  MOCK_NIVEIS,
  getColaboradorById,
  getColaboradoresBySetorId,
  getSubordinados,
  getSetorById,
  getNivelById,
} from '../fixtures'

describe('Fixtures de Teste', () => {
  describe('Colaboradores', () => {
    it('deve ter colaboradores de teste', () => {
      expect(MOCK_COLABORADORES.length).toBeGreaterThan(0)
    })

    it('deve ter IDs únicos', () => {
      const ids = MOCK_COLABORADORES.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('deve encontrar colaborador por ID', () => {
      const samuel = getColaboradorById(1)
      expect(samuel).toBeDefined()
      expect(samuel?.nome).toBe('Samuel Menezes')
    })

    it('deve retornar undefined para ID inexistente', () => {
      const inexistente = getColaboradorById(999)
      expect(inexistente).toBeUndefined()
    })

    it('deve filtrar colaboradores por setor', () => {
      const engenharia = getColaboradoresBySetorId(5) // Engenharia
      expect(engenharia.length).toBeGreaterThan(0)
      expect(engenharia.every((c) => c.setorId === 5)).toBe(true)
    })

    it('deve encontrar subordinados', () => {
      const subordinadosThiago = getSubordinados(3) // Thiago (id=3)
      expect(subordinadosThiago.length).toBeGreaterThan(0)
      expect(subordinadosThiago.every((c) => c.superiorId === 3)).toBe(true)
    })

    it('todos colaboradores devem ter setor válido', () => {
      MOCK_COLABORADORES.forEach((c) => {
        const setor = getSetorById(c.setorId)
        expect(setor).toBeDefined()
      })
    })

    it('todos colaboradores devem ter nível válido', () => {
      MOCK_COLABORADORES.forEach((c) => {
        const nivel = getNivelById(c.nivelId)
        expect(nivel).toBeDefined()
      })
    })
  })

  describe('Setores', () => {
    it('deve ter setores de teste', () => {
      expect(MOCK_SETORES.length).toBeGreaterThan(0)
    })

    it('deve ter IDs únicos', () => {
      const ids = MOCK_SETORES.map((s) => s.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('deve encontrar setor por ID', () => {
      const comercial = getSetorById(1)
      expect(comercial).toBeDefined()
      expect(comercial?.nome).toBe('Comercial')
    })
  })

  describe('Níveis Hierárquicos', () => {
    it('deve ter 5 níveis', () => {
      expect(MOCK_NIVEIS).toHaveLength(5)
    })

    it('deve ter níveis de 0 a 4', () => {
      const niveis = MOCK_NIVEIS.map((n) => n.nivel).sort()
      expect(niveis).toEqual([0, 1, 2, 3, 4])
    })

    it('deve encontrar nível por ID', () => {
      const diretoria = getNivelById(1)
      expect(diretoria).toBeDefined()
      expect(diretoria?.nome).toBe('Diretoria')
    })
  })
})
