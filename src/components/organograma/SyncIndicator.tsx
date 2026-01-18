/**
 * SyncIndicator - Indicador de sincronização com a API
 *
 * Exibe o status da última sincronização e permite refresh manual.
 * Implementa ADR-006 (Polling vs WebSocket).
 */

import { memo } from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/utils'

interface SyncIndicatorProps {
  /** Timestamp da última atualização formatado */
  lastUpdatedFormatted: string
  /** Se está buscando dados agora */
  isFetching: boolean
  /** Se o polling está ativo */
  isPolling: boolean
  /** Erro da sincronização */
  error?: string | null
  /** Callback para refresh manual */
  onRefresh: () => void
  /** Classes adicionais */
  className?: string
}

export const SyncIndicator = memo(function SyncIndicator({
  lastUpdatedFormatted,
  isFetching,
  isPolling,
  error,
  onRefresh,
  className,
}: SyncIndicatorProps) {
  // Determina o status
  const status = error ? 'error' : isFetching ? 'syncing' : 'ok'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
        status === 'ok' && 'bg-green-50 text-green-700',
        status === 'syncing' && 'bg-blue-50 text-blue-700',
        status === 'error' && 'bg-red-50 text-red-700',
        className
      )}
    >
      {/* Ícone de status */}
      {status === 'ok' && <CheckCircle2 className="h-3.5 w-3.5" />}
      {status === 'syncing' && (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      )}
      {status === 'error' && <AlertCircle className="h-3.5 w-3.5" />}

      {/* Texto */}
      <span className="hidden sm:inline">
        {status === 'syncing' && 'Sincronizando...'}
        {status === 'error' && (error || 'Erro de sincronização')}
        {status === 'ok' && (
          <>
            <Clock className="inline h-3 w-3 mr-1" />
            {lastUpdatedFormatted}
          </>
        )}
      </span>

      {/* Indicador de polling ativo */}
      {isPolling && status === 'ok' && (
        <span className="hidden md:inline text-green-600/70 ml-1">
          (auto)
        </span>
      )}

      {/* Botão de refresh */}
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className={cn(
          'p-1 rounded hover:bg-black/5 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        title="Atualizar agora"
      >
        <RefreshCw
          className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
        />
      </button>
    </div>
  )
})

SyncIndicator.displayName = 'SyncIndicator'
