import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import "../Agendamentos/Agendamentos.css";
import "./Vacinas.css";

import { usePerfil } from "../../hooks/usePerfil";
import {
    carregarRegistrosVacinais,
    REGISTROS_VACINAIS_ATUALIZADOS,
    salvarRegistrosVacinais,
} from "../../services/vacinacaoRegistroService";
import {
    MARCOS_CALENDARIO_INFANTIL,
    UNIDADES_COM_VACINACAO,
    VACINAS_REGISTRAVEIS,
    VACINAS_POR_FAIXA_ETARIA,
} from "../../services/vacinas";
import type {
    OrigemRegistroVacinal,
    RegistroDoseVacinal,
} from "../../services/vacinacaoRegistroService";

type IconName =
    | "escudo"
    | "seringa"
    | "mais"
    | "busca"
    | "local"
    | "relogio"
    | "telefone"
    | "externo"
    | "info"
    | "alerta"
    | "check"
    | "fechar"
    | "editar"
    | "lixeira"
    | "calendario"
    | "caderneta"
    | "lista";


const ICON_PATHS: Record<IconName, ReactNode> = {
    escudo: (
        <>
            <path d="M12 3 4 6v5.5c0 4.6 3.2 8.2 8 9.5 4.8-1.3 8-4.9 8-9.5V6l-8-3Z" />
            <path d="M12 8.5v6M9 11.5h6" />
        </>
    ),
    seringa: (
        <path d="m18 2 4 4M17 7l3-3M19 9 8.5 19.5a2 2 0 0 1-1.4.6H5v-2.1a2 2 0 0 1 .6-1.4L16 5M10 9l5 5M7 12l5 5M2 22l3-3" />
    ),
    mais: <path d="M12 5v14M5 12h14" />,
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
    relogio: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    telefone: (
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    ),
    externo: <path d="M7 17 17 7M9 7h8v8" />,
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.8v.2" />
        </>
    ),
    alerta: (
        <>
            <path d="M12 3.5 2.5 20h19L12 3.5Z" />
            <path d="M12 10v5M12 17.5v.2" />
        </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    fechar: <path d="M6 6l12 12M18 6 6 18" />,
    editar: (
        <>
            <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
            <path d="m13.5 6.5 4 4" />
        </>
    ),
    lixeira: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
    calendario: (
        <>
            <rect x="3" y="4.5" width="18" height="16.5" rx="3" />
            <path d="M8 2.5v4M16 2.5v4M3 10h18" />
        </>
    ),
    caderneta: (
        <>
            <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
            <path d="M5 17a3 3 0 0 1 3-3h11" />
        </>
    ),
    lista: (
        <>
            <rect x="6" y="4" width="12" height="17" rx="2.5" />
            <path d="M9 4V3h6v1M9.5 11h5M9.5 15h3" />
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

type SecaoVacinas = "cartao" | "disponibilidade";

interface IdadePaciente {
    anos: number;
    meses: number;
    totalMeses: number;
    dias: number;
    dataFormatada: string;
}

interface FormularioDose {
    vacina: string;
    outraVacina: string;
    dose: string;
    dataAplicacao: string;
    unidade: string;
    lote: string;
    observacoes: string;
    origem: OrigemRegistroVacinal;
}

const CALENDARIO_NACIONAL_URL =
    "https://www.gov.br/saude/pt-br/vacinacao/calendario";

function dataLocalISO() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function novoFormularioDose(): FormularioDose {
    return {
        vacina: VACINAS_REGISTRAVEIS[0],
        outraVacina: "",
        dose: "",
        dataAplicacao: dataLocalISO(),
        unidade: "",
        lote: "",
        observacoes: "",
        origem: "caderneta",
    };
}

function normalizarNomeVacina(nome: string) {
    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .replace(/\s*\(.*?\)/g, "")
        .replace(/\s+conforme.*/g, "")
        .replace(/\s+dos\s+\d+.*/g, "")
        .replace(/s\b/g, "")
        .trim();
}

function temRegistroDaVacina(vacina: string, registros: RegistroDoseVacinal[]) {
    const vacinaEsperada = normalizarNomeVacina(vacina);
    if (
        vacinaEsperada.startsWith("outra vacina") ||
        vacinaEsperada.startsWith("vacina especifica")
    ) {
        return false;
    }

    return registros.some((registro) => {
        const vacinaRegistrada = normalizarNomeVacina(registro.vacina);
        return (
            vacinaRegistrada === vacinaEsperada ||
            vacinaRegistrada.startsWith(vacinaEsperada) ||
            vacinaEsperada.startsWith(vacinaRegistrada)
        );
    });
}

function calcularIdade(dataNascimento: string): IdadePaciente | null {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento);
    if (!partes) return null;

    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const nascimento = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    if (
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia ||
        nascimento > new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    ) {
        return null;
    }

    let totalMeses =
        (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() - (mes - 1));
    if (hoje.getDate() < dia) totalMeses -= 1;

    let anos = hoje.getFullYear() - ano;
    if (
        hoje.getMonth() < mes - 1 ||
        (hoje.getMonth() === mes - 1 && hoje.getDate() < dia)
    ) {
        anos -= 1;
    }

    const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const nascimentoUtc = Date.UTC(ano, mes - 1, dia);

    return {
        anos,
        meses: Math.max(0, totalMeses % 12),
        totalMeses: Math.max(0, totalMeses),
        dias: Math.floor((hojeUtc - nascimentoUtc) / 86_400_000),
        dataFormatada: nascimento.toLocaleDateString("pt-BR"),
    };
}

function obterFaixaEtaria(anos: number) {
    if (anos < 10) return VACINAS_POR_FAIXA_ETARIA[0];
    if (anos < 20) return VACINAS_POR_FAIXA_ETARIA[1];
    if (anos < 25) return VACINAS_POR_FAIXA_ETARIA[2];
    if (anos < 60) return VACINAS_POR_FAIXA_ETARIA[3];
    return VACINAS_POR_FAIXA_ETARIA[4];
}

function formatarIdade(idade: IdadePaciente) {
    if (idade.anos === 0) {
        if (idade.totalMeses === 0) {
            return idade.dias === 1 ? "1 dia" : `${idade.dias} dias`;
        }

        return idade.meses > 0
            ? `${idade.totalMeses} ${idade.totalMeses === 1 ? "mês" : "meses"}`
            : `${idade.anos} anos`;
    }

    if (idade.meses === 0) {
        return `${idade.anos} ${idade.anos === 1 ? "ano" : "anos"}`;
    }

    return `${idade.anos} ${idade.anos === 1 ? "ano" : "anos"} e ${idade.meses} ${
        idade.meses === 1 ? "mês" : "meses"
    }`;
}

function obterMarcosInfantis(totalMeses: number) {
    const futuros = MARCOS_CALENDARIO_INFANTIL.filter(
        (marco) => marco.idadeMeses >= totalMeses
    );

    return futuros.length > 0
        ? futuros.slice(0, 4)
        : MARCOS_CALENDARIO_INFANTIL.slice(-2);
}

interface VacinasProps {
    onEditProfile?: () => void;
}

function Vacinas({ onEditProfile }: VacinasProps) {
    const perfil = usePerfil();
    const idade = calcularIdade(perfil.dataNascimento);
    const faixaEtaria = idade ? obterFaixaEtaria(idade.anos) : null;
    const [secao, setSecao] = useState<SecaoVacinas>("cartao");
    const [buscaUnidade, setBuscaUnidade] = useState("");
    const [registros, setRegistros] = useState<RegistroDoseVacinal[]>([]);
    const [registrosCarregados, setRegistrosCarregados] = useState(false);
    const [erroRegistros, setErroRegistros] = useState("");
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [registroEditando, setRegistroEditando] = useState<string | null>(null);
    const [formularioDose, setFormularioDose] = useState<FormularioDose>(
        novoFormularioDose
    );
    const [filtroCarteira, setFiltroCarteira] = useState<
        "todas" | "registradas" | "conferir"
    >("todas");
    const [mensagemRegistros, setMensagemRegistros] = useState("");
    const cartaoTabRef = useRef<HTMLButtonElement>(null);
    const disponibilidadeTabRef = useRef<HTMLButtonElement>(null);
    const termoBusca = buscaUnidade.trim().toLocaleLowerCase("pt-BR");

    useEffect(() => {
        function atualizarRegistros() {
            try {
                setRegistros(carregarRegistrosVacinais());
                setErroRegistros("");
            } catch (erro) {
                setErroRegistros(
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível carregar os registros de vacinação."
                );
            } finally {
                setRegistrosCarregados(true);
            }
        }

        atualizarRegistros();
        window.addEventListener(
            REGISTROS_VACINAIS_ATUALIZADOS,
            atualizarRegistros
        );
        window.addEventListener("storage", atualizarRegistros);

        return () => {
            window.removeEventListener(
                REGISTROS_VACINAIS_ATUALIZADOS,
                atualizarRegistros
            );
            window.removeEventListener("storage", atualizarRegistros);
        };
    }, []);


    useEffect(() => {
        if (!formularioAberto) return;
        function aoTeclar(evento: { key: string }) {
            if (evento.key !== "Escape") return;
            setFormularioAberto(false);
            setRegistroEditando(null);
            setFormularioDose(novoFormularioDose());
            setErroRegistros("");
        }
        window.addEventListener("keydown", aoTeclar);
        return () => window.removeEventListener("keydown", aoTeclar);
    }, [formularioAberto]);

    const vacinasDaFaixa = faixaEtaria?.vacinas.filter(
        (vacina) => !vacina.toLocaleLowerCase("pt-BR").startsWith("outras vacinas")
    ) ?? [];
    const itensParaConferir = vacinasDaFaixa.filter(
        (vacina) => !temRegistroDaVacina(vacina, registros)
    );
    const vacinasRegistradas = useMemo(() => {
        const vacinas = new Map<string, { nome: string; totalDoses: number }>();
        for (const registro of registros) {
            const chave = normalizarNomeVacina(registro.vacina);
            const atual = vacinas.get(chave);
            vacinas.set(chave, {
                nome: atual?.nome ?? registro.vacina,
                totalDoses: (atual?.totalDoses ?? 0) + 1,
            });
        }
        return [...vacinas.values()].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
        );
    }, [registros]);
    const registrosOrdenados = useMemo(
        () =>
            [...registros].sort((a, b) =>
                b.dataAplicacao.localeCompare(a.dataAplicacao)
            ),
        [registros]
    );

    function dataAplicacaoFormatada(data: string) {
        const [ano, mes, dia] = data.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function cancelarFormulario() {
        setFormularioAberto(false);
        setRegistroEditando(null);
        setFormularioDose(novoFormularioDose());
        setErroRegistros("");
    }

    function iniciarNovoRegistro() {
        setFormularioDose(novoFormularioDose());
        setRegistroEditando(null);
        setFormularioAberto(true);
        setMensagemRegistros("");
    }

    function iniciarEdicao(registro: RegistroDoseVacinal) {
        const catalogoContemVacina = VACINAS_REGISTRAVEIS.some(
            (vacina) => vacina === registro.vacina
        );
        setFormularioDose({
            vacina: catalogoContemVacina ? registro.vacina : "Outra vacina",
            outraVacina: catalogoContemVacina ? "" : registro.vacina,
            dose: registro.dose,
            dataAplicacao: registro.dataAplicacao,
            unidade: registro.unidade,
            lote: registro.lote,
            observacoes: registro.observacoes,
            origem: registro.origem,
        });
        setRegistroEditando(registro.id);
        setFormularioAberto(true);
        setMensagemRegistros("");
    }

    function salvarDose(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!registrosCarregados) return;

        const vacina =
            formularioDose.vacina === "Outra vacina"
                ? formularioDose.outraVacina.trim()
                : formularioDose.vacina;
        if (!vacina) {
            setErroRegistros("Informe o nome da vacina.");
            return;
        }
        if (formularioDose.dataAplicacao > dataLocalISO()) {
            setErroRegistros("A data de aplicação não pode ser futura.");
            return;
        }

        const novoRegistro: RegistroDoseVacinal = {
            id: registroEditando ?? crypto.randomUUID(),
            vacina,
            dose: formularioDose.dose.trim(),
            dataAplicacao: formularioDose.dataAplicacao,
            unidade: formularioDose.unidade.trim(),
            lote: formularioDose.lote.trim(),
            observacoes: formularioDose.observacoes.trim(),
            origem: formularioDose.origem,
        };
        const novosRegistros = registroEditando
            ? registros.map((registro) =>
                  registro.id === registroEditando ? novoRegistro : registro
              )
            : [novoRegistro, ...registros];

        try {
            salvarRegistrosVacinais(novosRegistros);
            setRegistros(novosRegistros);
            setErroRegistros("");
            setMensagemRegistros(
                registroEditando
                    ? "Registro atualizado."
                    : "Dose adicionada à carteira deste navegador."
            );
            setFormularioAberto(false);
            setRegistroEditando(null);
            setFormularioDose(novoFormularioDose());
        } catch (erro) {
            setErroRegistros(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar a dose."
            );
        }
    }

    function excluirDose(registroId: string) {
        if (!window.confirm("Deseja excluir este registro de vacinação?")) return;

        const novosRegistros = registros.filter(
            (registro) => registro.id !== registroId
        );
        try {
            salvarRegistrosVacinais(novosRegistros);
            setRegistros(novosRegistros);
            setErroRegistros("");
            setMensagemRegistros("Registro excluído.");
        } catch (erro) {
            setErroRegistros(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível excluir o registro."
            );
        }
    }

    function navegarAbas(evento: KeyboardEvent<HTMLDivElement>) {
        if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;

        evento.preventDefault();
        const proximaSecao =
            secao === "cartao" ? "disponibilidade" : "cartao";
        setSecao(proximaSecao);
        (proximaSecao === "cartao"
            ? cartaoTabRef.current
            : disponibilidadeTabRef.current
        )?.focus();
    }

    const unidadesFiltradas = useMemo(
        () =>
            UNIDADES_COM_VACINACAO.filter((unidade) =>
                `${unidade.nome} ${unidade.bairro} ${unidade.endereco}`
                    .toLocaleLowerCase("pt-BR")
                    .includes(termoBusca)
            ),
        [termoBusca]
    );

    return (
        <div className="vacinacao-page">
            <div className="ag-header">
                <div>
                    <span className="ag-breadcrumb">Início / Minha saúde / Vacinação</span>
                    <h1>Vacinação</h1>
                    <p>Consulte informações oficiais e mantenha sua caderneta em dia.</p>
                </div>
            </div>

            <div
                className="vacinacao-tabs"
                role="tablist"
                aria-label="Seções de vacinação"
                onKeyDown={navegarAbas}
            >
                <button
                    ref={cartaoTabRef}
                    id="tab-cartao"
                    type="button"
                    role="tab"
                    aria-selected={secao === "cartao"}
                    aria-controls="painel-cartao"
                    className={secao === "cartao" ? "active" : ""}
                    onClick={() => setSecao("cartao")}
                >
                    Minha carteira
                </button>
                <button
                    ref={disponibilidadeTabRef}
                    id="tab-disponibilidade"
                    type="button"
                    role="tab"
                    aria-selected={secao === "disponibilidade"}
                    aria-controls="painel-disponibilidade"
                    className={secao === "disponibilidade" ? "active" : ""}
                    onClick={() => setSecao("disponibilidade")}
                >
                    Calendário e unidades
                </button>
            </div>

            {secao === "cartao" ? (
                <section
                    id="painel-cartao"
                    className="vacinacao-painel"
                    role="tabpanel"
                    aria-labelledby="tab-cartao"
                >

                    <div className="vacinacao-carteira">
                        <div className="vacinacao-carteira-topo">
                            <div>
                                <span className="vacinacao-carteira-chip">
                                    <span className="vacinacao-carteira-dot" aria-hidden="true" />
                                    Resumo do perfil
                                </span>
                                <h2 id="titulo-cartao-vacina">Minha carteira de vacinação</h2>
                                {idade && faixaEtaria && (
                                    <p>
                                        {formatarIdade(idade)} · {faixaEtaria.nome}
                                    </p>
                                )}
                            </div>
                            <span className="vacinacao-carteira-simbolo" aria-hidden="true">
                                <Icon name="escudo" size={46} />
                            </span>
                        </div>

                        <dl className="vacinacao-carteira-campos">
                            <div>
                                <dt>Paciente</dt>
                                <dd>{perfil.nome || "Não informado"}</dd>
                            </div>
                            <div>
                                <dt>Data de nascimento</dt>
                                <dd>{idade?.dataFormatada || "Não informada"}</dd>
                            </div>
                            <div>
                                <dt>Cartão SUS</dt>
                                <dd>{perfil.cartaoSus || "Não informado"}</dd>
                            </div>
                        </dl>
                    </div>


                    <section className="vacinacao-registros-painel" aria-labelledby="titulo-registros">
                        <div className="vacinacao-registros-cabecalho">
                            <div>
                                <span className="vacinacao-selo">Sua caderneta</span>
                                <h3 id="titulo-registros">Doses de vacinação</h3>
                                <p>
                                    Registre as aplicações conferindo sua caderneta física
                                    ou comprovante.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ag-btn-primary"
                                onClick={iniciarNovoRegistro}
                                disabled={!registrosCarregados || Boolean(erroRegistros)}
                            >
                                <Icon name="mais" />
                                Adicionar dose
                            </button>
                        </div>

                        <div
                            className="vacinacao-resumo-registros"
                            role="group"
                            aria-label="Filtrar a carteira"
                        >
                            <button
                                type="button"
                                className={`vacinacao-stat ${filtroCarteira === "todas" ? "active" : ""}`}
                                aria-pressed={filtroCarteira === "todas"}
                                onClick={() => setFiltroCarteira("todas")}
                            >
                                <span className="vacinacao-stat-icone" aria-hidden="true">
                                    <Icon name="seringa" size={22} />
                                </span>
                                <span className="vacinacao-stat-texto">
                                    <strong>
                                        <CountUp value={registros.length} />
                                    </strong>
                                    <span>Doses registradas</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`vacinacao-stat ${filtroCarteira === "registradas" ? "active" : ""}`}
                                aria-pressed={filtroCarteira === "registradas"}
                                onClick={() => setFiltroCarteira("registradas")}
                            >
                                <span className="vacinacao-stat-icone" aria-hidden="true">
                                    <Icon name="check" size={22} />
                                </span>
                                <span className="vacinacao-stat-texto">
                                    <strong>
                                        <CountUp value={vacinasRegistradas.length} />
                                    </strong>
                                    <span>Vacinas com doses registradas</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`vacinacao-stat ${filtroCarteira === "conferir" ? "active" : ""}`}
                                aria-pressed={filtroCarteira === "conferir"}
                                onClick={() => setFiltroCarteira("conferir")}
                            >
                                <span className="vacinacao-stat-icone" aria-hidden="true">
                                    <Icon name="lista" size={22} />
                                </span>
                                <span className="vacinacao-stat-texto">
                                    <strong>
                                        {faixaEtaria ? (
                                            <CountUp value={itensParaConferir.length} />
                                        ) : (
                                            "—"
                                        )}
                                    </strong>
                                    <span>Referências a conferir</span>
                                </span>
                            </button>
                        </div>

                        {mensagemRegistros && (
                            <div className="ag-alert ag-alert--sucesso" role="status">
                                <Icon name="check" />
                                <span>{mensagemRegistros}</span>
                            </div>
                        )}
                        {erroRegistros && !formularioAberto && (
                            <div className="ag-alert ag-alert--erro" role="alert">
                                <Icon name="alerta" />
                                <span>{erroRegistros}</span>
                            </div>
                        )}

                        <div className="vacinacao-aviso vacinacao-aviso-informativo" role="note">
                            <Icon name="info" size={20} />
                            <div>
                                <strong>Privacidade e conferência</strong>
                                <p>
                                    Os registros ficam somente neste navegador e não são enviados
                                    ao SUS nem sincronizados entre dispositivos. Eles são informados
                                    por você e não têm validação profissional. “Sem registro” quer
                                    dizer que a dose não foi cadastrada aqui; não confirma que esteja
                                    faltando ou atrasada.
                                </p>
                            </div>
                        </div>

                        {filtroCarteira === "conferir" ? (
                            <div className="vacinacao-lista-carteira">
                                <h4>Referências sem registro neste app</h4>
                                <p>
                                    Confira cada item na caderneta. Esta lista não determina
                                    doses faltantes nem substitui a avaliação da unidade.
                                </p>
                                {!faixaEtaria ? (
                                    <p>Informe a data de nascimento no perfil para ver referências por idade.</p>
                                ) : itensParaConferir.length > 0 ? (
                                    <ul>
                                        {itensParaConferir.map((vacina) => (
                                            <li key={vacina}>
                                                <span>{vacina}</span>
                                                <strong className="vacinacao-etiqueta vacinacao-etiqueta-atencao">
                                                    Sem registro no app
                                                </strong>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>
                                        Há registros para todas as referências desta faixa no
                                        app. Isso não confirma o esquema completo; confira as doses.
                                    </p>
                                )}
                            </div>
                        ) : filtroCarteira === "registradas" ? (
                            <div className="vacinacao-lista-carteira">
                                <h4>Vacinas com dose cadastrada</h4>
                                <p>
                                    A presença de um registro não confirma que todas as doses
                                    ou reforços do esquema estejam completos.
                                </p>
                                {vacinasRegistradas.length > 0 ? (
                                    <ul>
                                        {vacinasRegistradas.map((vacina) => (
                                            <li key={vacina.nome}>
                                                <span>{vacina.nome}</span>
                                                <strong className="vacinacao-etiqueta">
                                                    {vacina.totalDoses}{" "}
                                                    {vacina.totalDoses === 1
                                                        ? "dose cadastrada"
                                                        : "doses cadastradas"}
                                                </strong>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Ainda não há vacinas desta faixa etária cadastradas.</p>
                                )}
                            </div>
                        ) : (
                            <div className="vacinacao-doses-lista">
                                <h4>Todas as doses cadastradas</h4>
                                {!registrosCarregados ? (
                                    <p>Carregando registros...</p>
                                ) : registrosOrdenados.length > 0 ? (
                                    <ul className="vacinacao-doses-grade">
                                        {registrosOrdenados.map((registro) => (
                                            <li key={registro.id} className="vacinacao-dose">
                                                <div className="vacinacao-dose-topo">
                                                    <span className="vacinacao-dose-icone" aria-hidden="true">
                                                        <Icon name="seringa" size={20} />
                                                    </span>
                                                    <div className="vacinacao-dose-titulo">
                                                        <strong>{registro.vacina}</strong>
                                                        <span className="vacinacao-etiqueta">{registro.dose}</span>
                                                    </div>
                                                </div>

                                                <ul className="vacinacao-dose-detalhes">
                                                    <li>
                                                        <Icon name="calendario" size={16} />
                                                        <span>
                                                            Aplicada em {dataAplicacaoFormatada(registro.dataAplicacao)}
                                                        </span>
                                                    </li>
                                                    <li>
                                                        <Icon name="caderneta" size={16} />
                                                        <span>
                                                            {registro.origem === "caderneta"
                                                                ? "Caderneta física"
                                                                : "Comprovante"}
                                                        </span>
                                                    </li>
                                                    {registro.unidade && (
                                                        <li>
                                                            <Icon name="local" size={16} />
                                                            <span>Unidade: {registro.unidade}</span>
                                                        </li>
                                                    )}
                                                    {registro.lote && (
                                                        <li>
                                                            <Icon name="lista" size={16} />
                                                            <span>Lote: {registro.lote}</span>
                                                        </li>
                                                    )}
                                                    {registro.observacoes && (
                                                        <li>
                                                            <Icon name="info" size={16} />
                                                            <span>{registro.observacoes}</span>
                                                        </li>
                                                    )}
                                                </ul>

                                                <div className="vacinacao-acoes-dose">
                                                    <button
                                                        type="button"
                                                        className="ag-btn-outline"
                                                        aria-label={`Editar dose de ${registro.vacina}`}
                                                        onClick={() => iniciarEdicao(registro)}
                                                    >
                                                        <Icon name="editar" size={16} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="ag-btn-danger-text"
                                                        aria-label={`Excluir dose de ${registro.vacina}`}
                                                        onClick={() => excluirDose(registro.id)}
                                                    >
                                                        <Icon name="lixeira" size={16} />
                                                        Excluir
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="ag-empty vacinacao-sem-registros">
                                        <span className="ag-empty-icon" aria-hidden="true">
                                            <Icon name="seringa" size={30} />
                                        </span>
                                        <h3>Nenhuma dose cadastrada</h3>
                                        <p>
                                            Adicione as aplicações que constam na caderneta ou
                                            comprovante de vacinação.
                                        </p>
                                        <button
                                            type="button"
                                            className="ag-btn-primary"
                                            onClick={iniciarNovoRegistro}
                                            disabled={!registrosCarregados || Boolean(erroRegistros)}
                                        >
                                            <Icon name="mais" />
                                            Adicionar dose
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>


                    <section className="vacinacao-personalizado" aria-labelledby="titulo-faixa-etaria">
                        <div className="vacinacao-personalizado-topo">
                            <div>
                                <span className="vacinacao-selo">Referência por idade</span>
                                <h3 id="titulo-faixa-etaria">
                                    {faixaEtaria ? faixaEtaria.nome : "Personalize seu calendário"}
                                </h3>
                                <p>
                                    {idade && faixaEtaria
                                        ? `${formatarIdade(idade)} · ${faixaEtaria.faixa}`
                                        : "Informe sua data de nascimento no perfil para identificar sua faixa etária."}
                                </p>
                            </div>
                            {onEditProfile && (
                                <button
                                    type="button"
                                    className="ag-btn-outline vacinacao-link-perfil"
                                    onClick={onEditProfile}
                                >
                                    {idade ? "Atualizar perfil" : "Completar perfil"}
                                </button>
                            )}
                        </div>

                        {faixaEtaria ? (
                            <>
                                <p className="vacinacao-personalizado-resumo">
                                    {faixaEtaria.resumo}
                                </p>
                                <ul className="vacinacao-vacinas-faixa">
                                    {faixaEtaria.vacinas.map((vacina) => (
                                        <li key={vacina}>{vacina}</li>
                                    ))}
                                </ul>
                                {faixaEtaria.id === "crianca" && idade && (
                                    <div className="vacinacao-proximos-marcos">
                                        <h4>Marcos do calendário infantil por idade</h4>
                                        <p>
                                            Referências do calendário oficial. Não indicam doses
                                            pendentes sem conferência da caderneta.
                                        </p>
                                        <ul>
                                            {obterMarcosInfantis(idade.totalMeses).map((marco) => (
                                                <li key={marco.idadeMeses}>
                                                    <strong>{marco.idade}</strong>
                                                    <span>{marco.vacinas.join(" · ")}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="vacinacao-personalizado-resumo">
                                O calendário nacional está organizado por faixa etária. A
                                personalização considera somente a idade e não avalia doses,
                                histórico vacinal ou condições individuais.
                            </p>
                        )}
                        <p className="vacinacao-nota-gestacao">
                            Gestação e condições de saúde podem alterar as orientações. Se
                            aplicável, consulte a equipe de saúde para um calendário específico.
                        </p>
                    </section>

                    <div className="vacinacao-aviso vacinacao-aviso-informativo" role="note">
                        <Icon name="info" size={20} />
                        <div>
                            <strong>Sobre os registros</strong>
                            <p>
                                Os dados exibidos são cadastrados manualmente por você e ficam
                                apenas neste navegador. Eles não são registros oficiais, não
                                substituem a caderneta ou o Meu SUS Digital e não são enviados à
                                unidade de saúde. Para confirmar seu histórico, confira a
                                caderneta e procure um profissional.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="ag-btn-primary vacinacao-acao-final"
                        onClick={() => setSecao("disponibilidade")}
                    >
                        Consultar calendário oficial e unidades
                    </button>
                </section>
            ) : (
                <section
                    id="painel-disponibilidade"
                    className="vacinacao-painel"
                    role="tabpanel"
                    aria-labelledby="tab-disponibilidade"
                >
                    <div className="vacinacao-aviso" role="note">
                        <Icon name="alerta" size={20} />
                        <div>
                            <strong>Orientação importante</strong>
                            <p>
                                As vacinas e doses indicadas dependem da idade, do histórico
                                vacinal, da gestação e de condições de saúde. Esta página não
                                calcula doses em atraso nem substitui a avaliação de um
                                profissional de saúde. Confirme a indicação na unidade de saúde.
                            </p>
                        </div>
                    </div>

                    <section className="vacinacao-calendario" aria-labelledby="titulo-calendario">
                        <div className="vacinacao-subtitulo">
                            <span className="vacinacao-selo">Ministério da Saúde · PNI</span>
                            <h2 id="titulo-calendario">Calendário Nacional de Vacinação</h2>
                            <p>
                                Consulte a versão oficial para ver vacinas, doses e
                                recomendações atualizadas para cada grupo.
                            </p>
                        </div>

                        {faixaEtaria && (
                            <div className="vacinacao-faixa-oficial">
                                <strong>Faixa selecionada pelo perfil: {faixaEtaria.nome}</strong>
                                <span>{faixaEtaria.faixa}</span>
                            </div>
                        )}
                        <ul className="vacinacao-grupos">
                            {VACINAS_POR_FAIXA_ETARIA.map((grupo) => (
                                <li
                                    key={grupo.id}
                                    className={grupo.id === faixaEtaria?.id ? "faixa-selecionada" : ""}
                                >
                                    <div className="vacinacao-grupo-topo">
                                        <span className="vacinacao-grupo-icone" aria-hidden="true">
                                            <Icon name="escudo" size={20} />
                                        </span>
                                        <div>
                                            <strong>{grupo.nome}</strong>
                                            <span>{grupo.faixa}</span>
                                        </div>
                                        {grupo.id === faixaEtaria?.id && (
                                            <em className="vacinacao-selo-faixa">Sua faixa</em>
                                        )}
                                    </div>
                                    <ul className="vacinacao-grupo-vacinas">
                                        {grupo.vacinas.map((vacina) => (
                                            <li key={vacina}>{vacina}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>

                        <a
                            className="ag-btn-outline vacinacao-fonte-oficial"
                            href={CALENDARIO_NACIONAL_URL}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Acessar calendário oficial do Ministério da Saúde
                            <Icon name="externo" size={16} />
                        </a>
                    </section>

                    <section className="vacinacao-unidades-section" aria-labelledby="titulo-unidades">
                        <div className="vacinacao-subtitulo">
                            <span className="vacinacao-selo">Informações locais</span>
                            <h2 id="titulo-unidades">Unidades cadastradas no SaquaCare</h2>
                            <p>
                                Esta lista local do projeto não é sincronizada nem validada
                                em tempo real com a Secretaria de Saúde. Confirme o endereço,
                                horário, telefone e a oferta do serviço diretamente com a
                                unidade antes de se deslocar.
                            </p>
                        </div>

                        <label className="vacinacao-busca">
                            <span>Buscar unidade por nome, bairro ou endereço</span>
                            <span className="vacinacao-busca-campo">
                                <Icon name="busca" />
                                <input
                                    type="search"
                                    value={buscaUnidade}
                                    onChange={(evento) => setBuscaUnidade(evento.target.value)}
                                    placeholder="Ex.: Bacaxá ou Água Branca"
                                />
                            </span>
                        </label>

                        {unidadesFiltradas.length > 0 ? (
                            <ul className="vacinacao-unidades-grade">
                                {unidadesFiltradas.map((unidade) => (
                                    <li key={unidade.nome} className="vacinacao-unidade">
                                        <strong>{unidade.nome}</strong>
                                        <ul>
                                            <li>
                                                <Icon name="local" size={16} />
                                                <span>
                                                    {unidade.bairro} · {unidade.endereco}
                                                </span>
                                            </li>
                                            <li>
                                                <Icon name="relogio" size={16} />
                                                <span>{unidade.horario}</span>
                                            </li>
                                            {unidade.telefone && (
                                                <li>
                                                    <Icon name="telefone" size={16} />
                                                    <a href={`tel:${unidade.telefone.replace(/\D/g, "")}`}>
                                                        Telefone: {unidade.telefone}
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="ag-empty vacinacao-sem-resultados">
                                <span className="ag-empty-icon" aria-hidden="true">
                                    <Icon name="busca" size={30} />
                                </span>
                                <h3>Nenhuma unidade encontrada</h3>
                                <p>Tente buscar por outro nome, bairro ou endereço.</p>
                            </div>
                        )}
                    </section>
                </section>
            )}

            {formularioAberto && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(evento) => {
                        if (evento.target === evento.currentTarget) cancelarFormulario();
                    }}
                >
                    <div
                        className="ag-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vc-modal-titulo"
                    >
                        <div className="ag-modal-header">
                            <div>
                                <h2 id="vc-modal-titulo">
                                    {registroEditando ? "Atualizar dose" : "Registrar dose aplicada"}
                                </h2>
                                <p className="ag-modal-subtitle">
                                    Confira os dados na caderneta física ou no comprovante.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="ag-modal-close"
                                aria-label="Fechar"
                                onClick={cancelarFormulario}
                            >
                                <Icon name="fechar" size={18} />
                            </button>
                        </div>

                        <form onSubmit={salvarDose}>
                            <div className="ag-modal-body">
                                {erroRegistros && (
                                    <div className="ag-alert ag-alert--erro" role="alert">
                                        <Icon name="alerta" />
                                        <span>{erroRegistros}</span>
                                    </div>
                                )}

                                <div className="ag-form-group">
                                    <label htmlFor="vc-vacina">Vacina</label>
                                    <select
                                        id="vc-vacina"
                                        value={formularioDose.vacina}
                                        onChange={(evento) =>
                                            setFormularioDose((atual) => ({
                                                ...atual,
                                                vacina: evento.target.value,
                                            }))
                                        }
                                        required
                                    >
                                        {VACINAS_REGISTRAVEIS.map((vacina) => (
                                            <option key={vacina} value={vacina}>
                                                {vacina}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formularioDose.vacina === "Outra vacina" && (
                                    <div className="ag-form-group">
                                        <label htmlFor="vc-outra">Nome da vacina</label>
                                        <input
                                            id="vc-outra"
                                            value={formularioDose.outraVacina}
                                            onChange={(evento) =>
                                                setFormularioDose((atual) => ({
                                                    ...atual,
                                                    outraVacina: evento.target.value,
                                                }))
                                            }
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label htmlFor="vc-dose">Dose conforme a caderneta</label>
                                        <input
                                            id="vc-dose"
                                            value={formularioDose.dose}
                                            onChange={(evento) =>
                                                setFormularioDose((atual) => ({
                                                    ...atual,
                                                    dose: evento.target.value,
                                                }))
                                            }
                                            placeholder="Ex.: 1ª dose, reforço"
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                    <div className="ag-form-group">
                                        <label htmlFor="vc-data">Data de aplicação</label>
                                        <input
                                            id="vc-data"
                                            type="date"
                                            value={formularioDose.dataAplicacao}
                                            max={dataLocalISO()}
                                            onChange={(evento) =>
                                                setFormularioDose((atual) => ({
                                                    ...atual,
                                                    dataAplicacao: evento.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="vc-origem">Origem da informação</label>
                                    <select
                                        id="vc-origem"
                                        value={formularioDose.origem}
                                        onChange={(evento) =>
                                            setFormularioDose((atual) => ({
                                                ...atual,
                                                origem:
                                                    evento.target.value === "comprovante"
                                                        ? "comprovante"
                                                        : "caderneta",
                                            }))
                                        }
                                    >
                                        <option value="caderneta">Caderneta física</option>
                                        <option value="comprovante">Comprovante de vacinação</option>
                                    </select>
                                </div>

                                <div className="ag-form-row">
                                    <div className="ag-form-group">
                                        <label htmlFor="vc-unidade">
                                            Unidade de saúde{" "}
                                            <small className="vacinacao-opcional">(opcional)</small>
                                        </label>
                                        <input
                                            id="vc-unidade"
                                            value={formularioDose.unidade}
                                            onChange={(evento) =>
                                                setFormularioDose((atual) => ({
                                                    ...atual,
                                                    unidade: evento.target.value,
                                                }))
                                            }
                                            maxLength={120}
                                        />
                                    </div>
                                    <div className="ag-form-group">
                                        <label htmlFor="vc-lote">
                                            Lote{" "}
                                            <small className="vacinacao-opcional">(opcional)</small>
                                        </label>
                                        <input
                                            id="vc-lote"
                                            value={formularioDose.lote}
                                            onChange={(evento) =>
                                                setFormularioDose((atual) => ({
                                                    ...atual,
                                                    lote: evento.target.value,
                                                }))
                                            }
                                            maxLength={60}
                                        />
                                    </div>
                                </div>

                                <div className="ag-form-group">
                                    <label htmlFor="vc-obs">
                                        Observações{" "}
                                        <small className="vacinacao-opcional">(opcional)</small>
                                    </label>
                                    <textarea
                                        id="vc-obs"
                                        value={formularioDose.observacoes}
                                        onChange={(evento) =>
                                            setFormularioDose((atual) => ({
                                                ...atual,
                                                observacoes: evento.target.value,
                                            }))
                                        }
                                        rows={3}
                                        maxLength={300}
                                    />
                                </div>
                            </div>

                            <div className="ag-modal-footer">
                                <button
                                    type="button"
                                    className="ag-btn-outline"
                                    onClick={cancelarFormulario}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="ag-btn-primary">
                                    {registroEditando ? "Salvar alterações" : "Salvar dose"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vacinas;
