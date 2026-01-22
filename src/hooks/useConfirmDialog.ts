/**
 * useConfirmDialog - Hook para gerenciar estado do ConfirmDialog
 *
 * Fornece uma API simples para abrir diálogos de confirmação.
 * Retorna uma Promise que resolve quando o usuário confirma ou rejeita.
 */

import { useState, useCallback, useRef } from 'react'
import type { ConfirmDialogProps } from '@/components/ui/ConfirmDialog'

type DialogConfig = Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel' | 'isLoading'>

interface UseConfirmDialogReturn {
  isOpen: boolean
  config: DialogConfig
  isLoading: boolean
  confirm: (config: DialogConfig) => Promise<boolean>
  close: () => void
  setLoading: (loading: boolean) => void
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<DialogConfig>({
    title: '',
    message: '',
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((dialogConfig: DialogConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfig(dialogConfig)
      setIsOpen(true)
      setIsLoading(false)
    })
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setIsLoading(false)
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setIsOpen(false)
    setIsLoading(false)
  }, [])

  // Expor handleConfirm via config para o componente poder chamar
  const fullConfig = {
    ...config,
    onConfirm: handleConfirm,
    onCancel: close,
  }

  return {
    isOpen,
    config: fullConfig,
    isLoading,
    confirm,
    close,
    setLoading: setIsLoading,
  }
}
