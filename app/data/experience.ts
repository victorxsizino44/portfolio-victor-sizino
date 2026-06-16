import {
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Compass,
  Database,
  FileSpreadsheet,
  Flag,
  Gauge,
  Globe2,
  Landmark,
  Lightbulb,
  MapPin,
  MessageSquare,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  FigmaIcon,
  GeminiIcon,
  GoogleAnalyticsIcon,
  JiraIcon,
  OpenAIIcon,
} from "../components/icons/BrandIcons";

export type ExperienceMetric = {
  label: string;
  value: string;
  description: string;
  icon: typeof BriefcaseBusiness;
};

export type ImpactHighlight = {
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
};

export type ProfessionalExperience = {
  company: string;
  logo: string;
  role: string;
  period: string;
  workMode?: string;
  location: string;
  segment: string;
  context: string;
  responsibilities: string[];
  result: string;
  stack: string[];
  team: string;
  badge: string;
};

export type InternationalExperience = ProfessionalExperience & {
  featuredProject: string;
  projectDescription: string;
  learning: string;
  badges: string[];
};

export type SidebarSection = {
  title: string;
  items: string[];
  icon: typeof BriefcaseBusiness;
};

export const heroMetrics: ExperienceMetric[] = [
  {
    value: "+10",
    label: "anos de experiência",
    description: "",
    icon: BriefcaseBusiness,
  },
  {
    value: "+30",
    label: "Projetos entregues",
    description: "",
    icon: Rocket,
  },
  {
    value: "",
    label: "Experiência internacional",
    description: "",
    icon: Globe2,
  },
  {
    value: "",
    label: "Diversos segmentos",
    description: "",
    icon: Users,
  },
];

export const impactHighlights: ImpactHighlight[] = [
  { title: "+20", description: "Projetos digitais entregues", icon: BriefcaseBusiness },
  { title: "IA", description: "Produtos com IA Generativa & Automação", icon: BrainCircuit },
  { title: "Brasil e Irlanda", description: "Experiência internacional", icon: Globe2 },
  { title: "Privado + Governo", description: "Empresas privadas e Governo", icon: Landmark },
  { title: "Milhões", description: "Produtos que impactam milhões de usuários", icon: Rocket },
  { title: "Times", description: "Liderança de times multidisciplinares", icon: Users },
];

export const experiences: ProfessionalExperience[] = [
  {
    company: "Méliuz",
    logo: "/logos/meliuz.png",
    role: "AI Product Manager",
    period: "2023 — Atual",
    location: "Remoto",
    segment: "Fintech",
    context: "Plataforma de cashback e soluções financeiras com mais de 30 milhões de usuários.",
    responsibilities: [
      "Liderança de iniciativas de IA Generativa",
      "Discovery e validação de oportunidades",
      "Roadmap e priorização baseada em dados",
      "Definição de métricas e experimentos",
      "Gestão de stakeholders e comunicação",
    ],
    result:
      "Estruturei iniciativas de IA que impactaram a personalização de ofertas e aumentaram a eficiência operacional, gerando ganho significativo de conversão.",
    stack: ["OpenAI", "Gemini", "Python", "SQL", "Mixpanel", "Figma", "Jira", "Looker Studio"],
    team: "10 pessoas",
    badge: "IA Generativa",
  },
  {
    company: "Reclame Aqui",
    logo: "/logos/reclame-aqui-v2.png",
    role: "Product Manager",
    period: "2021 — 2023",
    location: "Remoto",
    segment: "Consumer Tech",
    context: "Plataforma referência em reputação online com mais de 26 milhões de usuários por mês.",
    responsibilities: [
      "Gestão de produtos B2B e B2C",
      "Evolução de funcionalidades e jornadas",
      "Análise de dados e definição de métricas",
      "Priorização de backlog",
      "Colaboração com times de tech e UX",
    ],
    result:
      "Evoluí produtos core da plataforma que fortaleceram a experiência do consumidor e aumentaram a confiança nas relações entre empresas e clientes.",
    stack: ["GA4", "SQL", "Jira", "Figma", "Hotjar", "Mixpanel"],
    team: "8 pessoas",
    badge: "Reputação & Experiência",
  },
  {
    company: "Carrefour Brasil",
    logo: "/logos/carrefour.png",
    role: "Product Manager",
    period: "2019 — 2021",
    location: "São Paulo, BR",
    segment: "E-commerce / Varejo",
    context: "E-commerce e marketplace com milhões de pedidos entregues anualmente.",
    responsibilities: [
      "Gestão de produto de ponta a ponta",
      "Jornadas digitais e experiência do cliente",
      "Definição de KPIs e OKRs",
      "Gestão de backlog e roadmap",
      "Alinhamento com áreas de negócio e tecnologia",
    ],
    result:
      "Liderei a evolução de jornadas digitais no e-commerce, aumentando a taxa de conversão e reduzindo atritos no processo de compra.",
    stack: ["GA4", "SQL", "Jira", "Figma", "Confluence", "Optimizely"],
    team: "12 pessoas",
    badge: "E-commerce",
  },
  {
    company: "SETUR — Porto Seguro",
    logo: "/logos/porto-seguro-v2.png",
    role: "Product Manager",
    period: "2018 — 2019",
    location: "Porto Seguro, BR",
    segment: "Governo / Turismo",
    context: "Portal oficial de turismo da cidade de Porto Seguro, desenvolvido em contexto de licitação pública.",
    responsibilities: [
      "Gestão de produto e projetos digitais",
      "Experiência do usuário e conteúdo",
      "Integração com stakeholders locais",
      "Definição de métricas e acompanhamento",
      "Organização de escopo e entregas",
    ],
    result:
      "Modernizei o portal de turismo, melhorando a experiência do visitante e aumentando o engajamento com conteúdos e serviços.",
    stack: ["WordPress", "GA4", "Jira", "Figma"],
    team: "6 pessoas",
    badge: "Turismo",
  },
  {
    company: "Advocacia-Geral da União",
    logo: "/logos/agu.png",
    role: "Product Owner",
    period: "2016 — 2018",
    location: "Brasília, BR",
    segment: "Governo",
    context: "Sistemas internos utilizados por servidores e órgãos públicos.",
    responsibilities: [
      "Gestão de backlog e requisitos",
      "Priorização de demandas",
      "Apoio na definição de soluções",
      "Acompanhamento de entregas",
      "Interface entre negócio e tecnologia",
    ],
    result:
      "Contribuí para a evolução de sistemas corporativos que aumentaram a eficiência operacional e a qualidade das informações.",
    stack: ["Jira", "Confluence", "SQL", "Excel"],
    team: "7 pessoas",
    badge: "Sistemas Corporativos",
  },
  {
    company: "Stefanini",
    logo: "",
    role: "Product Designer",
    period: "2015 — 2016",
    location: "São Paulo, BR",
    segment: "Consultoria / TI",
    context: "Projetos digitais para clientes de diferentes segmentos.",
    responsibilities: [
      "Design de interfaces e protótipos",
      "Pesquisa com usuários",
      "Criação de fluxos e jornadas",
      "Colaboração com devs e stakeholders",
      "Apoio na evolução de produtos digitais",
    ],
    result:
      "Desenvolvi experiências digitais focadas em usabilidade e valor para o usuário, contribuindo para a entrega de produtos de qualidade.",
    stack: ["Figma", "Sketch", "InVision", "Miro"],
    team: "5 pessoas",
    badge: "UX / UI",
  },
];

export const internationalExperiences: InternationalExperience[] = [
  {
    company: "HireVue",
    logo: "/logos/hirevue-logo.svg",
    role: "Technical Product Manager (AI & Intelligent Platforms)",
    period: "2025 — 2025",
    workMode: "Remoto",
    location: "Chicago, EUA",
    segment: "HR Tech",
    context: "Plataforma global de recrutamento com Inteligência Artificial.",
    featuredProject: "AI & Intelligent Platforms",
    projectDescription:
      "Plataforma global de recrutamento com Inteligência Artificial para avaliação de candidatos, geração de insights e apoio à tomada de decisão em processos seletivos.",
    learning:
      "Atuei conectando Produto, IA e Engenharia na construção de soluções escaláveis para recrutamento inteligente, aprofundando minha experiência em AI Product Strategy, arquitetura de produtos e workflows automatizados orientados por IA.",
    responsibilities: [],
    result: "",
    stack: [
      "Generative AI",
      "AI Product Strategy",
      "Technical Product Management",
      "React",
      "TypeScript",
      "APIs",
      "System Design",
      "Storybook",
      "XState",
      "Accessibility",
      "AI Workflows",
    ],
    team: "Time Global Multidisciplinar",
    badge: "AI & Intelligent Platforms",
    badges: ["Chicago, EUA", "Produto Internacional", "HR Tech"],
  },
  {
    company: "Webbix",
    logo: "/logos/webbix.png",
    role: "Product Manager",
    period: "2022 — 2023",
    location: "Dublin, Irlanda",
    segment: "PropTech",
    context: "Software house especializada em soluções digitais para o mercado imobiliário.",
    featuredProject: "HouzBuddy",
    projectDescription:
      "Plataforma que conecta corretores, proprietários e compradores, simplificando a jornada de compra e venda de imóveis.",
    learning:
      "Atuei em um ambiente internacional e multicultural, aprofundando minha visão de produto, metodologias ágeis e comunicação em inglês no dia a dia.",
    responsibilities: [],
    result: "",
    stack: ["React", "Node.js", "PostgreSQL", "Figma", "Jira", "AWS"],
    team: "6 pessoas",
    badge: "Produto Internacional",
    badges: ["Dublin, Irlanda", "Produto Internacional", "PropTech"],
  },
];

export const sidebarSummary = {
  text: "Minha trajetória combina estratégia de produto, tecnologia, dados e pessoas para gerar impacto real nos negócios e na vida dos usuários.",
  kpis: ["7+ anos de experiência", "20+ projetos entregues", "Brasil + Irlanda", "Diversos segmentos"],
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "Principais competências",
    icon: Target,
    items: [
      "Gestão de Produto",
      "Roadmap",
      "Discovery",
      "Métricas & KPIs",
      "Experimentação",
      "IA na Prática",
      "IA Generativa",
      "Stakeholders",
      "Comunicação",
      "Liderança",
      "Gestão de Times",
    ],
  },
  {
    title: "Segmentos de atuação",
    icon: ShieldCheck,
    items: ["Fintech", "E-commerce", "Governo", "Turismo", "Marketplace", "Consultoria", "Varejo"],
  },
];

export const tools = [
  { name: "Notion", icon: FileSpreadsheet },
  { name: "Figma", icon: FigmaIcon },
  { name: "Jira", icon: JiraIcon },
  { name: "Mixpanel", icon: ChartNoAxesCombined },
  { name: "GA4", icon: GoogleAnalyticsIcon },
  { name: "Looker Studio", icon: Gauge },
  { name: "SQL", icon: Database },
  { name: "Excel", icon: FileSpreadsheet },
  { name: "Hotjar", icon: BarChart3 },
  { name: "Miro", icon: Lightbulb },
  { name: "Confluence", icon: Compass },
  { name: "Slack", icon: MessageSquare },
  { name: "AWS", icon: Building2 },
  { name: "Optimizely", icon: Sparkles },
  { name: "WordPress", icon: Globe2 },
];

export const segmentIcons = {
  Fintech: CircleDollarSign,
  "E-commerce": ShoppingCart,
  Governo: Landmark,
  Turismo: Compass,
  Marketplace: Globe2,
  Consultoria: MessageSquare,
  Varejo: Flag,
};

export const floatingCards = [
  { title: "IA Generativa", description: "& Automação", icon: Bot },
  { title: "Estratégia", description: "Tecnologia Produto Impacto", icon: Target },
  { title: "Dados", description: "IA Pessoas", icon: Sparkles },
];
