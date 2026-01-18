---
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, TodoWrite
description: Investigar e corrigir um bug no sistema AZ TECH
argument-hint: [descrição do bug]
model: sonnet
---

# /fix-bug - Correção de Bug

**Bug reportado:** $ARGUMENTS

## Contexto Atual

- Git status: !`git status --short`
- Branch atual: !`git branch --show-current`

## Workflow Obrigatório

### 1. INVESTIGAÇÃO
Antes de qualquer correção:
1. Entender o comportamento esperado vs atual
2. Identificar arquivos relacionados usando Grep/Glob
3. Ler o código afetado com Read
4. Verificar se há testes existentes

### 2. DIAGNÓSTICO
- Identificar a causa raiz (não apenas o sintoma)
- Documentar o fluxo que causa o bug
- Verificar se há outros locais com o mesmo padrão

### 3. CORREÇÃO
1. Criar TodoWrite com as tarefas necessárias
2. Implementar a menor correção possível
3. Evitar refatorações não relacionadas
4. Manter compatibilidade com código existente

### 4. VALIDAÇÃO
```bash
npm run type-check  # Zero erros TypeScript
npm test           # Testes passando
```

### 5. DOCUMENTAÇÃO
Ao finalizar, reportar:
- Causa raiz identificada
- Arquivos modificados
- Testes adicionados (se aplicável)

## Regras
- NÃO fazer refatorações além do necessário
- NÃO introduzir novas dependências sem justificativa
- SEMPRE testar a correção antes de finalizar
