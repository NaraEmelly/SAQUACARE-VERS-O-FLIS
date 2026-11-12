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

interface RecognitionAlternativeLike {
    transcript: string;
}

interface RecognitionResultLike extends ArrayLike<RecognitionAlternativeLike> {
    isFinal?: boolean;
}

interface RecognitionEventLike {
    results: ArrayLike<RecognitionResultLike>;
}

interface RecognitionErrorLike {
    error: string;
}

interface SpeechRecognitionLike {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: RecognitionEventLike) => void) | null;
    onerror: ((event: RecognitionErrorLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const SUGGESTIONS = [
    "Como agendo uma consulta?",
    "Como acompanho a fila?",
    "Como uso a acessibilidade?",
    "Por que vacinar é importante?",
];

const SECTION_EXPLANATIONS: Record<string, string> = {
    inicio: "Aqui você conhece a proposta e pode entrar na demonstração do paciente ou do profissional.",
    sobre: "Esta parte apresenta o objetivo do SaquaCare e como a plataforma aproxima as pessoas dos serviços públicos de saúde.",
    servicos: "Aqui estão os principais recursos: agendamentos, consultas, unidades e vacinação.",
    feedback: "Neste formulário você pode avaliar o projeto com estrelas e sugerir melhorias. Não inclua dados pessoais ou de saúde.",
    contato: "Aqui estão os canais de contato da equipe do projeto.",
};

function normalize(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function describeFeature(label: string) {
    const topic = normalize(label);

    if (topic.includes("inicio")) {
        return "O início reúne um resumo da demonstração e atalhos para as principais áreas.";
    }
    if (topic.includes("agendamento") || topic.includes("agenda")) {
        return "Na agenda você consulta os atendimentos demonstrativos e explora o fluxo de agendamento. Os dados são fictícios; não informe dados reais.";
    }
    if (topic.includes("fila")) {
        return "A fila mostra a situação dos atendimentos e o tempo estimado de espera, usando informações fictícias para esta demonstração.";
    }
    if (topic.includes("paciente")) {
        return "Esta área permite explorar a lista demonstrativa de pacientes e os recursos de acompanhamento. Não use informações reais.";
    }
    if (topic.includes("profissional") || topic.includes("medico")) {
        return "Nesta área você pode conhecer os profissionais e as especialidades disponíveis na demonstração.";
    }
    if (topic.includes("unidade")) {
        return "Aqui você encontra unidades de saúde e pode explorar seus dados de localização e atendimento.";
    }
    if (topic.includes("vacina")) {
        return "A área de vacinação apresenta informações demonstrativas para consultar e acompanhar vacinas.";
    }
    if (topic.includes("rh") || topic.includes("gestao")) {
        return "A Gestão Interna / RH reúne telas demonstrativas de organização profissional e dados fictícios.";
    }
    if (topic.includes("perfil")) {
        return "Em Meu perfil você visualiza e edita as informações de demonstração disponíveis nesta tela.";
    }

    return "Explore esta área para conhecer os recursos demonstrativos do SaquaCare.";
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
            explanation: "Explore as informações e controles desta área demonstrativa. Selecione um assunto ou faça uma pergunta para receber ajuda.",
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
    const [mensagem, setMensagem] = useState("");
    const [ouvindo, setOuvindo] = useState(false);
    const [falaAtiva, setFalaAtiva] = useState(true);
    const [falando, setFalando] = useState(false);
    const [vozesDisponiveis, setVozesDisponiveis] = useState<SpeechSynthesisVoice[]>([]);
    const [vozSelecionada, setVozSelecionada] = useState("");
    const [erroVoz, setErroVoz] = useState("");
    const [tour, setTour] = useState<TourState | null>(null);
    const [conversas, setConversas] = useState<ChatMessage[]>([
        {
            id: 0,
            role: "assistant",
            text: "Olá! Sou a Luma, guia local do SaquaCare. Posso responder dúvidas comuns sobre a demonstração; minhas respostas são preparadas pela equipe, não sou uma IA generativa e não uso um serviço pago. Não envie dados pessoais ou clínicos.",
        },
    ]);
    const idMensagem = useRef(1);
    const idFalaAtual = useRef(0);
    const areaMensagensRef = useRef<HTMLDivElement>(null);
    const perguntaRef = useRef<HTMLInputElement>(null);
    const painelRef = useRef<HTMLElement>(null);
    const launcherRef = useRef<HTMLButtonElement>(null);
    const reconhecimentoRef = useRef<SpeechRecognitionLike | null>(null);
    const tourAtual = tour?.steps[tour.index];
    const reconhecimentoDisponivel =
        typeof window !== "undefined"
        && Boolean(
            (window as SpeechRecognitionWindow).SpeechRecognition
            || (window as SpeechRecognitionWindow).webkitSpeechRecognition
        );
    const falaDisponivel =
        typeof window !== "undefined" && "speechSynthesis" in window;
    const vozesPortuguesBrasil = vozesDisponiveis.filter((voice) =>
        voice.lang.toLowerCase().startsWith("pt-br")
    );
    const vozPreferida =
        vozesPortuguesBrasil.find((voice) =>
            /maria|francisca|natural|neural/i.test(voice.name)
        )
        || vozesPortuguesBrasil[0];
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
            const preferred =
                brazilianVoices.find((voice) =>
                    /maria|francisca|natural|neural/i.test(voice.name)
                )
                || brazilianVoices[0];

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

        if (window.matchMedia("(max-width: 560px)").matches) {
            painelRef.current?.focus();
        } else {
            perguntaRef.current?.focus();
        }
        function fecharComEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") return;

            pararFala();
            reconhecimentoRef.current?.stop();
            reconhecimentoRef.current = null;
            setOuvindo(false);
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
            reconhecimentoRef.current?.stop();
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
        utterance.rate = 0.94;
        utterance.pitch = 1.03;
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
        if (reconhecimentoRef.current) {
            reconhecimentoRef.current.onend = null;
            reconhecimentoRef.current.stop();
            reconhecimentoRef.current = null;
        }
        setOuvindo(false);
        setTour(null);
        setAberto(false);
        launcherRef.current?.focus();
    }

    function iniciarTour() {
        const steps = buildGuidedSteps();
        if (steps.length === 0) {
            const text = "Não encontrei um tour disponível nesta tela. Você pode escolher um assunto ou fazer uma pergunta.";
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
        const text = `Vamos começar! ${firstStep.title}: ${firstStep.explanation} Use “Próximo” para continuar.`;
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
        const text = `${nextStep.title}: ${nextStep.explanation}`;
        adicionarConversa("assistant", text);
        falar(text);
    }

    function enviarPergunta(question = mensagem) {
        const pergunta = question.trim();
        if (!pergunta) return;

        adicionarConversa("visitor", pergunta);
        setMensagem("");
        setErroVoz("");

        if (normalize(pergunta).split(/\s+/).includes("tour")) {
            iniciarTour();
            return;
        }

        if (tour) encerrarTour();
        const answer = getLocalAssistantReply(pergunta);
        adicionarConversa("assistant", answer);
        falar(answer);
    }

    function ouvirPergunta() {
        if (!reconhecimentoDisponivel) {
            setErroVoz("O reconhecimento de voz não está disponível neste navegador.");
            return;
        }

        reconhecimentoRef.current?.stop();
        const speechWindow = window as SpeechRecognitionWindow;
        const Recognition =
            speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
        if (!Recognition) {
            setErroVoz("O reconhecimento de voz não está disponível neste navegador.");
            return;
        }

        const recognition = new Recognition();
        recognition.lang = "pt-BR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
            const transcript = event.results[0]?.[0]?.transcript?.trim();
            if (transcript) enviarPergunta(transcript);
        };
        recognition.onerror = (event) => {
            const errorText = event.error === "not-allowed"
                ? "Permita o uso do microfone no navegador para fazer uma pergunta por voz."
                : event.error === "no-speech"
                    ? "Não ouvi uma pergunta. Tente novamente ou escreva sua dúvida."
                    : "Não foi possível reconhecer a voz. Você pode escrever sua pergunta.";
            setErroVoz(errorText);
            setOuvindo(false);
        };
        recognition.onend = () => {
            setOuvindo(false);
            reconhecimentoRef.current = null;
        };

        reconhecimentoRef.current = recognition;
        setErroVoz("Pode falar. O reconhecimento depende das permissões e do suporte do navegador.");
        setOuvindo(true);

        try {
            recognition.start();
        } catch {
            setOuvindo(false);
            reconhecimentoRef.current = null;
            setErroVoz("Não foi possível iniciar o microfone. Tente novamente ou escreva sua pergunta.");
        }
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
                        Respostas locais, sem envio para IA externa. Não informe dados pessoais ou clínicos.
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
                                    onClick={() => enviarPergunta(suggestion)}
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

                    <form
                        className="saqua-assistant-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            enviarPergunta();
                        }}
                    >
                        <label className="saqua-assistant-input-label" htmlFor="saqua-assistant-question">
                            Sua pergunta
                        </label>
                        <div className="saqua-assistant-input-row">
                            <input
                                id="saqua-assistant-question"
                                ref={perguntaRef}
                                type="text"
                                value={mensagem}
                                onChange={(event) => setMensagem(event.target.value)}
                                placeholder="Escreva sua dúvida..."
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className={ouvindo ? "saqua-assistant-microphone is-listening" : "saqua-assistant-microphone"}
                                aria-label={ouvindo ? "Parar de ouvir" : "Perguntar por voz"}
                                aria-pressed={ouvindo}
                                disabled={!reconhecimentoDisponivel}
                                onClick={() => {
                                    if (ouvindo) {
                                        reconhecimentoRef.current?.stop();
                                        setOuvindo(false);
                                    } else {
                                        ouvirPergunta();
                                    }
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <rect x="9" y="2.5" width="6" height="12" rx="3" />
                                    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7" />
                                </svg>
                            </button>
                            <button
                                type="submit"
                                className="saqua-assistant-send"
                                aria-label="Enviar pergunta"
                                disabled={!mensagem.trim()}
                            >
                                ↑
                            </button>
                        </div>
                        <p className="saqua-assistant-status" role="status">
                            {erroVoz || (reconhecimentoDisponivel
                                ? "O reconhecimento de voz depende do navegador. Não fale dados pessoais ou clínicos."
                                : "Voz indisponível neste navegador; você ainda pode escrever.")}
                        </p>
                    </form>
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
