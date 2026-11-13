import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLocalAssistantReply } from "../../../shared/assistantKnowledge";
import "./ProjectAssistant.css";

type MessageRole = "assistant" | "visitor";

interface ChatMessage {
    id: number;
    role: MessageRole;
    text: string;
}

interface GuidedStep {
    target: HTMLElement;
    title: string;
    explanation: string;
    activate: boolean;
}

interface TourState {
    steps: GuidedStep[];
    index: number;
}

const SUGGESTIONS = [
    "Como agendo uma consulta?",
    "Como acompanho a fila?",
    "Como uso a acessibilidade?",
    "Por que vacinar é importante?",
    "Como encontro uma unidade?",
    "Como funciona o cadastro?",
    "O chat salva meus dados?",
];

const SECTION_EXPLANATIONS: Record<string, string> = {
    inicio: "Começamos por aqui: um resumo do projeto e atalhos para conhecer as áreas de paciente e profissional.",
    sobre: "Aqui você conhece a proposta do SaquaCare e como a plataforma pode facilitar o acesso às informações de saúde.",
    servicos: "Nesta parte estão reunidos os principais recursos: agendamentos, consultas, unidades e vacinação.",
    feedback: "Sua opinião ajuda a melhorar o projeto. Se quiser deixar uma sugestão, só não inclua dados pessoais ou de saúde.",
    contato: "E se quiser falar com a equipe, os canais de contato ficam por aqui.",
};

function normalize(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function preferredPortugueseVoice(voices: SpeechSynthesisVoice[]) {
    function naturalnessScore(voice: SpeechSynthesisVoice) {
        const name = voice.name.toLowerCase();
        let score = 0;
        if (/natural|neural|wavenet|enhanced|premium/.test(name)) score += 10;
        if (/online/.test(name)) score += 2;
        if (/google|microsoft/.test(name)) score += 1;
        if (voice.default) score += 1;
        return score;
    }

    return [...voices].sort((first, second) =>
        naturalnessScore(second) - naturalnessScore(first)
    )[0];
}

function describeFeature(label: string) {
    const topic = normalize(label);

    if (topic.includes("inicio")) {
        return "Por aqui você encontra um resumo do SaquaCare e atalhos para as principais áreas.";
    }
    if (topic.includes("agendamento") || topic.includes("agenda")) {
        return "Aqui você pode consultar a agenda, ver os detalhes de cada atendimento e iniciar um novo agendamento.";
    }
    if (topic.includes("fila")) {
        return "Nesta tela você acompanha os atendimentos por etapa e vê como a equipe pode organizar o fluxo da fila.";
    }
    if (topic.includes("paciente")) {
        return "Aqui ficam os recursos para consultar agendamentos, acompanhar atendimentos e organizar as informações do paciente.";
    }
    if (topic.includes("profissional") || topic.includes("medico")) {
        return "Nesta área os profissionais podem explorar agenda, atendimentos e informações das especialidades.";
    }
    if (topic.includes("unidade")) {
        return "Aqui você pode pesquisar as unidades apresentadas no projeto e explorar as informações disponíveis.";
    }
    if (topic.includes("vacina")) {
        return "A área de vacinação ajuda a consultar a carteira e organizar o acompanhamento das doses.";
    }
    if (topic.includes("rh") || topic.includes("gestao")) {
        return "A área de Gestão Interna reúne recursos para organizar informações e rotinas profissionais.";
    }
    if (topic.includes("perfil")) {
        return "Em Meu perfil você pode consultar e atualizar as informações disponíveis.";
    }

    return "Dê uma olhada nesta área para conhecer os recursos do SaquaCare.";
}

function buildGuidedSteps(): GuidedStep[] {
    const navigationItems = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
            ".sidebar-menu .menu-item, .sidebar-bottom .menu-item:not(.menu-item--sair)"
        )
    );

    if (navigationItems.length > 0) {
        return navigationItems.map((target) => {
            const title = target.getAttribute("aria-label") || target.innerText.trim();
            return {
                target,
                title,
                explanation: describeFeature(title),
                activate: true,
            };
        });
    }

    const landingSections = Array.from(
        document.querySelectorAll<HTMLElement>(".landing-container > section")
    );

    if (landingSections.length > 0) {
        return landingSections.map((target) => {
            const title =
                target.querySelector<HTMLElement>("h1, h2")?.innerText
                    .trim()
                    .replace(/\s+/g, " ")
                || target.getAttribute("aria-label")
                || "Saiba mais";
            const sectionId = target.id || "";
            return {
                target,
                title,
                explanation:
                    SECTION_EXPLANATIONS[sectionId]
                    || "Esta seção apresenta informações e recursos do projeto SaquaCare.",
                activate: false,
            };
        });
    }

    const main = document.querySelector<HTMLElement>(
        "main, .unidades-container, .agendamentos-container, .vacinacao-page"
    );
    if (!main) return [];

    return [
        {
            target: main,
            title: main.querySelector("h1, h2")?.textContent?.trim() || "Esta tela",
            explanation: "Explore as informações e controles desta área. Se quiser, abra o guia para ver mais opções.",
            activate: false,
        },
    ];
}

function RobotIcon({ speaking = false }: { speaking?: boolean }) {
    return (
        <svg
            className={speaking ? "saqua-bot-face is-speaking" : "saqua-bot-face"}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
        >
            <path d="M24 7v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="5" r="2" fill="currentColor" />
            <rect x="7" y="13" width="34" height="27" rx="10" fill="currentColor" opacity=".14" />
            <rect x="7" y="13" width="34" height="27" rx="10" stroke="currentColor" strokeWidth="2.5" />
            <path d="M7 23H4m40 0h-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="18" cy="25" r="2.4" fill="currentColor" />
            <circle cx="30" cy="25" r="2.4" fill="currentColor" />
            <path d="M17 32c1.8 2 4.1 3 7 3s5.2-1 7-3" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
        </svg>
    );
}

export default function ProjectAssistant() {
    const location = useLocation();
    const [aberto, setAberto] = useState(false);
    const [falaAtiva, setFalaAtiva] = useState(true);
    const [falando, setFalando] = useState(false);
    const [vozesDisponiveis, setVozesDisponiveis] = useState<SpeechSynthesisVoice[]>([]);
    const [vozSelecionada, setVozSelecionada] = useState("");
    const [tour, setTour] = useState<TourState | null>(null);
    const [conversas, setConversas] = useState<ChatMessage[]>([
        {
            id: 0,
            role: "assistant",
            text: "Olá! Sou a Luma, guia do SaquaCare. Vou acompanhar você por uma apresentação dos recursos da plataforma. Escolha um assunto ou comece pelo tour. Para sua segurança, não compartilhe senhas nem informações pessoais ou de saúde.",
        },
    ]);
    const idMensagem = useRef(1);
    const idFalaAtual = useRef(0);
    const areaMensagensRef = useRef<HTMLDivElement>(null);
    const painelRef = useRef<HTMLElement>(null);
    const launcherRef = useRef<HTMLButtonElement>(null);
    const tourAtual = tour?.steps[tour.index];
    const falaDisponivel =
        typeof window !== "undefined" && "speechSynthesis" in window;
    const vozesPortuguesBrasil = vozesDisponiveis.filter((voice) =>
        voice.lang.toLowerCase().startsWith("pt-br")
    );
    const vozPreferida = preferredPortugueseVoice(vozesPortuguesBrasil);
    const vozAtiva =
        vozesDisponiveis.find((voice) => voice.voiceURI === vozSelecionada)
        || vozPreferida;

    useEffect(() => {
        const area = areaMensagensRef.current;
        if (area) area.scrollTop = area.scrollHeight;
    }, [conversas, tour]);

    useEffect(() => {
        setTour(null);
    }, [location.pathname]);

    useEffect(() => {
        if (!falaDisponivel) return;

        function carregarVozes() {
            const voices = window.speechSynthesis.getVoices();
            setVozesDisponiveis(voices);
            const brazilianVoices = voices.filter((voice) =>
                voice.lang.toLowerCase().startsWith("pt-br")
            );
            const preferred = preferredPortugueseVoice(brazilianVoices);

            setVozSelecionada((current) =>
                current && voices.some((voice) => voice.voiceURI === current)
                    ? current
                    : preferred?.voiceURI || ""
            );
        }

        carregarVozes();
        window.speechSynthesis.addEventListener("voiceschanged", carregarVozes);
        return () =>
            window.speechSynthesis.removeEventListener("voiceschanged", carregarVozes);
    }, [falaDisponivel]);

    useEffect(() => {
        if (!aberto) return;

        painelRef.current?.focus();
        function fecharComEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") return;

            pararFala();
            setTour(null);
            setAberto(false);
            launcherRef.current?.focus();
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [aberto]);

    useEffect(() => {
        if (!tourAtual) return;

        const alvo = tourAtual.target;
        alvo.classList.add("saqua-tour-highlight");
        alvo.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            block: "center",
            inline: "nearest",
        });

        return () => alvo.classList.remove("saqua-tour-highlight");
    }, [tourAtual]);

    useEffect(() => {
        return () => {
            idFalaAtual.current += 1;
            window.speechSynthesis?.cancel();
            document
                .querySelectorAll(".saqua-tour-highlight")
                .forEach((element) => element.classList.remove("saqua-tour-highlight"));
        };
    }, []);

    function adicionarConversa(role: MessageRole, text: string) {
        setConversas((current) => [
            ...current,
            { id: idMensagem.current++, role, text },
        ]);
    }

    function pararFala() {
        idFalaAtual.current += 1;
        window.speechSynthesis?.cancel();
        setFalando(false);
    }

    function falar(text: string) {
        if (!falaAtiva || !falaDisponivel) return;

        window.speechSynthesis.cancel();
        const falaId = ++idFalaAtual.current;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        if (vozAtiva) utterance.voice = vozAtiva;
        utterance.rate = 0.98;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onstart = () => {
            if (idFalaAtual.current === falaId) setFalando(true);
        };
        utterance.onend = utterance.onerror = () => {
            if (idFalaAtual.current === falaId) setFalando(false);
        };
        setFalando(true);
        window.speechSynthesis.speak(utterance);
    }

    function encerrarTour() {
        setTour(null);
    }

    function fecharAssistente() {
        pararFala();
        setTour(null);
        setAberto(false);
        launcherRef.current?.focus();
    }

    function iniciarTour() {
        const steps = buildGuidedSteps();
        if (steps.length === 0) {
            const text = "Não encontrei um tour para esta tela. Você pode abrir o guia e escolher um dos assuntos disponíveis.";
            adicionarConversa("assistant", text);
            falar(text);
            return;
        }

        if (steps[0].activate && steps[0].target instanceof HTMLButtonElement) {
            steps[0].target.click();
        }
        setTour({ steps, index: 0 });
        setAberto(false);
        const firstStep = steps[0];
        const text = `Que tal conhecer esta tela comigo? Vamos começar por ${firstStep.title.toLowerCase()}. ${firstStep.explanation} Quando quiser, toque em Próximo.`;
        adicionarConversa("assistant", text);
        falar(text);
    }

    function avancarTour() {
        if (!tour) return;

        const nextIndex = tour.index + 1;
        if (nextIndex >= tour.steps.length) {
            setTour(null);
            const text = "Tour concluído! Escolha um assunto ou me pergunte sobre outra funcionalidade.";
            adicionarConversa("assistant", text);
            falar(text);
            return;
        }

        const nextStep = tour.steps[nextIndex];
        if (nextStep.activate && nextStep.target instanceof HTMLButtonElement) {
            nextStep.target.click();
        }
        setTour({ ...tour, index: nextIndex });
        const transitions = [
            "Agora vamos dar uma olhada em",
            "Seguindo nosso passeio, chegamos a",
            "Olha só o que tem em",
            "E também vale conhecer",
        ];
        const transition = nextIndex === tour.steps.length - 1
            ? "Para fechar, vamos conhecer"
            : transitions[(nextIndex - 1) % transitions.length];
        const text = `${transition} ${nextStep.title.toLowerCase()}. ${nextStep.explanation}`;
        adicionarConversa("assistant", text);
        falar(text);
    }

    function responderSugestao(question: string) {
        adicionarConversa("visitor", question);
        const answer = getLocalAssistantReply(question);
        adicionarConversa("assistant", answer);
        falar(answer);
    }

    return (
        <div className="saqua-assistant" data-saqua-assistant>
            {aberto && (
                <section
                    ref={painelRef}
                    className="saqua-assistant-panel"
                    role="dialog"
                    aria-label="Assistente virtual SaquaCare"
                    aria-modal="false"
                    tabIndex={-1}
                >
                    <header className="saqua-assistant-header">
                        <span className="saqua-assistant-avatar" aria-hidden="true">
                            <RobotIcon speaking={falando} />
                        </span>
                        <div className="saqua-assistant-heading">
                            <strong>Luma</strong>
                            <span>Guia local do SaquaCare</span>
                        </div>
                        <button
                            type="button"
                            className="saqua-assistant-sound"
                            aria-label={falaAtiva ? "Desativar fala das respostas" : "Ativar fala das respostas"}
                            aria-pressed={falaAtiva}
                            disabled={!falaDisponivel}
                            onClick={() => {
                                if (falaAtiva) {
                                    pararFala();
                                }
                                setFalaAtiva((current) => !current);
                            }}
                        >
                            {falaAtiva ? "Voz on" : "Voz off"}
                        </button>
                        <button
                            type="button"
                            className="saqua-assistant-close"
                            aria-label="Fechar assistente"
                            onClick={fecharAssistente}
                        >
                            ×
                        </button>
                    </header>

                    <p className="saqua-assistant-notice">
                        Escolha um assunto para conhecer os recursos. Esta é uma apresentação: as ações não confirmam atendimentos em serviços de saúde.
                    </p>

                    {vozesPortuguesBrasil.length > 0 && (
                        <label className="saqua-assistant-voice-picker">
                            Voz do guia
                            <select
                                aria-label="Voz do guia"
                                value={vozAtiva?.voiceURI || ""}
                                onChange={(event) => setVozSelecionada(event.target.value)}
                            >
                                {vozesPortuguesBrasil.map((voice) => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name.replace(/^Microsoft\s+/i, "").replace(/\s*-\s*Portuguese \(Brazil\)/i, "")}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div
                        className="saqua-assistant-messages"
                        ref={areaMensagensRef}
                        role="log"
                        aria-live="polite"
                        aria-relevant="additions"
                    >
                        {conversas.map((item) => (
                            <div
                                key={item.id}
                                className={`saqua-assistant-message saqua-assistant-message--${item.role}`}
                            >
                                {item.role === "assistant" && (
                                    <span className="saqua-message-avatar" aria-hidden="true">
                                        <RobotIcon />
                                    </span>
                                )}
                                <p>{item.text}</p>
                            </div>
                        ))}
                        <span className="saqua-assistant-message-end" />
                    </div>

                    {tour ? (
                        <div className="saqua-assistant-tour-controls">
                            <span>Etapa {tour.index + 1} de {tour.steps.length}</span>
                            <div>
                                <button type="button" onClick={avancarTour}>
                                    {tour.index + 1 === tour.steps.length ? "Concluir tour" : "Próximo"}
                                </button>
                                <button type="button" className="saqua-assistant-secondary" onClick={encerrarTour}>
                                    Encerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="saqua-assistant-suggestions"
                            role="group"
                            aria-label="Perguntas sugeridas"
                        >
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    type="button"
                                    key={suggestion}
                                    onClick={() => responderSugestao(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="saqua-assistant-tour-start"
                                onClick={iniciarTour}
                            >
                                Fazer tour guiado
                            </button>
                        </div>
                    )}

                </section>
            )}

            {tour && !aberto && (
                <div className="saqua-assistant-tour-dock" role="group" aria-label="Controles do tour guiado">
                    <span>Tour {tour.index + 1}/{tour.steps.length}</span>
                    <button type="button" onClick={avancarTour}>
                        {tour.index + 1 === tour.steps.length ? "Concluir" : "Próximo"}
                    </button>
                    <button type="button" className="saqua-assistant-tour-dock-end" onClick={encerrarTour}>
                        Encerrar
                    </button>
                </div>
            )}

            <button
                type="button"
                ref={launcherRef}
                className="saqua-assistant-launcher"
                aria-label={aberto ? "Fechar assistente SaquaCare" : tour ? "Abrir controles do tour guiado" : "Abrir assistente SaquaCare"}
                aria-expanded={aberto}
                onClick={() => {
                    if (aberto) {
                        fecharAssistente();
                    } else {
                        setAberto(true);
                    }
                }}
            >
                <RobotIcon speaking={falando} />
            </button>
        </div>
    );
}
