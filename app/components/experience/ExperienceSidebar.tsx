"use client";

import Image from "next/image";
import { BriefcaseBusiness, ChevronDown, ExternalLink, Globe2, MapPin, Send } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  segmentIcons,
  sidebarSections,
  sidebarSummary,
  tools,
  type SidebarSection,
} from "../../data/experience";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-lg bg-violet/10 px-3 text-xs font-extrabold leading-none text-violet">
      {children}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card-border p-5">
      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">{title}</h2>
      {children}
    </section>
  );
}

function MobileDisclosure({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: SidebarSection["icon"];
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const id = `sidebar-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="card-border overflow-hidden rounded-lg">
      <button
        aria-controls={id}
        aria-expanded={isOpen}
        className="accordion-trigger flex w-full items-center justify-between gap-4 border-0 bg-white p-4 text-left outline-none focus:outline-none focus-visible:outline-none"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-slate-700">
          <span className="grid size-9 place-items-center rounded-lg bg-violet/10 text-violet">
            <Icon size={18} />
          </span>
          {title}
        </span>
        <ChevronDown className={isOpen ? "rotate-180 transition" : "transition"} size={17} />
      </button>
      {isOpen ? (
        <div className="border-t border-line p-5 pt-4" id={id}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function SummaryPanel() {
  return (
    <>
      <p className="text-xs leading-6 text-muted">{sidebarSummary.text}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {sidebarSummary.kpis.map((item) => (
          <div className="card-border p-3 text-xs font-extrabold leading-5 text-violet" key={item}>
            {item}
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsPanel({ section }: { section: SidebarSection }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {section.items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

function SegmentsPanel({ section }: { section: SidebarSection }) {
  return (
    <div className="mt-4 grid gap-4">
      {section.items.map((item) => {
        const Icon = segmentIcons[item as keyof typeof segmentIcons] ?? Globe2;
        return (
          <p className="m-0 flex items-center gap-3 text-sm font-semibold text-slate-700" key={item}>
            <span className="grid size-8 place-items-center rounded-lg bg-violet/10 text-violet">
              <Icon size={16} />
            </span>
            {item}
          </p>
        );
      })}
    </div>
  );
}

function ToolsPanel() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {tools.map(({ name, icon: Icon }) => (
        <p className="m-0 flex items-center gap-2 text-xs font-bold text-slate-700" key={name}>
          <Icon className="text-violet" size={16} />
          {name}
        </p>
      ))}
    </div>
  );
}

function PlacesPanel() {
  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-canvas p-4">
      <div className="relative h-28" aria-label="Mapa com atuação no Brasil, Irlanda e EUA">
        <Image
          src="/images/map.png"
          alt="Mapa mundial destacando Brasil, Estados Unidos e Irlanda"
          fill
          sizes="280px"
          className="object-contain"
        />
      </div>
      <div className="grid gap-4 text-xs leading-5 sm:grid-cols-3">
        <p className="m-0 text-muted">
          <a
            className="block text-sm font-black text-violet outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2"
            href="#minha-trajetoria"
          >
            Brasil
          </a>
          São Paulo, Brasília, Porto Seguro
        </p>
        <p className="m-0 text-muted">
          <a
            className="block text-sm font-black text-violet outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2"
            href="#webbix"
          >
            Irlanda
          </a>
          Dublin
        </p>
        <p className="m-0 text-muted">
          <a
            className="block text-sm font-black text-violet outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2"
            href="#hirevue"
          >
            EUA
          </a>
          Chicago
        </p>
      </div>
    </div>
  );
}

function SideCTA() {
  return (
    <section className="card-border p-5 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-violet/10 text-violet">
        <Send size={22} />
      </span>
      <h2 className="mt-4 text-base font-black leading-6 text-ink">Vamos construir o próximo case de sucesso juntos?</h2>
      <p className="mt-3 text-xs leading-5 text-muted">
        Estou sempre aberto a novos desafios e oportunidades que geram impacto real.
      </p>
      <a
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink px-5 text-sm font-black text-white shadow-md"
        href="/cases"
      >
        Ver meus cases
      </a>
      <a
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-ink"
        href="mailto:contato@victorsizino.com"
      >
        Falar comigo <ExternalLink size={15} />
      </a>
    </section>
  );
}

type ExperienceSidebarProps = {
  variant?: "all" | "desktop" | "mobile";
};

export default function ExperienceSidebar({ variant = "all" }: ExperienceSidebarProps) {
  const [competencies, segments] = sidebarSections;

  return (
    <>
      {variant !== "mobile" ? (
      <aside className={variant === "desktop" ? "hidden lg:block" : "hidden lg:block"}>
        <div className="sticky top-6 grid gap-5">
          <Panel title="Sobre minha experiência">
            <div className="mt-4">
              <SummaryPanel />
            </div>
          </Panel>
          <Panel title={competencies.title}>
            <SkillsPanel section={competencies} />
          </Panel>
          <Panel title={segments.title}>
            <SegmentsPanel section={segments} />
          </Panel>
          <Panel title="Ferramentas e tecnologias">
            <ToolsPanel />
          </Panel>
          <Panel title="Onde atuei">
            <PlacesPanel />
          </Panel>
          <SideCTA />
        </div>
      </aside>
      ) : null}

      {variant !== "desktop" ? (
      <div className={variant === "mobile" ? "grid gap-4" : "grid gap-4 lg:hidden"}>
        <MobileDisclosure title="Sobre minha experiência" icon={BriefcaseBusiness}>
          <SummaryPanel />
        </MobileDisclosure>
        <MobileDisclosure title={competencies.title} icon={competencies.icon}>
          <SkillsPanel section={competencies} />
        </MobileDisclosure>
        <MobileDisclosure title={segments.title} icon={segments.icon}>
          <SegmentsPanel section={segments} />
        </MobileDisclosure>
        <MobileDisclosure title="Ferramentas e tecnologias" icon={Globe2}>
          <ToolsPanel />
        </MobileDisclosure>
        <MobileDisclosure title="Onde atuei" icon={MapPin}>
          <PlacesPanel />
        </MobileDisclosure>
      </div>
      ) : null}
    </>
  );
}
