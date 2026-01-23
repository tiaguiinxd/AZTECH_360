/**
 * Tipos para o módulo de Treinamentos
 *
 * Define a estrutura de dados para visualização das entregas de cada setor
 * da AZ TECH
 */

export type SetorType =
  | 'comercial'
  | 'financeiro'
  | 'suprimentos'
  | 'engenharia'
  | 'rh'
  | 'dp'
  | 'operacao'
  | 'diretoria'

export type CategoriaEntrega =
  | 'documento'
  | 'relatorio'
  | 'planilha'
  | 'projeto'
  | 'analise'
  | 'apresentacao'
  | 'cadastro'
  | 'validacao'

/**
 * Representa uma dependência entre entregas de setores
 * Mapeia o fluxo: Setor X entrega Y → necessário para → Setor A produzir entrega B
 */
export interface DependenciaEntrega {
  setorOrigem: SetorType // De qual setor vem a dependência
  entregaId?: string // ID específico da entrega (opcional - pode ser genérico)
  descricao: string // O que é necessário deste setor
}

export interface Entrega {
  id: string
  nome: string
  descricao: string
  categoria: CategoriaEntrega
  formato?: string // Ex: "PDF", "Excel", "Word", "Sistema"
  prazoTipico?: string // Ex: "1 dia útil", "3-5 dias úteis"
  criteriosQualidade?: string[] // Critérios para entrega ser considerada adequada
  exemplos?: string[] // Exemplos ou templates disponíveis
  dependencias?: DependenciaEntrega[] // Inputs necessários de outros setores
}

export interface SetorInfo {
  id: SetorType
  nome: string
  descricao: string
  cor: 'blue' | 'purple' | 'amber' | 'green' | 'indigo' | 'pink' | 'orange' | 'gray'
  icone: string // Nome do ícone Lucide
  responsabilidadesPrincipais: string[]
  entregas: Entrega[]
}

// Configurações visuais por setor
export const SETOR_VISUAL_CONFIG: Record<SetorType, { cor: string; icone: string }> = {
  comercial: { cor: 'bg-blue-100 text-blue-800 border-blue-200', icone: 'Briefcase' },
  financeiro: { cor: 'bg-green-100 text-green-800 border-green-200', icone: 'DollarSign' },
  suprimentos: { cor: 'bg-amber-100 text-amber-800 border-amber-200', icone: 'Package' },
  engenharia: { cor: 'bg-indigo-100 text-indigo-800 border-indigo-200', icone: 'Cog' },
  rh: { cor: 'bg-pink-100 text-pink-800 border-pink-200', icone: 'Users' },
  dp: { cor: 'bg-purple-100 text-purple-800 border-purple-200', icone: 'FileText' },
  operacao: { cor: 'bg-orange-100 text-orange-800 border-orange-200', icone: 'HardHat' },
  diretoria: { cor: 'bg-gray-100 text-gray-800 border-gray-200', icone: 'Building2' },
}

// Cores por categoria de entrega
export const CATEGORIA_CORES: Record<CategoriaEntrega, string> = {
  documento: 'bg-blue-50 text-blue-700 border-blue-200',
  relatorio: 'bg-purple-50 text-purple-700 border-purple-200',
  planilha: 'bg-green-50 text-green-700 border-green-200',
  projeto: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  analise: 'bg-amber-50 text-amber-700 border-amber-200',
  apresentacao: 'bg-pink-50 text-pink-700 border-pink-200',
  cadastro: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  validacao: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}
