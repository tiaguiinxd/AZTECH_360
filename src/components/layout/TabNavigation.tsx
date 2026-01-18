/**
 * Navegação por abas do sistema
 */

import { useState } from 'react'
import { Users, FolderKanban, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/utils'

export type TabId = 'organograma' | 'projetos' | 'dashboard' | 'configuracoes'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  {
    id: 'organograma',
    label: 'Organograma',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'projetos',
    label: 'Projetos',
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: <Settings className="h-5 w-5" />,
  },
]

interface TabNavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  className?: string
}

export function TabNavigation({
  activeTab,
  onTabChange,
  className,
}: TabNavigationProps) {
  return (
    <nav
      className={cn(
        'bg-white border-b border-gray-200',
        'px-6',
        className
      )}
    >
      <div className="flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3',
              'text-sm font-medium',
              'border-b-2 transition-colors',
              'hover:text-aztech-primary hover:bg-gray-50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-aztech-primary focus-visible:ring-offset-2',
              activeTab === tab.id
                ? 'border-aztech-primary text-aztech-primary'
                : 'border-transparent text-gray-600'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

/**
 * Hook para gerenciar a aba ativa
 */
export function useTabNavigation(initialTab: TabId = 'organograma') {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  return { activeTab, setActiveTab }
}
