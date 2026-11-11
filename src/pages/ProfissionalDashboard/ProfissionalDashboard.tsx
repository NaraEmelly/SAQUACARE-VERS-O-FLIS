import { useState, useEffect, useMemo, useRef } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import "../Agendamentos/Agendamentos.css";
import "../Perfil/Perfil.css";
import "./ProfissionalDashboard.css";

import logo from "../../assets/logos/logo-saquacare.png";
import {
    ESPECIALIDADES,
    UNIDADES_SAQUAREMA,
} from "../../services/agendamentoService";
import {
    carregarFilaAtendimentos,
    carregarProfissionais,
    obterProfissionalLogado,
    logoutProfissional,
    atualizarStatusAtendimento,
    chamarProximoDaFila,
    registrarEvolucaoProntuario,
    remarcarAtendimento,
    encaminharPacienteEspecialidade,
    cadastrarProfissionalRH,
    alternarAtivoProfissionalRH,
    resetarSenhaProfissionalRH,
    atualizarPerfilProfissional,
    FILA_ATUALIZADA_EVENTO,
} from "../../services/profissionalService";
import type {
    DadosTriagem,
    ItemFilaAtendimento,
    ProfissionalSaude,
    StatusFila,
    TipoProfissional,
} from "../../services/profissionalService";

type IconName =
    | "usuario"
    | "documento"
    | "camera"
    | "lixeira"
    | "check"
    | "alerta"
    | "sair";


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
    sair: <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />,
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

const MENU_PROFISSIONAL = [
    {
        id: "fila",
        label: "Minha Fila",
        icon: "≋",
    },
    {
        id: "calendario",
        label: "Agenda",
        icon: "▣",
    },
    {
        id: "pacientes",
        label: "Meus Pacientes",
        icon: "♙",
    },
    {
        id: "rh",
        label: "Gestão Interna / RH",
        icon: "⚙",
    },
];

const HORARIOS_REMARCACAO = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:15",
    "11:00",
    "13:30",
    "14:15",
    "15:00",
    "16:00",
];

function classeBadgeStatus(status: StatusFila): string {
    switch (status) {
        case "Aguardando":
            return "fila-status-badge aguardando";
        case "Em Triagem":
            return "fila-status-badge triagem";
        case "Em Atendimento":
            return "fila-status-badge atendimento";
        case "Finalizado":
            return "fila-status-badge finalizado";
        case "Falta":
            return "fila-status-badge falta";
    }
}

export default function ProfissionalDashboard() {
    const navigate = useNavigate();

    const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
    const [profissionalAtual, setProfissionalAtual] =
        useState<ProfissionalSaude | null>(null);
    const [fila, setFila] = useState<ItemFilaAtendimento[]>([]);
    const [abaAtiva, setAbaAtiva] = useState<string>("fila");
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");
    const [busca, setBusca] = useState<string>("");
    const [visaoCalendario, setVisaoCalendario] = useState<"semanal" | "mensal">(
        "semanal"
    );
    const [filtroEspecialidadeRH, setFiltroEspecialidadeRH] =
        useState<string>("todas");
    const [feedback, setFeedback] = useState<string | null>(null);

    const [atendimentoSelecionado, setAtendimentoSelecionado] =
        useState<ItemFilaAtendimento | null>(null);
    const [diagnostico, setDiagnostico] = useState("");
    const [prescricao, setPrescricao] = useState("");
    const [observacoesEvolucao, setObservacoesEvolucao] = useState("");
    const [novaAlergia, setNovaAlergia] = useState("");
    const [pressaoArterial, setPressaoArterial] = useState("");
    const [temperatura, setTemperatura] = useState("");
    const [saturacao, setSaturacao] = useState("");
    const [classificacaoRisco, setClassificacaoRisco] =
        useState<NonNullable<DadosTriagem["classificacaoRisco"]>>(
            "Pouco Urgente (Verde)"
        );

    const inputFotoProfRef = useRef<HTMLInputElement>(null);
    const [perfilNome, setPerfilNome] = useState("");
    const [perfilEmail, setPerfilEmail] = useState("");
    const [perfilTelefone, setPerfilTelefone] = useState("");
    const [perfilFoto, setPerfilFoto] = useState("");
    const [novaSenhaPerfil, setNovaSenhaPerfil] = useState("");
    const [confirmarSenhaPerfil, setConfirmarSenhaPerfil] = useState("");
    const [erroPerfil, setErroPerfil] = useState<string | null>(null);

    const [modalRemarcarItem, setModalRemarcarItem] =
        useState<ItemFilaAtendimento | null>(null);
    const [novaDataRemarcacao, setNovaDataRemarcacao] = useState("");
    const [novoHorarioRemarcacao, setNovoHorarioRemarcacao] = useState("09:30");

    const [modalEncaminharItem, setModalEncaminharItem] =
        useState<ItemFilaAtendimento | null>(null);
    const [especialidadeDestino, setEspecialidadeDestino] = useState("Ortopedia");
    const [unidadeDestino, setUnidadeDestino] = useState(
        UNIDADES_SAQUAREMA[0].nome
    );
    const [motivoEncaminhamento, setMotivoEncaminhamento] = useState("");

    const [modalNovoProfAberto, setModalNovoProfAberto] = useState(false);
    const [rhMatricula, setRhMatricula] = useState("");
    const [rhNome, setRhNome] = useState("");
    const [rhCpf, setRhCpf] = useState("");
    const [rhTipo, setRhTipo] = useState<TipoProfissional>("Médico");
    const [rhEspecialidade, setRhEspecialidade] = useState(ESPECIALIDADES[0]);
    const [rhConselho, setRhConselho] = useState("");
    const [rhUnidade, setRhUnidade] = useState(UNIDADES_SAQUAREMA[0].nome);
    const [rhEmail, setRhEmail] = useState("");
    const [rhSenhaTemp, setRhSenhaTemp] = useState("saqua@2026");
    const [rhCargaHoraria, setRhCargaHoraria] = useState(30);
    const [erroRH, setErroRH] = useState<string | null>(null);

    const recarregarDados = () => {
        const listaProfs = carregarProfissionais();
        setProfissionais(listaProfs);
        const logado = obterProfissionalLogado() || listaProfs[0];
        setProfissionalAtual(logado);
        if (logado) {
            setPerfilNome(logado.nome);
            setPerfilEmail(logado.emailInstitucional);
            setPerfilTelefone(logado.telefone || "(22) 99800-0000");
            setPerfilFoto(logado.foto || "");
        }
        setFila(carregarFilaAtendimentos());
    };

    useEffect(() => {
        recarregarDados();
        window.addEventListener(FILA_ATUALIZADA_EVENTO, recarregarDados);
        return () => {
            window.removeEventListener(FILA_ATUALIZADA_EVENTO, recarregarDados);
        };
    }, []);

    const mostrarNotificacao = (msg: string) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(null), 5000);
    };

    const hojeIso = useMemo(() => {
        const d = new Date();
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }, []);

    const filaDoProfissional = useMemo(() => {
        if (!profissionalAtual) return fila;
        if (
            profissionalAtual.tipoProfissional === "Equipe Interna / RH" ||
            profissionalAtual.tipoProfissional === "Enfermeiro"
        ) {
            return fila;
        }
        return fila.filter(
            (item) =>
                item.profissionalMatricula === profissionalAtual.matricula ||
                item.especialidade === profissionalAtual.especialidade
        );
    }, [fila, profissionalAtual]);

    const filaDeHoje = useMemo(() => {
        return filaDoProfissional.filter((item) => item.dataIso === hojeIso);
    }, [filaDoProfissional, hojeIso]);

    const filaFiltradaHoje = useMemo(() => {
        return filaDeHoje.filter((item) => {
            if (filtroStatus !== "todos" && item.status !== filtroStatus) {
                return false;
            }
            if (busca.trim()) {
                const termo = busca.toLowerCase();
                return (
                    item.paciente.nome.toLowerCase().includes(termo) ||
                    item.senhaFila.toLowerCase().includes(termo) ||
                    item.protocolo.toLowerCase().includes(termo) ||
                    item.motivoConsulta.toLowerCase().includes(termo)
                );
            }
            return true;
        });
    }, [filaDeHoje, filtroStatus, busca]);

    const metricasHoje = useMemo(() => {
        const aguardando = filaDeHoje.filter(
            (i) => i.status === "Aguardando" || i.status === "Em Triagem"
        ).length;
        const emAtendimento = filaDeHoje.find(
            (i) => i.status === "Em Atendimento"
        );
        const finalizados = filaDeHoje.filter(
            (i) => i.status === "Finalizado"
        ).length;
        const tempoMedio =
            filaDeHoje.length > 0
                ? Math.round(
                      filaDeHoje.reduce(
                          (acc, cur) => acc + (cur.tempoEsperaMinutos || 15),
                          0
                      ) / filaDeHoje.length
                  )
                : 15;
        return { aguardando, emAtendimento, finalizados, tempoMedio };
    }, [filaDeHoje]);

    const pacientesVinculados = useMemo(() => {
        const mapa = new Map<number, ItemFilaAtendimento>();
        filaDoProfissional.forEach((item) => {
            if (!mapa.has(item.paciente.id)) {
                mapa.set(item.paciente.id, item);
            }
        });
        return Array.from(mapa.values());
    }, [filaDoProfissional]);

    const handleChamarProximo = () => {
        const { chamado } = chamarProximoDaFila(profissionalAtual?.matricula);
        recarregarDados();
        if (chamado) {
            mostrarNotificacao(
                `Senha ${chamado.senhaFila} (${chamado.paciente.nome}) chamada para atendimento!`
            );
        } else {
            mostrarNotificacao(
                "Não há pacientes aguardando ou em triagem na fila de hoje."
            );
        }
    };

    const handleMudarStatus = (item: ItemFilaAtendimento, novoStatus: StatusFila) => {
        atualizarStatusAtendimento(item.id, novoStatus);
        recarregarDados();
        mostrarNotificacao(
            `Status de ${item.paciente.nome} (${item.senhaFila}) atualizado para "${novoStatus}".`
        );
    };

    const abrirFichaPaciente = (item: ItemFilaAtendimento) => {
        setAtendimentoSelecionado(item);
        setDiagnostico("");
        setPrescricao("");
        setObservacoesEvolucao("");
        setNovaAlergia("");
        setPressaoArterial(item.triagem?.pressaoArterial || "");
        setTemperatura(item.triagem?.temperatura || "");
        setSaturacao(item.triagem?.saturacao || "");
        setClassificacaoRisco(
            item.triagem?.classificacaoRisco || "Pouco Urgente (Verde)"
        );
    };

    const handleSalvarEvolucao = (e: React.FormEvent, finalizar: boolean) => {
        e.preventDefault();
        if (!atendimentoSelecionado) return;
        const temTriagem =
            pressaoArterial.trim() || temperatura.trim() || saturacao.trim();
        if (
            !diagnostico.trim() &&
            !observacoesEvolucao.trim() &&
            !temTriagem
        ) {
            alert(
                "Preencha ao menos os sinais vitais da triagem, avaliação/diagnóstico ou evolução clínica."
            );
            return;
        }

        registrarEvolucaoProntuario({
            atendimentoId: atendimentoSelecionado.id,
            diagnostico:
                diagnostico.trim() ||
                (profissionalAtual?.tipoProfissional === "Enfermeiro"
                    ? "Triagem de enfermagem realizada"
                    : "Evolução clínica registrada"),
            prescricao: prescricao.trim() || "Conduta mantida",
            observacoes: observacoesEvolucao.trim(),
            alergiaNova: novaAlergia.trim() || undefined,
            triagem: temTriagem
                ? {
                      pressaoArterial: pressaoArterial.trim(),
                      temperatura: temperatura.trim(),
                      saturacao: saturacao.trim(),
                      classificacaoRisco,
                  }
                : undefined,
            finalizarAtendimento: finalizar,
        });

        recarregarDados();
        setAtendimentoSelecionado(null);
        mostrarNotificacao(
            finalizar
                ? `Prontuário atualizado e atendimento de ${atendimentoSelecionado.paciente.nome} finalizado!`
                : `Evolução clínica adicionada ao prontuário de ${atendimentoSelecionado.paciente.nome}!`
        );
    };

    const handleFotoProfissional = (e: ChangeEvent<HTMLInputElement>) => {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        if (!arquivo) return;
        if (!arquivo.type.startsWith("image/")) {
            setErroPerfil("Escolha um arquivo de imagem válido (JPG ou PNG).");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setPerfilFoto(reader.result);
                setErroPerfil(null);
            }
        };
        reader.readAsDataURL(arquivo);
    };

    const handleSalvarPerfilProfissional = (e: React.FormEvent) => {
        e.preventDefault();
        setErroPerfil(null);
        if (!profissionalAtual) return;
        if (!perfilNome.trim() || !perfilEmail.trim()) {
            setErroPerfil("Nome completo e e-mail institucional são obrigatórios.");
            return;
        }
        if (novaSenhaPerfil.trim()) {
            if (novaSenhaPerfil.trim().length < 6) {
                setErroPerfil("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }
            if (novaSenhaPerfil !== confirmarSenhaPerfil) {
                setErroPerfil("A confirmação de senha não confere.");
                return;
            }
        }

        try {
            atualizarPerfilProfissional(profissionalAtual.id, {
                nome: perfilNome,
                emailInstitucional: perfilEmail,
                telefone: perfilTelefone,
                foto: perfilFoto,
                novaSenha: novaSenhaPerfil.trim() || undefined,
            });
            setNovaSenhaPerfil("");
            setConfirmarSenhaPerfil("");
            recarregarDados();
            mostrarNotificacao("Dados do seu perfil atualizados com sucesso!");
        } catch (err: any) {
            setErroPerfil(err?.message || "Não foi possível salvar o perfil.");
        }
    };

    const handleConfirmarRemarcacao = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalRemarcarItem || !novaDataRemarcacao) return;
        remarcarAtendimento(
            modalRemarcarItem.id,
            novaDataRemarcacao,
            novoHorarioRemarcacao
        );
        recarregarDados();
        mostrarNotificacao(
            `Atendimento de ${modalRemarcarItem.paciente.nome} remarcado para ${novaDataRemarcacao} às ${novoHorarioRemarcacao}.`
        );
        setModalRemarcarItem(null);
    };

    const handleConfirmarEncaminhamento = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalEncaminharItem) return;
        const criado = encaminharPacienteEspecialidade(
            modalEncaminharItem,
            especialidadeDestino,
            unidadeDestino,
            motivoEncaminhamento.trim() || "Avaliação especializada complementar"
        );
        recarregarDados();
        mostrarNotificacao(
            `Paciente ${modalEncaminharItem.paciente.nome} encaminhado para ${especialidadeDestino} (Senha ${criado.senhaFila})!`
        );
        setModalEncaminharItem(null);
        setMotivoEncaminhamento("");
    };

    const handleCadastrarProfissionalRH = (e: React.FormEvent) => {
        e.preventDefault();
        setErroRH(null);
        if (!rhMatricula.trim() || !rhNome.trim() || !rhCpf.trim()) {
            setErroRH("Preencha Matrícula, Nome e CPF do profissional.");
            return;
        }
        try {
            const novo = cadastrarProfissionalRH({
                matricula: rhMatricula,
                nome: rhNome,
                cpf: rhCpf,
                tipoProfissional: rhTipo,
                especialidade: rhEspecialidade,
                registroConselho: rhConselho || "Registro Institucional",
                unidade: rhUnidade,
                emailInstitucional:
                    rhEmail ||
                    `${rhMatricula.toLowerCase()}@saquacare.gov.br`,
                senhaTemporariaValor: rhSenhaTemp || "saqua@2026",
                cargaHorariaSemanal: rhCargaHoraria,
            });
            recarregarDados();
            setModalNovoProfAberto(false);
            setRhMatricula("");
            setRhNome("");
            setRhCpf("");
            setRhConselho("");
            setRhEmail("");
            mostrarNotificacao(
                `Matrícula ${novo.matricula} (${novo.nome}) cadastrada com sucesso!`
            );
        } catch (err: any) {
            setErroRH(err?.message || "Erro ao cadastrar profissional.");
        }
    };

    const handleSair = () => {
        logoutProfissional();
        navigate("/landingpage");
    };

    const inicialProf = (profissionalAtual?.nome || "P")
        .replace(/^(Dr\.|Dra\.|Enf\.)\s*/i, "")
        .charAt(0)
        .toUpperCase();

    const camposPerfil = [perfilNome, perfilEmail, perfilTelefone, perfilFoto];
    const preenchidosPerfil = camposPerfil.filter((v) => v.trim() !== "").length;
    const porcentagemPerfil = Math.round(
        (preenchidosPerfil / camposPerfil.length) * 100
    );

    return (
        <div className="dashboard prof-dashboard">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={logo} alt="SaquaCare" />
                </div>

                <nav className="sidebar-menu" aria-label="Navegação da área profissional">
                    <p className="menu-title">MENU</p>

                    {MENU_PROFISSIONAL.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={
                                abaAtiva === item.id
                                    ? "menu-item active"
                                    : "menu-item"
                            }
                            aria-current={abaAtiva === item.id ? "page" : undefined}
                            onClick={() => setAbaAtiva(item.id)}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className={
                            abaAtiva === "perfil"
                                ? "menu-item menu-item--perfil active"
                                : "menu-item menu-item--perfil"
                        }
                        aria-current={abaAtiva === "perfil" ? "page" : undefined}
                        onClick={() => setAbaAtiva("perfil")}
                    >
                        <span className="menu-icon">⚙</span>
                        <span>Meu perfil</span>
                    </button>

                    <button
                        type="button"
                        className="menu-item menu-item--sair"
                        onClick={handleSair}
                    >
                        <span className="menu-icon" aria-hidden="true">
                            <Icon name="sair" size={18} />
                        </span>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <div className="dashboard-main">
                <header className="topbar">
                    <div className="search-box">
                        <span>🔎</span>
                        <input
                            type="text"
                            aria-label="Buscar paciente por nome, senha da fila ou protocolo"
                            placeholder="Buscar paciente por nome, senha da fila ou protocolo..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="notification"
                        aria-label="Notificações da demonstração"
                    >
                        🔔
                    </button>

                    <div
                        className="profile"
                        role="button"
                        tabIndex={0}
                        aria-label="Abrir meu perfil"
                        style={{ cursor: "pointer" }}
                        onClick={() => setAbaAtiva("perfil")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setAbaAtiva("perfil");
                            }
                        }}
                    >
                        <div className="profile-avatar">
                            {profissionalAtual?.foto ? (
                                <img
                                    src={profissionalAtual.foto}
                                    alt="Foto de perfil"
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                    }}
                                />
                            ) : (
                                inicialProf
                            )}
                        </div>
                        <div className="profile-info">
                            <strong>
                                {profissionalAtual?.nome ||
                                    "Dr. Carlos Eduardo Ribeiro"}
                            </strong>
                            <span>
                                {profissionalAtual?.matricula || "MED-2026"} ·{" "}
                                {profissionalAtual?.tipoProfissional || "Médico"}
                            </span>
                        </div>
                    </div>
                </header>

                <main className="content">
                    <p className="demo-mode-notice" role="note">
                        Demonstração profissional: dados fictícios, salvos apenas
                        neste navegador. Não insira informações reais de pacientes.
                    </p>
                    {feedback && (
                        <div className="ag-alert ag-alert--sucesso" role="status" aria-live="polite">
                            <span>✓</span> {feedback}
                        </div>
                    )}

                    {/* ABA 1: MINHA FILA */}
                    {abaAtiva === "fila" && (
                        <>
                            <div className="welcome">
                                <span className="welcome-small">
                                    Início / Minha Fila ·{" "}
                                    {profissionalAtual?.unidade}
                                </span>
                                <p>
                                    {profissionalAtual?.especialidade} ·{" "}
                                    {profissionalAtual?.registroConselho}
                                </p>
                                <h1>Fila de Atendimento</h1>
                            </div>

                            <section className="summary-grid">
                                <div className="summary-card blue">
                                    <span className="summary-icon">🔊</span>
                                    <div>
                                        <span className="summary-label">
                                            Em Atendimento Agora
                                        </span>
                                        <strong>
                                            {metricasHoje.emAtendimento
                                                ? `${metricasHoje.emAtendimento.senhaFila} · ${metricasHoje.emAtendimento.paciente.nome.split(" ")[0]}`
                                                : "Consultório livre"}
                                        </strong>
                                        <small>
                                            {metricasHoje.emAtendimento
                                                ? `Horário: ${metricasHoje.emAtendimento.horario} · ${metricasHoje.emAtendimento.tipoAtendimento}`
                                                : "Chame o próximo paciente da fila"}
                                        </small>
                                    </div>
                                </div>

                                <div className="summary-card teal">
                                    <span className="summary-icon">⏱</span>
                                    <div>
                                        <span className="summary-label">
                                            Aguardando / Triagem
                                        </span>
                                        <strong>
                                            {metricasHoje.aguardando} pacientes
                                        </strong>
                                        <small>
                                            Espera média estimada:{" "}
                                            {metricasHoje.tempoMedio} min
                                        </small>
                                    </div>
                                </div>

                                <div className="summary-card light">
                                    <span className="summary-icon">✓</span>
                                    <div>
                                        <span className="summary-label">
                                            Atendimentos Finalizados
                                        </span>
                                        <strong>
                                            {metricasHoje.finalizados} de{" "}
                                            {filaDeHoje.length}
                                        </strong>
                                        <small>
                                            Hoje · {profissionalAtual?.unidade}
                                        </small>
                                    </div>
                                </div>
                            </section>

                            <section className="prof-call-banner">
                                <div className="prof-call-ticket">
                                    <div className="prof-ticket-badge">
                                        <small>SENHA</small>
                                        <strong>
                                            {metricasHoje.emAtendimento
                                                ?.senhaFila || "—"}
                                        </strong>
                                    </div>
                                    <div className="prof-call-info">
                                        <span>CHAMADA ATUAL</span>
                                        <h2>
                                            {metricasHoje.emAtendimento
                                                ? `Paciente: ${metricasHoje.emAtendimento.paciente.nome}`
                                                : "Nenhum paciente em atendimento no momento"}
                                        </h2>
                                        <p>
                                            {metricasHoje.emAtendimento
                                                ? `Motivo: ${metricasHoje.emAtendimento.motivoConsulta}`
                                                : "Clique no botão ao lado para chamar o próximo paciente da fila."}
                                        </p>
                                    </div>
                                </div>

                                <div className="prof-call-actions">
                                    {metricasHoje.emAtendimento && (
                                        <button
                                            type="button"
                                            className="ag-btn-outline"
                                            onClick={() =>
                                                abrirFichaPaciente(
                                                    metricasHoje.emAtendimento!
                                                )
                                            }
                                        >
                                            📋 Ver Prontuário
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="prof-btn-call"
                                        onClick={handleChamarProximo}
                                    >
                                        Chamar Próximo da Fila
                                    </button>
                                </div>
                            </section>

                            <div className="ag-controls">
                                <div className="ag-filter-tabs">
                                    {[
                                        { id: "todos", label: "Todos" },
                                        { id: "Aguardando", label: "Aguardando" },
                                        { id: "Em Triagem", label: "Em Triagem" },
                                        {
                                            id: "Em Atendimento",
                                            label: "Em Atendimento",
                                        },
                                        { id: "Finalizado", label: "Finalizado" },
                                        { id: "Falta", label: "Falta" },
                                    ].map((st) => (
                                        <button
                                            key={st.id}
                                            type="button"
                                            className={`ag-tab-btn ${
                                                filtroStatus === st.id
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setFiltroStatus(st.id)
                                            }
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="table-card">
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Senha</th>
                                                <th>Horário</th>
                                                <th>Paciente</th>
                                                <th>Motivo da Consulta</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filaFiltradaHoje.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        style={{
                                                            textAlign: "center",
                                                            padding: "32px",
                                                        }}
                                                    >
                                                        Nenhum atendimento
                                                        encontrado para este
                                                        filtro hoje.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filaFiltradaHoje.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <span className="fila-senha-pill">
                                                                {item.senhaFila}
                                                            </span>
                                                        </td>
                                                        <td className="date">
                                                            {item.horario}
                                                        </td>
                                                        <td>
                                                            <strong
                                                                style={{
                                                                    color: "var(--color-text)",
                                                                    display:
                                                                        "block",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() =>
                                                                    abrirFichaPaciente(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    item.paciente
                                                                        .nome
                                                                }
                                                            </strong>
                                                            <small>
                                                                {
                                                                    item.paciente
                                                                        .idade
                                                                }{" "}
                                                                anos · SUS:{" "}
                                                                {
                                                                    item.paciente
                                                                        .cartaoSus
                                                                }
                                                            </small>
                                                            {item.paciente.alergias.some(
                                                                (a) =>
                                                                    !a
                                                                        .toLowerCase()
                                                                        .includes(
                                                                            "nenhuma"
                                                                        )
                                                            ) && (
                                                                <div>
                                                                    <span className="fila-alergia-tag">
                                                                        Alergia:{" "}
                                                                        {item.paciente.alergias.join(
                                                                            ", "
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <strong
                                                                style={{
                                                                    color: "var(--color-primary)",
                                                                    fontSize:
                                                                        "0.74rem",
                                                                }}
                                                            >
                                                                {
                                                                    item.tipoAtendimento
                                                                }{" "}
                                                                ·{" "}
                                                                {
                                                                    item.especialidade
                                                                }
                                                            </strong>
                                                            <p
                                                                style={{
                                                                    margin: "2px 0 0",
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "var(--color-text-secondary)",
                                                                }}
                                                            >
                                                                {
                                                                    item.motivoConsulta
                                                                }
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={classeBadgeStatus(
                                                                    item.status
                                                                )}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="fila-actions-row">
                                                                <button
                                                                    type="button"
                                                                    className="fila-action-btn primary"
                                                                    onClick={() =>
                                                                        abrirFichaPaciente(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    Ficha / Prontuário
                                                                </button>

                                                                {item.status ===
                                                                    "Aguardando" && (
                                                                    <button
                                                                        type="button"
                                                                        className="fila-action-btn"
                                                                        onClick={() =>
                                                                            handleMudarStatus(
                                                                                item,
                                                                                "Em Triagem"
                                                                            )
                                                                        }
                                                                    >
                                                                        Triagem
                                                                    </button>
                                                                )}

                                                                {(item.status ===
                                                                    "Aguardando" ||
                                                                    item.status ===
                                                                        "Em Triagem") && (
                                                                    <button
                                                                        type="button"
                                                                        className="fila-action-btn success"
                                                                        onClick={() =>
                                                                            handleMudarStatus(
                                                                                item,
                                                                                "Em Atendimento"
                                                                            )
                                                                        }
                                                                    >
                                                                        Iniciar
                                                                    </button>
                                                                )}

                                                                {item.status ===
                                                                    "Em Atendimento" && (
                                                                    <button
                                                                        type="button"
                                                                        className="fila-action-btn success"
                                                                        onClick={() =>
                                                                            handleMudarStatus(
                                                                                item,
                                                                                "Finalizado"
                                                                            )
                                                                        }
                                                                    >
                                                                        Finalizar
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className="fila-action-btn"
                                                                    onClick={() => {
                                                                        setModalRemarcarItem(
                                                                            item
                                                                        );
                                                                        setNovaDataRemarcacao(
                                                                            item.dataIso
                                                                        );
                                                                        setNovoHorarioRemarcacao(
                                                                            item.horario
                                                                        );
                                                                    }}
                                                                >
                                                                    Remarcar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="fila-action-btn"
                                                                    onClick={() =>
                                                                        setModalEncaminharItem(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    Encaminhar
                                                                </button>

                                                                {item.status !==
                                                                    "Finalizado" &&
                                                                    item.status !==
                                                                        "Falta" && (
                                                                        <button
                                                                            type="button"
                                                                            className="fila-action-btn danger"
                                                                            onClick={() =>
                                                                                handleMudarStatus(
                                                                                    item,
                                                                                    "Falta"
                                                                                )
                                                                            }
                                                                        >
                                                                            Falta
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ABA 2: CALENDÁRIO SEMANAL / MENSAL */}
                    {abaAtiva === "calendario" && (
                        <>
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Início / Minha Agenda
                                    </span>
                                    <h1>Calendário de Agendamentos</h1>
                                    <p>
                                        Consulte seus atendimentos programados
                                        por semana ou mês.
                                    </p>
                                </div>

                                <div className="ag-filter-tabs">
                                    <button
                                        type="button"
                                        className={`ag-tab-btn ${
                                            visaoCalendario === "semanal"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setVisaoCalendario("semanal")
                                        }
                                    >
                                        Semana
                                    </button>
                                    <button
                                        type="button"
                                        className={`ag-tab-btn ${
                                            visaoCalendario === "mensal"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setVisaoCalendario("mensal")
                                        }
                                    >
                                        Mês
                                    </button>
                                </div>
                            </div>

                            <div className="prof-calendar-grid">
                                {Array.from(
                                    new Set(
                                        filaDoProfissional.map((i) => i.data)
                                    )
                                )
                                    .slice(
                                        0,
                                        visaoCalendario === "semanal" ? 5 : 12
                                    )
                                    .map((dataBr) => {
                                        const itensDia =
                                            filaDoProfissional.filter(
                                                (i) => i.data === dataBr
                                            );
                                        return (
                                            <div
                                                key={dataBr}
                                                className="prof-day-column"
                                            >
                                                <div className="prof-day-header">
                                                    <strong>📅 {dataBr}</strong>
                                                    <span>
                                                        {itensDia.length}{" "}
                                                        consulta(s)
                                                    </span>
                                                </div>

                                                {itensDia.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="prof-slot-item"
                                                        onClick={() =>
                                                            abrirFichaPaciente(
                                                                slot
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            <strong
                                                                style={{
                                                                    color: "var(--color-primary-dark)",
                                                                    fontSize:
                                                                        "0.82rem",
                                                                }}
                                                            >
                                                                {slot.horario} ·{" "}
                                                                {slot.senhaFila}
                                                            </strong>
                                                            <span
                                                                className={classeBadgeStatus(
                                                                    slot.status
                                                                )}
                                                            >
                                                                {slot.status}
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "0.82rem",
                                                                fontWeight: 600,
                                                                color: "var(--color-text)",
                                                            }}
                                                        >
                                                            {slot.paciente.nome}
                                                        </div>
                                                        <small
                                                            style={{
                                                                color: "var(--color-text-secondary)",
                                                                fontSize:
                                                                    "0.72rem",
                                                            }}
                                                        >
                                                            {
                                                                slot.tipoAtendimento
                                                            }{" "}
                                                            ·{" "}
                                                            {slot.especialidade}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}

                    {/* ABA 3: PACIENTES VINCULADOS */}
                    {abaAtiva === "pacientes" && (
                        <>
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Início / Meus Pacientes
                                    </span>
                                    <h1>Pacientes Vinculados</h1>
                                    <p>
                                        Histórico clínico resumido e prontuário
                                        dos pacientes em acompanhamento.
                                    </p>
                                </div>
                            </div>

                            <div className="ag-list-grid">
                                {pacientesVinculados.map((item) => (
                                    <div key={item.paciente.id} className="ag-card">
                                        <div>
                                            <div className="ag-card-top">
                                                <span className="ag-type-tag">
                                                    SUS:{" "}
                                                    {item.paciente.cartaoSus}
                                                </span>
                                                <span className="ag-protocolo">
                                                    CPF:{" "}
                                                    {item.paciente.cpfMascarado}
                                                </span>
                                            </div>

                                            <h3 className="ag-card-title">
                                                {item.paciente.nome}
                                            </h3>
                                            <p className="ag-card-professional">
                                                🎂 {item.paciente.dataNascimento}{" "}
                                                ({item.paciente.idade} anos) · 📞{" "}
                                                {item.paciente.telefone}
                                            </p>

                                            <div className="ag-card-details">
                                                <div className="ag-detail-row">
                                                    <span className="ag-detail-icon">
                                                        ⚠️
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            Alergias:
                                                        </strong>{" "}
                                                        {item.paciente.alergias.join(
                                                            ", "
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="ag-detail-row">
                                                    <span className="ag-detail-icon">
                                                        🩺
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            Último registro:
                                                        </strong>{" "}
                                                        {item.paciente
                                                            .historicoConsultas[0] ||
                                                            "Sem registros anteriores"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ag-card-actions">
                                            <button
                                                type="button"
                                                className="ag-btn-primary"
                                                style={{
                                                    width: "100%",
                                                    justifyContent: "center",
                                                }}
                                                onClick={() =>
                                                    abrirFichaPaciente(item)
                                                }
                                            >
                                                Abrir Prontuário
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ABA 4: GESTÃO INTERNA / RH */}
                    {abaAtiva === "rh" && (
                        <>
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Administração / Recursos Humanos
                                    </span>
                                    <h1>Gestão de Profissionais e Filas</h1>
                                    <p>
                                        Controle de matrículas da equipe de
                                        saúde, painel geral de filas da unidade
                                        e indicadores de atendimento.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="ag-btn-primary"
                                    onClick={() => {
                                        setErroRH(null);
                                        setModalNovoProfAberto(true);
                                    }}
                                >
                                    <span>+</span> Cadastrar Profissional
                                </button>
                            </div>

                            <div className="ag-stats-grid">
                                <div className="ag-stat-card">
                                    <div className="ag-stat-icon agendada">
                                        👨‍⚕️
                                    </div>
                                    <div className="ag-stat-info">
                                        <h3>
                                            {
                                                profissionais.filter(
                                                    (p) => p.ativo
                                                ).length
                                            }{" "}
                                            / {profissionais.length}
                                        </h3>
                                        <span>Matrículas Ativas</span>
                                    </div>
                                </div>

                                <div className="ag-stat-card">
                                    <div className="ag-stat-icon concluida">
                                        ⏱
                                    </div>
                                    <div className="ag-stat-info">
                                        <h3>16 min</h3>
                                        <span>Tempo Médio de Espera</span>
                                    </div>
                                </div>

                                <div className="ag-stat-card">
                                    <div className="ag-stat-icon agendada">
                                        📊
                                    </div>
                                    <div className="ag-stat-info">
                                        <h3>
                                            {profissionais.filter((p) => p.ativo).length > 0
                                                ? Math.round(
                                                      profissionais
                                                          .filter((p) => p.ativo)
                                                          .reduce(
                                                              (acc, p) =>
                                                                  acc +
                                                                  p.cargaHorariaSemanal,
                                                              0
                                                          ) /
                                                          profissionais.filter(
                                                              (p) => p.ativo
                                                          ).length
                                                  )
                                                : 30}
                                            h / sem
                                        </h3>
                                        <span>Carga Horária Média</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="section-heading"
                                style={{ marginTop: 12 }}
                            >
                                <div>
                                    <span>EQUIPE DA UNIDADE</span>
                                    <h2>Profissionais Cadastrados</h2>
                                </div>
                            </div>

                            <div
                                className="table-card"
                                style={{ marginBottom: 36 }}
                            >
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Matrícula</th>
                                                <th>Nome / CPF</th>
                                                <th>Cargo / Especialidade</th>
                                                <th>Unidade / Carga Horária</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profissionais.map((prof) => {
                                                const totalAtendProf =
                                                    fila.filter(
                                                        (f) =>
                                                            f.profissionalMatricula ===
                                                            prof.matricula
                                                    ).length;
                                                return (
                                                    <tr key={prof.id}>
                                                        <td>
                                                            <span className="fila-senha-pill">
                                                                {prof.matricula}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <strong
                                                                style={{
                                                                    color: "var(--color-text)",
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {prof.nome}
                                                            </strong>
                                                            <small>
                                                                CPF: {prof.cpf}{" "}
                                                                ·{" "}
                                                                {
                                                                    prof.emailInstitucional
                                                                }
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <strong
                                                                style={{
                                                                    color: "var(--color-primary)",
                                                                }}
                                                            >
                                                                {
                                                                    prof.tipoProfissional
                                                                }
                                                            </strong>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.74rem",
                                                                }}
                                                            >
                                                                {
                                                                    prof.especialidade
                                                                }{" "}
                                                                (
                                                                {
                                                                    prof.registroConselho
                                                                }
                                                                )
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {prof.unidade}
                                                            </div>
                                                            <small>
                                                                {
                                                                    prof.cargaHorariaSemanal
                                                                }
                                                                h semanais ·{" "}
                                                                {totalAtendProf}{" "}
                                                                atendimentos
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={
                                                                    prof.ativo
                                                                        ? "fila-status-badge atendimento"
                                                                        : "fila-status-badge falta"
                                                                }
                                                            >
                                                                {prof.ativo
                                                                    ? "Ativo"
                                                                    : "Inativo"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="fila-actions-row">
                                                                <button
                                                                    type="button"
                                                                    className="fila-action-btn"
                                                                    onClick={() => {
                                                                        resetarSenhaProfissionalRH(
                                                                            prof.id,
                                                                            "saqua@2026"
                                                                        );
                                                                        recarregarDados();
                                                                        mostrarNotificacao(
                                                                            `Senha temporária da matrícula ${prof.matricula} redefinida.`
                                                                        );
                                                                    }}
                                                                >
                                                                    Redefinir Senha
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        prof.ativo
                                                                            ? "fila-action-btn danger"
                                                                            : "fila-action-btn success"
                                                                    }
                                                                    onClick={() => {
                                                                        alternarAtivoProfissionalRH(
                                                                            prof.id
                                                                        );
                                                                        recarregarDados();
                                                                        mostrarNotificacao(
                                                                            `Status da matrícula ${prof.matricula} atualizado.`
                                                                        );
                                                                    }}
                                                                >
                                                                    {prof.ativo
                                                                        ? "Desativar"
                                                                        : "Ativar"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="section-heading">
                                <div>
                                    <span>VISÃO GERAL</span>
                                    <h2>Filas por Especialidade</h2>
                                </div>

                                <select
                                    value={filtroEspecialidadeRH}
                                    onChange={(e) =>
                                        setFiltroEspecialidadeRH(e.target.value)
                                    }
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "10px",
                                        border: "1px solid var(--color-border-strong)",
                                        fontFamily: "inherit",
                                        fontSize: "0.82rem",
                                    }}
                                >
                                    <option value="todas">
                                        Todas as Especialidades
                                    </option>
                                    {ESPECIALIDADES.map((esp) => (
                                        <option key={esp} value={esp}>
                                            {esp}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="table-card">
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Senha / Data</th>
                                                <th>Especialidade</th>
                                                <th>Profissional</th>
                                                <th>Paciente</th>
                                                <th>Unidade</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fila
                                                .filter(
                                                    (f) =>
                                                        filtroEspecialidadeRH ===
                                                            "todas" ||
                                                        f.especialidade ===
                                                            filtroEspecialidadeRH
                                                )
                                                .map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <span className="fila-senha-pill">
                                                                {item.senhaFila}
                                                            </span>{" "}
                                                            <small>
                                                                {item.data} às{" "}
                                                                {item.horario}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.especialidade
                                                                }
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            {
                                                                item.profissionalNome
                                                            }
                                                        </td>
                                                        <td>
                                                            {item.paciente.nome}
                                                        </td>
                                                        <td>{item.unidade}</td>
                                                        <td>
                                                            <span
                                                                className={classeBadgeStatus(
                                                                    item.status
                                                                )}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ABA 5: MEU PERFIL PROFISSIONAL */}
                    {abaAtiva === "perfil" && profissionalAtual && (
                        <section className="perfil">
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Início / Meu perfil
                                    </span>
                                    <h1>Meu perfil</h1>
                                    <p>
                                        Consulte seus dados funcionais cadastrados
                                        pela Administração e mantenha seus contatos
                                        e senha de acesso atualizados.
                                    </p>
                                </div>
                            </div>

                            {erroPerfil && (
                                <div
                                    className="ag-alert ag-alert--erro"
                                    role="alert"
                                >
                                    <Icon name="alerta" />
                                    <span>{erroPerfil}</span>
                                </div>
                            )}

                            <form
                                onSubmit={handleSalvarPerfilProfissional}
                                noValidate
                            >
                                <fieldset className="perfil-fieldset">
                                    <legend className="perfil-sr-only">
                                        Dados do perfil profissional
                                    </legend>

                                    <div className="perfil-layout">
                                        {/* Foto e resumo */}
                                        <div className="perfil-card perfil-photo">
                                            <div
                                                className="perfil-photo-banner"
                                                aria-hidden="true"
                                            />

                                            <div className="perfil-photo-body">
                                                <div className="perfil-avatar">
                                                    {perfilFoto ? (
                                                        <img
                                                            src={perfilFoto}
                                                            alt="Sua foto de perfil"
                                                        />
                                                    ) : (
                                                        <span aria-hidden="true">
                                                            {inicialProf}
                                                        </span>
                                                    )}
                                                </div>

                                                <strong className="perfil-photo-name">
                                                    {perfilNome.trim() ||
                                                        profissionalAtual.nome}
                                                </strong>

                                                <span className="perfil-photo-role">
                                                    {
                                                        profissionalAtual.tipoProfissional
                                                    }{" "}
                                                    ·{" "}
                                                    {
                                                        profissionalAtual.especialidade
                                                    }
                                                </span>

                                                <span
                                                    className="fila-senha-pill"
                                                    style={{
                                                        marginTop: -6,
                                                        marginBottom: 18,
                                                    }}
                                                >
                                                    Matrícula{" "}
                                                    {profissionalAtual.matricula}
                                                </span>

                                                <input
                                                    ref={inputFotoProfRef}
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={
                                                        handleFotoProfissional
                                                    }
                                                />

                                                <div className="perfil-photo-actions">
                                                    <button
                                                        type="button"
                                                        className="ag-btn-outline"
                                                        onClick={() =>
                                                            inputFotoProfRef.current?.click()
                                                        }
                                                    >
                                                        <Icon
                                                            name="camera"
                                                            size={16}
                                                        />
                                                        {perfilFoto
                                                            ? "Trocar foto"
                                                            : "Enviar foto"}
                                                    </button>

                                                    {perfilFoto && (
                                                        <button
                                                            type="button"
                                                            className="ag-btn-danger-text"
                                                            onClick={() =>
                                                                setPerfilFoto("")
                                                            }
                                                        >
                                                            <Icon
                                                                name="lixeira"
                                                                size={16}
                                                            />
                                                            Remover foto
                                                        </button>
                                                    )}
                                                </div>

                                                <small>
                                                    JPG ou PNG, até 8 MB.
                                                </small>

                                                <div className="perfil-completude">
                                                    <div className="perfil-completude-topo">
                                                        <span>
                                                            Perfil{" "}
                                                            {porcentagemPerfil}%
                                                            completo
                                                        </span>
                                                        <strong>
                                                            {preenchidosPerfil}/
                                                            {camposPerfil.length}
                                                        </strong>
                                                    </div>

                                                    <div
                                                        className="perfil-completude-barra"
                                                        role="progressbar"
                                                        aria-label="Perfil preenchido"
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-valuenow={
                                                            porcentagemPerfil
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                width: `${porcentagemPerfil}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <p>
                                                        {porcentagemPerfil === 100
                                                            ? "Seu perfil está completo."
                                                            : "Complete os campos que faltam para manter seu cadastro atualizado."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="perfil-card perfil-form">
                                            <div className="perfil-secao-titulo">
                                                <span
                                                    className="perfil-secao-icone"
                                                    aria-hidden="true"
                                                >
                                                    <Icon
                                                        name="documento"
                                                        size={18}
                                                    />
                                                </span>
                                                <h2>Dados funcionais</h2>
                                            </div>

                                            <div className="perfil-grid">
                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-matricula">
                                                        Matrícula funcional
                                                    </label>
                                                    <input
                                                        id="prof-perfil-matricula"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={
                                                            profissionalAtual.matricula
                                                        }
                                                        disabled
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-cargo">
                                                        Cargo / Especialidade
                                                    </label>
                                                    <input
                                                        id="prof-perfil-cargo"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={`${profissionalAtual.tipoProfissional} — ${profissionalAtual.especialidade}`}
                                                        disabled
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-conselho">
                                                        Registro no Conselho
                                                    </label>
                                                    <input
                                                        id="prof-perfil-conselho"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={
                                                            profissionalAtual.registroConselho
                                                        }
                                                        disabled
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-cpf">
                                                        CPF
                                                    </label>
                                                    <input
                                                        id="prof-perfil-cpf"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={
                                                            profissionalAtual.cpf
                                                        }
                                                        disabled
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-unidade">
                                                        Unidade de lotação
                                                    </label>
                                                    <input
                                                        id="prof-perfil-unidade"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={
                                                            profissionalAtual.unidade
                                                        }
                                                        disabled
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-carga">
                                                        Carga horária semanal
                                                    </label>
                                                    <input
                                                        id="prof-perfil-carga"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={`${profissionalAtual.cargaHorariaSemanal} horas / semana`}
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="perfil-secao-titulo perfil-secao-titulo--segunda">
                                                <span
                                                    className="perfil-secao-icone"
                                                    aria-hidden="true"
                                                >
                                                    <Icon
                                                        name="usuario"
                                                        size={18}
                                                    />
                                                </span>
                                                <h2>Contato e acesso</h2>
                                            </div>

                                            <div className="perfil-grid">
                                                <div className="perfil-field perfil-field--full">
                                                    <label htmlFor="prof-perfil-nome">
                                                        Nome completo
                                                    </label>
                                                    <input
                                                        id="prof-perfil-nome"
                                                        type="text"
                                                        className="perfil-input"
                                                        value={perfilNome}
                                                        onChange={(e) =>
                                                            setPerfilNome(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-email">
                                                        E-mail institucional
                                                    </label>
                                                    <input
                                                        id="prof-perfil-email"
                                                        type="email"
                                                        className="perfil-input"
                                                        value={perfilEmail}
                                                        onChange={(e) =>
                                                            setPerfilEmail(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-telefone">
                                                        Telefone de contato
                                                    </label>
                                                    <input
                                                        id="prof-perfil-telefone"
                                                        type="tel"
                                                        className="perfil-input"
                                                        placeholder="(22) 99999-0000"
                                                        value={perfilTelefone}
                                                        onChange={(e) =>
                                                            setPerfilTelefone(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-senha">
                                                        Nova senha de acesso
                                                        (opcional)
                                                    </label>
                                                    <input
                                                        id="prof-perfil-senha"
                                                        type="password"
                                                        className="perfil-input"
                                                        placeholder="Mínimo de 6 caracteres"
                                                        value={novaSenhaPerfil}
                                                        onChange={(e) =>
                                                            setNovaSenhaPerfil(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="perfil-field">
                                                    <label htmlFor="prof-perfil-confirma-senha">
                                                        Confirmar nova senha
                                                    </label>
                                                    <input
                                                        id="prof-perfil-confirma-senha"
                                                        type="password"
                                                        className="perfil-input"
                                                        placeholder="Repita a nova senha"
                                                        value={
                                                            confirmarSenhaPerfil
                                                        }
                                                        onChange={(e) =>
                                                            setConfirmarSenhaPerfil(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="perfil-actions">
                                                <button
                                                    type="button"
                                                    className="ag-btn-outline"
                                                    onClick={() => {
                                                        setPerfilNome(
                                                            profissionalAtual.nome
                                                        );
                                                        setPerfilEmail(
                                                            profissionalAtual.emailInstitucional
                                                        );
                                                        setPerfilTelefone(
                                                            profissionalAtual.telefone ||
                                                                "(22) 99800-0000"
                                                        );
                                                        setPerfilFoto(
                                                            profissionalAtual.foto ||
                                                                ""
                                                        );
                                                        setNovaSenhaPerfil("");
                                                        setConfirmarSenhaPerfil(
                                                            ""
                                                        );
                                                        setErroPerfil(null);
                                                    }}
                                                >
                                                    Descartar alterações
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="ag-btn-primary"
                                                >
                                                    Salvar alterações
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </form>

                        </section>
                    )}
                </main>
            </div>

            {/* MODAL 1: FICHA DO PACIENTE & PRONTUÁRIO */}
            {atendimentoSelecionado && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget)
                            setAtendimentoSelecionado(null);
                    }}
                >
                    <div className="ag-modal" style={{ maxWidth: 650 }}>
                        <div className="ag-modal-header">
                            <div>
                                <h2>
                                    Prontuário —{" "}
                                    {atendimentoSelecionado.paciente.nome}
                                </h2>
                                <small style={{ color: "var(--color-text-secondary)" }}>
                                    Senha {atendimentoSelecionado.senhaFila} ·
                                    Protocolo #
                                    {atendimentoSelecionado.protocolo}
                                </small>
                            </div>
                            <button
                                className="ag-modal-close"
                                onClick={() => setAtendimentoSelecionado(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => handleSalvarEvolucao(e, false)}
                        >
                            <div className="ag-modal-body">
                                <div className="prof-ficha-grid">
                                    <div className="prof-ficha-box">
                                        <small>Cartão SUS</small>
                                        <strong>
                                            {
                                                atendimentoSelecionado.paciente
                                                    .cartaoSus
                                            }
                                        </strong>
                                    </div>
                                    <div className="prof-ficha-box">
                                        <small>Data de Nascimento</small>
                                        <strong>
                                            {
                                                atendimentoSelecionado.paciente
                                                    .dataNascimento
                                            }{" "}
                                            (
                                            {
                                                atendimentoSelecionado.paciente
                                                    .idade
                                            }{" "}
                                            anos)
                                        </strong>
                                    </div>
                                    <div className="prof-ficha-box">
                                        <small>CPF</small>
                                        <strong>
                                            {
                                                atendimentoSelecionado.paciente
                                                    .cpfMascarado
                                            }
                                        </strong>
                                    </div>
                                    <div className="prof-ficha-box">
                                        <small>Telefone</small>
                                        <strong>
                                            {
                                                atendimentoSelecionado.paciente
                                                    .telefone
                                            }
                                        </strong>
                                    </div>
                                </div>

                                <div className="prof-alergia-banner">
                                    <strong>⚠️ Alergias:</strong>{" "}
                                    {atendimentoSelecionado.paciente.alergias.join(
                                        ", "
                                    )}
                                </div>

                                <div
                                    className="prof-ficha-box"
                                    style={{ marginBottom: 16 }}
                                >
                                    <small>Motivo da Consulta</small>
                                    <strong>
                                        {atendimentoSelecionado.motivoConsulta}
                                    </strong>
                                </div>

                                <div className="ag-form-group">
                                    <label>Histórico de Consultas</label>
                                    <ul className="prof-historico-list">
                                        {atendimentoSelecionado.paciente.historicoConsultas.map(
                                            (h, idx) => (
                                                <li key={idx}>{h}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                <hr
                                    style={{
                                        border: "none",
                                        borderTop: "1px solid var(--color-border)",
                                        margin: "18px 0",
                                    }}
                                />

                                <h3
                                    style={{
                                        color: "var(--color-primary-dark)",
                                        fontSize: "1.02rem",
                                        marginBottom: 10,
                                    }}
                                >
                                    Triagem e Sinais Vitais
                                </h3>

                                <div
                                    className="ag-form-row"
                                    style={{ marginBottom: 12 }}
                                >
                                    <div className="ag-form-group">
                                        <label>Pressão Arterial (mmHg)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 120x80 mmHg"
                                            value={pressaoArterial}
                                            onChange={(e) =>
                                                setPressaoArterial(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="ag-form-group">
                                        <label>Temperatura (°C)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 36.6 °C"
                                            value={temperatura}
                                            onChange={(e) =>
                                                setTemperatura(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div
                                    className="ag-form-row"
                                    style={{ marginBottom: 16 }}
                                >
                                    <div className="ag-form-group">
                                        <label>Saturação O₂ (%)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 98%"
                                            value={saturacao}
                                            onChange={(e) =>
                                                setSaturacao(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="ag-form-group">
                                        <label>Classificação de Risco</label>
                                        <select
                                            value={classificacaoRisco}
                                            onChange={(e) =>
                                                setClassificacaoRisco(
                                                    e.target.value as any
                                                )
                                            }
                                        >
                                            <option value="Baixo Risco (Azul)">
                                                Baixo Risco (Azul)
                                            </option>
                                            <option value="Pouco Urgente (Verde)">
                                                Pouco Urgente (Verde)
                                            </option>
                                            <option value="Urgente (Amarelo)">
                                                Urgente (Amarelo)
                                            </option>
                                            <option value="Muito Urgente (Laranja)">
                                                Muito Urgente (Laranja)
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <h3
                                    style={{
                                        color: "var(--color-primary-dark)",
                                        fontSize: "1.02rem",
                                        marginBottom: 10,
                                    }}
                                >
                                    {profissionalAtual?.tipoProfissional ===
                                    "Enfermeiro"
                                        ? "Anotação de Enfermagem"
                                        : "Evolução Médica e Conduta"}
                                </h3>

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label>Diagnóstico / Avaliação</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Hipertensão arterial controlada"
                                            value={diagnostico}
                                            onChange={(e) =>
                                                setDiagnostico(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="ag-form-group">
                                        <label>Registrar Nova Alergia</label>
                                        <input
                                            type="text"
                                            placeholder="Opcional"
                                            value={novaAlergia}
                                            onChange={(e) =>
                                                setNovaAlergia(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label>Prescrição / Conduta</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Manter medicação atual, retorno em 30 dias"
                                        value={prescricao}
                                        onChange={(e) =>
                                            setPrescricao(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="ag-form-group">
                                    <label>Evolução / Observações</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Anotações do atendimento..."
                                        value={observacoesEvolucao}
                                        onChange={(e) =>
                                            setObservacoesEvolucao(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() =>
                                        setAtendimentoSelecionado(null)
                                    }
                                >
                                    Fechar
                                </button>
                                <button
                                    type="submit"
                                    className="ag-btn-outline"
                                    style={{
                                        borderColor: "var(--color-primary)",
                                        color: "var(--color-primary-dark)",
                                    }}
                                >
                                    Salvar Evolução
                                </button>
                                <button
                                    type="button"
                                    className="ag-btn-primary"
                                    onClick={(e) =>
                                        handleSalvarEvolucao(e, true)
                                    }
                                >
                                    Salvar e Finalizar Atendimento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: REMARCAR ATENDIMENTO */}
            {modalRemarcarItem && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget)
                            setModalRemarcarItem(null);
                    }}
                >
                    <div className="ag-modal" style={{ maxWidth: 480 }}>
                        <div className="ag-modal-header">
                            <h2>Remarcar Consulta</h2>
                            <button
                                className="ag-modal-close"
                                onClick={() => setModalRemarcarItem(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleConfirmarRemarcacao}>
                            <div className="ag-modal-body">
                                <p
                                    style={{
                                        fontSize: "0.86rem",
                                        color: "var(--color-text-secondary)",
                                        marginBottom: 16,
                                    }}
                                >
                                    Paciente:{" "}
                                    <strong>
                                        {modalRemarcarItem.paciente.nome}
                                    </strong>
                                </p>

                                <div className="ag-form-group">
                                    <label>Nova Data</label>
                                    <input
                                        type="date"
                                        min={hojeIso}
                                        value={novaDataRemarcacao}
                                        onChange={(e) =>
                                            setNovaDataRemarcacao(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="ag-form-group">
                                    <label>Novo Horário</label>
                                    <div className="ag-times-grid">
                                        {HORARIOS_REMARCACAO.map((h) => (
                                            <button
                                                type="button"
                                                key={h}
                                                className={`ag-time-chip ${
                                                    novoHorarioRemarcacao === h
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setNovoHorarioRemarcacao(h)
                                                }
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() => setModalRemarcarItem(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="ag-btn-primary"
                                >
                                    Confirmar Remarcação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: ENCAMINHAR PACIENTE */}
            {modalEncaminharItem && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget)
                            setModalEncaminharItem(null);
                    }}
                >
                    <div className="ag-modal" style={{ maxWidth: 520 }}>
                        <div className="ag-modal-header">
                            <h2>Encaminhar para Especialidade</h2>
                            <button
                                className="ag-modal-close"
                                onClick={() => setModalEncaminharItem(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleConfirmarEncaminhamento}>
                            <div className="ag-modal-body">
                                <p
                                    style={{
                                        fontSize: "0.86rem",
                                        color: "var(--color-text-secondary)",
                                        marginBottom: 16,
                                    }}
                                >
                                    Paciente:{" "}
                                    <strong>
                                        {modalEncaminharItem.paciente.nome}
                                    </strong>
                                </p>

                                <div className="ag-form-group">
                                    <label>Especialidade de Destino</label>
                                    <select
                                        value={especialidadeDestino}
                                        onChange={(e) =>
                                            setEspecialidadeDestino(
                                                e.target.value
                                            )
                                        }
                                    >
                                        {ESPECIALIDADES.map((esp) => (
                                            <option key={esp} value={esp}>
                                                {esp}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ag-form-group">
                                    <label>Unidade de Destino</label>
                                    <select
                                        value={unidadeDestino}
                                        onChange={(e) =>
                                            setUnidadeDestino(e.target.value)
                                        }
                                    >
                                        {UNIDADES_SAQUAREMA.map((u) => (
                                            <option key={u.nome} value={u.nome}>
                                                {u.nome} — {u.bairro}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ag-form-group">
                                    <label>Motivo / Indicação Clínica</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Descreva o motivo do encaminhamento..."
                                        value={motivoEncaminhamento}
                                        onChange={(e) =>
                                            setMotivoEncaminhamento(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() => setModalEncaminharItem(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="ag-btn-primary"
                                >
                                    Confirmar Encaminhamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: CADASTRAR PROFISSIONAL */}
            {modalNovoProfAberto && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget)
                            setModalNovoProfAberto(false);
                    }}
                >
                    <div className="ag-modal" style={{ maxWidth: 600 }}>
                        <div className="ag-modal-header">
                            <h2>Cadastrar Novo Profissional</h2>
                            <button
                                className="ag-modal-close"
                                onClick={() => setModalNovoProfAberto(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCadastrarProfissionalRH}>
                            <div className="ag-modal-body">
                                {erroRH && (
                                    <div
                                        className="ag-alert"
                                        style={{
                                            background: "var(--color-danger-soft)",
                                            color: "var(--color-danger)",
                                        }}
                                    >
                                        ⚠️ {erroRH}
                                    </div>
                                )}

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label>Matrícula</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: MED-2030"
                                            value={rhMatricula}
                                            onChange={(e) =>
                                                setRhMatricula(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="ag-form-group">
                                        <label>Tipo de Profissional</label>
                                        <select
                                            value={rhTipo}
                                            onChange={(e) =>
                                                setRhTipo(
                                                    e.target
                                                        .value as TipoProfissional
                                                )
                                            }
                                        >
                                            <option value="Médico">Médico</option>
                                            <option value="Enfermeiro">
                                                Enfermeiro
                                            </option>
                                            <option value="Psicólogo">
                                                Psicólogo
                                            </option>
                                            <option value="Fisioterapeuta">
                                                Fisioterapeuta
                                            </option>
                                            <option value="Nutricionista">
                                                Nutricionista
                                            </option>
                                            <option value="Equipe Interna / RH">
                                                Equipe Interna / RH
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label>Nome Completo</label>
                                        <input
                                            type="text"
                                            placeholder="Nome do profissional"
                                            value={rhNome}
                                            onChange={(e) =>
                                                setRhNome(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="ag-form-group">
                                        <label>CPF</label>
                                        <input
                                            type="text"
                                            placeholder="000.000.000-00"
                                            value={rhCpf}
                                            onChange={(e) =>
                                                setRhCpf(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label>Especialidade</label>
                                        <select
                                            value={rhEspecialidade}
                                            onChange={(e) =>
                                                setRhEspecialidade(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {ESPECIALIDADES.map((esp) => (
                                                <option key={esp} value={esp}>
                                                    {esp}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ag-form-group">
                                        <label>Registro no Conselho</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: CRM/RJ 654321"
                                            value={rhConselho}
                                            onChange={(e) =>
                                                setRhConselho(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label>Unidade de Saúde</label>
                                    <select
                                        value={rhUnidade}
                                        onChange={(e) =>
                                            setRhUnidade(e.target.value)
                                        }
                                    >
                                        {UNIDADES_SAQUAREMA.map((u) => (
                                            <option key={u.nome} value={u.nome}>
                                                {u.nome} — {u.bairro}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label>E-mail Institucional</label>
                                        <input
                                            type="email"
                                            placeholder="nome@saquacare.gov.br"
                                            value={rhEmail}
                                            onChange={(e) =>
                                                setRhEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="ag-form-group">
                                        <label>Senha Provisória</label>
                                        <input
                                            type="text"
                                            value={rhSenhaTemp}
                                            onChange={(e) =>
                                                setRhSenhaTemp(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label>Carga Horária Semanal (h)</label>
                                    <input
                                        type="number"
                                        min={10}
                                        max={60}
                                        value={rhCargaHoraria}
                                        onChange={(e) =>
                                            setRhCargaHoraria(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() =>
                                        setModalNovoProfAberto(false)
                                    }
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="ag-btn-primary"
                                >
                                    Salvar Cadastro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
