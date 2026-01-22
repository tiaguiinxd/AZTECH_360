# Sprint 1: Foundation - Resumo de Implementação

**Data**: 20/01/2026
**Status**: ✅ Concluído
**Objetivo**: Adicionar campos de gestão e criar componentes base para priorização de serviços

---

## 🎯 Entregas Realizadas

### Backend

#### 1. Model Servico (`backend/app/models/servico.py`)
Adicionados 5 novos campos para gestão de serviços:

```python
# Campos de gestão (ADR-009)
prioridade = Column(Integer, nullable=False, default=3)  # 1-5 (1=crítica, 5=baixa)
prazo_rigido = Column(Boolean, nullable=False, default=False)
percentual_conclusao = Column(Integer, nullable=False, default=0)  # 0-100
proximo_marco = Column(String(200), nullable=True)
dias_ate_prazo = Column(Integer, nullable=True)  # Calculado
```

#### 2. Migration 012 (`backend/migrations/012_servico_campos_gestao.sql`)
- Criada e executada com sucesso
- Atualização inteligente de 33 serviços existentes:
  - Prioridade baseada em status e prazo
  - Prazo rígido para serviços com deadline <15 dias
  - Percentual baseado em status (planejado=0%, em andamento=50%, concluído=100%)

#### 3. Schemas Pydantic (`backend/app/schemas/servicos.py`)
Atualizados:
- `ServicoBase` - campos com validação Pydantic Field
- `ServicoUpdate` - campos opcionais
- Novos schemas: `ServicoAlocacao`, `ColaboradorAlocacao`

#### 4. Endpoint de Alocação (`backend/app/routers/colaboradores.py`)
Novo endpoint: `GET /colaboradores/{id}/alocacao`

**Resposta**:
```json
{
  "colaborador_id": 1,
  "colaborador_nome": "Samuel Menezes",
  "cargo_nome": "Diretor Operacional",
  "servicos": [
    {
      "id": 63,
      "codigo": "MLN-004",
      "nome": "Manutencao de Lancas 04",
      "status": "planejado",
      "prioridade": 2,
      "percentual_alocacao": 100,
      "data_inicio": "2026-09-01",
      "data_fim": "2026-11-30",
      "cliente_nome": "Vallourec"
    }
  ],
  "total_alocacao": 100,
  "sobrecarga": false
}
```

### Frontend

#### 5. Types TypeScript (`src/types/servicos.ts`)
Interface `Servico` atualizada:
```typescript
// Campos de gestão (ADR-009)
prioridade: number              // 1=Crítica, 2=Alta, 3=Média, 4=Baixa, 5=Muito Baixa
prazoRigido: boolean            // Prazo inflexível (multas contratuais)
percentualConclusao: number     // 0-100
proximoMarco: string | null     // Próximo marco/entregável
diasAtePrazo: number | null     // Dias até o prazo (calculado)
```

Novos tipos:
```typescript
interface ServicoAlocacao {
  id: ID
  codigo: string
  nome: string
  status: StatusServico
  prioridade: number
  percentualAlocacao: number
  dataInicio: string | null
  dataFim: string | null
  clienteNome: string | null
}

interface ColaboradorAlocacao {
  colaboradorId: ID
  colaboradorNome: string
  cargoNome: string | null
  servicos: ServicoAlocacao[]
  totalAlocacao: number
  sobrecarga: boolean
}
```

#### 6. API Converters (`src/services/api.ts`)
- `apiToServico()` - converte campos snake_case → camelCase
- `servicoToApi()` - converte campos camelCase → snake_case
- Novo método: `colaboradoresApi.getAlocacao(id)`

#### 7. Componentes UI

**a) PrioridadeBadge** (`src/components/ui/PrioridadeBadge.tsx`)
Badge colorido para exibir prioridade:
- 1=Crítica (vermelho)
- 2=Alta (laranja)
- 3=Média (amarelo)
- 4=Baixa (azul)
- 5=Muito Baixa (cinza)

Props: `prioridade: number`, `size?: 'sm' | 'md' | 'lg'`

**b) PrazoIndicator** (`src/components/ui/PrazoIndicator.tsx`)
Indicador visual de prazo com cores de urgência:
- Atrasado: vermelho (diasAtePrazo < 0)
- <7 dias: vermelho
- <15 dias: laranja
- <30 dias: amarelo
- >30 dias: cinza

Props: `diasAtePrazo: number | null`, `prazoRigido: boolean`, `size?`

**c) ProgressBar** (`src/components/ui/ProgressBar.tsx`)
Barra de progresso com cores dinâmicas:
- ≥90%: verde (success)
- ≥60%: azul (default)
- ≥30%: amarelo (warning)
- <30%: vermelho (danger)

Props: `percentual: number`, `showLabel?: boolean`, `size?`, `variant?`

#### 8. Hook useUrgencyScore (`src/hooks/useUrgencyScore.ts`)

**Algoritmo de Score de Urgência (0-100)**:
```
Score Final =
  (prioridadeScore × 0.3) +  // 30%
  (prazoScore × 0.4) +       // 40%
  (statusScore × 0.2) +      // 20%
  (conclusaoScore × 0.1)     // 10%
```

**Funções exportadas**:
- `calculateUrgencyScore(servico)` - calcula score individual
- `useUrgencyScore(servicos)` - hook com ordenação e filtros

**Retorno**:
```typescript
{
  servicos: Servico[]          // Com campo urgencyScore
  servicosOrdenados: Servico[] // Ordenados por score (desc)
  servicosUrgentes: Servico[]  // Score ≥ 70
  servicosAtencao: Servico[]   // Score 50-69
  calculateScore: Function
}
```

---

## 📊 Métricas

- **Arquivos criados**: 6
  - 1 migration SQL
  - 3 componentes UI
  - 1 hook
  - 1 schema de documentação

- **Arquivos modificados**: 7
  - 3 backend (model, schemas, router)
  - 3 frontend (types, api, store)
  - 1 init (exports)

- **Linhas de código**: ~500 novas linhas
- **Type-check**: 0 erros
- **Serviços migrados**: 33 serviços com dados inteligentes

---

## ✅ Validações

1. ✅ Backend rodando sem erros
2. ✅ Frontend com HMR funcionando
3. ✅ Type-check passa sem erros
4. ✅ API retorna novos campos corretamente
5. ✅ Endpoint de alocação funcional
6. ✅ Atualização de campos via API testada

**Teste realizado**:
```bash
curl -X PUT http://localhost:8000/api/v1/servicos/63 \
  -H "Content-Type: application/json" \
  -d '{"prioridade": 2, "prazo_rigido": true, "percentual_conclusao": 25, "proximo_marco": "Aprovacao do projeto"}'

# Resultado: ✅ Campos atualizados corretamente
```

---

## 📚 Decisões Arquiteturais (ADRs)

### ADR-009: Campos de Gestão no Model Servico
**Decisão**: Adicionar campos diretamente na tabela `servicos` ao invés de criar tabela normalizada.

**Rationale**:
- Campos são intrínsecos ao serviço
- Acesso frequente (não vale a pena normalizar)
- Simplifica queries e reduces JOINs
- Facilita ordenação e filtros

### ADR-012: Cálculo Client-Side de Urgência
**Decisão**: Calcular score de urgência no frontend ao invés de armazenar no banco.

**Rationale**:
- Score é derivado de múltiplos campos
- Muda dinamicamente (dias_ate_prazo)
- Evita sincronização complexa
- Frontend pode aplicar lógica específica por contexto

---

## 🚀 Próximos Passos

Ver plano completo em: `~/.claude/plans/dynamic-herding-papert.md`

**Sprint 2**: Quick Views (5 dias)
- Filtros por prioridade
- Tabs: Todos | Meus Serviços | Urgentes | Atenção
- Indicadores visuais nos cards
- Endpoint de transição de status

**Sprint 3**: Person Allocation View (5 dias)
- Componente AlocacaoPorPessoa
- Integração com organograma
- Indicadores de sobrecarga
- Drill-down para detalhes

---

## 🔗 Arquivos Relacionados

| Categoria | Arquivo | Descrição |
|-----------|---------|-----------|
| Backend Model | [servico.py](../backend/app/models/servico.py) | Model SQLAlchemy com campos de gestão |
| Backend Schema | [servicos.py](../backend/app/schemas/servicos.py) | Schemas Pydantic |
| Backend Router | [colaboradores.py](../backend/app/routers/colaboradores.py) | Endpoint de alocação |
| Migration | [012_servico_campos_gestao.sql](../backend/migrations/012_servico_campos_gestao.sql) | Adiciona campos ao banco |
| Frontend Types | [servicos.ts](../src/types/servicos.ts) | Interfaces TypeScript |
| Frontend API | [api.ts](../src/services/api.ts) | Converters e client |
| Frontend Store | [servicosStore.ts](../src/stores/servicosStore.ts) | Estado global |
| Component | [PrioridadeBadge.tsx](../src/components/ui/PrioridadeBadge.tsx) | Badge de prioridade |
| Component | [PrazoIndicator.tsx](../src/components/ui/PrazoIndicator.tsx) | Indicador de prazo |
| Component | [ProgressBar.tsx](../src/components/ui/ProgressBar.tsx) | Barra de progresso |
| Hook | [useUrgencyScore.ts](../src/hooks/useUrgencyScore.ts) | Cálculo de urgência |

---

**Implementado por**: Claude Sonnet 4.5
**Revisado**: ✅
**Aprovado para produção**: Pendente testes de usuário
