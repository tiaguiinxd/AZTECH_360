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

## 2026-01-18 - BUG: Foreign Key validation no backend

**Contexto:** Erro "erro ao carregar dados" ao modificar colaborador mudando nível + subnível

**Problema:**
Backend não validava se `subnivel_id` pertence ao `nivel_id` correto. Quando usuário mudava o nível e tentava atribuir um subnível que não pertencia a esse nível, o banco rejeitava a operação por violação de FK constraint.

**Causa raiz:**
1. Modelo `Colaborador` tem FK para `subniveis.id`
2. Modelo `Subnivel` tem FK para `niveis_hierarquicos.id`
3. Backend não validava a relação entre subnível e nível
4. Banco rejeitava silenciosamente, frontend mostrava mensagem genérica

**Solução:**
Adicionar validação explícita no backend antes de salvar:

```python
# Validar subnivel_id se especificado
if colaborador.subnivel_id is not None:
    nivel_id = update_data.get("nivel_id", db_colaborador.nivel_id)

    subnivel = db.query(Subnivel).filter(Subnivel.id == colaborador.subnivel_id).first()
    if not subnivel:
        raise HTTPException(status_code=400, detail=f"Subnível {id} não encontrado")

    # Verificar se o subnível pertence ao nível correto
    if subnivel.nivel_id != nivel_id:
        raise HTTPException(
            status_code=400,
            detail=f"Subnível {subnivel.nome} não pertence ao nível hierárquico selecionado"
        )
```

**Arquivos afetados:** `backend/app/routers/colaboradores.py`

**Lições aprendidas:**
- Sempre validar relações de FK no backend ANTES de tentar salvar no banco
- Retornar mensagens de erro claras para o frontend
- Não confiar apenas em constraints do banco para validação de regras de negócio

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
