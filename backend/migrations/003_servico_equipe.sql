-- Migration 003: Adicionar campos de equipe à tabela servicos
-- Data: 2026-01-18
-- Descrição: Permite atribuir 6 membros de equipe para cada serviço

-- Adicionar colunas para equipe do serviço
ALTER TABLE servicos
ADD COLUMN IF NOT EXISTS comercial_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS suprimentos_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS engenheiro_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS planejamento_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS execucao_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assistente_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL;

-- Criar índices para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_servicos_comercial ON servicos(comercial_id);
CREATE INDEX IF NOT EXISTS idx_servicos_suprimentos ON servicos(suprimentos_id);
CREATE INDEX IF NOT EXISTS idx_servicos_engenheiro ON servicos(engenheiro_id);
CREATE INDEX IF NOT EXISTS idx_servicos_planejamento ON servicos(planejamento_id);
CREATE INDEX IF NOT EXISTS idx_servicos_execucao ON servicos(execucao_id);
CREATE INDEX IF NOT EXISTS idx_servicos_assistente ON servicos(assistente_id);

-- Comentários para documentação
COMMENT ON COLUMN servicos.comercial_id IS 'Colaborador responsável pela área comercial (pós-venda)';
COMMENT ON COLUMN servicos.suprimentos_id IS 'Colaborador responsável pela área de suprimentos (comprador)';
COMMENT ON COLUMN servicos.engenheiro_id IS 'Engenheiro responsável geral pelo serviço';
COMMENT ON COLUMN servicos.planejamento_id IS 'Colaborador responsável pelo planejamento do serviço';
COMMENT ON COLUMN servicos.execucao_id IS 'Colaborador responsável pela execução do serviço';
COMMENT ON COLUMN servicos.assistente_id IS 'Assistente do serviço';
