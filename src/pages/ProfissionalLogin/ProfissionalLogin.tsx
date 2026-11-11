import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logos/logo-saquacare.png";
import "./ProfissionalLogin.css";
import { loginProfissional } from "../../services/profissionalService";

export default function ProfissionalLogin() {
    const [matricula, setMatricula] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!matricula.trim()) {
            alert("Por favor, digite sua matrícula.");
            return;
        }

        try {
            setCarregando(true);
            await loginProfissional(matricula, senha);
            navigate("/profissional/dashboard");
        } catch (err: any) {
            alert(err?.message || "Matrícula ou senha incorretos!");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="cadastro-split-layout auth-profissional">
            <div className="cadastro-brand-side">
                <Link to="/landingpage" className="auth-back-link">
                    ← Voltar para a página inicial
                </Link>
                <div className="brand-content">
                    <img src={logo} alt="Logo SaquaCare" className="logo" />
                    <h1>Área Profissional</h1>
                    <p>Acesso exclusivo para médicos, enfermeiros e equipe interna da rede de saúde de Saquarema.</p>
                </div>
            </div>


            <div className="cadastro-form-side">
                <div className="form-card">
                    <h2>Acesso Profissional</h2>
                    <p className="form-subtitle">Entre com sua matrícula e senha institucional</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group full-width">
                            <label htmlFor="matricula">Matrícula</label>
                            <input
                                type="text"
                                id="matricula"
                                maxLength={20}
                                placeholder="Ex: MED-2026"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value.toUpperCase())}
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
                            <label htmlFor="mostrar-senha">Mostrar Senha</label>
                        </div>

                        <div className="button-group full-width">
                            <button type="submit" disabled={carregando}>
                                {carregando ? "Entrando..." : "Entrar"}
                            </button>
                        </div>
                    </form>

                    <p className="auth-switch">
                        É paciente? <Link to="/login">Acessar área do paciente</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}