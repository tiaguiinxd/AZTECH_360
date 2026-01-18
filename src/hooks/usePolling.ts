/**
 * Hook para polling periódico de dados da API
 *
 * ADR-006: Polling vs WebSocket
 * Decisão: Iniciar com polling simples (30s). WebSocket é overkill para MVP.
 *
 * Uso:
 * ```tsx
 * const { lastUpdated, isPolling, startPolling, stopPolling } = usePolling({
 *   onPoll: loadFromApi,
 *   interval: 30000, // 30 segundos
 *   enabled: true,
 * })
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface UsePollingOptions {
  /** Função a ser chamada em cada ciclo de polling */
  onPoll: () => Promise<void> | Promise<boolean> | void
  /** Intervalo em milliseconds (padrão: 30000 = 30s) */
  interval?: number
  /** Se o polling deve iniciar automaticamente (padrão: true) */
  enabled?: boolean
  /** Se deve fazer polling imediatamente ao montar (padrão: false) */
  immediate?: boolean
}

interface UsePollingReturn {
  /** Timestamp da última atualização bem-sucedida */
  lastUpdated: Date | null
  /** Se o polling está ativo */
  isPolling: boolean
  /** Se está carregando dados agora */
  isFetching: boolean
  /** Erro da última tentativa de polling */
  error: string | null
  /** Inicia o polling */
  startPolling: () => void
  /** Para o polling */
  stopPolling: () => void
  /** Força uma atualização imediata */
  refresh: () => Promise<void>
}

const DEFAULT_INTERVAL = 30000 // 30 segundos

export function usePolling({
  onPoll,
  interval = DEFAULT_INTERVAL,
  enabled = true,
  immediate = false,
}: UsePollingOptions): UsePollingReturn {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(enabled)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onPollRef = useRef(onPoll)

  // Mantém a referência atualizada sem causar re-renders
  useEffect(() => {
    onPollRef.current = onPoll
  }, [onPoll])

  // Função de polling
  const executePoll = useCallback(async () => {
    if (isFetching) return // Evita chamadas simultâneas

    setIsFetching(true)
    setError(null)

    try {
      await onPollRef.current()
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados')
    } finally {
      setIsFetching(false)
    }
  }, [isFetching])

  // Refresh manual
  const refresh = useCallback(async () => {
    await executePoll()
  }, [executePoll])

  // Inicia o polling
  const startPolling = useCallback(() => {
    setIsPolling(true)
  }, [])

  // Para o polling
  const stopPolling = useCallback(() => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Configura o intervalo quando isPolling muda
  useEffect(() => {
    if (isPolling) {
      // Executa imediatamente se configurado
      if (immediate && !lastUpdated) {
        executePoll()
      }

      // Configura o intervalo
      intervalRef.current = setInterval(executePoll, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPolling, interval, immediate, lastUpdated, executePoll])

  // Sincroniza com prop enabled
  useEffect(() => {
    if (enabled && !isPolling) {
      startPolling()
    } else if (!enabled && isPolling) {
      stopPolling()
    }
  }, [enabled, isPolling, startPolling, stopPolling])

  return {
    lastUpdated,
    isPolling,
    isFetching,
    error,
    startPolling,
    stopPolling,
    refresh,
  }
}

/**
 * Formata a data da última atualização para exibição
 */
export function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Nunca atualizado'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)

  if (seconds < 10) return 'Agora mesmo'
  if (seconds < 60) return `Há ${seconds}s`
  if (minutes < 60) return `Há ${minutes}min`

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
