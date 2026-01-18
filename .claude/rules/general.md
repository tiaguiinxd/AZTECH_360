---
paths:
  - "**/*"
---

# Regras Gerais - Sistema AZ TECH

## Idioma
- Código: inglês (variáveis, funções, tipos)
- Comentários: português quando necessário
- Commits: português (formato convencional)
- Documentação: português

## Workflow Obrigatório

### Antes de Começar
1. Ler CLAUDE.md para contexto
2. Verificar TodoWrite pendente
3. Entender o que foi pedido

### Durante Desenvolvimento
1. Usar TodoWrite para rastrear tarefas
2. Marcar como in_progress antes de começar
3. Marcar como completed ao terminar

### Antes de Finalizar
1. Rodar `npm run type-check`
2. Verificar se há erros no console
3. Testar visualmente se possível

## Decisões Arquiteturais (ADRs)

### ADR-004: Fonte Única de Verdade
**PostgreSQL/API é a ÚNICA fonte de dados.**
- Frontend não tem dados hardcoded
- Stores Zustand só persistem UI state

### ADR-005: Posicionamento por Nível
**Organograma posiciona por `nivel_id`, não por profundidade.**
- Diretoria (nivel=1) no topo
- Operacional (nivel=5) na base

## O Que SEMPRE Fazer
- Consultar código-fonte como fonte da verdade
- Usar TodoWrite para rastrear progresso
- Type-check antes de considerar tarefa concluída
- Carregar dados da API, nunca hardcodar

## O Que NUNCA Fazer
- Confiar em arquivos .md para dados atuais
- Hardcodar dados no frontend
- Pular validação de tipos
- Implementar sem entender o existente
- Deixar tarefas in_progress sem resolver
