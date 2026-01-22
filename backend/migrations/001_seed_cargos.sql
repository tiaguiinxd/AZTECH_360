-- Migração: Seed de Cargos
-- Data: 2026-01-18
-- Descrição: Popula a tabela cargos com os cargos existentes dos colaboradores

-- ============ DADOS INICIAIS: CARGOS ============

-- Cargos da Diretoria (nivel_id = 1)
INSERT INTO cargos (id, codigo, nome, descricao, nivel_id, setor_id, ordem) VALUES
(1, 'DIR-OPE', 'Diretor Operacional', 'Responsável pelas operações gerais', 1, 6, 1),
(2, 'DIR-COM', 'Diretor Comercial', 'Responsável pela área comercial', 1, 1, 2),
(3, 'DIR-FIN', 'Diretor Financeiro', 'Responsável pela área financeira', 1, 2, 3),
(4, 'DIR-ADM', 'Diretor Administrativo', 'Responsável pela administração e RH', 1, 3, 4),
(5, 'DIR-ENG', 'Diretor de Engenharia', 'Responsável pela engenharia mecânica', 1, 9, 5),
(6, 'DIR-CIV', 'Diretor de Engenharia Civil', 'Responsável pela engenharia civil', 1, 5, 6)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    nivel_id = EXCLUDED.nivel_id,
    setor_id = EXCLUDED.setor_id,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Cargos da Gerência (nivel_id = 2)
INSERT INTO cargos (id, codigo, nome, descricao, nivel_id, setor_id, ordem) VALUES
(7, 'GER-INO', 'Gerente de Inovação', 'Gerente de P&D e inovação', 2, 7, 1)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    nivel_id = EXCLUDED.nivel_id,
    setor_id = EXCLUDED.setor_id,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Cargos Técnico/Especialista (nivel_id = 4)
INSERT INTO cargos (id, codigo, nome, descricao, nivel_id, setor_id, ordem) VALUES
(8, 'COM-POS', 'Comercial (pós-venda)', 'Atendimento pós-venda', 4, 1, 1),
(9, 'ANA-FIN', 'Analista Financeiro', 'Análise e controle financeiro', 4, 2, 2),
(10, 'TEC-DP', 'Departamento Pessoal', 'Gestão de folha e benefícios', 4, 3, 3),
(11, 'SUP-COM', 'Supervisor de Compras', 'Supervisão de compras e fornecedores', 4, 4, 4),
(12, 'ENG-CIV', 'Engenheiro Civil', 'Projetos e obras civis', 4, 5, 5),
(13, 'ENG-MEC', 'Engenheiro Mecânico', 'Projetos mecânicos e industriais', 4, 9, 6)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    nivel_id = EXCLUDED.nivel_id,
    setor_id = EXCLUDED.setor_id,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Cargos Operacionais (nivel_id = 5)
INSERT INTO cargos (id, codigo, nome, descricao, nivel_id, setor_id, ordem) VALUES
(14, 'ASS-TEC', 'Assistente Técnico', 'Suporte técnico às engenharias', 5, 9, 1),
(15, 'ASS-FIN', 'Assistente Financeiro', 'Suporte às atividades financeiras', 5, 2, 2),
(16, 'ASS-RH', 'Recursos Humanos', 'Suporte às atividades de RH', 5, 3, 3),
(17, 'AUX-COM', 'Auxiliar de Compras', 'Apoio ao setor de compras', 5, 4, 4),
(18, 'ALM-GER', 'Almoxarife', 'Controle de estoque e almoxarifado', 5, 4, 5),
(19, 'SER-LIM', 'Limpeza/Organização', 'Serviços de limpeza', 5, 8, 6),
(20, 'SER-GER', 'Serviços Gerais', 'Serviços gerais de manutenção', 5, 8, 7),
(21, 'EST-MEC', 'Estagiário Eng. Mec.', 'Estágio em engenharia mecânica', 5, 9, 8)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    nivel_id = EXCLUDED.nivel_id,
    setor_id = EXCLUDED.setor_id,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Atualizar sequência
SELECT setval('cargos_id_seq', COALESCE((SELECT MAX(id) FROM cargos), 1));

-- Criar índices (caso não existam)
CREATE INDEX IF NOT EXISTS idx_cargos_nivel ON cargos(nivel_id);
CREATE INDEX IF NOT EXISTS idx_cargos_setor ON cargos(setor_id);
