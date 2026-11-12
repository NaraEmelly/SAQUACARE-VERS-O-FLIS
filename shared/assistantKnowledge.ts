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
            "Na demonstração, consulte Agendamentos e explore as ações disponíveis para cada registro. Qualquer cancelamento ou alteração fica apenas no navegador e não avisa uma unidade de saúde nem altera um atendimento real.",
        ],
    },
    {
        keywords: ["agend*", "marcar consulta", "marcar exame", "novo agendamento", "desmarcar", "cancelar consulta", "remarcar"],
        answers: [
            "Na demonstração, abra Agendamentos, escolha Novo agendamento, selecione o tipo de atendimento, a unidade e a data, e confirme. Os registros são locais e fictícios: não confirmam uma consulta real.",
            "Para explorar o fluxo, entre em Agendamentos e use Novo agendamento. Escolha as opções disponíveis e confirme. Esta é uma demonstração; ela não envia nem confirma pedidos em um serviço de saúde real.",
        ],
    },
    {
        keywords: ["fila", "espera", "tempo de atendimento", "minha vez", "chamada"],
        answers: [
            "A área Fila de atendimento mostra exemplos de status e espera para você conhecer a interface. Os dados são fictícios e não representam uma fila ou previsão em tempo real.",
            "Você pode abrir Fila de atendimento pelo painel. A fila é demonstrativa; confirme a espera diretamente com a unidade de saúde, pois o SaquaCare não recebe dados ao vivo.",
        ],
    },
    {
        keywords: ["vacin*", "caderneta", "calendario vacinal", "dose*", "imuniz*"],
        answers: [
            "Na área Vacinação, você encontra conteúdo demonstrativo e pode explorar o registro de doses no navegador. Isso não atualiza sistemas oficiais. Para calendário e orientações atuais, consulte uma unidade de saúde ou o Ministério da Saúde: https://www.gov.br/saude/pt-br/vacinacao",
            "O menu Vacinação permite explorar a carteira e exemplos de doses. Os registros da demonstração não substituem a caderneta nem são enviados ao SUS. Confira seu esquema vacinal com um profissional ou em https://www.gov.br/saude/pt-br/vacinacao",
        ],
    },
    {
        keywords: ["unidad*", "ubs", "posto de saude", "clinic*", "endereco", "onde atende", "localizacao", "mapa"],
        answers: [
            "Abra Unidades para pesquisar e filtrar os locais apresentados na demonstração. Confira endereço, horários e atendimento diretamente com a unidade antes de se deslocar; os dados podem não estar atualizados.",
            "A tela Unidades ajuda a explorar locais e informações de atendimento em Saquarema. Como este conteúdo é demonstrativo e pode mudar, confirme os detalhes com o serviço responsável.",
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
            "O cadastro e o login fazem parte da demonstração. A recuperação automática de senha não está disponível. Não compartilhe sua senha no chat; se tiver dificuldade, procure a equipe pelos canais na seção Contato.",
            "Você pode explorar Entrar e Criar conta na demonstração. O protótipo não oferece recuperação automática de senha e não é um serviço de autenticação oficial. Nunca envie sua senha aqui.",
        ],
    },
    {
        keywords: ["profissional*", "medic*", "enfermeir*", "recepcao", "secretaria", "rh", "administrador*", "permissao*", "perfil de acesso"],
        answers: [
            "A demonstração apresenta áreas distintas para paciente e profissional, com recursos que dependem do perfil. Os nomes, registros e atendimentos exibidos são fictícios; a tela não confirma acesso a um serviço real.",
            "Os perfis de paciente, profissional e administração ilustram como os recursos podem ser organizados por permissão. Este projeto está em desenvolvimento e não deve ser usado para inserir dados reais.",
        ],
    },
    {
        keywords: ["perfil", "meus dados", "editar dados", "telefone cadastrado", "cartao sus"],
        answers: [
            "A área Meu perfil permite explorar os campos demonstrativos. Evite inserir dados pessoais reais: as informações da demonstração ficam no armazenamento local deste navegador.",
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
            "O SaquaCare é um projeto acadêmico em desenvolvimento, ligado à Universidade de Vassouras e pensado para explorar formas de organizar informações e serviços de saúde em Saquarema. A demonstração não representa parceria oficial, serviço público ativo ou disponibilidade em tempo real.",
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
        return "Escreva uma pergunta sobre os recursos do SaquaCare. Posso explicar, por exemplo, os agendamentos demonstrativos, vacinação, unidades ou acessibilidade.";
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
        /\b(?:eu|meu|minha|tenho|estou|sinto|fui diagnosticado|fui diagnosticada)\b[\s\S]{0,80}\b(?:dor|sintoma|febre|doenca|diagnostico|exame|alergia|medicamento|remedio|dose|gravidez|pressao|glicemia)\b/.test(question)
    ) {
        return "Não envie detalhes pessoais de saúde pelo chat. Não consigo avaliar sintomas nem orientar tratamento; procure um profissional de saúde. Se for uma emergência, ligue para o SAMU pelo 192.";
    }

    const greetingWords = new Set(["oi", "ola", "bom", "boa", "dia", "tarde", "noite", "obrigado", "obrigada", "valeu"]);
    const words = question.split(" ");
    if (words.length <= 4 && words.every((word) => greetingWords.has(word) || word === "luma")) {
        return "Olá! Sou a Luma, guia local do SaquaCare. Pergunte sobre as telas e recursos da demonstração; não envie dados pessoais ou clínicos.";
    }

    for (const topic of TOPICS) {
        if (topic.keywords.some((keyword) => matchesTopic(question, keyword))) {
            return selectAnswer(topic.answers, question);
        }
    }

    return "Ainda não tenho uma resposta preparada para esse assunto. Consigo ajudar com agendamentos demonstrativos, fila, vacinação, unidades, acessibilidade, cadastro, privacidade e recursos do SaquaCare. Não forneço diagnóstico nem orientação médica individual.";
}
