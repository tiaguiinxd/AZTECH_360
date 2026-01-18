# Plano de Revisão Geral - Sistema AZ TECH

> **Data:** Janeiro/2026
> **Objetivo:** Garantir integridade de dados, fluidez e integração automática com o organograma

---

## 1. ANÁLISE DA SITUAÇÃO ATUAL

### 1.1 Arquitetura Atual

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FRONTEND      │────▶│    BACKEND      │────▶│    SQLite DB    │
│   React 19      │     │    FastAPI      │     │                 │
│   Zustand       │     │    SQLAlchemy   │     │                 │
│   localhost:5173│     │  localhost:8000 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 1.2 Pontos Positivos Identificados

- **Backend bem estruturado:** Models, Schemas e Routers separados corretamente
- **API REST completa:** CRUD para todas as entidades principais
- **Frontend modular:** Stores Zustand com selectors e middleware persist
- **Conversores API:** Funções bidirecionais camelCase ↔ snake_case
- **DataProvider:** Carrega dados iniciais e verifica saúde da API

---

## 2. PROBLEMAS E INCONSISTÊNCIAS IDENTIFICADOS

### 🔴 CRÍTICOS (Afetam Integridade de Dados)

#### P1: Duplicidade de Dados Iniciais
**Problema:** Dados "seed" existem em DOIS lugares:
- `backend/init.sql` - Dados no PostgreSQL
- `src/data/*.ts` - Dados hardcoded no frontend

**Risco:** Dessincronização entre frontend e backend. Alterações no banco não refletem no frontend.

**Solução:** Eliminar dados hardcoded do frontend. Apenas a API é fonte de verdade.

---

#### P2: ConfigStore com Dados Locais
**Problema:** O `configStore.ts` tem cargos e tiposProjeto hardcoded localmente, não vêm da API.

**Risco:** Configurações não sincronizam com backend. Usuários podem criar dados que o backend não conhece.

**Solução:** Criar endpoints `/api/v1/cargos` e `/api/v1/tipos-projeto` no backend.

---

#### P3: Organograma Não Usa nivel_id para Posicionamento Visual
**Problema:** O `OrgTree.tsx` posiciona colaboradores pela profundidade da árvore (subordinação), não pelo `nivel_id` (nível hierárquico).

**Risco:** Larissa (nivel_id=5) aparece na mesma linha que Danilo/Victor (nivel_id=4), embora todos sejam filhos de Thiago.

**Solução:** Alterar algoritmo para posicionar por `nivel_id`, não por profundidade.

---

#### P4: Falta Sincronização em Tempo Real
**Problema:** Se outro usuário altera dados no banco, o frontend não atualiza automaticamente.

**Risco:** Dados defasados, conflitos de edição.

**Solução:** Implementar polling periódico ou WebSocket para sync.

---

### 🟡 MÉDIOS (Afetam UX/Manutenibilidade)

#### P5: Subsetor e Subnivel Não Usados no Organograma
**Problema:** Backend tem `subsetor_id` e `subnivel_id`, mas o organograma não exibe esses dados.

**Impacto:** Informação disponível mas não visualizada.

---

#### P6: Falta Validação de Hierarquia Circular
**Problema:** Nada impede que colaborador A seja superior de B, e B superior de A.

**Impacto:** Loop infinito na renderização da árvore.

---

#### P7: Dados Legados no Frontend
**Problema:** `src/data/` ainda contém dados que deveriam vir apenas da API.

**Impacto:** Confusão sobre qual é a fonte de verdade.

---

#### P8: Falta TanStack Query (React Query)
**Problema:** Estamos usando fetch manual + Zustand. Sem cache inteligente, retry automático, ou invalidação.

**Impacto:** Mais código manual, menos features de data fetching.

---

### 🟢 MELHORIAS DESEJÁVEIS

#### P9: Falta Skeleton Loading
**Problema:** Loading genérico ao invés de skeletons específicos.

#### P10: Falta Testes de Integração API
**Problema:** Testes existentes são unitários, não testam fluxo completo.

#### P11: Falta Documentação de API (OpenAPI)
**Problema:** `/docs` existe mas não está customizado.

---

## 3. PLANO DE AÇÃO - FASES

### FASE 1: Integridade de Dados (Prioridade ALTA)

| Item | Tarefa | Responsável | Complexidade |
|------|--------|-------------|--------------|
| 1.1 | Remover `src/data/` - usar apenas API | ARCHITECT | Média |
| 1.2 | Criar endpoints `/cargos` e `/tipos-projeto` | BACKEND* | Média |
| 1.3 | Atualizar ConfigStore para buscar da API | FRONTEND | Baixa |
| 1.4 | Adicionar validação anti-ciclo no backend | BACKEND* | Média |
| 1.5 | Adicionar validação anti-ciclo no frontend | FRONTEND | Baixa |

*BACKEND: Adaptar agent ARCHITECT para backend Python

---

### FASE 2: Organograma - Posicionamento por Nível (Prioridade ALTA)

| Item | Tarefa | Responsável | Complexidade |
|------|--------|-------------|--------------|
| 2.1 | Redesenhar algoritmo de layout por `nivel_id` | ARCHITECT | Alta |
| 2.2 | Manter conexões visuais corretas | FRONTEND | Média |
| 2.3 | Exibir subsetor e subnivel nos cards | FRONTEND | Baixa |
| 2.4 | Adicionar legenda de níveis | FRONTEND | Baixa |

---

### FASE 3: Sincronização de Dados (Prioridade MÉDIA)

| Item | Tarefa | Responsável | Complexidade |
|------|--------|-------------|--------------|
| 3.1 | Implementar polling a cada 30s | ARCHITECT | Baixa |
| 3.2 | Adicionar indicador "última atualização" | FRONTEND | Baixa |
| 3.3 | Considerar TanStack Query para futuro | ARCHITECT | Alta |

---

### FASE 4: Qualidade e Testes (Prioridade MÉDIA)

| Item | Tarefa | Responsável | Complexidade |
|------|--------|-------------|--------------|
| 4.1 | Testes de integração API | TESTING | Média |
| 4.2 | Testes E2E críticos | TESTING | Alta |
| 4.3 | Documentar API no OpenAPI | ARCHITECT | Baixa |

---

## 4. DECISÕES ARQUITETURAIS PROPOSTAS

### ADR-004: Fonte Única de Verdade
**Decisão:** PostgreSQL/API é a ÚNICA fonte de dados. Frontend não tem dados hardcoded.
**Consequência:** Remover `src/data/`, atualizar stores para buscar tudo da API.

### ADR-005: Posicionamento por Nível Hierárquico
**Decisão:** Organograma posiciona colaboradores pelo `nivel_id`, não pela profundidade de subordinação.
**Consequência:** Reescrever `OrgTree.tsx` com novo algoritmo de layout.

### ADR-006: Polling vs WebSocket
**Decisão:** Iniciar com polling simples (30s). WebSocket é overkill para MVP.
**Consequência:** Implementar hook `useApiSync` com intervalo configurável.

---

## 5. ORDEM DE EXECUÇÃO RECOMENDADA

```
1. [P1] Remover dados hardcoded do frontend ✅ CONCLUÍDO
2. [P3] Corrigir posicionamento do organograma ✅ CONCLUÍDO
3. [P2] Criar endpoints faltantes no backend ✅ CONCLUÍDO
4. [P6] Validação anti-ciclo ✅ CONCLUÍDO
5. [P4] Polling para sincronização ✅ CONCLUÍDO
6. [P5] Exibir subsetor/subnivel
7. [P8] Avaliar TanStack Query
```

### Status de Execução (Atualizado: Janeiro/2026)

| Fase | Status | Observações |
|------|--------|-------------|
| FASE 1 | ✅ CONCLUÍDA | Endpoints /cargos e /tipos-projeto criados, ConfigStore atualizado, validação anti-ciclo implementada |
| FASE 2 | ✅ CONCLUÍDA | Layout por nivel_id implementado, conexões visuais funcionando |
| FASE 3 | ✅ CONCLUÍDA | Polling 30s implementado com `usePolling` hook, `SyncIndicator` componente adicionado |
| FASE 4 | ✅ CONCLUÍDA | 89 testes passando (6 suites), incluindo 50 testes de integração |

---

## 6. MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta |
|---------|-------|------|
| Fontes de dados | 2 (API + hardcoded) | 1 (apenas API) |
| Posicionamento correto | Por subordinação | Por nivel_id |
| Tempo de sync máximo | Manual | 30 segundos |
| Cobertura de testes | ~60% | >80% |

---

## 7. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| API offline | Média | Alto | Fallback com dados em cache |
| Ciclos na hierarquia | Baixa | Alto | Validação backend + frontend |
| Performance com muitos nós | Média | Médio | Virtualização de lista |

---

## 8. PRÓXIMOS PASSOS

1. **Aprovar este plano** com o usuário
2. **Iniciar FASE 1** - Remover dados hardcoded
3. **Iniciar FASE 2** - Corrigir organograma em paralelo
4. **Testes após cada fase** - Garantir não-regressão

---

*Documento gerado em Janeiro/2026*

## Fontes Consultadas

- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist)
- [React Query Python TanStack](https://johal.in/react-query-python-tanstack-data-sync-server-state-2026/)
- [FastAPI and React in 2025](https://www.joshfinnie.com/blog/fastapi-and-react-in-2025/)
- [React State Management 2025](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)
