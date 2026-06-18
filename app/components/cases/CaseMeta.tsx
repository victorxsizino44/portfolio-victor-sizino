import { BriefcaseBusiness, CalendarDays, UsersRound, UserRound } from "lucide-react";
import type { CaseStudy } from "../../types/case";

type CaseMetaProps = Pick<CaseStudy, "duration" | "role" | "squad" | "projectType">;

const metaItems = [
  { label: "Duracao", key: "duration", icon: CalendarDays },
  { label: "Meu papel", key: "role", icon: UserRound },
  { label: "Squad", key: "squad", icon: UsersRound },
  { label: "Tipo de projeto", key: "projectType", icon: BriefcaseBusiness },
] as const;

export default function CaseMeta({ duration, role, squad, projectType }: CaseMetaProps) {
  const values = { duration, role, squad, projectType };

  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
      {metaItems.map((item) => {
        const Icon = item.icon;

        return (
          <div className="flex min-h-[82px] items-center gap-3 bg-white p-4" key={item.key}>
            <span className="grid size-9 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <div className="grid gap-0.5">
              <dt className="text-xs font-medium leading-4 text-muted">{item.label}</dt>
              <dd className="m-0 text-sm font-extrabold leading-5 text-ink">{values[item.key]}</dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
