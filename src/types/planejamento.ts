/**
 * Types do Modulo de Planejamento
 *
 * Baseado na estrutura do CSV "PREVISAO 2026":
 * EMPRESA | CLIENTE | CATEGORIA | SUBCATEGORIA | VALOR | INICIO | TERMINO | TIPO | DESCRICAO
 */

/**
 * Status de um projeto/obra
 */
export type StatusProjeto = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado' | 'pausado'

/**
 * Projeto de obra/servico
 */
export interface Projeto {
  id: number
  codigo: string
  nome: string
  descricao: string | null

  // Relacionamentos
  empresa: string // Ex: "AZ TECH", "AZ MAQ"
  cliente: string // Ex: "NGD", "ULT", "CPE"
  categoria: string // Ex: "CIVIL", "MECANICA"
  subcategoria: string | null // Ex: "INFRAESTRUTURA", "TUBULACAO", "PINTURA"
  tipo: string | null // Ex: "COBERTA CARGA E DESCARGA", "PINTURA DE VASOS"

  // Valores
  valorEstimado: number | null

  // Datas
  dataInicioPrevista: string | null // formato ISO
  dataFimPrevista: string | null // formato ISO
  dataInicioReal: string | null
  dataFimReal: string | null

  // Status
  status: StatusProjeto
  percentualConclusao: number // 0-100

  // Metadados
  criadoEm: string
  atualizadoEm: string
}

/**
 * Filtros de projetos
 */
export interface ProjetoFilters {
  empresa: string | null
  cliente: string | null
  categoria: string | null
  status: StatusProjeto | null
  busca: string
}

/**
 * Resumo por empresa
 */
export interface ResumoEmpresa {
  empresa: string
  totalProjetos: number
  valorTotal: number
  projetosEmAndamento: number
  projetosConcluidos: number
}

/**
 * Resumo por cliente
 */
export interface ResumoCliente {
  cliente: string
  totalProjetos: number
  valorTotal: number
}

/**
 * Resumo por categoria
 */
export interface ResumoCategoria {
  categoria: string
  totalProjetos: number
  valorTotal: number
}
