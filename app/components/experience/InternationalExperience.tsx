"use client";

import Image from "next/image";
import { ChevronDown, MapPin, Users } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { internationalExperiences, type InternationalExperience as InternationalExperienceItem } from "../../data/experience";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-lg bg-violet/10 px-3 text-[11px] font-extrabold leading-none text-violet">
      {children}
    </span>
  );
}

export default function InternationalExperience() {
  return (
    <section id="experiencia-internacional" className="border-b border-line pb-6" aria-labelledby="international-title">
      <h2 id="international-title" className="text-xs font-black uppercase tracking-[0.16em] text-dark">
        Experiência internacional
      </h2>
      <div className="mt-5 grid gap-5">
        {internationalExperiences.map((item, index) => (
          <InternationalExperienceCard defaultOpen={index === 0} item={item} key={item.company} />
        ))}
      </div>
    </section>
  );
}

function InternationalExperienceCard({ defaultOpen = false, item }: { defaultOpen?: boolean; item: InternationalExperienceItem }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const anchorId = item.company.toLowerCase();
  const panelId = `${anchorId}-details`;

  return (
    <article className="card-border scroll-mt-24 overflow-hidden" id={anchorId}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="accordion-trigger group relative grid border-0 w-full gap-5 bg-white p-5 pr-16 text-left outline-none transition focus:outline-none focus-visible:outline-none md:grid-cols-[150px_minmax(0,1fr)_38px] md:p-6"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <div>
          <div className="flex h-[74px] w-[128px] items-center justify-center rounded-lg border border-line bg-white">
            <Image
              src={item.logo}
              alt={`Logo ${item.company}`}
              width={116}
              height={54}
              className="max-h-[54px] w-auto max-w-[108px] object-contain"
            />
          </div>
        </div>
        <div className="grid min-w-0 gap-5 md:border-l md:border-line md:pl-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <h3 className="text-sm font-black leading-5 text-ink">{item.role}</h3>
            <p className="mt-2 text-xs font-extrabold text-violet">{item.company}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold leading-5 text-muted">
              {item.period}
              {item.workMode ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{item.workMode}</span>
                </>
              ) : null}
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-violet" />
                {item.location}
              </span>
            </p>
            <div className="mt-3">
              <Badge>{item.segment}</Badge>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-dark">Stack</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.stack.slice(0, isOpen ? item.stack.length : 4).map((badge) => (
                <Badge key={badge}>{badge}</Badge>
              ))}
            </div>
          </div>
        </div>
        <span className="absolute right-5 top-5 grid size-9 place-items-center rounded-lg border border-line bg-white text-ink transition group-hover:border-violet/35 md:static md:size-8">
          <ChevronDown className={isOpen ? "rotate-180 transition" : "transition"} size={16} />
        </span>
      </button>
      {isOpen ? (
        <div className="grid gap-5 border-t border-line bg-white p-5 md:grid-cols-[150px_minmax(0,1fr)] md:p-6" id={panelId}>
          <div className="hidden md:block" />
          <div className="grid min-w-0 gap-5 md:border-l md:border-line md:pl-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-dark">Projeto de destaque</p>
              <h3 className="mt-3 text-base font-black text-ink">{item.featuredProject}</h3>
              <p className="mt-3 text-xs leading-5 text-muted">{item.projectDescription}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-dark">Principal aprendizado</p>
              <p className="mt-3 text-xs leading-5 text-muted">{item.learning}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-muted">
                <Users size={14} className="text-violet" /> {item.team}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.badges.map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
