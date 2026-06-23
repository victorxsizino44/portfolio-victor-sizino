import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CaseCard from "../cases/CaseCard";
import type { CaseStudy } from "../../types/case";

type CasesSectionProps = {
  cases: CaseStudy[];
  limit?: number;
  showAllLink?: boolean;
  showTopBorder?: boolean;
};

export default function CasesSection({ cases, limit = 3, showAllLink = true, showTopBorder = true }: CasesSectionProps) {
  const visibleCases = cases.slice(0, limit);

  return (
    <section
      id="cases"
      className={`mx-auto max-w-[1096px] px-5 py-9 md:px-8 ${showTopBorder ? "border-t border-line" : ""}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="section-label">Cases de impacto</p>
        {showAllLink ? (
          <Link
            href="/cases"
            className="inline-flex items-center gap-1.5 text-sm font-bold leading-none text-violet outline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40"
          >
            Ver todos os cases <ArrowRight className="translate-y-px" size={15} strokeWidth={2.2} />
          </Link>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleCases.map((item) => (
          <CaseCard item={item} key={item.slug} />
        ))}
      </div>
    </section>
  );
}
