"use client";

import Image from "next/image";
import { ChevronDown, MapPin, Users } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { ProfessionalExperience } from "../../data/experience";

type ExperienceCardProps = {
  experience: ProfessionalExperience;
  defaultOpen?: boolean;
};

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-lg bg-violet/10 px-3 text-[11px] font-extrabold leading-none text-violet">
      {children}
    </span>
  );
}

function ExperienceMeta({ experience }: { experience: ProfessionalExperience }) {
  const metaItems = [
    experience.period,
    experience.workMode,
    experience.location && experience.location !== experience.workMode ? experience.location : undefined,
  ].filter(Boolean);

  return (
    <>
      {metaItems.map((item, index) => (
        <span className="inline-flex items-center gap-1" key={item}>
          {index > 0 ? <span className="px-1" aria-hidden="true">•</span> : null}
          {index === metaItems.length - 1 && item === experience.location ? <MapPin size={13} className="text-ink" /> : null}
          {item}
        </span>
      ))}
    </>
  );
}

function Logo({ experience }: { experience: ProfessionalExperience }) {
  const words = experience.company.split(/\s+/).filter(Boolean);
  const uppercaseWord = words.find((word) => word.length > 1 && word === word.toUpperCase());
  const fallbackLabel = uppercaseWord ?? words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();

  return (
    <div className="flex h-[74px] w-[128px] flex-none items-center justify-center rounded-lg border border-line bg-white">
      {experience.logo ? (
        <Image
          src={experience.logo}
          alt={`Logo ${experience.company}`}
          width={116}
          height={54}
          className="max-h-[54px] w-auto max-w-[108px] object-contain"
        />
      ) : (
        <span className="text-lg font-black tracking-tight text-ink">{fallbackLabel}</span>
      )}
    </div>
  );
}

export default function ExperienceCard({ experience, defaultOpen = false }: ExperienceCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const cardId = experience.company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const desktopPanelId = `experience-${cardId}-desktop`;
  const mobilePanelId = `experience-${cardId}-mobile`;

  return (
    <article className="card-border min-w-0 scroll-mt-24 overflow-hidden p-4 md:p-0">
      <div className="hidden md:block">
        <button
          aria-controls={desktopPanelId}
          aria-expanded={isOpen}
          className="accordion-trigger group grid border-0 w-full grid-cols-[130px_minmax(0,1fr)_38px] gap-5 bg-white p-5 text-left outline-none transition focus:outline-none focus-visible:outline-none md:p-6"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <Logo experience={experience} />
          <div className="grid min-w-0 gap-5 border-l border-line pl-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
            <div className="min-w-0">
              <h3 className="m-0 text-sm font-black leading-5 text-ink">{experience.role}</h3>
              <p className="mt-2 text-xs font-extrabold text-violet">{experience.company}</p>
              <p className="mt-1 flex flex-wrap items-center gap-y-1 text-xs font-bold leading-5 text-muted">
                <ExperienceMeta experience={experience} />
              </p>
              {!isOpen ? <p className="mt-3 text-[11px] leading-5 text-muted">{experience.context}</p> : null}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-dark">Segmento</p>
              <div className="mt-3">
                <Badge>{experience.segment}</Badge>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-muted">
                <Users size={14} className="text-ink" /> {experience.team}
              </p>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-dark">Stack</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {experience.stack.slice(0, isOpen ? experience.stack.length : 3).map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          </div>
          <span className="grid size-8 place-items-center rounded-lg border border-line bg-canvas text-ink transition group-hover:border-violet/35">
            <ChevronDown className={isOpen ? "rotate-180 transition" : "transition"} size={16} />
          </span>
        </button>
        {isOpen ? (
          <div className="grid min-w-0 gap-5 border-t border-line bg-white p-5 md:grid-cols-[130px_minmax(0,1fr)] md:p-6" id={desktopPanelId}>
            <div className="hidden md:block" />
            <div className="grid min-w-0 gap-5 border-l border-line pl-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-dark">Contexto</p>
                <p className="mt-3 text-xs leading-5 text-muted">{experience.context}</p>
                <div className="mt-4">
                  <Badge>{experience.badge}</Badge>
                </div>
              </div>
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-dark">Meu papel</p>
                <ul className="mt-3 space-y-1.5 pl-4 text-xs leading-5 text-ink">
                  {experience.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-black uppercase tracking-[0.12em] text-dark">
                  Principal resultado
                </p>
                <p className="mt-3 text-xs leading-5 text-muted">{experience.result}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="md:hidden">
        <button
          aria-controls={mobilePanelId}
          aria-expanded={isOpen}
          className="accordion-trigger flex border-0 w-full items-start justify-between gap-4 bg-white text-left outline-none focus:outline-none focus-visible:outline-none"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <div className="min-w-0">
            <Logo experience={experience} />
            <h3 className="mt-4 text-base font-black leading-5 text-ink">{experience.role}</h3>
            <p className="mt-2 text-sm font-extrabold text-violet">{experience.company}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold leading-5 text-muted">
              <ExperienceMeta experience={experience} />
            </p>
            <div className="mt-3">
              <Badge>{experience.segment}</Badge>
            </div>
          </div>
          <span className="grid size-9 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
            <ChevronDown className={isOpen ? "rotate-180 transition" : "transition"} size={16} />
          </span>
        </button>
        {isOpen ? (
          <div className="mt-5 border-t border-line pt-5" id={mobilePanelId}>
            <p className="text-xs leading-5 text-muted">{experience.context}</p>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.12em] text-dark">Meu papel</p>
            <ul className="mt-3 space-y-1.5 pl-4 text-xs leading-5 text-ink">
              {experience.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.12em] text-dark">
              Principal resultado
            </p>
            <p className="mt-3 text-xs leading-5 text-muted">{experience.result}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{experience.badge}</Badge>
              {experience.stack.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-muted">
              <Users size={14} className="text-ink" /> Time: {experience.team}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
