import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CaseStudy } from "../../types/case";
import CaseMeta from "./CaseMeta";

type CaseHeroProps = {
  item: CaseStudy;
};

export default function CaseHero({ item }: CaseHeroProps) {
  return (
    <section className="pt-9 md:pt-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-violet outline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40"
        href="/cases"
      >
        <ArrowLeft className="text-ink" size={16} strokeWidth={2.4} />
        Voltar para cases
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center">
        <div>
          <p className="inline-flex rounded-md bg-violet/10 px-2 py-1 text-xs font-black uppercase leading-none text-violet">
            {item.category}
          </p>
          <h1 className="mt-4 max-w-[620px] text-[34px] font-black leading-[1.05] tracking-normal text-ink md:text-[46px]">
            {item.title}
          </h1>
          <p className="mt-4 max-w-[620px] text-base leading-7 text-muted">{item.heroDescription}</p>
          <ul className="mt-6 flex w-full list-none flex-wrap justify-start gap-2 p-0" aria-label="Tecnologias e temas do case">
            {item.tags.map((tag) => (
              <li
                className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-4 text-xs font-bold leading-none text-ink shadow-sm"
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-line bg-ink shadow-lg">
          <Image
            src={item.coverImage}
            alt=""
            width={960}
            height={560}
            sizes="(max-width: 1024px) 100vw, 560px"
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      </div>

      <div className="mt-8">
        <CaseMeta duration={item.duration} role={item.role} squad={item.squad} projectType={item.projectType} />
      </div>
    </section>
  );
}
