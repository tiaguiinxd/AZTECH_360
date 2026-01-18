/**
 * Tipos relacionados a Setores
 */

import type { ID } from './common'

/**
 * Setor da empresa
 */
export interface Setor {
  id: ID
  codigo: string // "1", "2", "X", etc
  nome: string // Nome curto
  nomeCompleto?: string // Nome completo (opcional, API pode retornar null)
  cor: string // Cor de fundo (hex)
  corTexto: string // Cor do texto (hex)
  icone?: string // Ícone do setor (opcional)
  diretorId?: ID // FK para Colaborador responsável
  ordem: number // Ordem de exibição
}

/**
 * Subsetor (ex: Engenharia Civil, Engenharia Mecânica)
 */
export interface Subsetor {
  id: ID
  setorId: ID // FK para Setor pai
  nome: string
  cor?: string // Cor de fundo (opcional, API pode retornar null)
  corTexto?: string // Cor do texto (opcional, API pode retornar null)
}

/**
 * Dados para criar um novo setor
 */
export type SetorCreate = Omit<Setor, 'id'>

/**
 * Dados para atualizar um setor
 */
export type SetorUpdate = Partial<Omit<Setor, 'id'>>

/**
 * Dados para criar um novo subsetor
 */
export type SubsetorCreate = Omit<Subsetor, 'id'>

/**
 * Setor com contagem de colaboradores
 */
export interface SetorComContagem extends Setor {
  totalColaboradores: number
  colaboradoresPorNivel: Record<number, number>
}
