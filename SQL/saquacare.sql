-- ==============================================================
-- SAQUACARE - SCRIPT GERAL DO BANCO DE DADOS (POSTGRESQL / SUPABASE)
-- Módulos: Paciente, Profissional (RH/Interno), Filas e Prontuário
-- ==============================================================

-- 1. TABELA DE PACIENTES / USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_sus VARCHAR(15);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS endereco VARCHAR(200);

-- 2. TABELA DE ESPECIALIDADES
CREATE TABLE IF NOT EXISTS especialidades (
    id_especialidade SERIAL PRIMARY KEY,
    nome_especialidade VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);

-- 3. TABELA DE UNIDADES DE SAÚDE DE SAQUAREMA
CREATE TABLE IF NOT EXISTS unidades_saude (
    id_unidade SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE,
    tipo VARCHAR(50) DEFAULT 'Clínica da Família',
    bairro VARCHAR(100),
    endereco VARCHAR(200),
    telefone VARCHAR(20)
);

-- 4. TABELA DE PROFISSIONAIS DE SAÚDE (RF01 - RF05)
-- Gestão e cadastro exclusivos da equipe interna / RH por matrícula
CREATE TABLE IF NOT EXISTS profissionais (
    id_profissional SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,      -- Matrícula única gerada pelo RH (RF02)
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    tipo_profissional VARCHAR(50) NOT NULL,     -- 'Médico', 'Enfermeiro', 'Psicólogo', 'Fisioterapeuta' (RF03, RF04)
    registro_conselho VARCHAR(30),              -- CRM, COREN, CRP, CREFITO
    email_institucional VARCHAR(150),
    senha VARCHAR(255) NOT NULL,                -- Senha temporária fornecida pelo RH (RF03)
    ativo BOOLEAN DEFAULT TRUE,                 -- Desativação/controle pelo RH (RF13)
    id_especialidade INT REFERENCES especialidades(id_especialidade),
    id_unidade_principal INT REFERENCES unidades_saude(id_unidade),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE AGENDAMENTOS E FILA DE ATENDIMENTO (RF06 - RF10, RF15, RF17)
CREATE TABLE IF NOT EXISTS agendamentos (
    id_agendamento SERIAL PRIMARY KEY,
    senha_fila VARCHAR(10) NOT NULL,            -- Senha de chamada da fila, ex: 'C-01' (RF07)
    tipo_atendimento VARCHAR(50) DEFAULT 'Consulta', -- 'Consulta', 'Retorno', 'Exame'
    status VARCHAR(30) DEFAULT 'Aguardando',    -- 'Aguardando', 'Em Triagem', 'Em Atendimento', 'Finalizado', 'Falta' (RF07)
    data_hora_prevista TIMESTAMP NOT NULL,
    motivo_consulta TEXT,
    id_paciente INT REFERENCES usuarios(id) ON DELETE CASCADE,
    id_profissional INT REFERENCES profissionais(id_profissional) ON DELETE CASCADE,
    id_unidade INT REFERENCES unidades_saude(id_unidade),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE PRONTUÁRIOS E EVOLUÇÃO CLÍNICA (RF09, RF10, RF18)
CREATE TABLE IF NOT EXISTS prontuarios (
    id_prontuario SERIAL PRIMARY KEY,
    id_agendamento INT REFERENCES agendamentos(id_agendamento) ON DELETE SET NULL,
    id_paciente INT REFERENCES usuarios(id) ON DELETE CASCADE,
    id_profissional INT REFERENCES profissionais(id_profissional),
    alergias TEXT,
    historico_consultas TEXT,
    diagnostico TEXT,
    prescricao_tratamento TEXT,
    evolucao_observacoes TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- CARGA INICIAL (SEEDS) GERADA PELO RH PARA A APRESENTAÇÃO
-- ==============================================================

-- Inserir Especialidades
INSERT INTO especialidades (nome_especialidade) VALUES 
('Cardiologia'), ('Clínica Geral'), ('Pediatria'), ('Ortopedia'), ('Ginecologia'), ('Psicologia'), ('Fisioterapia'), ('Administração Clínica')
ON CONFLICT (nome_especialidade) DO NOTHING;

-- Inserir Unidades de Saúde de Saquarema
INSERT INTO unidades_saude (nome, bairro) VALUES 
('Clínica da Família de Bacaxá', 'Bacaxá'),
('Clínica da Mulher', 'Verde Vale'),
('Clínica da Criança', 'Verde Vale'),
('Clínica do Homem e do Idoso', 'Porto da Roça')
ON CONFLICT (nome) DO NOTHING;

-- Inserir Profissionais Cadastrados pelo RH (Dados Fictícios para Demonstração)
-- Senha padrão temporária para todos: saqua@2026
INSERT INTO profissionais (
    matricula, nome, cpf, tipo_profissional, registro_conselho, 
    email_institucional, telefone, senha, carga_horaria_semanal, 
    id_especialidade, id_unidade_principal
) VALUES 
(
    'MED-2026', 'Dr. Carlos Eduardo Ribeiro', '789.456.123-00', 'Médico', 'CRM/RJ 543210',
    'carlos.ribeiro@saquacare.gov.br', '(22) 99841-2201', 'saqua@2026', 40,
    (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = 'Cardiologia' LIMIT 1),
    (SELECT id_unidade FROM unidades_saude WHERE nome = 'Clínica da Família de Bacaxá' LIMIT 1)
),
(
    'ENF-2026', 'Enf. Mariana Souza Costa', '321.654.987-10', 'Enfermeiro', 'COREN/RJ 319842',
    'mariana.costa@saquacare.gov.br', '(22) 99714-5590', 'saqua@2026', 36,
    (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = 'Clínica Geral' LIMIT 1),
    (SELECT id_unidade FROM unidades_saude WHERE nome = 'Clínica da Família de Bacaxá' LIMIT 1)
),
(
    'PSI-2026', 'Dra. Vanessa Albuquerque', '456.123.789-22', 'Psicólogo', 'CRP/RJ 05/48219',
    'vanessa.albuquerque@saquacare.gov.br', '(22) 99923-1840', 'saqua@2026', 30,
    (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = 'Psicologia' LIMIT 1),
    (SELECT id_unidade FROM unidades_saude WHERE nome = 'Clínica da Mulher' LIMIT 1)
),
(
    'FIS-2026', 'Dr. Rodrigo Mendonça', '654.987.321-44', 'Fisioterapeuta', 'CREFITO-2 198420-F',
    'rodrigo.mendonca@saquacare.gov.br', '(22) 99609-7731', 'saqua@2026', 30,
    (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = 'Fisioterapia' LIMIT 1),
    (SELECT id_unidade FROM unidades_saude WHERE nome = 'Clínica do Homem e do Idoso' LIMIT 1)
),
(
    'RH-2026', 'Roberto Almeida (Coordenação / RH)', '159.753.486-99', 'Equipe Interna / RH', 'ADM/RH-001',
    'rh.gestao@saquacare.gov.br', '(22) 99800-1000', 'saqua@2026', 40,
    (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = 'Administração Clínica' LIMIT 1),
    (SELECT id_unidade FROM unidades_saude WHERE nome = 'Clínica da Família de Bacaxá' LIMIT 1)
)
ON CONFLICT (matricula) DO NOTHING;

-- Fila do Dia (3 Pacientes na fila do Dr. Carlos Eduardo para a apresentação)
DO $$
DECLARE
    v_paciente_id INT;
    v_prof_id INT;
    v_unidade_id INT;
BEGIN
    SELECT id INTO v_paciente_id FROM usuarios LIMIT 1;
    SELECT id_profissional INTO v_prof_id FROM profissionais WHERE matricula = 'MED-2026';
    SELECT id_unidade INTO v_unidade_id FROM unidades_saude LIMIT 1;

    IF v_paciente_id IS NOT NULL AND v_prof_id IS NOT NULL THEN
        INSERT INTO agendamentos (senha_fila, tipo_atendimento, status, data_hora_prevista, motivo_consulta, id_paciente, id_profissional, id_unidade)
        VALUES 
        ('C-01', 'Consulta', 'Aguardando', CURRENT_TIMESTAMP, 'Dores torácicas e acompanhamento de rotina', v_paciente_id, v_prof_id, v_unidade_id),
        ('C-02', 'Retorno', 'Aguardando', CURRENT_TIMESTAMP + interval '30 minutes', 'Avaliação de exame de ecocardiograma', v_paciente_id, v_prof_id, v_unidade_id),
        ('C-03', 'Consulta', 'Aguardando', CURRENT_TIMESTAMP + interval '60 minutes', 'Picos de hipertensão arterial', v_paciente_id, v_prof_id, v_unidade_id);
    END IF;
END $$;
