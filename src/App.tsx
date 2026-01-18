/**
 * App principal do Sistema AZ TECH
 *
 * ARQUITETURA:
 * - DataProvider carrega todos os dados do PostgreSQL na inicialização
 * - Stores (organoStore, configStore) mantêm os dados em memória
 * - Operações CRUD chamam a API e atualizam o estado local
 */

import { Header, TabNavigation, useTabNavigation } from '@/components/layout'
import type { TabId } from '@/components/layout'
import { OrganoramaPage, ConfiguracoesPage } from '@/features'
import { DataProvider } from '@/providers/DataProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function ProjetosPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Projetos</h2>
      <p className="text-gray-600">
        Gestão de projetos e alocação de equipes.
      </p>
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          Este módulo será implementado na Fase 2.
        </p>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
      <p className="text-gray-600">
        Visão gerencial com métricas e alertas.
      </p>
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          Este módulo será implementado na Fase 3.
        </p>
      </div>
    </div>
  )
}

const PAGE_COMPONENTS: Record<TabId, React.ComponentType> = {
  organograma: OrganoramaPage,
  projetos: ProjetosPage,
  dashboard: DashboardPage,
  configuracoes: ConfiguracoesPage,
}

function AppContent() {
  const { activeTab, setActiveTab } = useTabNavigation('organograma')
  const PageComponent = PAGE_COMPONENTS[activeTab]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        <PageComponent />
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  )
}

export default App
