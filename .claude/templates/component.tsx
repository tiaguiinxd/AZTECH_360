import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface {{ComponentName}}Props extends ComponentProps<'div'> {
  /** Descrição da prop obrigatória */
  data: unknown
  /** Descrição da prop opcional */
  variant?: 'default' | 'compact'
  /** Callback de ação */
  onAction?: (id: number) => void
}

// =============================================================================
// Constants
// =============================================================================

const VARIANT_STYLES = {
  default: 'p-4',
  compact: 'p-2',
} as const

// =============================================================================
// Component
// =============================================================================

/**
 * {{ComponentName}} - Descrição breve do componente
 * 
 * @example
 * ```tsx
 * <{{ComponentName}} data={myData} onAction={handleAction} />
 * ```
 */
export const {{ComponentName}} = forwardRef<HTMLDivElement, {{ComponentName}}Props>(
  ({ data, variant = 'default', onAction, className, children, ...props }, ref) => {
    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------
    
    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------
    
    const handleClick = () => {
      onAction?.(1)
    }
    
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg border bg-card shadow-sm',
          // Interactive states
          'hover:shadow-md transition-shadow',
          // Variant
          VARIANT_STYLES[variant],
          // Custom
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)

{{ComponentName}}.displayName = '{{ComponentName}}'
