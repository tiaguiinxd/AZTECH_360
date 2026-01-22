-- Migration: Adicionar flag nao_mensurar_capacidade aos cargos
-- Permite marcar cargos que participam de projetos mas não devem ser contados na capacidade
-- Ex: Diretores e Gerentes que apenas supervisionam

-- Adicionar coluna
ALTER TABLE cargos
ADD COLUMN IF NOT EXISTS nao_mensurar_capacidade BOOLEAN NOT NULL DEFAULT FALSE;

-- Marcar Diretores e Gerentes como não mensurados (apenas supervisão)
UPDATE cargos SET nao_mensurar_capacidade = TRUE
WHERE nome ILIKE '%diretor%' OR nome ILIKE '%gerente%';

-- Comentário de documentação
COMMENT ON COLUMN cargos.nao_mensurar_capacidade IS
'Indica se o cargo não deve ser mensurado no cálculo de capacidade do dashboard. True = participa de projetos mas não conta na capacidade (ex: supervisores, gerentes).';
