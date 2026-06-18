import { BadgeCheck, Circle, Gauge, Lightbulb } from "lucide-react";
import { proficiencyLegend } from "../../data/stack";
import LevelBadge from "./LevelBadge";

const proficiencyIcons = {
  Expert: BadgeCheck,
  Advanced: Gauge,
  Intermediate: Lightbulb,
  Basic: Circle,
};

export default function ProficiencyLegend() {
  return (
    <section className="hidden border-b border-line py-6 md:block" aria-labelledby="proficiency-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-5 w-0.5 rounded-full bg-violet" aria-hidden="true" />
        <h2 id="proficiency-title" className="m-0 text-xs font-black uppercase tracking-[0.12em] text-ink">
          Niveis de proficiencia
        </h2>
        <span className="grid size-4 place-items-center rounded-lg border border-line text-[10px] font-black text-ink">
          i
        </span>
      </div>
      <div className="card-border grid overflow-hidden md:grid-cols-4">
        {proficiencyLegend.map(({ level, description }) => {
          const Icon = proficiencyIcons[level];

          return (
            <div
              className="flex min-w-0 items-start gap-4 border-b border-line p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              key={level}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
                <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <LevelBadge level={level} />
                <p className="m-0 mt-2 text-xs font-semibold leading-5 text-muted">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
