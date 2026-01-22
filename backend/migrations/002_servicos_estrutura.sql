-- Migração: Estrutura de Serviços
-- Data: 2026-01-18
-- Descrição: Cria estrutura para gestão de serviços com empresas, clientes, categorias e tipos

-- ============ TABELAS ============

-- Empresas executoras (quem executa o serviço)
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    nome_completo VARCHAR(200),
    cnpj VARCHAR(20),
    cor VARCHAR(20) DEFAULT '#3B82F6',
    cor_texto VARCHAR(20) DEFAULT '#ffffff',
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clientes (para quem é feito o serviço)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    nome_completo VARCHAR(200),
    cnpj VARCHAR(20),
    contato VARCHAR(200),
    email VARCHAR(200),
    telefone VARCHAR(50),
    cor VARCHAR(20) DEFAULT '#10B981',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de serviço (área de atuação)
CREATE TABLE IF NOT EXISTS categorias_servico (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    empresa_id INTEGER NOT NULL REFERENCES empresas(id),
    setor_id INTEGER REFERENCES setores(id),
    cor VARCHAR(20) DEFAULT '#8B5CF6',
    cor_texto VARCHAR(20) DEFAULT '#ffffff',
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de serviço (subcategoria específica)
CREATE TABLE IF NOT EXISTS tipos_servico (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    categoria_id INTEGER NOT NULL REFERENCES categorias_servico(id),
    valor_hora_base DECIMAL(10,2),
    prazo_medio_dias INTEGER,
    cor VARCHAR(20) DEFAULT '#F59E0B',
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Serviços/Projetos (os projetos em si)
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo_servico_id INTEGER NOT NULL REFERENCES tipos_servico(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    valor_estimado DECIMAL(15,2),
    valor_contratado DECIMAL(15,2),
    data_inicio DATE,
    data_fim_prevista DATE,
    data_fim_real DATE,
    status VARCHAR(20) DEFAULT 'planejado',
    responsavel_id INTEGER REFERENCES colaboradores(id),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ DADOS INICIAIS: EMPRESAS ============

INSERT INTO empresas (id, codigo, nome, nome_completo, cor, cor_texto) VALUES
(1, 'AZTECH', 'AZ TECH', 'AZ TECH Comércio e Serviços LTDA', '#1E40AF', '#ffffff'),
(2, 'AZMAQ', 'AZ MAQ', 'AZ MAQ Equipamentos e Manutenção LTDA', '#059669', '#ffffff')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    nome_completo = EXCLUDED.nome_completo,
    cor = EXCLUDED.cor,
    cor_texto = EXCLUDED.cor_texto,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: CLIENTES ============

INSERT INTO clientes (id, codigo, nome, nome_completo, cor) VALUES
(1, 'NGD', 'NGD', 'Neogrid S.A.', '#EF4444'),
(2, 'ULT', 'ULT', 'Ultrapar Participações S.A.', '#3B82F6'),
(3, 'CPE', 'CPE', 'CPE Equipamentos', '#F59E0B')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    nome_completo = EXCLUDED.nome_completo,
    cor = EXCLUDED.cor,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: CATEGORIAS DE SERVIÇO ============

-- Categorias da AZ TECH (empresa_id = 1)
INSERT INTO categorias_servico (id, codigo, nome, descricao, empresa_id, setor_id, cor, ordem) VALUES
(1, 'CIVIL', 'Civil', 'Serviços de engenharia civil e construção', 1, 5, '#87CEEB', 1),
(2, 'MECANICA', 'Mecânica', 'Serviços de engenharia mecânica e instalações', 1, 9, '#E5E7EB', 2)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    empresa_id = EXCLUDED.empresa_id,
    setor_id = EXCLUDED.setor_id,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Categorias da AZ MAQ (empresa_id = 2)
INSERT INTO categorias_servico (id, codigo, nome, descricao, empresa_id, setor_id, cor, ordem) VALUES
(3, 'MANUTENCAO', 'Manutenção', 'Serviços de manutenção de equipamentos', 2, 8, '#FFFF99', 3),
(4, 'COMERCIO', 'Comércio', 'Venda de equipamentos e máquinas', 2, 1, '#C6EFCE', 4)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    empresa_id = EXCLUDED.empresa_id,
    setor_id = EXCLUDED.setor_id,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: TIPOS DE SERVIÇO ============

-- Tipos da categoria CIVIL (categoria_id = 1)
INSERT INTO tipos_servico (id, codigo, nome, descricao, categoria_id, prazo_medio_dias, cor, ordem) VALUES
(1, 'INFRA', 'Infraestrutura', 'Obras de infraestrutura e construção civil', 1, 120, '#2563EB', 1),
(2, 'MANUT-PRED', 'Manutenção Predial', 'Manutenção de edificações e instalações prediais', 1, 90, '#3B82F6', 2)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    categoria_id = EXCLUDED.categoria_id,
    prazo_medio_dias = EXCLUDED.prazo_medio_dias,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Tipos da categoria MECÂNICA (categoria_id = 2)
INSERT INTO tipos_servico (id, codigo, nome, descricao, categoria_id, prazo_medio_dias, cor, ordem) VALUES
(3, 'TUBULACAO', 'Tubulação', 'Instalação e manutenção de tubulações industriais', 2, 60, '#6366F1', 1),
(4, 'PINTURA', 'Pintura', 'Pintura industrial de vasos e equipamentos', 2, 45, '#8B5CF6', 2)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    categoria_id = EXCLUDED.categoria_id,
    prazo_medio_dias = EXCLUDED.prazo_medio_dias,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Tipos da categoria MANUTENÇÃO (categoria_id = 3)
INSERT INTO tipos_servico (id, codigo, nome, descricao, categoria_id, prazo_medio_dias, cor, ordem) VALUES
(5, 'LANCAS', 'Lanças', 'Manutenção de lanças e braços mecânicos', 3, 30, '#F59E0B', 1)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    categoria_id = EXCLUDED.categoria_id,
    prazo_medio_dias = EXCLUDED.prazo_medio_dias,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- Tipos da categoria COMÉRCIO (categoria_id = 4)
INSERT INTO tipos_servico (id, codigo, nome, descricao, categoria_id, prazo_medio_dias, cor, ordem) VALUES
(6, 'VENDA', 'Venda', 'Venda de equipamentos e máquinas industriais', 4, 60, '#10B981', 1)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    categoria_id = EXCLUDED.categoria_id,
    prazo_medio_dias = EXCLUDED.prazo_medio_dias,
    cor = EXCLUDED.cor,
    ordem = EXCLUDED.ordem,
    updated_at = CURRENT_TIMESTAMP;

-- ============ DADOS INICIAIS: SERVIÇOS 2026 ============

-- Janeiro 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(1, 'CPE-PINT-001', 'Pintura de Vasos CPE #1', 'Pintura industrial de vasos de pressão', 4, 3, 374623.95, '2026-01-15', '2027-03-15', 'planejado'),
(2, 'CPE-PINT-002', 'Pintura de Vasos CPE #2', 'Pintura industrial de vasos de pressão', 4, 3, 346820.44, '2026-01-20', '2027-03-20', 'planejado'),
(3, 'NGD-LANC-001', 'Manutenção de Lanças 01', 'Manutenção preventiva e corretiva de lanças', 5, 1, 394840.00, '2026-01-10', '2027-02-10', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Março 2026 (pico do ano)
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(4, 'NGD-INFRA-001', 'Central de Resíduos', 'Construção de central de tratamento de resíduos', 1, 1, 600000.00, '2026-03-01', '2027-06-30', 'planejado'),
(5, 'NGD-INFRA-002', 'Reforma ADM Betim Pav. Superior', 'Reforma do pavimento superior do prédio administrativo', 1, 1, 2300000.00, '2026-03-15', '2027-09-15', 'planejado'),
(6, 'ULT-INFRA-001', 'Construção do Plant', 'Construção completa de planta industrial', 1, 2, 3500000.00, '2026-03-01', '2027-12-31', 'planejado'),
(7, 'NGD-TUB-001', 'Instalação de Tubulação de GLP 1', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-01', '2027-05-01', 'planejado'),
(8, 'NGD-TUB-002', 'Instalação de Tubulação de GLP 2', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-01', '2027-05-01', 'planejado'),
(9, 'NGD-TUB-003', 'Instalação de Tubulação de GLP 3', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-05', '2027-05-05', 'planejado'),
(10, 'NGD-TUB-004', 'Instalação de Tubulação de GLP 4', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-05', '2027-05-05', 'planejado'),
(11, 'NGD-TUB-005', 'Instalação de Tubulação de GLP 5', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-10', '2027-05-10', 'planejado'),
(12, 'NGD-TUB-006', 'Instalação de Tubulação de GLP 6', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-10', '2027-05-10', 'planejado'),
(13, 'NGD-TUB-007', 'Instalação de Tubulação de GLP 7', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-15', '2027-05-15', 'planejado'),
(14, 'NGD-TUB-008', 'Instalação de Tubulação de GLP 8', 'Instalação de sistema de tubulação de GLP', 3, 1, 1400000.00, '2026-03-15', '2027-05-15', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Abril 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(15, 'NGD-MPRED-001', 'Manutenção Predial Área 01', 'Manutenção predial completa da área 01', 2, 1, 3000000.00, '2026-04-01', '2027-10-01', 'planejado'),
(16, 'NGD-MPRED-002', 'Manutenção Predial Área 02', 'Manutenção predial completa da área 02', 2, 1, 3000000.00, '2026-04-15', '2027-10-15', 'planejado'),
(17, 'NGD-PINT-001', 'Pintura de Vasos 1', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-01', '2027-06-01', 'planejado'),
(18, 'NGD-PINT-002', 'Pintura de Vasos 2', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-01', '2027-06-01', 'planejado'),
(19, 'NGD-PINT-003', 'Pintura de Vasos 3', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-05', '2027-06-05', 'planejado'),
(20, 'NGD-PINT-004', 'Pintura de Vasos 4', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-05', '2027-06-05', 'planejado'),
(21, 'NGD-PINT-005', 'Pintura de Vasos 5', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-10', '2027-06-10', 'planejado'),
(22, 'NGD-PINT-006', 'Pintura de Vasos 6', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-10', '2027-06-10', 'planejado'),
(23, 'NGD-PINT-007', 'Pintura de Vasos 7', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-15', '2027-06-15', 'planejado'),
(24, 'NGD-PINT-008', 'Pintura de Vasos 8', 'Pintura industrial de vasos', 4, 1, 500000.00, '2026-04-15', '2027-06-15', 'planejado'),
(25, 'NGD-LANC-002', 'Manutenção de Lanças 02', 'Manutenção preventiva e corretiva de lanças', 5, 1, 394840.00, '2026-04-01', '2027-05-01', 'planejado'),
(26, 'NGD-VEND-001', 'Venda de Uma Lança', 'Comercialização de lança industrial', 6, 1, 700000.00, '2026-04-01', '2027-06-01', 'planejado'),
(27, 'NGD-VEND-002', 'Robô Carga e Descarga', 'Comercialização de robô para carga e descarga', 6, 1, 2300000.00, '2026-04-15', '2027-08-15', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Maio 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(28, 'NGD-INFRA-003', 'Carga e Descarga 1', 'Infraestrutura para sistema de carga e descarga', 1, 1, 1200000.00, '2026-05-01', '2027-09-01', 'planejado'),
(29, 'NGD-INFRA-004', 'Carga e Descarga 2', 'Infraestrutura para sistema de carga e descarga', 1, 1, 1200000.00, '2026-05-01', '2027-09-01', 'planejado'),
(30, 'NGD-INFRA-005', 'Carga e Descarga 3', 'Infraestrutura para sistema de carga e descarga', 1, 1, 1200000.00, '2026-05-01', '2027-09-01', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Junho 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(31, 'NGD-LANC-003', 'Manutenção de Lanças 03', 'Manutenção preventiva e corretiva de lanças', 5, 1, 394840.00, '2026-06-01', '2027-07-01', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Agosto 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(32, 'NGD-VEND-003', 'Transportador 200M', 'Comercialização de transportador industrial 200 metros', 6, 1, 1600000.00, '2026-08-01', '2027-12-01', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Setembro 2026
INSERT INTO servicos (id, codigo, nome, descricao, tipo_servico_id, cliente_id, valor_estimado, data_inicio, data_fim_prevista, status) VALUES
(33, 'NGD-LANC-004', 'Manutenção de Lanças 04', 'Manutenção preventiva e corretiva de lanças', 5, 1, 394840.00, '2026-09-01', '2027-10-01', 'planejado')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    tipo_servico_id = EXCLUDED.tipo_servico_id,
    cliente_id = EXCLUDED.cliente_id,
    valor_estimado = EXCLUDED.valor_estimado,
    data_inicio = EXCLUDED.data_inicio,
    data_fim_prevista = EXCLUDED.data_fim_prevista,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- ============ ATUALIZAR SEQUÊNCIAS ============

SELECT setval('empresas_id_seq', COALESCE((SELECT MAX(id) FROM empresas), 1));
SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1));
SELECT setval('categorias_servico_id_seq', COALESCE((SELECT MAX(id) FROM categorias_servico), 1));
SELECT setval('tipos_servico_id_seq', COALESCE((SELECT MAX(id) FROM tipos_servico), 1));
SELECT setval('servicos_id_seq', COALESCE((SELECT MAX(id) FROM servicos), 1));

-- ============ ÍNDICES ============

CREATE INDEX IF NOT EXISTS idx_categorias_servico_empresa ON categorias_servico(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tipos_servico_categoria ON tipos_servico(categoria_id);
CREATE INDEX IF NOT EXISTS idx_servicos_tipo ON servicos(tipo_servico_id);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status);
CREATE INDEX IF NOT EXISTS idx_servicos_data_inicio ON servicos(data_inicio);
