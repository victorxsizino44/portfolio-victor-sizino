import { ChevronDown, Star } from "lucide-react";
import { coreCompetencies, positioningRoleLabels } from "../../data/stack";

type CoreCompetenciesProps = {
  variant?: "desktop" | "mobile";
};

function CompetenciesList() {
  return (
    <div className="mt-5 grid gap-4">
      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
        Papel no posicionamento
      </p>
      {coreCompetencies.map(({ title, positioningRole }) => (
        <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-3" key={title}>
          <p className="m-0 min-w-0 text-xs font-extrabold leading-[18px] text-white/92">{title}</p>
          <span className="flex w-24 justify-center">
            <span className="inline-flex min-h-8 w-full items-center justify-center rounded-lg border border-violet/20 bg-violet/10 px-3 text-xs font-extrabold leading-none text-violet">
              {positioningRoleLabels[positioningRole]}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CoreCompetencies({ variant = "desktop" }: CoreCompetenciesProps) {
  if (variant === "mobile") {
    return (
      <details className="card-border group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-ink p-4 marker:hidden">
          <span className="inline-flex items-center gap-3 text-sm font-black uppercase text-white">
            <span className="grid size-9 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Star aria-hidden="true" size={16} strokeWidth={2} />
            </span>
            Core Competencies
          </span>
          <ChevronDown className="shrink-0 text-white/70 transition group-open:rotate-180" size={17} strokeWidth={2.2} />
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
        <span className="grid size-8 place-items-center rounded-lg border border-line bg-canvas text-ink">
          <Star aria-hidden="true" size={16} strokeWidth={2} />
        </span>
        Core Competencies
      </p>
      <div className="mt-4 h-px bg-white/10" />
      <CompetenciesList />
    </section>
  );
}
