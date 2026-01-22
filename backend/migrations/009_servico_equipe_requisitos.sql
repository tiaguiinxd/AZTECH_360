-- Migração: Tabelas de requisitos e atribuições de equipe por serviço
-- Data: 2026-01-19
-- Descrição: Permite definir equipe mínima por projeto individual e rastrear alocações

-- ============ 1. TABELA: REQUISITOS DE EQUIPE (O QUE O PROJETO PRECISA) ============
CREATE TABLE IF NOT EXISTS servico_requisitos_equipe (
    id SERIAL PRIMARY KEY,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    cargo_id INTEGER NOT NULL REFERENCES cargos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    obrigatorio BOOLEAN NOT NULL DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Evita duplicar cargo no mesmo serviço
    UNIQUE(servico_id, cargo_id)
);

COMMENT ON TABLE servico_requisitos_equipe IS
'Define a equipe mínima necessária para cada serviço/projeto. A engenharia define os requisitos.';

COMMENT ON COLUMN servico_requisitos_equipe.quantidade IS
'Quantidade de profissionais deste cargo necessários para o projeto';

COMMENT ON COLUMN servico_requisitos_equipe.obrigatorio IS
'Se true, o projeto não pode iniciar sem este recurso alocado';

-- ============ 2. TABELA: EQUIPE ATRIBUÍDA (QUEM ESTÁ ALOCADO) ============
CREATE TABLE IF NOT EXISTS servico_equipe_atribuida (
    id SERIAL PRIMARY KEY,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
    cargo_id INTEGER NOT NULL REFERENCES cargos(id) ON DELETE RESTRICT,
    data_inicio DATE,
    data_fim DATE,
    percentual_alocacao INTEGER NOT NULL DEFAULT 100 CHECK (percentual_alocacao BETWEEN 1 AND 100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Evita alocar mesma pessoa 2x no mesmo serviço com mesmo cargo
    UNIQUE(servico_id, colaborador_id, cargo_id)
);

COMMENT ON TABLE servico_equipe_atribuida IS
'Registra os colaboradores efetivamente alocados em cada serviço/projeto';

COMMENT ON COLUMN servico_equipe_atribuida.percentual_alocacao IS
'% do tempo do colaborador dedicado a este projeto (permite alocação parcial)';

COMMENT ON COLUMN servico_equipe_atribuida.ativo IS
'Se false, colaborador foi desalocado mas histórico preservado';

-- ============ 3. ÍNDICES PARA PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_servico_requisitos_servico ON servico_requisitos_equipe(servico_id);
CREATE INDEX IF NOT EXISTS idx_servico_requisitos_cargo ON servico_requisitos_equipe(cargo_id);
CREATE INDEX IF NOT EXISTS idx_servico_atribuida_servico ON servico_equipe_atribuida(servico_id);
CREATE INDEX IF NOT EXISTS idx_servico_atribuida_colaborador ON servico_equipe_atribuida(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_servico_atribuida_cargo ON servico_equipe_atribuida(cargo_id);
CREATE INDEX IF NOT EXISTS idx_servico_atribuida_ativo ON servico_equipe_atribuida(ativo) WHERE ativo = true;

-- ============ 4. VIEW: RESUMO DE CAPACIDADE VS DEMANDA ============
CREATE OR REPLACE VIEW vw_capacidade_demanda AS
SELECT
    c.id AS cargo_id,
    c.codigo AS cargo_codigo,
    c.nome AS cargo_nome,
    c.capacidade_projetos,
    c.nao_mensurar_capacidade,
    -- Total de colaboradores com este cargo
    COALESCE(col_count.total, 0) AS total_colaboradores,
    -- Capacidade total (colaboradores * capacidade_projetos)
    CASE
        WHEN c.nao_mensurar_capacidade THEN 0
        ELSE COALESCE(col_count.total, 0) * c.capacidade_projetos
    END AS capacidade_total,
    -- Demanda total (soma de requisitos de projetos ativos)
    COALESCE(req.demanda, 0) AS demanda_total,
    -- Déficit (negativo = falta gente)
    CASE
        WHEN c.nao_mensurar_capacidade THEN 0
        ELSE (COALESCE(col_count.total, 0) * c.capacidade_projetos) - COALESCE(req.demanda, 0)
    END AS deficit
FROM cargos c
LEFT JOIN (
    SELECT cargo_id, COUNT(*) AS total
    FROM colaboradores
    WHERE cargo_id IS NOT NULL
    GROUP BY cargo_id
) col_count ON col_count.cargo_id = c.id
LEFT JOIN (
    SELECT re.cargo_id, SUM(re.quantidade) AS demanda
    FROM servico_requisitos_equipe re
    JOIN servicos s ON s.id = re.servico_id
    WHERE s.status IN ('planejado', 'em_andamento')
    GROUP BY re.cargo_id
) req ON req.cargo_id = c.id
WHERE c.funcoes_servico IS NOT NULL AND array_length(c.funcoes_servico, 1) > 0
ORDER BY c.ordem;

COMMENT ON VIEW vw_capacidade_demanda IS
'Resumo de capacidade vs demanda por cargo para o dashboard';
