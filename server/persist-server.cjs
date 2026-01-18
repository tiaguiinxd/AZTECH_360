/**
 * Servidor local para persistir dados do sistema AZ TECH
 * Recebe dados via POST e atualiza os arquivos TypeScript
 *
 * Executar: node server/persist-server.js
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3001
const SRC_PATH = path.join(__dirname, '..', 'src', 'data')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Gera o arquivo colaboradores.ts
function generateColaboradoresFile(colaboradores) {
  return `/**
 * Colaboradores da AZ TECH
 * Arquivo gerado automaticamente pelo servidor de persistência
 * Última atualização: ${new Date().toISOString()}
 */

import type { Colaborador } from '@/types'

export const COLABORADORES_INICIAIS: Colaborador[] = ${JSON.stringify(colaboradores, null, 2)}

/**
 * Encontra um colaborador pelo ID
 */
export function getColaboradorById(id: number): Colaborador | undefined {
  return COLABORADORES_INICIAIS.find((c) => c.id === id)
}

/**
 * Encontra colaboradores por setor
 */
export function getColaboradoresBySetorId(setorId: number): Colaborador[] {
  return COLABORADORES_INICIAIS.filter((c) => c.setorId === setorId)
}

/**
 * Encontra colaboradores por nível
 */
export function getColaboradoresByNivelId(nivelId: number): Colaborador[] {
  return COLABORADORES_INICIAIS.filter((c) => c.nivelId === nivelId)
}

/**
 * Encontra subordinados de um colaborador
 */
export function getSubordinados(superiorId: number): Colaborador[] {
  return COLABORADORES_INICIAIS.filter((c) => c.superiorId === superiorId)
}
`
}

// Gera o arquivo setores.ts
function generateSetoresFile(setores, subsetores) {
  return `/**
 * Setores da AZ TECH
 * Arquivo gerado automaticamente pelo servidor de persistência
 * Última atualização: ${new Date().toISOString()}
 */

import type { Setor, Subsetor } from '@/types'

export const SETORES: Setor[] = ${JSON.stringify(setores, null, 2)}

export const SUBSETORES: Subsetor[] = ${JSON.stringify(subsetores || [], null, 2)}

// Helper functions
export function getSetorById(id: number): Setor | undefined {
  return SETORES.find((s) => s.id === id)
}

export function getSubsetoresBySetorId(setorId: number): Subsetor[] {
  return SUBSETORES.filter((s) => s.setorId === setorId)
}
`
}

// Gera o arquivo niveis.ts
function generateNiveisFile(niveis) {
  return `/**
 * Níveis Hierárquicos da AZ TECH
 * Arquivo gerado automaticamente pelo servidor de persistência
 * Última atualização: ${new Date().toISOString()}
 */

import type { NivelHierarquico, Subnivel } from '@/types'

export const NIVEIS_HIERARQUICOS: NivelHierarquico[] = ${JSON.stringify(niveis, null, 2)}

// Subníveis extraídos dos níveis (para compatibilidade)
export const SUBNIVEIS_TECNICO: Subnivel[] = NIVEIS_HIERARQUICOS.find(n => n.id === 4)?.subniveis || []
export const SUBNIVEIS_OPERACIONAL: Subnivel[] = NIVEIS_HIERARQUICOS.find(n => n.id === 5)?.subniveis || []

// Helper functions
export function getNivelById(id: number): NivelHierarquico | undefined {
  return NIVEIS_HIERARQUICOS.find((n) => n.id === id)
}

export function getSubnivelById(nivelId: number, subnivelId: number): Subnivel | undefined {
  const nivel = getNivelById(nivelId)
  return nivel?.subniveis?.find((s) => s.id === subnivelId)
}
`
}

// Processa requisição
function handleRequest(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  // Apenas POST
  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let body = ''
  req.on('data', chunk => { body += chunk })

  req.on('end', () => {
    try {
      const data = JSON.parse(body)
      const results = []

      // Salvar colaboradores
      if (data.colaboradores) {
        const filePath = path.join(SRC_PATH, 'colaboradores.ts')
        const content = generateColaboradoresFile(data.colaboradores)
        fs.writeFileSync(filePath, content, 'utf8')
        results.push(`colaboradores.ts atualizado (${data.colaboradores.length} registros)`)
        console.log(`[${new Date().toLocaleTimeString()}] Salvos ${data.colaboradores.length} colaboradores`)
      }

      // Salvar setores
      if (data.setores) {
        const filePath = path.join(SRC_PATH, 'setores.ts')
        const content = generateSetoresFile(data.setores, data.subsetores)
        fs.writeFileSync(filePath, content, 'utf8')
        results.push(`setores.ts atualizado (${data.setores.length} setores)`)
        console.log(`[${new Date().toLocaleTimeString()}] Salvos ${data.setores.length} setores`)
      }

      // Salvar níveis
      if (data.niveis) {
        const filePath = path.join(SRC_PATH, 'niveis.ts')
        const content = generateNiveisFile(data.niveis)
        fs.writeFileSync(filePath, content, 'utf8')
        results.push(`niveis.ts atualizado (${data.niveis.length} níveis)`)
        console.log(`[${new Date().toLocaleTimeString()}] Salvos ${data.niveis.length} níveis`)
      }

      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: true,
        message: results.join(', '),
        timestamp: new Date().toISOString()
      }))

    } catch (error) {
      console.error('Erro ao processar:', error)
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: error.message }))
    }
  })
}

// Criar servidor
const server = http.createServer(handleRequest)

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       AZ TECH - Servidor de Persistência de Dados          ║
╠════════════════════════════════════════════════════════════╣
║  Rodando em: http://localhost:${PORT}                         ║
║  Arquivos:   ${SRC_PATH}
║                                                            ║
║  Use o botão "Salvar no Código" no sistema para            ║
║  persistir suas alterações nos arquivos TypeScript.        ║
╚════════════════════════════════════════════════════════════╝
`)
})
