---
allowed-tools: Read, Glob, Bash
description: Ver status do projeto AZ TECH - versão, features, issues
model: haiku
---

# /status - Status do Projeto

## Informações do Sistema

- **Data:** !`date +%Y-%m-%d 2>/dev/null || echo %date%`
- **Branch:** !`git branch --show-current 2>/dev/null || echo "N/A"`
- **Último commit:** !`git log -1 --oneline 2>/dev/null || echo "Sem commits"`

## Verificações Rápidas

### Docker
!`docker-compose ps 2>/dev/null | head -10 || echo "Docker não disponível"`

### TypeScript
!`cd . && npx tsc --noEmit 2>&1 | tail -5 || echo "Verificação não executada"`

## Tarefas

Ler e apresentar:
1. **docs/CHANGELOG.md** - Versão atual e últimas mudanças
2. **docs/FEATURES_COMPLETED.md** - Features implementadas
3. **docs/KNOWN_ISSUES.md** - Problemas conhecidos

## Output Esperado

```markdown
# Status: Sistema AZ TECH

**Versão:** X.Y.Z
**Ambiente:** Desenvolvimento
**Backend:** [Online/Offline]
**Frontend:** [Online/Offline]

## Features por Módulo
| Módulo | Status | Features |
|--------|--------|----------|
| Organograma | 🟡 | X/Y |
| Projetos | 🔴 | X/Y |
| Dashboard | 🔴 | X/Y |
| Configurações | 🟡 | X/Y |

## Issues Conhecidos
| Severidade | Qtd |
|------------|-----|
| 🔴 Crítico | X |
| 🟡 Médio | X |
| 🟢 Baixo | X |

## Próximos Passos
[Baseado no status atual]
```
