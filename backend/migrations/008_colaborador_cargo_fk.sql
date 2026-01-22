-- Migração: Adicionar cargo_id FK em colaboradores
-- Data: 2026-01-19
-- Descrição: Adiciona foreign key de cargo_id para normalizar relacionamento

-- ============ 1. ADICIONAR COLUNA cargo_id ============
ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS cargo_id INTEGER REFERENCES cargos(id);

-- ============ 2. MIGRAR DADOS EXISTENTES ============
-- Preencher cargo_id baseado no nome do cargo (string)
UPDATE colaboradores c
SET cargo_id = cg.id
FROM cargos cg
WHERE c.cargo = cg.nome AND c.cargo_id IS NULL;

-- ============ 3. CRIAR ÍNDICE ============
CREATE INDEX IF NOT EXISTS idx_colaboradores_cargo_id ON colaboradores(cargo_id);

-- ============ 4. COMENTÁRIO ============
COMMENT ON COLUMN colaboradores.cargo_id IS
'FK para tabela cargos. Substitui o campo cargo (string) para garantir integridade referencial.';
