/**
 * Serviço para persistir dados no código-fonte
 * Comunica com o servidor local (persist-server.js)
 */

const PERSIST_SERVER_URL = 'http://localhost:3001'

interface PersistResult {
  success: boolean
  message: string
  timestamp?: string
  error?: string
}

/**
 * Salva os dados no código-fonte via servidor local
 */
export async function persistToSource(data: {
  colaboradores?: unknown[]
  setores?: unknown[]
  subsetores?: unknown[]
  niveis?: unknown[]
}): Promise<PersistResult> {
  try {
    const response = await fetch(PERSIST_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    // Se o servidor não estiver rodando
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Servidor de persistência não está rodando',
        error: 'Execute: node server/persist-server.js',
      }
    }

    return {
      success: false,
      message: 'Erro ao salvar dados',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Verifica se o servidor de persistência está rodando
 */
export async function checkPersistServer(): Promise<boolean> {
  try {
    // Envia requisição vazia só para testar conexão
    const response = await fetch(PERSIST_SERVER_URL, {
      method: 'OPTIONS',
    })
    return response.ok || response.status === 204
  } catch {
    return false
  }
}
