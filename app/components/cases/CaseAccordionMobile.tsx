"use client";

import { BriefcaseBusiness, ChevronDown, CircleDot, ClipboardList, Layers3, Lightbulb, ShieldQuestion, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CaseStudy } from "../../types/case";
import CaseImpact from "./CaseImpact";
import CaseProcess from "./CaseProcess";
import CaseQuote from "./CaseQuote";
import CaseStack from "./CaseStack";

type CaseAccordionMobileProps = {
  item: CaseStudy;
};

type SectionId = "context" | "problem" | "role" | "process" | "impact" | "stack" | "learnings";

export default function CaseAccordionMobile({ item }: CaseAccordionMobileProps) {
  const [openSections, setOpenSections] = useState<SectionId[]>(["context"]);

  const toggle = (id: SectionId) => {
    setOpenSections((current) => (current.includes(id) ? current.filter((section) => section !== id) : [...current, id]));
  };

  const sections: Array<{
    id: SectionId;
    title: string;
    icon: typeof ClipboardList;
    content: React.ReactNode;
  }> = [
    {
      id: "context",
      title: "Contexto",
      icon: ClipboardList,
      content: <p className="m-0">{item.context}</p>,
    },
    {
      id: "problem",
      title: "Problema",
      icon: ShieldQuestion,
      content: <p className="m-0">{item.problem}</p>,
    },
    {
      id: "role",
      title: "Minha atuacao",
      icon: BriefcaseBusiness,
      content: (
        <div>
          <p className="m-0">{item.myRole}</p>
          <ul className="m-0 mt-4 grid list-none gap-2 p-0">
            {item.myRoleBullets.map((bullet) => (
              <li className="flex gap-2" key={bullet}>
                <CircleDot className="mt-1 flex-none text-ink" size={15} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "process",
      title: "Processo",
      icon: Layers3,
      content: <CaseProcess steps={item.process} framed={false} showTitle={false} />,
    },
    {
      id: "impact",
      title: "Impacto",
      icon: Sparkles,
      content: <CaseImpact items={item.impact} framed={false} showTitle={false} />,
    },
    {
      id: "stack",
      title: "Stack & ferramentas",
      icon: Layers3,
      content: <CaseStack tools={item.tools} framed={false} showTitle={false} />,
    },
    {
      id: "learnings",
      title: "Aprendizados",
      icon: Lightbulb,
      content: <p className="m-0">{item.learnings}</p>,
    },
  ];

  return (
    <div className="grid gap-4 md:hidden">
      {sections.map((section) => {
        const isOpen = openSections.includes(section.id);
        const Icon = section.icon;

        return (
          <article className="card-border overflow-hidden rounded-lg" key={section.id}>
            <button
              aria-controls={`case-section-${section.id}`}
              aria-expanded={isOpen}
              className="accordion-trigger flex w-full items-center justify-between gap-4 border-0 bg-white p-4 text-left outline-none focus:outline-none focus-visible:outline-none"
              onClick={() => toggle(section.id)}
              type="button"
            >
              <span className="inline-flex min-w-0 items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-dark">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
                  <Icon size={18} strokeWidth={2.1} />
                </span>
                {section.title}
              </span>
              <ChevronDown className={isOpen ? "rotate-180 text-ink transition" : "text-muted transition"} size={17} />
            </button>
            {isOpen ? (
              <div id={`case-section-${section.id}`} className="border-t border-line p-5 pt-4 text-sm leading-6 text-muted">
                {section.content}
              </div>
            ) : null}
          </article>
        );
      })}
      <CaseQuote quote={item.quote} />
    </div>
  );
}
