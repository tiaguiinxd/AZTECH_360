/**
 * ConfiguracoesPage - Página principal do módulo de Configurações
 *
 * Abas:
 * 1. Níveis Hierárquicos (+ subníveis)
 * 2. Setores (+ subsetores)
 * 3. Cargos
 * 4. Colaboradores (CRUD completo)
 * 5. Tipos de Projeto
 */

import { useState, memo } from 'react'
import { cn } from '@/utils'
import {
  Layers,
  Building2,
  Briefcase,
  Users,
  FolderKanban,
} from 'lucide-react'
import { NiveisConfig } from './components/NiveisConfig'
import { SetoresConfig } from './components/SetoresConfig'
import { CargosConfig } from './components/CargosConfig'
import { ColaboradoresConfig } from './components/ColaboradoresConfig'
import { TiposProjetoConfig } from './components/TiposProjetoConfig'

type ConfigTab = 'niveis' | 'setores' | 'cargos' | 'colaboradores' | 'tipos-projeto'

interface TabConfig {
  id: ConfigTab
  label: string
  icon: typeof Layers
  description: string
}

const TABS: TabConfig[] = [
  {
    id: 'niveis',
    label: 'Níveis Hierárquicos',
    icon: Layers,
    description: 'Níveis da hierarquia organizacional e subníveis de senioridade',
  },
  {
    id: 'setores',
    label: 'Setores',
    icon: Building2,
    description: 'Departamentos da empresa e subsetores',
  },
  {
    id: 'cargos',
    label: 'Cargos',
    icon: Briefcase,
    description: 'Cargos disponíveis por nível e setor',
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    icon: Users,
    description: 'Gestão completa de colaboradores',
  },
  {
    id: 'tipos-projeto',
    label: 'Tipos de Projeto',
    icon: FolderKanban,
    description: 'Categorias e tipos de projetos',
  },
]

const TAB_COMPONENTS: Record<ConfigTab, React.ComponentType> = {
  niveis: NiveisConfig,
  setores: SetoresConfig,
  cargos: CargosConfig,
  colaboradores: ColaboradoresConfig,
  'tipos-projeto': TiposProjetoConfig,
}

export const ConfiguracoesPage = memo(function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('niveis')

  const ActiveComponent = TAB_COMPONENTS[activeTab]
  const activeTabConfig = TABS.find((t) => t.id === activeTab)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie a estrutura organizacional e configurações do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <nav className="flex gap-1 -mb-px" aria-label="Tabs de configuração">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-aztech-primary text-aztech-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <p className="text-sm text-gray-600">{activeTabConfig?.description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <ActiveComponent />
      </div>
    </div>
  )
})

ConfiguracoesPage.displayName = 'ConfiguracoesPage'
