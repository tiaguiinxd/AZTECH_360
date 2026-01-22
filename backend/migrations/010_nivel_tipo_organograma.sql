-- Migration: Adicionar campo 'tipo' aos níveis hierárquicos
-- Permite separar organograma em Administrativo (matriz) e Operacional (campo)

-- 1. Adicionar coluna tipo
ALTER TABLE niveis_hierarquicos
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'administrativo';

-- 2. Atualizar níveis existentes
-- Níveis 0-4 (Diretoria até Operacional/Assistentes) são administrativos
UPDATE niveis_hierarquicos SET tipo = 'administrativo' WHERE nivel <= 4;

-- Níveis 5+ (Execução Campo, Encarregados) são operacionais
UPDATE niveis_hierarquicos SET tipo = 'operacional' WHERE nivel >= 5;

-- 3. Criar índice para filtro por tipo
CREATE INDEX IF NOT EXISTS idx_niveis_tipo ON niveis_hierarquicos(tipo);

-- 4. Adicionar comentário
COMMENT ON COLUMN niveis_hierarquicos.tipo IS
'Tipo do organograma: administrativo (matriz) ou operacional (campo)';
