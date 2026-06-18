import { Boxes, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import type { CaseImpact as CaseImpactType } from "../../types/case";

type CaseImpactProps = {
  items: CaseImpactType[];
  framed?: boolean;
  showTitle?: boolean;
};

const icons = [Sparkles, Gauge, ShieldCheck, Boxes];

export default function CaseImpact({ items, framed = true, showTitle = true }: CaseImpactProps) {
  return (
    <section aria-labelledby={showTitle ? "case-impact-title" : undefined} className={framed ? "card-border p-6 md:p-7" : ""}>
      {showTitle ? (
        <h2 id="case-impact-title" className="text-lg font-black leading-6 text-ink">
          Impacto
        </h2>
      ) : null}
      <div className={`${showTitle ? "mt-5" : ""} grid gap-3 sm:grid-cols-2`}>
        {items.map((item, index) => {
          const Icon = icons[index % icons.length];

          return (
            <article className="rounded-lg border border-line bg-white p-5 shadow-sm" key={item.title}>
              <span className="grid size-10 place-items-center rounded-lg border border-line bg-canvas text-ink">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 text-sm font-black leading-5 text-ink">{item.title}</h3>
              {item.value ? <p className="mt-1 text-xl font-black text-violet">{item.value}</p> : null}
              <p className="mt-2 text-xs leading-5 text-muted">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
