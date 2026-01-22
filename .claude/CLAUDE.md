# Sistema AZ TECH - Instruções para Claude Code

> **IMPORTANTE:** Este arquivo define regras de workflow e contexto do projeto.
> Sempre consulte o **código-fonte** e a **API/banco de dados** como fonte da verdade.

---

## 🗺️ MAPA DO SISTEMA (CONSULTAR PRIMEIRO!)

**ANTES de qualquer implementação ou investigação, consulte:**

📄 **[`.claude/SYSTEM_MAP.md`](.claude/SYSTEM_MAP.md)** - Contém:
- Checklist pré-implementação obrigatório
- Matriz de dependências entre módulos
- Mapeamento Entidade → Store → Router
- Regras de consistência do sistema
- Guia de troubleshooting

📚 **[`.claude/LEARNINGS.md`](.claude/LEARNINGS.md)** - Contém:
- Bugs corrigidos e como evitá-los
- Padrões estabelecidos no projeto
- Dicas e armadilhas conhecidas
- **MEMÓRIA PERSISTENTE entre sessões**

> ⚠️ **REGRA:** Nenhuma feature/fix deve ser implementada sem verificar SYSTEM_MAP e LEARNINGS primeiro.

---

## CONTEXTO

**AZ TECH Soluções e Engenharia** - Empresa brasileira de engenharia industrial.

**Sistema:** Aplicação web full-stack para gestão organizacional:
- **Frontend:** React 19 + TypeScript + Vite + Zustand + Tailwind
- **Backend:** FastAPI (Python) + SQLite

**Arquitetura:** O frontend consome a API REST em `http://localhost:8000/api/v1/`

---

## ⚠️ DECISÕES ARQUITETURAIS (ADRs)

### ADR-004: Fonte Única de Verdade
**PostgreSQL/API é a ÚNICA fonte de dados.** Frontend não tem dados hardcoded.
- Stores Zustand: `partialize` não persiste dados de negócio, apenas UI state
- ConfigStore carrega setores, niveis, cargos, tiposProjeto da API
- OrganoStore carrega colaboradores da API

### ADR-005: Posicionamento por Nível Hierárquico
**Organograma posiciona colaboradores pelo `nivel_id`, não por profundidade de subordinação.**
- Diretoria (nivel=1) no topo, Operacional (nivel=5) na base
- Colaboradores do mesmo nível ficam alinhados horizontalmente

---

## ⚠️ FONTE DA VERDADE

**SEMPRE consultar estas fontes para informações atualizadas:**

1. **Estrutura de dados:** `backend/app/models/` (SQLAlchemy models)
2. **API endpoints:** `backend/app/routers/` ou `http://localhost:8000/docs`
3. **Tipos TypeScript:** `src/types/`
4. **Estado atual:** API REST (não arquivos .md estáticos)

**NUNCA confiar em:**
- Arquivos .md com dados estáticos (podem estar desatualizados)
- Comentários antigos no código
- Dados hardcoded em arquivos .ts (não devem existir)

---

## 🔄 WORKFLOW DE DESENVOLVIMENTO (6 FASES)

### FASE 1: CONTEXTO (Antes de começar)
```
□ Ler este CLAUDE.md
□ Consultar SYSTEM_MAP.md (dependências, entidades, stores)
□ Verificar todo list pendente
□ Analisar system-reminders de arquivos modificados
```

### FASE 2: ENTENDIMENTO (O que o usuário quer?)
```
□ Feature nova? → Especificar ANTES de codar
□ Bug fix? → Entender o problema primeiro
□ Pergunta? → Pesquisar no código, não adivinhar
□ Tarefa complexa? → EnterPlanMode para planejar
□ Dúvida sobre approach? → AskUserQuestion
```

### FASE 3: EXPLORAÇÃO (Entender o código existente)
```
□ Usar Task + Explore agent para mapear codebase
□ Ler arquivos relacionados com Read
□ Verificar API endpoints em backend/app/routers/
□ Verificar types em src/types/
□ NUNCA confiar em .md para dados - consultar API
```

### FASE 4: PLANEJAMENTO (Spec-First)
```
□ Criar TodoWrite com tarefas granulares
□ Uma feature/bug por tarefa (chunked work)
□ Definir ordem de execução
□ Identificar arquivos que serão modificados
```

### FASE 5: EXECUÇÃO (Uma tarefa por vez)
```
□ Marcar tarefa como in_progress
□ Implementar a mudança
□ Marcar como completed imediatamente ao terminar
□ Repetir para próxima tarefa
```

### FASE 6: VERIFICAÇÃO (Antes de finalizar)
```
□ npm run type-check → Zero erros TypeScript
□ npm test → Testes passam
□ Verificar visualmente se possível
□ Atualizar docs/CHANGELOG.md se relevante
□ Limpar todo list (marcar completed)
```

---

## ⚠️ REGRAS CRÍTICAS

### O que SEMPRE fazer:
- ✅ Consultar código-fonte como fonte da verdade
- ✅ Usar TodoWrite para rastrear progresso
- ✅ Type-check antes de considerar tarefa concluída
- ✅ Atualizar CHANGELOG para mudanças significativas
- ✅ Carregar dados da API, nunca hardcodar

### O que NUNCA fazer:
- ❌ Confiar em arquivos .md para dados atuais
- ❌ Hardcodar dados no frontend
- ❌ Pular validação de tipos
- ❌ Implementar sem entender o existente
- ❌ Deixar tarefas in_progress sem resolver

---

## 🤖 QUANDO USAR SUBAGENTS

| Situação | Agent | Motivo |
|----------|-------|--------|
| Buscar arquivos/entender codebase | `Task + Explore` | Mapeamento eficiente |
| Tarefa arquitetural complexa | `Task + Plan` | Planejamento estruturado |
| Dúvidas sobre Claude Code | `Task + claude-code-guide` | Documentação oficial |
| Comandos bash complexos | `Task + Bash` | Execução isolada |

---

## 📋 CHECKLIST RÁPIDO

Antes de responder ao usuário, verifique:
```
[ ] Consultei SYSTEM_MAP.md?
[ ] Entendi o que foi pedido?
[ ] Consultei o código relevante?
[ ] Criei/atualizei todo list?
[ ] Type-check passa?
[ ] Documentei mudanças importantes?
```

---

## DOCUMENTAÇÃO

| Documento | O Que Contém |
|-----------|--------------|
| `.claude/SYSTEM_MAP.md` | **⭐ Mapa do sistema - CONSULTAR PRIMEIRO!** |
| `docs/CHANGELOG.md` | Histórico de mudanças por versão |
| `docs/PLANO_REVISAO.md` | ADRs e plano de implementação |
| `docs/FEATURES_COMPLETED.md` | Features funcionando |
| `docs/KNOWN_ISSUES.md` | Problemas conhecidos |

---

## AGENTS ESPECIALIZADOS

| Agent | Arquivo | Responsabilidade |
|-------|---------|------------------|
| **ARCHITECT** | `.claude/agents/ARCHITECT.md` | Estrutura, stores, decisões, padrões |
| **FRONTEND** | `.claude/agents/FRONTEND.md` | Componentes, UI, Tailwind, acessibilidade |
| **TESTING** | `.claude/agents/TESTING.md` | Testes unitários, integração, cobertura |
| **REVIEWER** | `.claude/agents/REVIEWER.md` | Code review, refatoração, qualidade |

### Quando usar cada agent:

```
Tarefa                          → Agent
─────────────────────────────────────────
Criar novo store               → ARCHITECT
Definir estrutura de dados     → ARCHITECT
Criar componente               → FRONTEND
Estilizar com Tailwind         → FRONTEND
Escrever testes                → TESTING
Revisar código                 → REVIEWER
Refatorar                      → REVIEWER
```

---

## ESTRUTURA DO PROJETO

```
aztech-sistema-completo/
├── .claude/
│   ├── CLAUDE.md              # ← VOCÊ ESTÁ AQUI
│   ├── agents/                # Agents especializados
│   ├── commands/              # Comandos de workflow
│   └── templates/             # Templates de código
├── docs/
│   ├── CHANGELOG.md           # Versões e histórico
│   ├── PLANO_REVISAO.md       # ADRs e plano técnico
│   ├── FEATURES_COMPLETED.md  # Features prontas
│   └── KNOWN_ISSUES.md        # Problemas
├── src/
│   ├── app/                   # Configuração da app
│   ├── components/            # Componentes
│   │   ├── ui/               # shadcn/ui
│   │   ├── layout/           # Layout (Header, etc)
│   │   └── shared/           # Compartilhados
│   ├── features/              # Módulos por feature
│   │   ├── organograma/
│   │   ├── projetos/
│   │   ├── dashboard/
│   │   └── configuracoes/
│   ├── hooks/                 # Hooks globais
│   ├── stores/                # Stores globais
│   ├── services/              # API client e converters
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utilitários
├── backend/
│   └── app/
│       ├── models/            # SQLAlchemy models
│       ├── routers/           # API endpoints
│       ├── schemas/           # Pydantic schemas
│       └── database.py        # Conexão DB
└── tests/
    ├── unit/
    ├── integration/
    └── setup.ts
```

---

## CONVENÇÕES

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `OrgNode.tsx` |
| Hooks | camelCase + use | `useOrgDragDrop.ts` |
| Stores | camelCase + Store | `organoStore.ts` |
| Types | PascalCase | `Colaborador` |
| Constantes | SCREAMING_SNAKE | `NIVEIS_HIERARQUICOS` |

### Commits

```
feat(modulo): descrição      # Nova feature
fix(modulo): descrição       # Correção de bug
refactor(modulo): descrição  # Refatoração
test(modulo): descrição      # Testes
docs: descrição              # Documentação
```

---

## ARQUITETURA DO SISTEMA

```
┌─────────────────┐     ┌─────────────────┐
│   FRONTEND      │────▶│    BACKEND      │
│   (React/Vite)  │     │   (FastAPI)     │
│   localhost:5173│     │  localhost:8000 │
└─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │    SQLite DB    │
                        │  backend/*.db   │
                        └─────────────────┘
```

**Fluxo de dados:**
1. Frontend faz requisições para API REST
2. Backend processa e retorna JSON
3. Frontend atualiza estado com Zustand

---

## HIERARQUIA ORGANIZACIONAL

| nivel_id | Nome | Descrição |
|----------|------|-----------|
| 1 | Diretoria | C-Level |
| 2 | Gerência | Gestores |
| 3 | Coordenação | Líderes |
| 4 | Técnico | Especialistas |
| 5 | Operacional | Assistentes |

**Importante:** `nivel_id` define posição hierárquica visual no organograma.

---

*Sistema AZ TECH - Janeiro/2026*
