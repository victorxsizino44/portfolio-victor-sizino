import { heroMetrics } from "../../data/experience";

export default function ExperienceStats() {
  return (
    <div className="grid grid-cols-2 gap-3 md:max-w-[520px] md:gap-4">
      {heroMetrics.map(({ value, label, description, icon: Icon }) => (
        <span
          className="inline-flex h-9 w-full min-w-0 items-center justify-start gap-3 rounded-lg border border-line bg-white px-4 text-[11px] font-bold shadow-sm md:text-xs"
          key={label}
        >
          <span className="grid size-4 shrink-0 place-items-center text-violet">
            <Icon size={16} strokeWidth={2} />
          </span>
          <span className="min-w-0 truncate">
            {value ? <strong className="font-black text-violet">{value} </strong> : null}
            {label}
            {description ? <span className="sr-only"> - {description}</span> : null}
          </span>
        </span>
      ))}
    </div>
  );
}
