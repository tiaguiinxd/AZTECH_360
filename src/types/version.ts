/**
 * Tipos relacionados ao Versionamento do Organograma
 */

import type { ID, ISODateString } from './common'
import type { Colaborador } from './colaborador'

/**
 * Status de uma versão do organograma
 */
export type VersionStatus = 'draft' | 'approved' | 'archived' | 'official'

/**
 * Tipo de mudança em uma versão
 */
export type ChangeType = 'hierarchy' | 'data' | 'added' | 'removed'

/**
 * Representa uma mudança individual no organograma
 */
export interface VersionChange {
  colaboradorId: ID
  colaboradorNome: string
  changeType: ChangeType
  field?: string
  oldValue?: unknown
  newValue?: unknown
}

/**
 * Resumo das mudanças de uma versão
 */
export interface ChangesSummary {
  totalChanges: number
  hierarchyChanges: VersionChange[]
  dataChanges: VersionChange[]
}

/**
 * Snapshot de colaborador para versionamento
 * Espelha os dados do colaborador em formato de snapshot
 */
export interface ColaboradorSnapshot {
  id: ID
  nome: string
  cargo: string
  setor_id: ID
  subsetor_id?: ID | null
  nivel_id: ID
  subnivel_id?: ID | null
  superior_id?: ID | null
  permissoes: string[]
  foto_url?: string | null
  email?: string | null
  telefone?: string | null
}

/**
 * Versão do organograma
 */
export interface OrganoVersion {
  id: ID
  nome: string
  descricao?: string | null
  status: VersionStatus
  snapshot: ColaboradorSnapshot[]
  changesSummary?: ChangesSummary | null
  createdAt: ISODateString
  updatedAt: ISODateString
  approvedAt?: ISODateString | null
}

/**
 * Versão resumida para listagem
 */
export interface OrganoVersionSummary {
  id: ID
  nome: string
  descricao?: string | null
  status: VersionStatus
  changesCount: number
  createdAt: ISODateString
  updatedAt: ISODateString
}

/**
 * Dados para criar uma nova versão
 */
export interface OrganoVersionCreate {
  nome: string
  descricao?: string
}

/**
 * Dados para atualizar uma versão
 */
export interface OrganoVersionUpdate {
  nome?: string
  descricao?: string
  snapshot?: ColaboradorSnapshot[]
}

/**
 * Modo de edição do organograma
 */
export type EditMode = 'view' | 'draft'

/**
 * Snapshot para undo/redo
 */
export interface DraftSnapshot {
  colaboradores: Colaborador[]
  timestamp: number
  description?: string
}
