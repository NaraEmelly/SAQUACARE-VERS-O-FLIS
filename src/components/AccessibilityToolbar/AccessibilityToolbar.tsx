import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import "./AccessibilityToolbar.css";

export default function AccessibilityToolbar() {
    const [aberto, setAberto] = useState(false);
    const [textoAmpliado, setTextoAmpliado] = useState(false);
    const [altoContraste, setAltoContraste] = useState(false);
    const [lendo, setLendo] = useState(false);
    const leituraDisponivel = typeof window !== "undefined" && "speechSynthesis" in window;
    const alternadorRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.documentElement.classList.toggle(
            "saquacare-texto-ampliado",
            textoAmpliado
        );
        document.body.classList.toggle(
            "saquacare-alto-contraste",
            altoContraste
        );

        return () => {
            document.documentElement.classList.remove("saquacare-texto-ampliado");
            document.body.classList.remove("saquacare-alto-contraste");
        };
    }, [textoAmpliado, altoContraste]);

    useEffect(() => {
        return () => window.speechSynthesis?.cancel();
    }, []);

    useEffect(() => {
        if (!aberto) return;

        function fecharComEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAberto(false);
                alternadorRef.current?.focus();
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        return () => document.removeEventListener("keydown", fecharComEscape);
    }, [aberto]);

    function pularParaConteudo(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        const principal = document.querySelector<HTMLElement>("main");
        if (!principal) return;

        principal.tabIndex = -1;
        principal.focus();
        principal.scrollIntoView({ block: "start" });
    }

    function alternarLeitura() {
        if (!leituraDisponivel) return;

        if (lendo) {
            window.speechSynthesis.cancel();
            setLendo(false);
            return;
        }

        const conteudo = document.querySelector("main")?.innerText.trim()
            || document.body.innerText.trim();

        if (!conteudo) return;

        const fala = new SpeechSynthesisUtterance(conteudo);
        fala.lang = "pt-BR";
        fala.onend = () => setLendo(false);
        fala.onerror = () => setLendo(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(fala);
        setLendo(true);
    }

    return (
        <div className="acessibilidade" data-accessibility-widget>
            <a className="acessibilidade-pular-conteudo" href="#conteudo-principal" onClick={pularParaConteudo}>
                Pular para o conteúdo principal
            </a>
            <section
                className="acessibilidade-painel"
                id="painel-acessibilidade"
                aria-label="Opções de acessibilidade"
                hidden={!aberto}
            >
                <h2>Acessibilidade</h2>
                <button
                    type="button"
                    aria-pressed={textoAmpliado}
                    onClick={() => setTextoAmpliado((atual) => !atual)}
                >
                    {textoAmpliado ? "Restaurar tamanho do texto" : "Aumentar tamanho do texto"}
                </button>
                <button
                    type="button"
                    aria-pressed={altoContraste}
                    onClick={() => setAltoContraste((atual) => !atual)}
                >
                    {altoContraste ? "Desativar alto contraste" : "Ativar alto contraste"}
                </button>
                <button
                    type="button"
                    onClick={alternarLeitura}
                    disabled={!leituraDisponivel}
                >
                    {lendo ? "Parar leitura da página" : "Ler página em voz alta"}
                </button>
                {!leituraDisponivel && (
                    <p className="acessibilidade-aviso" role="status">
                        A leitura em voz alta não está disponível neste navegador.
                    </p>
                )}
            </section>
            <button
                type="button"
                ref={alternadorRef}
                className="acessibilidade-alternador"
                aria-expanded={aberto}
                aria-controls="painel-acessibilidade"
                aria-label={aberto ? "Fechar opções de acessibilidade" : "Abrir opções de acessibilidade"}
                onClick={() => setAberto((atual) => !atual)}
            >
                <svg
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle cx="12" cy="5" r="2.5" />
                    <path d="M12 8v6m-7-5 7 2 7-2m-7 5-4 7m4-7 4 7" />
                </svg>
            </button>
        </div>
    );
}
