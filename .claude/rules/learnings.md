---
paths:
  - "**/*"
---

# Aprendizados do Projeto - Sistema AZ TECH

Este arquivo registra conhecimentos adquiridos durante o desenvolvimento.
Use o comando `/learn` para adicionar novos aprendizados.

---

## 2026-01-18 - BUG: Hooks chamados após early return

**Contexto:** ColaboradorModal.tsx causava tela branca ao editar

**Problema:**
`useMemo` era chamado DEPOIS de `if (!isOpen) return null`, violando a regra dos hooks do React.

**Solução:**
Mover TODOS os hooks para ANTES de qualquer `return`.

```tsx
// ❌ ERRADO
if (!isOpen) return null
const computed = useMemo(() => {}, [])  // Hook após return = BUG

// ✅ CORRETO
const computed = useMemo(() => {}, [])  // Hooks primeiro
if (!isOpen) return null                // Early return depois
```

**Arquivos afetados:** `ColaboradorModal.tsx`

---

## 2026-01-18 - BUG: Promises não tratadas causam crash

**Contexto:** Editar colaborador causava erro no ErrorBoundary

**Problema:**
Funções async do store (`updateColaborador`, `deleteColaborador`) lançam erros quando falham, mas os handlers não usavam `await` nem `try/catch`.

**Solução:**
Sempre usar `async/await` com `try/catch` ao chamar funções do store.

```tsx
// ❌ ERRADO
const handleSave = (data) => {
  updateColaborador(id, data)  // Promise não tratada
}

// ✅ CORRETO
const handleSave = async (data) => {
  try {
    await updateColaborador(id, data)
  } catch (error) {
    console.error('Erro:', error)
  }
}
```

**Arquivos afetados:** `OrganoramaPage.tsx`, `ColaboradoresConfig.tsx`

---

## 2026-01-18 - PATTERN: Verificar hidratação do store

**Contexto:** Componentes falhavam quando store não estava hidratado

**Padrão:**
Verificar `_hasHydrated` e tamanho dos arrays antes de acessar dados do store.

```tsx
const { items, hasHydrated } = useStore(
  useShallow(state => ({
    items: state.items,
    hasHydrated: state._hasHydrated,
  }))
)

const isDataReady = hasHydrated && items.length > 0

if (!isDataReady) return <Loading />
```

**Uso:** Em componentes que dependem de dados do configStore

---

## Template para Novos Aprendizados

```markdown
## [DATA] - [TIPO]: [Título]

**Contexto:** [Onde/quando descoberto]

**Problema/Padrão:**
[Descrição]

**Solução:**
```code
[Código exemplo]
```

**Arquivos afetados:** [Lista]

---
```
