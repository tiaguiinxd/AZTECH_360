import { useState, useCallback, useMemo } from 'react'

// =============================================================================
// Types
// =============================================================================

interface Use{{HookName}}Options {
  /** Configuração inicial */
  initialValue?: string
  /** Callback opcional */
  onSuccess?: () => void
}

interface Use{{HookName}}Return {
  /** Estado atual */
  value: string
  /** Está carregando? */
  isLoading: boolean
  /** Mensagem de erro */
  error: string | null
  /** Atualizar valor */
  setValue: (value: string) => void
  /** Resetar estado */
  reset: () => void
}

// =============================================================================
// Hook
// =============================================================================

/**
 * use{{HookName}} - Descrição breve do hook
 * 
 * @example
 * ```tsx
 * const { value, setValue, isLoading } = use{{HookName}}({
 *   initialValue: 'default',
 *   onSuccess: () => console.log('Done!')
 * })
 * ```
 */
export function use{{HookName}}(
  options: Use{{HookName}}Options = {}
): Use{{HookName}}Return {
  const { initialValue = '', onSuccess } = options
  
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  
  const [value, setValueInternal] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  
  const setValue = useCallback((newValue: string) => {
    setValueInternal(newValue)
    setError(null)
    onSuccess?.()
  }, [onSuccess])
  
  const reset = useCallback(() => {
    setValueInternal(initialValue)
    setIsLoading(false)
    setError(null)
  }, [initialValue])
  
  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------
  
  // const derivedValue = useMemo(() => {
  //   return value.toUpperCase()
  // }, [value])
  
  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  
  return {
    value,
    isLoading,
    error,
    setValue,
    reset,
  }
}
