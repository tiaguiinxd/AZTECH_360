---
paths:
  - "src/**/*.tsx"
  - "src/components/**/*"
  - "src/features/**/*"
---

# Regras React - Sistema AZ TECH

## Estrutura de Componente

```tsx
// 1. Imports
import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/utils'

// 2. Types
interface MyComponentProps extends ComponentProps<'div'> {
  data: DataType
  variant?: 'default' | 'compact'
}

// 3. Constants (se houver)
const VARIANT_STYLES = { ... } as const

// 4. Component
export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ data, variant = 'default', className, ...props }, ref) => {
    // Hooks primeiro
    const [state, setState] = useState()

    // Handlers depois
    const handleClick = useCallback(() => {}, [])

    // Render por último
    return (...)
  }
)

// 5. displayName
MyComponent.displayName = 'MyComponent'
```

## Regras de Hooks

### Ordem de Chamada
1. useState
2. useRef
3. Stores (useXxxStore)
4. useEffect
5. useMemo
6. useCallback

### Regra dos Hooks
- NUNCA chamar hooks condicionalmente
- NUNCA chamar hooks depois de early return
- Todos hooks ANTES de qualquer return

```tsx
// ❌ ERRADO
function Component({ isOpen }) {
  if (!isOpen) return null  // Early return ANTES de hooks
  const [data] = useState() // Hook depois do return = BUG
}

// ✅ CORRETO
function Component({ isOpen }) {
  const [data] = useState() // Hooks SEMPRE primeiro

  if (!isOpen) return null  // Early return depois
}
```

## Zustand + React

### Selectors com useShallow
```tsx
// ❌ ERRADO - re-render em qualquer mudança do store
const { items, selected } = useStore(state => ({
  items: state.items,
  selected: state.selected
}))

// ✅ CORRETO - re-render apenas quando items/selected mudam
const { items, selected } = useStore(
  useShallow(state => ({
    items: state.items,
    selected: state.selected
  }))
)
```

### Actions separadas
```tsx
// Actions não precisam de useShallow
const addItem = useStore(state => state.addItem)
```

## Performance

### Memoização
```tsx
// Componentes pesados
const HeavyList = memo(function HeavyList({ items }) {})

// Cálculos caros
const sorted = useMemo(() => items.sort(...), [items])

// Handlers passados como props
const handleClick = useCallback(() => {}, [deps])
```

### Evitar
- Criar objetos/arrays no render
- Funções inline em props (sem useCallback)
- Recalcular em todo render sem useMemo

## Limites

- Componentes: máximo 200 linhas
- Funções: máximo 50 linhas
- Props: máximo 10 props (considerar composição)
