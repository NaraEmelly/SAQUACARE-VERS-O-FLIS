import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ReactNode } from "react";
import "./Agendamentos.css";
import {
    carregarAgendamentos,
    criarAgendamento,
    cancelarAgendamento,
    ESPECIALIDADES,
    UNIDADES_SAQUAREMA,
    MEDICOS_EXEMPLO,
    AGENDAMENTOS_ATUALIZADOS_EVENTO,
} from "../../services/agendamentoService";
import type {
    Agendamento,
    TipoAtendimento,
} from "../../services/agendamentoService";
import { usePerfil } from "../../hooks/usePerfil";

const HORARIOS_DISPONIVEIS = [
    "08:00",
    "08:45",
    "09:30",
    "10:15",
    "11:00",
    "13:30",
    "14:15",
    "15:00",
    "15:45",
    "16:30",
];

type IconName =
    | "mais"
    | "agendamentos"
    | "check"
    | "fechar"
    | "busca"
    | "local"
    | "profissional"
    | "info"
    | "arquivo"
    | "impressora"
    | "alerta";


const ICON_PATHS: Record<IconName, ReactNode> = {
    mais: <path d="M12 5v14M5 12h14" />,
    agendamentos: (
        <>
            <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
            <path d="M8 2.5v4M16 2.5v4M3 10h18" />
        </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    fechar: <path d="M6 6l12 12M18 6 6 18" />,
    busca: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    local: (
        <>
            <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    profissional: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.8v.2" />
        </>
    ),
    arquivo: (
        <>
            <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </>
    ),
    impressora: (
        <>
            <path d="M7 9V3h10v6" />
            <rect x="3" y="9" width="18" height="8" rx="2" />
            <path d="M7 14h10v7H7z" />
        </>
    ),
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

function prefereMenosMovimento() {
    return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}


function CountUp({ value }: { value: number }) {
    const reduzir = prefereMenosMovimento();
    const [exibido, setExibido] = useState(0);

    useEffect(() => {
        if (reduzir) return;
        let frame = 0;
        const inicio = performance.now();
        const duracao = 800;
        const passo = (agora: number) => {
            const t = Math.min((agora - inicio) / duracao, 1);
            const suave = 1 - Math.pow(1 - t, 3);
            setExibido(Math.round(value * suave));
            if (t < 1) frame = requestAnimationFrame(passo);
        };
        frame = requestAnimationFrame(passo);
        return () => cancelAnimationFrame(frame);
    }, [value, reduzir]);

    return <>{reduzir ? value : exibido}</>;
}

function classeStatus(status: string) {
    if (status === "Agendada") return "agendada";
    if (status === "Concluída") return "concluida";
    return "cancelada";
}

export default function Agendamentos() {
    const perfil = usePerfil();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");
    const [busca, setBusca] = useState<string>("");
    const [alerta, setAlerta] = useState<string | null>(null);


    const [modalNovoAberto, setModalNovoAberto] = useState(false);
    const [comprovanteAtivo, setComprovanteAtivo] = useState<Agendamento | null>(null);


    const [tipo, setTipo] = useState<TipoAtendimento>("Consulta");
    const [especialidade, setEspecialidade] = useState(ESPECIALIDADES[0]);
    const [unidadeIndex, setUnidadeIndex] = useState(0);
    const [profissional, setProfissional] = useState("");
    const [dataIso, setDataIso] = useState("");
    const [horario, setHorario] = useState(HORARIOS_DISPONIVEIS[2]);
    const [observacoes, setObservacoes] = useState("");
    const [erroForm, setErroForm] = useState<string | null>(null);


    const recarregar = () => {
        setAgendamentos(carregarAgendamentos());
    };

    useEffect(() => {
        recarregar();
        window.addEventListener(AGENDAMENTOS_ATUALIZADOS_EVENTO, recarregar);
        return () => {
            window.removeEventListener(AGENDAMENTOS_ATUALIZADOS_EVENTO, recarregar);
        };
    }, []);


    useEffect(() => {
        const medicos = MEDICOS_EXEMPLO[especialidade];
        if (medicos && medicos.length > 0) {
            setProfissional(medicos[0]);
        } else {
            setProfissional("Profissional da Unidade");
        }
    }, [especialidade]);


    useEffect(() => {
        if (!modalNovoAberto && !comprovanteAtivo) return;
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setModalNovoAberto(false);
                setComprovanteAtivo(null);
            }
        };
        window.addEventListener("keydown", aoTeclar);
        return () => window.removeEventListener("keydown", aoTeclar);
    }, [modalNovoAberto, comprovanteAtivo]);


    const hojeStr = useMemo(() => {
        const d = new Date();
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }, []);


    const contadores = useMemo(() => {
        const agendadas = agendamentos.filter((a) => a.status === "Agendada").length;
        const concluidas = agendamentos.filter((a) => a.status === "Concluída").length;
        const canceladas = agendamentos.filter((a) => a.status === "Cancelada").length;
        return { agendadas, concluidas, canceladas };
    }, [agendamentos]);


    const agendamentosFiltrados = useMemo(() => {
        return agendamentos.filter((item) => {
            if (filtroStatus === "agendadas" && item.status !== "Agendada") return false;
            if (filtroStatus === "concluidas" && item.status !== "Concluída") return false;
            if (filtroStatus === "canceladas" && item.status !== "Cancelada") return false;

            if (busca.trim()) {
                const termo = busca.toLowerCase();
                const matchEspec = item.especialidade.toLowerCase().includes(termo);
                const matchProf = item.profissional.toLowerCase().includes(termo);
                const matchUnidade = item.unidade.toLowerCase().includes(termo);
                const matchProto = item.protocolo.toLowerCase().includes(termo);
                return matchEspec || matchProf || matchUnidade || matchProto;
            }

            return true;
        });
    }, [agendamentos, filtroStatus, busca]);

    const filtros = [
        { id: "todos", rotulo: "Todas", total: agendamentos.length },
        { id: "agendadas", rotulo: "Agendadas", total: contadores.agendadas },
        { id: "concluidas", rotulo: "Concluídas", total: contadores.concluidas },
        { id: "canceladas", rotulo: "Canceladas", total: contadores.canceladas },
    ];


    const handleSubmeterAgendamento = (e: FormEvent) => {
        e.preventDefault();
        setErroForm(null);

        if (!dataIso) {
            setErroForm("Por favor, selecione uma data válida para a consulta.");
            return;
        }

        const unidadeEscolhida = UNIDADES_SAQUAREMA[unidadeIndex];

        const novo = criarAgendamento({
            tipo,
            especialidade,
            profissional: profissional || "Profissional Designado",
            unidade: unidadeEscolhida.nome,
            bairro: unidadeEscolhida.bairro,
            dataIso,
            horario,
            observacoes: observacoes.trim() || undefined,
        });

        setModalNovoAberto(false);
        setAlerta(`Agendamento de ${novo.especialidade} confirmado com sucesso! Protocolo: ${novo.protocolo}`);
        setTimeout(() => setAlerta(null), 5000);

        setObservacoes("");
        setDataIso("");
    };

    const handleCancelar = (id: string, especialidade: string) => {
        const confirmar = window.confirm(
            `Tem certeza que deseja cancelar o agendamento de ${especialidade}?`
        );
        if (confirmar) {
            cancelarAgendamento(id);
            setAlerta(`Agendamento cancelado com sucesso.`);
            setTimeout(() => setAlerta(null), 4000);
        }
    };

    const linhasComprovante = comprovanteAtivo
        ? [
              { rotulo: "Paciente", valor: perfil.nome || "Paciente" },
              { rotulo: "Cartão SUS", valor: perfil.cartaoSus || "Não informado" },
              { rotulo: "Atendimento", valor: comprovanteAtivo.tipo },
              { rotulo: "Especialidade", valor: comprovanteAtivo.especialidade },
              { rotulo: "Profissional", valor: comprovanteAtivo.profissional },
              { rotulo: "Unidade", valor: comprovanteAtivo.unidade },
              { rotulo: "Bairro", valor: comprovanteAtivo.bairro },
              {
                  rotulo: "Data e horário",
                  valor: `${comprovanteAtivo.data} às ${comprovanteAtivo.horario}`,
              },
          ]
        : [];

    return (
        <div className="agendamentos-container">
            <div className="ag-header">
                <div>
                    <span className="ag-breadcrumb">Início / Agendamentos de saúde</span>
                    <h1>Meus agendamentos</h1>
                    <p>
                        Acompanhe suas consultas e exames na rede pública de Saquarema ou
                        agende um novo atendimento na unidade mais próxima.
                    </p>
                </div>
                <button
                    type="button"
                    className="ag-btn-primary"
                    onClick={() => {
                        setErroForm(null);
                        setModalNovoAberto(true);
                    }}
                >
                    <Icon name="mais" />
                    Novo agendamento
                </button>
            </div>

            {alerta && (
                <div className="ag-alert ag-alert--sucesso" role="status">
                    <Icon name="check" />
                    <span>{alerta}</span>
                </div>
            )}

            <div className="ag-stats-grid">
                <div className="ag-stat-card agendada">
                    <div className="ag-stat-icon agendada" aria-hidden="true">
                        <Icon name="agendamentos" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={contadores.agendadas} />
                        </h3>
                        <span>Consultas agendadas</span>
                    </div>
                </div>

                <div className="ag-stat-card concluida">
                    <div className="ag-stat-icon concluida" aria-hidden="true">
                        <Icon name="check" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={contadores.concluidas} />
                        </h3>
                        <span>Atendimentos concluídos</span>
                    </div>
                </div>

                <div className="ag-stat-card cancelada">
                    <div className="ag-stat-icon cancelada" aria-hidden="true">
                        <Icon name="fechar" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={contadores.canceladas} />
                        </h3>
                        <span>Canceladas</span>
                    </div>
                </div>
            </div>

            <div className="ag-controls">
                <div className="ag-search-wrapper">
                    <span className="ag-search-icon">
                        <Icon name="busca" />
                    </span>
                    <input
                        type="text"
                        className="ag-search-input"
                        placeholder="Buscar por médico, especialidade, unidade ou protocolo..."
                        aria-label="Buscar agendamentos"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="ag-filter-tabs" role="group" aria-label="Filtrar por status">
                    {filtros.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            className={`ag-tab-btn ${filtroStatus === f.id ? "active" : ""}`}
                            aria-pressed={filtroStatus === f.id}
                            onClick={() => setFiltroStatus(f.id)}
                        >
                            {f.rotulo}
                            <span className="ag-tab-count">{f.total}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="ag-list-grid">
                {agendamentosFiltrados.length === 0 ? (
                    <div className="ag-empty">
                        <span className="ag-empty-icon" aria-hidden="true">
                            <Icon name="agendamentos" size={30} />
                        </span>
                        <h3>Nenhum agendamento encontrado</h3>
                        <p>
                            Não foram encontradas consultas ou exames para os filtros
                            selecionados.
                        </p>
                        <button
                            type="button"
                            className="ag-btn-primary"
                            onClick={() => {
                                setBusca("");
                                setFiltroStatus("todos");
                            }}
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    agendamentosFiltrados.map((item) => (
                        <div
                            key={item.id}
                            className={`ag-card ag-card--${classeStatus(item.status)}`}
                        >
                            <div>
                                <div className="ag-card-top">
                                    <div className="ag-card-badge-group">
                                        <span className="ag-type-tag">{item.tipo}</span>
                                        <span
                                            className={`ag-status-badge ${classeStatus(item.status)}`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <span className="ag-protocolo">#{item.protocolo}</span>
                                </div>

                                <h3 className="ag-card-title">{item.especialidade}</h3>
                                <p className="ag-card-professional">
                                    <span className="ag-prof-icon" aria-hidden="true">
                                        <Icon name="profissional" size={14} />
                                    </span>
                                    {item.profissional}
                                </p>

                                <div className="ag-card-details">
                                    <div className="ag-detail-row">
                                        <span className="ag-detail-icon" aria-hidden="true">
                                            <Icon name="agendamentos" size={16} />
                                        </span>
                                        <span>
                                            <strong>{item.data}</strong> às {item.horario}
                                        </span>
                                    </div>
                                    <div className="ag-detail-row">
                                        <span className="ag-detail-icon" aria-hidden="true">
                                            <Icon name="local" size={16} />
                                        </span>
                                        <span>
                                            {item.unidade} — {item.bairro}
                                        </span>
                                    </div>
                                    {item.observacoes && (
                                        <div className="ag-detail-row">
                                            <span className="ag-detail-icon" aria-hidden="true">
                                                <Icon name="info" size={16} />
                                            </span>
                                            <span>{item.observacoes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ag-card-actions">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() => setComprovanteAtivo(item)}
                                >
                                    <Icon name="arquivo" size={16} />
                                    Ver comprovante
                                </button>
                                {item.status === "Agendada" && (
                                    <button
                                        type="button"
                                        className="ag-btn-danger-text"
                                        aria-label={`Cancelar agendamento de ${item.especialidade}`}
                                        onClick={() => handleCancelar(item.id, item.especialidade)}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modalNovoAberto && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setModalNovoAberto(false);
                    }}
                >
                    <div
                        className="ag-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ag-modal-novo-titulo"
                    >
                        <div className="ag-modal-header">
                            <div>
                                <h2 id="ag-modal-novo-titulo">Novo agendamento</h2>
                                <p className="ag-modal-subtitle">
                                    Escolha a especialidade, a unidade e o melhor horário.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ag-modal-close"
                                aria-label="Fechar"
                                onClick={() => setModalNovoAberto(false)}
                            >
                                <Icon name="fechar" size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmeterAgendamento}>
                            <div className="ag-modal-body">
                                {erroForm && (
                                    <div className="ag-alert ag-alert--erro" role="alert">
                                        <Icon name="alerta" />
                                        <span>{erroForm}</span>
                                    </div>
                                )}

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label htmlFor="ag-tipo">Tipo de atendimento</label>
                                        <select
                                            id="ag-tipo"
                                            value={tipo}
                                            onChange={(e) =>
                                                setTipo(e.target.value as TipoAtendimento)
                                            }
                                        >
                                            <option value="Consulta">Consulta médica</option>
                                            <option value="Exame">Exame laboratorial / imagem</option>
                                            <option value="Retorno">Retorno médico</option>
                                        </select>
                                    </div>

                                    <div className="ag-form-group">
                                        <label htmlFor="ag-especialidade">Especialidade</label>
                                        <select
                                            id="ag-especialidade"
                                            value={especialidade}
                                            onChange={(e) => setEspecialidade(e.target.value)}
                                        >
                                            {ESPECIALIDADES.map((esp) => (
                                                <option key={esp} value={esp}>
                                                    {esp}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="ag-unidade">Unidade de saúde (Saquarema)</label>
                                    <select
                                        id="ag-unidade"
                                        value={unidadeIndex}
                                        onChange={(e) =>
                                            setUnidadeIndex(Number(e.target.value))
                                        }
                                    >
                                        {UNIDADES_SAQUAREMA.map((u, idx) => (
                                            <option key={u.nome} value={idx}>
                                                {u.nome} — {u.bairro}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="ag-profissional">Profissional</label>
                                    <input
                                        id="ag-profissional"
                                        type="text"
                                        value={profissional}
                                        onChange={(e) => setProfissional(e.target.value)}
                                        placeholder="Nome do médico ou profissional"
                                    />
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="ag-data">Data da consulta</label>
                                    <input
                                        id="ag-data"
                                        type="date"
                                        min={hojeStr}
                                        value={dataIso}
                                        onChange={(e) => setDataIso(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="ag-form-group">
                                    <span className="ag-form-label" id="ag-horarios-rotulo">
                                        Horário disponível
                                    </span>
                                    <div
                                        className="ag-times-grid"
                                        role="group"
                                        aria-labelledby="ag-horarios-rotulo"
                                    >
                                        {HORARIOS_DISPONIVEIS.map((h) => (
                                            <button
                                                type="button"
                                                key={h}
                                                className={`ag-time-chip ${
                                                    horario === h ? "selected" : ""
                                                }`}
                                                aria-pressed={horario === h}
                                                onClick={() => setHorario(h)}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="ag-observacoes">
                                        Observações ou sintomas (opcional)
                                    </label>
                                    <textarea
                                        id="ag-observacoes"
                                        rows={3}
                                        value={observacoes}
                                        onChange={(e) => setObservacoes(e.target.value)}
                                        placeholder="Ex: Primeira consulta, dores de cabeça constantes ou encaminhamento prévio."
                                    />
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={() => setModalNovoAberto(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="ag-btn-primary">
                                    Confirmar agendamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {comprovanteAtivo && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setComprovanteAtivo(null);
                    }}
                >
                    <div
                        className="ag-modal ag-modal--sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ag-modal-comprovante-titulo"
                    >
                        <div className="ag-modal-header">
                            <div>
                                <h2 id="ag-modal-comprovante-titulo">
                                    Comprovante de agendamento
                                </h2>
                                <p className="ag-modal-subtitle">
                                    Apresente este protocolo na unidade.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ag-modal-close"
                                aria-label="Fechar"
                                onClick={() => setComprovanteAtivo(null)}
                            >
                                <Icon name="fechar" size={18} />
                            </button>
                        </div>

                        <div className="ag-modal-body">
                            <div className="ag-receipt-card">
                                <div className="ag-receipt-header">
                                    <span className="ag-receipt-seal" aria-hidden="true">
                                        <Icon name="check" size={22} />
                                    </span>
                                    <h3>SaquaCare — Saúde Municipal</h3>
                                    <span className="ag-receipt-proto">
                                        Protocolo #{comprovanteAtivo.protocolo}
                                    </span>
                                </div>

                                {linhasComprovante.map((linha) => (
                                    <div className="ag-receipt-item" key={linha.rotulo}>
                                        <span className="ag-receipt-label">{linha.rotulo}</span>
                                        <span className="ag-receipt-val">{linha.valor}</span>
                                    </div>
                                ))}

                                <div className="ag-receipt-item">
                                    <span className="ag-receipt-label">Status</span>
                                    <span
                                        className={`ag-status-badge ${classeStatus(comprovanteAtivo.status)}`}
                                    >
                                        {comprovanteAtivo.status}
                                    </span>
                                </div>

                                <div className="ag-receipt-notice">
                                    <Icon name="info" size={18} />
                                    <p>
                                        <strong>Orientações ao paciente:</strong> favor comparecer
                                        com 15 minutos de antecedência portando documento oficial
                                        com foto e Cartão Nacional de Saúde (SUS).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="ag-modal-footer">
                            <button
                                type="button"
                                className="ag-btn-outline"
                                onClick={() => window.print()}
                            >
                                <Icon name="impressora" size={16} />
                                Imprimir
                            </button>
                            <button
                                type="button"
                                className="ag-btn-primary"
                                onClick={() => setComprovanteAtivo(null)}
                            >
                                Concluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
