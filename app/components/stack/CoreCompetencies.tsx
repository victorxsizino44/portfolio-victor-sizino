import { ChevronDown, Star } from "lucide-react";
import { coreCompetencies } from "../../data/stack";

type CoreCompetenciesProps = {
  variant?: "desktop" | "mobile";
};

function CompetenciesList() {
  return (
    <div className="mt-5 grid gap-4">
      {coreCompetencies.map(({ title, level }) => {
        const fillClass = level === "Expert" ? "w-full" : "w-4/5";

        return (
          <div className="grid grid-cols-[minmax(0,1fr)_72px_78px] items-center gap-3" key={title}>
            <p className="m-0 min-w-0 text-xs font-extrabold leading-[18px] text-white/92">{title}</p>
            <span className="flex w-full justify-center">
              <span className="h-1 w-14 rounded-full bg-white/10">
                <span className={`block h-1 rounded-full bg-violet ${fillClass}`} />
              </span>
            </span>
            <span className="flex w-[78px] justify-center">
              <span className="inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-violet/20 bg-violet/10 px-3 text-xs font-extrabold leading-none text-violet">
                {level}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CoreCompetencies({ variant = "desktop" }: CoreCompetenciesProps) {
  if (variant === "mobile") {
    return (
      <details className="card-border group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-ink p-4 marker:hidden">
          <span className="inline-flex items-center gap-3 text-sm font-black uppercase text-white">
            <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-white">
              <Star aria-hidden="true" size={16} strokeWidth={2} />
            </span>
            Core Competencies
          </span>
          <ChevronDown className="shrink-0 text-white transition group-open:rotate-180" size={17} strokeWidth={2} />
        </summary>
        <div className="border-t border-white/10 bg-ink p-5 pt-4">
          <CompetenciesList />
        </div>
      </details>
    );
  }

  return (
    <section className="rounded-lg border border-violet/20 bg-ink p-5 text-white shadow-lg">
      <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-white">
        <Star aria-hidden="true" className="text-white" size={18} strokeWidth={2} />
        Core Competencies
      </p>
      <div className="mt-4 h-px bg-white/10" />
      <CompetenciesList />
    </section>
  );
}
