import {
    carregarAgendamentos,
    criarAgendamento,
    formatarDataBr,
} from "./agendamentoService";

export type TipoProfissional =
    | "Médico"
    | "Enfermeiro"
    | "Psicólogo"
    | "Fisioterapeuta"
    | "Nutricionista"
    | "Equipe Interna / RH";

export type StatusFila =
    | "Aguardando"
    | "Em Triagem"
    | "Em Atendimento"
    | "Finalizado"
    | "Falta";

export interface ProfissionalSaude {
    id: number;
    matricula: string;
    nome: string;
    cpf: string;
    tipoProfissional: TipoProfissional;
    especialidade: string;
    registroConselho: string;
    unidade: string;
    emailInstitucional: string;
    telefone?: string;
    foto?: string;
    senha?: string;
    senhaTemporaria: boolean;
    ativo: boolean;
    cargaHorariaSemanal: number;
    criadoEm: string;
}

export interface DadosTriagem {
    pressaoArterial?: string;
    temperatura?: string;
    saturacao?: string;
    classificacaoRisco?: "Baixo Risco (Azul)" | "Pouco Urgente (Verde)" | "Urgente (Amarelo)" | "Muito Urgente (Laranja)";
}

export interface EvolucaoProntuario {
    id: string;
    atendimentoId: string;
    pacienteId: number;
    pacienteNome: string;
    profissionalId: number;
    profissionalNome: string;
    especialidade: string;
    dataRegistro: string;
    diagnostico: string;
    prescricao: string;
    observacoes: string;
    encaminhamento?: string;
}

export interface ItemFilaAtendimento {
    id: string;
    protocolo: string;
    senhaFila: string;
    horario: string;
    data: string;
    dataIso: string;
    tipoAtendimento: "Consulta" | "Retorno" | "Exame";
    status: StatusFila;
    motivoConsulta: string;
    profissionalId: number;
    profissionalMatricula: string;
    profissionalNome: string;
    especialidade: string;
    unidade: string;
    tempoEsperaMinutos: number;
    triagem?: DadosTriagem;
    paciente: {
        id: number;
        nome: string;
        cpfMascarado: string;
        cartaoSus: string;
        dataNascimento: string;
        idade: number;
        telefone: string;
        alergias: string[];
        historicoConsultas: string[];
    };
}

const PROFISSIONAIS_STORAGE_KEY = "saquacare:profissionais:v1";
const FILA_STORAGE_KEY = "saquacare:fila-atendimentos:v1";
const PRONTUARIOS_STORAGE_KEY = "saquacare:prontuarios:v1";
const PROFISSIONAL_LOGADO_KEY = "@SaquaCare:profissional";
const PROFISSIONAL_TOKEN_KEY = "@SaquaCare:profissional-token";

export const FILA_ATUALIZADA_EVENTO = "saquacare:fila-atualizada";

function obterHojeIso(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function obterDataOffsetIso(diasOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + diasOffset);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

const PROFISSIONAIS_INICIAIS: ProfissionalSaude[] = [
    {
        id: 1,
        matricula: "MED-2026",
        nome: "Dr. Carlos Eduardo Ribeiro",
        cpf: "789.456.123-00",
        tipoProfissional: "Médico",
        especialidade: "Cardiologia",
        registroConselho: "CRM/RJ 543210",
        unidade: "Clínica da Família de Bacaxá",
        emailInstitucional: "carlos.ribeiro@saquacare.gov.br",
        telefone: "(22) 99841-2201",
        senha: "saqua@2026",
        senhaTemporaria: false,
        ativo: true,
        cargaHorariaSemanal: 40,
        criadoEm: "2026-08-10",
    },
    {
        id: 2,
        matricula: "ENF-2026",
        nome: "Enf. Mariana Souza Costa",
        cpf: "321.654.987-10",
        tipoProfissional: "Enfermeiro",
        especialidade: "Clínica Geral",
        registroConselho: "COREN/RJ 319842",
        unidade: "Clínica da Família de Bacaxá",
        emailInstitucional: "mariana.costa@saquacare.gov.br",
        telefone: "(22) 99714-5590",
        senha: "saqua@2026",
        senhaTemporaria: false,
        ativo: true,
        cargaHorariaSemanal: 36,
        criadoEm: "2026-08-12",
    },
    {
        id: 3,
        matricula: "PSI-2026",
        nome: "Dra. Vanessa Albuquerque",
        cpf: "456.123.789-22",
        tipoProfissional: "Psicólogo",
        especialidade: "Psicologia",
        registroConselho: "CRP/RJ 05/48219",
        unidade: "Clínica da Mulher",
        emailInstitucional: "vanessa.albuquerque@saquacare.gov.br",
        telefone: "(22) 99923-1840",
        senha: "saqua@2026",
        senhaTemporaria: true,
        ativo: true,
        cargaHorariaSemanal: 30,
        criadoEm: "2026-09-01",
    },
    {
        id: 4,
        matricula: "FIS-2026",
        nome: "Dr. Rodrigo Mendonça",
        cpf: "654.987.321-44",
        tipoProfissional: "Fisioterapeuta",
        especialidade: "Fisioterapia",
        registroConselho: "CREFITO-2 198420-F",
        unidade: "Clínica do Homem e do Idoso",
        emailInstitucional: "rodrigo.mendonca@saquacare.gov.br",
        telefone: "(22) 99609-7731",
        senha: "saqua@2026",
        senhaTemporaria: true,
        ativo: true,
        cargaHorariaSemanal: 30,
        criadoEm: "2026-09-05",
    },
    {
        id: 5,
        matricula: "RH-2026",
        nome: "Roberto Almeida (Coordenação / RH)",
        cpf: "159.753.486-99",
        tipoProfissional: "Equipe Interna / RH",
        especialidade: "Administração Clínica",
        registroConselho: "ADM/RH-001",
        unidade: "Clínica da Família de Bacaxá",
        emailInstitucional: "rh.gestao@saquacare.gov.br",
        telefone: "(22) 99800-1000",
        senha: "saqua@2026",
        senhaTemporaria: false,
        ativo: true,
        cargaHorariaSemanal: 40,
        criadoEm: "2026-08-01",
    },
];

function gerarFilaInicial(): ItemFilaAtendimento[] {
    const hojeIso = obterHojeIso();
    const hojeBr = formatarDataBr(hojeIso);
    const amanhaIso = obterDataOffsetIso(1);
    const amanhaBr = formatarDataBr(amanhaIso);
    const doisDiasIso = obterDataOffsetIso(2);
    const doisDiasBr = formatarDataBr(doisDiasIso);

    return [
        {
            id: "fila-101",
            protocolo: "SQ-2026-9101",
            senhaFila: "C-01",
            horario: "08:30",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Consulta",
            status: "Em Atendimento",
            motivoConsulta:
                "Dores torácicas leves aos esforços e revisão de anti-hipertensivo.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 12,
            paciente: {
                id: 101,
                nome: "Maria Helena dos Santos",
                cpfMascarado: "***.482.917-**",
                cartaoSus: "704 8012 9931 4401",
                dataNascimento: "14/05/1962",
                idade: 64,
                telefone: "(22) 99812-4410",
                alergias: ["Dipirona Sódica", "Contraste Iodado"],
                historicoConsultas: [
                    "10/08/2026 — Cardiologia (Dr. Carlos Eduardo): Solicitação de Ecocardiograma e ajuste de Losartana 50mg.",
                    "15/05/2026 — Clínica Geral (Enf. Mariana): Triagem de pressão arterial (PA 140x90 mmHg).",
                ],
            },
        },
        {
            id: "fila-102",
            protocolo: "SQ-2026-9102",
            senhaFila: "C-02",
            horario: "09:00",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Retorno",
            status: "Em Triagem",
            motivoConsulta:
                "Apresentação de resultado de Ecocardiograma Transtorácico e Holter 24h.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 18,
            paciente: {
                id: 102,
                nome: "Antônio Jorge Ferreira",
                cpfMascarado: "***.719.304-**",
                cartaoSus: "898 0014 2219 0832",
                dataNascimento: "22/11/1958",
                idade: 67,
                telefone: "(22) 99741-8823",
                alergias: ["Nenhuma alergia medicamentosa relatada"],
                historicoConsultas: [
                    "02/09/2026 — Cardiologia (Dr. Carlos Eduardo): Pedido de Holter 24h por palpitações esporádicas.",
                ],
            },
        },
        {
            id: "fila-103",
            protocolo: "SQ-2026-9103",
            senhaFila: "C-03",
            horario: "09:30",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Consulta",
            status: "Aguardando",
            motivoConsulta:
                "Picos de hipertensão arterial na última semana e cefaleia matinal.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 24,
            paciente: {
                id: 103,
                nome: "Luciana Pereira Gomes",
                cpfMascarado: "***.205.841-**",
                cartaoSus: "702 5510 3841 1190",
                dataNascimento: "03/03/1979",
                idade: 47,
                telefone: "(22) 99904-1129",
                alergias: ["Penicilina", "Ácido Acetilsalicílico (AAS)"],
                historicoConsultas: [
                    "19/07/2026 — Clínica Geral: Encaminhamento para avaliação cardiológica preventiva.",
                ],
            },
        },
        {
            id: "fila-104",
            protocolo: "SQ-2026-9104",
            senhaFila: "C-04",
            horario: "10:15",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Consulta",
            status: "Aguardando",
            motivoConsulta:
                "Avaliação pré-operatória (risco cirúrgico) para cirurgia de catarata.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 15,
            paciente: {
                id: 104,
                nome: "Sebastião Moreira Lima",
                cpfMascarado: "***.910.442-**",
                cartaoSus: "706 1129 4480 7721",
                dataNascimento: "18/09/1954",
                idade: 72,
                telefone: "(22) 99612-3094",
                alergias: ["Amoxicilina"],
                historicoConsultas: [
                    "12/09/2026 — Oftalmologia: Solicitado parecer cardiológico pré-cirúrgico.",
                ],
            },
        },
        {
            id: "fila-105",
            protocolo: "SQ-2026-9105",
            senhaFila: "C-05",
            horario: "08:00",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Retorno",
            status: "Finalizado",
            motivoConsulta:
                "Renovação de receita controlada e controle de dislipidemia.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 8,
            paciente: {
                id: 105,
                nome: "Cláudia Regina Tavares",
                cpfMascarado: "***.638.119-**",
                cartaoSus: "700 4921 8812 5509",
                dataNascimento: "29/01/1971",
                idade: 55,
                telefone: "(22) 99855-6721",
                alergias: ["Nenhuma alergia relatada"],
                historicoConsultas: [
                    "29/10/2026 — Cardiologia (Dr. Carlos Eduardo): Colesterol controlado, mantida Sinvastatina 20mg.",
                ],
            },
        },
        {
            id: "fila-106",
            protocolo: "SQ-2026-9106",
            senhaFila: "T-01",
            horario: "09:15",
            data: hojeBr,
            dataIso: hojeIso,
            tipoAtendimento: "Consulta",
            status: "Aguardando",
            motivoConsulta: "Aferição de pressão arterial, glicemia capilar e triagem de enfermagem.",
            profissionalId: 2,
            profissionalMatricula: "ENF-2026",
            profissionalNome: "Enf. Mariana Souza Costa",
            especialidade: "Clínica Geral",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 10,
            paciente: {
                id: 106,
                nome: "Paulo Roberto Nascimento",
                cpfMascarado: "***.331.709-**",
                cartaoSus: "708 9912 3014 2281",
                dataNascimento: "07/07/1983",
                idade: 43,
                telefone: "(22) 99701-5532",
                alergias: ["Ibuprofeno"],
                historicoConsultas: [
                    "04/06/2026 — Clínica Geral: Acompanhamento Hiperdia.",
                ],
            },
        },
        {
            id: "fila-107",
            protocolo: "SQ-2026-9107",
            senhaFila: "C-06",
            horario: "09:30",
            data: amanhaBr,
            dataIso: amanhaIso,
            tipoAtendimento: "Consulta",
            status: "Aguardando",
            motivoConsulta: "Check-up cardiológico anual e avaliação de exames laboratoriais.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 0,
            paciente: {
                id: 107,
                nome: "Fernanda Azevedo Rocha",
                cpfMascarado: "***.512.890-**",
                cartaoSus: "701 3349 8821 0014",
                dataNascimento: "11/12/1985",
                idade: 40,
                telefone: "(22) 99877-9012",
                alergias: ["Nenhuma alergia relatada"],
                historicoConsultas: [
                    "10/11/2025 — Cardiologia: Exames dentro da normalidade.",
                ],
            },
        },
        {
            id: "fila-108",
            protocolo: "SQ-2026-9108",
            senhaFila: "C-07",
            horario: "14:15",
            data: doisDiasBr,
            dataIso: doisDiasIso,
            tipoAtendimento: "Retorno",
            status: "Aguardando",
            motivoConsulta: "Retorno para avaliação de Mapa 24h.",
            profissionalId: 1,
            profissionalMatricula: "MED-2026",
            profissionalNome: "Dr. Carlos Eduardo Ribeiro",
            especialidade: "Cardiologia",
            unidade: "Clínica da Família de Bacaxá",
            tempoEsperaMinutos: 0,
            paciente: {
                id: 101,
                nome: "Maria Helena dos Santos",
                cpfMascarado: "***.482.917-**",
                cartaoSus: "704 8012 9931 4401",
                dataNascimento: "14/05/1962",
                idade: 64,
                telefone: "(22) 99812-4410",
                alergias: ["Dipirona Sódica", "Contraste Iodado"],
                historicoConsultas: [
                    "10/08/2026 — Cardiologia (Dr. Carlos Eduardo): Solicitação de Ecocardiograma.",
                ],
            },
        },
    ];
}

export function carregarProfissionais(): ProfissionalSaude[] {
    try {
        const salvo = localStorage.getItem(PROFISSIONAIS_STORAGE_KEY);
        if (!salvo) {
            localStorage.setItem(
                PROFISSIONAIS_STORAGE_KEY,
                JSON.stringify(PROFISSIONAIS_INICIAIS)
            );
            return PROFISSIONAIS_INICIAIS;
        }
        return JSON.parse(salvo);
    } catch {
        return PROFISSIONAIS_INICIAIS;
    }
}

export function salvarProfissionais(lista: ProfissionalSaude[]): void {
    localStorage.setItem(PROFISSIONAIS_STORAGE_KEY, JSON.stringify(lista));
    window.dispatchEvent(new Event(FILA_ATUALIZADA_EVENTO));
}

export function obterProfissionalLogado(): ProfissionalSaude | null {
    try {
        const bruto = localStorage.getItem(PROFISSIONAL_LOGADO_KEY);
        if (!bruto) return null;
        return JSON.parse(bruto);
    } catch {
        return null;
    }
}

export function logoutProfissional(): void {
    localStorage.removeItem(PROFISSIONAL_LOGADO_KEY);
    localStorage.removeItem(PROFISSIONAL_TOKEN_KEY);
}

export async function loginProfissional(
    matriculaInput: string,
    senhaInput: string
): Promise<{ token: string; profissional: ProfissionalSaude }> {
    const matriculaLimpa = matriculaInput.trim().toUpperCase();

    const profissionais = carregarProfissionais();
    const encontrado = profissionais.find(
        (p) => p.matricula.toUpperCase() === matriculaLimpa
    );

    if (!encontrado || encontrado.senha !== senhaInput) {
        throw new Error(
            "Matrícula ou senha incorretos. Solicite apoio ao setor de RH / Administração."
        );
    }

    if (!encontrado.ativo) {
        throw new Error(
            "Esta matrícula encontra-se desativada pelo RH. Entre em contato com a Administração."
        );
    }

    const { senha, ...profissionalSemSenha } = encontrado;
    const resultado = {
        token: `token-prof-${encontrado.matricula}-${Date.now()}`,
        profissional: profissionalSemSenha as ProfissionalSaude,
    };

    localStorage.setItem(PROFISSIONAL_TOKEN_KEY, resultado.token);
    localStorage.setItem(
        PROFISSIONAL_LOGADO_KEY,
        JSON.stringify(resultado.profissional)
    );

    return resultado;
}

function obterProfissionalPorEspecialidade(especialidade: string): {
    id: number;
    matricula: string;
    nome: string;
} {
    const profissionais = carregarProfissionais().filter(
        (p) => p.ativo && p.tipoProfissional !== "Equipe Interna / RH"
    );
    const encontrado = profissionais.find(
        (p) =>
            p.especialidade.toLowerCase() ===
            especialidade.trim().toLowerCase()
    );
    if (encontrado) {
        return {
            id: encontrado.id,
            matricula: encontrado.matricula,
            nome: encontrado.nome,
        };
    }
    return {
        id: 1,
        matricula: "MED-2026",
        nome: "Dr. Carlos Eduardo Ribeiro",
    };
}

/**
 * RF15 & RF17: Sincroniza agendamentos criados na área do paciente
 * automaticamente com a fila de atendimento do módulo profissional
 * (Vinculação automática pela Especialidade - Opção 1).
 */
export function carregarFilaAtendimentos(): ItemFilaAtendimento[] {
    let fila: ItemFilaAtendimento[] = [];
    try {
        const bruto = localStorage.getItem(FILA_STORAGE_KEY);
        if (!bruto) {
            fila = gerarFilaInicial();
            localStorage.setItem(FILA_STORAGE_KEY, JSON.stringify(fila));
        } else {
            fila = JSON.parse(bruto);
        }
    } catch {
        fila = gerarFilaInicial();
    }

    // Integração automática com agendamentos feitos pelo paciente (RF15, RF17)
    try {
        const agendamentosPaciente = carregarAgendamentos();
        const userBruto = localStorage.getItem("@SaquaCare:user");
        const usuarioPaciente = userBruto ? JSON.parse(userBruto) : null;
        const perfilBruto = localStorage.getItem("saquacare:perfil:v1");
        const perfilLocal = perfilBruto ? JSON.parse(perfilBruto) : null;
        const nomePacienteLogado =
            usuarioPaciente?.nome ||
            perfilLocal?.nome ||
            "Paciente SaquaCare";
        const susPaciente =
            usuarioPaciente?.numeroSus ||
            perfilLocal?.cartaoSus ||
            "700 1234 5678 9012";

        let houveAdicao = false;
        agendamentosPaciente.forEach((ag, index) => {
            if (ag.status === "Cancelada") return;
            const jaExiste = fila.some((f) => f.protocolo === ag.protocolo);
            if (!jaExiste && ag.id.startsWith("ag-17")) {
                // Vincula automaticamente ao profissional da especialidade escolhida
                const profDesignado = obterProfissionalPorEspecialidade(
                    ag.especialidade
                );
                const prefixo = ag.especialidade.charAt(0).toUpperCase() || "A";
                const numeroSenha = String(fila.length + index + 1).padStart(2, "0");
                const novoItemFila: ItemFilaAtendimento = {
                    id: `fila-pac-${ag.id}`,
                    protocolo: ag.protocolo,
                    senhaFila: `${prefixo}-${numeroSenha}`,
                    horario: ag.horario,
                    data: ag.data,
                    dataIso: ag.dataIso,
                    tipoAtendimento: ag.tipo,
                    status: ag.status === "Concluída" ? "Finalizado" : "Aguardando",
                    motivoConsulta:
                        ag.observacoes ||
                        `Agendamento realizado pelo portal do paciente (${ag.especialidade}).`,
                    profissionalId: profDesignado.id,
                    profissionalMatricula: profDesignado.matricula,
                    profissionalNome: profDesignado.nome,
                    especialidade: ag.especialidade,
                    unidade: ag.unidade,
                    tempoEsperaMinutos: 10,
                    paciente: {
                        id: usuarioPaciente?.id || 999,
                        nome: nomePacienteLogado,
                        cpfMascarado: "***.***.***-**",
                        cartaoSus: susPaciente,
                        dataNascimento:
                            usuarioPaciente?.dataNascimento ||
                            perfilLocal?.dataNascimento ||
                            "1990-01-01",
                        idade: 36,
                        telefone:
                            usuarioPaciente?.telefone ||
                            perfilLocal?.telefone ||
                            "(22) 99999-0000",
                        alergias: ["Não informada na triagem"],
                        historicoConsultas: [
                            "Agendamento realizado pelo portal do paciente.",
                        ],
                    },
                };
                fila = [novoItemFila, ...fila];
                houveAdicao = true;
            }
        });

        if (houveAdicao) {
            localStorage.setItem(FILA_STORAGE_KEY, JSON.stringify(fila));
        }
    } catch {
        // Ignora erro de parse do localStorage
    }

    return fila;
}

export function salvarFilaAtendimentos(fila: ItemFilaAtendimento[]): void {
    localStorage.setItem(FILA_STORAGE_KEY, JSON.stringify(fila));
    window.dispatchEvent(new Event(FILA_ATUALIZADA_EVENTO));
}

export function atualizarStatusAtendimento(
    idAtendimento: string,
    novoStatus: StatusFila
): ItemFilaAtendimento[] {
    const fila = carregarFilaAtendimentos();
    const atualizada = fila.map((item) =>
        item.id === idAtendimento ? { ...item, status: novoStatus } : item
    );
    salvarFilaAtendimentos(atualizada);
    return atualizada;
}

export function chamarProximoDaFila(
    profissionalMatricula?: string
): { fila: ItemFilaAtendimento[]; chamado: ItemFilaAtendimento | null } {
    const hojeIso = obterHojeIso();
    const fila = carregarFilaAtendimentos();

    // Prioriza quem já está "Em Triagem", depois "Aguardando" no dia de hoje
    const candidatos = fila.filter(
        (item) =>
            item.dataIso === hojeIso &&
            (!profissionalMatricula ||
                profissionalMatricula === "RH-2026" ||
                item.profissionalMatricula === profissionalMatricula) &&
            (item.status === "Em Triagem" || item.status === "Aguardando")
    );

    if (candidatos.length === 0) {
        return { fila, chamado: null };
    }

    const proximo =
        candidatos.find((c) => c.status === "Em Triagem") || candidatos[0];

    const novaFila = fila.map((item) =>
        item.id === proximo.id
            ? { ...item, status: "Em Atendimento" as StatusFila }
            : item
    );

    salvarFilaAtendimentos(novaFila);
    return {
        fila: novaFila,
        chamado: { ...proximo, status: "Em Atendimento" },
    };
}

export function remarcarAtendimento(
    idAtendimento: string,
    novaDataIso: string,
    novoHorario: string
): ItemFilaAtendimento[] {
    const fila = carregarFilaAtendimentos();
    const atualizada = fila.map((item) => {
        if (item.id === idAtendimento) {
            return {
                ...item,
                dataIso: novaDataIso,
                data: formatarDataBr(novaDataIso),
                horario: novoHorario,
                status: "Aguardando" as StatusFila,
            };
        }
        return item;
    });
    salvarFilaAtendimentos(atualizada);
    return atualizada;
}

export function encaminharPacienteEspecialidade(
    atendimentoAtual: ItemFilaAtendimento,
    especialidadeDestino: string,
    unidadeDestino: string,
    motivoEncaminhamento: string
): ItemFilaAtendimento {
    const fila = carregarFilaAtendimentos();
    const amanhaIso = obterDataOffsetIso(1);
    const prefixo = especialidadeDestino.charAt(0).toUpperCase() || "E";
    const senhaGerada = `${prefixo}-0${fila.length + 1}`;

    // Também cria na lista de agendamentos do paciente (RF17)
    criarAgendamento({
        tipo: "Consulta",
        especialidade: especialidadeDestino,
        profissional: `Especialista em ${especialidadeDestino}`,
        unidade: unidadeDestino,
        bairro: "Saquarema",
        dataIso: amanhaIso,
        horario: "10:15",
        observacoes: `Encaminhado por ${atendimentoAtual.profissionalNome}: ${motivoEncaminhamento}`,
    });

    const novoEncaminhamento: ItemFilaAtendimento = {
        id: `fila-enc-${Date.now()}`,
        protocolo: `SQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        senhaFila: senhaGerada,
        horario: "10:15",
        data: formatarDataBr(amanhaIso),
        dataIso: amanhaIso,
        tipoAtendimento: "Consulta",
        status: "Aguardando",
        motivoConsulta: `Encaminhamento (${atendimentoAtual.especialidade} → ${especialidadeDestino}): ${motivoEncaminhamento}`,
        profissionalId: atendimentoAtual.profissionalId,
        profissionalMatricula: atendimentoAtual.profissionalMatricula,
        profissionalNome: atendimentoAtual.profissionalNome,
        especialidade: especialidadeDestino,
        unidade: unidadeDestino,
        tempoEsperaMinutos: 0,
        paciente: {
            ...atendimentoAtual.paciente,
            historicoConsultas: [
                `${atendimentoAtual.data} — Encaminhado para ${especialidadeDestino} por ${atendimentoAtual.profissionalNome}: ${motivoEncaminhamento}`,
                ...atendimentoAtual.paciente.historicoConsultas,
            ],
        },
    };

    const novaFila = [novoEncaminhamento, ...fila];
    salvarFilaAtendimentos(novaFila);
    return novoEncaminhamento;
}

export function carregarEvolucoesProntuario(): EvolucaoProntuario[] {
    try {
        const bruto = localStorage.getItem(PRONTUARIOS_STORAGE_KEY);
        if (!bruto) return [];
        return JSON.parse(bruto);
    } catch {
        return [];
    }
}

export function registrarEvolucaoProntuario(dados: {
    atendimentoId: string;
    diagnostico: string;
    prescricao: string;
    observacoes: string;
    alergiaNova?: string;
    triagem?: DadosTriagem;
    finalizarAtendimento?: boolean;
}): EvolucaoProntuario {
    const fila = carregarFilaAtendimentos();
    const atendimento = fila.find((i) => i.id === dados.atendimentoId);
    const evolucoes = carregarEvolucoesProntuario();

    const agora = new Date();
    const dataFormatada = `${String(agora.getDate()).padStart(2, "0")}/${String(
        agora.getMonth() + 1
    ).padStart(2, "0")}/${agora.getFullYear()} ${String(
        agora.getHours()
    ).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;

    const novaEvolucao: EvolucaoProntuario = {
        id: `evo-${Date.now()}`,
        atendimentoId: dados.atendimentoId,
        pacienteId: atendimento?.paciente.id || 0,
        pacienteNome: atendimento?.paciente.nome || "Paciente",
        profissionalId: atendimento?.profissionalId || 1,
        profissionalNome:
            atendimento?.profissionalNome || "Dr. Carlos Eduardo Ribeiro",
        especialidade: atendimento?.especialidade || "Cardiologia",
        dataRegistro: dataFormatada,
        diagnostico: dados.diagnostico,
        prescricao: dados.prescricao,
        observacoes: dados.observacoes,
    };

    localStorage.setItem(
        PRONTUARIOS_STORAGE_KEY,
        JSON.stringify([novaEvolucao, ...evolucoes])
    );

    if (atendimento) {
        const prefixoTriagem =
            dados.triagem &&
            (dados.triagem.pressaoArterial ||
                dados.triagem.temperatura ||
                dados.triagem.saturacao)
                ? ` [Sinais vitais: PA ${dados.triagem.pressaoArterial || "—"} | Temp ${dados.triagem.temperatura || "—"} | SatO2 ${dados.triagem.saturacao || "—"} | ${dados.triagem.classificacaoRisco || "Sem risco"}]`
                : "";
        const resumoHistorico = `${dataFormatada} — ${atendimento.especialidade} (${atendimento.profissionalNome}): ${dados.diagnostico}.${prefixoTriagem} Conduta: ${dados.prescricao || dados.observacoes}`;
        const novaFila = fila.map((item) => {
            if (item.paciente.id === atendimento.paciente.id) {
                const alergiasAtualizadas =
                    dados.alergiaNova && dados.alergiaNova.trim()
                        ? [
                              ...item.paciente.alergias.filter(
                                  (a) => !a.toLowerCase().includes("nenhuma")
                              ),
                              dados.alergiaNova.trim(),
                          ]
                        : item.paciente.alergias;

                return {
                    ...item,
                    triagem:
                        item.id === dados.atendimentoId && dados.triagem
                            ? { ...item.triagem, ...dados.triagem }
                            : item.triagem,
                    status:
                        item.id === dados.atendimentoId &&
                        dados.finalizarAtendimento
                            ? ("Finalizado" as StatusFila)
                            : item.status,
                    paciente: {
                        ...item.paciente,
                        alergias: alergiasAtualizadas,
                        historicoConsultas: [
                            resumoHistorico,
                            ...item.paciente.historicoConsultas,
                        ],
                    },
                };
            }
            return item;
        });
        salvarFilaAtendimentos(novaFila);

    }

    return novaEvolucao;
}

export function atualizarPerfilProfissional(
    idProfissional: number,
    dados: {
        nome: string;
        emailInstitucional: string;
        telefone: string;
        foto?: string;
        novaSenha?: string;
    }
): ProfissionalSaude {
    const lista = carregarProfissionais();
    let atualizado: ProfissionalSaude | null = null;

    const novaLista = lista.map((p) => {
        if (p.id === idProfissional) {
            const mod: ProfissionalSaude = {
                ...p,
                nome: dados.nome.trim() || p.nome,
                emailInstitucional:
                    dados.emailInstitucional.trim() || p.emailInstitucional,
                telefone: dados.telefone.trim(),
                foto: dados.foto !== undefined ? dados.foto : p.foto,
                senha:
                    dados.novaSenha && dados.novaSenha.trim()
                        ? dados.novaSenha.trim()
                        : p.senha,
                senhaTemporaria:
                    dados.novaSenha && dados.novaSenha.trim()
                        ? false
                        : p.senhaTemporaria,
            };
            atualizado = mod;
            return mod;
        }
        return p;
    });

    salvarProfissionais(novaLista);

    if (atualizado) {
        const { senha, ...semSenha } = atualizado as ProfissionalSaude;
        localStorage.setItem(
            PROFISSIONAL_LOGADO_KEY,
            JSON.stringify(semSenha)
        );
        window.dispatchEvent(new Event(FILA_ATUALIZADA_EVENTO));
        return semSenha as ProfissionalSaude;
    }

    throw new Error("Profissional não encontrado.");
}

// Funções exclusivas do Painel Interno / RH (RF12, RF13)
export function cadastrarProfissionalRH(novo: {
    matricula: string;
    nome: string;
    cpf: string;
    tipoProfissional: TipoProfissional;
    especialidade: string;
    registroConselho: string;
    unidade: string;
    emailInstitucional: string;
    senhaTemporariaValor: string;
    cargaHorariaSemanal: number;
}): ProfissionalSaude {
    const lista = carregarProfissionais();
    const matriculaFormatada = novo.matricula.trim().toUpperCase();

    if (lista.some((p) => p.matricula.toUpperCase() === matriculaFormatada)) {
        throw new Error(`A matrícula ${matriculaFormatada} já está cadastrada no sistema.`);
    }

    const criado: ProfissionalSaude = {
        id: Date.now(),
        matricula: matriculaFormatada,
        nome: novo.nome.trim(),
        cpf: novo.cpf.trim(),
        tipoProfissional: novo.tipoProfissional,
        especialidade: novo.especialidade,
        registroConselho: novo.registroConselho.trim(),
        unidade: novo.unidade,
        emailInstitucional: novo.emailInstitucional.trim(),
        senha: novo.senhaTemporariaValor || "saqua@2026",
        senhaTemporaria: true,
        ativo: true,
        cargaHorariaSemanal: novo.cargaHorariaSemanal || 30,
        criadoEm: obterHojeIso(),
    };

    salvarProfissionais([criado, ...lista]);

    return criado;
}

export function alternarAtivoProfissionalRH(idProfissional: number): ProfissionalSaude[] {
    const lista = carregarProfissionais();
    const atualizada = lista.map((p) =>
        p.id === idProfissional ? { ...p, ativo: !p.ativo } : p
    );
    salvarProfissionais(atualizada);
    return atualizada;
}

export function resetarSenhaProfissionalRH(
    idProfissional: number,
    novaSenhaTemporaria: string
): ProfissionalSaude[] {
    const lista = carregarProfissionais();
    const atualizada = lista.map((p) =>
        p.id === idProfissional
            ? { ...p, senha: novaSenhaTemporaria, senhaTemporaria: true }
            : p
    );
    salvarProfissionais(atualizada);
    return atualizada;
}
