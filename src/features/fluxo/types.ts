/**
 * Tipos para o módulo de Fluxo Operacional
 *
 * Define a estrutura de dados para visualização do ciclo de vida
 * de serviços da AZ TECH
 */

export type ResponsavelSetor =
  | 'comercial'
  | 'tecnico'
  | 'suprimentos'
  | 'financeiro'
  | 'engenharia'
  | 'rh'
  | 'campo'
  | 'todos'

export interface Entregavel {
  nome: string
  descricao?: string
}

export interface Etapa {
  id: string
  codigo: string // ex: "1.1.1"
  acao: string
  entregavel: string
  detalhes?: string
  prazoEstimado?: string // ex: "3 dias úteis", "2 horas", "1 semana"
  checklistValidacao?: string[] // Critérios para considerar a etapa concluída
}

export interface SubFase {
  id: string
  codigo: string // ex: "1.1"
  titulo: string
  responsaveis: ResponsavelSetor[]
  etapas: Etapa[]
}

export interface Fase {
  id: string
  numero: number
  titulo: string
  subtitulo: string
  cor: 'blue' | 'amber' | 'purple' | 'green'
  icone: string
  responsaveisPrincipais: ResponsavelSetor[]
  subFases: SubFase[]
}

export interface MapeamentoSetorFase {
  setor: ResponsavelSetor
  label: string
  preServico: string
  preparacao: string
  kickoff: string
  execucao: string
}

export interface FuncaoServico {
  funcao: string
  responsabilidade: string
}

// Configurações visuais por setor
export const SETOR_CONFIG: Record<ResponsavelSetor, { label: string; cor: string; icone: string }> = {
  comercial: { label: 'Comercial', cor: 'bg-blue-100 text-blue-800', icone: 'Briefcase' },
  tecnico: { label: 'Técnico', cor: 'bg-purple-100 text-purple-800', icone: 'Wrench' },
  suprimentos: { label: 'Suprimentos', cor: 'bg-amber-100 text-amber-800', icone: 'Package' },
  financeiro: { label: 'Financeiro', cor: 'bg-green-100 text-green-800', icone: 'DollarSign' },
  engenharia: { label: 'Engenharia', cor: 'bg-indigo-100 text-indigo-800', icone: 'Cog' },
  rh: { label: 'RH', cor: 'bg-pink-100 text-pink-800', icone: 'Users' },
  campo: { label: 'Campo', cor: 'bg-orange-100 text-orange-800', icone: 'HardHat' },
  todos: { label: 'Todos', cor: 'bg-gray-100 text-gray-800', icone: 'Users' },
}

// Cores por fase
export const FASE_CORES = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    timeline: 'bg-blue-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    header: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    timeline: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    header: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800',
    timeline: 'bg-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    header: 'bg-green-500',
    badge: 'bg-green-100 text-green-800',
    timeline: 'bg-green-500',
  },
}
