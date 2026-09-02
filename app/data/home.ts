import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Code2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import {
  FigmaIcon,
  FirebaseIcon,
  GeminiIcon,
  GoogleAnalyticsIcon,
  JiraIcon,
  MakeIcon,
  N8nIcon,
  NextIcon,
  OpenAIIcon,
  ReactIcon,
  TypeScriptIcon,
  VercelIcon,
} from "../components/icons/BrandIcons";
import type {
  CaseItem,
  CompanyItem,
  ExpertiseItem,
  HighlightItem,
  NavItem,
  ProcessItem,
  SkillItem,
  StackItem,
  TimelineItem,
} from "../types/home";

export const navItems: NavItem[] = ["Inicio", "Sobre", "Cases", "Experiência", "Skill & Stack", "Contato"];

export const skills: SkillItem[] = [
  { label: "AI Product Management", icon: Sparkles },
  { label: "Technical PM", icon: BarChart3 },
  { label: "AI Agents", icon: Boxes },
  { label: "Automation", icon: RefreshCw },
];

export const expertise: ExpertiseItem[] = [
  {
    title: "Product Leadership",
    icon: BriefcaseBusiness,
    items: ["Roadmaps", "Discovery", "OKRs", "Growth", "Stakeholders", "Priorizacao"],
  },
  {
    title: "AI & Automation",
    icon: Sparkles,
    items: ["AI Agents", "Prompt Engineering", "LLMs", "OpenAI", "Make", "n8n"],
  },
  {
    title: "Technical Delivery",
    icon: Code2,
    items: ["Next.js", "React", "TypeScript", "APIs", "Analytics", "Architecture"],
  },
];

export const cases: CaseItem[] = [
  {
    title: "Intelligent Hiring Platform",
    badge: "HV",
    badgeClass: "bg-violet text-white",
    image: "/images/hirevue-case.png",
    description:
      "Evolucao de produtos orientados por IA para otimizar avaliacao de candidatos e apoiar decisoes de contratacao em escala.",
    stats: ["Produto digital", "Colaboracao global", "IA aplicada"],
    tags: ["AI", "Product", "Platform", "Strategy"],
  },
  {
    title: "Buscador Inteligente",
    badge: "AGU",
    badgeClass: "bg-slate-700 text-white",
    image: "/images/agu-case.png",
    description: "Aplicacao em Next.js para upload, organizacao e busca de documentos juridicos.",
    stats: ["Interface em Next.js", "Upload de PDFs", "Integracao com Elasticsearch"],
    tags: ["Next.js", "Busca", "Integracao", "Governo"],
  },
  {
    title: "Validacao de MVP Internacional",
    badge: "HB",
    badgeClass: "bg-dark text-white",
    image: "/images/case-houzz.png",
    description: "Validacao de MVP internacional para estudantes e moradia compartilhada.",
    stats: ["MVP validado", "Arquitetura escalavel", "Experiencia internacional"],
    tags: ["MVP", "UX", "Produto", "Irlanda"],
  },
];

export const companies: CompanyItem[] = [
  {
    name: "Carrefour",
    segment: "Varejo",
    context: "Produto • UX • Front-end",
    description:
      "Atuação em iniciativas digitais voltadas para experiência do cliente, interfaces de alto tráfego e evolução de produtos digitais.",
    logo: "/logos/carrefour.png",
  },
  {
    name: "Reclame Aqui",
    segment: "Consumer Tech",
    context: "Produto • Analytics • UX",
    description:
      "Evolução de produtos digitais, melhorias de experiência, instrumentação de métricas, integrações e iniciativas orientadas por dados.",
    logo: "/logos/reclame-aqui-v2.png",
  },
  {
    name: "HireVue",
    segment: "AI & HR Tech",
    context: "AI Product • TPM • Plataforma",
    description:
      "Atuação como Technical Product Manager na evolução de soluções de Inteligência Artificial aplicadas à avaliação de candidatos, descoberta de insights e tomada de decisão em recrutamento. Condução de iniciativas de discovery, roadmap, definição de requisitos técnicos e alinhamento entre produto, engenharia e negócio.",
    logo: "/logos/hirevue-logo.svg",
  },
  {
    name: "AGU",
    segment: "Governo Federal",
    context: "IA • Busca • Produto",
    description:
      "Contribuição no desenvolvimento de interface, upload de PDFs, experiência de busca e integrações do Buscador Inteligente.",
    logo: "/logos/agu.png",
  },
  {
    name: "SETUR",
    segment: "Turismo & Governo",
    context: "Produto • Estratégia • Experiência Digital",
    description:
      "Participação no Portal de Turismo — SETUR, com foco em frontend, experiência digital, busca e integração de dados.",
    logo: "/logos/porto-seguro-v2.png",
  },
  {
    name: "Webbix",
    segment: "Tech Startup",
    context: "MVP • Produto • UX",
    description:
      "Participação na concepção e validação do MVP HouzBuddy, contribuindo para produto, UX, identidade visual e experiência internacional.",
    logo: "/logos/webbix.png",
  },
];

export const timeline: TimelineItem[] = [
  { year: "2025 - 2026", role: "Technical Product Manager — AI & Intelligent Platforms", description: "HireVue" },
  { year: "2024 - 2025", role: "Technical Product Manager", description: "Reclame Aqui" },
  { year: "2022", role: "Front-end Developer", description: "IPNET by Vivo — AGU e SETUR" },
  { year: "2021", role: "Front-end Developer", description: "Stefanini" },
  { year: "2019 - 2021", role: "Front-end Developer → Tech Lead", description: "Carrefour" },
  { year: "2018", role: "UI/UX Designer", description: "Webbix — Irlanda" },
  { year: "2014 - 2018", role: "Designer → Senior Front-end Developer", description: "Agência DCS" },
];

export const process: ProcessItem[] = [
  { title: "Descoberta", description: "Entendo o problema e os usuarios.", icon: Search },
  { title: "Definicao", description: "Transformo oportunidades em estrategia.", icon: Target },
  { title: "Entrega", description: "Coordeno produto, design e engenharia.", icon: Code2 },
  { title: "Medicao", description: "Acompanho metricas e impacto.", icon: BarChart3 },
  { title: "Otimizacao", description: "Itero continuamente com dados.", icon: RefreshCw },
];

export const highlights: HighlightItem[] = [
  { title: "10+ anos", description: "em tecnologia e produtos digitais", icon: Boxes },
  { title: "Brasil", description: "experiencia profissional", icon: MapPin },
  { title: "Irlanda", description: "experiencia presencial", icon: MapPin },
  { title: "Estados Unidos", description: "atuacao remota", icon: Code2 },
];

export const stack: StackItem[] = [
  { name: "OpenAI", icon: OpenAIIcon },
  { name: "Gemini", icon: GeminiIcon },
  { name: "Make", icon: MakeIcon },
  { name: "n8n", icon: N8nIcon },
  { name: "Next.js", icon: NextIcon },
  { name: "React", icon: ReactIcon },
  { name: "TypeScript", icon: TypeScriptIcon },
  { name: "Firebase", icon: FirebaseIcon },
  { name: "GA4", icon: GoogleAnalyticsIcon },
  { name: "Vercel", icon: VercelIcon },
  { name: "Figma", icon: FigmaIcon },
  { name: "Jira", icon: JiraIcon },
];
