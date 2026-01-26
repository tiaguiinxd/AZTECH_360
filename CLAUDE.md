# Sistema AZ TECH - Instruções para Claude Code

> **REGRA FUNDAMENTAL:** Sempre consultar o **código-fonte** e a **API** como fonte da verdade.
> Nunca confiar em dados estáticos em arquivos .md - eles podem estar desatualizados.

---

## WORKFLOW OBRIGATÓRIO

**ANTES de qualquer implementação, siga estas fases:**

### FASE 1: CONTEXTUALIZAÇÃO
```
[ ] Consultar .claude/SYSTEM_MAP.md (mapa de dependências)
[ ] Consultar .claude/LEARNINGS.md (bugs conhecidos e padrões)
[ ] Verificar API: http://localhost:8000/docs
[ ] Verificar types em src/types/
```

### FASE 2: ENTENDIMENTO
```
[ ] Ler código relacionado ANTES de modificar
[ ] Usar Task + Explore agent para mapear codebase
[ ] Verificar backend/app/models/ para estrutura de dados
[ ] Verificar backend/app/routers/ para endpoints
```

### FASE 3: PLANEJAMENTO
```
[ ] Criar TodoWrite com tarefas granulares
[ ] Identificar arquivos que serão modificados
[ ] Para tarefas complexas: EnterPlanMode
```

### FASE 4: EXECUÇÃO
```
[ ] Uma tarefa por vez (marcar in_progress/completed)
[ ] Mudanças incrementais
[ ] Rodar npm run type-check após mudanças
```

### FASE 5: VERIFICAÇÃO
```
[ ] TypeScript sem erros
[ ] Funcionalidade testada
[ ] Atualizar LEARNINGS.md se aprendeu algo novo
```

---

## FONTE DA VERDADE

| O que preciso saber? | Onde consultar? |
|---------------------|-----------------|
| Estrutura de dados | `backend/app/models/` |
| Endpoints da API | `backend/app/routers/` ou `/docs` |
| Tipos TypeScript | `src/types/` |
| Stores e estado | `src/stores/` |
| Dependências entre módulos | `.claude/SYSTEM_MAP.md` |
| Bugs e padrões conhecidos | `.claude/LEARNINGS.md` |

**NUNCA confiar em:**
- Arquivos .md com dados estáticos (hierarquias, listas, etc.)
- Comentários antigos no código
- Dados hardcoded em arquivos .ts

---

## DECISÕES ARQUITETURAIS (ADRs)

### ADR-004: Fonte Única de Verdade
**PostgreSQL/API é a ÚNICA fonte de dados.**
- Frontend carrega dados da API, nunca hardcoda
- Stores Zustand: `partialize` persiste apenas UI state, não dados de negócio

### ADR-006: Gestão de Colaboradores
**Criação de colaboradores apenas em Configurações.**
- Organograma: visualização e edição
- Configuracoes: criação, edição e exclusão (CRUD completo)

---

## SLASH COMMANDS

| Comando | Uso |
|---------|-----|
| `/fix-bug [descrição]` | Investigar e corrigir bug |
| `/new-feature [descrição]` | Implementar nova funcionalidade |
| `/review [caminho]` | Revisar código para qualidade |
| `/status` | Verificar status do projeto |
| `/health-check [área]` | Diagnóstico completo do sistema |
| `/learn [aprendizado]` | Registrar aprendizado |

---

## REGRAS CRÍTICAS

### SEMPRE fazer:
- Consultar código-fonte como fonte da verdade
- Usar TodoWrite para rastrear progresso
- Type-check antes de considerar tarefa concluída
- Registrar aprendizados em `.claude/LEARNINGS.md`

### NUNCA fazer:
- Confiar em arquivos .md para dados atuais
- Hardcodar dados no frontend
- Implementar sem entender o código existente
- Deixar tarefas in_progress sem resolver

---

## ESTRUTURA RESUMIDA

```
aztech-sistema-completo/
├── .claude/
│   ├── SYSTEM_MAP.md      # Mapa de dependências
│   ├── LEARNINGS.md       # Memória persistente
│   ├── agents/            # Subagents especializados
│   └── commands/          # Slash commands
├── src/
│   ├── features/          # Módulos por domínio
│   ├── stores/            # Zustand stores
│   ├── services/          # API client
│   └── types/             # TypeScript types
├── backend/
│   └── app/
│       ├── models/        # SQLAlchemy models
│       ├── routers/       # API endpoints
│       └── schemas/       # Pydantic schemas
└── docs/                  # Documentação
```

---

## COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev              # Frontend dev server
npm run type-check       # Verificar TypeScript
docker-compose up -d     # Subir backend + DB
```

---

*Sistema AZ TECH - Janeiro/2026*
