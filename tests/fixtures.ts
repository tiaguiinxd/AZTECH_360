/**
 * Fixtures para testes
 *
 * NOTA: Os dados reais vêm da API (ADR-004).
 * Estes são dados de teste para validar comportamento dos stores e componentes.
 */

import type { Colaborador, Setor, NivelHierarquico, Subsetor, Subnivel, PermissaoProjeto } from '@/types'

// ============ SETORES DE TESTE ============

export const MOCK_SETORES: Setor[] = [
  { id: 1, codigo: '1', nome: 'Comercial', cor: '#C6EFCE', corTexto: '#1e293b', ordem: 1 },
  { id: 2, codigo: '2', nome: 'Financeiro', cor: '#B4C6E7', corTexto: '#1e293b', ordem: 2 },
  { id: 3, codigo: '3', nome: 'RH/DP', cor: '#FFF2CC', corTexto: '#1e293b', ordem: 3 },
  { id: 5, codigo: '5', nome: 'Engenharia', cor: '#87CEEB', corTexto: '#1e293b', ordem: 5 },
]

export const MOCK_SUBSETORES: Subsetor[] = [
  { id: 1, setorId: 5, nome: 'Engenharia Civil', cor: '#87CEEB', corTexto: '#1e293b' },
  { id: 2, setorId: 5, nome: 'Engenharia Mecânica', cor: '#87CEEB', corTexto: '#1e293b' },
]

// ============ NÍVEIS DE TESTE ============

export const MOCK_NIVEIS: NivelHierarquico[] = [
  { id: 1, nivel: 0, nome: 'Diretoria', cor: '#1e3a5f', corTexto: '#ffffff', ordem: 1, subniveis: [] },
  { id: 2, nivel: 1, nome: 'Gerência', cor: '#2563eb', corTexto: '#ffffff', ordem: 2, subniveis: [] },
  { id: 3, nivel: 2, nome: 'Coordenação', cor: '#059669', corTexto: '#ffffff', ordem: 3, subniveis: [] },
  { id: 4, nivel: 3, nome: 'Técnico', cor: '#d97706', corTexto: '#ffffff', ordem: 4, subniveis: [
    { id: 1, nome: 'Sênior', abreviacao: 'Sr', ordem: 1 },
    { id: 2, nome: 'Pleno', abreviacao: 'Pl', ordem: 2 },
    { id: 3, nome: 'Júnior', abreviacao: 'Jr', ordem: 3 },
  ]},
  { id: 5, nivel: 4, nome: 'Operacional', cor: '#6B7280', corTexto: '#ffffff', ordem: 5, subniveis: [] },
]

// ============ COLABORADORES DE TESTE ============

export const MOCK_COLABORADORES: Colaborador[] = [
  {
    id: 1,
    nome: 'Samuel Menezes',
    cargo: 'Diretor Geral',
    setorId: 5,
    nivelId: 1,
    permissoes: ['gerente_projeto'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Marcos Andrei',
    cargo: 'Diretor Administrativo',
    setorId: 2,
    nivelId: 1,
    permissoes: ['gerente_projeto'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Thiago Bispo',
    cargo: 'Gerente de Engenharia',
    setorId: 5,
    nivelId: 2,
    superiorId: 1,
    permissoes: ['coordenador'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 4,
    nome: 'Danilo Silva',
    cargo: 'Engenheiro Civil',
    setorId: 5,
    nivelId: 4,
    superiorId: 3,
    permissoes: ['tecnico'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 5,
    nome: 'Victor Hugo',
    cargo: 'Engenheiro Mecânico',
    setorId: 5,
    nivelId: 4,
    superiorId: 3,
    permissoes: ['tecnico'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 6,
    nome: 'Larissa Santos',
    cargo: 'Assistente de Engenharia',
    setorId: 5,
    nivelId: 5,
    superiorId: 3,
    permissoes: ['assistente'] as PermissaoProjeto[],
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  },
]

// ============ HELPERS ============

export function getColaboradorById(id: number): Colaborador | undefined {
  return MOCK_COLABORADORES.find((c) => c.id === id)
}

export function getColaboradoresBySetorId(setorId: number): Colaborador[] {
  return MOCK_COLABORADORES.filter((c) => c.setorId === setorId)
}

export function getSubordinados(superiorId: number): Colaborador[] {
  return MOCK_COLABORADORES.filter((c) => c.superiorId === superiorId)
}

export function getSetorById(id: number): Setor | undefined {
  return MOCK_SETORES.find((s) => s.id === id)
}

export function getNivelById(id: number): NivelHierarquico | undefined {
  return MOCK_NIVEIS.find((n) => n.id === id)
}
