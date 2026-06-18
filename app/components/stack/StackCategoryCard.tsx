import type { StackCategory } from "../../data/stack";
import LevelBadge from "./LevelBadge";

function SkillsContent({ category, compact = false }: { category: StackCategory; compact?: boolean }) {
  return (
    <div className="grid gap-4">
      {category.groups.map((group, index) => (
        <div key={group.label ?? `${category.title}-${index}`}>
          {group.label ? (
            <div className="mb-3 flex items-center justify-between gap-3 pb-3">
              <LevelBadge level={group.label} />
            </div>
          ) : null}
          <ul className={compact ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid gap-2"}>
            {group.skills.map((skill) => (
              <li className="flex min-w-0 items-start gap-2 text-xs font-semibold leading-5 text-muted" key={skill}>
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-violet" aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

type StackCategoryCardProps = {
  category: StackCategory;
  compact?: boolean;
  index?: number;
  mode?: "all" | "desktop" | "mobile";
};

export default function StackCategoryCard({ category, compact = false, index, mode = "all" }: StackCategoryCardProps) {
  const Icon = category.icon;
  const featuredClasses = category.featured && !compact ? "border-violet/35 bg-white shadow-md" : "bg-white";
  const desktopVisibility = mode === "mobile" ? "hidden" : "hidden md:block";
  const mobileVisibility = mode === "desktop" ? "hidden" : "md:hidden";

  return (
    <>
      <article
        className={`card-border standard-hover min-h-[280px] p-5 ${desktopVisibility} ${featuredClasses}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon aria-hidden="true" size={21} strokeWidth={2} />
            </span>
            <h3 className="text-base font-black uppercase leading-6 text-ink">{category.title}</h3>
          </div>
          <LevelBadge level={category.level} />
        </div>
        <div className="-ml-3">
          <SkillsContent category={category} compact={compact} />
        </div>
      </article>

      <details className={`card-border group overflow-hidden ${mobileVisibility}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 marker:hidden">
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon aria-hidden="true" size={19} strokeWidth={2} />
            </span>
            {typeof index === "number" ? <span className="text-sm font-black text-violet">{index + 1}</span> : null}
            <span className="min-w-0 text-sm font-black uppercase leading-5 text-ink">{category.title}</span>
          </span>
          <LevelBadge level={category.level} />
        </summary>
        <div className="border-t border-line p-4 pt-5">
          <SkillsContent category={category} />
        </div>
      </details>
    </>
  );
}
