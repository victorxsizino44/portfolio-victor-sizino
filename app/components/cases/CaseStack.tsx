import {
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  ChartNoAxesCombined,
  ClipboardList,
  Cloud,
  Code2,
  FileCode2,
  FlaskConical,
  GalleryHorizontalEnd,
  GitBranch,
  Globe2,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Network,
  PenTool,
  Rocket,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Target,
  UploadCloud,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  BigQueryIcon,
  ElasticsearchIcon,
  FirebaseIcon,
  FigmaIcon,
  GoogleAnalyticsIcon,
  NextIcon,
  OpenAIIcon,
  ReactIcon,
  TypeScriptIcon,
  JiraIcon,
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
  "MUI DataGrid": Table2,
  Formik: ClipboardList,
  Zod: ShieldCheck,
  Dropzone: UploadCloud,
  IA: Sparkles,
  "Tailwind CSS": LayoutDashboard,
  "AI Product Management": BrainCircuit,
  LLMs: Bot,
  "Product Discovery": Search,
  Roadmap: Route,
  Backlog: ListChecks,
  APIs: Network,
  "Design System": Boxes,
  "Design Systems": Boxes,
  Jira: JiraIcon,
  "VTEX IO": Globe2,
  "Vue.js": Code2,
  GA4: GoogleAnalyticsIcon,
  Jest: FlaskConical,
  UX: PenTool,
  QA: ShieldCheck,
  Hybris: Cloud,
  JavaScript: FileCode2,
  Analytics: ChartNoAxesCombined,
  Figma: FigmaIcon,
  InVision: GalleryHorizontalEnd,
  Illustrator: PenTool,
  "UX Research": UsersRound,
  HTML: Code2,
  CSS: FileCode2,
  Trello: LayoutDashboard,
  Tailwind: LayoutDashboard,
  Discovery: Search,
  "Stakeholder Management": UsersRound,
  PromoteIQ: Target,
  Percycle: GitBranch,
  Ads: Megaphone,
  "E-commerce": Globe2,
  Funil: BarChart3,
  Benchmarking: Target,
  Metricas: ChartNoAxesCombined,
  Growth: Rocket,
  OpenAI: OpenAIIcon,
  React: ReactIcon,
  BigQuery: BigQueryIcon,
  Elasticsearch: ElasticsearchIcon,
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
          const Icon = stackIcons[tool] ?? Code2;

          return (
            <li className="card-border grid h-[70px] place-items-center text-center text-[11px] font-semibold" key={tool}>
              <Icon className="text-ink" size={20} />
              <span>{tool}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
