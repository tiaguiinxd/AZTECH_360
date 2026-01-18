/**
 * Tipos relacionados a Colaboradores
 */

import type { ID, ISODateString } from './common'

/**
 * Permissões que um colaborador pode ter em projetos
 */
export type PermissaoProjeto =
  | 'gerente_projeto'
  | 'coordenador'
  | 'engenheiro_responsavel'
  | 'tecnico'
  | 'analista'
  | 'assistente'
  | 'fiscal'
  | 'comprador'

/**
 * Colaborador da empresa
 */
export interface Colaborador {
  id: ID
  nome: string
  cargo: string
  email?: string
  telefone?: string
  fotoUrl?: string // URL da foto do colaborador

  // Organização
  setorId: ID
  subsetorId?: ID
  nivelId: ID
  subnivelId?: ID // Senioridade: 1=Sênior, 2=Pleno, 3=Júnior
  superiorId?: ID

  // Permissões em projetos
  permissoes: PermissaoProjeto[]

  // Metadados
  criadoEm: ISODateString
  atualizadoEm: ISODateString
}

/**
 * Dados para criar um novo colaborador (sem ID e metadados)
 */
export type ColaboradorCreate = Omit<Colaborador, 'id' | 'criadoEm' | 'atualizadoEm'>

/**
 * Dados para atualizar um colaborador (parcial)
 */
export type ColaboradorUpdate = Partial<Omit<Colaborador, 'id' | 'criadoEm' | 'atualizadoEm'>>

/**
 * Subnível - representa senioridade dentro de um nível
 * Ex: Sênior, Pleno, Júnior
 */
export interface Subnivel {
  id: ID
  nome: string         // "Sênior", "Pleno", "Júnior"
  abreviacao?: string  // "Sr", "Pl", "Jr" - opcional pois API pode retornar null
  ordem: number        // 1 = mais experiente
}

/**
 * Nível Hierárquico
 */
export interface NivelHierarquico {
  id: ID
  nivel: number // 0 = mais alto (Diretoria)
  nome: string
  descricao?: string // Opcional, API pode retornar null
  cor: string
  corTexto: string
  ordem: number
  subniveis?: Subnivel[] // Subníveis disponíveis para este nível
}

/**
 * Cargo
 */
export interface Cargo {
  id: ID
  codigo: string
  nome: string
  descricao?: string
  nivelId?: ID
  setorId?: ID
  ordem: number
}

/**
 * Tipo de Projeto
 */
export interface TipoProjeto {
  id: ID
  codigo: string
  nome: string
  descricao?: string
  icone?: string
  cor?: string
  corTexto?: string
  ordem: number
}

/**
 * Colaborador com dados expandidos (para exibição)
 */
export interface ColaboradorExpanded extends Colaborador {
  setor: {
    id: ID
    nome: string
    cor: string
  }
  nivel: {
    id: ID
    nome: string
    nivel: number
    cor: string
  }
  superior?: {
    id: ID
    nome: string
    cargo: string
  }
  subordinados: Array<{
    id: ID
    nome: string
    cargo: string
  }>
}
