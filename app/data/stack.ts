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
  id: string;
  year?: string;
  title: string;
  institution?: string;
  description?: string;
  image?: string;
};

export type ValueItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const stackMetrics: StackMetric[] = [
  { title: "10+ anos", description: "Tecnologia e produtos digitais", icon: Rocket },
  { title: "Frontend", description: "Experiencia profissional", icon: Boxes },
  { title: "Lideranca tecnica", description: "Colaboracao e mentoria", icon: BriefcaseBusiness },
  { title: "Internacional", description: "Irlanda e atuacao remota para os EUA", icon: Network },
];

export const proficiencyLegend: ProficiencyItem[] = [
  { level: "Expert", description: "Dominio profundo e aplicacao estrategica" },
  { level: "Advanced", description: "Uso consistente em projetos complexos" },
  { level: "Intermediate", description: "Conhecimento solido e aplicacao pratica" },
  { level: "Basic", description: "Conhecimento fundamental" },
];

export const proficiencyTooltipText =
  "Esta classificação considera experiência prática, impacto em projetos, tomada de decisão técnica e capacidade de liderar iniciativas conectando Produto, Engenharia e IA. O objetivo é demonstrar profundidade de atuação em cenários reais, não apenas conhecimento teórico ou uso pontual de ferramentas.";

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
    id: "imersao-gestor-do-futuro",
    year: "2026",
    title: "Imersão Gestor do Futuro",
    institution: "Tetra Educação",
    description:
      "Formação focada em liderança moderna, gestão estratégica, produtividade e uso de Inteligência Artificial na tomada de decisão. Aborda ferramentas, automações e práticas utilizadas por gestores de alta performance.",
    image: "/certificates/imersao-gestor-do-futuro.png",
  },
  {
    id: "preparando-dados-power-bi",
    year: "2026",
    title: "Preparando Dados para Análise - Microsoft Power BI",
    institution: "Fundação Bradesco",
    description:
      "Curso voltado à preparação, transformação e organização de dados para análise no Power BI, aplicando boas práticas de modelagem e estruturação de informações para geração de insights.",
    image: "/certificates/preparando-dados-power-bi.png",
  },
  {
    id: "introducao-analise-dados-power-bi",
    year: "2026",
    title: "Introdução à Análise de Dados - Microsoft Power BI",
    institution: "Fundação Bradesco",
    description:
      "Fundamentos de análise de dados utilizando Power BI, explorando conceitos de visualização, interpretação de indicadores e construção de dashboards orientados à tomada de decisão.",
    image: "/certificates/introducao-analise-dados-power-bi.png",
  },
  {
    id: "analise-dados-power-bi",
    year: "2026",
    title: "Análise de Dados no Power BI",
    institution: "Fundação Bradesco",
    description:
      "Aplicação prática de recursos analíticos do Power BI para criação de relatórios, acompanhamento de métricas e geração de insights estratégicos a partir de dados estruturados.",
    image: "/certificates/analise-dados-power-bi.png",
  },
  {
    id: "gestao-de-produtos",
    year: "2026",
    title: "Gestão de Produtos",
    institution: "Udemy",
    description:
      "Capacitação em fundamentos de Product Management, incluindo discovery, priorização, roadmap, métricas, definição de requisitos e alinhamento entre objetivos de negócio e necessidades dos usuários.",
    image: "/certificates/gestao-de-produtos-udemy.png",
  },
  {
    id: "product-management",
    year: "2026",
    title: "Product Management",
    institution: "Udemy",
    description:
      "Formação voltada à gestão de produtos digitais, cobrindo estratégias de produto, ciclo de vida, validação de hipóteses, discovery, métricas e tomada de decisão orientada por dados.",
    image: "/certificates/product-management-udemy.png",
  },
  {
    id: "front-end-ux-ui-design",
    year: "2025",
    title: "Front End & UX/UI Design",
    institution: "Origamid",
    description:
      "Formação completa em desenvolvimento front-end e design de interfaces, abordando HTML, CSS, JavaScript, UX, UI, prototipação, acessibilidade e construção de experiências digitais centradas no usuário.",
    image: "/certificates/front-end-ux-ui-origamid.png",
  },
  {
    id: "curso-ia-ferramentas",
    year: "2025",
    title: "Curso de IA: Domine as Melhores Ferramentas de IA e Simplifique seu Trabalho",
    institution: "Udemy",
    description:
      "Exploração prática das principais ferramentas de Inteligência Artificial para aumento de produtividade, automação de tarefas, criação de conteúdo, análise de informações e otimização de processos.",
    image: "/certificates/curso-ia-udemy.png",
  },
  {
    id: "redux-com-react",
    year: "2024",
    title: "Redux com React",
    institution: "Origamid",
    description:
      "Curso focado em gerenciamento de estado com Redux em aplicações React, abordando arquitetura escalável, fluxo de dados previsível e boas práticas para aplicações complexas.",
    image: "/certificates/redux-react-origamid.png",
  },
  {
    id: "react-com-typescript",
    year: "2024",
    title: "React com TypeScript",
    institution: "Origamid",
    description:
      "Desenvolvimento de aplicações React utilizando TypeScript, aplicando tipagem estática, componentização, reutilização de código e práticas modernas de desenvolvimento front-end.",
    image: "/certificates/react-typescript-origamid.png",
  },
  {
    id: "react-completo",
    year: "2023",
    title: "React Completo",
    institution: "Origamid",
    description:
      "Formação completa em React, cobrindo componentes, hooks, roteamento, consumo de APIs, gerenciamento de estado e construção de aplicações modernas e escaláveis.",
    image: "/certificates/react-completo-origamid.png",
  },
  {
    id: "react-typescript-dashboard",
    year: "2021",
    title: "React e TypeScript: desenvolvendo um Dashboard",
    institution: "Udemy",
    description:
      "Projeto prático de construção de dashboards utilizando React e TypeScript, com foco em visualização de dados, componentização e boas práticas de desenvolvimento.",
  },
  {
    id: "componentes-web-mobile-react",
    year: "2020",
    title: "Desenvolvimento de Componentes Web e Mobile com React.JS, Redux e React Native",
    institution: "Impacta Tecnologia",
    description:
      "Capacitação em desenvolvimento de componentes reutilizáveis para aplicações web e mobile, utilizando React, Redux e React Native com foco em performance e escalabilidade.",
  },
  {
    id: "dax",
    year: "2016",
    title: "DAX",
    institution: "Linx Commerce",
    description:
      "Treinamento voltado à linguagem DAX para criação de cálculos, indicadores e métricas analíticas, apoiando processos de análise de dados e geração de relatórios corporativos.",
  },
];

export const continuousLearningCard: Certification = {
  id: "continuous-learning",
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
