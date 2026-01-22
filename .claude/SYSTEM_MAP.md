# AZ TECH - Mapa do Sistema

> **IMPORTANTE:** Este documento deve ser consultado ANTES de qualquer implementacao.
> Garante consistencia entre frontend, backend e banco de dados.

---

## Checklist Pre-Implementacao

Antes de qualquer mudanca, verificar:

- [ ] Qual modulo sera afetado?
- [ ] Quais stores precisam ser atualizados?
- [ ] Quais entidades estao envolvidas?
- [ ] Existe endpoint no backend?
- [ ] Os routers estao registrados no main.py?
- [ ] Os types TypeScript estao atualizados?
- [ ] A mudanca afeta outros modulos?

---

## Matriz de Dependencias

| Modulo | Depende De |
|--------|------------|
| **Planejamento** | Nenhuma (entidade independente) |
| **Fluxo** | Colaborador |
| **Dashboard** | Colaborador (futuro) |
| **Organograma** | Colaborador, Setor, Nivel, Cargo |
| **Configuracoes** | Todas as entidades base |

---

## Entidades e Localizacao

| Entidade | Store Frontend | Backend Router | Model SQLAlchemy |
|----------|----------------|----------------|------------------|
| Colaborador | organoStore | colaboradores | Colaborador |
| Setor | configStore | setores | Setor |
| Subsetor | configStore | setores | Subsetor |
| Nivel | configStore | niveis | NivelHierarquico |
| Subnivel | configStore | niveis | Subnivel |
| Cargo | configStore | cargos | Cargo |
| Projeto (Planejamento) | planejamentoStore | projetos-planejamento | ProjetoPlanejamento |

---

## Estrutura de Arquivos por Camada

### Backend (FastAPI)

```
backend/app/
├── models/           <- SQLAlchemy models (tabelas)
│   ├── __init__.py   <- TODOS os models devem ser exportados aqui
│   ├── colaborador.py
│   ├── empresa.py
│   └── ...
├── schemas/          <- Pydantic schemas (validacao)
│   ├── __init__.py   <- TODOS os schemas devem ser exportados aqui
│   ├── servicos.py   <- Schemas de empresas, clientes, etc.
│   └── ...
├── routers/          <- Endpoints API
│   ├── __init__.py   <- TODOS os routers devem ser exportados aqui
│   ├── empresas.py
│   └── ...
└── main.py           <- TODOS os routers devem ser registrados aqui
```

### Frontend (React)

```
src/
├── stores/           <- Zustand stores
│   ├── organoStore.ts        <- Colaboradores, filtros organograma
│   ├── configStore.ts        <- Niveis, Setores, Cargos
│   └── planejamentoStore.ts  <- Projetos de planejamento
├── types/            <- TypeScript types
│   ├── index.ts              <- Re-exporta todos os types
│   ├── planejamento.ts       <- Types de projetos planejamento
│   └── ...
├── features/         <- Modulos por dominio
│   ├── organograma/
│   ├── planejamento/         <- Gestao de projetos/obras
│   ├── configuracoes/
│   └── fluxo/
└── services/         <- API client
    └── api.ts
```

---

## Regras de Consistencia

### 1. Backend

- Toda entidade deve ter:
  - Model em `models/`
  - Schema em `schemas/`
  - Router em `routers/`
- Todo model deve ser exportado em `models/__init__.py`
- Todo schema deve ser exportado em `schemas/__init__.py`
- Todo router deve ser exportado em `routers/__init__.py`
- Todo router deve ser registrado em `main.py`

### 2. Frontend

- Todo store deve ter `_hasHydrated` para persistencia
- Todo componente deve verificar `hasHydrated` antes de renderizar dados
- Hooks SEMPRE antes de returns (evitar "Rendered more hooks")
- useShallow em selectors Zustand para evitar re-renders

### 3. Integracao

- Nomes de campos: snake_case no backend, camelCase no frontend
- Converter em `services/api.ts` com funcoes `toApi()` e `fromApi()`
- Validar FK antes de deletar (backend deve retornar erro 400)

---

## Fluxo de Cadastro (Ordem Correta)

1. **Configuracoes > Estrutura Organizacional**
   - Niveis Hierarquicos
   - Setores
   - Cargos
   - Colaboradores

2. **Planejamento**
   - Projetos/obras podem ser criados diretamente
   - Campos: codigo, nome, empresa, cliente, categoria, datas, valores, status

---

## Endpoints API Disponiveis

Base URL: `http://localhost:8000/api/v1/`

### Estrutura Organizacional
- `GET/POST /setores/`
- `GET/PUT/DELETE /setores/{id}`
- `GET/POST /niveis/`
- `POST /niveis/{id}/subniveis`
- `GET/POST /colaboradores/`
- `GET/PUT/DELETE /colaboradores/{id}`
- `GET/POST /cargos/`
- `GET/PUT/DELETE /cargos/{id}`

### Planejamento
- `GET/POST /projetos-planejamento/`
- `GET/PUT/DELETE /projetos-planejamento/{id}/`
- `GET /projetos-planejamento/resumo/empresas/`
- `GET /projetos-planejamento/resumo/clientes/`
- `GET /projetos-planejamento/resumo/categorias/`
- `GET /projetos-planejamento/opcoes/empresas/`
- `GET /projetos-planejamento/opcoes/clientes/`
- `GET /projetos-planejamento/opcoes/categorias/`

---

## Troubleshooting Comum

### Erro: "Cannot read properties of undefined"
**Causa:** Store nao hidratou ainda
**Solucao:** Verificar `hasHydrated` antes de acessar dados

### Erro: "Rendered more hooks than during previous render"
**Causa:** Hook chamado apos early return
**Solucao:** Mover TODOS os hooks para antes de qualquer return

### Erro: 404 em endpoints
**Causa 1:** Router nao registrado no main.py
**Causa 2:** Falta trailing slash na URL (usar `/empresas/` nao `/empresas`)
**Solucao:** Verificar main.py e usar trailing slash

### Erro: Import no backend
**Causa:** Model/Schema nao exportado no __init__.py
**Solucao:** Adicionar export no __init__.py correspondente

---

*Ultima atualizacao: Janeiro/2026*
