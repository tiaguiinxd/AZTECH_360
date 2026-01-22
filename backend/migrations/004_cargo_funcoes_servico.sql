-- Migration: 004_cargo_funcoes_servico
-- Descrição: Adicionar campo de funções permitidas nos serviços para cada cargo
-- Data: 2026-01-18

-- Campo JSON para armazenar as funções que o cargo pode exercer em serviços
-- Valores possíveis: comercial, suprimentos, engenheiro, planejamento, execucao, assistente
ALTER TABLE cargos
ADD COLUMN IF NOT EXISTS funcoes_servico TEXT[] DEFAULT '{}';

-- Comentário explicativo
COMMENT ON COLUMN cargos.funcoes_servico IS 'Funções que este cargo pode exercer em serviços: comercial, suprimentos, engenheiro, planejamento, execucao, assistente';

-- Index para busca por função (caso necessário)
CREATE INDEX IF NOT EXISTS idx_cargos_funcoes_servico ON cargos USING GIN (funcoes_servico);
