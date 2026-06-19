import {
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Code2,
  GraduationCap,
  Hand,
  LineChart,
  PenTool,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  WandSparkles,
} from "lucide-react";
import type {
  AboutCompany,
  AboutDifferential,
  AboutHeroBadge,
  AboutHighlight,
  AboutLearningGroup,
  AboutMetric,
  AboutTimelineItem,
  AboutWorkStyle,
} from "../types/about";

export const heroBadges: AboutHeroBadge[] = [
  {
    title: "AI Product Manager",
    icon: BrainCircuit,
    position: "left-4 top-8 rotate-[-4deg] md:left-7 md:top-10",
  },
  {
    title: "Estrategia",
    lines: ["Tecnologia", "Usuarios", "Impacto"],
    icon: PenTool,
    position: "bottom-10 left-5 rotate-[-5deg] md:left-12 md:bottom-14",
  },
  {
    title: "Produto",
    lines: ["Dados", "IA", "Pessoas"],
    icon: Sparkles,
    position: "right-3 top-28 rotate-[6deg] md:right-4 md:top-32",
  },
];

export const differentials: AboutDifferential[] = [
  {
    title: "Mentalidade de Produto",
    description: "Foco em entender o problema, priorizar o que importa e gerar valor real para o negocio e para o usuario.",
    icon: BrainCircuit,
  },
  {
    title: "Visao Tecnica",
    description: "Experiencia pratica em desenvolvimento que facilita a comunicacao com engenharia e acelera entregas.",
    icon: Code2,
  },
  {
    title: "Design & UX",
    description: "Background em design e UX para criar experiencias intuitivas, uteis e centradas nas pessoas.",
    icon: PenTool,
  },
  {
    title: "IA na Pratica",
    description: "Aplicacao de IA, agentes e automacoes para acelerar processos, decisoes e gerar valor para pessoas e negocios.",
    icon: WandSparkles,
  },
];

export const impactMetrics: AboutMetric[] = [
  { value: "10+", label: "Anos de experiencia construindo produtos digitais" },
  { value: "20+", label: "Projetos entregues em diferentes setores e contextos" },
  { value: "6+", label: "Empresas e projetos relevantes no Brasil e internacional" },
  { value: "Brasil + Irlanda", label: "Experiencia internacional em projetos e empresas" },
  { value: "Design + Tecnologia + Produto + IA", label: "Atuacao end-to-end com visao estrategica e tecnica" },
];

export const careerTimeline: AboutTimelineItem[] = [
  { period: "2012 - 2014", role: "Web Designer", description: "Inicio da jornada no design grafico e identidade visual." },
  {
    period: "2014 - 2016",
    role: "Front-end Developer",
    description: "Transicao para desenvolvimento front-end e experiencias digitais.",
  },
  {
    period: "2016 - 2019",
    role: "Senior Developer",
    description: "Atuacao em projetos complexos com foco em qualidade e performance.",
  },
  { period: "2019 - 2022", role: "Tech Lead", description: "Lideranca tecnica de times e projetos digitais." },
  {
    period: "2023 - 2024",
    role: "Technical Product Manager",
    description: "Conexao entre produto, tecnologia e negocio em diferentes setores.",
  },
  {
    period: "2024 - Atual",
    role: "AI Product Manager",
    description: "Foco em produtos orientados por IA, automacao e dados para gerar impacto real e escalavel.",
  },
];

export const workStyles: AboutWorkStyle[] = [
  {
    title: "AI First",
    description: "Exploro a aplicacao de IA para criar vantagens reais e eficiencia.",
    icon: Sparkles,
  },
  {
    title: "Data Informed",
    description: "Decisoes baseadas em dados, metricas e comportamento.",
    icon: BarChart3,
  },
  {
    title: "Hands-on",
    description: "Atuacao pratica do discovery a entrega, com proximidade do time.",
    icon: Hand,
  },
  {
    title: "Customer Centric",
    description: "Usuario no centro de todas as decisoes e solucoes.",
    icon: UserRound,
  },
];

export const journeyHighlights: AboutHighlight[] = [
  { title: "Promocao de Designer para Desenvolvedor", icon: Rocket },
  { title: "Promocao de Desenvolvedor Pleno para Desenvolvedor Senior", icon: LineChart },
  { title: "Promocao de Senior Developer para Tech Lead no Carrefour", icon: Target },
  { title: "Experiencia internacional na Irlanda", icon: GraduationCap },
  {
    title: "Honor Roll na SEDA College Dublin",
    description: "Evolucao de Intermediate para Upper Intermediate com as melhores notas da turma.",
    icon: Trophy,
  },
];

export const aboutCompanies: AboutCompany[] = [
  { name: "Meliuz", role: "AI Product Manager", logo: "/logos/meliuz.png" },
  { name: "Reclame Aqui", role: "Technical Product Manager", logo: "/logos/reclame-aqui-v2.png" },
  { name: "HireVue", role: "TPM AI & Platforms", logo: "/logos/hirevue-logo.svg" },
  { name: "Carrefour", role: "Tech Lead", logo: "/logos/carrefour.png" },
  { name: "IPNET", role: "Technical Product Manager", logo: "/logos/ipnet-v2.png" },
  { name: "Webbix", role: "Product Designer", logo: "/logos/webbix.png" },
  { name: "Stefanini", role: "Senior Front-end Developer", logo: "/logos/stefanini-logo.png" },
];

export const learningGroups: AboutLearningGroup[] = [
  {
    category: "Produto",
    items: ["Gestao de Produtos | Udemy (2026)", "Gestao de Produto | Udemy (2026)", "Imersao Gestor do Futuro | Tetra (2026)"],
  },
  {
    category: "IA & Automacao",
    items: [
      "Agentes de IA e Automacao n8n | Hashtag Treinamentos (2026)",
      "Curso de IA: Domine as Melhores Ferramentas de IA e Simplifique seu Trabalho | Udemy (2025)",
    ],
  },
  {
    category: "Dados",
    items: [
      "Analise de Dados no Power BI",
      "Introducao a Analise de Dados (Power BI)",
      "Preparando Dados para Analise (Power BI) Fundacao Bradesco (2025)",
    ],
  },
  {
    category: "Tecnologia",
    items: [
      "React com TypeScript | Origamid",
      "Redux com React | Origamid",
      "React Completo | Origamid",
      "Front End & UX/UI Design | Origamid",
      "E outros cursos e formacoes",
    ],
  },
  {
    category: "Formacao Academica",
    items: [
      "Design Grafico Faculdade Carlos Drummond (2012 - 2014)",
      "Tecnologia da Informacao | ETEC | 2010 - 2011",
      "English Language SEDA College Dublin (2018 - 2019)",
      "Honor Roll",
    ],
  },
];

export const aboutCtaIcon = BadgeCheck;
