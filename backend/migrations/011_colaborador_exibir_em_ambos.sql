-- Migration: Adicionar campo 'exibir_em_ambos' aos colaboradores
-- Permite que colaboradores (ex: engenheiros) apareçam em ambos organogramas

-- 1. Adicionar coluna
ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS exibir_em_ambos BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Criar índice para otimizar filtros
CREATE INDEX IF NOT EXISTS idx_colaboradores_exibir_em_ambos
ON colaboradores(exibir_em_ambos) WHERE exibir_em_ambos = TRUE;

-- 3. Comentário explicativo
COMMENT ON COLUMN colaboradores.exibir_em_ambos IS
'Se true, colaborador aparece em ambos organogramas (administrativo E operacional). Útil para engenheiros e outros cargos mistos.';
