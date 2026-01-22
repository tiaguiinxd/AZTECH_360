-- Migration: Adicionar capacidade_projetos aos cargos
-- Define quantos projetos simultâneos uma pessoa com o cargo pode assumir

-- Adicionar coluna com valor padrão
ALTER TABLE cargos
ADD COLUMN IF NOT EXISTS capacidade_projetos INTEGER NOT NULL DEFAULT 3;

-- Atualizar capacidades baseado no nível do cargo (sugestões iniciais)
-- Cargos de nível mais alto geralmente têm menos projetos simultâneos (gestão)
-- Cargos de nível operacional podem ter mais projetos (execução)

-- Diretores e Gerentes: 2 projetos (mais foco em gestão)
UPDATE cargos SET capacidade_projetos = 2
WHERE nome ILIKE '%diretor%' OR nome ILIKE '%gerente%';

-- Coordenadores: 3 projetos
UPDATE cargos SET capacidade_projetos = 3
WHERE nome ILIKE '%coordenador%';

-- Engenheiros e Analistas Sênior: 4 projetos
UPDATE cargos SET capacidade_projetos = 4
WHERE (nome ILIKE '%engenheiro%' OR nome ILIKE '%analista%')
  AND (nome ILIKE '%sr%' OR nome ILIKE '%sênior%' OR nome ILIKE '%senior%');

-- Engenheiros e Analistas Pleno: 5 projetos
UPDATE cargos SET capacidade_projetos = 5
WHERE (nome ILIKE '%engenheiro%' OR nome ILIKE '%analista%')
  AND (nome ILIKE '%pl%' OR nome ILIKE '%pleno%');

-- Técnicos e Assistentes: 6 projetos (tarefas mais operacionais)
UPDATE cargos SET capacidade_projetos = 6
WHERE nome ILIKE '%técnico%' OR nome ILIKE '%tecnico%'
   OR nome ILIKE '%assistente%' OR nome ILIKE '%auxiliar%';

-- Comentário de documentação
COMMENT ON COLUMN cargos.capacidade_projetos IS
'Número máximo de projetos simultâneos que uma pessoa com este cargo pode assumir. Usado para cálculo de capacidade no dashboard.';
