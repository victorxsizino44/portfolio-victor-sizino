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
  { value: "10+ anos", label: "Experiencia em tecnologia e produtos digitais" },
  { value: "Brasil", label: "Experiencia profissional" },
  { value: "Irlanda", label: "Experiencia presencial" },
  { value: "Estados Unidos", label: "Atuacao remota para empresa internacional" },
];

export const careerTimeline: AboutTimelineItem[] = [
  { period: "11/2014–03/2018", role: "Designer → Senior Front-end Developer", description: "Agencia DCS." },
  { period: "06/2018–11/2018", role: "UI/UX Designer", description: "Webbiz.ie, em experiencia presencial na Irlanda." },
  { period: "11/2018–05/2019", role: "Desenvolvedor Front-end e Web Designer — Consultor", description: "Consultoria remota por projeto para a Agencia DCS, a partir de Dublin, Irlanda." },
  { period: "05/2019–06/2021", role: "Front-end Developer → Tech Lead", description: "Carrefour Brasil." },
  { period: "06/2021–05/2023", role: "Front-end Developer", description: "Stefanini." },
  { period: "11/2023–06/2024", role: "Front-end Developer", description: "IPNET by Vivo, com atuacao orientada a produto." },
  { period: "07/2024–07/2025", role: "Technical Product Manager", description: "Reclame Aqui, com contribuicao frontend." },
  { period: "10/2025–12/2025", role: "Technical Product Manager — AI & Intelligent Platforms", description: "HireVue, em atuacao remota para empresa dos Estados Unidos." },
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
];

export const aboutCompanies: AboutCompany[] = [
  { name: "Reclame Aqui", role: "Technical Product Manager", logo: "/logos/reclame-aqui-v2.png" },
  { name: "HireVue", role: "Technical Product Manager — AI & Intelligent Platforms", logo: "/logos/hirevue-logo.svg" },
  { name: "Carrefour", role: "Tech Lead", logo: "/logos/carrefour.png" },
  { name: "IPNET", role: "Front-end Developer", logo: "/logos/ipnet-v2.png" },
  { name: "Webbiz.ie", role: "UI/UX Designer", logo: "/logos/webbix.png" },
  { name: "Stefanini", role: "Front-end Developer", logo: "/logos/stefanini-logo.png" },
];

export const learningGroups: AboutLearningGroup[] = [
  {
    category: "Produto",
    items: ["Gestao de Produtos | Udemy (2026)", "Gestao de Produto | Udemy (2026)", "Imersao Gestor do Futuro | Tetra (2026)"],
  },
  {
    category: "IA & Automacao",
    items: [
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
    ],
  },
];

export const aboutCtaIcon = BadgeCheck;
