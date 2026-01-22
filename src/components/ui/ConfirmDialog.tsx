/**
 * ConfirmDialog - Diálogo de confirmação reutilizável
 *
 * Substitui window.confirm com UI consistente e melhor UX.
 * Suporta diferentes variantes (danger, warning, info).
 */

import { memo, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/utils'
import { AlertTriangle, Trash2, Info, X } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBg: 'bg-red-600 hover:bg-red-700',
    confirmText: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBg: 'bg-amber-600 hover:bg-amber-700',
    confirmText: 'text-white',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBg: 'bg-blue-600 hover:bg-blue-700',
    confirmText: 'text-white',
  },
}

export const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const config = variantConfig[variant]
  const Icon = config.icon

  // Focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel()
      }
    },
    [onCancel, isLoading]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'transform transition-all'
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'absolute top-3 right-3 p-1 rounded-full',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'transition-colors',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-full',
                'flex items-center justify-center',
                config.iconBg
              )}
            >
              <Icon className={cn('h-6 w-6', config.iconColor)} />
            </div>

            {/* Text */}
            <div className="flex-1 pt-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-message"
                className="mt-2 text-sm text-gray-600"
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'text-gray-700 bg-white border border-gray-300',
              'hover:bg-gray-50 transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'transition-colors',
              config.confirmBg,
              config.confirmText,
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
})

ConfirmDialog.displayName = 'ConfirmDialog'
