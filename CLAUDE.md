# Sistema AZ TECH - Guia para Claude Code

## Visão Geral

Sistema de gestão empresarial da AZ TECH Soluções e Engenharia com:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Estado:** Zustand com persistência
- **UI:** Shadcn/ui + Lucide icons

## Estrutura do Projeto

```
aztech-sistema-completo/
├── .claude/                    # Configurações Claude Code
│   ├── settings.json          # Permissões, hooks, agents
│   ├── agents/                # Subagents especializados
│   ├── commands/              # Slash commands
│   └── rules/                 # Regras por contexto
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # Shadcn/ui
│   │   └── organograma/      # Componentes do organograma
│   ├── features/             # Features por domínio
│   │   ├── dashboard/
│   │   ├── organograma/
│   │   └── configuracoes/
│   ├── stores/               # Zustand stores
│   ├── hooks/                # Custom hooks
│   ├── services/             # Lógica de negócio
│   └── types/                # TypeScript types
├── backend/
│   └── app/
│       ├── models/           # SQLAlchemy models
│       ├── schemas/          # Pydantic schemas
│       └── routers/          # API endpoints
└── docker-compose.yml        # Infra local
```

---

## Slash Commands Disponíveis

### /fix-bug [descrição]
Investigar e corrigir um bug no sistema.

**Workflow:**
1. Reproduzir o erro
2. Localizar causa raiz
3. Implementar correção
4. Verificar fix
5. Documentar aprendizado

### /new-feature [descrição]
Implementar nova funcionalidade.

**Workflow:**
1. Analisar requisitos
2. Planejar arquitetura
3. Implementar
4. Verificar integração
5. Documentar

### /review [caminho]
Revisar código para qualidade e segurança.

**Checklist:**
- TypeScript sem erros
- Padrões do projeto
- Performance
- Segurança

### /status
Verificar status geral do projeto.

**Verifica:**
- TypeScript errors
- Docker containers
- Arquivos modificados
- Pendências

### /learn [aprendizado]
Registrar novo aprendizado no sistema de memória.

---

## Subagents Disponíveis

### architect
**Uso:** Decisões estruturais, design de stores, padrões de projeto.

```
Use o architect agent para criar novo módulo de relatórios
```

**Responsabilidades:**
- Separação de camadas
- Design de interfaces
- ADRs (Architecture Decision Records)

### frontend
**Uso:** UI/UX, componentes React, Tailwind, acessibilidade.

```
Use o frontend agent para criar componente de dashboard
```

**Responsabilidades:**
- Componentes React
- Tailwind CSS
- Responsividade
- Acessibilidade

### testing
**Uso:** Testes automatizados, cobertura, qualidade.

```
Use o testing agent para escrever testes do serviço de validação
```

**Responsabilidades:**
- Testes unitários (Vitest)
- Testes de componentes (Testing Library)
- Cobertura de código

### reviewer
**Uso:** Code review, identificar bugs, sugerir melhorias.

```
Use o reviewer agent para revisar os arquivos modificados
```

**Responsabilidades:**
- Identificar code smells
- Verificar padrões
- Sugerir refatorações

---

## Regras do Projeto

### TypeScript
- Sem `any` não justificado
- Interfaces para props de componentes
- Types em `/types/` ou colocados com feature
- Zod para validação de runtime

### React
- Hooks SEMPRE antes de returns
- useMemo para cálculos derivados
- useCallback para funções passadas como props
- useShallow nos selectors Zustand

### Tailwind
- Sem inline styles
- Tokens de cor: `bg-aztech-*`, `text-aztech-*`
- Mobile-first (sm:, md:, lg:)
- Classes ordenadas: layout → spacing → visual

### Stores (Zustand)
- Um store por domínio
- Actions assíncronas com try/catch
- Estado de loading/error
- `_hasHydrated` para persistência

---

## Aprendizados Registrados

### Bug: Hooks chamados após early return
**Data:** 2025-01-18
**Arquivo:** ColaboradorModal.tsx
**Erro:** "Rendered more hooks than during the previous render"
**Causa:** useMemo estava sendo chamado DEPOIS de `if (!isOpen) return null`
**Solução:** TODOS os hooks devem ser chamados ANTES de qualquer return

### Bug: Store não hidratada
**Data:** 2025-01-18
**Arquivo:** ColaboradorModal.tsx, OrgNode.tsx
**Erro:** Tela branca ao editar colaborador
**Causa:** Componente renderizava antes do Zustand hidratar do localStorage
**Solução:** Verificar `hasHydrated` antes de renderizar dados dependentes

### Bug: Promises não tratadas
**Data:** 2025-01-18
**Arquivo:** OrganoramaPage.tsx
**Erro:** "erro inesperado recarregue a página"
**Causa:** Funções async do store chamadas sem await/try-catch
**Solução:** Handlers devem ser async com try/catch

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia Vite dev server
npm run type-check       # Verifica TypeScript
npm test                 # Roda testes

# Docker
docker-compose up -d     # Sobe containers
docker-compose logs -f   # Ver logs
docker-compose down      # Para containers

# Git
git status               # Ver mudanças
git diff                 # Ver diferenças
```

---

## Hooks Configurados

### PostToolUse (Edit|Write)
Após editar/criar arquivo, lembra de rodar type-check.

### PreToolUse (Edit)
Antes de editar, verifica contexto do arquivo.

---

## Workflow Recomendado

1. **Entender** - Ler código relacionado antes de modificar
2. **Planejar** - Usar TodoWrite para tarefas complexas
3. **Implementar** - Fazer mudanças incrementais
4. **Verificar** - Rodar type-check após mudanças
5. **Documentar** - Registrar aprendizados importantes

---

## Padrões de Código

### Componente React
```tsx
interface CardProps {
  title: string
  children: React.ReactNode
  onAction?: () => void
}

export function Card({ title, children, onAction }: CardProps) {
  // Hooks PRIMEIRO
  const [isOpen, setIsOpen] = useState(false)
  const derived = useMemo(() => /* ... */, [deps])

  // Handlers
  const handleClick = useCallback(() => {
    onAction?.()
  }, [onAction])

  // Early returns DEPOIS dos hooks
  if (!title) return null

  // Render
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  )
}
```

### Zustand Store
```typescript
interface FeatureState {
  items: Item[]
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
}

interface FeatureActions {
  fetchItems: () => Promise<void>
  addItem: (data: Omit<Item, 'id'>) => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useFeatureStore = create<FeatureState & FeatureActions>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      fetchItems: async () => {
        set({ isLoading: true, error: null })
        try {
          const items = await api.getItems()
          set({ items, isLoading: false })
        } catch (error) {
          set({ error: 'Erro ao carregar', isLoading: false })
        }
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'feature-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
```

---

## Contato

Projeto mantido pela equipe de TI da AZ TECH Soluções e Engenharia.
