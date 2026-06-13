import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Code2,
  MapPin,
  PackageCheck,
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

export const navItems: NavItem[] = ["Inicio", "Sobre", "Cases", "Experiencia", "Stack", "Contato"];

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
    title: "Otimizacao de Conversao",
    badge: "m",
    badgeClass: "bg-pink-500 text-white",
    image: "/images/case-meliuz.png",
    description: "Analise da jornada do usuario e experimentacao orientada por metricas para aumento da conversao.",
    stats: ["+18% retencao", "+12% conversao"],
    tags: ["Product", "Growth", "Analytics", "Experimentacao"],
  },
  {
    title: "Buscador Inteligente",
    badge: "AGU",
    badgeClass: "bg-slate-700 text-white",
    image: "/images/case-agu.png",
    description: "Plataforma com busca e sumarizacao inteligente para documentos juridicos.",
    stats: ["70% menos tempo de busca", "Controle de acesso seguro", "Consulta inteligente"],
    tags: ["IA", "Busca", "Produto", "Governo"],
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
    name: "Méliuz",
    segment: "Fintech",
    context: "Growth • Produto • Experimentação",
    description:
      "Projeto focado em otimização de conversão, análise de comportamento do usuário e melhoria da jornada digital.",
    logo: "/logos/meliuz.png",
  },
  {
    name: "IPNET",
    segment: "Tecnologia",
    context: "TPM • Produto • Tecnologia",
    description:
      "Atuação como Technical Product Manager em iniciativas digitais, plataformas corporativas e projetos de transformação digital.",
    logo: "/logos/ipnet-v2.png",
  },
  {
    name: "AGU",
    segment: "Governo Federal",
    context: "IA • Busca • Produto",
    description:
      "Liderança na construção do Buscador Inteligente, solução de busca e sumarização de documentos utilizando tecnologia e IA.",
    logo: "/logos/agu.png",
  },
  {
    name: "SETUR",
    segment: "Turismo & Governo",
    context: "Produto • Estratégia • Experiência Digital",
    description:
      "Projeto desenvolvido através de licitação pública para a Secretaria de Turismo de Porto Seguro. Atuação na estruturação do produto digital, definição de escopo, alinhamento de stakeholders e desenho da experiência da plataforma voltada à promoção turística do município.",
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
  { year: "2025 - 2026", role: "AI Technical Product Manager", description: "IA, automacao e produtos digitais" },
  {
    year: "2024 - 2025",
    role: "Technical Product Manager (AI & Digital Experience) / Front-end Engineer",
    description: "Reclame Aqui",
  },
  { year: "2023 - 2024", role: "Product Designer", description: "IPNET - AGU - Porto Seguro" },
  { year: "2019 - 2021", role: "Front-End Developer & Technical Lead", description: "Carrefour" },
  { year: "2018", role: "Product Designer", description: "Webbix - Irlanda" },
];

export const process: ProcessItem[] = [
  { title: "Descoberta", description: "Entendo o problema e os usuarios.", icon: Search },
  { title: "Definicao", description: "Transformo oportunidades em estrategia.", icon: Target },
  { title: "Entrega", description: "Coordeno produto, design e engenharia.", icon: Code2 },
  { title: "Medicao", description: "Acompanho metricas e impacto.", icon: BarChart3 },
  { title: "Otimizacao", description: "Itero continuamente com dados.", icon: RefreshCw },
];

export const highlights: HighlightItem[] = [
  { title: "5+ anos", description: "em tecnologia", icon: Boxes },
  { title: "20+ projetos", description: "entregues", icon: PackageCheck },
  { title: "Produto - IA - Engenharia", description: "visao multidisciplinar", icon: Code2 },
  { title: "Experiencia", description: "ponta a ponta", icon: MapPin },
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
