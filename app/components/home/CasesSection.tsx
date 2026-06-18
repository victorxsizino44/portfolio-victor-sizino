import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getAllCases } from "../../lib/cases";

const badgeBySlug: Record<string, { label: string; className: string }> = {
  "case-agu": { label: "AGU", className: "bg-slate-700 text-white" },
  "case-meliuz": { label: "m", className: "bg-pink-500 text-white" },
  "case-ra-reviews": { label: "RA", className: "bg-violet text-white" },
  "case-porto-seguro-setur": { label: "PS", className: "bg-white text-violet" },
  "case-houzbuddy": { label: "HB", className: "bg-dark text-white" },
};

type CasesSectionProps = {
  limit?: number;
  showAllLink?: boolean;
};

export default function CasesSection({ limit = 3, showAllLink = true }: CasesSectionProps) {
  const cases = getAllCases().slice(0, limit);

  return (
    <section id="cases" className="mx-auto max-w-[1096px] px-5 py-3 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="section-label">Cases de impacto</p>
        {showAllLink ? (
          <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm font-bold leading-none text-violet">
            Ver todos os cases <ArrowRight className="translate-y-px" size={15} strokeWidth={2.2} />
          </Link>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((item) => (
          <Link
            aria-label={`Ver detalhes do case ${item.title}`}
            className="case-card"
            href={`/cases/${item.slug}`}
            key={item.slug}
          >
            <Image src={item.coverImage} alt="" fill sizes="(max-width: 768px) 100vw, 360px" className="case-card-image" />
            <div className="case-card-scrim" />
            <div className="case-card-content">
              <span className={`case-badge ${badgeBySlug[item.slug]?.className ?? "bg-dark text-white"}`}>
                {badgeBySlug[item.slug]?.label ?? item.filterCategory.slice(0, 2)}
              </span>
              <div className="case-copy">
                <h3 className="case-title">{item.title}</h3>
                <p className="case-description">{item.shortDescription}</p>
              </div>
              <div className="case-results">
                <span className="case-results-label">Resultados</span>
                {item.impact.slice(0, 3).map((impact) => (
                  <span className="case-result-item" key={impact.title}>
                    <Check size={13} strokeWidth={2.4} />
                    {impact.title}
                  </span>
                ))}
              </div>
              <div className="case-tags">
                {item.tags.slice(0, 4).map((tag) => (
                  <span className="case-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
