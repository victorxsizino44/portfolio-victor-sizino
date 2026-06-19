# Documento de estrutura do projeto para ajuste de responsividade mobile

## Objetivo deste documento

Este documento resume a estrutura atual do projeto do portfolio de Victor Sizino para que outro ChatGPT consiga analisar o contexto e gerar um prompt tecnico adequado para ajustar a versao mobile da home, respeitando o design visual ja estipulado.

## Visao geral do projeto

- Projeto: portfolio pessoal de Victor Sizino.
- Framework: Next.js com App Router.
- Linguagem: TypeScript + React.
- Estilizacao: Tailwind CSS, classes utilitarias no JSX e classes globais em `app/globals.css`.
- Icones: `lucide-react` e icones customizados em `app/components/icons/BrandIcons.tsx`.
- Imagens e logos: pasta `public/`.
- Estrutura principal da home: `app/page.tsx`, que monta secoes independentes.

## Scripts disponiveis

Arquivo: `package.json`

```json
{
  "dev": "next dev --webpack",
  "build": "next build --webpack",
  "start": "next start",
  "lint": "next lint"
}
```

Dependencias principais:

- `next`
- `react`
- `react-dom`
- `lucide-react`
- `typescript`
- `tailwindcss`
- `eslint-config-next`

## Estrutura de pastas e arquivos

```txt
.
├── app/
│   ├── api/
│   │   └── agente-r/
│   │       └── route.ts
│   ├── components/
│   │   ├── AgentRSection.tsx
│   │   ├── home/
│   │   │   ├── AboutSection.tsx
│   │   │   ├── CasesSection.tsx
│   │   │   ├── CompaniesSection.tsx
│   │   │   ├── CompanyModal.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ExpertiseSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   └── StackContactSection.tsx
│   │   └── icons/
│   │       └── BrandIcons.tsx
│   ├── data/
│   │   └── home.ts
│   ├── types/
│   │   └── home.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── agent-r-knowledge.json
│   ├── images/
│   │   ├── agente-r-avatar-v1.png
│   │   ├── agente-r-v2.png
│   │   ├── agente-r-v3.png
│   │   ├── case-agu.png
│   │   ├── case-houzz.png
│   │   ├── case-meliuz.png
│   │   ├── victor-card-v2.png
│   │   └── victor-hero-v2.png
│   └── logos/
│       ├── agu.png
│       ├── carrefour.png
│       ├── carrefour.svg
│       ├── ipnet-v2.png
│       ├── meliuz.png
│       ├── porto-seguro-v2.png
│       ├── reclame-aqui-v2.png
│       └── webbix.png
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Montagem da home

Arquivo: `app/page.tsx`

A pagina principal monta a home nesta ordem:

1. `Header`
2. `HeroSection`
3. Bloco `#sobre` com `AboutSection` e `ExpertiseSection`
4. `CasesSection`
5. `CompaniesSection`
6. `ExperienceSection`
7. `AgentRSection`
8. `StackContactSection`
9. `Footer`

Container padrao usado em quase todas as secoes:

```tsx
mx-auto max-w-[1096px] px-5 md:px-8
```

Isso significa que o layout tem largura maxima de 1096px, margem centralizada, padding mobile de 20px e padding maior a partir de `md`.

## Sistema visual atual

Arquivos relevantes:

- `tailwind.config.ts`
- `app/globals.css`

Cores principais:

- `ink`: `#0D0D0F`
- `dark`: `#1A1A1F`
- `muted`: `#6B7280`
- `soft/line`: `#E5E7EB`
- `canvas`: `#F8FAFC`
- `violet`: `#6366F1`
- branco: `#FFFFFF`

Caracteristicas do design:

- Visual limpo, editorial/profissional.
- Fundo geral claro.
- Cartoes brancos com borda cinza clara e raio de 8px.
- Destaque roxo/violeta usado com moderacao.
- Tipografia forte em titulos, com pesos altos.
- Muitas secoes usam grid e cards compactos.
- Nao ha design system formal, mas ha classes globais reutilizaveis como `section-label`, `card-border`, `icon-box`, `case-card`, `agent-*`, `companies-*`, `contact-*`.

Breakpoints Tailwind declarados no CSS via `@theme`:

```css
sm: 40rem
md: 48rem
lg: 64rem
xl: 80rem
2xl: 96rem
```

## Dados da home

Arquivo: `app/data/home.ts`

Este arquivo concentra os conteudos reutilizados pelas secoes:

- `navItems`: itens do menu.
- `skills`: chips abaixo do hero.
- `expertise`: cards de expertise.
- `cases`: cards de cases.
- `companies`: empresas e conteudos do modal.
- `timeline`: linha do tempo.
- `process`: cards de processo de trabalho.
- `highlights`: destaques do sobre.
- `stack`: ferramentas e tecnologias.

Tipos relacionados:

Arquivo: `app/types/home.ts`

Define os tipos `SkillItem`, `ExpertiseItem`, `CaseItem`, `CompanyItem`, `TimelineItem`, `ProcessItem`, `HighlightItem` e `StackItem`.

## Secoes e pontos de responsividade

### Header

Arquivo: `app/components/home/Header.tsx`

- Header horizontal com logo `VS.` e menu.
- Menu desktop aparece apenas em `md:flex`.
- No mobile, o menu fica oculto e nao ha menu hamburguer.
- Possivel ponto de decisao mobile: manter apenas logo, criar menu compacto ou adicionar botao de navegacao.

### Hero

Arquivo: `app/components/home/HeroSection.tsx`

Estrutura:

- Grid com texto e imagem.
- Em desktop usa `lg:grid-cols-[1fr_520px]`.
- Titulo com `text-[56px]` no mobile e `md:text-[72px]`.
- Imagem com container `min-h-[430px]`, dot-grid e imagem `h-[430px]`.
- CTAs em `flex flex-wrap`.
- Chips de skills abaixo do grid.

Pontos criticos mobile:

- Titulo de 56px pode ficar muito grande em telas pequenas.
- Imagem tem altura fixa de 430px.
- O container visual da imagem pode ocupar muito espaco vertical.
- Tres botoes no hero podem quebrar de forma pesada em telas estreitas.
- Skills podem virar muitas linhas.

### Sobre

Arquivo: `app/components/home/AboutSection.tsx`

Estrutura:

- Grid `md:grid-cols-[156px_1fr_344px]`.
- No mobile vira uma coluna.
- Usa imagem fixa `156x180`.
- Texto usa classes globais `.about-title`, `.about-copy`.
- Highlights ficam em coluna.

Pontos criticos mobile:

- Decidir se a imagem deve vir antes ou depois do texto.
- Titulo `.about-title` tem 26px e max-width fixo.
- Highlights podem precisar de espacamento mais compacto.

### Expertise

Arquivo: `app/components/home/ExpertiseSection.tsx`

Estrutura:

- Grid de 3 colunas a partir de `md`.
- Cards usam `min-h-[190px] p-6`.
- Lista interna com `pl-[52px]`.

Pontos criticos mobile:

- Cards empilham naturalmente.
- Padding e recuo da lista podem ser grandes em telas pequenas.

### Cases

Arquivo: `app/components/home/CasesSection.tsx`

Estrutura:

- Header com label e link lado a lado.
- Grid `lg:grid-cols-3`.
- Cards usam classe global `.case-card` com altura fixa de 344px.
- Imagem de fundo com overlay escuro.

Pontos criticos mobile:

- Header pode ficar apertado por causa do link "Ver todos os cases".
- Altura fixa dos cards pode cortar conteudo dependendo do texto.
- Tags e resultados usam alturas/min-heights, podem apertar em telas pequenas.

### Empresas

Arquivos:

- `app/components/home/CompaniesSection.tsx`
- `app/components/home/CompanyModal.tsx`

Estrutura:

- Grid global `.companies-grid` com `repeat(7, minmax(0, 1fr))`.
- Cada empresa e um botao/card.
- Modal centralizado com largura `min(640px, calc(100vw - 48px))`.

Pontos criticos mobile:

- O grid de 7 colunas e o maior risco de overflow/colunas estreitas no mobile.
- Precisa definir comportamento mobile, por exemplo 2 colunas ou carrossel horizontal, mantendo o visual dos cards.
- Modal pode precisar de `max-height`, rolagem interna e padding menor em telas pequenas.
- Header do modal com logo + texto pode precisar empilhar.

### Experiencia

Arquivo: `app/components/home/ExperienceSection.tsx`

Estrutura:

- Em desktop usa `lg:grid-cols-[330px_1fr]`.
- Timeline do lado esquerdo.
- Processo do lado direito com `.work-grid`.
- `.work-grid` e 2 colunas por padrao e vira 5 colunas apenas em `min-width: 80rem`.

Pontos criticos mobile:

- `.work-grid` ja nasce com 2 colunas mesmo no mobile, o que pode ficar apertado em telas pequenas.
- `.work-card` tem `min-height: 236px`, padding e textos centralizados.
- Timeline usa grid fixo `56px 18px 1fr`, pode ser aceitavel, mas precisa conferir em 320px/360px.

### Agente R

Arquivo: `app/components/AgentRSection.tsx`

Estrutura:

- Secao interativa com intro + chat.
- `.agent-shell` vira 2 colunas em `lg`.
- `.agent-shell` tem border-radius 24px, padding 32px e sombra forte.
- `.agent-intro` tem `min-height: 540px`.
- No mobile via `@media (max-width: 56rem)`, intro fica `padding-bottom: 260px` e mascote centralizado.
- `.agent-chat` tem altura fixa de 640px.

Pontos criticos mobile:

- Chat de 640px pode ser alto demais.
- Container com padding e radius grandes pode parecer pesado em telas pequenas.
- Mascote posicionada absolute pode gerar espaco excessivo.
- Mensagens precisam preservar legibilidade e nao estourar largura.
- Input arredondado precisa continuar usavel.

### Stack e Contato

Arquivo: `app/components/home/StackContactSection.tsx`

Estrutura:

- Grid principal vira 2 colunas em `lg`.
- Stack usa `grid-cols-3`, vira `sm:grid-cols-4`.
- Cards da stack tem `h-[70px]`.
- Contato usa `.contact-panel`, com ilustracao escondida no mobile e exibida a partir de `md`.
- `.contact-copy` usa `white-space: nowrap`.

Pontos criticos mobile:

- Stack com 3 colunas pode ficar apertado em 320px.
- Texto do contato tem `<br />` fixo no titulo.
- `.contact-copy` com `white-space: nowrap` pode causar overflow.
- Botao de contato pode precisar ocupar largura total no mobile.

### Footer

Arquivo: `app/components/home/Footer.tsx`

Estrutura:

- `flex flex-wrap` com logo, copyright e links.
- Deve funcionar no mobile, mas pode precisar de alinhamento central ou ordem visual.

## API do Agente R

Arquivo: `app/api/agente-r/route.ts`

- Endpoint POST `/api/agente-r`.
- Le `MAKE_AGENT_R_WEBHOOK_URL` do `.env.local`.
- Encaminha `{ question }` para um webhook do Make.
- Retorna `{ answer }`.

Observacao para responsividade:

- A API nao precisa ser alterada para ajustes visuais mobile.
- Alteracoes devem focar em `AgentRSection.tsx` e `app/globals.css`.

## Assets relevantes

Imagens da home:

- `/images/victor-hero-v2.png`
- `/images/victor-card-v2.png`
- `/images/case-meliuz.png`
- `/images/case-agu.png`
- `/images/case-houzz.png`
- `/images/agente-r-v3.png`
- `/images/agente-r-avatar-v1.png`

Logos:

- `/logos/carrefour.png`
- `/logos/reclame-aqui-v2.png`
- `/logos/meliuz.png`
- `/logos/ipnet-v2.png`
- `/logos/agu.png`
- `/logos/porto-seguro-v2.png`
- `/logos/webbix.png`

## Arquivos mais importantes para ajuste mobile

Prioridade alta:

- `app/components/home/HeroSection.tsx`
- `app/components/home/CompaniesSection.tsx`
- `app/components/home/ExperienceSection.tsx`
- `app/components/AgentRSection.tsx`
- `app/components/home/StackContactSection.tsx`
- `app/globals.css`

Prioridade media:

- `app/components/home/AboutSection.tsx`
- `app/components/home/CasesSection.tsx`
- `app/components/home/Header.tsx`
- `app/components/home/Footer.tsx`

Baixa prioridade:

- `app/data/home.ts`
- `app/types/home.ts`
- `app/api/agente-r/route.ts`

## Pontos de atencao encontrados

1. Ha bastante CSS responsivo em `app/globals.css`, mas algumas secoes ainda dependem de medidas fixas.
2. O grid de empresas usa 7 colunas fixas e provavelmente precisa de regra mobile.
3. Hero e Agente R usam alturas fixas grandes.
4. O chat do Agente R usa altura fixa de 640px.
5. Alguns textos podem estourar por `white-space: nowrap`, especialmente em contato.
6. O menu mobile esta oculto e nao ha alternativa de navegacao mobile.
7. Alguns textos aparecem com caracteres quebrados quando lidos pelo terminal, como `ExperiÃªncias`, `AtuaÃ§Ã£o` e `InteligÃªncia`. Antes de alterar textos, vale confirmar se e problema real de encoding no arquivo ou apenas exibicao do terminal.

## Diretrizes para o prompt que sera gerado

O prompt para ajuste mobile deve pedir que o modelo:

- Preserve o design desktop atual.
- Priorize ajustes mobile e tablet.
- Evite redesenhar a identidade visual.
- Mantenha a paleta, bordas, sombras, tipografia e estilo geral.
- Use os breakpoints Tailwind existentes.
- Corrija overflow horizontal.
- Teste visualmente larguras como 320px, 360px, 390px, 430px, 768px e desktop.
- Ajuste principalmente grids, alturas fixas, paddings, tamanho de fonte, ordem visual e quebras de texto.
- Nao altere conteudo, dados, API do Agente R ou assets, salvo se necessario para corrigir layout.
- Entregue mudancas nos arquivos de componentes e no `app/globals.css`.

## Prompt sugerido para enviar ao ChatGPT

Use o texto abaixo como base:

```txt
Voce vai me ajudar a ajustar a responsividade mobile da home de um portfolio em Next.js, React, TypeScript e Tailwind CSS.

Contexto:
- A home fica em app/page.tsx.
- O projeto usa App Router do Next.js.
- A estrutura visual esta dividida em componentes dentro de app/components/home e app/components/AgentRSection.tsx.
- O conteudo vem de app/data/home.ts.
- A estilização mistura classes Tailwind nos componentes e classes globais em app/globals.css.
- O design atual desktop deve ser preservado.
- A identidade visual usa fundo claro, texto quase preto, cinza muted, bordas #E5E7EB, cards brancos com raio de 8px e destaque violeta #6366F1.

Objetivo:
Gerar um plano/prompt tecnico para ajustar somente a versao mobile e tablet da home, respeitando o design ja estipulado, corrigindo overflow, quebras ruins, alturas fixas excessivas e grids apertados.

Arquivos principais:
- app/page.tsx
- app/components/home/Header.tsx
- app/components/home/HeroSection.tsx
- app/components/home/AboutSection.tsx
- app/components/home/ExpertiseSection.tsx
- app/components/home/CasesSection.tsx
- app/components/home/CompaniesSection.tsx
- app/components/home/CompanyModal.tsx
- app/components/home/ExperienceSection.tsx
- app/components/AgentRSection.tsx
- app/components/home/StackContactSection.tsx
- app/components/home/Footer.tsx
- app/globals.css
- tailwind.config.ts

Pontos criticos:
- Hero: titulo muito grande no mobile, imagem com altura fixa de 430px, tres CTAs podem ficar pesados, skills podem quebrar em muitas linhas.
- Companies: grid atual usa 7 colunas fixas, alto risco de overflow no mobile.
- Experience: work-grid nasce com 2 colunas e cards altos, pode ficar apertado em telas pequenas.
- Agent R: chat tem altura fixa de 640px, intro usa mascote absolute e padding-bottom grande, shell tem padding/radius grandes.
- Stack/Contato: stack com 3 colunas pode apertar; contact-copy usa white-space nowrap; titulo tem br fixo; botao pode precisar largura total.
- Cases: cards tem altura fixa de 344px e header com link ao lado do label.
- Header: menu some no mobile e nao ha navegacao alternativa.

Restrições:
- Nao redesenhar o desktop.
- Nao remover secoes.
- Nao alterar conteudo ou dados.
- Nao mexer na API do Agente R.
- Manter o estilo visual atual.
- Preferir mudancas pequenas, locais e incrementais.
- Usar breakpoints Tailwind existentes: sm 40rem, md 48rem, lg 64rem, xl 80rem.
- Garantir que nao exista overflow horizontal em 320px, 360px, 390px, 430px, 768px e desktop.

Me devolva:
1. Um diagnostico dos principais problemas mobile provaveis.
2. Uma estrategia de ajuste por secao.
3. Um prompt final, claro e completo, que eu possa enviar para um agente de codigo aplicar as alteracoes no projeto.
```

