import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Check,
  Code2,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  PackageCheck,
  PenTool,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AgentRSection } from "./components/AgentRSection";

const navItems = ["Inicio", "Sobre", "Cases", "Experiencia", "Stack", "Contato"];

const skills = [
  { label: "TPM", icon: BarChart3 },
  { label: "Product Design", icon: PenTool },
  { label: "Front-end Dev", icon: Code2 },
  { label: "AI & Automacao", icon: Sparkles },
];

const expertise = [
  {
    title: "Product Management",
    icon: BriefcaseBusiness,
    items: ["Roadmaps", "Discovery", "OKRs", "Metricas", "Stakeholders"],
  },
  {
    title: "Product Design",
    icon: Rocket,
    items: ["UX Research", "Wireframes", "Prototipacao", "Design Systems", "Testes de Usabilidade"],
  },
  {
    title: "Engineering",
    icon: Code2,
    items: ["React", "Next.js", "TypeScript", "APIs", "AI Integrations"],
  },
];

const cases = [
  {
    title: "Meliuz",
    badge: "m",
    badgeClass: "bg-pink-500 text-white",
    image: "/images/case-meliuz.png",
    description: "Melhoria da experiencia do usuario e otimizacao do funil de cashback.",
    stats: ["+18% retencao", "+12% conversao"],
    tags: ["Produto", "UX/UI", "Metricas"],
  },
  {
    title: "AGU Buscador Inteligente",
    badge: "AGU",
    badgeClass: "bg-slate-700 text-white",
    image: "/images/case-agu.png",
    description: "Plataforma para consulta e sumarizacao de documentos juridicos.",
    stats: ["70% menos tempo de busca", "Autenticacao e controle de acesso", "Upload e processamento inteligente"],
    tags: ["Produto", "Desenvolvimento", "IA"],
  },
  {
    title: "HouzBuddy",
    badge: "HB",
    badgeClass: "bg-dark text-white",
    image: "/images/case-houzz.png",
    description: "MVP e validacao de produto no mercado imobiliario dos Estados Unidos.",
    stats: ["Prototipo validado", "Arquitetura inicial escalavel", "Experiencia internacional"],
    tags: ["Design", "MVP", "Front-end"],
  },
];

const timeline = [
  ["2025", "TPM / Product", "Foco em estrategia, metricas e crescimento"],
  ["2024", "Product Designer", "Design de produto e pesquisa de usuarios"],
  ["2023", "Front-end Engineer", "Desenvolvimento de interfaces e APIs"],
  ["2022", "UI Designer", "Criacao de interfaces e design systems"],
];

const process = [
  { title: "Descoberta", text: "Entendo o problema e o contexto", icon: Search },
  { title: "Definicao", text: "Alinho objetivos, estrategia e metricas", icon: Target },
  { title: "Entrega", text: "Desenvolvo e lanco solucoes", icon: Code2 },
  { title: "Medicao", text: "Acompanho dados e resultados", icon: BarChart3 },
  { title: "Otimizacao", text: "Aprendo, itero e gero mais impacto", icon: RefreshCw },
];

const highlights: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "5+ anos", text: "em tecnologia", icon: Boxes },
  { title: "20+ projetos", text: "entregues", icon: PackageCheck },
  { title: "UX/UI + Engenharia + Produto", text: "visao completa de ponta a ponta", icon: Code2 },
  { title: "Sao Paulo, Brasil", text: "disponivel para novos desafios", icon: MapPin },
];

const stack: Array<{ name: string; icon: LucideIcon }> = [
  { name: "Next.js", icon: Boxes },
  { name: "React", icon: Code2 },
  { name: "TypeScript", icon: PackageCheck },
  { name: "Figma", icon: PenTool },
  { name: "Jira", icon: Compass },
  { name: "Firebase", icon: Sparkles },
  { name: "PostgreSQL", icon: Boxes },
  { name: "OpenAI", icon: Sparkles },
  { name: "n8n", icon: RefreshCw },
  { name: "GA4", icon: BarChart3 },
  { name: "Vercel", icon: Rocket },
  { name: "Notion", icon: PackageCheck },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-[1096px] items-center justify-between border-b border-line px-5 py-6 md:px-8">
        <a href="#inicio" className="text-[32px] font-black leading-none tracking-normal">
          VS<span className="text-violet">.</span>
        </a>
        <nav className="hidden items-center gap-8 text-[13px] font-semibold md:flex">
          {navItems.map((item, index) => (
            <a
              href={`#${item.toLowerCase()}`}
              className={index === 0 ? "border-b-2 border-ink pb-2" : "pb-2 text-dark/80 hover:text-ink"}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section id="inicio" className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-12 md:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_520px]">
          <div className="pb-9">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Ola, eu sou</p>
            <h1 className="max-w-3xl text-[56px] font-black leading-[0.95] tracking-normal md:text-[72px]">
              Victor Sizino<span className="text-violet">.</span>
            </h1>
            <p className="mt-5 text-[24px] leading-8 text-muted">Technical Product Manager</p>
            <p className="mt-5 max-w-[440px] text-base leading-7 text-muted">
              Unindo estrategia, design e tecnologia para construir produtos digitais que geram impacto real nos
              negocios e na vida das pessoas.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a className="inline-flex h-11 min-w-[132px] items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-bold text-white shadow-md" href="#cases">
                Ver cases <ArrowRight size={17} />
              </a>
              <a
                className="inline-flex h-11 min-w-[154px] items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm"
                href="https://www.linkedin.com/"
              >
                Ver LinkedIn <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <div className="relative min-h-[430px] overflow-hidden">
            <div className="dot-grid absolute inset-x-0 top-0 h-[360px]" />
            <Image
              src="/images/victor-hero-v2.png"
              alt="Victor Sizino"
              width={520}
              height={505}
              priority
              className="relative z-10 ml-auto h-[430px] w-full max-w-[520px] object-contain object-top"
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          {skills.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex h-9 items-center gap-3 rounded-lg border border-line bg-white px-4 text-xs font-bold shadow-sm"
            >
              <Icon className="text-violet" size={16} strokeWidth={2} />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section id="sobre" className="mx-auto max-w-[1096px] px-5 py-9 md:px-8">
        <div className="grid gap-8 md:grid-cols-[156px_1fr_344px]">
          <Image src="/images/victor-card-v2.png" alt="Victor Sizino" width={156} height={180} className="h-[180px] rounded-lg object-cover shadow-sm" />
          <div>
            <p className="section-label">Sobre mim</p>
            <h2 className="about-title">
              Transformando problemas complexos em produtos escalaveis.
            </h2>
            <p className="about-copy">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat, augue nec fermentum dapibus,
              massa arcu consequat sapien, vel vulputate quam mauris et lorem. Euismod pretium eget id purus sed
              faucibus. Apaixonado por produtos, dados e tecnologia.
            </p>
          </div>
          <div className="about-highlights">
            {highlights.map(({ title, text, icon: Icon }) => (
              <div className="about-highlight" key={title}>
                <span className="icon-box">
                  <Icon size={17} />
                </span>
                <p>
                  <strong>{title}</strong>
                  <br />
                  <span className="text-muted">{text}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="section-label mt-10">Minha expertise</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {expertise.map(({ title, icon: Icon, items }) => (
            <article className="card-border min-h-[190px] p-6" key={title}>
              <div className="flex items-center gap-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-canvas">
                  <Icon className={title === "Engineering" ? "text-violet" : "text-ink"} size={18} />
                </span>
                <h3 className="text-base font-bold">{title}</h3>
              </div>
              <ul className="mt-5 space-y-2 pl-[52px] text-sm leading-5">
                {items.map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <span className="mt-[7px] size-1 rounded-full bg-ink" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="cases" className="mx-auto max-w-[1096px] px-5 py-3 md:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="section-label">Cases de impacto</p>
          <a href="#contato" className="text-sm font-bold text-violet">
            Ver todos os cases <ArrowRight className="inline" size={15} />
          </a>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {cases.map((item) => (
            <article className="case-card" key={item.title}>
              <Image src={item.image} alt="" fill className="case-card-image" />
              <div className="case-card-scrim" />
              <div className="case-card-content">
                <span className={`case-badge ${item.badgeClass}`}>
                  {item.badge}
                </span>
                <div className="case-copy">
                  <h3 className="case-title">{item.title}</h3>
                  <p className="case-description">{item.description}</p>
                </div>
                <div className="case-results">
                  <span className="case-results-label">Resultados</span>
                  {item.stats.map((stat) => (
                    <span className="case-result-item" key={stat}>
                      <Check size={13} strokeWidth={2.4} />
                      {stat}
                    </span>
                  ))}
                </div>
                <div className="case-tags">
                  {item.tags.map((tag) => (
                    <span className="case-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experiencia" className="mx-auto grid max-w-[1096px] gap-12 px-5 py-12 md:px-8 lg:grid-cols-[330px_1fr]">
        <div>
          <p className="section-label">Trajetoria</p>
          <div className="timeline-list">
            {timeline.map(([year, role, text]) => (
              <div className="timeline-item" key={year}>
                <span className="timeline-year">{year}</span>
                <span className="timeline-dot" />
                <p className="timeline-copy">
                  <strong className="timeline-role">{role}</strong>
                  <br />
                  <span className="timeline-description">{text}</span>
                </p>
              </div>
            ))}
          </div>
          <a className="timeline-link" href="#contato">
            Ver toda a trajetoria <ArrowRight size={15} />
          </a>
        </div>
        <div>
          <p className="section-label">Como eu trabalho</p>
          <div className="work-grid">
            {process.map(({ title, text, icon: Icon }) => (
              <article className="work-card" key={title}>
                <Icon className="work-card-icon" size={32} strokeWidth={2} />
                <h3 className="work-card-title">{title}</h3>
                <p className="work-card-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AgentRSection />

      <section id="stack" className="mx-auto grid max-w-[1096px] gap-10 border-y border-line px-5 py-9 md:px-8 lg:grid-cols-2">
        <div>
          <p className="section-label">Stack & ferramentas</p>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {stack.map(({ name, icon: Icon }) => (
              <div className="card-border grid h-[70px] place-items-center text-center text-[11px] font-semibold" key={name}>
                <Icon className="text-ink" size={20} />
                {name}
              </div>
            ))}
          </div>
        </div>
        <div id="contato" className="contact-panel">
          <div>
            <p className="section-label">Vamos conversar?</p>
            <h2 className="contact-title">
              Interessado em discutir produto,
              <br />
              IA ou tecnologia?
            </h2>
            <p className="contact-copy">Vamos criar produtos incriveis juntos.</p>
            <a className="contact-button" href="mailto:contato@victorsizino.com">
              Agendar conversa <ArrowRight size={17} />
            </a>
          </div>
          <div className="contact-illustration" aria-hidden="true">
            <div className="contact-bubble contact-bubble-main">
              <span />
              <span />
              <span />
              <Send className="contact-plane" size={58} strokeWidth={1.7} />
            </div>
            <div className="contact-bubble contact-bubble-small">
              <i />
              <i />
              <i />
            </div>
            <div className="contact-trail" />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1096px] flex-wrap items-center justify-between gap-6 px-5 py-7 md:px-8">
        <p className="text-[30px] font-black leading-none">
          VS<span className="text-violet">.</span>
        </p>
        <p className="text-xs text-muted">2024 Victor Sizino. Todos os direitos reservados.</p>
        <div className="footer-socials">
          <a className="footer-linkedin" href="https://www.linkedin.com/" aria-label="LinkedIn">
            in
          </a>
          <a href="mailto:contato@victorsizino.com" aria-label="Email">
            <Mail size={19} />
          </a>
        </div>
      </footer>
    </main>
  );
}
