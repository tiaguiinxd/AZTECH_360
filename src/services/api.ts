/**
 * Serviço de API - Comunicação com Backend FastAPI
 *
 * Este serviço é a única fonte de verdade para dados persistentes.
 * Todas as operações CRUD devem passar por aqui.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body } = options

  // Garantir trailing slash APENAS para endpoints de coleção (sem path params)
  // Endpoints com path params (ex: /colaboradores/123) NÃO devem ter trailing slash
  const hasPathParam = /\/\d+/.test(endpoint) // Verifica se tem /123, /456, etc
  const normalizedEndpoint = endpoint.endsWith('/') || endpoint.includes('?') || hasPathParam
    ? endpoint
    : `${endpoint}/`

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  // DELETE retorna 204 sem body
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// ============ SETORES ============

export interface SetorAPI {
  id: number
  codigo: string
  nome: string
  nome_completo: string | null
  cor: string
  cor_texto: string
  icone: string | null
  diretor_id: number | null
  ordem: number
  subsetores: SubsetorAPI[]
}

export interface SubsetorAPI {
  id: number
  setor_id: number
  nome: string
  cor: string | null
  cor_texto: string | null
}

export const setoresApi = {
  list: () => apiRequest<SetorAPI[]>('/setores'),
  get: (id: number) => apiRequest<SetorAPI>(`/setores/${id}`),
  create: (data: Omit<SetorAPI, 'id' | 'subsetores'>) =>
    apiRequest<SetorAPI>('/setores', { method: 'POST', body: data }),
  update: (id: number, data: Partial<SetorAPI>) =>
    apiRequest<SetorAPI>(`/setores/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/setores/${id}`, { method: 'DELETE' }),
}

// ============ SUBSETORES ============

export const subsetoresApi = {
  create: (data: Omit<SubsetorAPI, 'id'>) =>
    apiRequest<SubsetorAPI>('/subsetores', { method: 'POST', body: data }),
  update: (id: number, data: Partial<SubsetorAPI>) =>
    apiRequest<SubsetorAPI>(`/subsetores/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/subsetores/${id}`, { method: 'DELETE' }),
}

// ============ NÍVEIS ============

export interface NivelAPI {
  id: number
  nivel: number
  nome: string
  descricao: string | null
  cor: string
  cor_texto: string
  ordem: number
  subniveis: SubnivelAPI[]
}

export interface SubnivelAPI {
  id: number
  nivel_id: number
  nome: string
  abreviacao: string | null
  ordem: number
}

export const niveisApi = {
  list: () => apiRequest<NivelAPI[]>('/niveis'),
  get: (id: number) => apiRequest<NivelAPI>(`/niveis/${id}`),
  create: (data: Omit<NivelAPI, 'id' | 'subniveis'>) =>
    apiRequest<NivelAPI>('/niveis', { method: 'POST', body: data }),
  update: (id: number, data: Partial<NivelAPI>) =>
    apiRequest<NivelAPI>(`/niveis/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/niveis/${id}`, { method: 'DELETE' }),
}

// ============ COLABORADORES ============

export interface ColaboradorAPI {
  id: number
  nome: string
  cargo: string
  setor_id: number
  subsetor_id: number | null
  nivel_id: number
  subnivel_id: number | null
  superior_id: number | null
  permissoes: string[]
  foto_url: string | null
  email: string | null
  telefone: string | null
  created_at: string | null
  updated_at: string | null
}

export const colaboradoresApi = {
  list: (filters?: { setor_id?: number; nivel_id?: number }) => {
    const params = new URLSearchParams()
    if (filters?.setor_id) params.append('setor_id', String(filters.setor_id))
    if (filters?.nivel_id) params.append('nivel_id', String(filters.nivel_id))
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiRequest<ColaboradorAPI[]>(`/colaboradores${query}`)
  },
  get: (id: number) => apiRequest<ColaboradorAPI>(`/colaboradores/${id}`),
  create: (data: Omit<ColaboradorAPI, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<ColaboradorAPI>('/colaboradores', { method: 'POST', body: data }),
  update: (id: number, data: Partial<ColaboradorAPI>) =>
    apiRequest<ColaboradorAPI>(`/colaboradores/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/colaboradores/${id}`, { method: 'DELETE' }),
  getSubordinados: (id: number) =>
    apiRequest<ColaboradorAPI[]>(`/colaboradores/${id}/subordinados`),
}

// ============ CARGOS ============

export interface CargoAPI {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  nivel_id: number | null
  setor_id: number | null
  ordem: number
}

export const cargosApi = {
  list: () => apiRequest<CargoAPI[]>('/cargos'),
  get: (id: number) => apiRequest<CargoAPI>(`/cargos/${id}`),
  create: (data: Omit<CargoAPI, 'id'>) =>
    apiRequest<CargoAPI>('/cargos', { method: 'POST', body: data }),
  update: (id: number, data: Partial<CargoAPI>) =>
    apiRequest<CargoAPI>(`/cargos/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/cargos/${id}`, { method: 'DELETE' }),
}

// ============ TIPOS DE PROJETO ============

export interface TipoProjetoAPI {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  icone: string | null
  cor: string | null
  cor_texto: string | null
  ordem: number
}

export const tiposProjetoApi = {
  list: () => apiRequest<TipoProjetoAPI[]>('/tipos-projeto'),
  get: (id: number) => apiRequest<TipoProjetoAPI>(`/tipos-projeto/${id}`),
  create: (data: Omit<TipoProjetoAPI, 'id'>) =>
    apiRequest<TipoProjetoAPI>('/tipos-projeto', { method: 'POST', body: data }),
  update: (id: number, data: Partial<TipoProjetoAPI>) =>
    apiRequest<TipoProjetoAPI>(`/tipos-projeto/${id}`, { method: 'PUT', body: data }),
  delete: (id: number) =>
    apiRequest<void>(`/tipos-projeto/${id}`, { method: 'DELETE' }),
}

// ============ VERSÕES DO ORGANOGRAMA ============

export interface OrganoVersionAPI {
  id: number
  nome: string
  descricao: string | null
  status: string
  snapshot: ColaboradorAPI[]
  changes_summary: {
    total_changes: number
    hierarchy_changes: Array<{
      colaborador_id: number
      colaborador_nome: string
      change_type: string
      field: string | null
      old_value: unknown
      new_value: unknown
    }>
    data_changes: Array<{
      colaborador_id: number
      colaborador_nome: string
      change_type: string
      field: string | null
      old_value: unknown
      new_value: unknown
    }>
  } | null
  created_at: string | null
  updated_at: string | null
  approved_at: string | null
}

export interface OrganoVersionListAPI {
  id: number
  nome: string
  descricao: string | null
  status: string
  changes_count: number
  created_at: string | null
  updated_at: string | null
}

// Tipo para snapshot (não precisa de created_at/updated_at)
export type ColaboradorSnapshotAPI = Omit<ColaboradorAPI, 'created_at' | 'updated_at'>

export const versionsApi = {
  list: () => apiRequest<OrganoVersionListAPI[]>('/versions'),
  getCurrent: () => apiRequest<OrganoVersionAPI>('/versions/current'),
  get: (id: number) => apiRequest<OrganoVersionAPI>(`/versions/${id}`),
  create: (data: { nome: string; descricao?: string }) =>
    apiRequest<OrganoVersionAPI>('/versions', { method: 'POST', body: data }),
  update: (id: number, data: { nome?: string; descricao?: string; snapshot?: ColaboradorSnapshotAPI[] }) =>
    apiRequest<OrganoVersionAPI>(`/versions/${id}`, { method: 'PUT', body: data }),
  approve: (id: number) =>
    apiRequest<OrganoVersionAPI>(`/versions/${id}/approve`, { method: 'POST' }),
  archive: (id: number) =>
    apiRequest<OrganoVersionAPI>(`/versions/${id}/archive`, { method: 'POST' }),
  delete: (id: number) =>
    apiRequest<void>(`/versions/${id}`, { method: 'DELETE' }),
}

// ============ HEALTH CHECK ============

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    return response.ok
  } catch {
    return false
  }
}

// ============ CONVERSORES API <-> STORE ============

import type { Colaborador, Setor, Subsetor, NivelHierarquico, Subnivel, Cargo, TipoProjeto } from '@/types'

/**
 * Converte colaborador da API para o formato do store
 */
export function apiToColaborador(api: ColaboradorAPI): Colaborador {
  return {
    id: api.id,
    nome: api.nome,
    cargo: api.cargo,
    setorId: api.setor_id,
    subsetorId: api.subsetor_id ?? undefined,
    nivelId: api.nivel_id,
    subnivelId: api.subnivel_id ?? undefined,
    superiorId: api.superior_id ?? undefined,
    permissoes: api.permissoes as Colaborador['permissoes'],
    fotoUrl: api.foto_url ?? undefined,
    email: api.email ?? undefined,
    telefone: api.telefone ?? undefined,
    criadoEm: api.created_at ?? new Date().toISOString(),
    atualizadoEm: api.updated_at ?? new Date().toISOString(),
  }
}

/**
 * Converte colaborador do store para o formato da API
 */
export function colaboradorToApi(c: Colaborador): Omit<ColaboradorAPI, 'id' | 'created_at' | 'updated_at'> {
  return {
    nome: c.nome,
    cargo: c.cargo,
    setor_id: c.setorId,
    subsetor_id: c.subsetorId ?? null,
    nivel_id: c.nivelId,
    subnivel_id: c.subnivelId ?? null,
    superior_id: c.superiorId ?? null,
    permissoes: c.permissoes,
    foto_url: c.fotoUrl ?? null,
    email: c.email ?? null,
    telefone: c.telefone ?? null,
  }
}

/**
 * Converte setor da API para o formato do store
 */
export function apiToSetor(api: SetorAPI): Setor {
  return {
    id: api.id,
    codigo: api.codigo,
    nome: api.nome,
    nomeCompleto: api.nome_completo ?? undefined,
    cor: api.cor,
    corTexto: api.cor_texto,
    icone: api.icone ?? undefined,
    diretorId: api.diretor_id ?? undefined,
    ordem: api.ordem,
  }
}

/**
 * Converte subsetor da API para o formato do store
 */
export function apiToSubsetor(api: SubsetorAPI): Subsetor {
  return {
    id: api.id,
    setorId: api.setor_id,
    nome: api.nome,
    cor: api.cor ?? undefined,
    corTexto: api.cor_texto ?? undefined,
  }
}

/**
 * Converte setor do store para o formato da API
 */
export function setorToApi(s: Setor): Omit<SetorAPI, 'id' | 'subsetores'> {
  return {
    codigo: s.codigo,
    nome: s.nome,
    nome_completo: s.nomeCompleto ?? null,
    cor: s.cor,
    cor_texto: s.corTexto,
    icone: s.icone ?? null,
    diretor_id: s.diretorId ?? null,
    ordem: s.ordem,
  }
}

/**
 * Converte subsetor do store para o formato da API
 */
export function subsetorToApi(s: Subsetor): Omit<SubsetorAPI, 'id'> {
  return {
    setor_id: s.setorId,
    nome: s.nome,
    cor: s.cor ?? null,
    cor_texto: s.corTexto ?? null,
  }
}

/**
 * Converte nível da API para o formato do store
 */
export function apiToNivel(api: NivelAPI): NivelHierarquico {
  return {
    id: api.id,
    nivel: api.nivel,
    nome: api.nome,
    descricao: api.descricao ?? undefined,
    cor: api.cor,
    corTexto: api.cor_texto,
    ordem: api.ordem,
    subniveis: api.subniveis.map(apiToSubnivel),
  }
}

/**
 * Converte subnível da API para o formato do store
 */
export function apiToSubnivel(api: SubnivelAPI): Subnivel {
  return {
    id: api.id,
    nome: api.nome,
    abreviacao: api.abreviacao ?? undefined,
    ordem: api.ordem,
  }
}

/**
 * Converte nível do store para o formato da API
 */
export function nivelToApi(n: NivelHierarquico): Omit<NivelAPI, 'id' | 'subniveis'> {
  return {
    nivel: n.nivel,
    nome: n.nome,
    descricao: n.descricao ?? null,
    cor: n.cor,
    cor_texto: n.corTexto,
    ordem: n.ordem,
  }
}

/**
 * Converte subnível do store para o formato da API
 */
export function subnivelToApi(s: Subnivel, nivelId: number): Omit<SubnivelAPI, 'id'> {
  return {
    nivel_id: nivelId,
    nome: s.nome,
    abreviacao: s.abreviacao ?? null,
    ordem: s.ordem,
  }
}

/**
 * Converte cargo da API para o formato do store
 */
export function apiToCargo(api: CargoAPI): Cargo {
  return {
    id: api.id,
    codigo: api.codigo,
    nome: api.nome,
    descricao: api.descricao ?? undefined,
    nivelId: api.nivel_id ?? undefined,
    setorId: api.setor_id ?? undefined,
    ordem: api.ordem,
  }
}

/**
 * Converte cargo do store para o formato da API
 */
export function cargoToApi(c: Cargo): Omit<CargoAPI, 'id'> {
  return {
    codigo: c.codigo ?? '',
    nome: c.nome,
    descricao: c.descricao ?? null,
    nivel_id: c.nivelId ?? null,
    setor_id: c.setorId ?? null,
    ordem: c.ordem ?? 0,
  }
}

/**
 * Converte tipo de projeto da API para o formato do store
 */
export function apiToTipoProjeto(api: TipoProjetoAPI): TipoProjeto {
  return {
    id: api.id,
    codigo: api.codigo,
    nome: api.nome,
    descricao: api.descricao ?? undefined,
    icone: api.icone ?? undefined,
    cor: api.cor ?? '#6B7280',
    corTexto: api.cor_texto ?? '#ffffff',
    ordem: api.ordem,
  }
}

/**
 * Converte tipo de projeto do store para o formato da API
 */
export function tipoProjetoToApi(t: TipoProjeto): Omit<TipoProjetoAPI, 'id'> {
  return {
    codigo: t.codigo,
    nome: t.nome,
    descricao: t.descricao ?? null,
    icone: t.icone ?? null,
    cor: t.cor ?? null,
    cor_texto: t.corTexto ?? null,
    ordem: t.ordem ?? 0,
  }
}
