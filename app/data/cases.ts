import type { CaseStudy } from "../types/case";

export const cases: CaseStudy[] = [
  {
    slug: "case-agu",
    title: "Buscador Inteligente AGU.",
    category: "IA + Produto Interno",
    filterCategory: "IA",
    shortDescription: "Plataforma com busca e sumarizacao inteligente para documentos juridicos.",
    heroDescription:
      "Produto interno criado para organizar, consultar e apoiar a gestao de documentos juridicos, combinando busca estruturada, upload de arquivos e recursos de IA.",
    coverImage: "/images/agu-case.png",
    thumbnailImage: "/images/agu-case.png",
    tags: ["Next.js", "ElasticSearch", "AI", "UX", "DataGrid"],
    duration: "6 meses",
    role: "TPM / PM",
    squad: "8 pessoas",
    projectType: "Produto Interno",
    context:
      "A AGU precisava organizar e consultar uma grande quantidade de documentos juridicos internos de forma mais eficiente, garantindo rastreabilidade, seguranca e padronizacao das informacoes.",
    problem:
      "A consulta e organizacao dos documentos dependia de processos manuais e descentralizados, dificultando velocidade de acesso, consistencia dos dados e produtividade do time.",
    myRole:
      "Atuei conectando Produto, UX e Tecnologia para transformar uma necessidade operacional complexa em uma solucao escalavel e inteligente.",
    myRoleBullets: [
      "Discovery e entendimento profundo do contexto",
      "Definicao de escopo e priorizacao de funcionalidades",
      "Desenho de fluxos e experiencia do usuario",
      "Estruturacao de dados e metadados",
      "Acompanhamento tecnico e integracao com IA",
      "Validacao com usuarios e evolucao continua",
    ],
    process: [
      { title: "Discovery", description: "Entendimento das dores, processos e necessidades dos usuarios." },
      { title: "Mapeamento", description: "Jornadas, fluxos e regras de negocio." },
      { title: "Priorizacao", description: "Definicao de MVP e priorizacao por impacto e esforco." },
      { title: "Desenho", description: "Prototipos, UI e validacao dos fluxos principais." },
      { title: "Implementacao", description: "Desenvolvimento, integracoes e estrutura de dados." },
      { title: "Validacao", description: "Testes, feedbacks e evolucao com recursos de IA." },
    ],
    impact: [
      { title: "Mais organizacao", description: "Informacoes centralizadas e padronizadas." },
      { title: "Menos esforco manual", description: "Reducao significativa do tempo gasto em buscas e organizacao." },
      { title: "Mais agilidade", description: "Busca estruturada e filtros avancados para encontrar o que importa." },
      { title: "Base para IA", description: "Estrutura preparada para recursos de IA como sumarizacao e extracao." },
    ],
    tools: ["Next.js", "TypeScript", "Firebase", "MUI DataGrid", "Formik", "OpenAI", "Zod", "Tailwind CSS", "React Query", "GitHub"],
    learnings:
      "Esse projeto reforcou minha capacidade de atuar em ambientes complexos, traduzindo necessidades operacionais em produto digital escalavel, com visao tecnica, foco no usuario e potencial de aplicacao de IA para gerar impacto real.",
    quote:
      "A combinacao de produto, dados e IA e o que transforma informacao em inteligencia e operacao em resultado.",
  },
  {
    slug: "case-hirevue",
    title: "Intelligent Hiring Platform",
    category: "AI + Hiring Platform",
    filterCategory: "AI",
    shortDescription:
      "Evolucao de produtos orientados por IA para otimizar avaliacao de candidatos e apoiar decisoes de contratacao em escala.",
    heroDescription:
      "Evolucao de uma plataforma inteligente de recrutamento, conectando IA, produto e estrategia para apoiar avaliacoes de candidatos e decisoes de contratacao em escala.",
    coverImage: "/images/hirevue-case.png",
    thumbnailImage: "/images/hirevue-case.png",
    tags: ["AI", "Product", "Platform", "Strategy"],
    duration: "4 meses",
    role: "Technical Product Manager",
    squad: "6 pessoas",
    projectType: "AI Platform",
    context:
      "A plataforma precisava evoluir recursos orientados por IA para apoiar processos seletivos mais consistentes, escalaveis e claros para times de contratacao e candidatos.",
    problem:
      "A avaliacao de candidatos em escala exige velocidade, padronizacao e clareza, sem comprometer qualidade da decisao, experiencia do candidato e confianca dos stakeholders.",
    myRole:
      "Atuei conectando produto, IA e engenharia para evoluir fluxos, requisitos e experiencias de uma plataforma inteligente de recrutamento.",
    myRoleBullets: [
      "Mapeamento de oportunidades em fluxos de avaliacao",
      "Definicao de requisitos para experiencias orientadas por IA",
      "Priorizacao de melhorias para escala e clareza",
      "Alinhamento entre produto, design e engenharia",
      "Apoio na evolucao de plataforma e workflows",
      "Validacao de impacto na experiencia de usuarios",
    ],
    process: [
      { title: "Discovery", description: "Entendimento dos fluxos de recrutamento, avaliacao e tomada de decisao." },
      { title: "Mapeamento", description: "Organizacao de necessidades de usuarios, stakeholders e plataforma." },
      { title: "Priorizacao", description: "Definicao de oportunidades com foco em impacto, escala e viabilidade." },
      { title: "Entrega", description: "Acompanhamento de solucoes com design, engenharia e produto." },
      { title: "Evolucao", description: "Ajustes orientados por aprendizado e experiencia dos usuarios." },
    ],
    impact: [
      { title: "Mais precisao", description: "Avaliacao de candidatos com maior consistencia e apoio inteligente." },
      { title: "Menos tempo", description: "Fluxos otimizados para reduzir esforco operacional em processos seletivos." },
      { title: "Melhor experiencia", description: "Jornadas mais claras para candidatos e times de contratacao." },
      { title: "Mais escala", description: "Base de produto preparada para decisoes de contratacao em alto volume." },
    ],
    tools: ["AI", "Product Strategy", "Platform", "React", "TypeScript", "APIs", "Jira"],
    learnings:
      "Produtos de IA em recrutamento exigem equilibrio entre automacao, confianca, clareza de experiencia e alinhamento tecnico para gerar valor em escala.",
  },
  {
    slug: "case-ra-reviews",
    title: "Evolucao da experiencia RA Reviews.",
    category: "Consumer Tech + Produto",
    filterCategory: "UX",
    shortDescription: "Evolucao de experiencia, instrumentacao e priorizacao de melhorias em produto de reviews.",
    heroDescription:
      "Trabalho de evolucao em uma experiencia de reviews com alto impacto em confianca, tomada de decisao e relacionamento entre consumidores e marcas.",
    coverImage: "/images/ra-case.png",
    thumbnailImage: "/images/ra-case.png",
    tags: ["UX", "Analytics", "Front-End", "AI", "Produto", "Reviews", "B2C"],
    duration: "5 meses",
    role: "TPM / Product",
    squad: "7 pessoas",
    projectType: "Experiencia Digital",
    context:
      "Reviews sao parte central da confianca do consumidor. A experiencia precisava equilibrar clareza, utilidade, regras de negocio e necessidades das marcas.",
    problem:
      "A experiencia apresentava oportunidades de melhoria em leitura, descoberta e sinalizacao de valor, alem de pontos que precisavam ser melhor instrumentados para decisao.",
    myRole:
      "Atuei conectando necessidades de negocio, comportamento do usuario e viabilidade tecnica para priorizar melhorias com impacto real na experiencia.",
    myRoleBullets: [
      "Mapeamento da jornada de reviews",
      "Priorizacao de melhorias por valor",
      "Alinhamento com stakeholders",
      "Definicao de requisitos e criterios",
      "Acompanhamento tecnico das entregas",
      "Leitura de resultados e proximos passos",
    ],
    process: [
      { title: "Imersao", description: "Entendimento do produto, regras e dores dos usuarios." },
      { title: "Jornada", description: "Mapeamento de pontos de decisao e oportunidade." },
      { title: "Backlog", description: "Priorizacao orientada por valor e esforco." },
      { title: "Entrega", description: "Acompanhamento de discovery, design e tecnologia." },
      { title: "Evolucao", description: "Aprendizados para ciclos seguintes." },
    ],
    impact: [
      { title: "Mais confianca", description: "Experiencia mais clara para tomada de decisao." },
      { title: "Melhor leitura", description: "Informacoes organizadas para consumo rapido." },
      { title: "Backlog qualificado", description: "Priorizacao conectada a impacto e viabilidade." },
      { title: "Produto mensuravel", description: "Base mais clara para acompanhar resultados." },
    ],
    tools: ["Product Discovery", "Analytics", "Figma", "React", "TypeScript", "Jira"],
    learnings:
      "Em produtos de confianca, pequenas decisoes de experiencia podem alterar a percepcao de valor. O papel de produto e conectar essa sensibilidade ao delivery.",
  },
  {
    slug: "case-meliuz",
    title: "Reducao de friccao no browse in-app.",
    category: "Growth + Experiencia",
    filterCategory: "Growth",
    shortDescription: "Analise da jornada do usuario e experimentacao orientada por metricas para aumento da conversao.",
    heroDescription:
      "Iniciativa focada em reduzir atritos no fluxo de navegacao e compra dentro do app, conectando descoberta de produto, dados e experimentacao.",
    coverImage: "/images/case-meliuz.png",
    thumbnailImage: "/images/case-meliuz.png",
    tags: ["Product", "Growth", "Analytics", "UX", "Experimentacao"],
    duration: "4 meses",
    role: "Product Manager",
    squad: "6 pessoas",
    projectType: "Otimizacao",
    context:
      "O produto tinha uma jornada de browse com muitas decisoes pequenas, filtros, ofertas e transicoes que influenciavam diretamente conversao e retencao.",
    problem:
      "Parte dos usuarios abandonava a jornada antes de chegar a ofertas relevantes, indicando friccao de navegacao, falta de clareza e oportunidades de melhoria na descoberta.",
    myRole:
      "Conduzi a leitura do funil, priorizacao de hipoteses e alinhamento entre design, dados e engenharia para evoluir a experiencia de forma mensuravel.",
    myRoleBullets: [
      "Analise de funil e comportamento",
      "Mapeamento de pontos de friccao",
      "Priorizacao de hipoteses por impacto",
      "Definicao de eventos e metricas",
      "Acompanhamento de experimentos",
      "Iteracao com base em aprendizado",
    ],
    process: [
      { title: "Diagnostico", description: "Leitura de dados, funil e feedbacks qualitativos." },
      { title: "Hipoteses", description: "Organizacao das oportunidades por impacto esperado." },
      { title: "Experimentos", description: "Definicao de testes com metricas claras." },
      { title: "Entrega", description: "Acompanhamento de design, engenharia e release." },
      { title: "Medicao", description: "Analise dos resultados e aprendizados." },
    ],
    impact: [
      { title: "Mais clareza", description: "Jornada com menos ambiguidade para o usuario." },
      { title: "Menos abandono", description: "Reducao de atrito em etapas criticas." },
      { title: "Decisoes por dados", description: "Priorizacao conectada a metricas de negocio." },
      { title: "Ciclo de melhoria", description: "Base para experimentacao continua." },
    ],
    tools: ["Analytics", "Product Discovery", "Figma", "React", "TypeScript", "A/B Testing", "Jira"],
    learnings:
      "A combinacao de dados quantitativos, leitura da experiencia e alinhamento claro de hipoteses ajuda o time a evoluir produto com menos opiniao solta e mais aprendizado acumulado.",
  },
  {
    slug: "case-porto-seguro-setur",
    title: "Portal de Turismo de Porto Seguro.",
    category: "Governo + Experiencia Digital",
    filterCategory: "GovTech",
    shortDescription: "Estruturacao de produto digital para promocao turistica e comunicacao institucional.",
    heroDescription:
      "Projeto para apoiar a Secretaria de Turismo na estruturacao de uma plataforma digital voltada a promocao de destinos, experiencias e informacoes do municipio.",
    coverImage: "/images/map.png",
    thumbnailImage: "/images/map.png",
    tags: ["Produto", "UX", "Governo", "Conteudo", "Discovery"],
    duration: "3 meses",
    role: "Product Designer",
    squad: "5 pessoas",
    projectType: "Portal Publico",
    context:
      "A Secretaria de Turismo precisava organizar sua presenca digital e comunicar atrativos, servicos e informacoes de interesse para turistas e agentes locais.",
    problem:
      "As informacoes estavam dispersas e a experiencia nao favorecia uma navegacao simples para diferentes perfis de usuario, como turistas, moradores e parceiros.",
    myRole:
      "Atuei na estruturacao do produto, definicao de escopo, desenho da experiencia e alinhamento com stakeholders para transformar necessidade institucional em interface clara.",
    myRoleBullets: [
      "Entendimento de objetivos institucionais",
      "Organizacao de conteudo e arquitetura",
      "Definicao de fluxos principais",
      "Prototipacao da experiencia",
      "Alinhamento com stakeholders",
      "Suporte a entrega do produto",
    ],
    process: [
      { title: "Contexto", description: "Entendimento de publicos, objetivos e restricoes." },
      { title: "Arquitetura", description: "Organizacao de conteudo e prioridades." },
      { title: "Fluxos", description: "Definicao das jornadas principais." },
      { title: "Interface", description: "Desenho visual e componentes-chave." },
      { title: "Entrega", description: "Apoio ao time ate a implementacao." },
    ],
    impact: [
      { title: "Conteudo organizado", description: "Informacoes estruturadas por interesse do usuario." },
      { title: "Mais autonomia", description: "Base para comunicacao digital mais consistente." },
      { title: "Experiencia publica", description: "Navegacao pensada para acesso amplo." },
      { title: "Alinhamento institucional", description: "Produto conectado aos objetivos da secretaria." },
    ],
    tools: ["Figma", "Discovery", "UX Writing", "Arquitetura da Informacao", "Stakeholder Management"],
    learnings:
      "Projetos publicos exigem clareza, escuta e traducao de interesses diversos em uma experiencia simples. Produto tambem e capacidade de alinhamento.",
  },
  {
    slug: "case-houzbuddy",
    title: "HouzBuddy.",
    category: "MVP + Produto Internacional",
    filterCategory: "MVP",
    shortDescription: "Validacao de MVP internacional para estudantes e moradia compartilhada.",
    heroDescription:
      "MVP criado para validar uma proposta de moradia compartilhada para estudantes internacionais, conectando produto, UX e tecnologia em um contexto multicultural.",
    coverImage: "/images/case-houzz.png",
    thumbnailImage: "/images/case-houzz.png",
    tags: ["MVP", "UX", "Produto", "Irlanda", "Startup"],
    duration: "4 meses",
    role: "Product Designer",
    squad: "4 pessoas",
    projectType: "MVP",
    context:
      "Estudantes internacionais enfrentavam dificuldade para encontrar moradia confiavel, entender regras locais e reduzir riscos antes da chegada ao pais.",
    problem:
      "A jornada era fragmentada, com baixa confianca nas informacoes e pouca clareza sobre compatibilidade entre moradores, localizacao e requisitos praticos.",
    myRole:
      "Contribui para a definicao do MVP, desenho da experiencia e validacao da proposta com foco em clareza, confianca e rapidez de aprendizado.",
    myRoleBullets: [
      "Definicao de proposta de valor",
      "Mapeamento da jornada do estudante",
      "Priorizacao de funcionalidades de MVP",
      "Prototipacao de fluxos principais",
      "Validacao com usuarios",
      "Ajustes de experiencia e posicionamento",
    ],
    process: [
      { title: "Pesquisa", description: "Entendimento do contexto de estudantes internacionais." },
      { title: "Proposta", description: "Definicao do problema e valor central do MVP." },
      { title: "MVP", description: "Priorizacao do menor produto validavel." },
      { title: "Prototipo", description: "Fluxos de busca, perfil e match." },
      { title: "Validacao", description: "Coleta de feedback e refinamento." },
    ],
    impact: [
      { title: "MVP validado", description: "Proposta testada antes de escalar investimento." },
      { title: "Mais confianca", description: "Experiencia focada em seguranca e compatibilidade." },
      { title: "Aprendizado rapido", description: "Ciclo enxuto de descoberta e validacao." },
      { title: "Visao internacional", description: "Produto pensado para contexto multicultural." },
    ],
    tools: ["Figma", "Product Discovery", "UX Research", "MVP", "Branding", "Web"],
    learnings:
      "Validar um MVP internacional reforcou a importancia de reduzir incerteza cedo, testar a proposta com usuarios reais e tratar confianca como parte central do produto.",
  },
];
