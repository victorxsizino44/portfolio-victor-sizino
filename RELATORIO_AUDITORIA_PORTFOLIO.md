# Relatório de Auditoria do Portfólio

Auditoria realizada em 18/06/2026 no projeto `portfolio-victor-sizino`, localizado em `C:\Users\victo\Documents\portfoliio victor`.

Escopo: análise técnica, funcional, visual, estrutural, responsiva, acessível, SEO, integrações, conteúdo, assets e prontidão para preenchimento final. Nenhum código foi alterado.

## 1. Visão Geral do Projeto

O projeto é um portfólio profissional construído com Next.js App Router, React, TypeScript e Tailwind CSS. A proposta visual está alinhada a um posicionamento claro, premium e minimalista, com foco em recrutadores, heads de produto e tecnologia.

O produto digital apresenta Victor Sizino como `AI Product Manager | Technical Product Manager | Product Manager`, com seções para home, sobre, experiência, stack, cases, contato e um chat interativo chamado Agente R.

Principais achados:

- O build de produção foi executado com sucesso usando `npm.cmd run build`.
- O App Router gerou rotas estáticas para home, about, cases, contato, experiência, stack e páginas de detalhe dos cases.
- A API `/api/agente-r` é dinâmica e depende da variável `MAKE_AGENT_R_WEBHOOK_URL`.
- O script de lint atual não funciona em Next 16 porque usa `next lint`, e o ESLint 9 instalado não reconhece `.eslintrc.json` sem migração para `eslint.config.js`.
- A estrutura separa páginas, componentes, dados, tipos e assets de forma razoavelmente clara.
- Há muitos textos ainda com aparência de rascunho, placeholders ou métricas que precisam de validação antes da publicação.
- Há inconsistências de contato e links externos: alguns componentes usam `contato@victorsizino.com`, outros usam `victor@victorsizino.com.br`, e alguns links de LinkedIn apontam para a home genérica do LinkedIn.

## 2. Stack Utilizada

- Next.js: `latest`, identificado no build como `16.2.7`.
- React: `latest`.
- React DOM: `latest`.
- TypeScript: `latest`, com `strict: true`.
- Tailwind CSS: `latest`, com tokens customizados em `tailwind.config.ts` e variáveis em `app/globals.css`.
- Lucide React: biblioteca de ícones principal.
- PostCSS, Autoprefixer e ESLint como ferramentas de desenvolvimento.

Scripts em `package.json`:

- `dev`: `next dev --webpack`.
- `build`: `next build --webpack`.
- `start`: `next start`.
- `lint`: `next lint` (não funciona com a versão atual do Next).

## 3. Estrutura de Pastas e Arquivos

Pastas principais:

- `.git/`: controle de versão.
- `.next/`: saída local de build/desenvolvimento do Next.js.
- `app/`: núcleo do produto, contendo rotas, componentes, dados, tipos, estilos globais e API route.
- `app/api/agente-r/`: endpoint server-side do Agente R.
- `app/components/`: componentes agrupados por domínio: `home`, `about`, `experience`, `stack`, `cases`, `icons`.
- `app/data/`: dados estruturados em TypeScript para home, about, experience, stack e cases.
- `app/lib/`: funções utilitárias de domínio, hoje focadas em cases.
- `app/types/`: tipos compartilhados para home, about e cases.
- `public/`: imagens, logos e `agent-r-knowledge.json`.
- `node_modules/`: dependências instaladas.

Arquivos de configuração:

- `package.json`: scripts e dependências.
- `package-lock.json`: lockfile.
- `next.config.js`: configuração vazia do Next.
- `tailwind.config.ts`: cores e sombras customizadas.
- `postcss.config.js`: configuração PostCSS.
- `tsconfig.json`: TypeScript com `strict`, `resolveJsonModule`, `moduleResolution: bundler`.
- `.eslintrc.json`: configuração antiga de ESLint/Next, hoje incompatível com ESLint 9 sem migração.
- `.env.example` e `.env.local`: contêm a variável `MAKE_AGENT_R_WEBHOOK_URL`.
- `next-env.d.ts`: tipos gerados pelo Next.
- `app/globals.css`: estilos globais, tokens Tailwind v4 via `@theme`, classes utilitárias customizadas e media queries.
- `app/layout.tsx`: layout raiz e metadata global.
- `app/icon.svg`: favicon/ícone do app.

Organização:

- Páginas ficam em `app/<rota>/page.tsx`.
- Componentes são separados por contexto visual/funcional.
- Dados ficam centralizados em `app/data`, mas a página de contato mantém seus arrays locais no próprio `page.tsx`.
- Tipos ficam em `app/types`, exceto tipos de experiência e stack, que estão declarados nos próprios arquivos de dados.
- Assets ficam em `public/images` e `public/logos`.

Pontos positivos:

- Separação clara por domínio.
- Uso consistente de `next/image`.
- Uso de Server Components por padrão, com Client Components somente em áreas interativas.
- Dados de cases, experiência, stack e about centralizados.
- Tipagem forte nos modelos principais.
- Build de produção funcionando.

Riscos de manutenção:

- Muitos textos de produto e métricas estão espalhados em arquivos diferentes, inclusive contato.
- `app/globals.css` está grande e mistura tokens, padrões globais e estilos específicos de componentes.
- Dados de contato estão duplicados e divergentes.
- Links externos ainda genéricos ou provisórios.
- O lint não está operacional.
- Cases dependem de campos obrigatórios manuais sem validação de schema.
- Algumas imagens são grandes demais para o uso real; outras são pequenas demais para hero/detalhe.

## 4. Mapa de Rotas e Páginas

Rotas detectadas no build:

- `/`
- `/about`
- `/cases`
- `/cases/[slug]`
- `/cases/case-agu`
- `/cases/case-meliuz`
- `/cases/case-ra-reviews`
- `/cases/case-porto-seguro-setur`
- `/cases/case-houzbuddy`
- `/contato`
- `/experiencia`
- `/stack`
- `/api/agente-r`
- `/_not-found`
- `/icon.svg`

### `/` - Home

Arquivo: `app/page.tsx`.

Componentes usados:

- `Header`
- `HeroSection`
- `AboutSection`
- `ExpertiseSection`
- `CasesSection`
- `CompaniesSection`
- `ExperienceSection`
- `AgentRSection`
- `StackContactSection`
- `Footer`

Objetivo: apresentar Victor, posicionamento profissional, especialidades, cases, empresas, trajetória, Agente R e CTA de contato.

Estrutura visual:

- Layout claro em `bg-canvas`.
- Container padrão `max-w-[1096px]`.
- Header fixo visualmente no topo da seção, mas não sticky.
- Hero com texto à esquerda e imagem à direita.
- Cards limpos, bordas `border-line`, sombras leves e acento roxo.

Seções:

- Hero: "Ola, eu sou", "Victor Sizino.", "AI Technical Product Manager".
- Badges: AI Product Management, Technical PM, AI Agents, Automation.
- Sobre + expertise.
- Cases de impacto.
- Empresas.
- Experiência.
- Agente R.
- CTA de contato/stack.

CTAs:

- `Ver Cases` -> `#cases`.
- `Conversar com Agente R` -> `#agente-r`.
- `Baixar CV` -> `/victor-sizino-cv.pdf`.
- `Ver todos os cases` -> `/cases`.
- CTA de contato -> `mailto:contato@victorsizino.com`.

Dados:

- Vêm de `app/data/home.ts` e `app/data/cases.ts`.
- Alguns textos ficam hardcoded nos componentes, especialmente `HeroSection`, `StackContactSection`, `AgentRSection` e `Footer`.

Pontos para preencher/revisar:

- Validar se `/victor-sizino-cv.pdf` existe; não apareceu no `rg --files`.
- Trocar textos sem acento por versões finais em português correto.
- Validar métricas: `5+ anos`, `20+ projetos`, `+18% retencao`, `+12% conversao`, etc.
- Atualizar e-mails e links sociais.
- Confirmar se o Agente R deve chamar "MIB" e se isso combina com o tom profissional.

Riscos ao adicionar conteúdo:

- Cards de cases usam line clamp e altura fixa; descrições longas serão cortadas.
- Badges de skill no mobile usam `truncate`; labels muito longos serão abreviados.
- O grid de empresas com 7 colunas pode ficar apertado com nomes/logos novos.

### `/about` - Sobre

Arquivo: `app/about/page.tsx`.

Componentes usados:

- `Header`
- `AboutHero`
- `AboutDifferentials`
- `AboutImpact`
- `AboutJourney`
- `AboutCompanies`
- `AboutLearning`
- `AboutCTA`
- `Footer`

Objetivo: apresentar narrativa profissional, diferenciais, impacto, jornada, empresas e formação.

Seções:

- Hero com imagem `victor-hero-v2.png` e badges flutuantes.
- Diferenciais: Mentalidade de Produto, Visão Técnica, Design & UX, IA na Prática.
- Impacto em métricas.
- Jornada profissional/timeline.
- Empresas.
- Aprendizados/formações.
- CTA para cases e contato.

Metadata:

- Title: `Sobre | Victor Sizino`.
- Description focada em AI Product Manager e TPM.

Pontos para preencher/revisar:

- Checar consistência temporal: about fala `10+ anos`, stack fala `12+ anos`, home fala `5+ anos`.
- Validar empresas sem logo: HireVue, Mold3, Stefanini.
- CTA `href="/#contato"` aponta para uma âncora que não existe na home; há rota `/contato`.
- Link LinkedIn em `AboutHero` aponta para `https://www.linkedin.com/`, não para o perfil.

Riscos:

- Badges flutuantes dependem de posições CSS manuais.
- Formação/certificações futuras podem exigir layout mais flexível.

### `/experiencia` - Experiência

Arquivo: `app/experiencia/page.tsx`.

Componentes usados:

- `Header`
- `ExperienceHero`
- `ImpactHighlights`
- `ExperienceSidebar`
- `ExperienceTimeline`
- `InternationalExperience`
- `ExperienceCTA`
- `Footer`

Objetivo: documentar experiências nacionais e internacionais, segmentos, ferramentas, competências e resultados.

Seções:

- Hero com imagem e métricas.
- Highlights de impacto.
- Sidebar com resumo, competências, segmentos, ferramentas, mapa e CTA.
- Timeline de experiências expansíveis.
- Experiência internacional.
- CTA final.

Dados:

- `app/data/experience.ts`.

CTAs:

- `/cases`
- `mailto:contato@victorsizino.com`
- links internos para `#minha-trajetoria`, `#webbix`, `#hirevue`.

Pontos para preencher/revisar:

- Datas e cargos parecem precisar de validação final: exemplos incluem Méliuz `2023 — Atual`, Reclame Aqui `2021 — 2023`, Carrefour `2019 — 2021`, HireVue `2025 — 2025`.
- Alguns `heroMetrics` têm `value` vazio.
- E-mail diverge da página de contato.
- Resultados estão fortes, mas alguns parecem genéricos e precisam de evidência.

Riscos:

- `ExperienceCard` gera IDs a partir do nome da empresa removendo caracteres não ASCII; nomes acentuados podem gerar IDs menos previsíveis.
- Cards expansíveis podem ficar muito longos em mobile com responsabilidades extensas.

### `/stack` - Stack & Skills

Arquivo: `app/stack/page.tsx`.

Componentes usados:

- `Header`
- `StackHero`
- `StackStats`
- `ProficiencyLegend`
- `CoreCompetencies`
- `StackCategoryCard`
- `CertificationsSection`
- `ValueSection`
- `StackCTA`
- `Footer`

Objetivo: apresentar competências, stacks, níveis de proficiência, certificações e proposta de valor.

Dados:

- `app/data/stack.ts`.
- A página ordena categorias manualmente por `orderedCategoryTitles`.

Pontos para preencher/revisar:

- Certificações atuais têm apenas três itens e parecem parciais.
- Níveis `Expert`, `Advanced`, `Intermediate`, `Basic` devem ser validados com critério.
- `StackCTA` aponta para `/#contato`, âncora inexistente.

Riscos:

- Se uma categoria nova for adicionada em `stackCategories`, ela não aparece se não for incluída em `orderedCategoryTitles`.
- Alguns cards têm muitos chips; em mobile podem ficar longos.

### `/cases` - Lista de Cases

Arquivo: `app/cases/page.tsx`.

Componentes usados:

- `Header`
- `CasesSection`
- `StackContactSection`
- `Footer`

Objetivo: listar todos os cases cadastrados.

Dados:

- `app/data/cases.ts` via `getAllCases()`.

Estrutura:

- Reaproveita `CasesSection` com `limit={Number.POSITIVE_INFINITY}`, sem link "Ver todos".
- Cards usam imagem de capa com overlay escuro, badge, título, descrição, impactos e tags.

Pontos para preencher/revisar:

- Os cases precisam de imagens em proporção mais adequada e resolução maior.
- Validar filtros/categorias; hoje não há UI de filtro apesar de existir `filterCategory`.

Riscos:

- `Number.POSITIVE_INFINITY` funciona para `slice`, mas é menos expressivo do que omitir o limite ou tratar `undefined`.
- Cards têm altura fixa de 376px; mais impacto/tag será cortado.

### `/cases/[slug]` - Detalhe de Case

Arquivo: `app/cases/[slug]/page.tsx`.

Componentes usados:

- `Header`
- `CaseHero`
- `CaseMeta`
- `CaseSectionCard`
- `CaseProcess`
- `CaseImpact`
- `CaseStack`
- `CaseQuote`
- `CaseAccordionMobile`
- `CaseNavigation`
- `Footer`

Objetivo: exibir estudo de caso completo por slug.

Slugs atuais:

- `case-agu`
- `case-meliuz`
- `case-ra-reviews`
- `case-porto-seguro-setur`
- `case-houzbuddy`

Estrutura:

- `generateStaticParams()` gera páginas estáticas para todos os cases.
- `generateMetadata()` usa título e `heroDescription` do case.
- Desktop usa cards em grid.
- Mobile troca seções por acordeão.

Pontos para preencher/revisar:

- Imagens de capa usam `alt=""`; se forem puramente decorativas, ok, mas em página de case normalmente vale alt descritivo.
- `CaseHero` solicita render `width={960}` e `height={560}`, mas algumas imagens têm apenas ~285x243.
- Alguns aprendizados e impactos estão genéricos; precisam de evidências, números ou contexto.

Riscos:

- Campos obrigatórios são muitos; adicionar case incompleto quebra a experiência ou a narrativa.
- Tags e tools longos podem sobrecarregar os chips.

### `/contato` - Contato

Arquivo: `app/contato/page.tsx`.

Tipo: Client Component completo.

Objetivo: concentrar canais de contato, agenda visual, formulário mockado, disponibilidade, CTA para Agente R e expectativas.

Componentes usados:

- `Header`
- `Footer`
- `Image`
- Ícones Lucide.

Estados internos:

- `form`: nome, empresa, e-mail, tipo, mensagem.
- `submitted`: exibe aviso de mensagem preparada.
- `copiedEmail`: muda texto do botão de copiar e-mail.

Interações:

- Copiar e-mail via `navigator.clipboard`.
- Submit do formulário impede envio real e mostra feedback local.
- Links para LinkedIn, WhatsApp e mailto.

Dados hardcoded:

- `contactCards`
- `availability`
- `expectations`
- `weekDays`
- `calendarDays`
- `initialForm`
- Calendário visual fixo: `Junho 2025`.

Pontos para preencher/revisar:

- Formulário não envia mensagem real.
- Agenda é estática e mostra Junho 2025.
- E-mail principal: `victor@victorsizino.com.br`.
- Outros componentes usam `contato@victorsizino.com`.
- Telefone/WhatsApp precisa de validação final.
- A imagem de hero é a mesma do restante do site.

Riscos:

- Sem validação obrigatória no formulário.
- `navigator.clipboard` pode falhar fora de contexto seguro ou sem permissão.
- Calendário estático pode parecer quebrado depois da publicação.

### `/api/agente-r`

Arquivo: `app/api/agente-r/route.ts`.

Objetivo: receber `{ question }`, validar e encaminhar para webhook Make.

Variável necessária:

- `MAKE_AGENT_R_WEBHOOK_URL`

Fluxo:

1. Lê variável de ambiente.
2. Valida JSON.
3. Valida `question`.
4. Faz `fetch` POST para o webhook.
5. Espera resposta em texto.
6. Retorna `{ answer }` para o front.

Riscos:

- Logs expõem se a URL existe e também imprimem a URL configurada no servidor.
- Não há rate limit.
- Não há timeout explícito.
- Não há autenticação ou proteção anti-spam.
- `agent-r-knowledge.json` não é usado diretamente no código da API; o conhecimento precisa estar no Make ou em outro fluxo externo.

## 5. Componentes do Projeto

### Componentes globais/home

`Header` - `app/components/home/Header.tsx`

- Usado em todas as páginas principais.
- Client Component.
- Responsável por logo, navegação desktop e menu mobile.
- Estado: `isOpen`.
- Usa `usePathname()` para estado ativo.
- Interações: abrir/fechar menu mobile.
- Classes principais: `max-w-[1096px]`, `border-b`, `md:flex`, botão mobile `fixed`.
- Sugestões: centralizar rotas em objeto em vez de condicionais; fechar menu em mudança de rota; revisar labels com acentuação final.
- Reutilização: alta, mas acoplado a `navItems` e rotas hardcoded.

`Footer` - `app/components/home/Footer.tsx`

- Usado nas páginas.
- Responsável por rodapé simples.
- Links: LinkedIn genérico e e-mail `contato@victorsizino.com`.
- Sugestão: corrigir LinkedIn e padronizar e-mail.

`HeroSection` - `app/components/home/HeroSection.tsx`

- Usado na home.
- Server Component.
- Responsável pela primeira dobra.
- Dados: usa `skills` de `app/data/home.ts`.
- Imagem: `/images/victor-hero-v2.png`, `next/image`, priority.
- CTAs: cases, Agente R, CV.
- Sugestão: validar existência do CV, revisar texto final e alt da imagem.
- Reutilização: específica da home.

`AboutSection` - `app/components/home/AboutSection.tsx`

- Usado na home.
- Exibe imagem `victor-card-v2.png`, texto sobre e highlights.
- Sugestão: revisar texto e garantir que imagem substituta tenha proporção quadrada/vertical leve.

`ExpertiseSection` - `app/components/home/ExpertiseSection.tsx`

- Usa `expertise`.
- Cards de Product Leadership, AI & Automation, Technical Delivery.
- Sugestão: validar lista de habilidades e evitar excesso de chips.

`CasesSection` - `app/components/home/CasesSection.tsx`

- Usado em home e `/cases`.
- Props: `limit`, `showAllLink`, `showTopBorder`.
- Usa `getAllCases()`.
- Cards com `next/image` fill, overlay e line clamp.
- Sugestão: adicionar opção sem limite mais semântica; considerar alt descritivo por case; imagem ideal maior.
- Reutilização: boa.

`CompaniesSection` - `app/components/home/CompaniesSection.tsx`

- Client Component.
- Usa `companies`.
- Estado: `selectedCompany`.
- Interações: abre modal e retorna foco ao card.
- Usa `CompanyModal`.
- Sugestão: bom cuidado com foco; validar logos e conteúdo final.

`CompanyModal` - `app/components/home/CompanyModal.tsx`

- Client Component.
- Props: `company`, `initials`, `onClose`.
- Estados: erro de imagem.
- Interações: fecha por botão, overlay e `Escape`; trava scroll do body.
- Sugestão: adicionar `role="dialog"` e `aria-modal="true"` explicitamente.

`ExperienceSection` - `app/components/home/ExperienceSection.tsx`

- Resume timeline da home usando `timeline`.
- CTA interno `#sobre`.
- Sugestão: verificar se CTA leva ao lugar mais útil.

`StackContactSection` - `app/components/home/StackContactSection.tsx`

- CTA de contato e ilustração CSS.
- Link `mailto:contato@victorsizino.com`.
- Sugestão: padronizar e-mail e talvez apontar para `/contato`.

`AgentRSection` - `app/components/AgentRSection.tsx`

- Client Component.
- Estados: `messages`, `input`, `loading`.
- Refs: scroll automático das mensagens.
- Eventos: submit, Enter para enviar, Shift+Enter para nova linha.
- Integração: `fetch("/api/agente-r")`.
- Imagens: `agente-r.png` e `agente-r-chat-avatar.png`.
- Classes principais: `agent-shell`, `agent-chat`, `agent-message-*`.
- Sugestão: tratar erro com mensagem mais acionável, timeout, desabilitar logs sensíveis no backend, considerar persistência de contexto.
- Reutilização: média; acoplado ao fluxo Agente R.

### Componentes About

`AboutHero`

- Hero de sobre com imagem, badges flutuantes e CTAs.
- Usa `heroBadges`.
- Risco: link LinkedIn genérico.

`AboutDifferentials`

- Usa `differentials`.
- Cards simples com ícone, título e descrição.

`AboutImpact`

- Usa `impactMetrics`.
- Mostra números/labels.
- Risco: métricas precisam validação.

`AboutJourney`, `AboutTimeline`, `AboutWorkStyle`, `AboutHighlights`

- Dividem narrativa de jornada, estilo de trabalho e conquistas.
- Responsabilidade clara, sem estado.
- Sugestão: manter textos em dados para facilitar edição.

`AboutCompanies`

- Usa `aboutCompanies`.
- Renderiza logo quando existe, fallback por nome/cargo.
- Sugestão: adicionar logos ou padronizar fallback.

`AboutLearning`

- Usa `learningGroups`.
- Sugestão: revisar nomes oficiais de cursos, instituições e anos.

`AboutCTA`

- CTA final.
- Risco: link para `/#contato` provavelmente incorreto.

`AboutSectionTitle`

- Props: `eyebrow`, `title`, `description`.
- Reutilizável, simples e útil.

### Componentes Experience

`ExperienceHero`

- Hero com imagem e métricas.
- Usa `heroMetrics`.
- Risco: métricas com value vazio.

`ExperienceStats`

- Mostra métricas da experiência.
- Sem estado.

`ImpactHighlights`

- Usa `impactHighlights`.
- Cards de impacto.

`ExperienceTimeline`

- Usa `experiences` e `ExperienceCard`.
- Define primeiro card aberto.

`ExperienceCard`

- Client Component.
- Props: `experience`, `defaultOpen`.
- Estado: `isOpen`.
- Interações: acordeão desktop/mobile.
- Usa logo com fallback para Stefanini.
- Sugestão: melhorar geração de IDs para Unicode, adicionar `aria-labelledby`, validar overflow de stack longa.

`InternationalExperience`

- Client Component.
- Estado por card internacional.
- Usa `internationalExperiences`.
- IDs baseados em `company.toLowerCase()`.
- Sugestão: slugificar com helper reutilizável.

`ExperienceSidebar`

- Client Component grande.
- Props: `variant`.
- Estados: disclosures mobile.
- Responsável por resumo, competências, segmentos, ferramentas, mapa e CTA.
- Risco: componente com muitas responsabilidades; bom candidato a split futuro.

`ExperienceCTA`

- CTA para cases e e-mail.
- Risco: e-mail divergente.

### Componentes Stack

`StackHero`, `StackStats`, `ProficiencyLegend`, `CoreCompetencies`, `StackCategoryCard`, `CertificationsSection`, `ValueSection`, `StackCTA`, `LevelBadge`

- Todos Server Components.
- Dados vêm de `app/data/stack.ts`.
- `StackCategoryCard` recebe `category`, `compact`, `index`, `mode`.
- `CoreCompetencies` recebe `variant`.
- `LevelBadge` recebe `level`.
- Risco: ordenação manual na página pode esconder categorias novas.
- Sugestão: adicionar campo `order` nos dados ou renderizar na ordem do array.

### Componentes Cases

`CaseHero`

- Props: `item`.
- Exibe categoria, título, descrição, tags, imagem e metadados.
- Imagem com alt vazio; revisar conforme finalidade.

`CaseMeta`

- Props: `duration`, `role`, `squad`, `projectType`.
- Responsável por metadados do case.

`CaseSectionCard`

- Props: `title`, `children`, `icon`.
- Card reutilizável para detalhe de case.

`CaseProcess`

- Props: `steps`, `framed`, `showTitle`.
- Usa ícones por índice.

`CaseImpact`

- Props: `items`, `framed`, `showTitle`.
- Usa ícones por índice.

`CaseStack`

- Props: `tools`, `framed`, `showTitle`.
- Mapeia algumas tools para ícones; fallback provável para ícone genérico.
- Sugestão: ampliar mapa de ferramentas.

`CaseQuote`

- Props: `quote`.
- Renderiza apenas quando há citação.

`CaseAccordionMobile`

- Client Component.
- Props: `item`.
- Estado: `openSections`.
- Interações: abre/fecha seções do case no mobile.

`CaseNavigation`

- Props: `previous`, `next`.
- Usa imagens de thumbnail.
- Alt vazio; pode ser decorativo, mas navegação poderia ter descrição.

### Ícones

`BrandIcons` - `app/components/icons/BrandIcons.tsx`

- Define SVGs inline para OpenAI, Gemini, Make, n8n, Next.js, React, TypeScript, Firebase, GA4, Vercel, Figma e Jira.
- Reutilizável.
- Sugestão: manter lista mínima e padronizada; adicionar `aria-hidden` nos usos decorativos se necessário.

## 6. Design System Atual

Cores principais:

- `ink`: `#0D0D0F`
- `dark`: `#1A1A1F`
- `muted`: `#6B7280`
- `soft`: `#E5E7EB`
- `canvas`: `#F8FAFC`
- `violet`: `#6366F1`
- `line`: `#E5E7EB`
- `white`: `#FFFFFF`
- `black`: `#000000`
- Cores adicionais: `#EC4899`, `#334155`, `#EEF0FF`, `#F1F2F8`, `#9CA3AF`, `#111827`, `#374151`, `#4F46E5`.

Tipografia:

- Fonte principal: Inter via stack CSS local/sistema.
- H1 hero: `text-[40px]`, `sm:text-[48px]`, `md:text-[72px]`, `font-black`, `leading-[0.98]`.
- H1 case: `text-[34px]`, `md:text-[46px]`.
- Títulos seção: frequentemente 26-30px, `font-black` ou `font-extrabold`.
- Texto base: 14-16px, `leading-6` ou `leading-7`.
- Labels: 11-12px, uppercase, tracking alto.

Espaçamentos:

- Container padrão: `max-w-[1096px]`, `px-5`, `md:px-8`.
- Seções: `py-9`, `pt-9`, `pb-8`, `md:pt-12`.
- Gaps comuns: `gap-3`, `gap-4`, `gap-6`, `gap-8`.

Border radius:

- Cards: 8px (`rounded-lg`, `.card-border`).
- Pills: `rounded-full`.
- Agente R usa radius maior: `24px`, `20px`, `14px`.

Sombras:

- `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)`.
- `shadow-md`: `0 4px 12px rgba(0,0,0,0.06)`.
- `shadow-lg`: `0 12px 24px rgba(0,0,0,0.08)`.
- Hover roxo: `0 12px 24px rgba(99,102,241,0.1)`.

Cards:

- Borda `#E5E7EB`, fundo branco, radius 8px, sombra leve.
- Hover com translateY(-2px), borda roxa translúcida e sombra.

Botões:

- Primário preto com hover roxo.
- Secundário branco com borda.
- Altura comum: 44px ou 56px.
- Ícones Lucide à direita.

Badges/chips:

- Fundo `violet/10`, texto roxo.
- Radius 8px ou pill.
- Fonte 11-12px bold/extrabold.

Foco:

- Algumas classes globais têm `focus-visible` com outline roxo.
- Inputs usam apenas `focus:border-violet`, sem outline explícito.
- O CSS de `.accordion-trigger` remove outline/box-shadow, o que pode prejudicar foco visível.

Grid:

- Hero: `lg:grid-cols-[1fr_520px]`.
- Containers principais: `max-w-[1096px]`.
- Cases: `md:grid-cols-2`, `lg:grid-cols-3`.
- Stack: `md:grid-cols-2`, `xl:grid-cols-3`.
- Experience: `lg:grid-cols-[minmax(0,1fr)_300px]`.

Responsividade:

- Breakpoints Tailwind custom/default: `sm 40rem`, `md 48rem`, `lg 64rem`, `xl 80rem`, `2xl 96rem`.
- Há várias media queries manuais em `globals.css`, especialmente para home, companies e agente.

Inconsistências visuais:

- Agente R usa radius 24px, destoando do padrão 8px.
- Alguns textos têm acentos ausentes ou encoding aparente nos outputs do terminal.
- Contato usa calendário estático e cards grandes; pode parecer menos finalizado que o restante.
- `#contato` é usado como âncora em alguns CTAs, mas a arquitetura real tem rota `/contato`.

## 7. Imagens e Assets

Todas as imagens mapeadas em `public/`:

| Arquivo | Dimensão real | Proporção | Uso | Render aproximado | Otimização | Alt |
|---|---:|---:|---|---|---|---|
| `public/images/victor-hero-v2.png` | 1024x1536 | 0,67 | Hero home, about, experiência, contato | até 520x430/505 | Grande, boa resolução, arquivo pesado 2,68 MB | "Victor Sizino" ou descritivo |
| `public/images/victor-hero.png` | 350x340 | 1,03 | Não encontrado em uso atual | - | Leve | - |
| `public/images/victor-card-v2.png` | 243x237 | 1,03 | AboutSection home | card pequeno | Adequada para pequeno, baixa para retina maior | "Victor Sizino" |
| `public/images/victor-card.png` | 125x144 | 0,87 | Não encontrado em uso atual | - | Pequena | - |
| `public/images/agente-r.png` | 1536x1024 | 1,50 | Agente R, contato, case RA Reviews | mascote/card/case hero | Pesada 2,44 MB, boa resolução | "Agente R" ou vazio no case |
| `public/images/agente-r-v2.png` | 1536x1024 | 1,50 | Não encontrado em uso atual | - | Pesada 2,55 MB | - |
| `public/images/agente-r-v3.png` | 510x900 | 0,57 | Não encontrado em uso atual | - | Boa para vertical | - |
| `public/images/agente-r-v4.png` | 1536x1024 | 1,50 | Não encontrado em uso atual, arquivo não rastreado | - | Pesada 2,44 MB | - |
| `public/images/agente-r-chat-avatar.png` | 220x210 | 1,05 | Avatar do chat | 48x48 | Adequada | alt vazio decorativo |
| `public/images/agente-r-avatar-v1.png` | 320x320 | 1,00 | Não encontrado em uso atual | - | Adequada para avatar | - |
| `public/images/case-agu.png` | 284x243 | 1,17 | Cards e hero do case AGU | card 360x376, hero até 560w | Baixa para hero/card retina | alt vazio |
| `public/images/case-meliuz.png` | 285x243 | 1,17 | Cards e hero do case Méliuz | card 360x376, hero até 560w | Baixa para hero/card retina | alt vazio |
| `public/images/case-houzz.png` | 285x243 | 1,17 | Cards e hero HouzBuddy | card 360x376, hero até 560w | Baixa para hero/card retina | alt vazio |
| `public/images/map.png` | 1738x905 | 1,92 | Mapa sidebar e case Porto Seguro | card/map e hero | Boa resolução, leve | descritivo na sidebar, vazio no case |
| `public/logos/*.png` | 220x120 | 1,83 | Logos em empresas/experiência/about | 74-116w, 42-54h | Adequadas | alt com nome/logo |
| `public/logos/hirevue-logo.svg` | viewBox 189,647x39,838 | 4,76 | Experiência internacional | 116x54 máx. | Vetorial, ideal | alt com logo |
| `public/logos/carrefour.svg` | 24x24 | 1,00 | Não encontrado em uso atual | - | Vetorial | - |

Uso de `next/image`:

- Todas as imagens renderizadas encontradas usam `next/image`.
- Não foram encontrados `<img>` comuns em componentes.

Assets órfãos ou possivelmente não usados:

- `victor-hero.png`
- `victor-card.png`
- `agente-r-v2.png`
- `agente-r-v3.png`
- `agente-r-v4.png`
- `agente-r-avatar-v1.png`
- `carrefour.svg`
- versões antigas de logos sem `-v2` podem estar sem uso.

## 8. Tamanhos Recomendados de Imagens

Hero principal de Victor:

- Uso atual: render até ~520px de largura e 430-505px de altura.
- Recomendado: 1200x1800px ou 1400x2100px em WebP/AVIF, fundo transparente ou bem recortado, abaixo de 350 KB se possível.
- Evitar PNG pesado quando não houver transparência necessária.

Hero/detalhe de case:

- Uso atual: `CaseHero` pede 960x560 e renderiza até ~560px de largura.
- Recomendado: 1600x933px ou 1920x1120px, proporção próxima de 12:7 / 1,71.
- Para screenshots de produto, preferir 1920x1080 ou 1600x1000 com área segura.

Cards de cases:

- Uso atual: card 360x376 com `object-fit: cover`.
- Recomendado: 900x940px ou 1080x1128px se imagem exclusiva para card.
- Se a mesma imagem servir para hero e card, usar 1600x1200px com composição central segura.
- Risco atual: imagens 284/285x243 serão ampliadas e podem perder nitidez.

Logos:

- Uso atual: frame 74x42 a 116x54, origem PNG 220x120.
- Recomendado: SVG sempre que possível; fallback PNG 440x240 com fundo transparente.
- Manter área segura e proporção horizontal.

Avatar/personagem:

- Avatar chat: recomendado 320x320 ou 512x512, WebP/PNG.
- Mascote Agente R: recomendado 900x1200 para uso vertical ou 1400x1000 para uso horizontal, com compressão WebP/AVIF.
- Arquivos atuais de Agente R acima de 2 MB devem ser otimizados.

Mapa:

- Uso atual tem boa dimensão, mas pode ser convertido para WebP/AVIF.
- Recomendado: 1600x900 ou SVG/PNG otimizado, dependendo do nível de detalhe.

## 9. Conteúdos e Textos Atuais

Home:

- Hero: "Ola, eu sou", "Victor Sizino.", "AI Technical Product Manager", "Transformo problemas complexos..."
- CTAs: "Ver Cases", "Conversar com Agente R", "Baixar CV".
- Skills: AI Product Management, Technical PM, AI Agents, Automation.
- Expertise: Product Leadership, AI & Automation, Technical Delivery.
- Cases: AGU, Méliuz, HouzBuddy e demais cases vindos de `app/data/cases.ts`.
- Empresas: Carrefour, Reclame Aqui, Méliuz, IPNET, AGU, SETUR, Webbix.
- Agente R: narrativa interativa com textos explicativos longos.

About:

- Diferenciais: mentalidade de produto, visão técnica, design/UX, IA na prática.
- Métricas: `10+`, `20+`, `6+`, `Brasil + Irlanda`, `Design + Tecnologia + Produto + IA`.
- Jornada: de Web Designer a AI Product Manager.
- Empresas: Méliuz, Reclame Aqui, HireVue, Mold3, Carrefour, IPNET, Webbix, Stefanini.
- Formação: Udemy, Tetra, Hashtag, Fundação Bradesco, Origamid, ETEC, Faculdade Carlos Drummond, SEDA College Dublin.

Experiência:

- Hero e métricas: `+10 anos`, `+30 Projetos`, experiência internacional, diversos segmentos.
- Experiências nacionais: Méliuz, Reclame Aqui, Carrefour Brasil, SETUR Porto Seguro, AGU, Stefanini.
- Experiências internacionais: HireVue, Webbix.
- Sidebar: competências, segmentos, ferramentas e mapa.

Stack:

- Categorias: AI & Automação, Product Management, Technical Product Management, Product Design, Front-End Development, Analytics & Growth, Agile & Delivery, Gestão de Produto.
- Competências centrais: AI PM, AI Agents & Automation, PM, TPM, Product Design, Front-End, Analytics & Growth.
- Certificações: n8n, Gestor do Futuro, Power BI.

Cases:

- AGU: buscador inteligente com IA para documentos jurídicos.
- Méliuz: redução de fricção no browse in-app.
- RA Reviews: evolução de experiência de reviews.
- Porto Seguro SETUR: portal de turismo.
- HouzBuddy: MVP internacional para moradia compartilhada.

Contato:

- Canais: e-mail, LinkedIn, WhatsApp, localização.
- Formulário: "Ou envie uma mensagem".
- Aviso placeholder: "Mensagem preparada com sucesso. Em breve conectaremos este formulário ao envio real."
- Agenda estática: "Junho 2025".

Avaliação de conteúdo:

- Coerência geral com AI PM/TPM: boa.
- Adequação para recrutadores/heads: boa estrutura, mas precisa de evidências, datas corretas e métricas comprováveis.
- Placeholders aparentes: agenda, formulário, alguns links, CV, heroMetrics vazios, resultados genéricos.
- Duplicidades/inconsistências: anos de experiência, e-mails, links de contato, algumas empresas/cargos entre páginas.
- Textos genéricos: muitos resultados usam fórmulas amplas como "gerar impacto real", "soluções escaláveis", "aumentaram eficiência" sem dado concreto.

## 10. Dados Estruturados e Mocks

`app/data/home.ts`

- Controla navegação, skills, expertise, cases resumidos antigos, empresas, timeline, processo, highlights e stack.
- Atenção: existe um array `cases` neste arquivo que parece legado, porque `CasesSection` usa `app/data/cases.ts`.
- Campos importantes: `title`, `description`, `image`, `stats`, `tags`, `logo`, `context`.

`app/data/cases.ts`

- Fonte principal dos cases.
- Campos obrigatórios pelo tipo `CaseStudy`: `slug`, `title`, `category`, `filterCategory`, `shortDescription`, `heroDescription`, `coverImage`, `tags`, `duration`, `role`, `squad`, `projectType`, `context`, `problem`, `myRole`, `myRoleBullets`, `process`, `impact`, `tools`, `learnings`.
- Campos opcionais: `thumbnailImage`, `quote`.
- Como adicionar case: criar objeto no array `cases` com slug único e todos os campos obrigatórios; adicionar imagem em `public/images`; se quiser badge custom, atualizar `badgeBySlug` em `CasesSection`.
- Risco: sem schema/runtime validation.

`app/data/experience.ts`

- Controla métricas, highlights, experiências profissionais, experiências internacionais, sidebar, ferramentas e floating cards.
- Campos obrigatórios em `ProfessionalExperience`: company, logo, role, period, location, segment, context, responsibilities, result, stack, team, badge.
- Campo opcional: `workMode`.
- Para adicionar experiência: incluir item em `experiences` ou `internationalExperiences`, garantir logo ou fallback.
- Risco: tipo e dados estão no mesmo arquivo; pode crescer demais.

`app/data/about.ts`

- Controla badges do hero, diferenciais, métricas, timeline, work style, highlights, empresas e aprendizado.
- Campos opcionais: `lines`, `description`, `logo`, `year`, `institution`.

`app/data/stack.ts`

- Controla métricas, legenda, categorias, competências, certificações, valor e highlights.
- Campo `level` restrito a `Expert | Advanced | Intermediate | Basic`.
- Para adicionar stack: incluir em `stackCategories`, mas também atualizar `orderedCategoryTitles` em `app/stack/page.tsx`.

`public/agent-r-knowledge.json`

- Base de conhecimento do Agente R.
- Não é consumida diretamente pela API route atual.
- Pode ser usada pelo Make/webhook externo ou em uma futura implementação local/RAG.

Dados que deveriam migrar futuramente para CMS:

- Cases completos.
- Experiências e cargos.
- Certificações/formações.
- Empresas/logos.
- Conteúdo do Agente R.
- Dados de contato e links sociais.

## 11. Responsividade

Home:

- Desktop: hero em duas colunas; cases em três colunas; empresas em sete colunas.
- Tablet: grids reduzem para duas/quatro colunas.
- Mobile: header vira menu, CTAs empilham, skills em grid 2 colunas, companies vai para 3 e depois 2 colunas.
- Riscos: cards de empresas com nomes longos; imagem do Agente R tem transform scale em mobile; case cards com altura mínima.

About:

- Hero e grids usam breakpoints Tailwind.
- Badges posicionados por classes absolutas; podem colidir com imagem se novo texto crescer.
- Métricas e empresas devem se adaptar, mas conteúdo longo pode aumentar muito a página.

Experiência:

- Desktop tem conteúdo + sidebar.
- Mobile duplica sidebar em modo disclosure e cards viram acordeões.
- Riscos: stack longa dentro dos cards; IDs derivados de nomes; muito conteúdo em mobile.

Stack:

- Desktop usa grid com CoreCompetencies e cards.
- Mobile usa versão compacta.
- Riscos: chips demais e categorias longas.

Cases:

- Lista: 3 colunas desktop, 2 tablet, 1 mobile implícito.
- Detalhe: desktop com grids e cards; mobile com acordeão.
- Risco: imagens pequenas ampliadas; textos longos cortados na listagem.

Contato:

- Desktop: hero com duas colunas, cards e agenda lado a lado.
- Mobile: CTAs empilham e cards viram grid 1/2 colunas conforme largura.
- Riscos: formulário e calendário estático em telas estreitas; imagem lateral pode ocupar muito espaço.

Breakpoints usados:

- Tailwind: `sm`, `md`, `lg`, `xl`, `2xl`.
- CSS custom: max-width 63.999rem, 56rem, 47.999rem, 36rem, 30rem.

## 12. Acessibilidade

Pontos positivos:

- Uso de `aria-label` em links de case, chat, botões de envio e menu.
- `aria-expanded` e `aria-controls` em acordeões.
- `aria-live="polite"` no chat.
- Imagens decorativas usam alt vazio em alguns contextos.
- Botões têm labels claros no header e chat.

Problemas/riscos:

- `.accordion-trigger` remove outline e box-shadow, reduzindo foco visível.
- Algumas imagens de case com `alt=""` podem perder informação se forem relevantes.
- Modal de empresas deveria declarar `role="dialog"` e `aria-modal="true"`.
- Inputs do formulário têm label visível, bom, mas não têm `required`, mensagens de erro ou validação.
- Links genéricos para LinkedIn não comunicam destino real.
- Contraste do muted `#6B7280` em fundo branco tende a ser aceitável para texto maior, mas deve ser validado para 12px/11px.
- Botão mobile fixo pode sobrepor conteúdo em casos específicos.

Headings:

- Páginas principais usam H1 nos heros.
- Cards internos usam H2/H3.
- Alguns componentes repetidos podem criar muitos H2, mas a hierarquia geral é compreensível.

Sugestões:

- Restaurar foco visível nos acordeões.
- Adicionar `role`, `aria-modal` e relação de título no modal.
- Validar contraste com ferramenta WCAG.
- Revisar alt text caso a imagem comunique o conteúdo do case.
- Adicionar validação acessível ao formulário.

## 13. SEO e Metadados

Metadata global:

- `app/layout.tsx`
- Title: `Victor Sizino | AI Technical Product Manager`
- Description: portfolio com foco em Produto, IA, Automação, UX e Tecnologia.
- `html lang="pt-BR"`.

Metadata por página:

- `/about`: title e description próprios.
- `/experiencia`: title e description próprios.
- `/stack`: title e description próprios.
- `/cases`: title e description próprios.
- `/cases/[slug]`: metadata dinâmica por case.

Ausências:

- Open Graph.
- Twitter Card.
- Metadata de canonical.
- Sitemap.
- Robots.
- Manifest.
- Imagens OG.
- Metadata específica da página `/contato`.

Favicon:

- `app/icon.svg` existe.

Textos indexáveis:

- A maior parte do conteúdo é server-rendered e indexável.
- Componentes client ainda renderizam conteúdo no HTML inicial em grande parte, mas interações dependem de JS.

URLs:

- Boas rotas: `/about`, `/cases`, `/experiencia`, `/stack`, `/contato`.
- Mistura de inglês e português em rotas (`about`, `cases`, `stack`, `experiencia`, `contato`) pode ser aceitável, mas merece decisão editorial.

Ajustes antes da publicação:

- Criar OG/Twitter metadata.
- Criar `sitemap.ts` e `robots.ts`.
- Adicionar metadata para `/contato`.
- Validar CV PDF e adicionar metadata/asset se for público.
- Revisar títulos de cases para melhor busca.

## 14. Integrações

Agente R:

- Frontend: `app/components/AgentRSection.tsx`.
- Backend: `app/api/agente-r/route.ts`.
- Variável: `MAKE_AGENT_R_WEBHOOK_URL`.
- Fluxo: pergunta do usuário -> API route -> webhook Make -> resposta em texto -> chat.
- Base de conhecimento local: `public/agent-r-knowledge.json`, não usada diretamente pelo código.

Riscos:

- Logs do backend podem expor URL do webhook.
- Sem timeout, rate limit ou proteção anti-spam.
- Sem fallback local se webhook cair.
- Sem histórico de conversa enviado ao Make, apenas pergunta atual.

Formulário de contato:

- Apenas mock local em `/contato`.
- Não envia dados.
- Sem API route, webhook ou serviço externo.

Links externos:

- LinkedIn real em `/contato`: `https://www.linkedin.com/in/victorsizino`.
- LinkedIn genérico em `Footer` e `AboutHero`.
- WhatsApp em `/contato`: `https://wa.me/5511985655503`.
- E-mails divergentes.

Analytics:

- Não há integração de analytics detectada.

Variáveis de ambiente:

- `.env.example`: `MAKE_AGENT_R_WEBHOOK_URL`.
- `.env.local`: `MAKE_AGENT_R_WEBHOOK_URL`.

## 15. Qualidade Técnica

Componentização:

- Boa separação geral por área.
- Componentes de cases e stack são bem reutilizáveis.
- `ExperienceSidebar` e `/contato/page.tsx` concentram muitas responsabilidades.

Reutilização:

- `CasesSection` é reaproveitado.
- `CaseSectionCard`, `CaseImpact`, `CaseProcess`, `CaseStack` têm boa reutilização.
- `AboutSectionTitle` é bom padrão.

Duplicação:

- Dados de contato duplicados.
- Dados de cases resumidos existem em `home.ts`, mas a listagem usa `cases.ts`.
- Alguns padrões de card/badge são repetidos em classes.

TypeScript:

- `strict: true`.
- Tipos principais existem.
- Tipos de stack/experience estão dentro dos arquivos de dados, não em `app/types`.

Imports:

- Claros e diretos.
- Uso extensivo de Lucide.

Server/client components:

- Server Components por padrão.
- Client Components onde necessário: Header, AgentRSection, CompaniesSection, CompanyModal, ExperienceCard, ExperienceSidebar, InternationalExperience, CaseAccordionMobile, contato.
- Uso correto em geral.

Performance:

- Build otimizado passou.
- Imagens grandes de Victor e Agente R podem impactar LCP/bandwidth.
- PNGs poderiam virar WebP/AVIF.
- `priority` em imagens hero faz sentido, mas repetir priority em várias rotas deve ser observado.

Build/lint:

- `npm.cmd run build`: passou.
- `npm.cmd run lint`: falhou porque `next lint` foi interpretado como diretório `lint` em Next 16.
- ESLint direto: falhou porque ESLint 9 exige `eslint.config.js` e o projeto usa `.eslintrc.json`.

Dependências:

- `lucide-react`, `next`, `react`, `react-dom` usadas.
- Dev deps necessárias.
- Não foi feita auditoria de pacote não usado com ferramenta especializada.

Arquivos órfãos:

- Possíveis imagens não usadas listadas na seção 7.
- `DOCUMENTO_ESTRUTURA_PROJETO_RESPONSIVIDADE.md` está não rastreado.
- `public/images/agente-r-v4.png` está não rastreado.

## 16. Pontos de Atenção

- Corrigir lint antes de evoluir o projeto.
- Padronizar e-mail e links sociais.
- Validar todos os anos, cargos, empresas e métricas.
- Substituir imagens de cases por versões maiores e mais nítidas.
- Otimizar PNGs pesados de hero e Agente R.
- Corrigir CTAs que apontam para `/#contato`.
- Confirmar existência do PDF do CV.
- Integrar formulário de contato ou remover aparência de envio real.
- Trocar calendário estático por link real de agenda ou componente funcional.
- Revisar logs sensíveis do Agente R.
- Decidir se `public/agent-r-knowledge.json` será fonte real do agente ou apenas documentação.
- Adicionar SEO social: OG, Twitter, sitemap, robots.
- Melhorar foco visível em acordeões.
- Remover ou arquivar assets não usados.

## 17. Checklist para Preenchimento Final do Portfólio

- Revisar headline e subtítulo da home.
- Validar posicionamento final: AI PM, TPM, PM.
- Padronizar tom textual em todas as páginas.
- Revisar todos os cases com contexto, problema, papel, processo, impacto, ferramentas e aprendizados.
- Inserir números reais e comprováveis.
- Validar cargos, datas e empresas.
- Adicionar logos ausentes.
- Trocar imagens de cases.
- Otimizar imagem de Victor.
- Otimizar imagens do Agente R.
- Corrigir contatos.
- Corrigir links de LinkedIn.
- Adicionar CV em `/public` ou ajustar CTA.
- Configurar webhook do Agente R em produção.
- Validar formulário de contato.
- Adicionar metadados sociais.
- Testar mobile em 360px, 390px, 768px, 1024px e desktop.
- Rodar build.
- Corrigir lint.
- Validar acessibilidade.
- Validar performance.

## 18. Recomendações Antes da Publicação

Prioridade alta:

- Corrigir script/configuração de lint para Next 16 + ESLint 9.
- Padronizar e-mails, LinkedIn e CTAs.
- Remover logs sensíveis do webhook.
- Substituir imagens pequenas dos cases.
- Otimizar imagens pesadas.
- Validar todas as métricas e datas.
- Implementar ou ajustar formulário/agenda.

Prioridade média:

- Adicionar sitemap, robots, OG e Twitter Card.
- Centralizar dados de contato em um único arquivo.
- Remover assets não usados.
- Criar schema/validação para cases.
- Melhorar foco visível dos acordeões.

Prioridade futura:

- Migrar cases, experiências, stack e conteúdo do Agente R para CMS.
- Criar painel simples de edição.
- Adicionar analytics e eventos de CTA.
- Criar testes visuais/responsivos para páginas principais.

