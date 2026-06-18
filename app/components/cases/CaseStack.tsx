import { Wrench } from "lucide-react";
import type { ComponentType } from "react";
import {
  FirebaseIcon,
  NextIcon,
  OpenAIIcon,
  ReactIcon,
  TypeScriptIcon,
} from "../icons/BrandIcons";

type CaseStackProps = {
  tools: string[];
  framed?: boolean;
  showTitle?: boolean;
};

const stackIcons: Record<string, ComponentType<{ className?: string; size?: number }>> = {
  "Next.js": NextIcon,
  TypeScript: TypeScriptIcon,
  Firebase: FirebaseIcon,
  OpenAI: OpenAIIcon,
  React: ReactIcon,
};

export default function CaseStack({ tools, framed = true, showTitle = true }: CaseStackProps) {
  return (
    <section aria-labelledby={showTitle ? "case-stack-title" : undefined} className={framed ? "card-border p-6 md:p-7" : ""}>
      {showTitle ? (
        <h2 id="case-stack-title" className="text-lg font-black leading-6 text-ink">
          Stack & ferramentas
        </h2>
      ) : null}
      <ul className={`m-0 grid list-none grid-cols-2 gap-3 p-0 min-[390px]:grid-cols-3 sm:grid-cols-4 ${showTitle ? "mt-5" : ""}`}>
        {tools.map((tool) => {
          const Icon = stackIcons[tool];

          return (
            <li className="card-border grid h-[70px] place-items-center text-center text-[11px] font-semibold" key={tool}>
              {Icon ? <Icon className="text-ink" size={20} /> : <Wrench className="text-ink" size={20} strokeWidth={2} />}
              <span>{tool}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
