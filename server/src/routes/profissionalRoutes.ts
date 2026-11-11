import { Router } from 'express';
import { ProfissionalController } from '../controllers/ProfissionalController';

const profissionalRoutes = Router();

// Autenticação institucional por Matrícula + Senha
profissionalRoutes.post('/login', ProfissionalController.login);

// Gestão Interna / RH (listagem, cadastro e ativação/desativação de matrículas)
profissionalRoutes.get('/equipe', ProfissionalController.listarEquipe);
profissionalRoutes.post('/equipe', ProfissionalController.cadastrarProfissional);
profissionalRoutes.patch(
  '/equipe/:id/status',
  ProfissionalController.alternarStatusProfissional
);

// Meu Perfil do Profissional
profissionalRoutes.put('/perfil/:id', ProfissionalController.atualizarPerfil);

// Fila de Atendimento e Agendamentos
profissionalRoutes.get('/fila', ProfissionalController.listarFila);
profissionalRoutes.post(
  '/agendamentos',
  ProfissionalController.criarAgendamentoFila
);
profissionalRoutes.patch(
  '/fila/:id/status',
  ProfissionalController.atualizarStatusFila
);

// Prontuário Clínico e Triagem
profissionalRoutes.post(
  '/fila/:id/prontuario',
  ProfissionalController.registrarProntuario
);
profissionalRoutes.get(
  '/prontuarios/:idPaciente',
  ProfissionalController.listarProntuariosPaciente
);

export default profissionalRoutes;
