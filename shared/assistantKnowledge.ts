function normalize(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

interface AnswerTopic {
    keywords: string[];
    answers: string[];
}

const TOPICS: AnswerTopic[] = [
    {
        keywords: ["cancelar", "cancelamento", "desmarcar", "remarcar", "reagendar"],
        answers: [
            "Em Agendamentos, abra o registro desejado para ver as opções de alteração ou cancelamento. Nesta apresentação, essas ações não enviam avisos para uma unidade de saúde.",
        ],
    },
    {
        keywords: ["agend*", "marcar consulta", "marcar exame", "novo agendamento", "desmarcar", "cancelar consulta", "remarcar"],
        answers: [
            "Para conhecer o fluxo, abra Agendamentos e selecione Novo agendamento. Escolha o tipo de atendimento, a unidade, a data e o horário; depois, revise as informações e confirme.",
            "Em Agendamentos, você pode acompanhar os registros por status, consultar os detalhes e iniciar um novo pedido pelo botão Novo agendamento.",
        ],
    },
    {
        keywords: ["fila", "espera", "tempo de atendimento", "minha vez", "chamada"],
        answers: [
            "Em Fila de atendimento, acompanhe os status dos atendimentos e veja como a equipe pode organizar o fluxo de espera.",
            "Abra Fila de atendimento para explorar a organização dos atendimentos por etapa e os recursos de acompanhamento.",
        ],
    },
    {
        keywords: ["vacin*", "caderneta", "calendario vacinal", "dose*", "imuniz*"],
        answers: [
            "Na área Vacinação, consulte a carteira, explore o calendário por faixa etária e veja os campos disponíveis para acompanhar doses. Para orientações oficiais e atualizadas, consulte uma unidade de saúde ou o Ministério da Saúde: https://www.gov.br/saude/pt-br/vacinacao",
            "O menu Vacinação reúne recursos para visualizar a carteira e organizar o acompanhamento das doses. As informações oficiais do calendário estão em https://www.gov.br/saude/pt-br/vacinacao",
        ],
    },
    {
        keywords: ["unidad*", "ubs", "posto de saude", "clinic*", "endereco", "onde atende", "localizacao", "mapa"],
        answers: [
            "Em Unidades, pesquise pelo nome ou bairro e use os filtros para encontrar um local. Ao abrir uma unidade, você pode consultar endereço, contatos e serviços informados.",
            "A seção Unidades reúne opções de atendimento em Saquarema. Pesquise por bairro ou categoria e abra um resultado para ver os detalhes disponíveis.",
        ],
    },
    {
        keywords: ["acessibilidade", "alto contraste", "contraste", "tamanho do texto", "leitor de tela", "vlibras", "libras", "leitura em voz alta"],
        answers: [
            "Use o botão de acessibilidade para ajustar o tamanho do texto, ativar alto contraste, escala de cinza, destaque de links, espaçamento e leitura em voz alta. O VLibras precisa de conexão com a internet.",
            "As opções de acessibilidade ficam no botão próprio da página. Você pode ampliar o texto, realçar links e usar alto contraste; o VLibras é carregado online.",
        ],
    },
    {
        keywords: ["voz", "microfone", "reconhecimento de voz", "resposta falada"],
        answers: [
            "No painel da Luma, Voz on/off controla a leitura das respostas e o botão de microfone permite ditar perguntas quando o navegador oferece esse recurso. O reconhecimento pode depender de permissões e serviços do navegador.",
        ],
    },
    {
        keywords: ["offline", "sem internet", "conexao", "internet"],
        answers: [
            "Depois que a página carregar, as respostas preparadas do chat funcionam no navegador sem chamar uma IA externa. Recursos como VLibras e reconhecimento de voz podem depender de internet ou do serviço do navegador.",
        ],
    },
    {
        keywords: ["tour", "passeio guiado", "guia pela pagina", "me mostra", "me ensina a usar"],
        answers: [
            "O tour guiado destaca as áreas da tela uma a uma. Use Próximo para avançar ou Encerrar para sair; você pode continuar vendo a página enquanto o tour está ativo.",
        ],
    },
    {
        keywords: ["senha", "esqueci", "recuperar acesso", "redefinir acesso", "trocar senha", "login", "entrar na conta", "cadastr*", "criar conta", "registrar"],
        answers: [
            "Em Criar conta, preencha os campos solicitados para conhecer o fluxo; em Entrar, informe suas credenciais cadastradas. A recuperação automática de senha ainda não está disponível. Nunca compartilhe sua senha no chat.",
            "Acesse Entrar para fazer login ou Criar conta para conhecer o cadastro. Se precisar recuperar uma senha, procure a equipe pelos canais na seção Contato.",
        ],
    },
    {
        keywords: ["profissional*", "medic*", "enfermeir*", "recepcao", "secretaria", "rh", "administrador*", "permissao*", "perfil de acesso"],
        answers: [
            "A plataforma organiza as áreas de paciente, profissional e administração conforme as tarefas de cada perfil. A área profissional reúne recursos de agenda, fila e gestão; a área do paciente prioriza consultas e acompanhamento.",
            "Cada perfil tem menus próprios para facilitar o acesso às tarefas do dia a dia. Explore as opções de paciente ou profissional para conhecer os fluxos disponíveis.",
        ],
    },
    {
        keywords: ["perfil", "meus dados", "editar dados", "telefone cadastrado", "cartao sus"],
        answers: [
            "Em Meu perfil, consulte e edite os campos disponíveis para manter suas informações organizadas. Evite inserir dados pessoais reais nesta apresentação.",
        ],
    },
    {
        keywords: ["privacidade", "dados pessoais", "dados salvos", "conversa salva", "historico do chat", "meus dados ficam", "seguro", "armazen"],
        answers: [
            "As respostas da Luma são pré-definidas e processadas no próprio navegador: suas mensagens não são enviadas a um serviço de IA nem salvas pelo chat. O histórico desaparece ao atualizar ou fechar a página. Mesmo assim, não informe senhas, dados pessoais ou informações de saúde.",
        ],
    },
    {
        keywords: ["feedback", "avaliar*", "sugestao*", "reclamar*", "opinar*"],
        answers: [
            "Você pode enviar uma avaliação pela seção Feedback na página inicial. Não inclua informações pessoais ou clínicas; consulte o aviso do formulário antes de enviar.",
        ],
    },
    {
        keywords: ["contato*", "instagram", "equipe", "falar com alguem", "email", "e mail"],
        answers: [
            "Os canais da equipe estão na seção Contato da página inicial. O perfil do projeto também aparece como @saquacare_ no Instagram.",
        ],
    },
    {
        keywords: ["preco", "custa", "pagar", "pago", "pagamento", "cobrado", "cobra", "cobranca", "custo*", "gratuit*", "gratis", "api", "chave"],
        answers: [
            "O chat usa respostas preparadas e processadas localmente: não chama serviços de IA externos nem precisa de chave de API. Isso evita cobrança por uso de IA, mas significa que não consigo responder livremente a qualquer assunto.",
        ],
    },
    {
        keywords: ["agente", "inteligencia artificial", "ia", "luma", "chatbot", "assistente", "responder", "ajuda", "ajudar"],
        answers: [
            "Sou a Luma, guia local do SaquaCare. Respondo a perguntas comuns sobre agendamentos demonstrativos, fila, vacinação, unidades, acessibilidade, cadastro e privacidade. Minhas respostas são preparadas pela equipe; não sou uma IA generativa e posso não entender perguntas fora desses temas.",
        ],
    },
    {
        keywords: ["saquacare", "projeto", "universidade", "saquarema", "sus", "prefeitura"],
        answers: [
            "O SaquaCare é um projeto acadêmico da Universidade de Vassouras, pensado para aproximar as pessoas das informações e dos serviços de saúde em Saquarema. A proposta reúne recursos de agendamento, acompanhamento, vacinação e gestão em uma única plataforma.",
        ],
    },
    {
        keywords: ["saude", "sintom*", "diagnost*", "remed*", "medicamento*", "tratamento*", "exame*", "gravidez", "alergia*", "febre", "dor"],
        answers: [
            "Posso ajudar com informações sobre a plataforma, mas não avalio sintomas, exames ou tratamentos. Para orientação sobre sua saúde, procure um profissional ou serviço de saúde. Em uma emergência, ligue para o SAMU pelo 192.",
        ],
    },
];

function matchesTopic(question: string, keyword: string) {
    if (keyword.endsWith("*")) {
        const prefix = keyword.slice(0, -1);
        return question.split(" ").some((word) => word.startsWith(prefix));
    }

    return ` ${question} `.includes(` ${keyword} `);
}

function selectAnswer(answers: string[], question: string) {
    const hash = [...question].reduce((value, character) => value + character.charCodeAt(0), 0);
    return answers[hash % answers.length];
}

export function getLocalAssistantReply(input: string) {
    const question = normalize(input);
    if (!question) {
        return "Escolha uma opção para conhecer os recursos do SaquaCare, como agendamentos, vacinação, unidades ou acessibilidade.";
    }

    if (
        /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(input)
        || /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(input)
        || /\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-.\s]?\d{4}\b/.test(input)
    ) {
        return "Por segurança, não compartilhe telefone, e-mail, documentos ou outros dados pessoais no chat. As respostas são locais, mas evite inserir informações que identifiquem você.";
    }

    if (
        ["emergencia", "samu", "nao consigo respirar", "falta de ar", "dor no peito", "desmaiei", "sangramento intenso", "suicidio"]
            .some((phrase) => ` ${question} `.includes(` ${phrase} `))
    ) {
        return "Se você ou alguém estiver em perigo imediato, procure um serviço de emergência agora ou ligue para o SAMU pelo 192. Não espere por uma resposta deste chat.";
    }

    if (
        /\b(?:agendamento|consulta|fila|atendimento)\b[\s\S]{0,40}\b(?:real|confirmado|confirmada|tempo real|valido|valida)\b/.test(question)
        || /\b(?:real|confirmado|confirmada|tempo real)\b[\s\S]{0,40}\b(?:agendamento|consulta|fila|atendimento)\b/.test(question)
    ) {
        return "Esta página é uma apresentação dos recursos do SaquaCare. As ações feitas aqui não são enviadas a uma unidade nem confirmam atendimento; para marcar ou confirmar uma consulta, fale diretamente com o serviço de saúde.";
    }

    if (
        /\b(?:eu|meu|minha|tenho|estou|sinto|fui diagnosticado|fui diagnosticada)\b[\s\S]{0,80}\b(?:dor|sintoma|febre|doenca|diagnostico|exame|alergia|medicamento|remedio|dose|gravidez|pressao|glicemia)\b/.test(question)
    ) {
        return "Não envie detalhes pessoais de saúde pelo chat. Não consigo avaliar sintomas nem orientar tratamento; procure um profissional de saúde. Se for uma emergência, ligue para o SAMU pelo 192.";
    }

    const greetingWords = new Set(["oi", "ola", "bom", "boa", "dia", "tarde", "noite", "obrigado", "obrigada", "valeu"]);
    const words = question.split(" ");
    if (words.length <= 4 && words.every((word) => greetingWords.has(word) || word === "luma")) {
        return "Olá! Sou a Luma, guia do SaquaCare. Escolha um assunto e eu mostro como explorar os recursos da plataforma.";
    }

    for (const topic of TOPICS) {
        if (topic.keywords.some((keyword) => matchesTopic(question, keyword))) {
            return selectAnswer(topic.answers, question);
        }
    }

    return "Ainda não tenho uma resposta preparada para esse assunto. Consigo ajudar com agendamentos demonstrativos, fila, vacinação, unidades, acessibilidade, cadastro, privacidade e recursos do SaquaCare. Não forneço diagnóstico nem orientação médica individual.";
}
