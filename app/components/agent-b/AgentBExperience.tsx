"use client";

import {
  ArrowRight,
  Boxes,
  FileCheck2,
  FileInput,
  Lightbulb,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";

const quickActions = [
  {
    label: "Iniciar um novo Discovery",
    prompt: "Quero iniciar um novo Discovery. Minha iniciativa é...",
    icon: SearchCheck,
  },
  {
    label: "Estruturar uma ideia de produto",
    prompt: "Quero estruturar uma ideia de produto. O contexto inicial é...",
    icon: Lightbulb,
  },
  {
    label: "Transformar contexto em Briefing",
    prompt: "Quero transformar este contexto em um Briefing governado: ",
    icon: FileInput,
  },
];

const capabilities = [
  { label: "Contexto e objetivos", icon: MessageSquareText },
  { label: "Facts, assumptions e gaps", icon: SearchCheck },
  { label: "Constraints e dependencies", icon: Boxes },
  { label: "Readiness e governança humana", icon: ShieldCheck },
];

export default function AgentBExperience() {
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const selectAction = (label: string, prompt: string) => {
    setDraft(prompt);
    setAnnouncement(`Ação selecionada: ${label}. Complete o contexto no campo de mensagem.`);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };

  return (
    <section aria-labelledby="agent-b-title" className="mx-auto max-w-[1096px] px-5 pb-12 pt-8 md:px-8 md:pb-16 md:pt-12">
      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-lg">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:p-10">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.18em] text-violet">
              <div aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-violet text-lg font-black tracking-normal text-white shadow-md">
                B.
              </div>
              <span>VS Method™ · Discovery Agent</span>
            </div>

            <h1 id="agent-b-title" className="mt-7 max-w-[520px] text-[34px] font-black leading-[1.08] tracking-[-0.035em] text-ink sm:text-[44px] lg:text-[48px]">
              Explore uma arquitetura de Briefing governado com o <span className="text-violet">Agent B™</span>
            </h1>

            <div className="mt-6 max-w-[560px] space-y-4 text-[14px] leading-6 text-muted sm:text-[15px]">
              <p>
                O Agent B™ é um protótipo estático de produto e arquitetura para Discovery e Briefing no ecossistema VS Method™. A interface demonstra como uma conversa estruturada poderia organizar contexto, objetivos, problemas, público, requisitos, constraints, dependencies e decisões necessárias.
              </p>
              <p>
                O modelo conceitual prevê a identificação de gaps, validação de informações e organização de evidências para um futuro <strong className="font-extrabold text-dark">Governed Briefing</strong>.
              </p>
            </div>

            <div aria-label="Capacidades governadas" className="mt-7 grid gap-2 sm:grid-cols-2">
              {capabilities.map(({ label, icon: Icon }) => (
                <div className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-canvas px-3 text-xs font-bold text-dark" key={label}>
                  <Icon aria-hidden="true" className="shrink-0 text-violet" size={17} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <p className="mt-7 text-sm font-semibold leading-6 text-dark">
              Explore a interface estática para compreender como o Discovery poderá ser organizado. Nenhuma mensagem é processada nesta versão.
            </p>

            <div aria-label="Ações sugeridas" className="mt-4 grid gap-2">
              {quickActions.map(({ label, prompt, icon: Icon }) => (
                <button
                  className="standard-hover flex min-h-12 w-full items-center gap-3 rounded-lg border border-line bg-white px-4 text-left text-xs font-extrabold text-dark"
                  key={label}
                  onClick={() => selectAction(label, prompt)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="shrink-0 text-violet" size={17} />
                  <span className="flex-1">{label}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              ))}
              <button
                aria-describedby="continuation-unavailable"
                className="flex min-h-12 w-full cursor-not-allowed items-center gap-3 rounded-lg border border-line bg-canvas px-4 text-left text-xs font-extrabold text-muted opacity-70"
                disabled
                type="button"
              >
                <RefreshCw aria-hidden="true" className="shrink-0" size={17} />
                <span>Continuar um Discovery existente</span>
              </button>
              <span className="sr-only" id="continuation-unavailable">
                A recuperação de sessões será habilitada quando o Discovery Engine estiver conectado.
              </span>
            </div>
          </div>

          <div className="flex min-h-[590px] min-w-0 flex-col rounded-[22px] border border-line bg-white p-4 shadow-md sm:p-5 lg:min-h-[650px]">
            <header className="flex items-center gap-3 border-b border-line pb-4">
              <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-violet text-sm font-black text-white">
                B.
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-black tracking-[0.08em] text-ink">AGENT B™</strong>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <i aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
                  Discovery Engine pendente
                </span>
              </div>
              <div className="hidden rounded-full border border-line bg-canvas px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted sm:block">
                Session · New
              </div>
            </header>

            <div aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto py-5">
              <div className="max-w-[94%] rounded-2xl rounded-tl-md bg-[#f1f2f8] p-4 text-[13px] leading-5 text-dark">
                <p className="font-extrabold text-ink">Olá, sou o Agent B™.</p>
                <p className="mt-2">
                  Esta interface demonstra um Discovery estruturado antes de qualquer output. O processamento ainda não está disponível.
                </p>
              </div>

              <div className="grid gap-2 rounded-xl border border-line bg-canvas p-4 text-xs text-muted">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-extrabold text-dark">Discovery State</span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-bold">Not started</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-soft" aria-label="Briefing readiness não calculada">
                  <div className="h-full w-0 bg-violet" />
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <span>Active Domain · —</span>
                  <span>Readiness · Not calculated</span>
                </div>
              </div>

              <div className="mt-auto rounded-xl border border-violet/20 bg-[#f7f7ff] p-4 text-xs leading-5 text-dark">
                <div className="flex items-start gap-3">
                  <LockKeyhole aria-hidden="true" className="mt-0.5 shrink-0 text-violet" size={17} />
                  <p>
                    <strong className="font-extrabold">Protótipo estático.</strong> A interface não possui runtime conectado e nenhuma mensagem é enviada nesta versão.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <label className="sr-only" htmlFor="agent-b-message">Descreva sua iniciativa</label>
              <div className="flex min-h-14 items-end gap-2 rounded-2xl border border-line bg-white p-2 pl-4 focus-within:border-violet focus-within:ring-2 focus-within:ring-violet/15">
                <textarea
                  className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent py-2 text-sm leading-5 text-ink outline-none placeholder:text-muted"
                  id="agent-b-message"
                  maxLength={2000}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Descreva sua iniciativa..."
                  ref={composerRef}
                  rows={1}
                  value={draft}
                />
                <button
                  aria-describedby="agent-b-unavailable"
                  aria-label="Enviar mensagem — indisponível até a conexão do Discovery Engine"
                  className="grid size-10 shrink-0 cursor-not-allowed place-items-center rounded-xl bg-violet text-white opacity-55"
                  disabled
                  type="button"
                >
                  <ArrowRight aria-hidden="true" size={19} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] leading-4 text-muted">
                <span id="agent-b-unavailable">Envio indisponível nesta versão</span>
                <span>{draft.length}/2000</span>
              </div>
              <p aria-live="polite" className="sr-only">{announcement}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-line bg-canvas px-5 py-4 text-xs leading-5 text-muted sm:px-8 lg:px-10">
          <FileCheck2 aria-hidden="true" className="mt-0.5 shrink-0 text-violet" size={17} />
          <p>
            <strong className="font-extrabold text-dark">Discovery before Output.</strong> O Agent B™ não inventa respostas, não resolve ambiguidades silenciosamente e não substitui decisões humanas.
          </p>
        </div>
      </div>
    </section>
  );
}
