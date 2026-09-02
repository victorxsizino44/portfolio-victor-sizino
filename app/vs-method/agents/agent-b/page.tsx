import type { Metadata } from "next";
import {
  ArrowRight,
  Blocks,
  BookOpenCheck,
  BrainCircuit,
  ClipboardCheck,
  FileCheck2,
  GitBranch,
  ListChecks,
  MessageSquareText,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";
import AgentBExperience from "../../../components/agent-b/AgentBExperience";
import Footer from "../../../components/home/Footer";
import Header from "../../../components/home/Header";

const canonicalUrl = "https://victor-sizino.vercel.app/vs-method/agents/agent-b";

export const metadata: Metadata = {
  title: "Agent B™ — Discovery & Briefing Architecture Prototype | Victor Sizino",
  description:
    "Conheça o Agent B™, protótipo estático de produto e arquitetura para Discovery e Briefing governados no VS Method™.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl,
    title: "Agent B™ — Discovery & Briefing Architecture Prototype | Victor Sizino",
    description: "Protótipo estático de produto e arquitetura para Discovery e Briefing governados.",
    siteName: "Victor Sizino",
  },
  twitter: {
    card: "summary",
    title: "Agent B™ — Discovery & Briefing Architecture Prototype | Victor Sizino",
    description: "Protótipo estático de Discovery estruturado, validação e governança humana.",
  },
};

const workflow = [
  { title: "Discovery", copy: "Compreende contexto, intenção, problema e objetivo com perguntas progressivas.", icon: Search },
  { title: "Information Structuring", copy: "Organiza respostas em Domains e Information Fields rastreáveis.", icon: ListChecks },
  { title: "Validation", copy: "Distingue facts, assumptions, gaps, evidências e contradições.", icon: ClipboardCheck },
  { title: "Governed Briefing", copy: "Calcula readiness e prepara um output estruturado para revisão humana.", icon: FileCheck2 },
];

const architecture = [
  { title: "Discovery & Briefing", copy: "Lifecycle, boundaries e autoridade do agente.", icon: MessageSquareText },
  { title: "Information Model", copy: "Domains, fields, validação, confiança e dependencies.", icon: Blocks },
  { title: "Intelligence Orchestration", copy: "Modelo conceitual para conversa, prompts e contexto governados.", icon: BrainCircuit },
  { title: "Implementation Planning", copy: "Contratos e handoffs propostos para uma etapa futura.", icon: GitBranch },
];

const briefingFields = [
  "Context",
  "Objectives",
  "Problem",
  "Audience",
  "Requirements",
  "Constraints",
  "Dependencies",
  "Risks",
  "Assumptions",
  "Open Questions",
  "Decisions",
  "Recommended Next Steps",
];

export default function AgentBPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <AgentBExperience />

        <section aria-labelledby="how-agent-b-works" className="mx-auto max-w-[1096px] px-5 py-12 md:px-8 md:py-16">
          <div className="max-w-2xl">
            <p className="section-label text-violet">Governed workflow</p>
            <h2 id="how-agent-b-works" className="mt-4 text-[30px] font-black leading-tight tracking-[-0.025em] sm:text-[36px]">Como o Agent B™ trabalha</h2>
            <p className="mt-4 text-sm leading-6 text-muted">Uma progressão contínua transforma conversa incompleta em conhecimento verificável — sem antecipar o output.</p>
          </div>
          <ol className="mt-9 grid gap-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:grid-cols-4">
            {workflow.map(({ title, copy, icon: Icon }, index) => (
              <li className="relative min-h-[210px] border-b border-line p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0" key={title}>
                <div className="flex items-center justify-between">
                  <div className="icon-box"><Icon aria-hidden="true" className="text-violet" size={18} /></div>
                  <span className="text-[10px] font-black tracking-[0.16em] text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-base font-black text-ink">{title}</h3>
                <p className="mt-3 text-xs leading-5 text-muted">{copy}</p>
                {index < workflow.length - 1 ? <ArrowRight aria-hidden="true" className="absolute -bottom-3 right-6 z-10 rounded-full border border-line bg-white p-1 text-violet md:-right-3 md:bottom-auto md:top-7" size={24} /> : null}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="agent-b-architecture" className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-[1096px] gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="section-label text-violet">Architecture & governance</p>
              <h2 id="agent-b-architecture" className="mt-4 text-[30px] font-black leading-tight tracking-[-0.025em] sm:text-[36px]">Protótipo estático de produto e arquitetura</h2>
              <p className="mt-5 text-sm leading-6 text-muted">Quatro Essential Artifacts propõem responsabilidades separadas e um caminho futuro entre arquitetura, inteligência e operação.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {architecture.map(({ title, copy, icon: Icon }) => (
                <article className="bg-white p-6" key={title}>
                  <Icon aria-hidden="true" className="text-violet" size={21} />
                  <h3 className="mt-5 text-sm font-black text-ink">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="governed-briefing" className="mx-auto max-w-[1096px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid overflow-hidden rounded-[24px] border border-line bg-white shadow-md lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-ink p-7 text-white sm:p-9">
              <BookOpenCheck aria-hidden="true" className="text-violet" size={30} />
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.18em] text-white/60">Expected output</p>
              <h2 id="governed-briefing" className="mt-3 text-[32px] font-black tracking-[-0.03em]">Governed Briefing</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/72">Um documento estruturado, rastreável e preparado para handoff — com lacunas e incertezas preservadas em vez de ocultadas.</p>
            </div>
            <div className="p-7 sm:p-9">
              <p className="text-sm font-extrabold text-dark">O Briefing pode incluir</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {briefingFields.map((field) => (
                  <li className="flex items-center gap-3 text-xs font-bold text-muted" key={field}>
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-violet" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside aria-label="Governança humana" className="mx-auto max-w-[1096px] px-5 pb-14 md:px-8 md:pb-20">
          <div className="flex items-start gap-4 rounded-2xl border border-violet/25 bg-[#f7f7ff] p-5 sm:p-6">
            <Scale aria-hidden="true" className="mt-0.5 shrink-0 text-violet" size={22} />
            <div>
              <h2 className="text-sm font-black text-ink">Human Governance</h2>
              <p className="mt-2 text-sm leading-6 text-muted">O Agent B™ organiza, valida e estrutura informações para apoiar decisões. A aprovação final do Briefing permanece humana.</p>
            </div>
            <ShieldCheck aria-hidden="true" className="ml-auto hidden shrink-0 text-violet/50 sm:block" size={32} />
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
