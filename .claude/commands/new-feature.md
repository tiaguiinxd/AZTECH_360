---
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, TodoWrite, Task, AskUserQuestion
description: Implementar nova funcionalidade no sistema AZ TECH
argument-hint: [descrição da feature]
model: sonnet
---

# /new-feature - Nova Funcionalidade (Workflow Seguro)

**Feature solicitada:** $ARGUMENTS

## Contexto do Projeto

- Branch: !`git branch --show-current`
- Estrutura src/: !`ls -la src/ 2>/dev/null || dir src /b`

---

## ⚠️ WORKFLOW OBRIGATÓRIO (NÃO PULAR ETAPAS)

### ETAPA 0: CARREGAR CONTEXTO DO SISTEMA
**EXECUTAR IMEDIATAMENTE - NÃO PULAR:**

```
1. Ler .claude/SYSTEM_MAP.md (matriz de dependências, entidades, stores)
2. Ler .claude/LEARNINGS.md (padrões e erros passados)
3. Criar TodoWrite com todas as etapas abaixo
```

### ETAPA 1: ANÁLISE DE ESCOPO
Usando o SYSTEM_MAP, identificar:

1. **Qual módulo será afetado?** (Organograma, Serviços, Configurações, etc.)
2. **Quais stores precisam ser atualizados?** (organoStore, servicosStore, configStore)
3. **Existe endpoint no backend?** Se não, criar primeiro
4. **Quais módulos dependem deste?** (verificar matriz de dependências)

**Documentar no TodoWrite:** "Módulo: X | Store: Y | Dependentes: Z"

### ETAPA 2: ENTENDIMENTO
Antes de escrever código:

1. O que exatamente a feature deve fazer?
2. Quais são os casos de uso principais?
3. Quais são os edge cases?
4. Há features similares no sistema que podem ser reutilizadas?

**Se houver dúvidas, usar AskUserQuestion para clarificar.**

### ETAPA 3: EXPLORAÇÃO
**Usar Task + Explore agent para:**
```
Mapear código existente relacionado:
1. Componentes similares
2. Padrões usados no projeto
3. Types existentes em src/types/
4. Stores relacionados
```

### ETAPA 4: PLANEJAMENTO
Criar TodoWrite detalhado com ordem de implementação:

```
1. Types      → src/types/ (se necessário)
2. Backend    → backend/app/routers/ (se necessário)
3. Store      → src/stores/
4. Services   → src/services/
5. Components → src/features/[modulo]/
6. Integração → verificar módulos dependentes
```

### ETAPA 5: IMPLEMENTAÇÃO
Seguir a ordem do planejamento. Para cada arquivo:

1. Verificar padrões existentes no SYSTEM_MAP
2. Reutilizar componentes quando possível
3. Seguir convenções do projeto (CLAUDE.md)

### ETAPA 6: VERIFICAÇÃO CRUZADA (OBRIGATÓRIO)
**Usar Task + reviewer agent para:**
```
Revisar a implementação verificando:
1. A feature funciona como esperado?
2. Os módulos dependentes foram afetados negativamente?
3. Há código duplicado ou padrões inconsistentes?
4. As regras de consistência do SYSTEM_MAP foram seguidas?
```

### ETAPA 7: VALIDAÇÃO TÉCNICA (OBRIGATÓRIO)
```bash
npm run type-check  # DEVE passar com zero erros
```

Se falhar, corrigir antes de prosseguir.

### ETAPA 8: TESTE FUNCIONAL (OBRIGATÓRIO)
Verificar no navegador ou com testes:

1. A feature funciona corretamente?
2. As funcionalidades existentes continuam funcionando?
3. Os módulos dependentes não quebraram?

### ETAPA 9: ATUALIZAÇÃO DE DOCUMENTAÇÃO (OBRIGATÓRIO)
Se a feature adicionar nova entidade ou modificar estrutura:

1. Atualizar `.claude/SYSTEM_MAP.md` (matriz de dependências)
2. Atualizar `docs/CHANGELOG.md` se for mudança significativa

### ETAPA 10: REGISTRO DE APRENDIZADO (OBRIGATÓRIO)
**Perguntar ao usuário usando AskUserQuestion:**
```
"A feature foi implementada com sucesso? Há algum padrão ou aprendizado que devo registrar?"
```

Se sim, adicionar em `.claude/LEARNINGS.md`:
```markdown
### [DATA] Feature: [nome da feature]
- **Módulo:** [módulo afetado]
- **Padrão usado:** [padrão ou abordagem]
- **Dica para futuro:** [o que lembrar]
```

---

## CHECKLIST FINAL (MARCAR TODOS)

```
[ ] SYSTEM_MAP consultado
[ ] LEARNINGS.md consultado
[ ] Módulos dependentes identificados
[ ] Planejamento criado no TodoWrite
[ ] Reviewer agent executado
[ ] Type-check passou
[ ] Feature testada funcionalmente
[ ] SYSTEM_MAP atualizado (se aplicável)
[ ] Aprendizado registrado (se aplicável)
```

---

## REGRAS INVIOLÁVEIS

1. **NÃO** implementar sem ler SYSTEM_MAP primeiro
2. **NÃO** criar entidade sem endpoint backend
3. **NÃO** pular verificação de módulos dependentes
4. **NÃO** finalizar sem rodar type-check
5. **SEMPRE** usar reviewer agent após implementação
6. **SEMPRE** atualizar SYSTEM_MAP se adicionar entidades
7. **SEMPRE** perguntar sobre registro de aprendizado

---

## PADRÕES DO PROJETO (Referência Rápida)

### Componentes React
- Máximo 200 linhas
- Props tipadas com interface
- Hooks ANTES de returns
- useShallow para selectors Zustand

### Stores Zustand
- `_hasHydrated` + `onRehydrateStorage`
- Separar state e actions
- Dados de negócio NÃO persistidos (vêm da API)

### Backend FastAPI
- Todo router registrado em `main.py`
- Trailing slash em endpoints (`/empresas/`)
- Validação de FK antes de criar/deletar
