import { BriefcaseBusiness, Building2, CalendarDays, MapPin, UsersRound, UserRound } from "lucide-react";
import type { CaseStudy } from "../../types/case";

type CaseMetaProps = Pick<CaseStudy, "company" | "period" | "location" | "duration" | "role" | "squad" | "projectType">;

const metaItems = [
  { label: "Empresa", key: "company", icon: Building2 },
  { label: "Periodo", key: "period", icon: CalendarDays },
  { label: "Localizacao", key: "location", icon: MapPin },
  { label: "Meu papel", key: "role", icon: UserRound },
  { label: "Squad", key: "squad", icon: UsersRound },
  { label: "Tipo de projeto", key: "projectType", icon: BriefcaseBusiness },
] as const;

export default function CaseMeta({ company, period, location, role, squad, projectType }: CaseMetaProps) {
  const values = { company, period, location: location ?? "Remoto", role, squad, projectType };

  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
