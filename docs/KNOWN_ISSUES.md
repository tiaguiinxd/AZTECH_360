# Problemas Conhecidos

> Issues identificados durante o desenvolvimento que precisam ser resolvidos.
> 
> Consulte este arquivo antes de desenvolver para evitar repetir erros
> ou para saber de limitações existentes.

---

## Como Documentar um Issue

```markdown
### ISSUE-XXX: [Título do problema]
**Módulo:** [Organograma/Projetos/Dashboard/Config/Global]
**Versão afetada:** X.Y.Z+
**Severidade:** 🔴 Crítico / 🟡 Médio / 🟢 Baixo
**Descrição:** O que está acontecendo
**Workaround:** Como contornar temporariamente
**Solução planejada:** O que precisa ser feito
**Sprint/Fase:** Quando será resolvido
```

---

## Críticos 🔴

> Problemas que afetam funcionalidades core ou causam perda de dados.

(Nenhum issue crítico no momento)

---

## Médios 🟡

> Problemas que afetam UX mas têm workaround.

(Nenhum issue médio no momento)

---

## Baixos 🟢

> Melhorias desejáveis ou problemas cosméticos.

(Nenhum issue baixo no momento)

---

## Resolvidos ✅

> Issues que foram corrigidos (manter para histórico).

### ISSUE-001: Tela branca após atualização (Set + Zustand persist) ✅
**Módulo:** Global / Organograma
**Versão afetada:** 0.2.0
**Severidade:** 🔴 Crítico
**Data:** 2026-01-17
**Resolvido em:** 0.2.0

**Descrição:**
Ao usar `Set<ID>` para `expandedIds` no Zustand store com middleware `persist`, a aplicação apresentava tela branca ("pisca" e fica branco) após refresh. Isso ocorria porque:
1. `Set` não serializa corretamente para JSON (vira `{}` vazio)
2. Ao hidratar do localStorage, o Set não era reconstruído corretamente
3. Métodos como `.has()` falhavam em runtime

**Causa raiz:**
O Zustand persist usa `JSON.stringify` para salvar no localStorage. Set e Map não são serializáveis nativamente em JSON.

**Solução aplicada:**
Trocar `Set<ID>` por `ID[]` (Array) no estado:
```typescript
// ANTES (problemático)
expandedIds: Set<ID>
expandedIds.has(id)

// DEPOIS (correto)
expandedIds: ID[]
expandedIds.includes(id)
```

**Arquivos alterados:**
- `src/stores/organoStore.ts` - Trocar Set por Array
- `src/components/organograma/OrgTree.tsx` - Atualizar tipagem e uso
- `tests/unit/organoStore.test.ts` - Atualizar testes

**Lição aprendida:**
**NUNCA usar Set ou Map em estado que será persistido com Zustand persist.**
Sempre usar Array e objetos planos que são JSON-serializáveis.
Documentar no código com comentário explicativo.

---

*Atualize este arquivo sempre que identificar ou resolver um problema.*
