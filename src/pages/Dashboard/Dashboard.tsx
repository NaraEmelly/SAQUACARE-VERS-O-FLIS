import { useState, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "../Agendamentos/Agendamentos.css";
import "../ProfissionalDashboard/ProfissionalDashboard.css";

import logo from "../../assets/logos/logo-saquacare.png";
import Perfil from "../Perfil/Perfil";
import { usePerfil } from "../../hooks/usePerfil";
import Unidades from "../Unidades/Unidades";
import Agendamentos from "../Agendamentos/Agendamentos";
import Vacinas from "../Vacinas/Vacinas";
import {
    carregarFilaAtendimentos,
    carregarProfissionais,
    FILA_ATUALIZADA_EVENTO,
} from "../../services/profissionalService";
import type {
    ItemFilaAtendimento,
    ProfissionalSaude,
} from "../../services/profissionalService";

const CONSULTAS = [
    {
        data: "08/08",
        atendimento: "Consulta",
        profissional: "Dra. Cintia",
        status: "Concluída",
    },
    {
        data: "22/07",
        atendimento: "Retorno",
        profissional: "Dra. Emanuelly",
        status: "Concluída",
    },
    {
        data: "05/07",
        atendimento: "Consulta",
        profissional: "Dr. Carlos Eduardo Ribeiro",
        status: "Concluída",
    },
    {
        data: "20/08",
        atendimento: "Consulta",
        profissional: "Dra. Ana",
        status: "Agendada",
    },
];

type IconName =
    | "inicio"
    | "agendamentos"
    | "filas"
    | "profissionais"
    | "unidades"
    | "vacinas"
    | "conta"
    | "sair"
    | "busca"
    | "sino"
    | "mensagem"
    | "relogio"
    | "mais";

const MENU: { id: string; label: string; icon: IconName }[] = [
    { id: "inicio", label: "Início", icon: "inicio" },
    { id: "agendamentos", label: "Agendamentos", icon: "agendamentos" },
    { id: "filas", label: "Fila de atendimento", icon: "filas" },
    { id: "profissionais", label: "Profissionais", icon: "profissionais" },
    { id: "unidades", label: "Unidades", icon: "unidades" },
    { id: "vacinas", label: "Vacinação", icon: "vacinas" },
];

const ICON_PATHS: Record<IconName, ReactNode> = {
    inicio: (
        <>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </>
    ),
    agendamentos: (
        <>
            <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
            <path d="M8 2.5v4M16 2.5v4M3 10h18" />
        </>
    ),
    filas: (
        <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <circle cx="3.5" cy="6" r="1" />
            <circle cx="3.5" cy="12" r="1" />
            <circle cx="3.5" cy="18" r="1" />
        </>
    ),
    profissionais: (
        <>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c2 .8 3 2.8 3 5.6" />
        </>
    ),
    unidades: (
        <>
            <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    vacinas: (
        <>
            <path d="M12 3 4 6v5.5c0 4.6 3.2 8.2 8 9.5 4.8-1.3 8-4.9 8-9.5V6l-8-3Z" />
            <path d="M12 8.5v6M9 11.5h6" />
        </>
    ),
    conta: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </>
    ),
    busca: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    sino: (
        <>
            <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15L6 16.5Z" />
            <path d="M10 21a2 2 0 0 0 4 0" />
        </>
    ),
    mensagem: (
        <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    ),
    relogio: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    mais: <path d="M12 5v14M5 12h14" />,
    sair: <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
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

function classeFila(status: string) {
    if (status === "Em Atendimento") return "atendimento";
    if (status === "Em Triagem") return "triagem";
    if (status === "Finalizado") return "finalizado";
    return "aguardando";
}

function iniciais(nome: string) {
    const partes = nome
        .split(/\s+/)
        .filter((p) => p && !/^(dr|dra|drs|prof|profa)\.?$/i.test(p));
    if (partes.length === 0) return "?";
    const primeira = partes[0].charAt(0);
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
    return (primeira + ultima).toUpperCase();
}

function prefereMenosMovimento() {
    return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

function CountUp({ value, pad = 0 }: { value: number; pad?: number }) {
    const reduzir = prefereMenosMovimento();
    const [exibido, setExibido] = useState(0);

    useEffect(() => {
        if (reduzir) return;
        let frame = 0;
        const inicio = performance.now();
        const duracao = 900;
        const passo = (agora: number) => {
            const t = Math.min((agora - inicio) / duracao, 1);
            const suave = 1 - Math.pow(1 - t, 3);
            setExibido(Math.round(value * suave));
            if (t < 1) frame = requestAnimationFrame(passo);
        };
        frame = requestAnimationFrame(passo);
        return () => cancelAnimationFrame(frame);
    }, [value, reduzir]);

    return <>{String(reduzir ? value : exibido).padStart(pad, "0")}</>;
}

interface DashboardProps {
    initialTab?: string;
}

function Dashboard({ initialTab = "inicio" }: DashboardProps) {
    const [activeMenu, setActiveMenu] = useState(initialTab);
    const [perfilAlterado, setPerfilAlterado] = useState(false);
    const navigate = useNavigate();
    const [filaPublica, setFilaPublica] = useState<ItemFilaAtendimento[]>([]);
    const [profissionaisRede, setProfissionaisRede] = useState<
        ProfissionalSaude[]
    >([]);
    const [buscaProf, setBuscaProf] = useState("");
    const [videoSecretoAberto, setVideoSecretoAberto] = useState(false);
    const buscaProfRef = useRef<HTMLInputElement>(null);
    const fecharVideoRef = useRef<HTMLButtonElement>(null);
    const [tipoProf, setTipoProf] = useState("todos");
    const perfil = usePerfil();
    const primeiroNome = perfil.nome.trim().split(/\s+/)[0] || "Paciente";
    const inicial = primeiroNome.charAt(0).toUpperCase();

    useEffect(() => {
        const atualizar = () => {
            setFilaPublica(carregarFilaAtendimentos());
            setProfissionaisRede(
                carregarProfissionais().filter(
                    (p) =>
                        p.ativo &&
                        p.tipoProfissional !== "Equipe Interna / RH"
                )
            );
        };
        atualizar();
        window.addEventListener(FILA_ATUALIZADA_EVENTO, atualizar);
        return () =>
            window.removeEventListener(FILA_ATUALIZADA_EVENTO, atualizar);
    }, []);

    useEffect(() => {
            if (!videoSecretoAberto) return;

            const overflowOriginal = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            fecharVideoRef.current?.focus();

            function fecharComEscape(event: KeyboardEvent) {
                if (event.key === "Escape") {
                    setVideoSecretoAberto(false);
                    window.requestAnimationFrame(() => buscaProfRef.current?.focus());
                }
            }

            document.addEventListener("keydown", fecharComEscape);
            return () => {
                document.body.style.overflow = overflowOriginal;
                document.removeEventListener("keydown", fecharComEscape);
            };
    }, [videoSecretoAberto]);

    const hojeIso = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }, []);

    const filaHoje = useMemo(
        () => filaPublica.filter((f) => f.dataIso === hojeIso),
        [filaPublica, hojeIso]
    );
    const chamadoAgora = useMemo(
        () => filaHoje.find((f) => f.status === "Em Atendimento"),
        [filaHoje]
    );
    const aguardandoHoje = useMemo(
        () =>
            filaHoje.filter(
                (f) => f.status === "Aguardando" || f.status === "Em Triagem"
            ),
        [filaHoje]
    );
    const tiposProf = useMemo(
        () => Array.from(new Set(profissionaisRede.map((p) => p.tipoProfissional))),
        [profissionaisRede]
    );
    const profissionaisFiltrados = useMemo(() => {
        const termo = buscaProf.trim().toLowerCase();
        return profissionaisRede.filter((p) => {
            if (tipoProf !== "todos" && p.tipoProfissional !== tipoProf) return false;
            if (!termo) return true;
            return [p.nome, p.especialidade, p.unidade, p.registroConselho].some(
                (campo) => String(campo ?? "").toLowerCase().includes(termo)
            );
        });
    }, [profissionaisRede, buscaProf, tipoProf]);
    const finalizadosHoje = useMemo(
        () => filaHoje.filter((f) => f.status === "Finalizado").length,
        [filaHoje]
    );
    const progressoFila = filaHoje.length
        ? Math.round((finalizadosHoje / filaHoje.length) * 100)
        : 0;

    function handleSair() {
        if (
            perfilAlterado &&
            !window.confirm(
                "Você tem alterações não salvas. Deseja sair sem salvá-las?"
            )
        ) {
            return;
        }

        try {
            localStorage.removeItem("@SaquaCare:token");
            localStorage.removeItem("@SaquaCare:user");
        } catch {
            window.alert("Não foi possível encerrar sua sessão. Tente novamente.");
            return;
        }

        navigate("/landingpage", { replace: true });
    }

    function atualizarBuscaProfissional(valor: string) {
        setBuscaProf(valor);
        if (valor.trim().toLocaleLowerCase("pt-BR") === "farma aura") {
            setVideoSecretoAberto(true);
        }
    }

    function fecharVideoSecreto() {
        setVideoSecretoAberto(false);
        window.requestAnimationFrame(() => buscaProfRef.current?.focus());
    }

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={logo} alt="SaquaCare" />
                </div>

                <nav className="sidebar-menu" aria-label="Menu principal">
                    <p className="menu-title">Menu</p>

                    {MENU.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            aria-label={item.label}
                            className={
                                activeMenu === item.id
                                    ? "menu-item active"
                                    : "menu-item"
                            }
                            aria-current={
                                activeMenu === item.id ? "page" : undefined
                            }
                            onClick={() => setActiveMenu(item.id)}
                        >
                            <span className="menu-icon">
                                <Icon name={item.icon} size={18} />
                            </span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className={
                            activeMenu === "conta"
                                ? "menu-item menu-item--perfil active"
                                : "menu-item menu-item--perfil"
                        }
                        aria-label="Meu perfil"
                        aria-current={activeMenu === "conta" ? "page" : undefined}
                        onClick={() => setActiveMenu("conta")}
                    >
                        <span className="menu-icon">
                            <Icon name="conta" size={18} />
                        </span>
                        <span>Meu perfil</span>
                    </button>

                    <button
                        type="button"
                        className="menu-item menu-item--sair"
                        aria-label="Sair"
                        onClick={handleSair}
                    >
                        <span className="menu-icon">
                            <Icon name="sair" size={18} />
                        </span>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <div className="dashboard-main">
                <header className="topbar">
                    <label className="search-box">
                        <Icon name="busca" size={18} />
                        <input
                            ref={buscaProfRef}
                            type="text"
                            placeholder="Buscar profissional ou especialidade"
                            aria-label="Buscar profissional ou especialidade"
                            value={buscaProf}
                            onChange={(event) => atualizarBuscaProfissional(event.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className="notification"
                        aria-label="Notificações"
                    >
                        <Icon name="sino" size={20} />
                        <span className="notification-dot" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        className="profile"
                        aria-label="Abrir meu perfil"
                        onClick={() => setActiveMenu("conta")}
                    >
                        <span className="profile-avatar">
                            {perfil.foto ? (
                                <img src={perfil.foto} alt="Sua foto de perfil" />
                            ) : (
                                inicial
                            )}
                        </span>

                        <span className="profile-info">
                            <strong>{primeiroNome}</strong>
                            <small>Paciente</small>
                        </span>
                    </button>
                </header>

                <main className="content">

                    {activeMenu === "conta" ? (
                        <Perfil onAlteradoChange={setPerfilAlterado} />
                    ) : activeMenu === "unidades" ? (
                        <Unidades />
                    ) : activeMenu === "agendamentos" ? (
                        <Agendamentos />
                    ) : activeMenu === "vacinas" ? (
                        <Vacinas onEditProfile={() => setActiveMenu("conta")} />
                    ) : activeMenu === "filas" ? (
                        <div className="fila">
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Início / Fila de atendimento
                                    </span>
                                    <h1>Fila de atendimento em tempo real</h1>
                                    <p>
                                        Acompanhe a senha chamada no momento e a
                                        ordem de atendimento das unidades de
                                        saúde.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="ag-btn-primary"
                                    onClick={() =>
                                        setActiveMenu("agendamentos")
                                    }
                                >
                                    <Icon name="mais" size={18} />
                                    Novo agendamento
                                </button>
                            </div>

                            <section className="fl-banner" aria-live="polite">
                                <div className="fl-now">
                                    <span className="fl-live">
                                        <span className="fl-live-dot" aria-hidden="true" />
                                        Ao vivo
                                    </span>

                                    <div className="fl-now-row">
                                        <div
                                            className={
                                                chamadoAgora
                                                    ? "fl-ticket is-active"
                                                    : "fl-ticket"
                                            }
                                        >
                                            <small>Senha</small>
                                            <strong
                                                key={chamadoAgora?.senhaFila || "vazio"}
                                                className="fl-ticket-num"
                                            >
                                                {chamadoAgora?.senhaFila || "—"}
                                            </strong>
                                        </div>

                                        <div className="fl-now-info">
                                            <span>
                                                {chamadoAgora
                                                    ? "Em atendimento agora"
                                                    : "Nenhuma chamada no momento"}
                                            </span>
                                            <h2>
                                                {chamadoAgora
                                                    ? `${chamadoAgora.especialidade} · ${chamadoAgora.profissionalNome}`
                                                    : "Aguardando próxima chamada"}
                                            </h2>
                                            <p>
                                                {chamadoAgora
                                                    ? `Unidade: ${chamadoAgora.unidade} · Horário: ${chamadoAgora.horario}`
                                                    : "Dirija-se à recepção da unidade com seu Cartão SUS e documento."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="fl-side">
                                    <div className="fl-count">
                                        <strong>
                                            <CountUp value={aguardandoHoje.length} />
                                        </strong>
                                        <span>
                                            {aguardandoHoje.length === 1
                                                ? "pessoa aguardando na fila hoje"
                                                : "pessoas aguardando na fila hoje"}
                                        </span>
                                    </div>

                                    <div className="fl-progress-wrap">
                                        <div className="fl-progress">
                                            <span style={{ width: `${progressoFila}%` }} />
                                        </div>
                                        <small>
                                            {finalizadosHoje} de {filaHoje.length}{" "}
                                            atendimentos concluídos
                                        </small>
                                    </div>
                                </div>
                            </section>

                            {filaHoje.length === 0 ? (
                                <div className="fl-empty">
                                    <span className="fl-empty-icon" aria-hidden="true">
                                        <Icon name="filas" size={28} />
                                    </span>
                                    <h3>Nenhuma senha na fila hoje</h3>
                                    <p>
                                        Quando houver atendimentos, eles aparecem
                                        aqui automaticamente.
                                    </p>
                                </div>
                            ) : (
                                <div className="table-card">
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Senha</th>
                                                    <th>Horário</th>
                                                    <th>Especialidade</th>
                                                    <th>Profissional</th>
                                                    <th>Unidade</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filaHoje.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className={
                                                            item.status === "Em Atendimento"
                                                                ? "is-current"
                                                                : undefined
                                                        }
                                                    >
                                                        <td>
                                                            <span className="fl-senha">
                                                                {item.senhaFila}
                                                            </span>
                                                        </td>
                                                        <td className="date">
                                                            {item.horario}
                                                        </td>
                                                        <td>
                                                            <strong>
                                                                {item.especialidade}
                                                            </strong>
                                                        </td>
                                                        <td>{item.profissionalNome}</td>
                                                        <td>{item.unidade}</td>
                                                        <td>
                                                            <span
                                                                className={`fl-status ${classeFila(item.status)}`}
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
                            )}
                        </div>
                    ) : activeMenu === "profissionais" ? (
                        <div className="pf-page">
                            <div className="ag-header">
                                <div>
                                    <span className="ag-breadcrumb">
                                        Início / Profissionais
                                    </span>
                                    <h1>Corpo clínico e especialistas</h1>
                                    <p>
                                        Conheça os profissionais de saúde que
                                        atendem na rede municipal de Saquarema.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="ag-btn-primary"
                                    onClick={() =>
                                        setActiveMenu("agendamentos")
                                    }
                                >
                                    <Icon name="mais" size={18} />
                                    Agendar consulta
                                </button>
                            </div>

                            {profissionaisRede.length > 0 && (
                                <div className="ag-controls pf-controls">
                                    <div className="ag-search-wrapper">
                                        <span className="ag-search-icon">
                                            <Icon name="busca" size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            className="ag-search-input"
                                            placeholder="Buscar por nome, especialidade ou unidade..."
                                            aria-label="Buscar profissionais"
                                            value={buscaProf}
                                            onChange={(e) =>
                                                setBuscaProf(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div
                                        className="ag-filter-tabs"
                                        role="group"
                                        aria-label="Filtrar por tipo de profissional"
                                    >
                                        <button
                                            type="button"
                                            className={`ag-tab-btn ${tipoProf === "todos" ? "active" : ""}`}
                                            aria-pressed={tipoProf === "todos"}
                                            onClick={() => setTipoProf("todos")}
                                        >
                                            Todos
                                            <span className="ag-tab-count">
                                                {profissionaisRede.length}
                                            </span>
                                        </button>

                                        {tiposProf.map((tipo) => (
                                            <button
                                                key={tipo}
                                                type="button"
                                                className={`ag-tab-btn ${tipoProf === tipo ? "active" : ""}`}
                                                aria-pressed={tipoProf === tipo}
                                                onClick={() => setTipoProf(tipo)}
                                            >
                                                {tipo}
                                                <span className="ag-tab-count">
                                                    {
                                                        profissionaisRede.filter(
                                                            (p) =>
                                                                p.tipoProfissional ===
                                                                tipo
                                                        ).length
                                                    }
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="ag-list-grid">
                                {profissionaisFiltrados.length === 0 ? (
                                    <div className="ag-empty">
                                        <span className="ag-empty-icon" aria-hidden="true">
                                            <Icon name="profissionais" size={30} />
                                        </span>
                                        <h3>
                                            {profissionaisRede.length === 0
                                                ? "Nenhum profissional disponível"
                                                : "Nenhum profissional encontrado"}
                                        </h3>
                                        <p>
                                            {profissionaisRede.length === 0
                                                ? "Assim que houver profissionais atendendo na rede, eles aparecem aqui."
                                                : "Não encontramos profissionais para a busca ou o filtro selecionado."}
                                        </p>
                                        {profissionaisRede.length > 0 && (
                                            <button
                                                type="button"
                                                className="ag-btn-primary"
                                                onClick={() => {
                                                    setBuscaProf("");
                                                    setTipoProf("todos");
                                                }}
                                            >
                                                Limpar filtros
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    profissionaisFiltrados.map((prof) => (
                                        <div key={prof.id} className="ag-card pf-card">
                                            <div>
                                                <div className="ag-card-top">
                                                    <span className="ag-type-tag">
                                                        {prof.tipoProfissional}
                                                    </span>
                                                    <span className="ag-protocolo">
                                                        {prof.registroConselho}
                                                    </span>
                                                </div>

                                                <div className="pf-person">
                                                    <div className="pf-avatar" aria-hidden="true">
                                                        {iniciais(prof.nome)}
                                                    </div>
                                                    <div className="pf-id">
                                                        <h3 className="pf-name">
                                                            {prof.nome}
                                                        </h3>
                                                        <p className="pf-specialty">
                                                            {prof.especialidade}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="ag-card-details">
                                                    <div className="ag-detail-row">
                                                        <span className="ag-detail-icon" aria-hidden="true">
                                                            <Icon name="unidades" size={16} />
                                                        </span>
                                                        <span>{prof.unidade}</span>
                                                    </div>
                                                    <div className="ag-detail-row">
                                                        <span className="ag-detail-icon" aria-hidden="true">
                                                            <Icon name="relogio" size={16} />
                                                        </span>
                                                        <span>
                                                            Atendimento:{" "}
                                                            {prof.cargaHorariaSemanal}h
                                                            semanais
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ag-card-actions">
                                                <button
                                                    type="button"
                                                    className="ag-btn-primary pf-book"
                                                    onClick={() =>
                                                        setActiveMenu("agendamentos")
                                                    }
                                                >
                                                    Agendar com este especialista
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                    <div className="home">
                        <section className="welcome">
                            <div className="welcome-copy">
                                <span className="welcome-chip">
                                    <span className="welcome-dot" aria-hidden="true" />
                                    Início / Minha saúde
                                </span>

                                <p>Olá, {primeiroNome}!</p>

                                <h1>Como podemos cuidar de você hoje?</h1>

                                <div className="welcome-actions">
                                    <button
                                        type="button"
                                        className="welcome-btn welcome-btn-solid"
                                        onClick={() => setActiveMenu("agendamentos")}
                                    >
                                        <Icon name="mais" size={18} />
                                        Agendar consulta
                                    </button>

                                    <button
                                        type="button"
                                        className="welcome-btn welcome-btn-glass"
                                        onClick={() => setActiveMenu("filas")}
                                    >
                                        Acompanhar a fila
                                    </button>
                                </div>
                            </div>

                            <svg
                                className="welcome-pulse"
                                viewBox="0 0 520 140"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path
                                    className="pulse-base"
                                    pathLength={1}
                                    d="M0 78H150L178 78L200 28L232 122L262 50L282 78H520"
                                />
                                <path
                                    className="pulse-draw"
                                    pathLength={1}
                                    d="M0 78H150L178 78L200 28L232 122L262 50L282 78H520"
                                />
                            </svg>
                        </section>

                        <section className="summary-grid" aria-label="Resumo">
                            <button
                                type="button"
                                className="summary-card blue"
                                onClick={() => setActiveMenu("agendamentos")}
                                title="Ver seus agendamentos"
                            >
                                <span className="summary-icon" aria-hidden="true">
                                    <Icon name="agendamentos" size={24} />
                                </span>

                                <span className="summary-body">
                                    <span className="summary-label">Próxima consulta</span>
                                    <strong>12 de agosto</strong>
                                    <small>09:30 · Clínica Médica</small>
                                </span>
                            </button>

                            <button
                                type="button"
                                className="summary-card teal"
                                onClick={() => setActiveMenu("filas")}
                                title="Acompanhar a fila em tempo real"
                            >
                                <span className="summary-icon" aria-hidden="true">
                                    <Icon name="relogio" size={24} />
                                </span>

                                <span className="summary-body">
                                    <span className="summary-label">Fila de atendimento</span>
                                    <strong>
                                        <CountUp value={aguardandoHoje.length} />{" "}
                                        {aguardandoHoje.length === 1
                                            ? "pessoa"
                                            : "pessoas"}
                                    </strong>
                                    <small>
                                        Senha atual: {chamadoAgora?.senhaFila || "C-01"} · cerca de 16 min
                                    </small>
                                </span>
                            </button>

                            <article className="summary-card light">
                                <span className="summary-icon" aria-hidden="true">
                                    <Icon name="mensagem" size={24} />
                                </span>

                                <span className="summary-body">
                                    <span className="summary-label">Mensagens</span>
                                    <strong>2 novas</strong>
                                    <small>Sobre suas consultas</small>
                                </span>
                            </article>
                        </section>

                        <section className="vaccination-shortcut">
                            <div className="vaccination-shortcut-icon" aria-hidden="true">
                                <Icon name="vacinas" size={28} />
                            </div>

                            <div className="vaccination-shortcut-copy">
                                <span>Carteira de vacinação</span>
                                <h2>Acompanhe sua proteção</h2>
                                <p>
                                    Registre doses, consulte referências por idade e
                                    encontre unidades de vacinação.
                                </p>
                            </div>

                            <button type="button" onClick={() => setActiveMenu("vacinas")}>
                                Abrir minha carteira
                            </button>
                        </section>

                        <section className="overview">
                            <div className="section-heading">
                                <h2>Acompanhe sua saúde</h2>
                            </div>

                            <div className="health-grid">
                                <article className="health-card">
                                    <div className="card-header">
                                        <span>Próxima consulta</span>
                                        <span className="status">Confirmada</span>
                                    </div>

                                    <div className="appointment">
                                        <div className="calendar">
                                            <strong>12</strong>
                                            <span>AGO</span>
                                        </div>

                                        <div>
                                            <strong>Dra. Camila</strong>
                                            <p>Clínica Médica</p>
                                            <small>09:30 · Clínica Municipal</small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="card-button"
                                        onClick={() => setActiveMenu("agendamentos")}
                                    >
                                        Ver agendamento
                                    </button>
                                </article>

                                <article className="health-card">
                                    <div className="card-header">
                                        <span>Fila pública</span>
                                        <span className="queue-status">Em andamento</span>
                                    </div>

                                    <div className="queue">
                                        <div className="queue-number">
                                            <CountUp value={4} pad={2} />
                                        </div>

                                        <div>
                                            <strong>UBS Centro</strong>
                                            <p>Triagem geral</p>
                                            <small>Pessoas à sua frente</small>
                                        </div>
                                    </div>

                                    <div className="queue-progress">
                                        <span />
                                    </div>

                                    <p className="queue-time">
                                        Tempo estimado: <strong>22 minutos</strong>
                                    </p>
                                </article>

                                <article className="health-card">
                                    <div className="card-header">
                                        <span>Profissional</span>
                                        <span className="rating">★ 4,9</span>
                                    </div>

                                    <div className="professional">
                                        <div className="professional-avatar">C</div>

                                        <div>
                                            <strong>Dra. Camila</strong>
                                            <p>Clínica Médica</p>
                                            <small>Rede pública</small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="card-button"
                                        onClick={() => setActiveMenu("profissionais")}
                                    >
                                        Ver profissional
                                    </button>
                                </article>
                            </div>
                        </section>

                        <section className="history-section">
                            <div className="section-heading">
                                <h2>Minhas consultas</h2>

                                <button
                                    type="button"
                                    className="see-all"
                                    onClick={() => setActiveMenu("agendamentos")}
                                >
                                    Ver todas
                                </button>
                            </div>

                            <div className="table-card">
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Atendimento</th>
                                                <th>Profissional</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {CONSULTAS.map((consulta) => (
                                                <tr
                                                    key={`${consulta.data}-${consulta.profissional}`}
                                                >
                                                    <td className="date">{consulta.data}</td>
                                                    <td>{consulta.atendimento}</td>
                                                    <td>{consulta.profissional}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                consulta.status === "Concluída"
                                                                    ? "badge done"
                                                                    : "badge scheduled"
                                                            }
                                                        >
                                                            {consulta.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                    )}

                </main>
            </div>
            {videoSecretoAberto && (
                <div
                    className="farma-aura-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharVideoSecreto();
                    }}
                >
                    <section
                        className="farma-aura-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="farma-aura-title"
                    >
                        <div className="farma-aura-dialog-header">
                            <h2 id="farma-aura-title">Farma Aura</h2>
                            <button
                                ref={fecharVideoRef}
                                type="button"
                                className="farma-aura-close"
                                aria-label="Fechar vídeo"
                                onClick={fecharVideoSecreto}
                            >
                                ×
                            </button>
                        </div>
                        <div className="farma-aura-video">
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                                title="Vídeo Farma Aura"
                                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
