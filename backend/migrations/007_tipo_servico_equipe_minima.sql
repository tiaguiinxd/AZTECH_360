-- Migration: Adicionar campo equipe_minima aos tipos de serviço
-- Permite configurar a equipe mínima necessária para cada tipo de serviço
-- Usado para calcular previsão de contratações no dashboard

-- Adicionar coluna JSONB para equipe mínima
ALTER TABLE tipos_servico
ADD COLUMN IF NOT EXISTS equipe_minima JSONB NOT NULL DEFAULT '{}';

-- Comentário de documentação
COMMENT ON COLUMN tipos_servico.equipe_minima IS
'Equipe mínima necessária para este tipo de serviço. Formato: {"comercial": 1, "suprimentos": 1, "engenheiro": 2, "planejamento": 1, "execucao": 3, "assistente": 1}';

-- Exemplos de seed para tipos existentes (ajustar conforme necessidade)
-- UPDATE tipos_servico SET equipe_minima = '{"comercial": 1, "suprimentos": 1, "engenheiro": 2, "planejamento": 1, "execucao": 3, "assistente": 1}'
-- WHERE codigo = 'TUB_GLP';
