---
allowed-tools: Read, Grep, Glob, Bash
description: Revisar código para qualidade, segurança e padrões
argument-hint: [caminho ou arquivos a revisar]
model: sonnet
---

# /review - Code Review

**Escopo:** $ARGUMENTS

## Contexto

- Mudanças recentes: !`git diff --stat HEAD~5 2>/dev/null || echo "Sem histórico git"`

## Checklist de Review

### Código
- [ ] Sem erros de TypeScript (`npm run type-check`)
- [ ] Sem `any` não justificado
- [ ] Funções < 50 linhas
- [ ] Componentes < 200 linhas
- [ ] Nomes descritivos e consistentes
- [ ] Hooks chamados incondicionalmente (regra dos hooks)

### Estilo
- [ ] Tailwind apenas (sem inline styles)
- [ ] Cores usando tokens (bg-aztech-*, text-*)
- [ ] Layout responsivo (mobile-first)
- [ ] Acessibilidade (labels, ARIA, contraste)

### Performance
- [ ] useMemo/useCallback onde necessário
- [ ] useShallow em selectors Zustand
- [ ] Sem re-renders desnecessários
- [ ] Imports otimizados (sem unused)

### Segurança
- [ ] Sem dados sensíveis expostos
- [ ] Inputs sanitizados
- [ ] Sem dangerouslySetInnerHTML desnecessário

## Formato de Feedback

### 🔴 CRÍTICO (Bloqueia)
Problemas que DEVEM ser corrigidos:
- Bugs de lógica
- Violações de segurança
- Erros de TypeScript
- Vazamento de memória

### 🟡 SUGESTÃO (Melhoria)
Melhorias recomendadas:
- Performance
- Legibilidade
- Padrões do projeto

### 🟢 BOM (Reconhecimento)
Práticas bem implementadas:
- Código limpo
- Bons patterns
- Documentação clara

## Output

Ao finalizar, apresentar:

```markdown
# Code Review: [Escopo]

## Resumo
[1-2 frases]

## 🔴 Críticos
[Lista ou "Nenhum"]

## 🟡 Sugestões
[Lista de melhorias]

## 🟢 Pontos Positivos
[O que foi bem feito]

## Veredicto
- [ ] ✅ Aprovado
- [ ] ⚠️ Aprovado com ressalvas
- [ ] ❌ Requer mudanças
```
