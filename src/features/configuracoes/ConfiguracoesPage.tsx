/**
 * ConfiguracoesPage - Pagina principal do modulo de Configuracoes
 *
 * Layout: Sidebar lateral com grupos colapsaveis
 *
 * Grupos:
 * 1. ESTRUTURA ORGANIZACIONAL
 *    - Niveis Hierarquicos
 *    - Setores
 *    - Cargos
 *    - Colaboradores
 *
 * 2. GESTAO DE SERVICOS
 *    - Empresas
 *    - Clientes
 *    - Categorias
 *    - Tipos de Servico
 */

import { useState, memo, useCallback } from 'react'
import { cn } from '@/utils'
import {
  Layers,
  Building2,
  Briefcase,
  Users,
  Building,
  UserCircle,
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { NiveisConfig } from './components/NiveisConfig'
import { SetoresConfig } from './components/SetoresConfig'
import { CargosConfig } from './components/CargosConfig'
import { ColaboradoresConfig } from './components/ColaboradoresConfig'

type ConfigTab =
  | 'niveis'
  | 'setores'
  | 'cargos'
  | 'colaboradores'

type ConfigGroup = 'estrutura'

interface TabConfig {
  id: ConfigTab
  label: string
  icon: typeof Layers
  description: string
  group: ConfigGroup
}

interface GroupConfig {
  id: ConfigGroup
  label: string
  icon: typeof Layers
  color: string
}

const GROUPS: GroupConfig[] = [
  {
    id: 'estrutura',
    label: 'Estrutura Organizacional',
    icon: Building2,
    color: 'blue',
  },
]

const TABS: TabConfig[] = [
  // Estrutura Organizacional
  {
    id: 'niveis',
    label: 'Niveis Hierarquicos',
    icon: Layers,
    description: 'Niveis da hierarquia organizacional e subniveis de senioridade',
    group: 'estrutura',
  },
  {
    id: 'setores',
    label: 'Setores',
    icon: Building2,
    description: 'Departamentos da empresa e subsetores',
    group: 'estrutura',
  },
  {
    id: 'cargos',
    label: 'Cargos',
    icon: Briefcase,
    description: 'Cargos disponiveis por nivel e setor',
    group: 'estrutura',
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    icon: Users,
    description: 'Gestao completa de colaboradores',
    group: 'estrutura',
  },
]

const TAB_COMPONENTS: Record<ConfigTab, React.ComponentType> = {
  niveis: NiveisConfig,
  setores: SetoresConfig,
  cargos: CargosConfig,
  colaboradores: ColaboradoresConfig,
}

export const ConfiguracoesPage = memo(function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('niveis')
  const [expandedGroups, setExpandedGroups] = useState<Set<ConfigGroup>>(new Set(['estrutura']))

  const ActiveComponent = TAB_COMPONENTS[activeTab]
  const activeTabConfig = TABS.find((t) => t.id === activeTab)

  const toggleGroup = useCallback((groupId: ConfigGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const getTabsForGroup = useCallback((groupId: ConfigGroup) => {
    return TABS.filter((tab) => tab.group === groupId)
  }, [])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-aztech-primary" />
            <h1 className="text-lg font-bold text-gray-800">Configuracoes</h1>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {GROUPS.map((group) => {
            const GroupIcon = group.icon
            const isExpanded = expandedGroups.has(group.id)
            const groupTabs = getTabsForGroup(group.id)
            const hasActiveTab = groupTabs.some((t) => t.id === activeTab)

            return (
              <div key={group.id} className="mb-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    hasActiveTab
                      ? 'bg-aztech-primary/10 text-aztech-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <GroupIcon className="h-4 w-4" />
                  <span className="flex-1 text-left">{group.label}</span>
                </button>

                {/* Group Tabs */}
                {isExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {groupTabs.map((tab) => {
                      const TabIcon = tab.icon
                      const isActive = activeTab === tab.id

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive
                              ? 'bg-aztech-primary text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <TabIcon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Sistema AZ TECH v1.0
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="px-6 py-4 bg-white border-b">
          <div className="flex items-center gap-3">
            {activeTabConfig && (
              <>
                {(() => {
                  const Icon = activeTabConfig.icon
                  return <Icon className="h-6 w-6 text-aztech-primary" />
                })()}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{activeTabConfig.label}</h2>
                  <p className="text-sm text-gray-500">{activeTabConfig.description}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
})

ConfiguracoesPage.displayName = 'ConfiguracoesPage'
