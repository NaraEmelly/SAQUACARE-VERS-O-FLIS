import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import "../Agendamentos/Agendamentos.css";
import "./Perfil.css";

import {
    carregarPerfil,
    salvarPerfil,
    PERFIL_PADRAO,
} from "../../services/perfilService";
import type { PerfilData, TipoDocumento } from "../../services/perfilService";

type IconName =
    | "usuario"
    | "documento"
    | "camera"
    | "lixeira"
    | "check"
    | "alerta";


const ICON_PATHS: Record<IconName, ReactNode> = {
    usuario: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </>
    ),
    documento: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <circle cx="9" cy="11" r="2" />
            <path d="M6.5 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M14 10h4M14 13.5h3" />
        </>
    ),
    camera: (
        <>
            <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.5" />
        </>
    ),
    lixeira: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    alerta: (
        <>
            <path d="M12 3.5 2.5 20h19L12 3.5Z" />
            <path d="M12 10v5M12 17.5v.2" />
        </>
    ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {ICON_PATHS[name]}
        </svg>
    );
}

const TAMANHO_FOTO = 320; 
const LIMITE_ARQUIVO = 8 * 1024 * 1024; // 8 MB

const somenteDigitos = (valor: string) => valor.replace(/\D/g, "");

function mascararTelefone(valor: string) {
    const d = somenteDigitos(valor).slice(0, 11);

    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) {
        return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    }
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascararCpf(valor: string) {
    return somenteDigitos(valor)
        .slice(0, 11)
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function mascararSus(valor: string) {
    const d = somenteDigitos(valor).slice(0, 15);

    return [d.slice(0, 3), d.slice(3, 7), d.slice(7, 11), d.slice(11, 15)]
        .filter(Boolean)
        .join(" ");
}

function mascararDocumento(valor: string, tipo: TipoDocumento) {
    if (tipo === "CPF") return mascararCpf(valor);
    if (tipo === "CNH") return somenteDigitos(valor).slice(0, 11);

    return valor
        .replace(/[^0-9a-zA-Z.-]/g, "")
        .toUpperCase()
        .slice(0, 14);
}

function hojeISO() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

type Erros = Partial<Record<keyof PerfilData, string>>;

function validar(dados: PerfilData): Erros {
    const erros: Erros = {};

    if (!dados.nome.trim()) {
        erros.nome = "Informe seu nome.";
    }

    if (
        dados.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
    ) {
        erros.email = "Digite um e-mail válido, como nome@email.com.";
    }

    if (dados.telefone && somenteDigitos(dados.telefone).length < 10) {
        erros.telefone = "Digite o telefone com DDD.";
    }

    if (dados.documento) {
        const digitos = somenteDigitos(dados.documento).length;

        if (dados.tipoDocumento === "CPF" && digitos !== 11) {
            erros.documento = "O CPF precisa ter 11 números.";
        } else if (dados.tipoDocumento === "CNH" && digitos !== 11) {
            erros.documento = "A CNH precisa ter 11 números.";
        } else if (dados.tipoDocumento === "RG" && dados.documento.length < 5) {
            erros.documento = "Digite o número completo do RG.";
        }
    }

    if (dados.cartaoSus && somenteDigitos(dados.cartaoSus).length !== 15) {
        erros.cartaoSus = "O Cartão SUS precisa ter 15 números.";
    }

    if (dados.dataNascimento && dados.dataNascimento > hojeISO()) {
        erros.dataNascimento = "A data de nascimento não pode ser futura.";
    }

    return erros;
}

function processarFoto(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(arquivo);
        const imagem = new Image();

        imagem.onload = () => {
            const lado = Math.min(imagem.width, imagem.height);
            const origemX = (imagem.width - lado) / 2;
            const origemY = (imagem.height - lado) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = TAMANHO_FOTO;
            canvas.height = TAMANHO_FOTO;

            const contexto = canvas.getContext("2d");

            if (!contexto) {
                URL.revokeObjectURL(url);
                reject(new Error("Canvas indisponível"));
                return;
            }

            contexto.fillStyle = "#ffffff";
            contexto.fillRect(0, 0, TAMANHO_FOTO, TAMANHO_FOTO);
            contexto.drawImage(
                imagem,
                origemX,
                origemY,
                lado,
                lado,
                0,
                0,
                TAMANHO_FOTO,
                TAMANHO_FOTO
            );

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };

        imagem.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Imagem inválida"));
        };

        imagem.src = url;
    });
}


function MensagemErro({ campo, texto }: { campo: string; texto?: string }) {
    if (!texto) return null;

    return (
        <span id={`perfil-${campo}-erro`} className="perfil-error" role="alert">
            <Icon name="alerta" size={14} />
            {texto}
        </span>
    );
}

const CAMPOS_COMPLETUDE: (keyof PerfilData)[] = [
    "nome",
    "dataNascimento",
    "email",
    "telefone",
    "endereco",
    "documento",
    "cartaoSus",
    "foto",
];

interface Aviso {
    tipo: "sucesso" | "erro";
    texto: string;
}

interface PerfilProps {
    onAlteradoChange?: (alterado: boolean) => void;
}

function Perfil({ onAlteradoChange }: PerfilProps) {
    const [salvo, setSalvo] = useState<PerfilData>(PERFIL_PADRAO);
    const [rascunho, setRascunho] = useState<PerfilData>(PERFIL_PADRAO);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erros, setErros] = useState<Erros>({});
    const [aviso, setAviso] = useState<Aviso | null>(null);

    const inputFotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelado = false;

        carregarPerfil().then((dados) => {
            if (cancelado) return;

            setSalvo(dados);
            setRascunho(dados);
            setCarregando(false);
        });

        return () => {
            cancelado = true;
        };
    }, []);

    useEffect(() => {
        if (aviso?.tipo !== "sucesso") return;

        const temporizador = setTimeout(() => setAviso(null), 4000);

        return () => clearTimeout(temporizador);
    }, [aviso]);

    const alterado = (Object.keys(salvo) as (keyof PerfilData)[]).some(
        (campo) => salvo[campo] !== rascunho[campo]
    );

    useEffect(() => {
        onAlteradoChange?.(alterado);

        return () => onAlteradoChange?.(false);
    }, [alterado, onAlteradoChange]);

    function handleTexto(evento: ChangeEvent<HTMLInputElement>) {
        const { name, value } = evento.target;
        let novoValor = value;

        if (name === "telefone") {
            novoValor = mascararTelefone(value);
        } else if (name === "cartaoSus") {
            novoValor = mascararSus(value);
        } else if (name === "documento") {
            novoValor = mascararDocumento(value, rascunho.tipoDocumento);
        }

        setRascunho((atual) => ({ ...atual, [name]: novoValor }));
        setErros((atual) => ({ ...atual, [name]: undefined }));
    }

    function handleTipoDocumento(evento: ChangeEvent<HTMLSelectElement>) {
        const tipo = evento.target.value as TipoDocumento;

        setRascunho((atual) => ({ ...atual, tipoDocumento: tipo, documento: "" }));
        setErros((atual) => ({ ...atual, documento: undefined }));
    }

    async function handleFoto(evento: ChangeEvent<HTMLInputElement>) {
        const arquivo = evento.target.files?.[0];

        evento.target.value = "";

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            setAviso({
                tipo: "erro",
                texto: "Escolha um arquivo de imagem, como JPG ou PNG.",
            });
            return;
        }

        if (arquivo.size > LIMITE_ARQUIVO) {
            setAviso({
                tipo: "erro",
                texto: "A foto é muito grande. Escolha uma imagem de até 8 MB.",
            });
            return;
        }

        try {
            const foto = await processarFoto(arquivo);

            setRascunho((atual) => ({ ...atual, foto }));
            setAviso(null);
        } catch {
            setAviso({
                tipo: "erro",
                texto: "Não foi possível abrir essa imagem. Tente outro arquivo.",
            });
        }
    }

    function handleRemoverFoto() {
        setRascunho((atual) => ({ ...atual, foto: "" }));
    }

    function handleDescartar() {
        setRascunho(salvo);
        setErros({});
        setAviso(null);
    }

    async function handleSalvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const novosErros = validar(rascunho);
        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            setAviso({
                tipo: "erro",
                texto: "Corrija os campos destacados para salvar.",
            });
            return;
        }

        const limpo: PerfilData = {
            ...rascunho,
            nome: rascunho.nome.trim(),
            email: rascunho.email.trim(),
            endereco: rascunho.endereco.trim(),
            deficiencia: rascunho.deficiencia.trim(),
        };

        setSalvando(true);

        try {
            await salvarPerfil(limpo);

            setSalvo(limpo);
            setRascunho(limpo);
            setAviso({ tipo: "sucesso", texto: "Alterações salvas." });
        } catch {
            setAviso({
                tipo: "erro",
                texto: "Não foi possível salvar as alterações. Tente novamente.",
            });
        } finally {
            setSalvando(false);
        }
    }

    const iniciais = (
        rascunho.nome
            .trim()
            .split(/\s+/)
            .map((parte) => parte[0])
            .slice(0, 2)
            .join("") || "?"
    ).toUpperCase();

    const ariaErro = (campo: keyof PerfilData) =>
        erros[campo]
            ? { "aria-invalid": true, "aria-describedby": `perfil-${campo}-erro` }
            : {};

    const preenchidos = CAMPOS_COMPLETUDE.filter(
        (campo) => String(rascunho[campo] ?? "").trim() !== ""
    ).length;
    const porcentagem = Math.round(
        (preenchidos / CAMPOS_COMPLETUDE.length) * 100
    );

    return (
        <section className="perfil">
            <div className="ag-header">
                <div>
                    <span className="ag-breadcrumb">Início / Meu perfil</span>
                    <h1>Meu perfil</h1>
                    <p>
                        Mantenha seus dados atualizados para agilizar
                        seus atendimentos.
                    </p>
                </div>
            </div>

            {aviso && (
                <div
                    className={`ag-alert ag-alert--${aviso.tipo === "erro" ? "erro" : "sucesso"}`}
                    role={aviso.tipo === "erro" ? "alert" : "status"}
                >
                    <Icon name={aviso.tipo === "erro" ? "alerta" : "check"} />
                    <span>{aviso.texto}</span>
                </div>
            )}

            <form onSubmit={handleSalvar} noValidate>
                <fieldset
                    className="perfil-fieldset"
                    disabled={salvando || carregando}
                >
                    <legend className="perfil-sr-only">
                        Dados do perfil
                    </legend>

                    <div className="perfil-layout">


                        <div className="perfil-card perfil-photo">
                            <div className="perfil-photo-banner" aria-hidden="true" />

                            <div className="perfil-photo-body">
                                <div className="perfil-avatar">
                                    {rascunho.foto ? (
                                        <img
                                            src={rascunho.foto}
                                            alt="Sua foto de perfil"
                                        />
                                    ) : (
                                        <span aria-hidden="true">{iniciais}</span>
                                    )}
                                </div>

                                <strong className="perfil-photo-name">
                                    {rascunho.nome.trim() || "Seu nome"}
                                </strong>

                                <span className="perfil-photo-role">
                                    Paciente
                                </span>

                                <input
                                    ref={inputFotoRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFoto}
                                />

                                <div className="perfil-photo-actions">
                                    <button
                                        type="button"
                                        className="ag-btn-outline"
                                        onClick={() =>
                                            inputFotoRef.current?.click()
                                        }
                                    >
                                        <Icon name="camera" size={16} />
                                        {rascunho.foto
                                            ? "Trocar foto"
                                            : "Enviar foto"}
                                    </button>

                                    {rascunho.foto && (
                                        <button
                                            type="button"
                                            className="ag-btn-danger-text"
                                            onClick={handleRemoverFoto}
                                        >
                                            <Icon name="lixeira" size={16} />
                                            Remover foto
                                        </button>
                                    )}
                                </div>

                                <small>JPG ou PNG, até 8 MB.</small>

                                <div className="perfil-completude">
                                    <div className="perfil-completude-topo">
                                        <span>Perfil {porcentagem}% completo</span>
                                        <strong>
                                            {preenchidos}/{CAMPOS_COMPLETUDE.length}
                                        </strong>
                                    </div>

                                    <div
                                        className="perfil-completude-barra"
                                        role="progressbar"
                                        aria-label="Perfil preenchido"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={porcentagem}
                                    >
                                        <span style={{ width: `${porcentagem}%` }} />
                                    </div>

                                    <p>
                                        {porcentagem === 100
                                            ? "Seu perfil está completo."
                                            : "Complete os campos que faltam para agilizar seus atendimentos."}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="perfil-card perfil-form">

                            <div className="perfil-secao-titulo">
                                <span className="perfil-secao-icone" aria-hidden="true">
                                    <Icon name="usuario" size={18} />
                                </span>
                                <h2>Dados pessoais</h2>
                            </div>

                            <div className="perfil-grid">

                                <div className="perfil-field">
                                    <label htmlFor="perfil-nome">
                                        Nome completo
                                    </label>
                                    <input
                                        id="perfil-nome"
                                        name="nome"
                                        type="text"
                                        className="perfil-input"
                                        autoComplete="name"
                                        placeholder="Seu nome completo"
                                        value={rascunho.nome}
                                        onChange={handleTexto}
                                        {...ariaErro("nome")}
                                    />
                                    <MensagemErro campo="nome" texto={erros.nome} />
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-dataNascimento">
                                        Data de nascimento
                                    </label>
                                    <input
                                        id="perfil-dataNascimento"
                                        name="dataNascimento"
                                        type="date"
                                        className="perfil-input"
                                        autoComplete="bday"
                                        max={hojeISO()}
                                        value={rascunho.dataNascimento}
                                        onChange={handleTexto}
                                        {...ariaErro("dataNascimento")}
                                    />
                                    <MensagemErro
                                        campo="dataNascimento"
                                        texto={erros.dataNascimento}
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-email">
                                        E-mail
                                    </label>
                                    <input
                                        id="perfil-email"
                                        name="email"
                                        type="email"
                                        className="perfil-input"
                                        autoComplete="email"
                                        placeholder="nome@email.com"
                                        value={rascunho.email}
                                        onChange={handleTexto}
                                        {...ariaErro("email")}
                                    />
                                    <MensagemErro campo="email" texto={erros.email} />
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-telefone">
                                        Telefone
                                    </label>
                                    <input
                                        id="perfil-telefone"
                                        name="telefone"
                                        type="tel"
                                        inputMode="tel"
                                        className="perfil-input"
                                        autoComplete="tel"
                                        placeholder="(00) 00000-0000"
                                        value={rascunho.telefone}
                                        onChange={handleTexto}
                                        {...ariaErro("telefone")}
                                    />
                                    <MensagemErro
                                        campo="telefone"
                                        texto={erros.telefone}
                                    />
                                </div>

                                <div className="perfil-field perfil-field--full">
                                    <label htmlFor="perfil-endereco">
                                        Endereço
                                    </label>
                                    <input
                                        id="perfil-endereco"
                                        name="endereco"
                                        type="text"
                                        className="perfil-input"
                                        autoComplete="street-address"
                                        placeholder="Rua, número, bairro e cidade"
                                        value={rascunho.endereco}
                                        onChange={handleTexto}
                                    />
                                </div>

                            </div>

                            <div className="perfil-secao-titulo perfil-secao-titulo--segunda">
                                <span className="perfil-secao-icone" aria-hidden="true">
                                    <Icon name="documento" size={18} />
                                </span>
                                <h2>Documentos e saúde</h2>
                            </div>

                            <div className="perfil-grid">

                                <div className="perfil-field">
                                    <label htmlFor="perfil-tipoDocumento">
                                        Tipo de documento
                                    </label>
                                    <select
                                        id="perfil-tipoDocumento"
                                        name="tipoDocumento"
                                        className="perfil-input"
                                        value={rascunho.tipoDocumento}
                                        onChange={handleTipoDocumento}
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="RG">RG</option>
                                        <option value="CNH">CNH</option>
                                    </select>
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-documento">
                                        Número do documento
                                    </label>
                                    <input
                                        id="perfil-documento"
                                        name="documento"
                                        type="text"
                                        inputMode={
                                            rascunho.tipoDocumento === "RG"
                                                ? "text"
                                                : "numeric"
                                        }
                                        className="perfil-input"
                                        placeholder={
                                            rascunho.tipoDocumento === "CPF"
                                                ? "000.000.000-00"
                                                : "Somente o número"
                                        }
                                        value={rascunho.documento}
                                        onChange={handleTexto}
                                        {...ariaErro("documento")}
                                    />
                                    <MensagemErro
                                        campo="documento"
                                        texto={erros.documento}
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-cartaoSus">
                                        Cartão SUS
                                    </label>
                                    <input
                                        id="perfil-cartaoSus"
                                        name="cartaoSus"
                                        type="text"
                                        inputMode="numeric"
                                        className="perfil-input"
                                        placeholder="000 0000 0000 0000"
                                        value={rascunho.cartaoSus}
                                        onChange={handleTexto}
                                        {...ariaErro("cartaoSus")}
                                    />
                                    <MensagemErro
                                        campo="cartaoSus"
                                        texto={erros.cartaoSus}
                                    />
                                </div>

                                <div className="perfil-field">
                                    <label htmlFor="perfil-deficiencia">
                                        Deficiência (se houver)
                                    </label>
                                    <input
                                        id="perfil-deficiencia"
                                        name="deficiencia"
                                        type="text"
                                        className="perfil-input"
                                        placeholder="Deixe em branco se não houver"
                                        value={rascunho.deficiencia}
                                        onChange={handleTexto}
                                    />
                                </div>

                            </div>

                            <div className="perfil-actions">
                                {alterado && !salvando && (
                                    <span className="perfil-unsaved" role="status">
                                        Você tem alterações não salvas.
                                    </span>
                                )}

                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={handleDescartar}
                                    disabled={!alterado || salvando}
                                >
                                    Descartar alterações
                                </button>

                                <button
                                    type="submit"
                                    className="ag-btn-primary"
                                    disabled={!alterado || salvando}
                                >
                                    {salvando && (
                                        <span className="perfil-spinner" aria-hidden="true" />
                                    )}
                                    {salvando ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>

                        </div>

                    </div>
                </fieldset>
            </form>
        </section>
    );
}

export default Perfil;
