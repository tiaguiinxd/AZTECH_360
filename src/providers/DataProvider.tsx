/**
 * DataProvider - Carrega dados da API ao iniciar a aplicação
 *
 * Este provider é responsável por:
 * 1. Verificar se a API está disponível
 * 2. Carregar todos os dados do PostgreSQL
 * 3. Mostrar loading/error states apropriados
 * 4. Fornecer fallback para modo offline (se implementado)
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useOrganoStore } from '@/stores/organoStore'
import { useConfigStore } from '@/stores/configStore'
import { checkApiHealth } from '@/services/api'

interface DataProviderProps {
  children: ReactNode
}

export function DataProvider({ children }: DataProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  const loadColaboradores = useOrganoStore((state) => state.loadColaboradores)
  const organoError = useOrganoStore((state) => state.error)

  const loadConfigAll = useConfigStore((state) => state.loadAll)
  const configError = useConfigStore((state) => state.error)

  useEffect(() => {
    async function initializeData() {
      setIsInitializing(true)
      setInitError(null)

      try {
        // 1. Verificar se a API está disponível
        const isHealthy = await checkApiHealth()
        setApiAvailable(isHealthy)

        if (!isHealthy) {
          setInitError('Backend não disponível. Verifique se o Docker está rodando.')
          setIsInitializing(false)
          return
        }

        // 2. Carregar dados em paralelo
        await Promise.all([
          loadColaboradores(),
          loadConfigAll(),
        ])

        setIsInitializing(false)
      } catch (error) {
        setInitError(
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao inicializar dados'
        )
        setIsInitializing(false)
      }
    }

    initializeData()
  }, [loadColaboradores, loadConfigAll])

  // Combinar erros
  const error = initError || organoError || configError

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do sistema...</p>
          <p className="text-sm text-gray-400 mt-2">Conectando ao PostgreSQL</p>
        </div>
      </div>
    )
  }

  // Error state - API não disponível
  if (apiAvailable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Backend Não Disponível
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar ao servidor. Verifique se o Docker está rodando:
          </p>
          <div className="bg-gray-100 p-3 rounded-md text-left mb-4">
            <code className="text-sm text-gray-700">
              docker-compose up -d
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Error state - Erro ao carregar dados
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-yellow-500 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao Carregar Dados
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Sucesso - renderiza children
  return <>{children}</>
}
