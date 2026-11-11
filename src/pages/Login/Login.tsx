import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useState } from "react";
import logo from '../../assets/logos/logo-saquacare.png';
import './Login.css';
import { authService } from "../../services/auth";
import { sincronizarPerfilUsuario } from "../../services/perfilService";

export default function Login() {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (cpf.length < 11) {
            alert("Por favor, digite o CPF completo com 11 dígitos.");
            return;
        }

        try {
            setCarregando(true);
            
            const dados = await authService.login({ cpf, senha });
            
            localStorage.setItem("@SaquaCare:token", dados.token);
            localStorage.setItem("@SaquaCare:user", JSON.stringify(dados.usuario));
            await sincronizarPerfilUsuario(dados.usuario);
            
            navigate("/dashboard");
        } catch (error: any) {
            alert(error.response?.data?.message || "CPF ou senha incorretos!");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="cadastro-split-layout auth-login">
            <div className="cadastro-brand-side">
                <Link to="/landingpage" className="auth-back-link">
                    ← Voltar para a página inicial
                </Link>
                <div className="brand-content">
                    <img src={logo} alt="Logo SaquaCare" className="logo" />
                    <h1>SaquaCare</h1>
                    <p>Acesse a saúde pública de Saquarema de forma fácil, rápida e organizada em um só lugar.</p>
                </div>
            </div>


            <div className="cadastro-form-side">
                <div className="form-card">
                    <h2>Entrar na conta</h2>
                    <p className="form-subtitle">Informe seu CPF e senha para continuar</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group full-width">
                            <label htmlFor="cpf">CPF</label>
                            <input
                                type="text"
                                id="cpf"
                                inputMode="numeric"
                                maxLength={11}
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label htmlFor="senha">Senha</label>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                id="senha"
                                maxLength={50}
                                placeholder="Sua senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="checkbox-group full-width">
                            <input
                                type="checkbox"
                                id="mostrar-senha"
                                checked={mostrarSenha}
                                onChange={(e) => setMostrarSenha(e.target.checked)}
                            />
                            <label htmlFor="mostrar-senha">Mostrar senha</label>
                        </div>

                        <div className="button-group full-width">
                            <button type="submit" disabled={carregando}>
                                {carregando ? "Entrando..." : "Entrar"}
                            </button>
                        </div>
                    </form>

                    <p className="auth-switch">
                        Ainda não possui cadastro? <Link to="/cadastro">Criar uma conta</Link>
                    </p>
                    <p className="auth-switch" style={{ marginTop: "8px", fontSize: "0.85rem" }}>
                        É equipe interna? <Link to="/profissional/login">Acesso Profissional</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}