import { api } from './api';

export interface LoginPayload {
  cpf: string;
  senha: string;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  cpf: string;
  numeroSus: string;
  email: string;
  telefone: string;
  endereco: string;
  dataNascimento: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

export interface CadastroPayload {
  nome: string;
  cpf: string;
  numeroSus: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  senha: string;
}

export interface CadastroResponse {
  message: string;
  usuario: UsuarioAutenticado;
}

export const authService = {
  async login(dados: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', dados);
    return response.data;
  },

  async cadastrar(dados: CadastroPayload): Promise<CadastroResponse> {
    const response = await api.post<CadastroResponse>('/auth/cadastrar', dados);
    return response.data;
  },
};