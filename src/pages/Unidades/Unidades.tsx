import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import "../Agendamentos/Agendamentos.css";
import "./Unidades.css";

interface UnidadeSaude {
    id: number;
    nome: string;
    bairro: string;
    endereco: string;
    contato: string;
    horario: string;
    servicos: string[];
    mapsUrl?: string;
}



const listaUnidades: UnidadeSaude[] = [
{
    id: 1,
    nome: "Casa da Amamentação",
    bairro: "Barreira",
    endereco: "Rua Tertuliana Pereira, 147",
    contato: "casadaamamentacaosaquarema@gmail.com",
    horario: "Segunda a sexta-feira, das 9:00 às 16:00hs",
    servicos: ["Consultas de gestantes e de pediatria", "Puericultura", "Aplicação de Vacina",
        "Para ter acesso aos atendimentos oferecidos pela unidade, as mamães interessadas podem procurar as ESFs onde são cadastradas para serem encaminhadas. Também podem ir por demanda espontânea (sem agendamentos prévios) para consultoria de gestante de terceiro trimestre ou amamentação. A unidade conta com serviço de consultoria diariamente. E vale ressaltar a importância de se procurar o serviço assim que o bebê sair da maternidade, porque quanto antes a amamentação for ajustada, melhor."
    ]
},
{
    id: 2,
    nome: "Casa do Diabético",
    bairro: "Bacaxá",
    endereco: "Avenida Saquarema, 5070",
    contato: "programadiabeticohiperdia@gmail.com",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Acompanhamento Contínuo e Especializado", "Foco nos Casos de Risco Moderado e Elevado", "Com uma equipe multidisciplinar: Formada por endocrinologistas, cardiologistas, angiologistas, ortopedistas, nutricionista, psicóloga, assistente social, enfermeira e técnica de enfermagem, o atendimento é completo, humano e acolhedor"]
},
{
    id: 3,
    nome: "Central de Marcação",
    bairro: "Bacaxá",
    endereco: "Avenida Saquarema, 5.485 (Prédio da Central do Cidadão)",
    contato: " ",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["A Central de Marcações atende à Política Nacional de Regulação, que foi estabelecida pela Portaria GM/MS 1559/2008, onde trata da regulação em três dimensões: Regulação dos Sistemas de Saúde, Regulação da Atenção à Saúde e Regulação da Assistência à Saúde."]
},
{
    id: 4,
    nome: "Central de Regulação Municipal de Saquarema",
    bairro: "Bacaxá",
    endereco: "Avenida Saquarema, 5.485 (Prédio da Central do Cidadão)",
    contato: "programadiabeticohiperdia@gmail.com",
    horario: "Segunda a sexta-feira, das 8:00 às 16:00hs",
    servicos: ["Agendamento de exames ambulatoriais","Consultas médicas ambulatoriais referenciadas, procedimentos e cirurgias.",
        "IMPORTANTE: As marcações são realizadas através dos sistemas Estadual, Federal e Municipal: SISREG; KLINIKOS; RESNIT, TRS e SER."]
},
{
    id: 5,
    nome: "Centro de Atenção Psicossocial de Saquarema - CAPS",
    bairro: "Bacaxá",
    endereco: "Rua Adolfo Bravo, nº 28",
    contato: "(22) 3199-0464",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Atendimentos psicossocial por equipe multidisciplinar para usuários com   transtornos mentais graves",
        "Atendimento individual e em grupo", "Oficinas terapêuticas", "Atendimento psiquiátrico","Visitas Domiciliares",
        "Ações de matriciamento", "Reuniões de rede"]
},
{
    id: 6,
    nome: "Centro de Atenção Psicossocial de Saquarema (Álcool de Drogras) - CAPS AD",
    bairro: "Bacaxá",
    endereco: "Rua Adolpho Bravo, nº 77",
    contato: "(22) 3199-0463",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Atendimentos psicossocial por equipe multidisciplinar para usuários com transtornos mentais com questões relacionadas ao uso abusivo de álcool e outras drogas",
        "Atendimento individual e em grupo", "Oficinas terapêuticas", "Atendimento psiquiátrico e psicológico", "Visitas Domiciliares", "Ações de matriciamento", "Reuniões de rede"]
},
{
    id: 7,
    nome: "Centro de Atendimento IST / AIDS / Hepatites Virais (Casa Amarela)",
    bairro: "Verde Vale ",
    endereco: "Rua Fabio Lucio dos Santos, Lt 75, Qd 05",
    contato: "ist@saquarema.rj.gov.br",
    horario: "Segunda a sexta-feira, das 9:00 às 17:00hs",
    servicos: ["Atendimentos em infectologia, ginecológico, pediátrico", "Atividades educativas para adesão ao tratamento, para prevenção e controle de DST e AIDS",
        "Controle e distribuição de antirretrovirais", "Cuidados de enfermagem", "Distribuição de insumos de prevenção", "Orientação e apoio psicológico",
        "Orientações farmacêuticas, realização de exames de monitoramento","Teste Rápido de HIV / SÍFILIS / HEPATITES VIRAIS"]
},
{
    id: 8,
    nome: "Centro de Especialidades Odontológicas",
    bairro: "Bacaxá",
    endereco: "Rua Professor Souza, 05, 2° andar (Calçadão de Bacaxá)",
    contato: "(22) 3199-0473",
    horario: "Segunda a sexta-feira, das 8:00 às 16:00hs",
    servicos: ["Cirurgia Oral Menor", "Odontopediatria", "Tratamento de Canal", "Tratamento Periodontal", "Urgência"]
},
{
    id: 9,
    nome: "Centro Municipal de Diagnóstico por Imagem",
    bairro: "Bacaxá",
    endereco: "Rua Adolpho Bravo, nº 75°",
    contato: "(22) 3199-9960",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Ultrassonografia", "Endoscopia", "Colonoscopia", "Ecocardiograma, Carótidas e Vertebrais"]
},
{
    id: 10,
    nome: "Centro Municipal de Reabilitação Prof.ª Dilma Coutinho da Silva",
    bairro: "Gravatá",
    endereco: "Travessa do Ingá, nº 79",
    contato: "reabilitacao@saquarema.rj.gov.br",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Atendimentos especializados de crianças e jovens com deficiência.", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 11,
    nome: "Clínica da Criança",
    bairro: "Verde Vale (Cidade da Saúde)",
    endereco: "Rua Ercilio Oliveira Coutinho, s/n°",
    contato: "ambpedsaq@gmail.com",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 12,
    nome: "Clínica da Homem e do Idoso",
    bairro: "Verde Vale (Cidade da Saúde)",
    endereco: "Rua Ercilio Oliveira Coutinho, s/n°",
    contato: "",
    horario: "Segunda à sexta, das 7:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 13,
    nome: "Clínica da Mulher",
    bairro: "Verde Vale (Cidade da Saúde)",
    endereco: "Rua Ercilio Oliveira Coutinho, s/n°",
    contato: "22 3199-0470",
    horario: "Segunda à sexta, das 7:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 14,
    nome: "Clínica de Olhos Doutor Serodio",
    bairro: "Bacaxá",
    endereco: "Rua Heitor Bravo nº 06 B",
    contato: "(22) 2653-2032 / (22) 99961-2642",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Procedimento Oftamológico - Consulta Geral", "Tratamento Retina ", "Tratamento Córnea",
        "Tratamento Glaucoma", "Tratamento Catarata", "Tratamento Medicamentoso da Doença de Retina",
        "Tratamento Cirúrgico de Pterígio", "Exerese de Calazio e outras pequenas lesões da pálpebra e supercílios",
        "Implante secundário de lente INTRA-OCULAR - LIO", "Explante de lente intra ocular", "Vitrectomia anterior",
        "Vitrectomia posterior"]
},
{
    id: 15,
    nome: "Clínica Municipal de Fisioterapia",
    bairro: "Bacaxá",
    endereco: "Rua Professor Souza, 05",
    contato: "fisiopolisaquarema@gmail.com",
    horario: "Segunda a sexta-feira, das 8:00 às 18:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 16,
    nome: "Clínica Odontológica Dr. Drude",
    bairro: "Bacaxá",
    endereco: "Rua Professor Souza, 05, 2° andar (Calçadão de Bacaxá)",
    contato: "(22) 3199-0471",
    horario: "Segunda a sexta-feira, das 8:00 às 20:00hs",
    servicos: ["Extrações dentárias", "Profilaxia", "Restaurações dentárias (adultos e crianças)"]
},
{
    id: 17,
    nome: "Clínica Vascular Municipal",
    bairro: "Bacaxá",
    endereco: "Rua Segisfredo Bravo, 100, loja 01",
    contato: "(22)99753-5556 - clinicavascularsaquarema@gmail.com",
    horario: "Segunda à sexta, das 8:00 às 16:00hs",
    servicos: ["Consultas médicas em atenção especializada", "Tratamento esclerosante não estético de varizes dos membros inferiores (unilateral)",
        "Meia Elástica Sigvaris) embalagem c/ par", "Ultrassonografia com Doppler colorido de vasos"]
},
{
    id: 18,
    nome: "ESF Água Branca",
    bairro: "Água Branca",
    endereco: "Avenida Nossa Senhora de Fátima, 06",
    contato: "22 3199-0448",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Teste Rápido: Sífilis, HIV, Hepatite B e C",
        "Exames laboratoriais"]
},
{
    id: 19,
    nome: "ESF Bacaxá",
    bairro: "Bacaxá",
    endereco: "Rua Alfredo Menezes, nº 980",
    contato: "22 3199-0447",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Teste Rápido: Sífilis, HIV, Hepatite B e C",
        "Exames laboratoriais"]
},
{
    id: 20,
    nome: "ESF Barra Nova",
    bairro: "Barra Nova",
    endereco: "Av. Litorânea, s/n°",
    contato: "22 3199-0445",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Teste Rápido: Sífilis, HIV, Hepatite B e C"]
},
{
    id: 21,
    nome: "ESF Barreira",
    bairro: "Barreira",
    endereco: "Rua Capitão Nunes, 2605",
    contato: "22 3199-0457",
    horario: "Segunda a Sexta-Feira, das 8:00 às 16:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Teste Rápido: Sífilis, HIV, Hepatite B e C"]
},
{
    id: 22,
    nome: "ESF Bicuíba",
    bairro: "Bicuíba",
    endereco: "Estrada da Bicuíba, s/n°",
    contato: "22 3199-0456",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Exames laboratoriais"]
},
{
    id: 23,
    nome: "ESF Bonsucesso",
    bairro: "Bonsucesso",
    endereco: "Rua Armando Rodrigues, s/n°",
    contato: "22 3199-0460",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consulta Médica (Médico da Família)", "Consulta de Enfermagem", "Pré-Natal","Puericultura",
        "Hiperdia - Hipertensos e Diabéticos", "Consulta Odontológica", "Visitas Domiciliares", "Referência e Contra- Referência Para Especialidades",
        "Vacinação (rotina, campanhas de vacinação e calendários do Ministério da Saúde)", "Curativos", "Pesagem de Bolsa Família", "Atividades de Educação em Saúde",
        "Núcleo de Apoio à Saúde da Família (NASF)", "SAD (Melhor em casa)", "Remédio em casa", "Coleta de Preventivo", "Teste Rápido: Sífilis, HIV, Hepatite B e C"]
},
{
    id: 24,
    nome: "ESF Guarani",
    bairro: "Guarani",
    endereco: "Rua 4, n° 47",
    contato: "",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 25,
    nome: "ESF Jaconé",
    bairro: "Jaconé",
    endereco: "Rua Noventa e Sete, 798",
    contato: "22 3199-0449",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 26,
    nome: "ESF Jardim Ipitangas",
    bairro: "Ipitangas",
    endereco: "Rua Teresópolis, 238, esquina com a RJ 102 (Estrada de Praia Seca)",
    contato: "22 3199-0480",
    horario: "Segunda a sexta, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 27,
    nome: "ESF Madressilva",
    bairro: "Madressilva",
    endereco: "Rua dos Passageiros, nº 924",
    contato: "(22) 3199-0374",
    horario: "Segunda a sexta, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 28,
    nome: "ESF Mato Grosso",
    bairro: "Mato Grosso",
    endereco: "Rua Ezequias Teixeira de Souza, s/n°",
    contato: "matogrossoesf@gmail.com",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 29,
    nome: "ESF Mombaça",
    bairro: "Mombaça",
    endereco: "Estrada da Mombaça, 1160",
    contato: "22 3199-0455",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 30,
    nome: "ESF Palmital",
    bairro: "Palmital",
    endereco: " Estrada Latino Melo, s/n°",
    contato: "22 3199-0453",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 31,
    nome: "ESF Rio De Areia",
    bairro: "Rio De Areia",
    endereco: "Estrada Latino Melo, s/n°",
    contato: "22 3199-0459",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 32,
    nome: "ESF Sampaio Correa",
    bairro: "Basiléa",
    endereco: "Rua Miguel Arcanjo Serafim, s/n, (ao lado do Centro Municipal de Educação Jurandir da Silva Melo)",
    contato: "",
    horario: "Segunda à sexta, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 33,
    nome: "ESF Saquarema",
    bairro: "Saquarema",
    endereco: "Rua Frutuoso de Oliveira, s/n, Centro (antigo CAMIS)",
    contato: "22 3199-0450",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 34,
    nome: "ESF Vilatur",
    bairro: "Vilatur",
    endereco: "Rua Praia Ponta de Itapajé, Qd 388, Lt 03",
    contato: "22 3199-0454",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 35,
    nome: "Hospital Municipal Nossa Senhora de Nazareth",
    bairro: "Verde Vale (Cidade da Saúde)",
    endereco: "Rua Fabio Lucio dos Santos, s/n°",
    contato: "secretariageral@hmnsn.com.br",
    horario: "24h",
    servicos: ["Internação: Clínica Médica, Pediátrica"]
},
{
    id: 36,
    nome: "Hospital Municipal Porphírio Nunes de Azeredo",
    bairro: "Bacaxá",
    endereco: "Rua Adolfo Bravo, 197",
    contato: "(22) 3199 -9965",
    horario: "24h",
    servicos: ["Urgência/Emergência", "Clínica Médica, Pediátrica, Unidade Intermediária, UTI-Covid19", "Exames:Laboratorial e Imagem de Emergência"]
},
{
    id: 37,
    nome: "Laboratório Municipal de Análises Clínicas",
    bairro: "Bacaxá",
    endereco: " Rua Gentil Mendonça, loja n°1001, loja 4",
    contato: "laboratoriocamis@saquarema.rj.gov.br",
    horario: "Segunda a sexta-feira, das 7:00 às 17:00hs",
    servicos: ["Análises das amostras biológicas: sangue, urina, fezes, entre outros"]
},
{
    id: 38,
    nome: "Núcleo de Apoio à Saúde da Família - NASF",
    bairro: "Bacaxá",
    endereco: "Rua Heitor Bravo nº 15, sala 104",
    contato: "",
    horario: "Segunda a sexta-feira, das 9:00 às 17:00hs",
    servicos: ["Educador Físico", "Enfermagem", "Farmacêutico", "Fisioterapia", "Fonoaudiologia",
        "Médico Ginecologista", "Médico Pediatra", "Nutricionista", "Psicologia", "Serviço Social"]
},
{
    id: 39,
    nome: "Policlínica Municipal Prefeito Carlos Campos da Silveira",
    bairro: "Bacaxá",
    endereco: "Rodovia Amaral Peixoto, km 71, n° 51, (2° andar do Fly Shopping)",
    contato: " 22 3199-0472",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Atendimentos Clínicos e Especializados", "Curativos", "Exames", "Procedimentos"]
},
{
    id: 40,
    nome: "Posto de Urgência de Jaconé",
    bairro: "Jaconé",
    endereco: "Rua 97, s/n",
    contato: "(22) 3199-9888",
    horario: "24h",
    servicos: ["Cardiologista", "Emergencial / Ambulatorial", "Fonoaudiologia", "Odontologia", "Pediatria", "Exames: Raio x e Laboratoriais"]
},
{
    id: 41,
    nome: "Posto de Urgência de Sampaio Corrêa",
    bairro: "Sampaio Corrêa",
    endereco: "Rodovia Amaral Peixoto, km 55",
    contato: "(22) 3199-9799",
    horario: "24h",
    servicos: ["Acupuntura", "Emergência", "Endocrinologista", "Fisioterapia", "Pediatria", "Exames: Raio x e Laboratoriais"]
},
{
    id: 42,
    nome: "Posto de Urgência de Saquarema",
    bairro: "Saquarema",
    endereco: "Rua Coronel Madureira n.º 26, Centro",
    contato: "(22) 3199-9797",
    horario: "24h",
    servicos: ["Clínico Geral", "Emergência", "Exames: Raio x e Laboratoriais", "Serviços: (atendimentos ambulatoriais supensos temporariamente devido à destinação de atendimentos relacionados a COVID -19)"]
},
{
    id: 43,
    nome: "Programa Municipal de Arboviroses",
    bairro: "Porto Novo",
    endereco: "Avenida Saquarema, 1076",
    contato: "arbovirose@saquarema.rj.gov.br",
    horario: "Segunda a sexta-feira, das 9:00 às 17:00hs",
    servicos: ["O objetivo deste é reduzir a infestação do Aedes aegypti. São realizadas visitas domiciliares com o fim de orientar a população na eliminação de criadouros e caso necessários a colocação de biolarvicidas em depósitos. São realizados ciclos de visitas periódicos e pactuados 4 ciclos anuais."]
},
{
    id: 44,
    nome: "Programa Municipal de Hanseníase e Tuberculose",
    bairro: "Verde Vale",
    endereco: "Rua Fabio Lucio dos Santos, Lt 75, Qd 05",
    contato: "hanseniase.tuberculose2020@gmail.com",
    horario: "Segunda a sexta-feira, das 8:00 às 16:00hs",
    servicos: ["Tratamento, acompanhamento e diagnóstico das doenças"]
},
{
    id: 45,
    nome: "Programa Municipal do Tabagismo",
    bairro: "Bacaxá",
    endereco: "Rua Professor Souza, 111 - (Calçadão de Bacaxá)",
    contato: "tabagismo@saquarema.rj.gov.br",
    horario: "Segunda a sexta-feira, das 9:00 às 17:00hs",
    servicos: ["O Programa tem como objetivo reduzir a prevalência de fumantes e a consequente morbimortalidade relacionada ao consumo de derivados do tabaco, seguindo um modelo no qual ações educativas, de comunicação, de atenção à saúde, associadas às medidas legislativas e econômicas, se potencializa para prevenir a iniciação do tabagismo, promover a cessação de fumar e proteger a população da exposição à fumaça ambiental do tabaco.       Prevenir a iniciação ao fumo, por jovens e crianças, estimular o abandono do cigarro pelos já dependentes, eliminar a exposição do fumo passivo, dispor de auxílio psicológico para os usuários; realizar campanhas de prevenção junto à população."]
},
{
    id: 46,
    nome: "PSF Rio Mole",
    bairro: "Rio Mole",
    endereco: "Rodovia Amaral Peixoto, km 58",
    contato: "22 3199-0452",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 47,
    nome: "PSF Rio Seco",
    bairro: "Rio Seco",
    endereco: "Rua Oliveira Viana, s/n°",
    contato: "22 3199-0446",
    horario: "Segunda a sexta-feira, das 8:00 às 17:00hs",
    servicos: ["Consultas médicas", "Atendimentos multidisciplinares", "Exames"]
},
{
    id: 48,
    nome: "Residência Terapêutica",
    bairro: "Bacaxá",
    endereco: "Trav. Balbino Bernardino Matos, nº51",
    contato: "",
    horario: "Todos os dias / 24h",
    servicos: ["Acompanhante Terapêutica", "Cuidadores", "Técnico de Enfermagem", "Cuidados diários com os moradores da residência terapêutica", "Acompanhamento psicológico realizado na Policlínica e CAPS II",
        "Acompanhamento psiquiátrico realizado no CAPS II", "Oficinas terapêuticas realizadas no CAPS II"]
}
];



type IconName =
    | "busca"
    | "local"
    | "relogio"
    | "telefone"
    | "email"
    | "externo"
    | "fechar"
    | "pulso"
    | "casa"
    | "cruz"
    | "escudo";

const ICON_PATHS: Record<IconName, ReactNode> = {
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
    email: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="m3.5 7.5 8.5 6 8.5-6" />
        </>
    ),
    externo: <path d="M7 17 17 7M9 7h8v8" />,
    fechar: <path d="M6 6l12 12M18 6 6 18" />,
    pulso: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    casa: (
        <>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </>
    ),
    cruz: (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
            <path d="M12 8v8M8 12h8" />
        </>
    ),
    escudo: (
        <>
            <path d="M12 3 4 6v5.5c0 4.6 3.2 8.2 8 9.5 4.8-1.3 8-4.9 8-9.5V6l-8-3Z" />
            <path d="M9 12l2 2 4-4" />
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


function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}



type CategoriaId = "urgencia" | "esf" | "clinicas" | "programas";

const CATEGORIAS: { id: CategoriaId; rotulo: string; icone: IconName }[] = [
    { id: "urgencia", rotulo: "Urgência e hospitais", icone: "pulso" },
    { id: "esf", rotulo: "ESF e PSF", icone: "casa" },
    { id: "clinicas", rotulo: "Clínicas e centros", icone: "cruz" },
    { id: "programas", rotulo: "Programas e serviços", icone: "escudo" },
];

function categoriaDe(nome: string): CategoriaId {
    const n = normalizar(nome);
    if (/^(hospital|posto de urgencia)/.test(n)) return "urgencia";
    if (/^(esf|psf)\b/.test(n)) return "esf";
    if (/^(clinica|centro|policlinica|laboratorio|nucleo)/.test(n)) return "clinicas";
    return "programas";
}



type StatusAbertura = "aberto" | "fechado" | null;

function eh24h(horario: string) {
    return /24\s*h/i.test(horario);
}

function statusAbertura(horario: string, agora: Date): StatusAbertura {
    if (eh24h(horario)) return "aberto";
    if (!/sexta/i.test(horario)) return null;

    const m = horario.match(/(\d{1,2}):(\d{2})\s*(?:às|as|a)\s*(\d{1,2}):(\d{2})/i);
    if (!m) return null;

    const dia = agora.getDay();
    if (dia === 0 || dia === 6) return "fechado";

    const minutos = agora.getHours() * 60 + agora.getMinutes();
    const inicio = Number(m[1]) * 60 + Number(m[2]);
    const fim = Number(m[3]) * 60 + Number(m[4]);
    return minutos >= inicio && minutos < fim ? "aberto" : "fechado";
}



interface Contato {
    tipo: "telefone" | "email";
    texto: string;
    href: string;
}

const REGEX_EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const REGEX_TELEFONE = /\(?\d{2}\)?\s?\d{4,5}\s?-?\s?\d{4}/g;

function extrairContatos(bruto: string): Contato[] {
    const emails = bruto.match(REGEX_EMAIL) ?? [];
    const semEmails = bruto.replace(REGEX_EMAIL, " ");
    const fones = semEmails.match(REGEX_TELEFONE) ?? [];

    return [
        ...fones.map((f): Contato => ({
            tipo: "telefone",
            texto: f.trim(),
            href: `tel:+55${f.replace(/\D/g, "")}`,
        })),
        ...emails.map((e): Contato => ({
            tipo: "email",
            texto: e,
            href: `mailto:${e}`,
        })),
    ];
}


const LIMITE_ETIQUETA = 90;

interface UnidadeView extends UnidadeSaude {
    categoria: CategoriaId;
    contatos: Contato[];
    contatoTexto: string;
    servicosCurtos: string[];
    notas: string[];
    textoBusca: string;
    mapsLink: string;
}

const UNIDADES: UnidadeView[] = listaUnidades.map((u) => {
    const servicos = u.servicos.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    const bairro = u.bairro.trim();
    const endereco = u.endereco.trim();
    const contatoTexto = u.contato.trim();

    return {
        ...u,
        nome: u.nome.trim(),
        bairro,
        endereco,
        categoria: categoriaDe(u.nome),
        contatos: extrairContatos(contatoTexto),
        contatoTexto,
        servicosCurtos: servicos.filter((s) => s.length <= LIMITE_ETIQUETA),
        notas: servicos.filter((s) => s.length > LIMITE_ETIQUETA),
        textoBusca: normalizar(
            [u.nome, bairro, endereco, ...servicos].join(" ")
        ),
        mapsLink:
            u.mapsUrl ??
            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${u.nome}, ${bairro}, ${endereco}, Saquarema - RJ`
            )}`,
    };
});

const TOTAL_BAIRROS = new Set(
    UNIDADES.map((u) => normalizar(u.bairro.replace(/\s*\(.*\)/, "").trim()))
).size;

const TOTAL_24H = UNIDADES.filter((u) => eh24h(u.horario)).length;

const CONTAGEM_CATEGORIA = CATEGORIAS.reduce(
    (acc, c) => ({
        ...acc,
        [c.id]: UNIDADES.filter((u) => u.categoria === c.id).length,
    }),
    {} as Record<CategoriaId, number>
);

function rotuloStatus(horario: string, status: StatusAbertura) {
    if (!status) return null;
    if (eh24h(horario)) return "Aberto 24h";
    return status === "aberto" ? "Aberto agora" : "Fechado agora";
}


export function Unidades() {
    const [busca, setBusca] = useState("");
    const [categoria, setCategoria] = useState<"todas" | CategoriaId>("todas");
    const [somenteAbertas, setSomenteAbertas] = useState(false);
    const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
    const [agora, setAgora] = useState(() => new Date());


    useEffect(() => {
        const timer = setInterval(() => setAgora(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        if (selecionadaId === null) return;
        const aoTeclar = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelecionadaId(null);
        };
        window.addEventListener("keydown", aoTeclar);
        return () => window.removeEventListener("keydown", aoTeclar);
    }, [selecionadaId]);

    const unidades = useMemo(
        () =>
            UNIDADES.map((u) => ({
                ...u,
                status: statusAbertura(u.horario, agora),
            })),
        [agora]
    );

    const abertasAgora = useMemo(
        () => unidades.filter((u) => u.status === "aberto").length,
        [unidades]
    );

    const filtradas = useMemo(() => {
        const termo = normalizar(busca.trim());
        return unidades.filter((u) => {
            if (categoria !== "todas" && u.categoria !== categoria) return false;
            if (somenteAbertas && u.status !== "aberto") return false;
            return !termo || u.textoBusca.includes(termo);
        });
    }, [unidades, busca, categoria, somenteAbertas]);

    const selecionada = unidades.find((u) => u.id === selecionadaId) ?? null;
    const temFiltro = busca.trim() !== "" || categoria !== "todas" || somenteAbertas;

    const limparFiltros = () => {
        setBusca("");
        setCategoria("todas");
        setSomenteAbertas(false);
    };

    return (
        <div className="unidades-container">
            <div className="ag-header">
                <div>
                    <span className="ag-breadcrumb">Início / Unidades de saúde</span>
                    <h1>Unidades de saúde</h1>
                    <p>
                        Consulte as unidades, horários de atendimento e serviços
                        prestados em Saquarema.
                    </p>
                </div>
            </div>

            <div className="ag-stats-grid">
                <div className="ag-stat-card agendada">
                    <div className="ag-stat-icon agendada" aria-hidden="true">
                        <Icon name="cruz" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={UNIDADES.length} />
                        </h3>
                        <span>Unidades na rede</span>
                    </div>
                </div>

                <div className="ag-stat-card concluida">
                    <div className="ag-stat-icon concluida" aria-hidden="true">
                        <Icon name="relogio" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={abertasAgora} />
                        </h3>
                        <span>Abertas agora</span>
                    </div>
                </div>

                <div className="ag-stat-card agendada">
                    <div className="ag-stat-icon agendada" aria-hidden="true">
                        <Icon name="pulso" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={TOTAL_24H} />
                        </h3>
                        <span>Com atendimento 24h</span>
                    </div>
                </div>

                <div className="ag-stat-card agendada">
                    <div className="ag-stat-icon agendada" aria-hidden="true">
                        <Icon name="local" size={22} />
                    </div>
                    <div className="ag-stat-info">
                        <h3>
                            <CountUp value={TOTAL_BAIRROS} />
                        </h3>
                        <span>Bairros atendidos</span>
                    </div>
                </div>
            </div>


            <div className="ag-controls un-controls">
                <div className="ag-search-wrapper">
                    <span className="ag-search-icon">
                        <Icon name="busca" />
                    </span>
                    <input
                        type="text"
                        className="ag-search-input"
                        placeholder="Buscar por unidade, bairro, endereço ou serviço..."
                        aria-label="Buscar unidades de saúde"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="ag-filter-tabs" role="group" aria-label="Filtrar por tipo de unidade">
                    <button
                        type="button"
                        className={`ag-tab-btn ${categoria === "todas" ? "active" : ""}`}
                        aria-pressed={categoria === "todas"}
                        onClick={() => setCategoria("todas")}
                    >
                        Todas
                        <span className="ag-tab-count">{UNIDADES.length}</span>
                    </button>

                    {CATEGORIAS.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            className={`ag-tab-btn ${categoria === c.id ? "active" : ""}`}
                            aria-pressed={categoria === c.id}
                            onClick={() => setCategoria(c.id)}
                        >
                            {c.rotulo}
                            <span className="ag-tab-count">{CONTAGEM_CATEGORIA[c.id]}</span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className="un-toggle"
                    aria-pressed={somenteAbertas}
                    onClick={() => setSomenteAbertas((v) => !v)}
                >
                    Abertas agora
                </button>
            </div>

            <p className="un-result" aria-live="polite">
                <strong>{filtradas.length}</strong>{" "}
                {filtradas.length === 1 ? "unidade encontrada" : "unidades encontradas"}
            </p>

            <div className="un-grid">
                {filtradas.length === 0 ? (
                    <div className="ag-empty">
                        <span className="ag-empty-icon" aria-hidden="true">
                            <Icon name="busca" size={30} />
                        </span>
                        <h3>Nenhuma unidade encontrada</h3>
                        <p>
                            Não encontramos unidades para a busca ou os filtros
                            selecionados.
                        </p>
                        {temFiltro && (
                            <button
                                type="button"
                                className="ag-btn-primary"
                                onClick={limparFiltros}
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    filtradas.map((u) => {
                        const cat = CATEGORIAS.find((c) => c.id === u.categoria)!;
                        const rotulo = rotuloStatus(u.horario, u.status);
                        const principal = u.contatos[0];
                        const restantes = u.servicosCurtos.length - 3;

                        return (
                            <article key={u.id} className="un-card">
                                <div className="un-card-top">
                                    <span className="un-cat">
                                        <span className="un-cat-icon" aria-hidden="true">
                                            <Icon name={cat.icone} size={16} />
                                        </span>
                                        {cat.rotulo}
                                    </span>

                                    {rotulo && (
                                        <span className={`un-status ${u.status}`}>{rotulo}</span>
                                    )}
                                </div>

                                <h3 className="un-name" title={u.nome}>
                                    {u.nome}
                                </h3>
                                <p className="un-bairro">{u.bairro}</p>

                                <ul className="un-info">
                                    <li>
                                        <Icon name="local" size={16} />
                                        <span>{u.endereco}</span>
                                    </li>
                                    <li>
                                        <Icon name="relogio" size={16} />
                                        <span>{u.horario}</span>
                                    </li>
                                    {principal ? (
                                        <li>
                                            <Icon name={principal.tipo} size={16} />
                                            <a href={principal.href}>{principal.texto}</a>
                                        </li>
                                    ) : (
                                        u.contatoTexto && (
                                            <li>
                                                <Icon name="telefone" size={16} />
                                                <span>{u.contatoTexto}</span>
                                            </li>
                                        )
                                    )}
                                </ul>

                                {u.servicosCurtos.length > 0 && (
                                    <div className="un-chips">
                                        {u.servicosCurtos.slice(0, 3).map((s) => (
                                            <span key={s} className="un-chip" title={s}>
                                                {s}
                                            </span>
                                        ))}
                                        {restantes > 0 && (
                                            <span className="un-chip un-chip--mais">
                                                +{restantes}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="un-actions">
                                    <button
                                        type="button"
                                        className="ag-btn-outline"
                                        onClick={() => setSelecionadaId(u.id)}
                                    >
                                        Ver detalhes
                                    </button>
                                    <a
                                        href={u.mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ag-btn-outline un-map"
                                        aria-label={`Ver ${u.nome} no Google Maps`}
                                    >
                                        <Icon name="externo" size={16} />
                                        Mapa
                                    </a>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>


            {selecionada && (
                <div
                    className="ag-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelecionadaId(null);
                    }}
                >
                    <div
                        className="ag-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="un-modal-titulo"
                    >
                        <div className="ag-modal-header">
                            <div>
                                <h2 id="un-modal-titulo">{selecionada.nome}</h2>
                                <p className="ag-modal-subtitle">{selecionada.bairro}</p>
                            </div>
                            <button
                                type="button"
                                className="ag-modal-close"
                                aria-label="Fechar"
                                onClick={() => setSelecionadaId(null)}
                            >
                                <Icon name="fechar" size={18} />
                            </button>
                        </div>

                        <div className="ag-modal-body">
                            <section className="un-section">
                                <h4>Endereço</h4>
                                <p>{selecionada.endereco}</p>
                            </section>

                            <section className="un-section">
                                <h4>Horário de atendimento</h4>
                                <p>
                                    {selecionada.horario}
                                    {rotuloStatus(selecionada.horario, selecionada.status) && (
                                        <span className={`un-status ${selecionada.status}`}>
                                            {rotuloStatus(selecionada.horario, selecionada.status)}
                                        </span>
                                    )}
                                </p>
                            </section>

                            {(selecionada.contatos.length > 0 || selecionada.contatoTexto) && (
                                <section className="un-section">
                                    <h4>Contato</h4>
                                    {selecionada.contatos.length > 0 ? (
                                        <ul className="un-contatos">
                                            {selecionada.contatos.map((c) => (
                                                <li key={c.href}>
                                                    <a href={c.href}>
                                                        <Icon name={c.tipo} size={16} />
                                                        {c.texto}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>{selecionada.contatoTexto}</p>
                                    )}
                                </section>
                            )}

                            {selecionada.servicosCurtos.length > 0 && (
                                <section className="un-section">
                                    <h4>Serviços</h4>
                                    <div className="un-chips">
                                        {selecionada.servicosCurtos.map((s) => (
                                            <span key={s} className="un-chip un-chip--wrap">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {selecionada.notas.length > 0 && (
                                <section className="un-section">
                                    <h4>Informações importantes</h4>
                                    {selecionada.notas.map((n) => (
                                        <p key={n} className="un-nota">
                                            {n}
                                        </p>
                                    ))}
                                </section>
                            )}
                        </div>

                        <div className="ag-modal-footer">
                            <button
                                type="button"
                                className="ag-btn-outline"
                                onClick={() => setSelecionadaId(null)}
                            >
                                Fechar
                            </button>
                            <a
                                href={selecionada.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ag-btn-primary"
                            >
                                <Icon name="externo" size={16} />
                                Abrir no Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Unidades;
