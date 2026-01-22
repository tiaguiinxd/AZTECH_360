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

---

*Última atualização: 2026-01-22*
