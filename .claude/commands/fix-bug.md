---
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, TodoWrite, Task, AskUserQuestion
description: Investigar e corrigir um bug no sistema AZ TECH
argument-hint: [descrição do bug]
model: sonnet
---

# /fix-bug - Correção de Bug (Workflow Seguro)

**Bug reportado:** $ARGUMENTS

## Contexto Atual

- Git status: !`git status --short`
- Branch atual: !`git branch --show-current`

---

## ⚠️ WORKFLOW OBRIGATÓRIO (NÃO PULAR ETAPAS)

### ETAPA 0: CARREGAR CONTEXTO DO SISTEMA
**EXECUTAR IMEDIATAMENTE - NÃO PULAR:**

```
1. Ler .claude/SYSTEM_MAP.md (matriz de dependências)
2. Ler .claude/LEARNINGS.md (erros passados para não repetir)
3. Criar TodoWrite com todas as etapas abaixo
```

### ETAPA 1: ANÁLISE DE IMPACTO
Antes de qualquer código:

1. **Identificar módulo afetado** usando SYSTEM_MAP
2. **Listar módulos dependentes** que podem ser impactados
3. **Verificar aprendizados relacionados** em LEARNINGS.md
4. **Documentar no TodoWrite:** "Módulos afetados: X, Y, Z"

### ETAPA 2: INVESTIGAÇÃO
1. Entender comportamento esperado vs atual
2. Usar Grep/Glob para encontrar código relacionado
3. Ler arquivos afetados com Read
4. Verificar se há testes existentes

### ETAPA 3: DIAGNÓSTICO
1. Identificar causa raiz (não apenas sintoma)
2. Verificar se o mesmo padrão existe em outros lugares
3. Documentar: "Causa raiz: ..."

### ETAPA 4: IMPLEMENTAÇÃO
1. Fazer a menor correção possível
2. NÃO refatorar código não relacionado
3. Manter compatibilidade

### ETAPA 5: VERIFICAÇÃO CRUZADA (OBRIGATÓRIO)
**Usar Task + reviewer agent para:**
```
Revisar a correção feita, verificando:
1. A correção resolve o problema sem criar outros?
2. Há código duplicado ou padrões quebrados?
3. Os módulos dependentes foram afetados?
```

### ETAPA 6: VALIDAÇÃO TÉCNICA (OBRIGATÓRIO)
```bash
npm run type-check  # DEVE passar com zero erros
```

Se falhar, voltar à ETAPA 4.

### ETAPA 7: TESTE DE IMPACTO (OBRIGATÓRIO)
Verificar manualmente ou com testes:
1. O bug foi corrigido?
2. As funcionalidades relacionadas ainda funcionam?
3. Os módulos dependentes não quebraram?

### ETAPA 8: REGISTRO DE APRENDIZADO (OBRIGATÓRIO)
**Perguntar ao usuário usando AskUserQuestion:**
```
"O bug foi resolvido? Devo registrar este aprendizado para evitar recorrência?"
```

Se sim, adicionar em `.claude/LEARNINGS.md`:
```markdown
### [DATA] Bug: [descrição curta]
- **Arquivo:** path/to/file.tsx
- **Causa:** [causa raiz]
- **Solução:** [o que foi feito]
- **Prevenção:** [como evitar no futuro]
```

---

## CHECKLIST FINAL (MARCAR TODOS)

```
[ ] SYSTEM_MAP consultado
[ ] LEARNINGS.md consultado
[ ] Módulos dependentes verificados
[ ] Reviewer agent executado
[ ] Type-check passou
[ ] Bug confirmado como resolvido
[ ] Aprendizado registrado (se aplicável)
```

---

## REGRAS INVIOLÁVEIS

1. **NÃO** pular etapas do workflow
2. **NÃO** editar código sem ler SYSTEM_MAP primeiro
3. **NÃO** finalizar sem rodar type-check
4. **NÃO** ignorar módulos dependentes
5. **SEMPRE** usar reviewer agent após implementação
6. **SEMPRE** perguntar sobre registro de aprendizado
