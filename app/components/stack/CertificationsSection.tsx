import { FileBadge, Star } from "lucide-react";
import { certifications, continuousLearningCard } from "../../data/stack";

export default function CertificationsSection() {
  return (
    <section className="card-border p-4 md:p-5" aria-labelledby="certifications-title">
      <h2 id="certifications-title" className="text-xs font-black uppercase tracking-[0.12em] text-ink">
        Certificacoes & Formacao Continua
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="certifications-carousel min-w-0 overflow-x-auto rounded-lg border border-line bg-white">
          <div className="flex min-w-max">
            {certifications.map(({ year, title, institution }) => (
              <article className="relative flex min-h-[112px] w-[278px] shrink-0 items-center gap-4 p-4" key={title}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet/10 text-violet ring-1 ring-violet/15">
                  <FileBadge aria-hidden="true" size={19} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  {year ? <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-violet">{year}</p> : null}
                  <h3 className="mt-2 text-xs font-black leading-5 text-ink md:text-[13px]">{title}</h3>
                  {institution ? <p className="mt-2 text-xs font-bold leading-5 text-muted">{institution}</p> : null}
                </div>
                <span className="absolute bottom-3 right-0 top-3 hidden w-px bg-line last:hidden md:block" aria-hidden="true" />
                <span className="absolute right-[-3px] top-1/2 hidden size-1.5 -translate-y-1/2 rounded-full bg-violet last:hidden md:block" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
        <article className="flex min-h-[112px] items-center gap-4 rounded-lg border border-violet/20 bg-violet/5 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-violet shadow-sm ring-1 ring-violet/15">
            <Star aria-hidden="true" size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-black leading-5 text-violet md:text-[13px]">{continuousLearningCard.title}</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">{continuousLearningCard.description}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
