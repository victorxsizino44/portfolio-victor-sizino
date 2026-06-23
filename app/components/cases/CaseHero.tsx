import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { CaseStudy } from "../../types/case";
import CaseMeta from "./CaseMeta";

type CaseHeroProps = {
  item: CaseStudy;
};

export default function CaseHero({ item }: CaseHeroProps) {
  const hasEnhancedHero = Boolean(item.highlights?.length);
  const defaultHeroMetrics = [
    { label: "Duracao", value: item.duration },
    { label: "Meu papel", value: item.role },
    { label: "Squad", value: item.squad },
    { label: "Tipo", value: item.projectType },
  ];
  const quickMetrics = item.heroMetrics ?? defaultHeroMetrics;

  return (
    <section className={hasEnhancedHero ? "max-w-full overflow-hidden border-b border-line pt-9 md:pt-12" : "pt-9 md:pt-12"}>
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-violet outline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40"
        href="/cases"
      >
        <ArrowLeft className="text-ink" size={16} strokeWidth={2.4} />
        Voltar para cases
      </Link>

      <div
        className={
          hasEnhancedHero
            ? "relative mt-8 max-w-full pb-8 md:pb-10 lg:min-h-[660px]"
            : "mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center"
        }
      >
        <div className={hasEnhancedHero ? "relative z-10 w-full max-w-[calc(100vw-40px)] min-w-0 lg:max-w-[500px]" : undefined}>
          <p className="inline-flex rounded-md bg-violet/10 px-2 py-1 text-xs font-black uppercase leading-none text-violet">
            {item.category}
          </p>
          <h1
            className={
              hasEnhancedHero
                ? "mt-4 max-w-full text-[27px] font-black leading-[1.08] tracking-normal text-ink [text-wrap:balance] sm:max-w-[620px] sm:text-[46px] md:text-[56px]"
                : "mt-4 max-w-[620px] text-[34px] font-black leading-[1.05] tracking-normal text-ink md:text-[46px]"
            }
          >
            {item.title}
          </h1>
          {!hasEnhancedHero ? (
            <p className="mt-3 text-sm font-bold leading-5 text-ink">
              {item.company} <span className="text-muted">/ {item.period}</span>
            </p>
          ) : null}
          <p className="mt-4 max-w-full text-base leading-7 text-muted sm:max-w-[620px]">{item.heroDescription}</p>
          <ul
            className={
              hasEnhancedHero
                ? "mt-6 grid w-full max-w-full list-none grid-cols-2 gap-2 p-0 min-[380px]:grid-cols-3 sm:flex sm:flex-wrap sm:justify-start"
                : "mt-6 flex w-full list-none flex-wrap justify-start gap-2 p-0"
            }
            aria-label="Tecnologias e temas do case"
          >
            {item.tags.map((tag) => (
              <li
                className={
                  hasEnhancedHero
                    ? "inline-flex h-9 min-w-0 items-center justify-center rounded-lg border border-line bg-white px-3 text-center text-[11px] font-bold text-ink shadow-sm sm:px-4 sm:text-xs"
                    : "inline-flex h-9 items-center rounded-lg border border-line bg-white px-4 text-xs font-bold text-ink shadow-sm"
                }
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>

          {hasEnhancedHero ? (
            <>
              <dl className="mt-7 grid max-w-full gap-3 sm:grid-cols-2">
                {quickMetrics.map((metric) => (
                  <div className="min-h-[82px] min-w-0 rounded-lg border border-line bg-white p-4 shadow-sm" key={metric.label}>
                    <dt className="text-xs font-medium leading-4 text-muted">{metric.label}</dt>
                    <dd className="m-0 mt-2 text-sm font-extrabold leading-5 text-ink [overflow-wrap:anywhere]">{metric.value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="m-0 mt-6 grid list-none gap-3 p-0" aria-label="Destaques do case">
                {item.highlights?.map((highlight) => (
                  <li className="flex items-center gap-3 text-sm font-bold leading-5 text-ink" key={highlight}>
                    <CheckCircle2 className="flex-none text-violet" size={17} strokeWidth={2.4} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <div
          className={
            hasEnhancedHero
              ? "relative z-0 mt-8 max-w-full overflow-hidden lg:absolute lg:right-0 lg:top-[108px] lg:mt-0 lg:w-[60%] lg:max-w-[680px] lg:overflow-visible"
              : "relative overflow-hidden rounded-lg border border-line bg-ink shadow-lg"
          }
        >
          <Image
            src={item.coverImage}
            alt={item.coverAlt ?? `Imagem do case ${item.title}`}
            width={960}
            height={560}
            sizes="(max-width: 1024px) 100vw, 560px"
            className={hasEnhancedHero ? "h-auto w-full object-contain" : "h-auto w-full object-cover"}
            priority
          />
        </div>
      </div>

      <div className={hasEnhancedHero ? "sr-only" : "mt-8"}>
        <CaseMeta
          company={item.company}
          period={item.period}
          location={item.location}
          duration={item.duration}
          role={item.role}
          squad={item.squad}
          projectType={item.projectType}
        />
      </div>
    </section>
  );
}
