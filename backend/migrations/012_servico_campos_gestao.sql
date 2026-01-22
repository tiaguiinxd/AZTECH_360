-- Migration 012: Adiciona campos de gestão ao modelo Servico
-- ADR-009: Campos para priorização e acompanhamento de serviços

-- Adicionar novos campos à tabela servicos
ALTER TABLE servicos
ADD COLUMN IF NOT EXISTS prioridade INTEGER NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS prazo_rigido BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS percentual_conclusao INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS proximo_marco VARCHAR(200),
ADD COLUMN IF NOT EXISTS dias_ate_prazo INTEGER;

-- Comentários para documentação
COMMENT ON COLUMN servicos.prioridade IS 'Prioridade do serviço: 1=Crítica, 2=Alta, 3=Média, 4=Baixa, 5=Muito Baixa';
COMMENT ON COLUMN servicos.prazo_rigido IS 'Indica se o prazo é inflexível (multas contratuais, etc)';
COMMENT ON COLUMN servicos.percentual_conclusao IS 'Percentual de conclusão do serviço (0-100)';
COMMENT ON COLUMN servicos.proximo_marco IS 'Descrição do próximo marco/entregável importante';
COMMENT ON COLUMN servicos.dias_ate_prazo IS 'Dias até o prazo final (calculado: data_fim_prevista - hoje)';

-- Atualizar serviços em andamento com valores inteligentes baseados em status
-- Serviços em execução com prazo próximo recebem prioridade alta
UPDATE servicos
SET prioridade = CASE
    WHEN status IN ('em_andamento', 'execucao') AND data_fim_prevista IS NOT NULL
        AND (data_fim_prevista - CURRENT_DATE) <= 30 THEN 2  -- Alta
    WHEN status IN ('em_andamento', 'execucao') THEN 3       -- Média
    WHEN status = 'planejado' THEN 4                          -- Baixa
    ELSE 3                                                     -- Padrão: Média
END
WHERE prioridade = 3;  -- Apenas se ainda estiver no valor default

-- Marcar serviços com prazos próximos (<15 dias) como prazo rígido
UPDATE servicos
SET prazo_rigido = TRUE
WHERE data_fim_prevista IS NOT NULL
  AND (data_fim_prevista - CURRENT_DATE) <= 15
  AND status IN ('em_andamento', 'execucao');

-- Atribuir percentual de conclusão baseado no status
UPDATE servicos
SET percentual_conclusao = CASE
    WHEN status = 'concluido' THEN 100
    WHEN status IN ('em_andamento', 'execucao') THEN 50
    WHEN status = 'planejado' THEN 0
    ELSE 0
END
WHERE percentual_conclusao = 0;  -- Apenas se ainda estiver no valor default
