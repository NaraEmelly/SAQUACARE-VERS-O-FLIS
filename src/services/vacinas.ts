export interface UnidadeComVacinacao {
    nome: string;
    bairro: string;
    endereco: string;
    horario: string;
    telefone: string;
}

export interface FaixaEtariaVacinal {
    id: string;
    nome: string;
    faixa: string;
    resumo: string;
    vacinas: string[];
}

export interface MarcoCalendarioInfantil {
    idadeMeses: number;
    idade: string;
    vacinas: string[];
}

export const VACINAS_REGISTRAVEIS = [
    "BCG",
    "Hepatite B",
    "Rotavírus",
    "Pentavalente",
    "Poliomielite",
    "Pneumocócica",
    "Meningocócica C",
    "Meningocócica ACWY",
    "Influenza",
    "Covid-19",
    "Febre amarela",
    "Tríplice viral",
    "Varicela",
    "Hepatite A",
    "DTP",
    "dT",
    "HPV",
    "Dengue",
    "Outra vacina",
] as const;

export const VACINAS_POR_FAIXA_ETARIA: FaixaEtariaVacinal[] = [
    {
        id: "crianca",
        nome: "Crianças",
        faixa: "Do nascimento a 9 anos, 11 meses e 29 dias",
        resumo: "O calendário infantil organiza doses desde o nascimento e reforços por idade. O esquema depende da caderneta e pode ter recomendações específicas.",
        vacinas: [
            "BCG",
            "Rotavírus",
            "Pneumocócica",
            "Meningocócica C",
            "Meningocócica ACWY",
            "Influenza",
            "Covid-19",
            "Febre amarela",
            "Tríplice viral",
            "Varicela",
            "Hepatite A",
            "DTP",
            "HPV",
            "Dengue conforme idade",
        ],
    },
    {
        id: "adolescente",
        nome: "Adolescentes",
        faixa: "De 10 a 19 anos, 11 meses e 29 dias",
        resumo: "A atualização considera as doses já recebidas e as estratégias vigentes para cada idade.",
        vacinas: [
            "HPV",
            "Dengue dos 10 aos 14 anos",
            "Meningocócica ACWY",
            "Tríplice viral",
            "Febre amarela",
            "dT",
        ],
    },
    {
        id: "jovem",
        nome: "Jovens",
        faixa: "De 20 a 24 anos, 11 meses e 29 dias",
        resumo: "Confira a situação vacinal e as estratégias de resgate indicadas pelo Ministério da Saúde.",
        vacinas: [
            "HPV conforme estratégia vigente",
            "Febre amarela",
            "Tríplice viral",
            "dT",
            "Outras vacinas conforme histórico e indicação",
        ],
    },
    {
        id: "adulto",
        nome: "Adultos",
        faixa: "De 25 a 59 anos",
        resumo: "A avaliação considera o histórico vacinal, ocupação, condições de saúde e situações de risco.",
        vacinas: [
            "dT e reforços",
            "Febre amarela conforme indicação",
            "Tríplice viral conforme idade e histórico",
            "Influenza para grupos elegíveis",
        ],
    },
    {
        id: "idoso",
        nome: "Pessoas idosas",
        faixa: "A partir de 60 anos",
        resumo: "Mantenha a caderneta atualizada e confirme as recomendações e campanhas vigentes na unidade de saúde.",
        vacinas: [
            "Influenza anual",
            "dT e reforços",
            "Febre amarela após avaliação, quando indicada",
            "Outras vacinas conforme histórico e condições de saúde",
        ],
    },
];

export const MARCOS_CALENDARIO_INFANTIL: MarcoCalendarioInfantil[] = [
    { idadeMeses: 0, idade: "Ao nascer", vacinas: ["BCG"] },
    { idadeMeses: 2, idade: "2 meses", vacinas: ["Rotavírus (1ª dose)", "Pneumocócica"] },
    { idadeMeses: 3, idade: "3 meses", vacinas: ["Meningocócica C (1ª dose)"] },
    { idadeMeses: 4, idade: "4 meses", vacinas: ["Rotavírus (2ª dose)", "Pneumocócica"] },
    { idadeMeses: 5, idade: "5 meses", vacinas: ["Meningocócica C (2ª dose)"] },
    { idadeMeses: 6, idade: "6 meses", vacinas: ["Influenza", "Covid-19"] },
    { idadeMeses: 7, idade: "7 meses", vacinas: ["Covid-19"] },
    { idadeMeses: 9, idade: "9 meses", vacinas: ["Covid-19", "Febre amarela"] },
    {
        idadeMeses: 12,
        idade: "12 meses",
        vacinas: ["Pneumocócica (reforço)", "Meningocócica ACWY", "Tríplice viral"],
    },
    {
        idadeMeses: 15,
        idade: "15 meses",
        vacinas: ["Tríplice viral", "Varicela", "Hepatite A"],
    },
    {
        idadeMeses: 48,
        idade: "4 anos",
        vacinas: ["DTP (reforço)", "Varicela", "Febre amarela (reforço)"],
    },
    {
        idadeMeses: 60,
        idade: "5 anos",
        vacinas: ["Pneumocócica para grupos específicos, conforme calendário"],
    },
    { idadeMeses: 108, idade: "9 anos", vacinas: ["HPV"] },
];

export const UNIDADES_COM_VACINACAO: UnidadeComVacinacao[] = [
    {
        nome: "ESF Água Branca",
        bairro: "Água Branca",
        endereco: "Avenida Nossa Senhora de Fátima, 06",
        horario: "Segunda a sexta, das 8h às 17h",
        telefone: "(22) 3199-0448",
    },
    {
        nome: "ESF Bacaxá",
        bairro: "Bacaxá",
        endereco: "Rua Alfredo Menezes, nº 980",
        horario: "Segunda a sexta, das 8h às 17h",
        telefone: "(22) 3199-0447",
    },
    {
        nome: "ESF Barra Nova",
        bairro: "Barra Nova",
        endereco: "Av. Litorânea, s/nº",
        horario: "Segunda a sexta, das 8h às 17h",
        telefone: "(22) 3199-0445",
    },
    {
        nome: "ESF Barreira",
        bairro: "Barreira",
        endereco: "Rua Capitão Nunes, 2605",
        horario: "Segunda a sexta, das 8h às 16h",
        telefone: "(22) 3199-0457",
    },
    {
        nome: "ESF Bicuíba",
        bairro: "Bicuíba",
        endereco: "Estrada da Bicuíba, s/nº",
        horario: "Segunda a sexta, das 8h às 17h",
        telefone: "(22) 3199-0456",
    },
    {
        nome: "ESF Bonsucesso",
        bairro: "Bonsucesso",
        endereco: "Rua Armando Rodrigues, s/nº",
        horario: "Segunda a sexta, das 8h às 17h",
        telefone: "(22) 3199-0460",
    },
];