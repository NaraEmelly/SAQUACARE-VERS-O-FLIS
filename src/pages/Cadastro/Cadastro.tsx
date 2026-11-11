import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import { validarCPF } from "../../utils/cpf";
import logo from '../../assets/logos/logo-saquacare.png';
import './Cadastro.css';
import { authService } from "../../services/auth";
import { sincronizarPerfilUsuario } from "../../services/perfilService";

function hojeISO() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

export default function Cadastro() {
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [numeroSus, setNumeroSus] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [endereco, setEndereco] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmaSenha, setConfirmaSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [carregando, setCarregando] = useState(false);

    function forcaSenha(valor: string) {
        let forca = 0;
        if (valor.length >= 8) forca++;
        if (/[A-Z]/.test(valor)) forca++;
        if (/[0-9]/.test(valor)) forca++;
        if (/[^A-Za-z0-9]/.test(valor)) forca++;

        if (forca === 0) return { texto: "", cor: "" };
        if (forca <= 1) return { texto: "Senha fraca", cor: "var(--color-danger)" };
        if (forca <= 3) return { texto: "Senha média", cor: "var(--color-warning-text)" };

        return { texto: "Senha forte", cor: "var(--color-success-text)" };
    }

    const { texto: textoForca, cor: corForca } = forcaSenha(senha);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validarCPF(cpf)) {
            alert("CPF inválido! Verifique e tente novamente.");
            return;
        }

        if (numeroSus.length !== 15) {
            alert("O número do SUS precisa ter 15 dígitos.");
            return;
        }

        const telefoneDigitos = telefone.replace(/\D/g, "");
        if (telefoneDigitos.length < 10 || telefoneDigitos.length > 11) {
            alert("Digite um telefone válido com DDD.");
            return;
        }

        if (senha !== confirmaSenha) {
            alert("As senhas digitadas não correspondem! Por favor, digite novamente.");
            return;
        }

        try {
            setCarregando(true);
            const resposta = await authService.cadastrar({
                nome: nome.trim(),
                cpf,
                numeroSus,
                dataNascimento,
                email: email.trim(),
                telefone: telefone.replace(/\D/g, ""),
                endereco: endereco.trim(),
                senha,
            });
            await sincronizarPerfilUsuario(resposta.usuario);
            setModalAberto(true);
        } catch (error: unknown) {
            const mensagem = typeof error === "object" && error !== null && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            alert(mensagem || "Erro ao realizar cadastro.");
        } finally {
            setCarregando(false);
        }
    }

    function limparFormulario() {
        setNome("");
        setCpf("");
        setNumeroSus("");
        setDataNascimento("");
        setEmail("");
        setTelefone("");
        setEndereco("");
        setSenha("");
        setConfirmaSenha("");
        setMostrarSenha(false);
    }

    function fecharModal() {
        setModalAberto(false);
        limparFormulario();
    }

    return (
        <main className="cadastro-split-layout auth-cadastro">
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
                    <h2>Criar sua conta</h2>
                    <p className="form-subtitle">Preencha seus dados para começar</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="nome">Nome Completo</label>
                            <input
                                type="text"
                                id="nome"
                                maxLength={150}
                                placeholder="Seu nome completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
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

                        <div className="input-group">
                            <label htmlFor="numero_sus">Número do SUS</label>
                            <input
                                type="text"
                                id="numero_sus"
                                inputMode="numeric"
                                maxLength={15}
                                placeholder="000 0000 0000 0000"
                                value={numeroSus}
                                onChange={(e) => setNumeroSus(e.target.value.replace(/\D/g, ""))}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="data_nascimento">Data de nascimento</label>
                            <input
                                type="date"
                                id="data_nascimento"
                                autoComplete="bday"
                                max={hojeISO()}
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="email"
                                maxLength={150}
                                placeholder="nome@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="telefone">Telefone com DDD</label>
                            <input
                                type="tel"
                                id="telefone"
                                inputMode="tel"
                                autoComplete="tel"
                                maxLength={15}
                                placeholder="(00) 00000-0000"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value.replace(/[^\d()+\-\s]/g, "").slice(0, 15))}
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label htmlFor="endereco">Endereço (opcional)</label>
                            <input
                                type="text"
                                id="endereco"
                                autoComplete="street-address"
                                maxLength={200}
                                placeholder="Rua, número, bairro e cidade"
                                value={endereco}
                                onChange={(e) => setEndereco(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="senha">Crie uma Senha</label>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                id="senha"
                                maxLength={50}
                                placeholder="Mínimo 8 caracteres"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                            {textoForca && (
                                <span className="senha-forca" style={{ color: corForca }}>
                                    {textoForca}
                                </span>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirma_senha">Confirme sua Senha</label>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                id="confirma_senha"
                                maxLength={50}
                                placeholder="Repita a senha"
                                value={confirmaSenha}
                                onChange={(e) => setConfirmaSenha(e.target.value)}
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
                            <label htmlFor="mostrar-senha">Mostrar Senhas</label>
                        </div>

                        <div className="button-group full-width">
                            <button type="submit" disabled={carregando}>
                                {carregando ? "Cadastrando..." : "Cadastrar"}
                            </button>
                        </div>
                    </form>

                    <p className="auth-switch">
                        Já possui cadastro? <Link to="/login">Entrar</Link>
                    </p>
                </div>
            </div>

            <Modal aberto={modalAberto} tipo={"cadastro"} onFechar={fecharModal} />
        </main>
    );
}