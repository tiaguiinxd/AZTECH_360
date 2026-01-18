-- Script de inicialização do banco de dados AZ TECH
-- Executado automaticamente pelo Docker na primeira vez
-- Atualizado em: 2026-01-17

-- ============ CRIAR TABELAS ============

-- Setores
CREATE TABLE IF NOT EXISTS setores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL DEFAULT '',
    nome VARCHAR(100) NOT NULL,
    nome_completo VARCHAR(200),
    cor VARCHAR(20) NOT NULL DEFAULT '#D3D3D3',
    cor_texto VARCHAR(20) NOT NULL DEFAULT '#1e293b',
    icone VARCHAR(50),
    diretor_id INTEGER,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subsetores
CREATE TABLE IF NOT EXISTS subsetores (
    id SERIAL PRIMARY KEY,
    setor_id INTEGER NOT NULL REFERENCES setores(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(20),
    cor_texto VARCHAR(20) DEFAULT '#1e293b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Níveis Hierárquicos
CREATE TABLE IF NOT EXISTS niveis_hierarquicos (
    id SERIAL PRIMARY KEY,
    nivel INTEGER NOT NULL DEFAULT 0,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    cor VARCHAR(20) NOT NULL DEFAULT '#6B7280',
    cor_texto VARCHAR(20) NOT NULL DEFAULT '#ffffff',
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subníveis
CREATE TABLE IF NOT EXISTS subniveis (
    id SERIAL PRIMARY KEY,
    nivel_id INTEGER NOT NULL REFERENCES niveis_hierarquicos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10),
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cargo VARCHAR(200) NOT NULL,
    setor_id INTEGER NOT NULL REFERENCES setores(id),
    subsetor_id INTEGER REFERENCES subsetores(id),
    nivel_id INTEGER NOT NULL REFERENCES niveis_hierarquicos(id),
    subnivel_id INTEGER REFERENCES subniveis(id),
    superior_id INTEGER REFERENCES colaboradores(id),
    permissoes JSONB DEFAULT '[]',
    foto_url VARCHAR(500),
    email VARCHAR(200),
    telefone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ DADOS INICIAIS: SETORES ============

INSERT INTO setores (id, codigo, nome, nome_completo, cor, cor_texto, diretor_id, ordem) VALUES
(1, '1', 'Comercial', 'Departamento Comercial', '#C6EFCE', '#1e293b', 2, 1),
(2, '2', 'Financeiro', 'Departamento Financeiro', '#B4C6E7', '#1e293b', 3, 2),
(3, '3', 'RH/DP', 'Recursos Humanos e Departamento Pessoal', '#FFF2CC', '#1e293b', 4, 3),
(4, '3', 'Suprimentos', 'Departamento de Suprimentos', '#FCE4D6', '#1e293b', 3, 4),
(5, '4', 'Engenharia Civil', 'Departamento de Engenharia Civil', '#87CEEB', '#1e293b', 7, 5),
(6, 'X', 'Staff', 'Staff Diretivo', '#D3D3D3', '#1e293b', 1, 6),
(7, 'X', 'P&D/Integração', 'Pesquisa, Desenvolvimento e Integração', '#FFCC99', '#1e293b', 3, 7),
(8, '5', 'Manutenção', 'Departamento de Manutenção', '#FFFF99', '#1e293b', 3, 8),
(9, '6', 'Engenharia Mecânica', 'Departamento de Engenharia Mecânica', '#E5E7EB', '#1e293b', 5, 9)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    nome_completo = EXCLUDED.nome_completo,
    cor = EXCLUDED.cor,
    cor_texto = EXCLUDED.cor_texto,
    diretor_id = EXCLUDED.diretor_id,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: SUBSETORES ============

INSERT INTO subsetores (id, setor_id, nome, cor, cor_texto) VALUES
(1, 5, 'Civil', '#87CEEB', '#1e293b'),
(2, 9, 'Mecânica', '#E5E7EB', '#1e293b')
ON CONFLICT (id) DO UPDATE SET
    setor_id = EXCLUDED.setor_id,
    nome = EXCLUDED.nome,
    cor = EXCLUDED.cor,
    cor_texto = EXCLUDED.cor_texto,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: NÍVEIS HIERÁRQUICOS ============

INSERT INTO niveis_hierarquicos (id, nivel, nome, descricao, cor, cor_texto, ordem) VALUES
(1, 0, 'Diretoria', 'Diretores e C-Level - decisões estratégicas', '#1e3a5f', '#ffffff', 1),
(2, 1, 'Gerência', 'Gerentes de área - gestão de departamentos', '#2563eb', '#ffffff', 2),
(3, 2, 'Coordenação', 'Coordenadores e líderes de equipe', '#059669', '#ffffff', 3),
(4, 3, 'Técnico/Especialista', 'Engenheiros, analistas e especialistas técnicos', '#ca8a04', '#000000', 4),
(5, 4, 'Operacional', 'Assistentes, auxiliares e apoio', '#6b7280', '#ffffff', 5)
ON CONFLICT (id) DO UPDATE SET
    nivel = EXCLUDED.nivel,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    cor = EXCLUDED.cor,
    cor_texto = EXCLUDED.cor_texto,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: SUBNÍVEIS ============

-- Subníveis para Técnico/Especialista (nivel_id = 4)
INSERT INTO subniveis (id, nivel_id, nome, abreviacao, ordem) VALUES
(1, 4, 'Sênior', 'Sr', 1),
(2, 4, 'Pleno', 'Pl', 2),
(3, 4, 'Júnior', 'Jr', 3)
ON CONFLICT (id) DO UPDATE SET
    nivel_id = EXCLUDED.nivel_id,
    nome = EXCLUDED.nome,
    abreviacao = EXCLUDED.abreviacao,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Subníveis para Operacional (nivel_id = 5) - IDs diferentes para não conflitar
INSERT INTO subniveis (id, nivel_id, nome, abreviacao, ordem) VALUES
(4, 5, 'II', 'II', 1),
(5, 5, 'I', 'I', 2),
(6, 5, 'Auxiliar', 'Aux', 3)
ON CONFLICT (id) DO UPDATE SET
    nivel_id = EXCLUDED.nivel_id,
    nome = EXCLUDED.nome,
    abreviacao = EXCLUDED.abreviacao,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: COLABORADORES ============

-- DIRETORIA (Nível 1) - 6 pessoas
INSERT INTO colaboradores (id, nome, cargo, setor_id, nivel_id, superior_id, permissoes) VALUES
(1, 'Samuel Menezes', 'Diretor Operacional', 6, 1, NULL, '["gerente_projeto"]'),
(2, 'Lázaro Alano', 'Diretor Comercial', 1, 1, NULL, '["gerente_projeto"]'),
(3, 'Marcos Andrei', 'Diretor Financeiro', 2, 1, NULL, '["gerente_projeto"]'),
(4, 'Paulo Henrique', 'Diretor Administrativo', 3, 1, NULL, '["coordenador"]'),
(5, 'Thiago Alencar', 'Diretor de Engenharia', 9, 1, NULL, '["coordenador", "engenheiro_responsavel"]'),
(7, 'Ederson', 'Diretor de Engenharia Civil', 5, 1, NULL, '["coordenador"]')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    setor_id = EXCLUDED.setor_id,
    nivel_id = EXCLUDED.nivel_id,
    superior_id = EXCLUDED.superior_id,
    permissoes = EXCLUDED.permissoes,
    updated_at = CURRENT_TIMESTAMP;

-- GERÊNCIA (Nível 2) - 1 pessoa
INSERT INTO colaboradores (id, nome, cargo, setor_id, nivel_id, superior_id, permissoes) VALUES
(6, 'Tiago Costa', 'Gerente de Inovação', 7, 2, 3, '["coordenador"]')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    setor_id = EXCLUDED.setor_id,
    nivel_id = EXCLUDED.nivel_id,
    superior_id = EXCLUDED.superior_id,
    permissoes = EXCLUDED.permissoes,
    updated_at = CURRENT_TIMESTAMP;

-- TÉCNICO/ESPECIALISTA (Nível 4)
INSERT INTO colaboradores (id, nome, cargo, setor_id, subsetor_id, nivel_id, subnivel_id, superior_id, permissoes) VALUES
(8, 'Abner', 'Comercial (pós-venda)', 1, NULL, 4, NULL, 2, '["analista"]'),
(9, 'Gil', 'Comercial (pós-venda)', 1, NULL, 4, NULL, 2, '["analista"]'),
(10, 'Bianca Saldanha', 'Analista Financeiro', 2, NULL, 4, NULL, 3, '["analista"]'),
(11, 'Joice Freitas', 'Departamento Pessoal', 3, NULL, 4, NULL, 4, '["analista"]'),
(12, 'Dennys', 'Supervisor de Compras', 4, NULL, 4, NULL, 3, '["comprador"]'),
(14, 'Juliana Nascimento', 'Engenheiro Civil', 5, 1, 4, 3, 7, '["engenheiro_responsavel", "tecnico"]'),
(15, 'Danilo', 'Engenheiro Mecânico', 9, 2, 4, 3, 5, '["engenheiro_responsavel", "tecnico"]'),
(16, 'Victor Carlos', 'Engenheiro Mecânico', 9, 2, 4, 3, 5, '["engenheiro_responsavel", "tecnico"]')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    setor_id = EXCLUDED.setor_id,
    subsetor_id = EXCLUDED.subsetor_id,
    nivel_id = EXCLUDED.nivel_id,
    subnivel_id = EXCLUDED.subnivel_id,
    superior_id = EXCLUDED.superior_id,
    permissoes = EXCLUDED.permissoes,
    updated_at = CURRENT_TIMESTAMP;

-- OPERACIONAL (Nível 5)
INSERT INTO colaboradores (id, nome, cargo, setor_id, nivel_id, subnivel_id, superior_id, permissoes) VALUES
(13, 'Larissa Welber', 'Assistente Técnico', 9, 5, 4, 5, '["tecnico"]'),
(17, 'Sabrina Bezerra', 'Assistente Financeiro II', 2, 5, NULL, 10, '["assistente"]'),
(18, 'Anne', 'Recursos Humanos', 3, 5, NULL, 11, '["assistente"]'),
(19, 'Leandro Almeida', 'Auxiliar de Compras', 4, 5, NULL, 12, '["assistente"]'),
(20, 'Jefferson', 'Auxiliar de Compras', 4, 5, NULL, 12, '["assistente"]'),
(21, 'Bebeto', 'Almoxarife', 4, 5, NULL, 12, '["assistente"]'),
(22, 'Leticia Santos', 'Assistente Técnico', 5, 5, 5, 14, '["assistente"]'),
(23, 'Joelma', 'Limpeza/Organização', 8, 5, NULL, 4, '[]'),
(24, 'Paulo Roberto', 'Serviços Gerais', 8, 5, NULL, 4, '[]'),
(25, 'Vinicius Alves', 'Estagiário Eng. Mec.', 9, 5, 6, 13, '[]')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo,
    setor_id = EXCLUDED.setor_id,
    nivel_id = EXCLUDED.nivel_id,
    subnivel_id = EXCLUDED.subnivel_id,
    superior_id = EXCLUDED.superior_id,
    permissoes = EXCLUDED.permissoes,
    updated_at = CURRENT_TIMESTAMP;

-- ============ ATUALIZAR SEQUÊNCIAS ============

SELECT setval('setores_id_seq', COALESCE((SELECT MAX(id) FROM setores), 1));
SELECT setval('subsetores_id_seq', COALESCE((SELECT MAX(id) FROM subsetores), 1));
SELECT setval('niveis_hierarquicos_id_seq', COALESCE((SELECT MAX(id) FROM niveis_hierarquicos), 1));
SELECT setval('subniveis_id_seq', COALESCE((SELECT MAX(id) FROM subniveis), 1));
SELECT setval('colaboradores_id_seq', COALESCE((SELECT MAX(id) FROM colaboradores), 1));

-- ============ ÍNDICES PARA PERFORMANCE ============

CREATE INDEX IF NOT EXISTS idx_colaboradores_setor ON colaboradores(setor_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_nivel ON colaboradores(nivel_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_superior ON colaboradores(superior_id);
CREATE INDEX IF NOT EXISTS idx_subsetores_setor ON subsetores(setor_id);
CREATE INDEX IF NOT EXISTS idx_subniveis_nivel ON subniveis(nivel_id);
