# Sistema AZ TECH - Contexto para Claude Code

> **REGRA:** Sempre consultar o **código-fonte** e a **API** como fonte da verdade.

---

## CONTEXTUALIZAÇÃO OBRIGATÓRIA

**ANTES de qualquer comando (/fix-bug, /new-feature, /review, etc.):**

```
1. Consultar .claude/SYSTEM_MAP.md → Dependências entre módulos
2. Consultar .claude/LEARNINGS.md  → Bugs conhecidos e padrões
3. Verificar código relacionado    → backend/app/models/, src/types/
4. Verificar API se necessário     → http://localhost:8000/docs
```

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Propósito |
|---------|-----------|
| `.claude/SYSTEM_MAP.md` | Mapa de dependências, entidades, stores |
| `.claude/LEARNINGS.md` | Memória persistente - bugs e padrões |
| `backend/app/models/` | Estrutura de dados (fonte verdade) |
| `backend/app/routers/` | Endpoints da API |
| `src/types/` | Tipos TypeScript |
| `src/stores/` | Estado da aplicação |

---

## ADRs VIGENTES

### ADR-004: Fonte Única de Verdade
- PostgreSQL/API é a ÚNICA fonte de dados
- Frontend não tem dados hardcoded
- Stores persistem apenas UI state

### ADR-005: Posicionamento por Nível
- Organograma posiciona por `nivel_id`, não por subordinação
- Consultar API para níveis atuais

### ADR-006: Gestão de Colaboradores
- Criação: apenas em Configurações
- Edição: Configurações e Organograma
- Exclusão: apenas em Configurações

---

## AGENTS DISPONÍVEIS

| Agent | Quando usar |
|-------|-------------|
| `architect` | Decisões estruturais, design de stores |
| `frontend` | Componentes React, UI, Tailwind |
| `testing` | Testes automatizados |
| `reviewer` | Code review, refatoração |
| `ux-designer` | Avaliação de usabilidade |

---

## WORKFLOW DE EXECUÇÃO

```
FASE 1: CONTEXTO
└─ Ler SYSTEM_MAP.md e LEARNINGS.md

FASE 2: ENTENDIMENTO
└─ Ler código existente antes de modificar

FASE 3: PLANEJAMENTO
└─ TodoWrite com tarefas granulares

FASE 4: EXECUÇÃO
└─ Uma tarefa por vez, type-check após mudanças

FASE 5: VERIFICAÇÃO
└─ TypeScript sem erros, registrar aprendizados
```

---

## REGRAS CRÍTICAS

**SEMPRE:**
- Consultar código como fonte da verdade
- Type-check antes de finalizar
- Registrar aprendizados novos

**NUNCA:**
- Confiar em .md para dados atuais
- Hardcodar dados no frontend
- Implementar sem entender o existente

---

*Sistema AZ TECH - Janeiro/2026*
