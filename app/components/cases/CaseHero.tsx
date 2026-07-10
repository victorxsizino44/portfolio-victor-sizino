import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { CaseStudy } from "../../types/case";

type CaseHeroProps = {
  item: CaseStudy;
};

export default function CaseHero({ item }: CaseHeroProps) {
  const defaultHeroMetrics = [
    { label: "Duracao", value: item.duration },
    { label: "Meu papel", value: item.role },
    { label: "Squad", value: item.squad },
    { label: "Tipo", value: item.projectType },
  ];
  const quickMetrics = item.heroMetrics ?? defaultHeroMetrics;

  return (
    <section className="border-b border-line pt-9 md:pt-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-violet outline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40"
        href="/cases"
      >
        <ArrowLeft className="text-ink" size={16} strokeWidth={2.4} />
        Voltar para cases
      </Link>

      <div className="mt-8 pb-8 md:pb-10">
        <p className="inline-flex rounded-md bg-violet/10 px-2 py-1 text-xs font-black uppercase leading-none text-violet">
          {item.category}
        </p>
        <h1 className="mt-4 max-w-[860px] text-[34px] font-black leading-[1.05] tracking-normal text-ink [text-wrap:balance] sm:text-[46px] md:text-[56px]">
          {item.title}
        </h1>
        <p className="mt-4 max-w-[760px] text-base leading-7 text-muted md:text-lg md:leading-8">{item.heroDescription}</p>

        <ul className="mt-6 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-5" aria-label="Tecnologias e temas do case">
          {item.tags.map((tag) => (
            <li
              className="inline-flex min-h-10 min-w-0 items-center justify-center rounded-lg border border-line bg-white px-3 text-center text-[11px] font-bold leading-4 text-ink shadow-sm sm:px-4 sm:text-xs"
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>

        <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickMetrics.map((metric) => (
            <div className="min-h-[82px] min-w-0 rounded-lg border border-line bg-white p-4 shadow-sm" key={metric.label}>
              <dt className="text-xs font-medium leading-4 text-muted">{metric.label}</dt>
              <dd className="m-0 mt-2 text-sm font-extrabold leading-5 text-ink [overflow-wrap:anywhere]">{metric.value}</dd>
            </div>
          ))}
        </dl>

        {item.highlights?.length ? (
          <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2" aria-label="Destaques do case">
            {item.highlights.map((highlight) => (
              <li className="flex items-center gap-3 text-sm font-bold leading-5 text-ink" key={highlight}>
                <CheckCircle2 className="flex-none text-violet" size={17} strokeWidth={2.4} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
