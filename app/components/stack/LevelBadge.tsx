import type { ProficiencyLevel } from "../../data/stack";

const levelClasses: Record<ProficiencyLevel, string> = {
  Expert: "bg-violet/10 text-violet border-violet/35",
  Advanced: "bg-violet/10 text-violet border-violet/35",
  Intermediate: "bg-canvas text-dark border-line",
  Basic: "bg-white text-muted border-line",
};

export default function LevelBadge({ level }: { level: ProficiencyLevel }) {
  return (
    <span
      className={`inline-flex min-h-8 shrink-0 items-center rounded-lg border px-3 text-xs font-extrabold leading-none ${levelClasses[level]}`}
    >
      {level}
    </span>
  );
}
