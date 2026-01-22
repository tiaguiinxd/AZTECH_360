---
allowed-tools: Read, Grep, Glob, Bash, TodoWrite, Task, WebSearch
description: Diagnóstico completo da saúde do sistema AZ TECH
argument-hint: [área específica ou vazio para análise completa]
model: sonnet
---

# /health-check - Diagnóstico de Saúde do Sistema

**Escopo solicitado:** $ARGUMENTS

## Contexto Atual

- Branch: !`git branch --show-current`
- Último commit: !`git log --oneline -1`
- Arquivos modificados: !`git status --short | head -10`

---

## OBJETIVO

Realizar diagnóstico completo do sistema, identificando:
1. Problemas de arquitetura e consistência
2. Código morto ou duplicado
3. Falhas de segurança potenciais
4. Inconsistências frontend/backend
5. Padrões não seguidos
6. Oportunidades de melhoria

---

## ⚠️ WORKFLOW DE DIAGNÓSTICO (EXECUTAR EM ORDEM)

### FASE 1: COLETA DE CONTEXTO
**Criar TodoWrite com todas as fases abaixo, depois:**

```
1. Ler .claude/SYSTEM_MAP.md (estrutura atual do sistema)
2. Ler .claude/LEARNINGS.md (problemas conhecidos)
3. Verificar estrutura de diretórios
```

### FASE 2: ANÁLISE DE ARQUITETURA (Task + architect agent)

**Prompt para architect agent:**
```
Analisar arquitetura do sistema AZ TECH verificando:

1. CONSISTÊNCIA DE CAMADAS
   - Stores Zustand seguem padrão _hasHydrated?
   - Services encapsulam chamadas de API?
   - Types estão organizados por domínio?

2. DEPENDÊNCIAS CIRCULARES
   - Há imports circulares entre módulos?
   - Features dependem apenas de shared/services/stores?

3. SEPARAÇÃO DE RESPONSABILIDADES
   - Componentes respeitam single responsibility?
   - Lógica de negócio está nos lugares certos?

4. ACOPLAMENTO
   - Módulos estão muito acoplados?
   - Há dependências desnecessárias?

Gerar relatório com: CRÍTICO, ALERTA, SUGESTÃO
```

### FASE 3: ANÁLISE DE CÓDIGO FRONTEND (Task + frontend agent)

**Prompt para frontend agent:**
```
Revisar qualidade do código frontend verificando:

1. PADRÕES REACT
   - Hooks são chamados antes de returns?
   - useCallback/useMemo usados corretamente?
   - Keys únicas em listas?
   - Componentes com props tipadas?

2. TAILWIND/CSS
   - Classes inválidas ou não existentes?
   - Responsividade implementada (sm:, md:, lg:)?
   - Consistência visual entre componentes?

3. ACESSIBILIDADE
   - Elementos interativos com aria-labels?
   - Formulários com labels adequados?
   - Contraste de cores adequado?

4. PERFORMANCE
   - Componentes muito grandes (>200 linhas)?
   - Renderizações desnecessárias?
   - Imports pesados que podem ser lazy?

Gerar relatório com: CRÍTICO, ALERTA, SUGESTÃO
```

### FASE 4: ANÁLISE DE BACKEND (Task + reviewer agent)

**Prompt para reviewer agent:**
```
Revisar código backend FastAPI verificando:

1. SEGURANÇA
   - SQL Injection possível?
   - Endpoints sem validação de entrada?
   - Dados sensíveis expostos em responses?
   - CORS configurado corretamente?

2. CONSISTÊNCIA API
   - Todos endpoints com trailing slash?
   - Schemas Pydantic consistentes?
   - Validação de FK antes de operações?
   - Tratamento de erros padronizado?

3. PERFORMANCE
   - Queries N+1 possíveis?
   - Índices necessários no banco?
   - Paginação em listagens grandes?

4. MANUTENIBILIDADE
   - Código duplicado em routers?
   - Funções muito longas?
   - Docstrings em funções públicas?

Gerar relatório com: CRÍTICO, ALERTA, SUGESTÃO
```

### FASE 5: VERIFICAÇÃO TÉCNICA AUTOMATIZADA

**Executar comandos:**
```bash
# TypeScript
npm run type-check 2>&1 | head -50

# Verificar arquivos grandes
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -n | tail -20

# Imports não utilizados (básico)
grep -r "^import" src --include="*.ts" --include="*.tsx" | grep -v "from" | head -10
```

### FASE 6: ANÁLISE DE CONSISTÊNCIA FRONTEND/BACKEND

**Verificar manualmente:**
```
1. TYPES VS SCHEMAS
   - src/types/ corresponde a backend/app/schemas/?
   - Campos obrigatórios consistentes?
   - Enums sincronizados?

2. API CALLS VS ENDPOINTS
   - src/services/api.ts cobre todos os endpoints?
   - URLs corretas (com trailing slash)?
   - Métodos HTTP corretos?

3. STORES VS ROUTERS
   - Todas entidades do backend têm store no frontend?
   - Actions cobrem todas operações CRUD necessárias?
```

### FASE 7: ANÁLISE DE CÓDIGO MORTO

**Verificar:**
```
1. Componentes não utilizados
2. Funções exportadas mas não importadas
3. Types definidos mas não usados
4. Arquivos órfãos (não importados por nenhum outro)
5. Variáveis declaradas mas não usadas
```

### FASE 8: COMPILAÇÃO DO RELATÓRIO

**Gerar relatório estruturado:**

```markdown
# Relatório de Saúde do Sistema AZ TECH
**Data:** [data atual]
**Versão analisada:** [commit hash]

## Resumo Executivo
- Total de issues: X
- Críticos: X | Alertas: X | Sugestões: X

## Issues Críticos (Resolver Imediatamente)
| # | Área | Descrição | Arquivo | Solução Sugerida |
|---|------|-----------|---------|------------------|
| 1 | ... | ... | ... | ... |

## Alertas (Resolver em Breve)
| # | Área | Descrição | Arquivo | Solução Sugerida |
|---|------|-----------|---------|------------------|
| 1 | ... | ... | ... | ... |

## Sugestões de Melhoria
| # | Área | Descrição | Impacto |
|---|------|-----------|---------|
| 1 | ... | ... | ... |

## Métricas do Projeto
- Total de arquivos: X
- Linhas de código: X
- Componentes: X
- Stores: X
- Endpoints: X
- Cobertura de testes: X%

## Próximas Ações Recomendadas
1. [Ação prioritária 1]
2. [Ação prioritária 2]
3. [Ação prioritária 3]
```

---

## CATEGORIZAÇÃO DE ISSUES

### 🔴 CRÍTICO
- Erros de TypeScript
- Vulnerabilidades de segurança
- Bugs que quebram funcionalidades
- Inconsistências de dados
- Race conditions

### 🟡 ALERTA
- Padrões não seguidos
- Performance degradada
- Código duplicado significativo
- Falta de validação
- Acessibilidade comprometida

### 🟢 SUGESTÃO
- Refatorações recomendadas
- Melhorias de UX
- Documentação faltante
- Otimizações possíveis
- Debt técnico menor

---

## CHECKLIST DE ÁREAS ANALISADAS

```
[ ] Arquitetura geral
[ ] Stores Zustand
[ ] Componentes React
[ ] Services/API
[ ] Types/Schemas
[ ] Backend routers
[ ] Backend models
[ ] Segurança
[ ] Performance
[ ] Acessibilidade
[ ] Código morto
[ ] Consistência frontend/backend
[ ] TypeScript errors
[ ] Testes
```

---

## OPÇÕES DE ESCOPO

Se `$ARGUMENTS` especificar área, focar apenas nela:

- `frontend` → Fases 3, 5 (parte), 7
- `backend` → Fases 4, 5 (parte)
- `arquitetura` → Fases 2, 6
- `seguranca` → Fases 4 (segurança), análise de inputs
- `performance` → Fases 3 (perf), 4 (perf), métricas
- `codigo-morto` → Fase 7 aprofundada
- (vazio) → Análise completa (todas as fases)

---

## SAÍDA DO COMANDO

1. **Relatório no terminal** - Resumo com issues encontrados
2. **Arquivo opcional** - Se muitos issues, salvar em `docs/HEALTH_CHECK_[data].md`
3. **TodoWrite** - Issues críticos viram tarefas para correção

---

## FREQUÊNCIA RECOMENDADA

- **Semanal:** `/health-check` completo
- **Após sprint:** `/health-check arquitetura`
- **Antes de deploy:** `/health-check seguranca`
- **Após refatoração:** `/health-check codigo-morto`

---

## INTEGRAÇÃO COM OUTROS COMANDOS

Após diagnóstico, usar:
- `/fix-bug [issue crítico]` - Para corrigir bugs encontrados
- `/new-feature` - Se diagnóstico sugerir nova funcionalidade
- `/review [arquivo]` - Para revisão pontual de arquivo problemático
