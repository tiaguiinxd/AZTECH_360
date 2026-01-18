---
allowed-tools: Read, Write, Edit, Glob
description: Registrar aprendizado ou padrão descoberto no projeto
argument-hint: [tipo] [descrição] - tipos: pattern, bug, decision, tip
model: sonnet
---

# /learn - Registro de Aprendizado

**Input:** $ARGUMENTS

## Sistema de Aprendizado Contínuo

Este comando registra conhecimentos adquiridos durante o desenvolvimento para evitar que os mesmos problemas ou descobertas se repitam.

## Tipos de Aprendizado

### pattern - Padrão Descoberto
Novo padrão de código ou arquitetura identificado que deve ser seguido.

### bug - Bug e Solução
Bug encontrado e sua solução para referência futura.

### decision - Decisão Técnica
Decisão arquitetural ou técnica tomada e sua justificativa.

### tip - Dica Útil
Dica ou atalho que melhora a produtividade.

## Workflow

1. Extrair tipo e descrição do input
2. Ler o arquivo `.claude/rules/learnings.md` (criar se não existir)
3. Adicionar novo aprendizado com:
   - Data
   - Tipo
   - Descrição
   - Contexto (arquivos relacionados, se houver)
   - Exemplo de código (se aplicável)
4. Salvar o arquivo

## Formato do Registro

```markdown
### [DATA] - [TIPO]: [Título Curto]

**Contexto:** [Onde/quando isso foi descoberto]

**Descrição:** [Explicação detalhada]

**Exemplo:**
```code
[código se aplicável]
```

**Arquivos relacionados:** [lista de arquivos]

---
```

## Integração com Memória

Os aprendizados registrados em `.claude/rules/learnings.md` são automaticamente carregados pelo sistema de memória do Claude Code, garantindo que o conhecimento persista entre sessões.
