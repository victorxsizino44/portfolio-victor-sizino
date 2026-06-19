import {
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CircleDollarSign,
  Compass,
  Database,
  Flag,
  Globe2,
  Landmark,
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
  AwsIcon,
  BigQueryIcon,
  ClaudeIcon,
  ConfluenceIcon,
  ElasticsearchIcon,
  FigmaIcon,
  FirebaseIcon,
  GeminiIcon,
  GoogleAnalyticsIcon,
  GithubIcon,
  HotjarIcon,
  JiraIcon,
  LookerStudioIcon,
  MakeIcon,
  MiroIcon,
  MixpanelIcon,
  N8nIcon,
  NextIcon,
  NotionIcon,
  OpenAIIcon,
  ReactIcon,
  SlackIcon,
  WordPressIcon,
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
  { title: "+40", description: "Projetos digitais entregues", icon: BriefcaseBusiness },
  { title: "IA", description: "Produtos com IA Generativa & Automação", icon: BrainCircuit },
  { title: "Experiência internacional", description: "Brasil, EUA e Irlanda", icon: Globe2 },
  { title: "Privado + Governo", description: "Empresas privadas e Governo", icon: Landmark },
  { title: "Milhões", description: "Produtos que impactam milhões de usuários", icon: Rocket },
  { title: "Times", description: "Liderança de times multidisciplinares", icon: Users },
];

export const experiences: ProfessionalExperience[] = [
  {
    company: "Agência DCS",
    logo: "/logos/dcs.png",
    role: "Designer Gráfico → Front-end Developer",
    period: "2014 — 2018",
    workMode: "Presencial",
    location: "Presencial",
    segment: "Marketing Digital & E-commerce",
    context:
      "Agência digital focada em comunicação, marketing e e-commerce, atuando em campanhas, websites e experiências digitais para clientes de diferentes segmentos.",
    responsibilities: [
      "Criação de campanhas digitais e materiais de comunicação",
      "Desenvolvimento de interfaces para websites e e-commerces",
      "Implementação responsiva utilizando HTML, CSS e JavaScript",
      "Tradução de requisitos de negócio em soluções digitais",
      "Garantia de consistência visual e experiência do usuário",
      "Colaboração entre áreas de criação, atendimento e tecnologia",
    ],
    result:
      "Evoluí de Designer Gráfico para Front-end Developer, construindo uma base sólida em design, tecnologia e experiência digital que sustentou minha futura atuação em Produto.",
    stack: ["Photoshop", "Illustrator", "JavaScript", "HTML5", "CSS3", "Sublime Text", "Trello", "Runrun.it"],
    team: "10 pessoas",
    badge: "Marketing & Experiência Digital",
  },
  {
    company: "Carrefour Brasil",
    logo: "/logos/carrefour.png",
    role: "Front-end Developer → Referência Técnica",
    period: "2019 — 2021",
    workMode: "Presencial / Híbrido",
    location: "São Paulo, Brasil",
    segment: "E-commerce Enterprise & Retail Digital",
    context:
      "Atuação na evolução de uma das maiores operações de e-commerce do Brasil, em um ambiente de alto tráfego, com foco em navegação, experiência do usuário, conversão, estabilidade e escalabilidade. Participação em iniciativas críticas para campanhas comerciais, especialmente durante períodos de grande volume, como Black Friday.",
    responsibilities: [
      "Evolução de componentes estratégicos da jornada de compra, como header global, carrosséis, vitrines e banners promocionais",
      "Criação de templates dinâmicos para páginas de campanha, aumentando a agilidade de publicação e adaptação a diferentes estratégias comerciais",
      "Participação na construção de uma Home especial de Black Friday, com foco em performance, estabilidade e suporte a alto volume de acessos",
      "Contribuição na implementação do novo e-commerce na plataforma VTEX, conectando tecnologias modernas com sistemas legados",
      "Apoio técnico ao time em decisões de implementação, organização técnica e boas práticas de desenvolvimento front-end",
      "Mentoria informal para desenvolvedores mais juniores, contribuindo para evolução coletiva do squad",
    ],
    result:
      "Contribuí para a evolução de uma operação digital de grande escala no varejo brasileiro, apoiando melhorias de experiência, campanhas comerciais e estabilidade em períodos críticos de tráfego, enquanto assumi papel de referência técnica dentro do time.",
    stack: [
      "SAP Hybris",
      "React",
      "JavaScript",
      "VTEX IO",
      "HTML5",
      "CSS3",
      "Sass",
      "REST APIs",
      "Git",
      "Bitbucket",
      "Jira",
      "Confluence",
      "Figma",
      "Google Analytics",
      "Adobe Analytics",
      "Scrum",
      "Kanban",
    ],
    team: "+100 mil colaboradores globalmente",
    badge: "E-commerce de alta escala",
  },
  {
    company: "Stefanini Group",
    logo: "/logos/stefanini-logo.png",
    role: "Front-end Engineer → Product-Oriented Engineer",
    period: "2021 — 2023",
    workMode: "Remoto / Híbrido",
    location: "Brasil",
    segment: "Varejo • Fintech • Indústria • Produtos Digitais",
    context:
      "Consultoria global de tecnologia atuando em projetos estratégicos para grandes empresas dos setores de varejo, fintech e indústria. Participação em squads multidisciplinares responsáveis pela evolução de produtos digitais, plataformas de monetização, experiências institucionais e soluções corporativas escaláveis.",
    responsibilities: [
      "Desenvolvimento e evolução de produtos digitais em ambientes de alta complexidade",
      "Tradução de requisitos de negócio em soluções técnicas escaláveis",
      "Colaboração direta com Product Managers, Designers, Tech Leads e stakeholders",
      "Participação em discovery, refinamentos técnicos e definição de entregas",
      "Construção de componentes e arquiteturas focadas em performance, manutenção e escalabilidade",
      "Garantia de consistência visual e experiência do usuário em diferentes plataformas",
      "Squad ADS — Via Varejo: evolução de plataforma de produtos patrocinados integrada a PromoteIQ e Percycle para retail media e monetização digital",
      "EBANX — via Gauge: construção do novo portal institucional com foco em SEO, performance e migração tecnológica de Vite para Next.js",
      "AkzoNobel — via Gauge: colaboração na construção de CMS customizado para gestão de conteúdo corporativo e componentes reutilizáveis",
    ],
    result:
      "Atuei em diferentes mercados e contextos de negócio, fortalecendo minha capacidade de conectar produto, tecnologia e stakeholders, além de desenvolver soluções escaláveis para varejo, fintech e plataformas corporativas.",
    stack: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Vite",
      "Git",
      "Jira",
      "Scrum",
      "Design Systems",
      "SEO",
      "Performance Web",
    ],
    team: "+100 mil colaboradores globalmente",
    badge: "Produtos Digitais",
  },
  {
    company: "IPNET by Vivo",
    logo: "/logos/ipnet-v2.png",
    role: "Technical Product Manager → Front-end/Product",
    period: "2023 — 2024",
    workMode: "Remoto / Híbrido",
    location: "Brasil",
    segment: "Governo Digital & Transformação Digital",
    context:
      "Atuação em squad multidisciplinar em projetos públicos e corporativos, participando do discovery e desenvolvimento de soluções digitais com foco em experiência do usuário, arquitetura de informação, busca inteligente e gestão de conteúdo.",
    responsibilities: [
      "Participação em Product Discovery, refinamento de requisitos e alinhamento com stakeholders",
      "Contribuição no desenvolvimento do Portal de Turismo de Porto Seguro, com foco em UX, gestão de conteúdo e arquitetura de informação",
      "Atuação no Buscador da AGU, colaborando na evolução da experiência de busca e interfaces integradas ao ElasticSearch",
      "Apoio em soluções envolvendo busca inteligente, processamento de dados e relevância das informações apresentadas ao usuário",
      "Colaboração com times de produto, design e engenharia para priorização de funcionalidades e melhorias contínuas",
      "Aplicação de background técnico para conectar necessidades de negócio, experiência do usuário e viabilidade de implementação",
    ],
    result:
      "Contribuí para produtos digitais de alta relevância em contextos públicos e corporativos, conectando produto, experiência e tecnologia para entregar soluções mais eficientes, escaláveis e orientadas à busca inteligente.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "ElasticSearch",
      "Tailwind CSS",
      "Design Systems",
      "Formulários e Validação",
      "Arquitetura Front-end",
      "Product Discovery",
      "UX/UI",
      "Jira",
      "Confluence",
      "Git",
      "APIs REST",
    ],
    team: "5 pessoas",
    badge: "Governo Digital & Busca Inteligente",
  },
  {
    company: "Reclame Aqui",
    logo: "/logos/reclame-aqui-v2.png",
    role: "Technical Product Manager",
    period: "2024 — 2025",
    workMode: "Remoto",
    location: "Remoto",
    segment: "Reputação Digital & Reviews",
    context:
      "Plataforma de alta escala focada em reputação digital, reviews e relacionamento entre consumidores e empresas, com grande volume de dados, interações e impacto direto na tomada de decisão dos usuários.",
    responsibilities: [
      "Liderança da evolução de produtos digitais de alta escala, conectando Produto, Engenharia, UX e Dados",
      "Definição e priorização de iniciativas para produtos de reviews, reputação digital e jornadas de avaliação",
      "Participação em iniciativas de Inteligência Artificial aplicadas à análise, organização e consumo de informações",
      "Apoio na definição de integrações, APIs, arquitetura de soluções e fluxos escaláveis",
      "Estruturação de métricas, observabilidade e acompanhamento de comportamento dos usuários",
      "Condução de discovery, validação de hipóteses, experimentação e lançamento de novas funcionalidades",
      "Apoio à adoção de automações e processos inteligentes para eficiência operacional e qualidade das entregas",
    ],
    result:
      "Contribuí para a evolução de produtos digitais de alta escala no Reclame Aqui, fortalecendo experiências de reviews, reputação digital e uso de Inteligência Artificial para apoiar decisões mais rápidas, contextualizadas e orientadas por dados.",
    stack: [
      "Vue.js",
      "TypeScript",
      "JavaScript",
      "REST APIs",
      "GraphQL",
      "GA4",
      "Analytics",
      "Design Systems",
      "Testing",
      "Performance",
      "Accessibility",
      "Product Discovery",
      "Generative AI",
      "AI Product Strategy",
      "Workflow Automation",
    ],
    team: "Squads multidisciplinares com Produto, Engenharia, UX, Dados e QA",
    badge: "Reviews Platform & AI Product Strategy",
  },
  {
    company: "HireVue",
    logo: "/logos/hirevue-logo.svg",
    role: "Technical Product Manager (AI & Intelligent Platforms)",
    period: "2025 — 2026",
    workMode: "Remoto",
    location: "Remote / Global Team",
    segment: "Recruitment Technology & AI",
    context:
      "Atuação como Technical Product Manager na evolução de produtos orientados por Inteligência Artificial em uma plataforma global de avaliação de candidatos, conectando produto, engenharia e negócio para desenvolver soluções escaláveis, inteligentes e centradas no usuário.",
    responsibilities: [
      "Liderança de Product Discovery para produtos digitais orientados por IA",
      "Definição de requisitos técnicos e funcionais para squads multidisciplinares",
      "Priorização de roadmap e refinamento de backlog",
      "Alinhamento entre stakeholders, produto, design e engenharia",
      "Participação em iniciativas de IA aplicada ao recrutamento",
      "Evolução de workflows inteligentes e automações de produto",
      "Contribuição para arquitetura de produto, integrações e fluxos escaláveis",
      "Evolução do Sidera Design System com foco em consistência, acessibilidade e eficiência",
      "Acompanhamento de indicadores de adoção, performance e sucesso das funcionalidades",
    ],
    result:
      "Contribuí para a evolução de produtos orientados por Inteligência Artificial em uma plataforma global de avaliação de candidatos, fortalecendo experiências escaláveis, automações inteligentes, design systems e jornadas mais eficientes para candidatos e recrutadores.",
    stack: [
      "React",
      "TypeScript",
      "APIs",
      "System Architecture",
      "Design Systems",
      "Storybook",
      "XState",
      "Testing",
      "Accessibility / ARIA",
      "AI-enabled Workflows",
      "Technical Product Management",
      "AI Product Strategy",
      "Generative AI",
      "Product Discovery",
      "Product Roadmap",
      "Workflow Automation",
      "System Design",
    ],
    team: "Remote / Global Team",
    badge: "International Experience",
  },
];

export const internationalExperiences: InternationalExperience[] = [
  {
    company: "Webbix",
    logo: "/logos/webbix.png",
    role: "Product Designer & Front-end Developer",
    period: "2018",
    workMode: "Presencial",
    location: "Dublin, Irlanda",
    segment: "Startup & EdTech / Housing Platform",
    context:
      "Participação na concepção do HouzBuddy, plataforma criada para auxiliar estudantes internacionais na busca por acomodações e na organização da rotina em residências compartilhadas. Atuação em um ambiente multicultural, contribuindo para a definição do MVP e validação das primeiras hipóteses de produto.",
    featuredProject: "HouzBuddy",
    projectDescription:
      "Plataforma criada para auxiliar estudantes internacionais na busca por acomodações e na organização da rotina em residências compartilhadas, com foco em MVP, Product Discovery e validação inicial de hipóteses.",
    learning:
      "Contribuí para a estruturação inicial do HouzBuddy, participando desde a ideação até as primeiras implementações do produto. A experiência fortaleceu minha visão de produto, UX e tecnologia, além de desenvolver habilidades de colaboração multicultural e construção de soluções digitais desde o estágio de MVP.",
    responsibilities: [
      "Participação na definição das funcionalidades essenciais para o MVP",
      "Criação de wireframes, fluxos de navegação e protótipos interativos",
      "Colaboração na construção da identidade visual do produto",
      "Apoio à validação de hipóteses e testes iniciais de usabilidade",
      "Implementação de interfaces utilizando React.js, HTML e CSS",
      "Alinhamento entre design e desenvolvimento para acelerar entregas",
      "Colaboração com equipe internacional em ambiente ágil",
    ],
    result:
      "Contribuí para a estruturação inicial do HouzBuddy, participando desde a ideação até as primeiras implementações do produto. A experiência fortaleceu minha visão de produto, UX e tecnologia, além de desenvolver habilidades de colaboração multicultural e construção de soluções digitais desde o estágio de MVP.",
    stack: [
      "React.js",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Illustrator",
      "InVision",
      "Trello",
      "Git",
      "UX Research",
      "Wireframing",
      "Prototyping",
      "Product Discovery",
      "Design Thinking",
    ],
    team: "10 pessoas",
    badge: "Product Discovery & MVP",
    badges: ["Dublin, Irlanda", "International Experience", "MVP"],
  },
  {
    company: "HireVue",
    logo: "/logos/hirevue-logo.svg",
    role: "Technical Product Manager (AI & Intelligent Platforms)",
    period: "2025 — 2026",
    workMode: "Remoto",
    location: "Remote / Global Team",
    segment: "Recruitment Technology & AI",
    context:
      "Atuação como Technical Product Manager na evolução de produtos orientados por Inteligência Artificial em uma plataforma global de avaliação de candidatos, conectando produto, engenharia e negócio para desenvolver soluções escaláveis, inteligentes e centradas no usuário.",
    featuredProject: "AI & Intelligent Platforms",
    projectDescription:
      "Liderança da evolução de produtos orientados por Inteligência Artificial em uma plataforma global de avaliação de candidatos, conectando produto, engenharia e negócio para desenvolver experiências escaláveis, inteligentes e centradas no usuário.",
    learning:
      "A experiência consolidou minha atuação em AI Product Management, Technical Product Management, Product Strategy, Design Systems e colaboração cross-functional em contexto global.",
    responsibilities: [
      "Liderança de Product Discovery para produtos digitais orientados por IA",
      "Definição de requisitos técnicos e funcionais para squads multidisciplinares",
      "Priorização de roadmap e refinamento de backlog",
      "Alinhamento entre stakeholders, produto, design e engenharia",
      "Participação em iniciativas de IA aplicada ao recrutamento",
      "Evolução de workflows inteligentes e automações de produto",
      "Contribuição para arquitetura de produto, integrações e fluxos escaláveis",
      "Evolução do Sidera Design System com foco em consistência, acessibilidade e eficiência",
      "Acompanhamento de indicadores de adoção, performance e sucesso das funcionalidades",
    ],
    result:
      "Contribuí para a evolução de produtos orientados por Inteligência Artificial em uma plataforma global de avaliação de candidatos, fortalecendo experiências escaláveis, automações inteligentes, design systems e jornadas mais eficientes para candidatos e recrutadores.",
    stack: [
      "React",
      "TypeScript",
      "APIs",
      "System Architecture",
      "Design Systems",
      "Storybook",
      "XState",
      "Testing",
      "Accessibility / ARIA",
      "AI-enabled Workflows",
    ],
    team: "Remote / Global Team",
    badge: "International Experience",
    badges: [
      "Estados Unidos / USA",
      "AI Product Management",
      "Technical Product Management",
      "Global Product",
      "Recruitment Technology",
      "Candidate Experience",
    ],
  },
];
export const sidebarSummary = {
  text: "Minha trajetória combina estratégia de produto, tecnologia, dados e pessoas para gerar impacto real nos negócios e na vida dos usuários.",
  kpis: ["10+ anos de experiência", "40+ projetos entregues", "Brasil + EUA + Irlanda", "Diversos segmentos"],
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "Principais competências",
    icon: Target,
    items: [
      "Gestão de Produto",
      "Product Strategy",
      "Product Discovery",
      "Roadmap",
      "Technical Product Management",
      "Front-end Architecture",
      "Solution Architecture",
      "Métricas & KPIs",
      "Experimentação",
      "AI Products",
      "Automação & Agentes",
      "Stakeholder Management",
      "UX & Product Design",
    ],
  },
  {
    title: "Segmentos de atuação",
    icon: ShieldCheck,
    items: ["Fintech", "E-commerce", "Governo", "Turismo", "Marketplace", "Consultoria", "Varejo"],
  },
];

export const tools = [
  { name: "Notion", icon: NotionIcon },
  { name: "Jira", icon: JiraIcon },
  { name: "Figma", icon: FigmaIcon },
  { name: "Mixpanel", icon: MixpanelIcon },
  { name: "GA4", icon: GoogleAnalyticsIcon },
  { name: "SQL", icon: Database },
  { name: "Hotjar", icon: HotjarIcon },
  { name: "Confluence", icon: ConfluenceIcon },
  { name: "Miro", icon: MiroIcon },
  { name: "AWS", icon: AwsIcon },
  { name: "Slack", icon: SlackIcon },
  { name: "WordPress", icon: WordPressIcon },
  { name: "Looker Studio", icon: LookerStudioIcon },
  { name: "ChatGPT", icon: OpenAIIcon },
  { name: "Gemini", icon: GeminiIcon },
  { name: "Claude", icon: ClaudeIcon },
  { name: "n8n", icon: N8nIcon },
  { name: "Make", icon: MakeIcon },
  { name: "Firebase", icon: FirebaseIcon },
  { name: "Next.js", icon: NextIcon },
  { name: "ReactJS", icon: ReactIcon },
  { name: "GitHub", icon: GithubIcon },
  { name: "BigQuery", icon: BigQueryIcon },
  { name: "Elasticsearch", icon: ElasticsearchIcon },
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
