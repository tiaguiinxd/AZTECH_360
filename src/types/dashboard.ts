/**
 * Types: Dashboard de Alocacao
 *
 * Tipos para o dashboard de alocacao de pessoal e volume de obra.
 */

// ============ ENUMS ============

export type StatusAlocacao = 'ativa' | 'concluida' | 'suspensa' | 'cancelada'

export type FuncaoAlocacao =
  | 'gerente_projeto'
  | 'coordenador'
  | 'engenheiro'
  | 'tecnico'
  | 'encarregado'
  | 'auxiliar'
  | 'fiscal'
  | 'comprador'

export const FUNCAO_LABELS: Record<FuncaoAlocacao, string> = {
  gerente_projeto: 'Gerente de Projeto',
  coordenador: 'Coordenador',
  engenheiro: 'Engenheiro',
  tecnico: 'Tecnico',
  encarregado: 'Encarregado',
  auxiliar: 'Auxiliar',
  fiscal: 'Fiscal',
  comprador: 'Comprador',
}

export const STATUS_ALOCACAO_LABELS: Record<StatusAlocacao, string> = {
  ativa: 'Ativa',
  concluida: 'Concluida',
  suspensa: 'Suspensa',
  cancelada: 'Cancelada',
}

// ============ ALOCACAO ============

export interface Alocacao {
  id: number
  colaborador_id: number
  projeto_id: number
  funcao: FuncaoAlocacao
  data_inicio: string
  data_fim: string | null
  horas_semanais: number
  percentual_dedicacao: number
  status: StatusAlocacao
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface AlocacaoCreate {
  colaborador_id: number
  projeto_id: number
  funcao: FuncaoAlocacao
  data_inicio: string
  data_fim?: string | null
  horas_semanais?: number
  percentual_dedicacao?: number
  status?: StatusAlocacao
  observacoes?: string | null
}

export interface AlocacaoUpdate {
  funcao?: FuncaoAlocacao
  data_inicio?: string
  data_fim?: string | null
  horas_semanais?: number
  percentual_dedicacao?: number
  status?: StatusAlocacao
  observacoes?: string | null
}

export interface AlocacaoComDetalhes extends Alocacao {
  colaborador_nome: string
  colaborador_cargo: string
  projeto_codigo: string
  projeto_nome: string
  projeto_empresa: string
}

// ============ DASHBOARD ============

export interface ResumoGeralDashboard {
  total_projetos: number
  projetos_em_andamento: number
  projetos_planejados: number
  projetos_concluidos: number
  valor_total_carteira: number
  total_colaboradores_alocados: number
  percentual_equipe_alocada: number
}

export interface ResumoEmpresaDashboard {
  empresa: string
  total_projetos: number
  projetos_em_andamento: number
  projetos_concluidos: number
  valor_total: number
  colaboradores_alocados: number
}

export interface TimelineItemDashboard {
  projeto_id: number
  codigo: string
  nome: string
  empresa: string
  categoria: string
  data_inicio: string | null
  data_fim: string | null
  status: string
  percentual_conclusao: number
  total_alocados: number
}

export interface DisponibilidadeColaborador {
  colaborador_id: number
  nome: string
  cargo: string
  setor: string
  percentual_ocupado: number
  projetos_ativos: number
  disponivel: boolean
}

export interface SobrecargaMensal {
  mes: number // 1-12
  nome_mes: string // "Jan", "Fev", etc
  total_alocacoes: number // Numero de alocacoes ativas neste mes
  total_pessoas: number // Numero de pessoas alocadas
  percentual_ocupacao: number // Media de ocupacao da equipe (0-100+)
  sobrecarga: boolean // True se ocupacao > 100%
}

// ============ FILTROS ============

export interface DashboardFilters {
  ano: number
  empresa: string | null
  setor_id: number | null
}

// ============ STATE ============

export interface DashboardState {
  // Data
  resumoGeral: ResumoGeralDashboard | null
  resumoEmpresas: ResumoEmpresaDashboard[]
  timeline: TimelineItemDashboard[]
  disponibilidade: DisponibilidadeColaborador[]
  alocacoes: AlocacaoComDetalhes[]
  sobrecargaTemporal: SobrecargaMensal[]

  // UI State
  isLoading: boolean
  error: string | null
  filters: DashboardFilters

  // Hydration
  _hasHydrated: boolean
}

export interface DashboardActions {
  // Data fetching
  fetchResumoGeral: () => Promise<void>
  fetchResumoEmpresas: () => Promise<void>
  fetchTimeline: (ano?: number, empresa?: string) => Promise<void>
  fetchDisponibilidade: (setor_id?: number) => Promise<void>
  fetchAlocacoes: (projeto_id?: number, colaborador_id?: number) => Promise<void>
  fetchSobrecargaTemporal: (ano?: number) => Promise<void>
  fetchAll: () => Promise<void>

  // CRUD Alocacoes
  createAlocacao: (data: AlocacaoCreate) => Promise<Alocacao>
  updateAlocacao: (id: number, data: AlocacaoUpdate) => Promise<Alocacao>
  deleteAlocacao: (id: number) => Promise<void>

  // Filters
  setFilters: (filters: Partial<DashboardFilters>) => void
  resetFilters: () => void

  // Hydration
  setHasHydrated: (state: boolean) => void
}
