/**
 * Hook para sincronizar stores com a API
 * Permite alternar entre modo local (localStorage) e API (PostgreSQL)
 *
 * IMPORTANTE: Usa conversores de @/services/api para evitar duplicação
 *
 * ADR-006: Implementa polling periódico (30s) para sincronização
 */

import { useCallback, useState } from 'react'
import { useOrganoStore, useConfigStore } from '@/stores'
import {
  colaboradoresApi,
  setoresApi,
  niveisApi,
  checkApiHealth,
  // Conversores importados de api.ts (DRY - não duplicar)
  apiToColaborador,
  colaboradorToApi,
  apiToSetor,
  apiToNivel,
  type ColaboradorAPI,
} from '@/services/api'
import type { Colaborador } from '@/types'
import { usePolling, formatLastUpdated } from './usePolling'

/** Intervalo padrão de polling: 30 segundos */
const DEFAULT_POLLING_INTERVAL = 30000

interface UseApiSyncOptions {
  /** Se o polling automático deve estar ativo (padrão: true) */
  pollingEnabled?: boolean
  /** Intervalo de polling em ms (padrão: 30000) */
  pollingInterval?: number
}

export function useApiSync(options: UseApiSyncOptions = {}) {
  const { pollingEnabled = true, pollingInterval = DEFAULT_POLLING_INTERVAL } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

  // Store actions
  const setColaboradores = useOrganoStore((s) => s.setColaboradores)
  const setSetores = useConfigStore((s) => s.setSetores)
  const setNiveis = useConfigStore((s) => s.setNiveis)

  // Verificar se API está disponível
  const checkApi = useCallback(async () => {
    const available = await checkApiHealth()
    setApiAvailable(available)
    return available
  }, [])

  // Carregar todos os dados da API
  const loadFromApi = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [colaboradores, setores, niveis] = await Promise.all([
        colaboradoresApi.list(),
        setoresApi.list(),
        niveisApi.list(),
      ])

      setColaboradores(colaboradores.map(apiToColaborador))
      setSetores(setores.map(apiToSetor))
      setNiveis(niveis.map(apiToNivel))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setColaboradores, setSetores, setNiveis])

  // Polling para sincronização automática (ADR-006)
  const polling = usePolling({
    onPoll: loadFromApi,
    interval: pollingInterval,
    enabled: pollingEnabled,
    immediate: false, // Não carrega imediatamente, DataProvider já faz isso
  })

  // Salvar colaborador na API
  const saveColaborador = useCallback(
    async (colaborador: Omit<Colaborador, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      setIsLoading(true)
      try {
        const apiData = colaboradorToApi(colaborador as Colaborador) as Omit<ColaboradorAPI, 'id'>
        const result = await colaboradoresApi.create(apiData)
        return apiToColaborador(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Atualizar colaborador na API
  const updateColaborador = useCallback(
    async (id: number, data: Partial<Colaborador>) => {
      setIsLoading(true)
      try {
        const apiData = colaboradorToApi(data as Colaborador)
        const result = await colaboradoresApi.update(id, apiData)
        return apiToColaborador(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Deletar colaborador na API
  const deleteColaborador = useCallback(async (id: number) => {
    setIsLoading(true)
    try {
      await colaboradoresApi.delete(id)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    // Estado
    isLoading,
    error,
    apiAvailable,

    // API Operations
    checkApi,
    loadFromApi,
    saveColaborador,
    updateColaborador,
    deleteColaborador,

    // Polling (ADR-006)
    lastUpdated: polling.lastUpdated,
    lastUpdatedFormatted: formatLastUpdated(polling.lastUpdated),
    isPolling: polling.isPolling,
    isFetching: polling.isFetching,
    pollingError: polling.error,
    startPolling: polling.startPolling,
    stopPolling: polling.stopPolling,
    refresh: polling.refresh,
  }
}

// Re-export para conveniência
export { formatLastUpdated } from './usePolling'
