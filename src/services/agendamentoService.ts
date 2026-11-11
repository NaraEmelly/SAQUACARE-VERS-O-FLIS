export type StatusAgendamento = "Agendada" | "Concluída" | "Cancelada";
export type TipoAtendimento = "Consulta" | "Exame" | "Retorno";

export interface Agendamento {
    id: string;
    protocolo: string;
    tipo: TipoAtendimento;
    especialidade: string;
    profissional: string;
    unidade: string;
    bairro: string;
    data: string; // formato DD/MM/AAAA
    dataIso: string; // formato YYYY-MM-DD para ordenação
    horario: string; // formato HH:mm
    status: StatusAgendamento;
    observacoes?: string;
    criadoEm: string;
}

export const UNIDADES_SAQUAREMA = [
    { nome: "Clínica da Família de Bacaxá", bairro: "Bacaxá" },
    { nome: "Clínica da Criança", bairro: "Verde Vale (Cidade da Saúde)" },
    { nome: "Clínica da Mulher", bairro: "Verde Vale (Cidade da Saúde)" },
    { nome: "Clínica do Homem e do Idoso", bairro: "Verde Vale (Cidade da Saúde)" },
    { nome: "Centro de Especialidades Odontológicas", bairro: "Bacaxá" },
    { nome: "Centro Municipal de Diagnóstico por Imagem", bairro: "Bacaxá" },
    { nome: "Casa do Diabético", bairro: "Bacaxá" },
    { nome: "ESF Vilatur", bairro: "Vilatur" },
    { nome: "ESF Sampaio Corrêa", bairro: "Sampaio Corrêa" },
    { nome: "ESF Jaconé", bairro: "Jaconé" },
    { nome: "ESF Barra Nova", bairro: "Barra Nova" },
    { nome: "ESF Rio d'Areia", bairro: "Rio d'Areia" },
];

export const ESPECIALIDADES = [
    "Clínica Geral",
    "Pediatria",
    "Ginecologia e Obstetrícia",
    "Cardiologia",
    "Ortopedia",
    "Odontologia",
    "Dermatologia",
    "Oftalmologia",
    "Psicologia",
    "Nutrição",
    "Fisioterapia",
    "Exame de Sangue (Laboratório)",
    "Raio-X",
    "Ultrassonografia",
];

export const MEDICOS_EXEMPLO: Record<string, string[]> = {
    "Clínica Geral": ["Enf. Mariana Souza Costa", "Dra. Cintia"],
    "Pediatria": ["Dra. Emanuelly", "Dr. Felipe"],
    "Ginecologia e Obstetrícia": ["Dra. Ana", "Dra. Mariana"],
    "Cardiologia": ["Dr. Carlos Eduardo Ribeiro", "Dra. Helena"],
    "Ortopedia": ["Dr. Carlos Eduardo Ribeiro", "Dr. Lucas"],
    "Odontologia": ["Dra. Camila", "Dr. Gabriel"],
    "Dermatologia": ["Dra. Beatriz"],
    "Oftalmologia": ["Dr. Serodio", "Dra. Renata"],
    "Psicologia": ["Dra. Vanessa Albuquerque"],
    "Nutrição": ["Dra. Juliana"],
    "Fisioterapia": ["Dr. Rodrigo Mendonça"],
    "Exame de Sangue (Laboratório)": ["Equipe do Laboratório Central"],
    "Raio-X": ["Equipe de Radiologia"],
    "Ultrassonografia": ["Dr. Paulo"],
};

const STORAGE_KEY = "saquacare:agendamentos";
export const AGENDAMENTOS_ATUALIZADOS_EVENTO = "saquacare:agendamentos-atualizados";

const AGENDAMENTOS_INICIAIS: Agendamento[] = [
    {
        id: "ag-1",
        protocolo: "SQ-2026-8910",
        tipo: "Consulta",
        especialidade: "Cardiologia",
        profissional: "Dra. Ana",
        unidade: "Clínica da Família de Bacaxá",
        bairro: "Bacaxá",
        data: "20/10/2026",
        dataIso: "2026-10-20",
        horario: "09:30",
        status: "Agendada",
        observacoes: "Levar exames anteriores de sangue e eletrocardiograma.",
        criadoEm: "2026-10-10T10:00:00Z",
    },
    {
        id: "ag-2",
        protocolo: "SQ-2026-7421",
        tipo: "Consulta",
        especialidade: "Clínica Geral",
        profissional: "Dra. Cintia",
        unidade: "Clínica da Família de Bacaxá",
        bairro: "Bacaxá",
        data: "08/08/2026",
        dataIso: "2026-08-08",
        horario: "14:00",
        status: "Concluída",
        observacoes: "Consulta de rotina realizada com sucesso.",
        criadoEm: "2026-08-01T15:30:00Z",
    },
    {
        id: "ag-3",
        protocolo: "SQ-2026-6819",
        tipo: "Retorno",
        especialidade: "Pediatria",
        profissional: "Dra. Emanuelly",
        unidade: "Clínica da Criança",
        bairro: "Verde Vale (Cidade da Saúde)",
        data: "22/07/2026",
        dataIso: "2026-07-22",
        horario: "10:15",
        status: "Concluída",
        observacoes: "Apresentação de exames de rotina.",
        criadoEm: "2026-07-15T09:00:00Z",
    },
    {
        id: "ag-4",
        protocolo: "SQ-2026-5310",
        tipo: "Consulta",
        especialidade: "Clínica Geral",
        profissional: "Dr. Carlos Eduardo Ribeiro",
        unidade: "ESF Vilatur",
        bairro: "Vilatur",
        data: "05/07/2026",
        dataIso: "2026-07-05",
        horario: "11:00",
        status: "Concluída",
        observacoes: "Prescrição médica entregue ao paciente.",
        criadoEm: "2026-06-28T08:20:00Z",
    },
];

export function carregarAgendamentos(): Agendamento[] {
    try {
        const bruto = localStorage.getItem(STORAGE_KEY);
        if (!bruto) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(AGENDAMENTOS_INICIAIS));
            return AGENDAMENTOS_INICIAIS;
        }
        const lista: Agendamento[] = JSON.parse(bruto);
        const listaNormalizada = lista.map((item) => {
            if (item.profissional === "Dra. Ana Paula Fernandes") item.profissional = "Dra. Ana";
            if (item.profissional === "Dra. Cintia Andrade") item.profissional = "Dra. Cintia";
            if (item.profissional === "Dra. Emanuelly Costa") item.profissional = "Dra. Emanuelly";
            if (item.profissional === "Dr. Jhean Monteiro" || item.profissional === "Dr. Jhean") item.profissional = "Dr. Carlos Eduardo Ribeiro";
            return item;
        });
        return listaNormalizada;
    } catch {
        return AGENDAMENTOS_INICIAIS;
    }
}

export function salvarLista(lista: Agendamento[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
        window.dispatchEvent(new Event(AGENDAMENTOS_ATUALIZADOS_EVENTO));
    } catch (e) {
        console.error("Erro ao salvar agendamentos:", e);
    }
}

export interface NovoAgendamentoDTO {
    tipo: TipoAtendimento;
    especialidade: string;
    profissional: string;
    unidade: string;
    bairro: string;
    dataIso: string; // YYYY-MM-DD
    horario: string;
    observacoes?: string;
}

export function formatarDataBr(isoDate: string): string {
    if (!isoDate) return "";
    const [ano, mes, dia] = isoDate.split("-");
    if (!ano || !mes || !dia) return isoDate;
    return `${dia}/${mes}/${ano}`;
}

export function criarAgendamento(dto: NovoAgendamentoDTO): Agendamento {
    const listaAtual = carregarAgendamentos();
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    const protocoloGerado = `SQ-2026-${numeroAleatorio}`;

    const novo: Agendamento = {
        id: `ag-${Date.now()}`,
        protocolo: protocoloGerado,
        tipo: dto.tipo,
        especialidade: dto.especialidade,
        profissional: dto.profissional || "Profissional Designado",
        unidade: dto.unidade,
        bairro: dto.bairro,
        data: formatarDataBr(dto.dataIso),
        dataIso: dto.dataIso,
        horario: dto.horario,
        status: "Agendada",
        observacoes: dto.observacoes,
        criadoEm: new Date().toISOString(),
    };

    const novaLista = [novo, ...listaAtual];
    salvarLista(novaLista);

    return novo;
}

export function cancelarAgendamento(id: string): void {
    const listaAtual = carregarAgendamentos();
    const novaLista = listaAtual.map((item) => {
        if (item.id === id) {
            return { ...item, status: "Cancelada" as StatusAgendamento };
        }
        return item;
    });
    salvarLista(novaLista);
}
