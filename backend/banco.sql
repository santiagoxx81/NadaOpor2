-- =========================================================
-- RECRIA O BANCO DO ZERO (SEM POLICIAMENTO)
-- Com status PENDENTE e pendencia_obs já no schema
-- =========================================================
DROP DATABASE IF EXISTS portal_pmerj;
CREATE DATABASE portal_pmerj
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE portal_pmerj;

-- =========================
-- TABELA: usuarios
-- =========================
CREATE TABLE usuarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(140) NOT NULL UNIQUE,
  telefone VARCHAR(40) NULL,
  documento VARCHAR(32) NULL,       -- CPF/CNPJ opcional
  senha_hash VARCHAR(255) NOT NULL, -- bcrypt
  tipo_usuario ENUM('ADMIN','CIDADÃO') NOT NULL DEFAULT 'CIDADÃO',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_nome ON usuarios (nome);

-- =========================
-- TABELA: autorizacoes_eventos (Nada Opor)
-- =========================
CREATE TABLE autorizacoes_eventos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  protocolo VARCHAR(24) NOT NULL UNIQUE,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  tipo_evento VARCHAR(60) NULL,
  endereco VARCHAR(220) NOT NULL,
  bairro VARCHAR(120) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep VARCHAR(12) NULL,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME NOT NULL,
  publico_estimado INT NULL,
  observacoes TEXT NULL,
  status ENUM('RECEBIDA','EM_ANALISE','PENDENTE','APROVADA','RECUSADA','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'RECEBIDA',
  pendencia_obs TEXT NULL,  -- descrição obrigatória quando status = PENDENTE
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ae_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ae_status       ON autorizacoes_eventos (status);
CREATE INDEX idx_ae_cidade       ON autorizacoes_eventos (cidade);
CREATE INDEX idx_ae_data_inicio  ON autorizacoes_eventos (data_inicio);

-- =========================
-- TABELA: solicitacoes_palestras
-- =========================
CREATE TABLE solicitacoes_palestras (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  protocolo VARCHAR(24) NOT NULL UNIQUE,
  organizacao VARCHAR(140) NULL,
  endereco VARCHAR(220) NOT NULL,
  bairro VARCHAR(120) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  cep VARCHAR(12) NULL,
  temas VARCHAR(240) NOT NULL,
  publico_alvo VARCHAR(140) NULL,
  qtd_pessoas INT NULL,
  data_sugerida DATETIME NOT NULL,
  observacoes TEXT NULL,
  status ENUM('RECEBIDA','EM_ANALISE','AGENDADA','RECUSADA','FINALIZADA','CANCELADA') NOT NULL DEFAULT 'RECEBIDA',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pl_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pl_status         ON solicitacoes_palestras (status);
CREATE INDEX idx_pl_cidade         ON solicitacoes_palestras (cidade);
CREATE INDEX idx_pl_data_sugerida  ON solicitacoes_palestras (data_sugerida);

-- =========================
-- TABELA: anexos_autorizacao (arquivos no filesystem; aqui só metadados)
-- =========================
CREATE TABLE anexos_autorizacao (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  autorizacao_evento_id BIGINT UNSIGNED NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  caminho_ou_chave VARCHAR(500) NOT NULL, -- caminho local (ex.: uploads/AE/<protocolo>/...)
  mime VARCHAR(100) NOT NULL,
  tamanho_bytes BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ax_ae FOREIGN KEY (autorizacao_evento_id) REFERENCES autorizacoes_eventos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ax_ae ON anexos_autorizacao (autorizacao_evento_id);

-- =========================
-- SEED de usuários (senha = 123456)
-- hash validado previamente: $2b$10$vLKSf045lHriS/iYpRoIb.oR.5ZH8peFvWsZyUD624wDX3me3i4wS
-- =========================
INSERT INTO usuarios (nome, email, telefone, documento, senha_hash, tipo_usuario) VALUES
('Admin PMERJ', 'admin@pmerj.rj.gov', '21999990000', '00000000000', '$2b$10$vLKSf045lHriS/iYpRoIb.oR.5ZH8peFvWsZyUD624wDX3me3i4wS', 'ADMIN'),
('João da Silva', 'joao@email.com',   '21988887777', '12345678900', '$2b$10$vLKSf045lHriS/iYpRoIb.oR.5ZH8peFvWsZyUD624wDX3me3i4wS', 'CIDADÃO'),
('Maria Souza', 'maria@email.com',    '21977776666', '98765432100', '$2b$10$vLKSf045lHriS/iYpRoIb.oR.5ZH8peFvWsZyUD624wDX3me3i4wS', 'CIDADÃO')
ON DUPLICATE KEY UPDATE senha_hash=VALUES(senha_hash), tipo_usuario=VALUES(tipo_usuario);

-- =========================
-- EXEMPLOS (1 Nada Opor + 1 Palestra)
-- =========================
-- IDs pelos e-mails do seed
SET @admin_id = (SELECT id FROM usuarios WHERE email='admin@pmerj.rj.gov');
SET @joao_id  = (SELECT id FROM usuarios WHERE email='joao@email.com');
SET @maria_id = (SELECT id FROM usuarios WHERE email='maria@email.com');

-- Nada Opor (do João) - status RECEBIDA
INSERT INTO autorizacoes_eventos
  (usuario_id, protocolo, titulo, descricao, tipo_evento, endereco, bairro, cidade, estado, cep,
   data_inicio, data_fim, publico_estimado, observacoes, status, pendencia_obs)
VALUES
  (@joao_id, 'PMRJ-AE-2025-000001', 'Feira Bairro Seguro',
   'Evento comunitário com estandes e apresentações',
   'feira', 'Av. Atlântica, 1000', 'Copacabana', 'Rio de Janeiro', 'RJ', '22010-000',
   '2025-09-20 18:00:00', '2025-09-20 22:00:00', 500, 'Palco central e sonorização',
   'RECEBIDA', NULL);

-- Palestra (do João)
INSERT INTO solicitacoes_palestras
  (usuario_id, protocolo, organizacao, endereco, bairro, cidade, estado, cep,
   temas, publico_alvo, qtd_pessoas, data_sugerida, observacoes, status)
VALUES
  (@joao_id, 'PMRJ-PL-2025-000001', 'Empresa XPTO', 'Rua das Laranjeiras, 50', 'Laranjeiras',
   'Rio de Janeiro', 'RJ', '22240-003',
   'trânsito,violência doméstica', 'colaboradores', 80, '2025-10-05 10:00:00',
   'Sala de convenções do 2º andar', 'RECEBIDA');

-- (opcional) um exemplo já PENDENTE para ver no front:
INSERT INTO autorizacoes_eventos
  (usuario_id, protocolo, titulo, descricao, tipo_evento, endereco, bairro, cidade, estado, cep,
   data_inicio, data_fim, publico_estimado, observacoes, status, pendencia_obs)
VALUES
  (@maria_id, 'PMRJ-AE-2025-000002', 'Show Comunitário',
   'Show ao ar livre', 'show', 'Praça Central, s/n', 'Centro', 'Rio de Janeiro', 'RJ', '20000-000',
   '2025-11-10 19:00:00', '2025-11-10 22:30:00', 1500, NULL,
   'PENDENTE', 'Falta anexar: ofício e requerimento padrão da PM.');
