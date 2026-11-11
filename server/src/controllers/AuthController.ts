// server/src/controllers/AuthController.ts

import { Request, Response } from 'express';
import { pool } from '../database/db';

function formatarDataNascimento(data: string | Date | null | undefined): string {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 10);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export class AuthController {
  // Login
  static async login(req: Request, res: Response) {
    const { cpf, senha } = req.body;

    try {
      const result = await pool.query(
        'SELECT id, nome, cpf, senha, numero_sus, email, telefone, endereco, data_nascimento FROM usuarios WHERE cpf = $1',
        [cpf]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'CPF ou senha incorretos!' });
      }

      const usuario = result.rows[0];

      if (usuario.senha !== senha) {
        return res.status(401).json({ message: 'CPF ou senha incorretos!' });
      }

      return res.json({
        token: 'token-jwt-ficticio-saquacare',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          cpf: usuario.cpf,
          numeroSus: usuario.numero_sus || '',
          email: usuario.email || '',
          telefone: usuario.telefone || '',
          endereco: usuario.endereco || '',
          dataNascimento: formatarDataNascimento(usuario.data_nascimento),
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }

  // Cadastro
  static async cadastrar(req: Request, res: Response) {
    const {
      nome,
      cpf,
      numeroSus,
      numero_sus,
      dataNascimento,
      email,
      telefone,
      endereco,
      senha,
    } = req.body;
    const susFinal = numeroSus || numero_sus;

    try {
      const usuarioExistente = await pool.query('SELECT id FROM usuarios WHERE cpf = $1', [cpf]);

      if (usuarioExistente.rows.length > 0) {
        return res.status(400).json({ message: 'CPF já cadastrado no sistema!' });
      }

      const novoUsuario = await pool.query(
        `INSERT INTO usuarios
          (nome, cpf, numero_sus, data_nascimento, email, telefone, endereco, senha)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, nome, cpf, numero_sus, email, telefone, endereco, data_nascimento`,
        [nome, cpf, susFinal, dataNascimento, email, telefone, endereco || '', senha]
      );

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        usuario: {
          id: novoUsuario.rows[0].id,
          nome: novoUsuario.rows[0].nome,
          cpf: novoUsuario.rows[0].cpf,
          numeroSus: novoUsuario.rows[0].numero_sus || '',
          email: novoUsuario.rows[0].email || '',
          telefone: novoUsuario.rows[0].telefone || '',
          endereco: novoUsuario.rows[0].endereco || '',
          dataNascimento: formatarDataNascimento(novoUsuario.rows[0].data_nascimento),
        },
      });
    } catch (error) {
      console.error('ERRO DETALHADO NO CADASTRO:', error);
      return res.status(500).json({ message: 'Erro ao realizar cadastro.' });
    }
  }
}