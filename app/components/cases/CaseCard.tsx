import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { CaseStudy } from "../../types/case";

type CaseCardProps = {
  item: CaseStudy;
};

export default function CaseCard({ item }: CaseCardProps) {
  return (
    <Link
      aria-label={`Ver detalhes do case ${item.title}`}
      className={`standard-hover group relative flex min-h-[430px] flex-col overflow-hidden rounded-lg border bg-white shadow-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40 ${
        item.featured ? "border-violet/45 ring-1 ring-violet/10" : "border-line"
      }`}
      href={`/cases/${item.slug}`}
    >
      <div className="relative h-44 overflow-hidden bg-canvas">
        <Image
          src={item.coverImage}
          alt={`Imagem do case ${item.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {item.featured ? (
          <span className="absolute left-4 top-4 rounded-md bg-violet px-2.5 py-1 text-xs font-black leading-none text-white shadow-sm">
            Destaque
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-violet/10 px-2 py-1 text-xs font-black leading-none text-violet">
            {item.filterCategory}
          </span>
          <span className="text-xs font-bold leading-none text-muted">{item.company}</span>
        </div>

        <h3 className="mt-4 text-xl font-black leading-6 text-ink">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{item.shortDescription}</p>

        <div className="mt-5 grid gap-2">
          {item.impact.slice(0, 3).map((impact) => (
            <span className="flex items-start gap-2 text-xs font-bold leading-5 text-ink" key={impact.title}>
              <Check className="mt-0.5 flex-none text-violet" size={14} strokeWidth={2.4} />
              {impact.title}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags.slice(0, 4).map((tag) => (
            <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-bold leading-none text-muted" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-violet">
          Ver case
          <ArrowRight className="transition group-hover:translate-x-0.5" size={16} strokeWidth={2.3} />
        </span>
      </div>
    </Link>
  );
}
