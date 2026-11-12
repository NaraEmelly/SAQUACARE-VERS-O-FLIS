import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import "./AccessibilityToolbar.css";

export default function AccessibilityToolbar() {
    const [aberto, setAberto] = useState(false);
    const [tamanhoTexto, setTamanhoTexto] = useState(100);
    const [altoContraste, setAltoContraste] = useState(false);
    const [escalaCinza, setEscalaCinza] = useState(false);
    const [linksDestacados, setLinksDestacados] = useState(false);
    const [espacamentoAmpliado, setEspacamentoAmpliado] = useState(false);
    const [lendo, setLendo] = useState(false);
    const leituraDisponivel = typeof window !== "undefined" && "speechSynthesis" in window;
    const alternadorRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const tamanhoOriginal = document.documentElement.style.fontSize;
        document.documentElement.style.fontSize = `${tamanhoTexto}%`;
        document.body.classList.toggle(
            "saquacare-alto-contraste",
            altoContraste
        );
        document.body.classList.toggle("saquacare-escala-cinza", escalaCinza);
        document.body.classList.toggle(
            "saquacare-links-destacados",
            linksDestacados
        );
        document.body.classList.toggle(
            "saquacare-espacamento-ampliado",
            espacamentoAmpliado
        );

        return () => {
            document.documentElement.style.fontSize = tamanhoOriginal;
            document.body.classList.remove("saquacare-alto-contraste");
            document.body.classList.remove("saquacare-escala-cinza");
            document.body.classList.remove("saquacare-links-destacados");
            document.body.classList.remove("saquacare-espacamento-ampliado");
        };
    }, [
        tamanhoTexto,
        altoContraste,
        escalaCinza,
        linksDestacados,
        espacamentoAmpliado,
    ]);

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

    function restaurarOpcoes() {
        setTamanhoTexto(100);
        setAltoContraste(false);
        setEscalaCinza(false);
        setLinksDestacados(false);
        setEspacamentoAmpliado(false);
        window.speechSynthesis?.cancel();
        setLendo(false);
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
                <div className="acessibilidade-tamanho" role="group" aria-label="Tamanho do texto">
                    <span>Tamanho do texto</span>
                    <button
                        type="button"
                        aria-label="Diminuir tamanho do texto"
                        onClick={() => setTamanhoTexto((atual) => Math.max(90, atual - 10))}
                        disabled={tamanhoTexto <= 90}
                    >
                        A−
                    </button>
                    <output aria-live="polite">{tamanhoTexto}%</output>
                    <button
                        type="button"
                        aria-label="Aumentar tamanho do texto"
                        onClick={() => setTamanhoTexto((atual) => Math.min(140, atual + 10))}
                        disabled={tamanhoTexto >= 140}
                    >
                        A+
                    </button>
                </div>
                <button
                    type="button"
                    aria-pressed={altoContraste}
                    onClick={() => setAltoContraste((atual) => !atual)}
                >
                    {altoContraste ? "Desativar alto contraste" : "Ativar alto contraste"}
                </button>
                <button
                    type="button"
                    aria-pressed={escalaCinza}
                    onClick={() => setEscalaCinza((atual) => !atual)}
                >
                    {escalaCinza ? "Desativar escala de cinza" : "Ativar escala de cinza"}
                </button>
                <button
                    type="button"
                    aria-pressed={linksDestacados}
                    onClick={() => setLinksDestacados((atual) => !atual)}
                >
                    {linksDestacados ? "Desmarcar links destacados" : "Destacar links"}
                </button>
                <button
                    type="button"
                    aria-pressed={espacamentoAmpliado}
                    onClick={() => setEspacamentoAmpliado((atual) => !atual)}
                >
                    {espacamentoAmpliado ? "Restaurar espaçamento" : "Ampliar espaçamento"}
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
                <button type="button" onClick={restaurarOpcoes}>
                    Restaurar opções padrão
                </button>
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
