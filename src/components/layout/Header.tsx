/**
 * Header principal da aplicação
 */

import { Building2 } from 'lucide-react'
import { cn } from '@/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-aztech-primary text-white shadow-md',
        'px-6 py-4',
        'flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">AZ TECH</h1>
          <p className="text-xs text-blue-200">Sistema de Gestão Organizacional</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-blue-200">v0.2.0</span>
      </div>
    </header>
  )
}
