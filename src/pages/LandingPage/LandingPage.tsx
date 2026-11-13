import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent, RefObject } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/logo-saquacare.png";
import "./LandingPage.css";

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h2" />
      </svg>
    ),
    title: "Agendamentos",
    description: "Organize suas consultas e acompanhe seus próximos atendimentos.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5v17M3.5 12h17" />
        <rect x="3" y="3" width="18" height="18" rx="5" />
      </svg>
    ),
    title: "Exames e consultas",
    description: "Consulte informações importantes sobre seu cuidado em saúde.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
    title: "Unidades de saúde",
    description: "Encontre informações sobre as unidades de atendimento.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Vacinas",
    description: "Acesse informações para acompanhar sua jornada de vacinação.",
  },
];

const aboutPoints = [
  "Acesso facilitado",
  "Informações organizadas",
  "Acompanhamento da jornada",
];

const NAV_LINKS = [
  { id: "sobre", label: "Sobre" },
  { id: "servicos", label: "Serviços" },
  { id: "feedback", label: "Feedback" },
  { id: "contato", label: "Contato" },
] as const;


function useScrolled(offset = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  return scrolled;
}

function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id)
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));


    const onScroll = () => {
      if (window.scrollY < 200) setActive("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return active;
}

function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const timers: number[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.classList.add("is-visible");

          timers.push(
            window.setTimeout(() => el.classList.add("is-settled"), 1300)
          );

          observer.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [rootRef]);
}

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  if (id === "inicio") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}


function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const feedbackHoneypotRef = useRef<HTMLInputElement>(null);
  const scrolled = useScrolled();
  const activeSection = useActiveSection();
  const [feedbackNome, setFeedbackNome] = useState("");
  const [feedbackCategoria, setFeedbackCategoria] = useState("Sugestão de melhoria");
  const [feedbackAvaliacao, setFeedbackAvaliacao] = useState(0);
  const [feedbackMensagem, setFeedbackMensagem] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [feedbackEnviando, setFeedbackEnviando] = useState(false);

  useReveal(rootRef);

  const goTo = (destination: string) =>
    navigate("/loading", { state: { destino: destination } });

  async function enviarFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endpoint = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL?.trim();
    if (!endpoint) {
      setFeedbackStatus(
        "O envio automático ainda não foi configurado. Você pode encaminhar sua avaliação pelo e-mail abaixo."
      );
      return;
    }

    setFeedbackEnviando(true);
    setFeedbackStatus("");

    try {
      const dados = new URLSearchParams({
        name: feedbackNome.trim(),
        category: feedbackCategoria,
        rating: String(feedbackAvaliacao),
        message: feedbackMensagem.trim(),
        website: feedbackHoneypotRef.current?.value ?? "",
      });

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: dados,
      });

      setFeedbackStatus(
        "Solicitação encaminhada ao Google. Como não é possível confirmar o recebimento pelo navegador, use o e-mail abaixo se a mensagem não chegar."
      );
      setFeedbackNome("");
      setFeedbackMensagem("");
      setFeedbackAvaliacao(0);
    } catch {
      setFeedbackStatus(
        "Não foi possível contatar o serviço de envio. Você pode encaminhar sua avaliação pelo e-mail abaixo."
      );
    } finally {
      setFeedbackEnviando(false);
    }
  }

  return (
    <main className="landing-container" ref={rootRef}>
      <header className={`navbar${scrolled ? " is-scrolled" : ""}`}>
        <div className="navbar-inner">
          <a
            className="brand official-brand"
            href="#inicio"
            aria-label="SaquaCare — início"
            onClick={(e) => scrollToSection(e, "inicio")}
          >
            <img src={logo} alt="SaquaCare" />
          </a>

          <nav className="site-nav" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={activeSection === link.id ? "true" : undefined}
                onClick={(e) => scrollToSection(e, link.id)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav-buttons">
            <a
              className="nav-btn nav-btn-outline"
              href="#feedback"
              onClick={(event) => scrollToSection(event, "feedback")}
            >
              Feedback
            </a>
            <button
              type="button"
              className="nav-btn nav-btn-primary"
              onClick={() => goTo("/dashboard")}
            >
              Acessar demonstração
            </button>
          </div>
        </div>

        <span className="scroll-progress" aria-hidden="true" />
      </header>

      <section id="inicio" className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Saúde pública de Saquarema
            </span>
            <h1>
              Cuidar da saúde
              <br />
              <span>pode ser mais simples.</span>
            </h1>
            <p className="hero-description">
              Acompanhe serviços de saúde em um só lugar. Mais clareza para
              encontrar informações, organizar sua rotina e cuidar de você.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => goTo("/dashboard")}
              >
                Acessar demonstração
                <span aria-hidden="true">→</span>
              </button>
              <a
                className="text-link"
                href="#servicos"
                onClick={(e) => scrollToSection(e, "servicos")}
              >
                Conheça os serviços
              </a>
            </div>
            <a
              className="professional-demo-link"
              href="/profissional/dashboard"
            >
              Acessar demonstração da área profissional
              <span aria-hidden="true">→</span>
            </a>
            <div className="hero-note">
              <span className="note-check" aria-hidden="true">
                ✓
              </span>
              Informação e serviços de saúde em uma plataforma acessível
            </div>
          </div>

          <div className="hero-visual" aria-label="Saúde conectada e acessível">
            <div className="glow-orb" aria-hidden="true" />

            <svg
              className="pulse-line"
              viewBox="0 0 600 120"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                pathLength={1}
                d="M0 70 H200 L228 70 L250 18 L284 108 L312 44 L334 70 H600"
              />
            </svg>

            <div className="cards-wrapper">
              <div className="floating-card appointment-card">
                <span className="floating-icon calendar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
                    <path d="M8 3v4M16 3v4M4 10h16" />
                  </svg>
                </span>
                <div className="card-text">
                  <strong>Sua saúde, mais perto</strong>
                  <small>Informações em um só lugar</small>
                </div>
              </div>

              <div className="floating-card preview-card" aria-hidden="true">
                <div className="preview-top">
                  <span className="preview-label">Próxima consulta</span>
                  <span className="preview-badge">Confirmada</span>
                </div>
                <strong className="preview-date">12 de agosto</strong>
                <span className="preview-meta">09:30 · Clínica Médica</span>
                <div className="preview-queue">
                  <div className="preview-queue-row">
                    <span>Fila de atendimento</span>
                    <strong>4 pessoas</strong>
                  </div>
                  <div className="preview-bar">
                    <span />
                  </div>
                  <small>cerca de 22 min de espera</small>
                </div>
              </div>

              <div className="floating-card care-card">
                <span className="care-pulse" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <div className="card-text">
                  <strong>Cuidado conectado</strong>
                  <small>Saquarema · RJ</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip reveal" aria-label="Sobre a plataforma">
        <span className="trust-mark" aria-hidden="true">
          +
        </span>
        <p>
          Uma forma mais prática de se conectar aos serviços públicos de saúde
          do município.
        </p>
        <a href="#sobre" onClick={(e) => scrollToSection(e, "sobre")}>
          Saiba mais <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section id="sobre" className="about-section">
        <div className="about-heading reveal">
          <span className="section-label">CUIDADO MAIS ACESSÍVEL</span>
          <h2>
            Saúde pública,
            <br />
            com você em cada etapa.
          </h2>
        </div>
        <div className="about-copy reveal" style={{ transitionDelay: "120ms" }}>
          <p>
            O SaquaCare aproxima você dos serviços de saúde de Saquarema, com
            informações organizadas para facilitar o acesso e o acompanhamento
            da sua jornada.
          </p>
          <p>
            Menos tempo procurando. Mais praticidade para manter o cuidado com
            a saúde no dia a dia.
          </p>
          <ul className="about-points">
            {aboutPoints.map((point) => (
              <li key={point}>
                <span aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicos" className="services-section reveal">
        <div className="section-heading">
          <div>
            <span className="section-label">TUDO EM UM SÓ LUGAR</span>
            <h2>Serviços para cuidar melhor</h2>
          </div>
          <p>
            Recursos pensados para deixar sua experiência com a saúde pública
            mais simples e organizada.
          </p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <article
              className="service-card reveal"
              key={service.title}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      <section id="feedback" className="feedback-section reveal">
        <div className="feedback-heading">
          <span className="section-label">SUA OPINIÃO AJUDA A EVOLUIR</span>
          <h2>Compartilhe seu feedback</h2>
          <p>
            Conte o que achou do projeto e quais melhorias ou adaptações
            gostaria de ver.
          </p>
        </div>
        <form className="feedback-form" onSubmit={enviarFeedback}>
          <fieldset className="feedback-rating">
            <legend>Avalie o projeto de 1 a 5 estrelas</legend>
            <div className="feedback-rating-options">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <label
                  className="feedback-rating-option"
                  key={estrela}
                  title={`${estrela} ${estrela === 1 ? "estrela" : "estrelas"}`}
                >
                  <input
                    type="radio"
                    name="feedback-avaliacao"
                    value={estrela}
                    checked={feedbackAvaliacao === estrela}
                    onChange={() => setFeedbackAvaliacao(estrela)}
                    required={estrela === 1}
                  />
                  <span
                    className={`feedback-star${feedbackAvaliacao >= estrela ? " is-selected" : ""}`}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                  <span className="feedback-rating-sr">
                    {estrela} {estrela === 1 ? "estrela" : "estrelas"}
                  </span>
                </label>
              ))}
            </div>
            <span className="feedback-rating-help" aria-live="polite">
              {feedbackAvaliacao
                ? `Sua avaliação: ${feedbackAvaliacao} de 5 estrelas`
                : "Selecione uma avaliação"}
            </span>
          </fieldset>

          <label htmlFor="feedback-nome">Seu nome (opcional)</label>
          <input
            id="feedback-nome"
            type="text"
            value={feedbackNome}
            onChange={(event) => setFeedbackNome(event.target.value)}
            placeholder="Como podemos chamar você?"
            maxLength={100}
            autoComplete="name"
          />

          <label htmlFor="feedback-categoria">Sobre o que é seu feedback?</label>
          <select
            id="feedback-categoria"
            value={feedbackCategoria}
            onChange={(event) => setFeedbackCategoria(event.target.value)}
          >
            <option>Sugestão de melhoria</option>
            <option>Experiência de uso</option>
            <option>Acessibilidade</option>
            <option>Nova funcionalidade</option>
            <option>Outro comentário</option>
          </select>

          <label htmlFor="feedback-mensagem">Sua mensagem</label>
          <textarea
            id="feedback-mensagem"
            value={feedbackMensagem}
            onChange={(event) => setFeedbackMensagem(event.target.value)}
            placeholder="O que funcionou bem? O que poderia ser diferente?"
            rows={5}
            maxLength={2000}
            required
          />
          <div className="feedback-honeypot" aria-hidden="true">
            <label htmlFor="feedback-site">Deixe este campo vazio</label>
            <input
              ref={feedbackHoneypotRef}
              id="feedback-site"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <p className="feedback-privacy">
            Sua avaliação será encaminhada por e-mail, sem cadastro ou banco de
            dados. O nome é opcional; não inclua informações de saúde ou outros
            dados pessoais na mensagem.
          </p>
          <button type="submit" className="feedback-submit" disabled={feedbackEnviando}>
            {feedbackEnviando ? "Enviando..." : "Enviar feedback"}{" "}
            <span aria-hidden="true">→</span>
          </button>
          {feedbackStatus && (
            <p className="feedback-status" role="status">
              {feedbackStatus}{" "}
              <a href="mailto:saquacare2026@gmail.com">
                saquacare2026@gmail.com
              </a>
            </p>
          )}
        </form>
      </section>

      <section id="contato" className="contact-section reveal">
        <div className="contact-mark" aria-hidden="true">
          +
        </div>
        <div className="contact-text">
          <span className="section-label">ESTAMOS AQUI PARA AJUDAR</span>
          <h2>Conte com o SaquaCare.</h2>
          <p>
            Tem dúvidas sobre a plataforma? Entre em contato com nossa equipe.
          </p>
        </div>
        <a
          className="contact-link"
          href="https://www.instagram.com/saquacare_"
          target="_blank"
          rel="noopener noreferrer"
        >
          @saquacare_ <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-copy">
            <p>
              © {new Date().getFullYear()} SaquaCare. Todos os direitos
              reservados aos alunos da equipe SaquaCare.
            </p>
            <p>
              Projeto acadêmico de extensão, desenvolvido para fins
              educacionais e de impacto social.
            </p>
          </div>
          <span>Saquarema · RJ</span>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
