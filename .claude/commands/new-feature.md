---
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, TodoWrite, Task
description: Implementar nova funcionalidade no sistema AZ TECH
argument-hint: [descrição da feature]
model: sonnet
---

# /new-feature - Nova Funcionalidade

**Feature solicitada:** $ARGUMENTS

## Contexto do Projeto

- Branch: !`git branch --show-current`
- Estrutura src/: !`ls -la src/ 2>/dev/null || dir src /b`

## Workflow Spec-First

### FASE 1: ENTENDIMENTO
Antes de escrever código:
1. O que exatamente a feature deve fazer?
2. Quais são os casos de uso?
3. Quais são os edge cases?
4. Há features similares no sistema?

### FASE 2: EXPLORAÇÃO
Usar Task + Explore agent para:
1. Identificar código existente relacionado
2. Verificar padrões usados no projeto
3. Identificar componentes reutilizáveis
4. Verificar types existentes em src/types/

### FASE 3: PLANEJAMENTO
Criar TodoWrite com:
1. Definir/atualizar types
2. Criar/atualizar store (se necessário)
3. Implementar lógica de negócio
4. Criar componentes
5. Escrever testes
6. Validar com type-check

### FASE 4: IMPLEMENTAÇÃO
Ordem recomendada:
```
1. Types      → src/types/
2. Store      → src/stores/
3. Services   → src/services/
4. Components → src/components/ ou src/features/
5. Tests      → tests/
```

### FASE 5: VALIDAÇÃO
```bash
npm run type-check  # Zero erros
npm test           # Testes passam
```

## Padrões do Projeto

### Componentes
- Máximo 200 linhas
- Props tipadas com interface
- Usar Tailwind (sem inline styles)
- forwardRef + displayName quando necessário

### Stores (Zustand)
- Separar state e actions
- Usar useShallow para arrays/objetos
- Persistir apenas UI state (não dados de negócio)

### API
- Dados vêm do backend (localhost:8000)
- Nunca hardcodar dados no frontend
- Usar converters para transformar API → Frontend types

## Entregáveis
Ao finalizar, apresentar:
- Arquivos criados/modificados
- Como testar a feature
- Limitações conhecidas (se houver)
