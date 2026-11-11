import { Request, Response } from 'express';
import { pool } from '../database/db';

let schemaVerificado = false;

/**
 * Garante que as tabelas e os dados iniciais (seeds) do módulo profissional
 * existam no PostgreSQL/Supabase mesmo que o script SQL ainda não tenha sido
 * executado manualmente no painel.
 */
export async function garantirSchemaProfissional(): Promise<void> {
  if (schemaVerificado) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS especialidades (
        id_especialidade SERIAL PRIMARY KEY,
        nome_especialidade VARCHAR(100) NOT NULL UNIQUE,
        descricao TEXT
      );

      CREATE TABLE IF NOT EXISTS unidades_saude (
        id_unidade SERIAL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL UNIQUE,
        tipo VARCHAR(50) DEFAULT 'Clínica da Família',
        bairro VARCHAR(100),
        endereco VARCHAR(200),
        telefone VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS profissionais (
        id_profissional SERIAL PRIMARY KEY,
        matricula VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(150) NOT NULL,
        cpf VARCHAR(14) NOT NULL,
        tipo_profissional VARCHAR(50) NOT NULL,
        registro_conselho VARCHAR(30),
        email_institucional VARCHAR(150),
        telefone VARCHAR(25),
        senha VARCHAR(255) NOT NULL,
        carga_horaria_semanal INT DEFAULT 30,
        ativo BOOLEAN DEFAULT TRUE,
        id_especialidade INT REFERENCES especialidades(id_especialidade),
        id_unidade_principal INT REFERENCES unidades_saude(id_unidade),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS telefone VARCHAR(25);
      ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS carga_horaria_semanal INT DEFAULT 30;

      CREATE TABLE IF NOT EXISTS agendamentos (
        id_agendamento SERIAL PRIMARY KEY,
        protocolo VARCHAR(40),
        senha_fila VARCHAR(10) NOT NULL,
        tipo_atendimento VARCHAR(50) DEFAULT 'Consulta',
        status VARCHAR(30) DEFAULT 'Aguardando',
        data_hora_prevista TIMESTAMP NOT NULL,
        motivo_consulta TEXT,
        paciente_nome_avulso VARCHAR(150),
        id_paciente INT REFERENCES usuarios(id) ON DELETE CASCADE,
        id_profissional INT REFERENCES profissionais(id_profissional) ON DELETE CASCADE,
        id_unidade INT REFERENCES unidades_saude(id_unidade),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS protocolo VARCHAR(40);
      ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS paciente_nome_avulso VARCHAR(150);

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
        sinais_vitais TEXT,
        data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE prontuarios ADD COLUMN IF NOT EXISTS sinais_vitais TEXT;
    `);

    await pool.query(`
      INSERT INTO especialidades (nome_especialidade) VALUES
        ('Cardiologia'),
        ('Clínica Geral'),
        ('Pediatria'),
        ('Ortopedia'),
        ('Ginecologia'),
        ('Psicologia'),
        ('Fisioterapia'),
        ('Administração Clínica')
      ON CONFLICT (nome_especialidade) DO NOTHING;

      INSERT INTO unidades_saude (nome, bairro) VALUES
        ('Clínica da Família de Bacaxá', 'Bacaxá'),
        ('Clínica da Mulher', 'Verde Vale'),
        ('Clínica da Criança', 'Verde Vale'),
        ('Clínica do Homem e do Idoso', 'Porto da Roça')
      ON CONFLICT (nome) DO NOTHING;
    `);

    // Seeds dos profissionais institucionais cadastrados pelo RH
    await pool.query(`
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
    `);

    schemaVerificado = true;
  } catch (err) {
    console.error('Aviso ao verificar schema profissional:', err);
  }
}

function mapearProfissionalRow(row: any) {
  return {
    id: row.id_profissional,
    matricula: row.matricula,
    nome: row.nome,
    cpf: row.cpf,
    tipoProfissional: row.tipo_profissional,
    especialidade: row.nome_especialidade || 'Clínica Geral',
    registroConselho: row.registro_conselho || '',
    unidade: row.nome_unidade || 'Clínica da Família de Bacaxá',
    emailInstitucional: row.email_institucional || '',
    telefone: row.telefone || '(22) 99800-0000',
    senhaTemporaria: false,
    ativo: row.ativo !== false,
    cargaHorariaSemanal: row.carga_horaria_semanal || 30,
    criadoEm: row.criado_em
      ? new Date(row.criado_em).toISOString().slice(0, 10)
      : '2026-08-10',
  };
}

export class ProfissionalController {
  /**
   * POST /api/profissional/login
   * Autenticação exclusiva por Matrícula + Senha
   */
  static async login(req: Request, res: Response) {
    const { matricula, senha } = req.body;

    if (!matricula || !senha) {
      return res
        .status(400)
        .json({ message: 'Informe a matrícula e a senha de acesso.' });
    }

    try {
      await garantirSchemaProfissional();

      const matriculaLimpa = String(matricula).trim().toUpperCase();
      const result = await pool.query(
        `SELECT p.*,
                e.nome_especialidade,
                u.nome AS nome_unidade
         FROM profissionais p
         LEFT JOIN especialidades e ON e.id_especialidade = p.id_especialidade
         LEFT JOIN unidades_saude u ON u.id_unidade = p.id_unidade_principal
         WHERE UPPER(p.matricula) = $1`,
        [matriculaLimpa]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message:
            'Matrícula ou senha incorretos. Solicite apoio ao setor de RH / Administração.',
        });
      }

      const prof = result.rows[0];

      if (prof.senha !== senha) {
        return res.status(401).json({
          message:
            'Matrícula ou senha incorretos. Solicite apoio ao setor de RH / Administração.',
        });
      }

      if (prof.ativo === false) {
        return res.status(403).json({
          message:
            'Esta matrícula encontra-se desativada pelo RH. Entre em contato com a Administração.',
        });
      }

      return res.json({
        token: `token-prof-${prof.matricula}-${Date.now()}`,
        profissional: mapearProfissionalRow(prof),
      });
    } catch (error) {
      console.error('Erro no login profissional:', error);
      return res
        .status(500)
        .json({ message: 'Erro interno ao autenticar profissional.' });
    }
  }

  /**
   * GET /api/profissional/equipe
   * Lista todos os profissionais cadastrados pelo RH
   */
  static async listarEquipe(_req: Request, res: Response) {
    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `SELECT p.*,
                e.nome_especialidade,
                u.nome AS nome_unidade
         FROM profissionais p
         LEFT JOIN especialidades e ON e.id_especialidade = p.id_especialidade
         LEFT JOIN unidades_saude u ON u.id_unidade = p.id_unidade_principal
         ORDER BY p.id_profissional ASC`
      );

      return res.json(result.rows.map(mapearProfissionalRow));
    } catch (error) {
      console.error('Erro ao listar equipe profissional:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao listar profissionais.' });
    }
  }

  /**
   * POST /api/profissional/equipe
   * Cadastro de novo profissional pelo RH / Administração
   */
  static async cadastrarProfissional(req: Request, res: Response) {
    const {
      matricula,
      nome,
      cpf,
      tipoProfissional,
      especialidade,
      registroConselho,
      unidade,
      emailInstitucional,
      telefone,
      senha,
      cargaHorariaSemanal,
    } = req.body;

    if (!matricula || !nome || !cpf || !tipoProfissional) {
      return res.status(400).json({
        message: 'Matrícula, nome, CPF e tipo de profissional são obrigatórios.',
      });
    }

    try {
      await garantirSchemaProfissional();

      const matriculaFormatada = String(matricula).trim().toUpperCase();
      const existente = await pool.query(
        'SELECT id_profissional FROM profissionais WHERE UPPER(matricula) = $1',
        [matriculaFormatada]
      );

      if (existente.rows.length > 0) {
        return res.status(400).json({
          message: `A matrícula ${matriculaFormatada} já está cadastrada no sistema.`,
        });
      }

      // Garante que a especialidade e a unidade existam
      if (especialidade) {
        await pool.query(
          'INSERT INTO especialidades (nome_especialidade) VALUES ($1) ON CONFLICT (nome_especialidade) DO NOTHING',
          [especialidade]
        );
      }
      if (unidade) {
        await pool.query(
          'INSERT INTO unidades_saude (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING',
          [unidade]
        );
      }

      const inserido = await pool.query(
        `INSERT INTO profissionais (
          matricula, nome, cpf, tipo_profissional, registro_conselho,
          email_institucional, telefone, senha, carga_horaria_semanal,
          id_especialidade, id_unidade_principal
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          (SELECT id_especialidade FROM especialidades WHERE nome_especialidade = $10 LIMIT 1),
          (SELECT id_unidade FROM unidades_saude WHERE nome = $11 LIMIT 1)
        )
        RETURNING *`,
        [
          matriculaFormatada,
          nome.trim(),
          cpf.trim(),
          tipoProfissional,
          registroConselho || 'Registro Institucional',
          emailInstitucional || `${matriculaFormatada.toLowerCase()}@saquacare.gov.br`,
          telefone || '(22) 99800-0000',
          senha || 'saqua@2026',
          Number(cargaHorariaSemanal) || 30,
          especialidade || 'Clínica Geral',
          unidade || 'Clínica da Família de Bacaxá',
        ]
      );

      return res.status(201).json({
        message: 'Profissional cadastrado com sucesso pelo RH!',
        profissional: {
          ...mapearProfissionalRow(inserido.rows[0]),
          especialidade: especialidade || 'Clínica Geral',
          unidade: unidade || 'Clínica da Família de Bacaxá',
        },
      });
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao cadastrar profissional.' });
    }
  }

  /**
   * PATCH /api/profissional/equipe/:id/status
   * Ativa ou desativa a matrícula de um profissional (RH)
   */
  static async alternarStatusProfissional(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `UPDATE profissionais
         SET ativo = NOT COALESCE(ativo, true)
         WHERE id_profissional = $1
         RETURNING *`,
        [Number(id)]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: 'Profissional não encontrado.' });
      }

      return res.json({
        message: 'Status da matrícula atualizado com sucesso.',
        profissional: mapearProfissionalRow(result.rows[0]),
      });
    } catch (error) {
      console.error('Erro ao alterar status do profissional:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao atualizar status da matrícula.' });
    }
  }

  /**
   * PUT /api/profissional/perfil/:id
   * Atualização de dados de contato e senha pelo próprio profissional
   */
  static async atualizarPerfil(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, emailInstitucional, telefone, novaSenha } = req.body;

    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `UPDATE profissionais
         SET nome = COALESCE($1, nome),
             email_institucional = COALESCE($2, email_institucional),
             telefone = COALESCE($3, telefone),
             senha = CASE WHEN $4::text IS NOT NULL AND $4::text <> '' THEN $4::text ELSE senha END
         WHERE id_profissional = $5
         RETURNING *`,
        [
          nome || null,
          emailInstitucional || null,
          telefone || null,
          novaSenha || null,
          Number(id),
        ]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: 'Profissional não encontrado.' });
      }

      return res.json({
        message: 'Perfil profissional atualizado com sucesso!',
        profissional: mapearProfissionalRow(result.rows[0]),
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil profissional:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao atualizar perfil profissional.' });
    }
  }

  /**
   * GET /api/profissional/fila
   * Lista os agendamentos e a fila de atendimento integrada
   */
  static async listarFila(_req: Request, res: Response) {
    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `SELECT a.id_agendamento,
                a.protocolo,
                a.senha_fila,
                a.tipo_atendimento,
                a.status,
                a.data_hora_prevista,
                a.motivo_consulta,
                a.paciente_nome_avulso,
                u.id AS id_paciente,
                COALESCE(u.nome, a.paciente_nome_avulso, 'Paciente SaquaCare') AS paciente_nome,
                u.cpf AS paciente_cpf,
                u.numero_sus AS paciente_sus,
                u.data_nascimento AS paciente_nascimento,
                u.telefone AS paciente_telefone,
                p.id_profissional,
                p.matricula AS profissional_matricula,
                p.nome AS profissional_nome,
                e.nome_especialidade AS especialidade,
                un.nome AS unidade
         FROM agendamentos a
         LEFT JOIN usuarios u ON u.id = a.id_paciente
         LEFT JOIN profissionais p ON p.id_profissional = a.id_profissional
         LEFT JOIN especialidades e ON e.id_especialidade = p.id_especialidade
         LEFT JOIN unidades_saude un ON un.id_unidade = a.id_unidade
         ORDER BY a.data_hora_prevista ASC`
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao consultar fila de atendimento:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao consultar fila de atendimento.' });
    }
  }

  /**
   * POST /api/profissional/agendamentos
   * Cria novo agendamento ou encaminhamento na fila vinculado automaticamente pela especialidade
   */
  static async criarAgendamentoFila(req: Request, res: Response) {
    const {
      protocolo,
      senhaFila,
      tipoAtendimento,
      especialidade,
      dataHoraPrevista,
      motivoConsulta,
      idPaciente,
      pacienteNome,
      matriculaProfissional,
      unidade,
    } = req.body;

    try {
      await garantirSchemaProfissional();

      if (unidade) {
        await pool.query(
          'INSERT INTO unidades_saude (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING',
          [unidade]
        );
      }

      // Verifica se o idPaciente existe na tabela usuarios para evitar erro de FK
      let idPacienteValido: number | null = null;
      if (idPaciente && !Number.isNaN(Number(idPaciente))) {
        const checkUser = await pool.query(
          'SELECT id FROM usuarios WHERE id = $1',
          [Number(idPaciente)]
        );
        if (checkUser.rows.length > 0) {
          idPacienteValido = Number(idPaciente);
        }
      }

      // Busca o profissional ativo da especialidade escolhida (Opção 1 - Vinculação automática por especialidade)
      let idProfissionalResolvido: number | null = null;
      if (especialidade) {
        const profPorEsp = await pool.query(
          `SELECT p.id_profissional
           FROM profissionais p
           INNER JOIN especialidades e ON e.id_especialidade = p.id_especialidade
           WHERE LOWER(e.nome_especialidade) = LOWER($1) AND p.ativo = true
           ORDER BY p.id_profissional ASC
           LIMIT 1`,
          [String(especialidade).trim()]
        );
        if (profPorEsp.rows.length > 0) {
          idProfissionalResolvido = profPorEsp.rows[0].id_profissional;
        }
      }

      if (!idProfissionalResolvido) {
        const profPorMatricula = await pool.query(
          `SELECT id_profissional FROM profissionais WHERE UPPER(matricula) = UPPER($1) LIMIT 1`,
          [matriculaProfissional || 'MED-2026']
        );
        idProfissionalResolvido =
          profPorMatricula.rows[0]?.id_profissional || 1;
      }

      const inserido = await pool.query(
        `INSERT INTO agendamentos (
          protocolo, senha_fila, tipo_atendimento, status, data_hora_prevista,
          motivo_consulta, id_paciente, paciente_nome_avulso, id_profissional, id_unidade
        ) VALUES (
          $1, $2, $3, 'Aguardando', COALESCE($4::timestamp, CURRENT_TIMESTAMP),
          $5, $6, $7, $8,
          (SELECT id_unidade FROM unidades_saude WHERE nome = $9 LIMIT 1)
        )
        RETURNING *`,
        [
          protocolo || `SQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          senhaFila || 'C-01',
          tipoAtendimento || 'Consulta',
          dataHoraPrevista || null,
          motivoConsulta || 'Consulta agendada pelo portal do paciente',
          idPacienteValido,
          pacienteNome || 'Paciente SaquaCare',
          idProfissionalResolvido,
          unidade || 'Clínica da Família de Bacaxá',
        ]
      );

      return res.status(201).json({
        message: 'Agendamento incluído na fila com sucesso!',
        agendamento: inserido.rows[0],
      });
    } catch (error) {
      console.error('Erro ao criar agendamento na fila:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao criar agendamento na fila.' });
    }
  }

  /**
   * PATCH /api/profissional/fila/:id/status
   * Atualiza status do atendimento (Chamar próximo, Triagem, Iniciar, Finalizar, Falta)
   */
  static async atualizarStatusFila(req: Request, res: Response) {
    const { id } = req.params;
    const { status, dataHoraPrevista } = req.body;

    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `UPDATE agendamentos
         SET status = COALESCE($1, status),
             data_hora_prevista = COALESCE($2::timestamp, data_hora_prevista)
         WHERE id_agendamento = $3
         RETURNING *`,
        [status || null, dataHoraPrevista || null, Number(id)]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: 'Atendimento não encontrado na fila.' });
      }

      return res.json({
        message: 'Status do atendimento atualizado com sucesso.',
        agendamento: result.rows[0],
      });
    } catch (error) {
      console.error('Erro ao atualizar status da fila:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao atualizar status da fila.' });
    }
  }

  /**
   * POST /api/profissional/fila/:id/prontuario
   * Registra evolução clínica, prescrição, alergias e sinais vitais no prontuário
   */
  static async registrarProntuario(req: Request, res: Response) {
    const { id } = req.params;
    const {
      idPaciente,
      idProfissional,
      alergias,
      historicoConsultas,
      diagnostico,
      prescricao,
      observacoes,
      sinaisVitais,
      finalizarAtendimento,
    } = req.body;

    try {
      await garantirSchemaProfissional();

      const idAgendamentoNum = Number.isNaN(Number(id)) ? null : Number(id);

      const prontuario = await pool.query(
        `INSERT INTO prontuarios (
          id_agendamento, id_paciente, id_profissional, alergias,
          historico_consultas, diagnostico, prescricao_tratamento,
          evolucao_observacoes, sinais_vitais
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          idAgendamentoNum,
          idPaciente || null,
          idProfissional || 1,
          alergias || null,
          historicoConsultas || null,
          diagnostico || 'Evolução clínica registrada',
          prescricao || 'Conduta mantida',
          observacoes || '',
          sinaisVitais ? JSON.stringify(sinaisVitais) : null,
        ]
      );

      if (finalizarAtendimento && idAgendamentoNum) {
        await pool.query(
          `UPDATE agendamentos SET status = 'Finalizado' WHERE id_agendamento = $1`,
          [idAgendamentoNum]
        );
      }

      return res.status(201).json({
        message: 'Evolução registrada no prontuário com sucesso!',
        prontuario: prontuario.rows[0],
      });
    } catch (error) {
      console.error('Erro ao salvar evolução no prontuário:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao registrar evolução no prontuário.' });
    }
  }

  /**
   * GET /api/profissional/prontuarios/:idPaciente
   * Histórico de evoluções do prontuário de um paciente
   */
  static async listarProntuariosPaciente(req: Request, res: Response) {
    const { idPaciente } = req.params;

    try {
      await garantirSchemaProfissional();

      const result = await pool.query(
        `SELECT pr.*,
                p.nome AS profissional_nome,
                p.matricula AS profissional_matricula,
                e.nome_especialidade AS especialidade
         FROM prontuarios pr
         LEFT JOIN profissionais p ON p.id_profissional = pr.id_profissional
         LEFT JOIN especialidades e ON e.id_especialidade = p.id_especialidade
         WHERE pr.id_paciente = $1
         ORDER BY pr.data_registro DESC`,
        [Number(idPaciente)]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar prontuário do paciente:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao buscar prontuário do paciente.' });
    }
  }
}
