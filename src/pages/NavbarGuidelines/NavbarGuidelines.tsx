import { useState } from "react";
import "./NavbarGuidelines.css";

type IconName = "home" | "explore" | "activity" | "profile" | "plus" | "close";

const NAV_ITEMS: { id: string; label: string; icon: IconName }[] = [
    { id: "home", label: "Início", icon: "home" },
    { id: "explore", label: "Explorar", icon: "explore" },
    { id: "create", label: "Novo", icon: "plus" },
    { id: "activity", label: "Atividade", icon: "activity" },
    { id: "profile", label: "Perfil", icon: "profile" },
];

function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
    const fill = filled ? "currentColor" : "none";

    switch (name) {
        case "home":
            return (
                <svg viewBox="0 0 24 24" fill={fill} aria-hidden="true">
                    <path d="m3.5 10 8.5-7 8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 19z" />
                    <path d="M9 20.5v-7h6v7" fill={filled ? "var(--navbar-icon-cutout)" : "none"} />
                </svg>
            );
        case "explore":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5z" fill={fill} />
                </svg>
            );
        case "activity":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 12h4l2.2-6 4.1 12 2.3-6H21" />
                </svg>
            );
        case "profile":
            return (
                <svg viewBox="0 0 24 24" fill={fill} aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
                </svg>
            );
        case "plus":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            );
        case "close":
            return (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                </svg>
            );
    }
}

function MetricTag({ children }: { children: string }) {
    return <span className="nav-guide-metric">{children}</span>;
}

export default function NavbarGuidelines() {
    const [activeItem, setActiveItem] = useState("home");
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <main className="nav-guide-page">
            <header className="nav-guide-header">
                <a className="nav-guide-brand" href="/landingpage" aria-label="Voltar ao SaquaCare">
                    <span className="nav-guide-brand-mark">S</span>
                    <span>SAQUACARE <small>DESIGN SYSTEM</small></span>
                </a>
                <span className="nav-guide-version">MOBILE UI · 01.0</span>
            </header>

            <section className="nav-guide-intro">
                <div>
                    <span className="nav-guide-eyebrow"><i /> COMPONENTE 04.2</span>
                    <h1>Bottom navigation</h1>
                    <p>
                        Uma navegação essencial, leve e familiar. Cinco destinos,
                        uma ação em destaque e espaço para o conteúdo respirar.
                    </p>
                </div>
                <div className="nav-guide-intro-badge">
                    <span>↳</span> MOBILE FIRST
                </div>
            </section>

            <section className="nav-guide-board" aria-label="Apresentação do design da navegação inferior">
                <div className="nav-guide-board-heading">
                    <div>
                        <span className="nav-guide-kicker">01 / COMPONENT PREVIEW</span>
                        <h2>Uma navegação feita para o dia a dia.</h2>
                    </div>
                    <span className="nav-guide-status"><i /> INTERACTIVE PREVIEW</span>
                </div>

                <div className="nav-guide-stage">
                    <div className="nav-guide-stage-note nav-guide-stage-note--left">
                        <span className="nav-guide-note-line" />
                        <span>CONTEÚDO<br />EM FOCO</span>
                    </div>
                    <div className="nav-guide-phone-wrap">
                        <span className="nav-guide-measure nav-guide-measure--height">
                            <i /> 72px <i />
                        </span>
                        <div className="nav-guide-phone">
                            <div className="nav-guide-phone-screen">
                                <div className="nav-guide-statusbar">
                                    <span>9:41</span>
                                    <span className="nav-guide-status-icons"><i /><i /><i /></span>
                                </div>
                                <div className="nav-guide-appbar">
                                    <div className="nav-guide-app-avatar">A</div>
                                    <div>
                                        <span>Bom dia, Ana</span>
                                        <strong>Como podemos ajudar?</strong>
                                    </div>
                                    <button type="button" aria-label="Notificações">
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="nav-guide-screen-content">
                                    <div className="nav-guide-welcome-card">
                                        <span>SAÚDE MAIS PERTO</span>
                                        <strong>Seu cuidado,<br />no seu ritmo.</strong>
                                        <i aria-hidden="true">✳</i>
                                    </div>
                                    <div className="nav-guide-content-heading">
                                        <strong>Acesso rápido</strong>
                                        <span>Ver tudo <b>↗</b></span>
                                    </div>
                                    <div className="nav-guide-shortcuts">
                                        <div><i className="nav-guide-shortcut-icon nav-guide-shortcut-icon--mint"><Icon name="activity" /></i><span>Consultas</span></div>
                                        <div><i className="nav-guide-shortcut-icon nav-guide-shortcut-icon--sand"><Icon name="explore" /></i><span>Unidades</span></div>
                                        <div><i className="nav-guide-shortcut-icon nav-guide-shortcut-icon--blue"><Icon name="profile" /></i><span>Vacinas</span></div>
                                    </div>
                                    <div className="nav-guide-next-card">
                                        <span>PRÓXIMO PASSO</span>
                                        <strong>Agende seu atendimento</strong>
                                        <p>Encontre um horário que funciona para você.</p>
                                        <span className="nav-guide-card-arrow">↗</span>
                                    </div>
                                </div>

                                <nav className="nav-guide-bottom-nav" aria-label="Navegação inferior de exemplo">
                                    {NAV_ITEMS.map((item) => item.id === "create" ? (
                                        <div className="nav-guide-nav-cell nav-guide-nav-cell--create" key={item.id}>
                                            <button
                                                type="button"
                                                className="nav-guide-create-button"
                                                aria-label="Criar novo agendamento"
                                                onClick={() => setCreateOpen(true)}
                                            >
                                                <Icon name="plus" />
                                            </button>
                                            <span>{item.label}</span>
                                        </div>
                                    ) : (
                                        <button
                                            className={`nav-guide-nav-cell${activeItem === item.id ? " is-active" : ""}`}
                                            key={item.id}
                                            type="button"
                                            aria-current={activeItem === item.id ? "page" : undefined}
                                            onClick={() => setActiveItem(item.id)}
                                        >
                                            <Icon name={item.icon} filled={activeItem === item.id} />
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                        <span className="nav-guide-measure nav-guide-measure--icon">24px ICON</span>
                    </div>
                    <div className="nav-guide-stage-note nav-guide-stage-note--right">
                        <span>CTA ELEVADO<br />72 × 72px</span>
                        <span className="nav-guide-note-line" />
                    </div>
                    <span className="nav-guide-measure nav-guide-measure--label">12px LABEL</span>
                    <span className="nav-guide-center-tag"><i /> CENTER ALIGNED</span>
                </div>

                <div className="nav-guide-board-footer">
                    <span><i /> ÁREA INTERATIVA</span>
                    <span>TOQUE NOS ITENS PARA VER O ESTADO ATIVO</span>
                </div>
            </section>

            <section className="nav-guide-specs" aria-label="Especificações do componente">
                <article className="nav-guide-spec-card nav-guide-distribution">
                    <div className="nav-guide-spec-heading">
                        <div><span className="nav-guide-kicker">02 / GRID SYSTEM</span><h2>Proporção equilibrada.</h2></div>
                        <MetricTag>5 × 20%</MetricTag>
                    </div>
                    <div className="nav-guide-grid-track" aria-label="Cinco itens, cada um com vinte por cento da largura">
                        {NAV_ITEMS.map((item, index) => (
                            <span key={item.id} className={index === 2 ? "is-center-slot" : ""}>
                                <b>{index + 1}</b><small>20%</small>
                            </span>
                        ))}
                    </div>
                    <div className="nav-guide-grid-labels">
                        <span>5 ÁREAS IGUAIS</span><span>100% DA LARGURA</span>
                    </div>
                </article>

                <article className="nav-guide-spec-card nav-guide-dimensions">
                    <div className="nav-guide-spec-heading">
                        <div><span className="nav-guide-kicker">03 / COMPONENT SPECS</span><h2>Detalhes que fazem sentido.</h2></div>
                    </div>
                    <div className="nav-guide-dimension-list">
                        <div><span className="nav-guide-dimension-icon"><i /></span><span>Altura da barra<small>Alvo confortável para toque</small></span><MetricTag>72px</MetricTag></div>
                        <div><span className="nav-guide-dimension-icon"><i className="is-square" /></span><span>Ícone de navegação<small>Traço leve e leitura rápida</small></span><MetricTag>24px</MetricTag></div>
                        <div><span className="nav-guide-dimension-icon"><i className="is-type" /></span><span>Rótulo<small>Legível sem competir com o ícone</small></span><MetricTag>12px</MetricTag></div>
                        <div><span className="nav-guide-dimension-icon"><i className="is-center" /></span><span>Alinhamento<small>Ícone e texto no mesmo eixo</small></span><MetricTag>Center</MetricTag></div>
                    </div>
                </article>

                <article className="nav-guide-spec-card nav-guide-states">
                    <div className="nav-guide-spec-heading">
                        <div><span className="nav-guide-kicker">04 / COLOR & STATES</span><h2>Calma no contraste.</h2></div>
                    </div>
                    <div className="nav-guide-state-preview">
                        <div className="nav-guide-state-item is-active"><Icon name="home" filled /><span>Ativo</span></div>
                        <div className="nav-guide-state-item"><Icon name="explore" /><span>Inativo</span></div>
                        <div className="nav-guide-state-item nav-guide-state-action"><i><Icon name="plus" /></i><span>Ação</span></div>
                    </div>
                    <div className="nav-guide-palette">
                        <span><i className="swatch swatch--canvas" />Canvas <b>#F4F4F4</b></span>
                        <span><i className="swatch swatch--petrol" />Petróleo <b>#176B67</b></span>
                        <span><i className="swatch swatch--muted" />Inativo <b>#A5AAA8</b></span>
                    </div>
                </article>
            </section>

            <footer className="nav-guide-footer">
                <span>SAQUACARE <b>·</b> MOBILE NAVIGATION</span>
                <span>CALM BY DESIGN <i>✳</i></span>
            </footer>

            {createOpen && (
                <div className="nav-guide-modal-backdrop" onClick={() => setCreateOpen(false)}>
                    <section
                        className="nav-guide-create-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="nav-guide-create-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button type="button" aria-label="Fechar" onClick={() => setCreateOpen(false)}><Icon name="close" /></button>
                        <span className="nav-guide-modal-mark"><Icon name="plus" /></span>
                        <span className="nav-guide-kicker">NOVO POR AQUI?</span>
                        <h2 id="nav-guide-create-title">O que você precisa?</h2>
                        <p>Escolha uma opção para começar a organizar seu cuidado.</p>
                        <button type="button" className="nav-guide-modal-option" onClick={() => setCreateOpen(false)}>
                            Agendar consulta <span>↗</span>
                        </button>
                        <button type="button" className="nav-guide-modal-option" onClick={() => setCreateOpen(false)}>
                            Ver serviços disponíveis <span>↗</span>
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}
