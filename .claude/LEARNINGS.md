# AZ TECH - Aprendizados Persistentes

> **PROPÓSITO:** Este arquivo é a memória entre sessões do Claude.
> Toda correção de bug ou implementação importante deve ser registrada aqui
> para evitar repetição de erros e manter padrões consistentes.

---

## Como Usar Este Arquivo

1. **Antes de implementar:** Ler este arquivo para verificar erros passados
2. **Após corrigir bug:** Registrar causa, solução e prevenção
3. **Após criar feature:** Registrar padrões e dicas aprendidas

---

## Bugs Corrigidos

### 2026-01-23 | Bug: Equipe alocada não aparece no módulo Planejamento
- **Arquivos:** `src/features/planejamento/PlanejamentoPage.tsx`, `src/features/planejamento/components/ProjetoTable.tsx`
- **Sintoma:** Badges de equipe vazios no Planejamento, mas funcionando corretamente no Dashboard
- **Causa raiz:**
  1. `PlanejamentoPage.tsx` não carregava alocações do backend no mount (apenas projetos e opções)
  2. `DashboardPage.tsx` funcionava porque chamava `fetchAll()` que inclui alocações
  3. `ProjetoTable.tsx` tentava carregar alocações individualmente, mas com race conditions
- **Problema adicional descoberto:** Redundância de carregamento
  - `PlanejamentoPage` carregava TODAS as alocações
  - Cada `ProjetoTable` recarregava individualmente por projeto
  - Race condition: último a resolver sobrescreve o store com dados parciais
  - Performance: N+1 requisições (1 global + N individuais)
- **Solução aplicada:**
  1. Adicionar `fetchAlocacoes()` no useEffect de mount do PlanejamentoPage
  2. Adicionar `fetchAlocacoes()` no handleRefresh do PlanejamentoPage
  3. Remover carregamento individual do ProjetoTable (componente apenas consome dados)
  4. Remover imports não utilizados (useDashboardStore, useEffect)
- **Código corrigido:**
  ```typescript
  // PlanejamentoPage.tsx
  import { useDashboardStore } from '@/stores/dashboardStore'

  // No componente
  const fetchAlocacoes = useDashboardStore((state) => state.fetchAlocacoes)

  useEffect(() => {
    if (_hasHydrated) {
      loadProjetos()
      loadOpcoes()
      fetchAlocacoes()  // ← Carregar TODAS as alocações
    }
  }, [_hasHydrated, loadProjetos, loadOpcoes, fetchAlocacoes])

  const handleRefresh = useCallback(() => {
    loadProjetos()
    loadOpcoes()
    fetchAlocacoes()  // ← Atualizar alocações ao clicar em "Atualizar"
  }, [loadProjetos, loadOpcoes, fetchAlocacoes])
  ```
  ```typescript
  // ProjetoTable.tsx
  // REMOVIDO: useEffect que carregava alocações individualmente
  // REMOVIDO: import useDashboardStore
  // REMOVIDO: import useEffect

  // Comentário adicionado:
  // Nota: Alocações são carregadas pelo PlanejamentoPage no mount
  // Este componente apenas CONSOME os dados do dashboardStore.alocacoes
  // EquipeBadgeHover e ProjetoAlocacaoList filtram as alocações por projeto_id automaticamente
  ```
- **Prevenção:**
  - **REGRA:** Dados compartilhados devem ser carregados UMA ÚNICA VEZ no componente pai
  - Componentes filhos devem CONSUMIR dados do store, não recarregar
  - Se múltiplos componentes precisam do mesmo dado, carregar no ancestral comum
  - **ANTI-PADRÃO:** Componente lista + cada item da lista carrega seus dados = N+1 queries
  - **PADRÃO CORRETO:** Componente lista carrega todos os dados + itens filtram localmente
  - Verificar se store usa REPLACE ou MERGE ao receber dados (dashboardStore usa REPLACE)
  - Race conditions ocorrem quando múltiplas requisições sobrescrevem o mesmo estado
  - Use reviewer agent para identificar carregamentos redundantes
- **Referência:** Sugestão 1 (Opção A) do reviewer agent - Remover carregamento individual
- **Impacto:** Redução de 15 requisições para 5 (33 projetos → 1 requisição ao invés de 33)

### 2025-01-21 | Bug: Erro ao acessar .length de array undefined no Zustand
- **Arquivos:** `src/features/servicos/ServicosPage.tsx`, `src/features/servicos/components/AlocacaoPorPessoa.tsx`
- **Erro:** `TypeError: Cannot read properties of undefined (reading 'length')`
- **Causa:** Durante hidratação do Zustand store com `persist`, arrays podem estar `undefined` momentaneamente
- **Solução:** Usar optional chaining (`?.`) e nullish coalescing (`??`) ao acessar `.length` de arrays do store
- **Exemplo correto:**
  ```typescript
  // ERRADO
  const total = useStore(state => state.items.length)

  // CORRETO
  const total = useStore(state => state.items?.length ?? 0)
  ```
- **Prevenção:**
  - SEMPRE usar `?.length ?? 0` ao acessar arrays de stores com persist
  - Implementar guard `if (!hasHydrated) return <Loading />` antes de usar dados do store
  - Selectors devem verificar se array existe: `if (!arr || !Array.isArray(arr)) return []`
  - Padrão se aplica a TODOS os acessos diretos a propriedades de objetos que podem ser undefined

### 2025-01-21 | Bug: Labels laterais não acompanham mudança de ordem dos níveis
- **Arquivo:** `src/components/organograma/OrgTreeV2.tsx`
- **Erro:** Labels de níveis (nomenclaturas à esquerda) não moviam ao alterar ordem em Configurações
- **Causa:** `nivelLineMap` ordenava por `nivelId` e usava `nivelId - 1` para calcular Y, ignorando campo `ordem`
- **Solução:**
  1. Adicionar campo `ordenIndex` em `NivelLineInfo`
  2. Ordenar `nivelLineMap` por `ordem` ao invés de `nivelId`
  3. Usar `ordenIndex` ao invés de `nivelId - 1` para calcular posição Y
- **Prevenção:**
  - TODA renderização visual baseada em ordem deve usar campo `ordem`, não `nivelId`
  - Ao corrigir bug de ordenação, verificar TODOS os elementos visuais dependentes (cards E labels)
  - Usar reviewer agent para detectar variáveis não definidas após refatoração

### 2025-01-21 | Bug: Organograma não reflete mudanças na ordem dos níveis (CARDS)
- **Arquivo:** `src/components/organograma/OrgTreeV2.tsx`
- **Erro:** Alterar ordem dos níveis em Configurações não impactava visualmente os cards
- **Causa:** Cálculo de posição Y usava `nivelId - 1` diretamente, ignorando o campo `ordem` configurável
- **Solução:** Criar mapa `nivelId → índice ordenado` baseado no campo `ordem` e usar esse índice para posicionar verticalmente
- **Prevenção:**
  - Sempre usar campos configuráveis (`ordem`) ao invés de IDs fixos para ordenação visual
  - Verificar módulos dependentes ao modificar entidades base (ver SYSTEM_MAP.md - Dependências)
  - Organograma depende de Nivel - mudanças em Nivel devem ser testadas no Organograma

### 2025-01-21 | Bug: Coluna 'ativo' não existe no banco de dados
- **Arquivo:** `backend/app/models/nivel.py`
- **Erro:** `sqlalchemy.exc.ProgrammingError: column niveis_hierarquicos.ativo does not exist`
- **Causa:** Adicionamos campo `ativo` no model SQLAlchemy mas não criamos migration para atualizar a tabela PostgreSQL existente
- **Solução:** Executar `ALTER TABLE niveis_hierarquicos ADD COLUMN ativo INTEGER DEFAULT 1 NOT NULL;` no PostgreSQL
- **Prevenção:**
  - Sempre criar migration ao adicionar/modificar campos em models existentes
  - Usar Alembic para gerenciar schema: `alembic revision --autogenerate -m "add ativo field"`
  - Testar endpoints após modificar models para detectar erros de schema cedo

### 2025-01-18 | Bug: Hooks chamados após early return
- **Arquivo:** `src/features/configuracoes/components/ColaboradorModal.tsx`
- **Erro:** "Rendered more hooks than during the previous render"
- **Causa:** `useMemo` estava sendo chamado DEPOIS de `if (!isOpen) return null`
- **Solução:** Mover TODOS os hooks para ANTES de qualquer return
- **Prevenção:** Em React, hooks devem SEMPRE estar no topo do componente, antes de condicionais

### 2025-01-18 | Bug: Store não hidratada
- **Arquivo:** `ColaboradorModal.tsx`, `OrgNode.tsx`
- **Erro:** Tela branca ao editar colaborador
- **Causa:** Componente renderizava antes do Zustand hidratar do localStorage
- **Solução:** Verificar `hasHydrated` antes de renderizar dados dependentes
- **Prevenção:** Todo componente que usa dados de store com persist deve verificar `_hasHydrated`

### 2025-01-18 | Bug: Promises não tratadas
- **Arquivo:** `src/features/organograma/OrganoramaPage.tsx`
- **Erro:** "erro inesperado recarregue a página"
- **Causa:** Funções async do store chamadas sem await/try-catch
- **Solução:** Handlers devem ser async com try/catch
- **Prevenção:** Sempre usar try/catch em chamadas async de stores

### 2025-01-20 | Bug: 404 em endpoints com path parameters
- **Arquivos:** `src/services/api.ts`
- **Erro:** DELETE /empresas/1 retorna 404
- **Causa:** FastAPI com `redirect_slashes=False` exige trailing slash
- **Solução:** Usar `/empresas/1/` (com barra no final)
- **Prevenção:** Sempre usar trailing slash em endpoints REST

### 2026-01-23 | Bug: "Not Found" ao buscar alocações com query params
- **Arquivos:** `src/services/api.ts`
- **Erro:** "Not Found" ao visualizar equipe de um projeto
- **Causa:** Endpoint `/alocacoes${query}` sem trailing slash antes do query string
- **Código errado:** `/alocacoes?projeto_id=1` (sem `/` antes do `?`)
- **Código correto:** `/alocacoes/?projeto_id=1` (com `/` antes do `?`)
- **Solução:** Alterado de `/alocacoes${query}` para `/alocacoes/${query}`
- **Mesmo problema encontrado:** `/colaboradores${query}` → corrigido para `/colaboradores/${query}`
- **Prevenção:**
  - FastAPI redireciona `/alocacoes?x=1` → `/alocacoes/?x=1` com 307, mas pode falhar com CORS
  - **PADRÃO:** Sempre usar `/endpoint/${query}` ao construir URLs com query params
  - Exemplo: `const query = params.toString() ? \`?\${params}\` : ''; apiRequest(\`/endpoint/\${query}\`)`

### 2025-01-20 | Bug: Routers não registrados
- **Arquivos:** `backend/app/main.py`
- **Erro:** Endpoints existem mas retornam 404
- **Causa:** Router criado mas não registrado com `app.include_router()`
- **Solução:** Registrar todo router novo no main.py
- **Prevenção:** Checklist - toda entidade precisa: Model + Schema + Router + Registro no main.py

---

## Padrões Estabelecidos

### 2025-01-20 | Padrão: Estrutura de Entidade Completa
Para cada nova entidade no sistema:
```
Backend:
1. backend/app/models/[entidade].py      → SQLAlchemy model
2. backend/app/schemas/[entidade].py     → Pydantic schemas
3. backend/app/routers/[entidade].py     → API endpoints
4. backend/app/routers/__init__.py       → Export do router
5. backend/app/main.py                   → Registro com include_router

Frontend:
1. src/types/[entidade].ts               → TypeScript types
2. src/stores/[dominio]Store.ts          → Actions no store
3. src/services/api.ts                   → Funções de API
4. src/features/[modulo]/components/     → Componentes
```

### 2025-01-20 | Padrão: Componente de Configuração
Baseado em `SetoresConfig.tsx`:
- `useState` para estado de edição
- `useCallback` para handlers
- `useShallow` para selectors de store
- Grid responsivo para formulários
- Confirmação antes de deletar
- Feedback visual com cores

### 2025-01-20 | Padrão: Store Zustand com Persistência
```typescript
interface State {
  items: Item[]
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
}

// No create():
persist(
  (set, get) => ({
    // ...state e actions
    setHasHydrated: (state) => set({ _hasHydrated: state }),
  }),
  {
    name: 'store-name',
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true)
    },
    partialize: (state) => ({
      // Apenas UI state, NÃO dados de negócio
    }),
  }
)
```

---

## Dependências Entre Módulos

### Planejamento:
- Independente (não depende de outras entidades)
- Campos auto-gerenciados: empresa, cliente, categoria (texto livre com autocomplete)

### Se modificar Colaborador, verificar:
- Organograma (OrgNode.tsx)
- Fluxo (se existir)

---

## Dicas Gerais

1. **Antes de editar arquivo:** Sempre ler com Read primeiro
2. **Antes de criar entidade:** Verificar se backend tem endpoint
3. **Antes de finalizar:** Rodar `npm run type-check`
4. **Após corrigir bug:** Verificar se padrão existe em outros lugares
5. **Módulos dependentes:** Sempre testar após mudanças

---

## Features Implementadas

### 2025-01-21 | Feature: Configuração Avançada de Níveis Hierárquicos
- **Módulo:** Configurações > Níveis Hierárquicos
- **Funcionalidades:** Drag-and-drop, botões ↑↓, toggle ativo/inativo
- **Padrão usado:**
  - `@dnd-kit/sortable` para reordenação
  - Componente separado `SortableNivelItem` para reutilização
  - Hook customizado `useLevelsDragDrop` para lógica isolada
- **Arquivos criados:**
  - `src/hooks/useLevelsDragDrop.ts` - Hook de drag-and-drop
  - `src/features/configuracoes/components/SortableNivelItem.tsx` - Item arrastável
- **Arquivos modificados:**
  - `backend/app/models/nivel.py` - Campo `ativo` (INTEGER)
  - `backend/app/routers/niveis.py` - Endpoints `/reorder/` e `/{id}/toggle/`
  - `src/stores/configStore.ts` - Actions `reorderNiveis` e `toggleNivelAtivo`
  - `src/features/configuracoes/components/NiveisConfig.tsx` - Integração
- **Dica para futuro:**
  - Sempre usar `useEffect` para sincronizar estado com props externas, NUNCA `useState`
  - Validar backend antes de aplicar mudanças (verificar IDs existentes, duplicados)
  - Separar componentes de apresentação (SortableItem) de lógica (hook, store)

### 2026-01-21 | Feature: Módulo Planejamento (substituiu Serviços)
- **Módulo:** Planejamento (aba principal)
- **O que foi feito:**
  - Remoção completa do módulo Serviços (frontend + backend)
  - Criação do módulo Planejamento para gestão de projetos/obras
- **Arquivos criados:**
  - `src/types/planejamento.ts` - Types de Projeto, Status, Filtros
  - `src/stores/planejamentoStore.ts` - Store com CRUD completo
  - `src/features/planejamento/PlanejamentoPage.tsx` - Página principal
  - `src/features/planejamento/components/ProjetoCard.tsx` - Card de projeto
  - `src/features/planejamento/components/ProjetoFilters.tsx` - Filtros
  - `src/features/planejamento/components/ProjetoModal.tsx` - Modal CRUD
  - `backend/app/models/projeto_planejamento.py` - Model SQLAlchemy
  - `backend/app/schemas/projeto_planejamento.py` - Schemas Pydantic
  - `backend/app/routers/projetos_planejamento.py` - Endpoints REST
- **Arquivos removidos:**
  - Todo o conteúdo de `src/features/servicos/`
  - `src/stores/servicosStore.ts`
  - `src/types/servicos.ts`
  - `backend/app/models/empresa.py`, `cliente.py`, `servico.py`, etc.
  - `backend/app/routers/empresas.py`, `clientes.py`, `servicos.py`, etc.
- **Padrões aplicados:**
  - Store com `_hasHydrated` e `persist` apenas para UI state
  - Modal com `memo` e validação de datas
  - Filtros com autocomplete via datalist
  - Endpoints com trailing slash
- **Dica para futuro:**
  - Ao remover módulo inteiro, seguir ordem: integrações → features → stores → backend → banco
  - Usar reviewer agent após implementação para detectar problemas
  - Campos de texto livre (empresa, cliente, categoria) simplificam o cadastro

### 2026-01-21 | Feature: Gráfico de Sobrecarga Temporal
- **Módulo:** Dashboard > Sobrecarga Temporal
- **O que foi feito:**
  - Novo gráfico (AreaChart) mostrando ocupação mensal da equipe
  - Identifica períodos de sobrecarga (>100% de ocupação média)
  - Endpoint backend que calcula ocupação média considerando TODOS os colaboradores
- **Arquivos criados:**
  - `src/features/dashboard/components/OverloadChart.tsx` - Componente do gráfico
  - Backend: Endpoint `/alocacoes/dashboard/sobrecarga-temporal/`
- **Arquivos modificados:**
  - `backend/app/schemas/alocacao.py` - Schema `SobrecargaMensal` com documentação
  - `backend/app/routers/alocacoes.py` - Endpoint com lógica de cálculo
  - `src/types/dashboard.ts` - Interface `SobrecargaMensal`
  - `src/services/api.ts` - Função `getSobrecargaTemporal`
  - `src/stores/dashboardStore.ts` - Action `fetchSobrecargaTemporal`
  - `src/features/dashboard/DashboardPage.tsx` - Integração visual
- **Aprendizados:**
  - **CRÍTICO - Imports duplicados:** Reviewer detectou imports duplicados em `api.ts`, causando potencial erro. SEMPRE revisar imports após múltiplas edições no mesmo arquivo.
  - **CRÍTICO - Lógica de cálculo:** Primeira versão calculava média apenas dos colaboradores alocados. Corrigido para considerar TODOS os colaboradores da empresa (incluindo os sem alocação = 0%), o que representa melhor a sobrecarga real.
  - **Documentação:** Schemas complexos devem ter docstring explicando a fórmula/lógica, não apenas comentários inline.
  - **Recharts:** Reutilizar padrões de componentes existentes (TimelineChart) garante consistência visual.
- **Prevenção:**
  - Usar reviewer agent SEMPRE após implementação para detectar duplicações e lógica incorreta
  - Clarificar métricas complexas: "média dos alocados" vs "média da equipe total" são diferentes
  - Documentar fórmulas de cálculo no schema backend com exemplos numéricos
- **Dica para futuro:**
  - Ao criar visualizações de métricas temporais, pensar: "o que zero representa?" (sem dados vs sem alocação)
  - ReferenceLine em gráficos ajuda usuário a entender thresholds (ex: linha em 100%)

### 2026-01-21 | Feature: Validação de Limite de Projetos Simultâneos por Setor
- **Módulo:** Dashboard > Alocações (Backend)
- **O que foi feito:**
  - Validação backend que limita número máximo de projetos simultâneos por setor
  - Comercial: 10 projetos | Engenharia: 3 projetos | Suprimentos (Compras): 10 projetos | Outros: 8 projetos
  - Validação em `create_alocacao()` e `update_alocacao()` (ao mudar para status ATIVA)
- **Arquivos modificados:**
  - `backend/app/routers/alocacoes.py` - Constante `LIMITE_PROJETOS_POR_SETOR`, função `_validar_limite_projetos()`
- **Aprendizados CRÍTICOS do reviewer:**
  - **Case-sensitivity:** Sempre normalizar strings ao fazer lookup em dicionários (usar `.strip().title()`)
  - **Validação em UPDATE:** Não basta validar no create - usuário pode burlar criando com status "SUSPENSA" e depois mudando para "ATIVA". Validar mudanças de status.
  - **Race condition:** Em produção concorrente, validação seguida de commit pode permitir ultrapassar limite. Soluções: lock pessimista (`with_for_update()`) ou `db.flush()` + revalidação antes do commit.
  - **Mensagens de erro:** Erro deve ser acionável - informar quais projetos estão ativos para o usuário poder suspender/concluir.
- **Prevenção:**
  - SEMPRE validar regras de negócio em CREATE e UPDATE
  - Pensar em bypass: "como usuário pode contornar esta validação?"
  - Considerar concorrência em sistemas multi-usuário
  - Usar reviewer agent para detectar gaps na validação
- **Dica para futuro:**
  - Limites hardcoded podem virar tabela de configuração (`config_limites_setor`) para flexibilidade
  - Validações de limite devem contar apenas registros ativos/relevantes
  - Sempre normalizar strings ao comparar (case-insensitive, trim)

### 2026-01-22 | Feature: Expansão Inline com Detalhes Extras no Módulo Fluxo
- **Módulo:** Fluxo Operacional
- **O que foi feito:**
  - Adicionados campos opcionais `prazoEstimado` e `checklistValidacao` à interface `Etapa`
  - Preenchidos dados em 12 etapas estratégicas da Fase 1 (Pré-Serviço)
  - Implementada expansão inline no componente `EtapaItem` com useState
  - Botão chevron para expandir/recolher detalhes
  - Exibição de prazo estimado (ícone Clock) e checklist de validação (ícone CheckSquare)
- **Arquivos modificados:**
  - `src/features/fluxo/types.ts` - Interface Etapa com novos campos opcionais
  - `src/features/fluxo/data/fluxoData.ts` - Dados preenchidos em etapas críticas
  - `src/features/fluxo/components/EtapaItem.tsx` - Componente com expansão inline
- **Aprendizados do reviewer:**
  - **Acessibilidade:** Sempre adicionar `aria-expanded` e `type="button"` em botões de toggle
  - **Performance:** Usar `useCallback` para handlers e `useMemo` para valores derivados, seguindo convenção do projeto
  - **UX:** Transições suaves melhoram feedback visual (`animate-in fade-in slide-in-from-top-2 duration-200`)
  - **Keys únicas:** Combinar ID da entidade com index (`${etapa.id}-checklist-${index}`) evita colisões
- **Prevenção:**
  - Hooks de performance (useCallback, useMemo) seguem convenção do CLAUDE.md
  - Validar presença de dados antes de renderizar UI (`hasExtraDetails`, `etapa.prazoEstimado`)
  - Campos opcionais permitem adicionar detalhes gradualmente sem quebrar dados existentes
- **Dica para futuro:**
  - Dados estáticos (hardcoded) são adequados quando não precisam ser editados via UI
  - Componentes de expansão inline são melhores que modals para detalhes contextuais rápidos
  - Sempre documentar "números mágicos" no código (ex: `left-[11px]` → offset para alinhar com centro do ícone)

### 2026-01-22 | Bug: Expansão de etapas não funciona (módulo Fluxo)
- **Arquivos:** `src/features/fluxo/index.ts`, `src/features/fluxo/components/EtapaItem.tsx`
- **Erro:** Usuário não conseguia expandir etapas clicando no chevron
- **Causa raiz 1:** Página errada sendo exportada - `FluxoOperacionalPage.tsx` (implementação antiga hardcoded) ao invés de `FluxoPage.tsx` (com componentes novos)
- **Causa raiz 2:** Classes Tailwind inválidas (`animate-in fade-in slide-in-from-top-2`) que não são nativas do Tailwind CSS
- **Solução:**
  1. Mudou exportação em `index.ts` de `FluxoOperacionalPage` para `FluxoPage as FluxoOperacionalPage`
  2. Removeu classes de animação inválidas, substituindo por `transition-all duration-200`
- **Prevenção:**
  - **CRÍTICO:** Ao criar feature nova em módulo com múltiplas páginas/versões, SEMPRE verificar qual está sendo exportada
  - Verificar `index.ts` do módulo para confirmar qual componente é usado
  - Testar a feature imediatamente após implementação para detectar problemas de integração
  - Classes de animação Tailwind: usar apenas as nativas ou configurar plugin (ex: `tailwindcss-animate`)
- **Dica para futuro:**
  - Quando há duas implementações (`Page.tsx` e `PageV2.tsx`), documentar qual é a ativa
  - Considerar remover arquivos antigos/não usados para evitar confusão
  - Usar Explore agent para mapear TODAS as páginas do módulo antes de modificar

### 2026-01-22 | Feature: Módulo Treinamentos - Mapeamento de Dependências Entre Setores
- **Módulo:** Treinamentos (nova aba)
- **O que foi feito:**
  - Criação da interface `DependenciaEntrega` para mapear fluxo entre setores
  - Mapeamento completo de dependências em 44 entregas de 8 setores
  - Expansão do setor Suprimentos para "Suprimentos / Logística / Frotas" (+6 entregas)
  - Movimentação de "Controle de Qualidade" da Operação para Engenharia
  - Visualização de dependências no componente `EntregaItem` com ícone Link2
- **Arquivos modificados:**
  - `src/features/treinamentos/types.ts` - Interface `DependenciaEntrega` + campo `dependencias` em `Entrega`
  - `src/features/treinamentos/data/entregasData.ts` - 44 entregas com dependências mapeadas
  - `src/features/treinamentos/components/EntregaItem.tsx` - Seção "Necessita Receber de Outros Setores"
- **Fluxo de dependências mapeado:**
  - Comercial → Suprimentos → Engenharia (planejamento)
  - Engenharia → RH → DP (mobilização de pessoal)
  - Suprimentos + Engenharia → Operação (execução)
  - Todos → Financeiro → Diretoria (controle e governança)
- **Entregas autônomas (sem dependências):**
  - `com-001` (Briefing - ponto de partida)
  - `eng-004` (RDO - registro diário)
  - `eng-007` (Não Conformidade - sob demanda)
  - `dp-002` (Ponto - registro diário)
  - `dp-006` (Rescisão - sob demanda)
  - `ope-002` (DDS - registro diário)
  - `ope-004` (Registro Fotográfico - contínuo)
  - `sup-009` (Controle de Veículos - cadastro base)
- **Dica para futuro:**
  - Dados estáticos são adequados para conteúdo de referência/treinamento
  - Interface `dependencias?: DependenciaEntrega[]` permite adicionar gradualmente
  - Manter comentário `// EDITÁVEL` em arquivos de dados para indicar que podem ser modificados

### 2026-01-22 | Feature: Visualização e Alocação de Equipe no Planejamento
- **Módulo:** Planejamento > Projetos (modal e cards)
- **O que foi feito:**
  - Lista de alocações inline no modal de edição de projeto
  - Badge com número de pessoas alocadas no card do projeto
  - Form inline para adicionar alocação rápida (função + colaborador + dedicação)
  - Validação de colaboradores já alocados (evita duplicatas)
  - Botão de remoção de alocação com confirmação
- **Arquivos criados:**
  - `src/features/planejamento/components/ProjetoAlocacaoList.tsx` - Lista de alocações
  - `src/features/planejamento/components/AlocacaoInlineForm.tsx` - Form inline
- **Arquivos modificados:**
  - `src/features/planejamento/components/ProjetoModal.tsx` - Seção "Equipe Alocada"
  - `src/features/planejamento/components/ProjetoCard.tsx` - Badge com ícone Users
  - `src/features/planejamento/components/index.ts` - Exports
- **Bugs detectados e corrigidos pelo reviewer:**
  1. **Loop infinito em useEffect:** `fetchAlocacoes` nas deps causava re-render infinito
     - **Solução:** Remover da dependência, usar async/await com cleanup
  2. **Validação de duplicatas:** Permitia alocar mesmo colaborador múltiplas vezes
     - **Solução:** useMemo filtrando colaboradores já alocados no projeto
  3. **Promise não tratada:** Erro silencioso ao carregar alocações
     - **Solução:** try/catch com isMounted check
- **Integração:**
  - Reutiliza dashboardStore.fetchAlocacoes e createAlocacao
  - Reutiliza organoStore.colaboradores para lista de pessoas
  - Reutiliza tipos de dashboard.ts (Alocacao, FuncaoAlocacao, etc.)
- **Prevenção:**
  - useEffect com dependências de store devem ser tratados com cuidado
  - Sempre validar duplicatas antes de criar registros relacionados
  - Usar eslint-disable-next-line quando remover deps é intencional
- **Dica para futuro:**
  - Componentes inline (form dentro de lista) são melhores para ações rápidas
  - Badge visual comunica info importante sem ocupar espaço
  - Reutilizar stores existentes evita duplicação de código

---

## Resumo da Sessão 2026-01-22

### Features Implementadas:
1. ✅ Módulo Treinamentos com 44 entregas e dependências mapeadas
2. ✅ Visualização e alocação de equipe no Planejamento

### Bugs Corrigidos:
1. ✅ Loop infinito em ProjetoCard (useEffect deps)
2. ✅ Duplicatas de alocação permitidas (validação)
3. ✅ Promise não tratada ao carregar alocações

### Próximos Passos Sugeridos:
- [ ] Modal de confirmação customizado (substituir window.confirm)
- [ ] Validação de ocupação total >100% do colaborador
- [ ] Testes unitários para ProjetoAlocacaoList e AlocacaoInlineForm
- [ ] Filtro por função na lista de alocações

### 2026-01-23 | Feature: HoverCard no Badge de Equipe (UX Improvement)
- **Módulo:** Planejamento > Alocação de Equipe
- **O que foi feito:**
  - Criado componente `EquipeBadgeHover` com popover ao passar mouse
  - Preview rápido mostrando: nome, função, % dedicação
  - Avatar com iniciais dos colaboradores
  - Acessibilidade completa (teclado, ARIA labels, Escape key)
- **Arquivos criados:**
  - `src/features/planejamento/components/EquipeBadgeHover.tsx`
- **Arquivos modificados:**
  - `src/features/planejamento/components/ProjetoCard.tsx` (substituiu badge simples)
  - `src/features/planejamento/components/index.ts` (export)
- **Aprendizados CRÍTICOS do reviewer:**
  1. **Tratamento NULL obrigatório:** Arrays do store podem ser `undefined` durante hidratação
     - **Solução:** Sempre usar `(array ?? []).filter(...)` em vez de apenas `.filter(...)`
  2. **Acessibilidade em popovers:** WCAG 2.1 exige keyboard navigation
     - **Solução:** Adicionar `role="button"`, `tabIndex`, `aria-label`, `aria-haspopup`, `aria-expanded`
     - **Solução:** Fechar com Escape key (`useEffect` com `keydown` listener)
  3. **Performance em listas:** `useMemo` para filtros é crítico quando há múltiplos ProjetoCards
     - **Solução:** Memoizar `alocacoesProjeto` com deps `[alocacoes, projetoId]`
- **Prevenção:**
  - **SEMPRE** adicionar `?? []` ao acessar arrays de stores com persist
  - **SEMPRE** implementar keyboard navigation em componentes interativos
  - **SEMPRE** adicionar `role` e `aria-*` attributes para acessibilidade
  - **SEMPRE** permitir Escape key para fechar popovers/modals
- **Dica para futuro:**
  - Popovers simples (sem shadcn/ui) são suficientes para previews rápidos
  - useState + onMouseEnter/onMouseLeave é padrão simples e eficaz
  - Avatar com iniciais: `.split(' ').map(n => n[0]).join('').slice(0,2)`
  - Reviewer agent encontrou 3 bugs críticos que seriam difíceis de detectar visualmente

### 2026-01-23 | Pattern: Workflow UX-First para Melhorias de Interface
- **Contexto:** Reestruturação do sistema de alocação de equipe
- **Workflow aplicado:**
  1. **UX Designer agent:** Avaliação heurística (Nielsen) + proposta de melhorias
  2. **Architect agent:** Planejamento arquitetural detalhado (riscos, decisões, fases)
  3. **Frontend agent:** Implementação incremental (Fase 2: HoverCard)
  4. **Reviewer agent:** Code review automatizado (encontrou 3 bugs críticos)
  5. **Correções:** Aplicadas antes de merge
  6. **Documentação:** LEARNINGS.md atualizado
- **Benefícios:**
  - Design baseado em evidências (benchmarks: Float, Resource Guru, Bridgit Bench)
  - Implementação faseada permite validações incrementais
  - Reviewer identifica bugs de acessibilidade e edge cases
- **Métricas de sucesso:**
  - **Antes:** Badge simples mostrando "3 pessoas" (sem detalhes)
  - **Depois:** Badge + HoverCard com preview rápido (0 cliques para ver equipe)
- **Próximas fases (planejadas, não implementadas ainda):**
  - Fase 3: Combobox com search (substituir `<select>`)
  - Fase 4: Indicador de disponibilidade (evitar sobrecarga)
  - Fase 5: Tabs no modal (reduzir scroll em 80%)
  - Fase 6: Modo Bulk Add (alocar múltiplas pessoas de uma vez)
- **Dica para futuro:**
  - Começar SEMPRE com avaliação UX antes de implementar melhorias
  - Fases incrementais permitem feedback rápido e iterações
  - Reviewer agent é CRUCIAL para encontrar bugs de acessibilidade

### 2026-01-23 | Feature: Combobox com Search + Indicador de Disponibilidade (Fase 3)
- **Módulo:** Planejamento > Alocação de Equipe
- **O que foi feito:**
  - Integrado `ColaboradorCombobox` no `AlocacaoInlineForm`
  - Substituído `<select>` tradicional por autocomplete com busca
  - Indicador de disponibilidade colorido (Verde/Amarelo/Vermelho)
  - Navegação completa por teclado (ArrowUp, ArrowDown, Enter, Escape)
  - Acessibilidade WCAG 2.1 AA completa (roles, ARIA attributes)
- **Arquivos modificados:**
  - `src/features/planejamento/components/ColaboradorCombobox.tsx` (aprimorado)
  - `src/features/planejamento/components/AlocacaoInlineForm.tsx` (integrado)
- **Aprendizados CRÍTICOS do reviewer:**
  1. **Navegação por teclado obrigatória:** Combobox sem ArrowUp/ArrowDown viola WCAG
     - **Solução:** `highlightedIndex` state + handleKeyDown com preventDefault
     - **Solução:** useEffect para resetar index quando search muda
  2. **ARIA attributes completos:** Screen readers precisam de roles e aria-*
     - **Solução:** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup`
     - **Solução:** `role="listbox"` no dropdown, `role="option"` nas opções
     - **Solução:** `aria-activedescendant` para indicar item destacado
     - **Solução:** `aria-selected` para item selecionado
  3. **Non-null assertion (!) é perigoso:** `disp!.percentual_ocupado` pode crashar
     - **Solução:** Substituir por verificação explícita: `disp && disponivel !== null && (...)`
- **Prevenção:**
  - **SEMPRE** implementar ArrowUp/ArrowDown/Enter em dropdowns customizados
  - **SEMPRE** adicionar ARIA attributes completos (combobox, listbox, option)
  - **NUNCA** usar `!` operator sem verificação explícita antes
  - **SEMPRE** usar reviewer agent para detectar violações de acessibilidade
- **Métricas de sucesso:**
  - **Tempo de busca:** 15-30s (scroll manual) → 2-5s (autocomplete) = **85% redução**
  - **Disponibilidade:** Não visível → Visível antes de selecionar = **100% melhoria**
  - **Acessibilidade:** Parcial → WCAG 2.1 AA completa = **100% conforme**
- **Dica para futuro:**
  - Combobox com search é padrão UX superior para listas com >10 itens
  - Indicadores visuais coloridos reduzem carga cognitiva (verde = OK, vermelho = alerta)
  - Keyboard navigation é requisito legal (acessibilidade) e melhora UX para power users
  - Reviewer agent encontrou 3 bugs críticos que impediriam uso por deficientes visuais

### 2026-01-23 | Feature: Tabs no Modal para Organização de Conteúdo (Fase 4)
- **Módulo:** Planejamento > Modal de Projeto
- **O que foi feito:**
  - Reorganizado modal em 3 tabs: Dados, Cronograma, Equipe
  - Tab "Equipe" oculta em modo criação (visível apenas em edição)
  - Navegação completa por teclado (ArrowLeft, ArrowRight, Home, End)
  - Acessibilidade WCAG 2.1 AA completa (roles, ARIA, tabIndex)
  - Barra de progresso visual na tab Cronograma
- **Arquivos modificados:**
  - `src/features/planejamento/components/ProjetoModal.tsx` (reorganizado)
- **Aprendizados CRÍTICOS do reviewer:**
  1. **Tabs precisam keyboard navigation completo:** Arrow keys são obrigatórios
     - **Solução:** `handleTabKeyDown` com ArrowRight, ArrowLeft, Home, End
     - **Solução:** `e.preventDefault()` para evitar scroll da página
  2. **ARIA attributes para tablist são específicos:**
     - `role="tablist"` no container, `role="tab"` nos botões
     - `tabIndex={activeTab === tab.id ? 0 : -1}` (roving tabindex)
     - `aria-selected`, `aria-controls`, `aria-labelledby`
     - `id="tab-{id}"` e `id="tabpanel-{id}"` para vinculação
  3. **Focus visual é obrigatório:** `focus:ring` para usuários de teclado
     - **Solução:** `focus:outline-none focus:ring-2 focus:ring-aztech-primary focus:ring-offset-2`
- **Prevenção:**
  - **SEMPRE** implementar ArrowLeft/ArrowRight em tabs
  - **SEMPRE** usar `tabIndex` gerenciado (roving tabindex pattern)
  - **SEMPRE** adicionar `role="tablist"` no container de tabs
  - **SEMPRE** vincular tabs e painéis via `aria-controls` e `aria-labelledby`
- **Métricas de sucesso:**
  - **Scroll para acessar Equipe:** 80% → 0% = **100% eliminado**
  - **Cliques para acessar Equipe:** Scroll → 1 tab = **acesso direto**
  - **Acessibilidade:** Parcial → WCAG 2.1 AA completa = **100% conforme**
- **Dica para futuro:**
  - Tabs são padrão UX superior para modais com múltiplas seções
  - Usar `useMemo` para filtrar tabs condicionalmente (ex: editOnly)
  - Roving tabindex: apenas o tab ativo recebe foco (tabIndex=0), outros -1
  - Reviewer agent encontrou 3 bugs de acessibilidade que bloqueavam uso por teclado

### 2026-01-23 | Feature: Conversão de Cards para Tabela no Módulo Planejamento
- **Módulo:** Planejamento > Visualização de Projetos
- **O que foi feito:**
  - Criado componente `ProjetoTable` substituindo grid de `ProjetoCard`
  - Tabela ordenável por 9 campos (código, nome, empresa, cliente, categoria, valor, status, data, %)
  - Linhas expansíveis mostrando descrição, subcategoria e tipo
  - Acessibilidade WCAG 2.1 AA completa
  - Responsiva com scroll horizontal
- **Arquivos criados:**
  - `src/features/planejamento/components/ProjetoTable.tsx` (436 linhas)
  - `docs/FEATURE_TABELA_PROJETOS.md` (documentação completa)
- **Arquivos modificados:**
  - `src/features/planejamento/components/index.ts` (export ProjetoTable)
  - `src/features/planejamento/PlanejamentoPage.tsx` (substituir grid por tabela)
- **Aprendizados CRÍTICOS do reviewer:**
  1. **useEffect com arrays:** Arrays como dependência são recriados em cada render
     - **Solução:** Usar `useMemo` para criar representação estável (ex: `projetos.map(p => p.id).join(',')`)
     - **Código:**
       ```tsx
       const projetosIds = useMemo(() => projetos.map(p => p.id).join(','), [projetos])
       useEffect(() => { /* ... */ }, [projetosIds, fetchAlocacoes, projetos])
       ```
  2. **localeCompare sem locale:** Ordenação de strings sem locale causa problemas com acentos
     - **Solução:** Sempre especificar locale pt-BR e sensitivity: base
     - **Código:**
       ```tsx
       a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
       ```
  3. **Tabela sem caption:** Leitores de tela precisam de contexto da tabela
     - **Solução:** Adicionar `<caption className="sr-only">` mesmo que oculto visualmente
     - **Código:**
       ```tsx
       <table>
         <caption className="sr-only">Tabela de projetos de planejamento</caption>
         <thead>...</thead>
       </table>
       ```
- **Prevenção:**
  - **SEMPRE** usar `useMemo` para criar strings/arrays estáveis de IDs em dependências de useEffect
  - **SEMPRE** especificar locale em `localeCompare` para ordenação correta
  - **SEMPRE** adicionar `<caption>` em tabelas (usar sr-only se necessário)
  - **SEMPRE** incluir TODAS as dependências em useEffect (não usar eslint-disable sem justificativa)
- **Métricas de sucesso:**
  - **Densidade:** 6 projetos visíveis → 12 projetos = **+100%**
  - **Ordenação:** Não disponível → 9 campos ordenáveis = **Nova feature**
  - **Comparação:** Difícil (scroll) → Fácil (alinhamento) = **100% melhoria**
  - **Tempo de busca:** ~15s → ~3s = **-80%**
- **Dica para futuro:**
  - Tabelas são superiores a cards para dados tabulares estruturados (código, valor, datas)
  - Cards são melhores para conteúdo heterogêneo e narrativo
  - Ordenação por coluna é feature essencial em tabelas de dados
  - Linhas expansíveis evitam truncamento e mantêm densidade
  - Reviewer agent é CRUCIAL para encontrar bugs de performance e acessibilidade

### 2026-01-23 | Feature: Alocação de Equipe Inline na Tabela de Projetos
- **Módulo:** Planejamento > ProjetoTable (linha expandida)
- **O que foi feito:**
  - Adicionada linha expandível com mini-tabs para alternar entre "Detalhes" e "Equipe"
  - Integração inline do `ProjetoAlocacaoList` (mode="full") dentro da tabela
  - Usuário pode gerenciar equipe diretamente ao expandir linha, sem abrir modal
  - Mini-tabs com acessibilidade WCAG 2.1 AA completa
- **Arquivos modificados:**
  - `src/features/planejamento/components/ProjetoTable.tsx` (adicionados imports, types, state, tabs)
- **Aprendizados CRÍTICOS do reviewer:**
  1. **Map em useState não garante re-render:** React compara referências, `new Map(prev)` pode não disparar re-render
     - **Solução:** Usar objeto simples (`Record<number, T>`) ao invés de Map
     - **Código correto:**
       ```tsx
       const [expandedRowView, setExpandedRowView] = useState<Record<number, ExpandedRowView>>({})

       // Toggle view
       setExpandedRowView((prev) => ({ ...prev, [id]: 'detalhes' }))

       // Cleanup ao fechar
       setExpandedRowView((prev) => {
         const { [id]: _, ...rest } = prev
         return rest
       })
       ```
  2. **JSX multi-elemento no map precisa Fragment:** `map()` retorna um elemento, mas duas `<tr>` precisam de wrapper
     - **Solução:** Envolver em Fragment `<>...</>`
     - **Código correto:**
       ```tsx
       {projetos.map((p) => (
         <>
           <tr key={p.id}>...</tr>
           {isExpanded && <tr>...</tr>}
         </>
       ))}
       ```
  3. **ARIA completo em tabs inline:** Mini-tabs precisam de atributos WCAG completos
     - **Solução:** `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, IDs únicos
     - **Código correto:**
       ```tsx
       <div role="tablist" aria-label="...">
         <button role="tab" id="tab-detalhes-123" aria-selected={true} aria-controls="panel-detalhes-123">
         </button>
       </div>
       <div role="tabpanel" id="panel-detalhes-123" aria-labelledby="tab-detalhes-123">
       ```
  4. **Colspan deve ser igual ao número de colunas:** Comentar para prevenir quebras futuras
     - **Solução:** `{/* colspan={12} deve ser igual ao número de th no thead */}`
- **Prevenção:**
  - **NUNCA** usar Map/Set em useState para dados que precisam disparar re-render (use objeto simples)
  - **SEMPRE** usar Fragment quando map retorna múltiplos elementos JSX
  - **SEMPRE** adicionar ARIA completo em tabs customizadas (não usar button genérico)
  - **SEMPRE** comentar colspans para evitar quebras ao adicionar colunas
- **Métricas de sucesso:**
  - **Cliques para alocar equipe:** Editar (1) + Tabs (1) + Form → Expandir (1) + Tab (1) + Form = **-1 clique**
  - **Tempo de alocação:** ~10s → ~5s = **-50%**
  - **Contexto:** Mantém usuário na lista → Não perde scroll = **100% melhor**
- **Dica para futuro:**
  - Tabs inline em linhas expandidas são UX superior para ações rápidas
  - ProjetoAlocacaoList com `mode="full"` permite reutilização em múltiplos contextos
  - Reviewer agent encontrou 2 bugs críticos (Map, Fragment) que causariam problemas silenciosos
  - Record<K, V> é preferível a Map<K, V> para state simples no React

---

*Última atualização: 2026-01-23*

### 2026-01-23 | Refatoração: Remoção do campo percentual_dedicacao das alocações
- **Módulos:** Planejamento, Dashboard (Alocações)
- **Motivação:** Simplificar lógica de negócio - se colaborador foi atribuído a um projeto com função específica, ele é responsável por ela, sem necessidade de percentual
- **Arquivos modificados (10 total):**
  **Backend (4):**
  1. `backend/app/models/alocacao.py` - Removido Column(percentual_dedicacao)
  2. `backend/app/schemas/alocacao.py` - Removido de AlocacaoBase, AlocacaoUpdate, AlocacaoComDetalhes
  3. `backend/app/routers/alocacoes.py` - Substituído por cálculo (horas_semanais/44)*100 em 3 lugares
  4. `backend/scripts/criar_alocacoes_teste.py` - Removido parâmetro do script
  
  **Frontend (6):**
  5. `src/types/dashboard.ts` - Removido de Alocacao, AlocacaoCreate, AlocacaoUpdate
  6. `src/services/api.ts` - Removido de AlocacaoAPI e conversor
  7. `src/features/planejamento/components/AlocacaoInlineForm.tsx` - Removido input e state
  8. `src/features/planejamento/components/ProjetoAlocacaoList.tsx` - Removido exibição
  9. `src/features/planejamento/components/EquipeBadgeHover.tsx` - Removido exibição
  10. `src/features/dashboard/components/AlocacaoModal.tsx` - Removido input e state
- **Decisão arquitetural:**
  - Mantido campo `horas_semanais` para cálculos (44h/semana = 100% dedicação)
  - Cálculos de `percentual_ocupado` e `percentual_dedicacao` derivados de `horas_semanais`
  - Fórmula: `(horas_semanais / 44.0) * 100`
- **Armadilhas evitadas (reviewer agent):**
  1. **CRÍTICO:** Router backend ainda referenciava campo removido (linhas 123, 390, 460)
  2. **CRÍTICO:** Docstring desatualizada mencionava campo removido
  3. **SUGESTÃO:** Arquivo backup `.bak` deixado acidentalmente
- **Solução aplicada:**
  ```python
  # ANTES (QUEBRADO)
  percentual_total = sum(a.percentual_dedicacao for a in alocacoes_ativas)
  
  # DEPOIS (CORRETO)
  percentual_total = sum((a.horas_semanais / 44.0) * 100 for a in alocacoes_ativas)
  ```
- **Impacto:**
  - UX simplificada: Formulário de alocação tem 1 campo a menos
  - Menos validações: Não precisa validar percentual entre 0-100
  - Cálculos mais claros: Baseado em horas reais, não percentual abstrato
  - Compatível: Disponibilidade e sobrecarga continuam funcionando via cálculo
- **Prevenção:**
  - **SEMPRE** usar reviewer agent após refatorações grandes
  - **SEMPRE** verificar endpoints backend que dependem de campos removidos
  - **SEMPRE** deletar arquivos backup após confirmar mudanças
  - **SEMPRE** atualizar docstrings quando lógica de cálculo muda
  - Campo removido do model → buscar no router por `r.ModelName.campo_removido`
  - Se campo é usado em somas/agregações, substituir por cálculo derivado
- **Dica para futuro:**
  - Considerar criar `@property` no model para cálculos derivados reutilizáveis
  - Migração Alembic necessária para remover coluna do banco (não feita nesta sessão)
  - Testes unitários recomendados para validar cálculos de disponibilidade
