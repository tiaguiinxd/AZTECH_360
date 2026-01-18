---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Regras TypeScript - Sistema AZ TECH

## Configuração
- Strict mode habilitado
- No implicit any
- No unused locals/parameters

## Tipos

### Nomenclatura
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Interface | PascalCase | `Colaborador` |
| Type alias | PascalCase | `ID` |
| Enum | PascalCase | `StatusProjeto` |
| Generic | T, K, V | `Array<T>` |

### Preferências
- `interface` para objetos com shape definido
- `type` para unions, intersections, mapped types
- Evitar `enum`, preferir union de strings literais
- Exportar tipos junto com implementações

## Imports

```typescript
// Ordem recomendada:
import { memo } from 'react'                    // 1. React
import { useShallow } from 'zustand/react/shallow' // 2. Libs externas
import { cn } from '@/utils'                    // 3. Utils internos
import type { Colaborador } from '@/types'      // 4. Types (sempre com type)
```

## Padrões

### Props de Componente
```typescript
interface CardProps extends ComponentProps<'div'> {
  data: Colaborador
  variant?: 'default' | 'compact'
  onAction?: (id: ID) => void
}
```

### State de Store
```typescript
interface FeatureState {
  items: Item[]
  selectedId: ID | null
  isLoading: boolean
  error: string | null
}
```

### Funções Assíncronas
```typescript
async function fetchData(): Promise<Data[]> {
  // Sempre tipar retorno de async
}
```

## Proibições

- `any` sem justificativa no comentário
- `// @ts-ignore` sem explicação
- Type assertions desnecessárias (`as`)
- Non-null assertions (`!`) excessivas
