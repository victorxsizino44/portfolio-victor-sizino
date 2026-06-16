import {
  BarChart3,
  Bot,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Cpu,
  FileBadge,
  Layers3,
  LineChart,
  Network,
  Rocket,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProficiencyLevel = "Expert" | "Advanced" | "Intermediate" | "Basic";

export type StackMetric = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ProficiencyItem = {
  level: ProficiencyLevel;
  description: string;
};

export type SkillGroup = {
  label?: ProficiencyLevel;
  skills: string[];
};

export type StackCategory = {
  title: string;
  level: ProficiencyLevel;
  icon: LucideIcon;
  featured?: boolean;
  groups: SkillGroup[];
};

export type CoreCompetency = {
  title: string;
  level: ProficiencyLevel;
};

export type Certification = {
  year?: string;
  title: string;
  institution?: string;
  description?: string;
};

export type ValueItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const stackMetrics: StackMetric[] = [
  { title: "12+ anos", description: "Construindo produtos digitais", icon: Rocket },
  { title: "20+ produtos", description: "Lancados ou participacoes", icon: Boxes },
  { title: "7+ empresas", description: "Brasil e Irlanda", icon: BriefcaseBusiness },
  { title: "Internacional", description: "Atuacao global", icon: Network },
];

export const proficiencyLegend: ProficiencyItem[] = [
  { level: "Expert", description: "Dominio profundo e aplicacao estrategica" },
  { level: "Advanced", description: "Uso consistente em projetos complexos" },
  { level: "Intermediate", description: "Conhecimento solido e aplicacao pratica" },
  { level: "Basic", description: "Conhecimento fundamental" },
];

export const stackCategories: StackCategory[] = [
  {
    title: "AI & Automacao",
    level: "Expert",
    icon: BrainCircuit,
    featured: true,
    groups: [
      {
        skills: [
          "ChatGPT",
          "Claude",
          "Gemini",
          "OpenAI API",
          "Gemini API",
          "Prompt Engineering",
          "AI Agents",
          "RAG",
          "MCP",
          "n8n",
          "Make",
          "AI Workflows",
          "Automacao de Processos",
        ],
      },
    ],
  },
  {
    title: "Product Management",
    level: "Advanced",
    icon: Target,
    groups: [
      {
        skills: [
          "Product Discovery",
          "Problem Discovery",
          "User Research",
          "JTBD",
          "Benchmarking",
          "Product Strategy",
          "Roadmap Planning",
          "Priorizacao",
          "RICE",
          "ICE",
          "Backlog Management",
          "Stakeholder Management",
          "OKRs",
          "North Star Metrics",
          "Product Delivery",
        ],
      },
    ],
  },
  {
    title: "Technical Product Management",
    level: "Advanced",
    icon: Cpu,
    groups: [
      {
        skills: [
          "Arquitetura de Produto",
          "APIs",
          "Integracoes",
          "Viabilidade Tecnica",
          "Alinhamento Produto x Engenharia",
          "Requisitos tecnicos",
          "Workflows",
          "Sistemas Escalaveis",
          "Refinamento tecnico",
          "Documentacao funcional e tecnica",
        ],
      },
    ],
  },
  {
    title: "Product Design",
    level: "Advanced",
    icon: Layers3,
    groups: [
      {
        skills: [
          "Figma",
          "FigJam",
          "Design Systems",
          "Wireframing",
          "Prototyping",
          "User Research",
          "UX Design",
          "User Journeys",
          "Information Architecture",
          "Usability Testing",
        ],
      },
    ],
  },
  {
    title: "Front-End Development",
    level: "Advanced",
    icon: Code2,
    groups: [
      {
        label: "Advanced",
        skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
      },
      {
        label: "Intermediate",
        skills: ["Firebase", "Redux", "Context API", "Jest", "Playwright", "REST APIs"],
      },
    ],
  },
  {
    title: "Analytics & Growth",
    level: "Advanced",
    icon: BarChart3,
    groups: [
      {
        label: "Advanced",
        skills: [
          "Google Analytics 4",
          "Hotjar",
          "Product Metrics",
          "A/B Testing",
          "Growth Experiments",
          "Funnel Analysis",
        ],
      },
      {
        label: "Intermediate",
        skills: ["Looker Studio", "Power BI"],
      },
    ],
  },
  {
    title: "Agile & Delivery",
    level: "Advanced",
    icon: Workflow,
    groups: [
      {
        skills: [
          "Scrum",
          "Kanban",
          "SAFe",
          "Lean",
          "Sprint Planning",
          "Backlog Management",
          "Agile Delivery",
          "Release Planning",
          "Team Collaboration",
        ],
      },
    ],
  },
  {
    title: "Gestao de Produto",
    level: "Expert",
    icon: CheckCircle2,
    groups: [
      { label: "Expert", skills: ["Jira", "Confluence", "Notion"] },
      { label: "Advanced", skills: ["ClickUp", "Productboard", "FigJam"] },
    ],
  },
];

export const coreCompetencies: CoreCompetency[] = [
  { title: "AI PM", level: "Expert" },
  { title: "AI Agents & Automation", level: "Advanced" },
  { title: "PM", level: "Advanced" },
  { title: "TPM", level: "Advanced" },
  { title: "Product Design", level: "Advanced" },
  { title: "Front-End", level: "Expert" },
  { title: "Analytics & Growth", level: "Intermediate" },
];

export const certifications: Certification[] = [
  {
    year: "2026",
    title: "Agentes de IA e Automacao com n8n",
    institution: "Hashtag Treinamentos",
  },
  {
    year: "2026",
    title: "Imersao Gestor do Futuro",
    institution: "Tetra Educacao",
  },
  {
    year: "2026",
    title: "Preparando Dados para Analise com Power BI",
    institution: "Fundacao Bradesco",
  },
];

export const continuousLearningCard: Certification = {
  title: "+ Em constante evolucao",
  description: "Investindo continuamente em novas habilidades e tecnologias emergentes.",
};

export const valueItems: ValueItem[] = [
  {
    title: "Visao Estrategica",
    description: "Alinho tecnologia, negocio e usuario para gerar impacto real.",
    icon: Target,
  },
  {
    title: "Execucao Tecnica",
    description: "Entendo a engenharia e construo solucoes viaveis e escalaveis.",
    icon: Code2,
  },
  {
    title: "IA como Alavanca",
    description: "Uso IA e automacoes para acelerar resultados e eficiencia.",
    icon: Bot,
  },
  {
    title: "Foco em Impacto",
    description: "Metricas, experimentacao e dados para decisoes melhores.",
    icon: LineChart,
  },
];

export const stackHeroHighlights = [
  { label: "Produto", icon: BriefcaseBusiness },
  { label: "IA aplicada", icon: Sparkles },
  { label: "Tecnologia", icon: Cpu },
  { label: "Dados", icon: BarChart3 },
];

export const stackCtaIcon = FileBadge;
