# Changelog

Todas as mudanças notáveis do Sistema AZ TECH.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [0.3.0] - 2026-01-17

### Adicionado - Sprint 2: Integridade de Dados e Layout por Nível

#### Backend
- API-001: Endpoint `/cargos` com CRUD completo
- API-002: Endpoint `/tipos-projeto` com CRUD completo
- API-003: Validação anti-ciclo em `/colaboradores` - impede hierarquias circulares
- API-004: Model `Cargo` com campos `codigo`, `nome`, `descricao`, `nivel_id`, `setor_id`, `ordem`
- API-005: Model `TipoProjeto` com campos `codigo`, `nome`, `descricao`, `icone`, `cor`, `cor_texto`, `ordem`

#### Frontend
- STORE-001: ConfigStore agora carrega `cargos` e `tiposProjeto` da API
- STORE-002: Funções `loadCargos()` e `loadTiposProjeto()` adicionadas
- STORE-003: Função `loadAll()` atualizada para carregar todos os dados da API em paralelo
- STORE-004: Função utilitária `checkHierarchyCycle()` para validação local
- STORE-005: Função utilitária `getAllSubordinados()` para consultas hierárquicas

#### Organograma
- ORG-018: Layout agora baseado em `nivel_id` (ADR-005)
  - Colaboradores do mesmo nível ficam alinhados horizontalmente
  - Diretoria (nivel=1) no topo, Operacional (nivel=5) na base
- ORG-019: Indicadores de nível mostram os níveis realmente usados

### Modificado
- ConfigStore: removido dados hardcoded (`CARGOS_INICIAIS`, `TIPOS_PROJETO_INICIAIS`)
- ConfigStore: `partialize` agora não persiste nenhum dado de negócio (ADR-004)
- OrgTreeV2: posicionamento Y agora usa `nivel_id` ao invés de profundidade da árvore
- api.ts: adicionados conversores `apiToCargo()`, `cargoToApi()`, `apiToTipoProjeto()`, `tipoProjetoToApi()`

### Removido
- `src/data/` - diretório removido (dados hardcoded não utilizados)

### Técnico
- ADR-004: PostgreSQL/API é a única fonte de verdade para dados de negócio
- ADR-005: Posicionamento vertical do organograma baseado em `nivel_id`
- Validação anti-ciclo no backend impede referências circulares em `superior_id`
- Todos os dados de cargos e tipos de projeto agora vêm da API

---

## [Unreleased]

### Corrigido - Sprint 3: Consistência de Tipos
- TYPE-001: Corrigido tipo `Colaborador`: campo `foto` renomeado para `fotoUrl` (consistência com API)
- TYPE-002: Corrigido tipo `Setor`: adicionado campo `icone`, campo `nomeCompleto` agora opcional
- TYPE-003: Corrigido tipo `Subsetor`: campos `cor` e `corTexto` agora opcionais
- TYPE-004: Corrigido tipo `NivelHierarquico`: campo `descricao` agora opcional
- TYPE-005: Corrigido tipo `Subnivel`: campo `abreviacao` agora opcional

### Adicionado
- API-006: Conversores `setorToApi()`, `subsetorToApi()`, `nivelToApi()`, `subnivelToApi()` em api.ts
- TEST-001: Arquivo `tests/fixtures.ts` com dados mock para testes (ADR-004 compliant)
- SYNC-001: Hook `usePolling` para polling periódico de dados (ADR-006)
- SYNC-002: Hook `useApiSync` atualizado com suporte a polling (intervalo configurável, padrão 30s)
- SYNC-003: Componente `SyncIndicator` para exibir status de sincronização na UI
- SYNC-004: `OrgToolbar` agora aceita prop `syncStatus` para mostrar indicador de sincronização
- TEST-002: Suite de testes de integração com mock fetch (`tests/mocks/api.ts`)
- TEST-003: Testes de integração para Colaboradores API (16 testes)
- TEST-004: Testes de integração para Config API - setores, níveis, cargos (18 testes)
- TEST-005: Testes de integração para useApiSync hook (16 testes)

### Modificado
- `useApiSync.ts`: Removidos conversores duplicados, agora importa de `api.ts` (DRY)
- `useApiSync.ts`: Agora retorna `lastUpdated`, `lastUpdatedFormatted`, `isPolling`, `isFetching`, `startPolling`, `stopPolling`, `refresh`
- Testes: `data.test.ts` e `organoStore.test.ts` atualizados para usar fixtures ao invés de `@/data`

### Técnico
- ADR-006: Implementado polling a cada 30s para sincronização automática
- Build desbloquado: `npm run type-check` passa sem erros
- **89 testes passando** (6 suites) - incluindo 50 testes de integração novos
- Mock fetch permite testar CRUD completo sem backend real

---

## [0.2.1] - 2026-01-17

### Adicionado - Sprint 1.2: Visualização Aprimorada
- ORG-011: OrgTreeV2 - nova visualização com posicionamento calculado
- ORG-012: OrgConnector - conexões SVG com curvas Bezier suaves
- ORG-013: Zoom e Pan via react-zoom-pan-pinch
- ORG-014: Centralização automática da árvore
- ORG-015: Controles de zoom (+ / - / reset)
- ORG-016: Cards redesenhados com borda lateral colorida por setor
- ORG-017: Badges de nível e setor no card

### Modificado
- OrgNode: novo design com borda-l-4, badges arredondados, botão expand na parte inferior
- OrganoramaPage: agora usa OrgTreeV2 como visualização padrão

### Técnico
- Dependência adicionada: react-zoom-pan-pinch
- Layout calculado com algoritmo de posicionamento hierárquico
- Camadas separadas: SVG para conexões, HTML para nós
- 41 testes passando

---

## [0.2.0] - 2026-01-17

### Adicionado - Fase 1: Organograma
- ORG-001: Store Zustand (organoStore) para gerenciamento de colaboradores
- ORG-002: Componente OrgNode - card de colaborador com cores por setor/nível
- ORG-003: Componente OrgTree - visualização hierárquica em árvore
- ORG-004: Componente OrgToolbar - filtros e ações (busca, setor, nível)
- ORG-005: ColaboradorModal - modal para visualizar/criar/editar colaboradores
- ORG-006: OrganoramaPage - página completa integrando todos componentes
- ORG-007: Expansão/colapso de níveis hierárquicos
- ORG-008: Filtros por busca, setor e nível
- ORG-009: CRUD completo de colaboradores
- ORG-010: Persistência com localStorage via Zustand persist

### Técnico
- 27 novos testes (total: 41 testes passando)
- Store Zustand com middleware persist
- Selectors otimizados para evitar re-renders
- Componentes memoizados para performance

### Estrutura Criada
```
src/
├── components/organograma/  # OrgNode, OrgTree, OrgToolbar, ColaboradorModal
├── features/organograma/    # OrganoramaPage
└── stores/                  # organoStore (Zustand)
```

---

## [0.1.0] - 2026-01-17

### Adicionado
- SETUP-001: Projeto Vite + React 19 + TypeScript 5.9
- SETUP-002: Configuração Tailwind CSS 4 com cores customizadas
- SETUP-003: Tipos globais (Colaborador, Setor, Projeto, NivelHierarquico)
- SETUP-004: Dados iniciais com 24 colaboradores, 8 setores, 5 níveis
- SETUP-005: Layout base (Header, TabNavigation)
- SETUP-006: Configuração Vitest com 14 testes passando
- SETUP-007: Comandos de workflow (/new-feature, /fix-bug, /review, /status)
- SETUP-008: CLAUDE.md com regras obrigatórias de workflow

### Técnico
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.3.1
- Tailwind CSS 4.1.8
- Zustand 5.0.0
- Vitest 3.1.0
- Path aliases configurados (@/, @components/, @features/, etc)
- Cobertura de testes: 14 testes passando

### Estrutura Criada
```
src/
├── components/layout/     # Header, TabNavigation
├── data/                  # Seeds (colaboradores, setores, niveis)
├── types/                 # Types globais
├── utils/                 # cn() helper
├── features/              # Estrutura para módulos
└── App.tsx               # App principal com navegação
```

---

## [0.0.0] - 2026-01-17

### Adicionado
- Estrutura inicial de documentação
- Template de AI Agents
- Definição de stack tecnológica
- Especificação do sistema
- Roadmap de desenvolvimento

### Técnico
- Criado docs/SISTEMA.md
- Criado docs/STACK.md
- Criado docs/ROADMAP.md
- Criado .claude/CLAUDE.md
- Criado .claude/agents/*

---

*Mantenha este arquivo atualizado após cada feature completada.*
