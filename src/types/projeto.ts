/**
 * Tipos relacionados a Projetos
 */

import type { ID, ISODateString } from './common'

/**
 * Status do projeto
 */
export type StatusProjeto =
  | 'planejamento'
  | 'em_andamento'
  | 'pausado'
  | 'concluido'

/**
 * IDs das etapas do roadmap
 */
export type EtapaRoadmapId =
  | 'venda'
  | 'medicao'
  | 'planejamento'
  | 'instalacao'
  | 'finalizacao'

/**
 * Etapa do roadmap de um projeto
 */
export interface EtapaRoadmap {
  id: EtapaRoadmapId
  nome: string
  concluida: boolean
  concluidaEm?: ISODateString
}

/**
 * Equipe alocada em um projeto
 */
export interface EquipeProjeto {
  posVendaId?: ID
  comprasId?: ID
  planejamentoId?: ID
  operacaoId?: ID
  assistenteId?: ID
}

/**
 * Projeto
 */
export interface Projeto {
  id: ID
  nome: string
  descricao: string
  cliente: string
  status: StatusProjeto

  // Equipe
  equipe: EquipeProjeto

  // Roadmap
  roadmap: EtapaRoadmap[]

  // Metadados
  criadoEm: ISODateString
  atualizadoEm: ISODateString
}

/**
 * Dados para criar um novo projeto
 */
export type ProjetoCreate = Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm' | 'roadmap'> & {
  roadmap?: EtapaRoadmap[]
}

/**
 * Dados para atualizar um projeto
 */
export type ProjetoUpdate = Partial<Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm'>>

/**
 * Funções obrigatórias na equipe do projeto
 */
export const FUNCOES_OBRIGATORIAS: (keyof EquipeProjeto)[] = [
  'posVendaId',
  'comprasId',
  'planejamentoId',
  'operacaoId',
]

/**
 * Labels das funções da equipe
 */
export const FUNCAO_LABELS: Record<keyof EquipeProjeto, string> = {
  posVendaId: 'Pós-Venda',
  comprasId: 'Compras',
  planejamentoId: 'Planejamento',
  operacaoId: 'Operação',
  assistenteId: 'Assistente',
}

/**
 * Labels das etapas do roadmap
 */
export const ETAPA_LABELS: Record<EtapaRoadmapId, string> = {
  venda: 'Venda',
  medicao: 'Medição',
  planejamento: 'Planejamento',
  instalacao: 'Instalação',
  finalizacao: 'Finalização',
}

/**
 * Ordem das etapas do roadmap
 */
export const ETAPAS_ORDEM: EtapaRoadmapId[] = [
  'venda',
  'medicao',
  'planejamento',
  'instalacao',
  'finalizacao',
]

/**
 * Projeto com dados expandidos (para exibição)
 */
export interface ProjetoExpanded extends Projeto {
  equipeMembros: {
    funcao: keyof EquipeProjeto
    colaborador?: {
      id: ID
      nome: string
      cargo: string
    }
  }[]
  progresso: number // 0-100 baseado nas etapas concluídas
  equipeCompleta: boolean
}
