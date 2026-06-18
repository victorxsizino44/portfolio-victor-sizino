import { CircleCheck, GitBranch, Map, PenTool, Search, SlidersHorizontal } from "lucide-react";
import type { CaseProcessStep } from "../../types/case";

type CaseProcessProps = {
  steps: CaseProcessStep[];
  framed?: boolean;
  showTitle?: boolean;
};

const icons = [Search, Map, SlidersHorizontal, PenTool, GitBranch, CircleCheck];

export default function CaseProcess({ steps, framed = true, showTitle = true }: CaseProcessProps) {
  return (
    <section aria-labelledby={showTitle ? "case-process-title" : undefined} className={framed ? "card-border p-6 md:p-7" : ""}>
      {showTitle ? (
        <h2 id="case-process-title" className="text-lg font-black leading-6 text-ink">
          Processo
        </h2>
      ) : null}
      <ol className={`${showTitle ? "mt-5" : ""} grid list-none gap-4 p-0 md:grid-cols-3 lg:grid-cols-6`}>
        {steps.map((step, index) => {
          const Icon = icons[index % icons.length];

          return (
            <li className="relative" key={step.title}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-px flex-1 border-t border-dashed border-line lg:block" aria-hidden="true" />
                ) : null}
              </div>
              <h3 className="mt-4 text-sm font-black leading-5 text-ink">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
