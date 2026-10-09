# Stage 05 — SEC-02 Residual Risk Decision Report

VS Method™ — LOT-14. 09/10/2026, America/Sao_Paulo. **AWAITING HUMAN APPROVAL**.

## Resultado para decisão

Nenhuma dependência, configuração, código funcional ou internal do Next foi alterado. SEC-01 e as correções SEC-02 Stage 04 foram preservados. Este relatório é novo; scripts, fixtures pequenas e artefatos de inspeção foram criados somente fora do repositório.

Recomenda-se preservar a árvore aprovada e considerar uma exceção temporária, explícita e condicionada para os resíduos, com prazo, responsável e controles de build definidos pela governança. Isso é uma **proposta**, não uma aceitação executada. Não há patch oficial publicado para braces; o upgrade Next 16.4.0 não corrige o bundle investigado. Não iniciar SEC-03/04.

## Integridade

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD/baseline: `ed70452f52a04c6678bcf14e69869b2e368984fb`.

| Arquivo aprovado | SHA-256 preservado |
|---|---|
| package.json | BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E |
| package-lock.json | B14746FC413E2529BEC0A3B0B30943449D19949EF79F53E3E91C296319A63651 |
| next-env.d.ts | 1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37 |

Hashes de assessment v1 e relatórios Stages 02/03/04 também foram registrados e preservados em lot14-stage05-probes.json. Working tree mantém as alterações anteriores nesses três arquivos e documentos não versionados; acrescenta apenas este relatório. Sem commit, push, PR, merge, deploy, alteração de migration ou credenciais.

Audit completo revalidado: **5 high**, todos na cadeia braces. Exit 1 esperado por achados. O runtime zero do Stage 04 não foi reinterpretado como ausência de código vendorizado vulnerável; não houve reinstalação ou nova execução da suíte funcional, pois este stage não mudou a implementação.

## Estados explicitamente separados

| Objeto / condições | Estado |
|---|---|
| Next/sharp e cinco famílias tratadas nos Stages 02/04 | **Corrigido** para os advisories e resoluções validados nesses stages; validação de produção pendente |
| Browserslist externo 4.28.7, caso sintético de stats | **Corrigido**: processa a entrada pequena que quebra o bundle |
| braces no caminho Next ESLint atual, sem settings.next.rootDir | **Não explorável nas condições verificadas** nesse caminho: ramo de glob não é executado; pacote permanece afetado |
| Browserslist embutido, stats sintéticos em chamada direta | Defeito **confirmado**, não corrigido; **pendente de decisão humana** |
| Exceção no helper getSupportedBrowsers | **Mitigado parcialmente** nesse chamador: captura a exceção e usa targets padrão; pode ocultar targets pretendidos |
| Cache embutido, build local com consultas fixas e duração limitada | **Não explorável nas condições verificadas** para cenário volumétrico de queries públicas; implementação continua sem limite |
| Runtime implantado, controles CI/repositório e entrada não confiável futura | **Não verificado**; nenhuma aceitação ou mitigação universal declarada |

“Não explorável” é restrito ao caminho, configuração e entradas inspecionados. Não significa ausência da vulnerabilidade, garantia futura ou autorização de deploy.

## braces: advisory, alcance e alternativas

O [advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), CVE-2026-93687, classifica como high/8.7 a recursão sem limite nos walkers de padrões aninhados, com impacto de disponibilidade. A versão instalada é 3.0.3; o registry consultado mantém latest 3.0.3 e o advisory indica nenhuma versão corrigida. A [PR upstream #72](https://github.com/micromatch/braces/pull/72) permanece proposta de correção, não release oficial utilizável. Não foi aplicada.

Cadeia efetiva: eslint-config-next 16.2.7 → @next/eslint-plugin-next 16.2.7 → fast-glob 3.3.1 → micromatch 4.0.8 → braces 3.0.3. Os cinco high do audit refletem essa propagação. Não confundir braces com os dois brace-expansion já corrigidos.

`@next/eslint-plugin-next/dist/utils/get-root-dirs.js` importa fast-glob, mas chama globSync somente se settings.next.rootDir for string/array. Caso contrário retorna context.cwd. A configuração efetiva calculada pelo ESLint para app/page.tsx não contém settings.next; o helper retornou somente o diretório atual. A configuração fonte também não define rootDir. Globs files do eslint.config.mjs pertencem à seleção do ESLint e não demonstram entrada neste helper.

Se rootDir vier a conter um padrão aninhado não confiável, fast-glob usa braceExpansion=true por padrão; seu processamento chama micromatch.braces com expand=true. Os walkers compile/expand de braces possuem recursão sem guarda de profundidade. O limite de comprimento e o limite de quantidade de expansão não constituem limite de profundidade. Para exploração nessa cadeia, é necessário influenciar a configuração/padrão consumido pelo lint e executar a ferramenta. Não foi identificado caminho de app/API alimentando esses pacotes. Os 25 arquivos de trace de produção locais não listam braces; isso não é introspecção da implantação Vercel.

Testes permitidos: três padrões de profundidade 1/4/8, máximo 19 caracteres, compilados normalmente. Não houve stack overflow induzido, teste de exaustão ou busca do limiar. O resultado normal desses testes **não refuta** o advisory; o diagnóstico da falta de guard vem da inspeção e da fonte oficial.

Classificação contextual: **baixa no estado local atual**, probabilidade baixa condicionada à ausência de padrões controláveis; impacto potencial alto sobre disponibilidade do lint/CI quando o caminho é habilitado. Confiança alta sobre árvore, configuração e walker; média sobre exposição global, porque políticas de CI e controles de entrada não foram auditados. Não se calcula um CVSS novo nem se reduz a severidade oficial.

| Tratamento proposto | Custo / compatibilidade | Limitação / regressão |
|---|---|---|
| Manter ausência de rootDir glob; revisar alterações de globs; isolar lint de código não confiável e impor timeout de job | Baixo; sem fork ou alteração funcional | Não remove pacote/advisory; controles CI precisam ser verificados/aprovados |
| Esperar release oficial e atualizar no range dos pais após validação | Baixo a médio; preferencial | Sem prazo oficial confirmado; revalidar lint e regressões |
| Substituir configuração/plugin por solução sem essa cadeia, preservando regras Agent B e checks Next | Alto; exige novo escopo | Risco de perder regras e cobertura; não recomendado como ação imediata |
| Exceção temporária formal com controles e vencimento | Baixo esforço técnico | Decisão exclusivamente humana; alerta deve permanecer visível |

Não recomendar fork, versão fictícia 3.0.4, substituição de braces por brace-expansion, downgrade do tooling ou override fora dos ranges. Desabilitar apenas uma regra não remove imports/dependências nem equivale a remediação.

## Browserslist embutido: origem e comparação oficial

O [package.json oficial do Next 16.3.8](https://raw.githubusercontent.com/vercel/next.js/v16.3.8/packages/next/package.json) fixa browserslist **4.28.1** para construir o framework. O [taskfile oficial](https://raw.githubusercontent.com/vercel/next.js/v16.3.8/packages/next/taskfile.js) compila essa biblioteca com ncc em src/compiled/browserslist, externaliza requires dinâmicos e substitui o aviso de dados antigos. O package.json do bundle instalado omite version, e sua API não expõe version. A atribuição upstream 4.28.1 tem confiança alta pela fonte fixada e comparação das funções do pacote oficial baixado; não foi reconstruído o pipeline ncc para demonstrar identidade integral de build.

O bundle mantém normalizeStats com acumulador `{}`, acesso data[key] sem own-property guard e atribuição dinâmica. O [patch oficial f9914ad](https://github.com/browserslist/browserslist/commit/f9914ad) usa Object.create(null) e guarda hasOwnProperty. Também mantém caches de resultados e parsing em objetos, sem eviction. O [patch oficial f2931a3](https://github.com/browserslist/browserslist/commit/f2931a3) substitui os caches por Map e limita a 500 entradas com remoção da mais antiga. Ambos entram na linha corrigida 4.28.7; nenhum desses patches está no bundle instalado.

Next latest estável consultado: **16.4.0**. Seu tarball oficial foi baixado sem scripts/instalação; o index.js compilado é byte a byte idêntico ao instalado no Next 16.3.8. SHA-256 de ambos: `44CCD5540448327464887AE6B9E7F5BB99506DFAC6A8DA54D942074DAFD23905`. A fonte de [16.4.0](https://raw.githubusercontent.com/vercel/next.js/v16.4.0/packages/next/package.json) e a [fonte canary consultada](https://raw.githubusercontent.com/vercel/next.js/canary/packages/next/package.json) ainda fixam 4.28.1. O registry não mostrou patch 16.3 posterior a 16.3.8. **Não foi encontrada correção oficial nas versões/fontes verificadas**, sem extrapolar isso para toda versão histórica ou artefato canary não baixado. Atualizar Next 16.4.0 ou override do pacote externo não resolveria esse bundle.

### Stats: condições e evidência sintética

[GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g), CVE-2026-73088: requer influência sobre opts.stats, arquivo de stats auto-descoberto ou configuração de stats. Pode provocar TypeError e escrita no protótipo do acumulador. Não se demonstrou alteração global de Object.prototype, execução remota ou extração de dados.

Uma entrada minúscula `{toString:{onekey:5}}`, em chamada direta para chrome 100, lançou TypeError no bundle e retornou normalmente no externo 4.28.7. Exceção foi capturada no processo de teste. Fixture fora do repo com .browserslistrc e browserslist-stats.json reproduziu a mesma exceção em chamada direta. Não houve alteração de arquivos do projeto nem requisição HTTP.

Uso efetivo: webpack-config chama getSupportedBrowsers; o helper carrega a configuração e chama a biblioteca somente quando existem queries. No projeto, loadConfig retornou null/ausente; não existem os arquivos de configuração/stats verificados entre raiz do projeto e C:/, e o processo de teste não tinha variáveis BROWSERSLIST. Nesse caminho o helper usa targets modernos. Há imports adicionais nos bundles Babel e webpack, portanto não se declara ausência universal no build.

O helper chama a biblioteca sem passar opts.path, usando cwd para stats. Na fixture com cwd ainda no repo, retornou chrome 100. Em subprocesso isolado cujo cwd era a fixture, capturou o erro de stats e retornou targets padrão chrome 111/edge 111/firefox 111/safari 16.4. Isso limita o crash nesse chamador, mas representa fallback silencioso, não correção da biblioteca. Chamadas diretas/outros consumidores podem propagar a exceção.

Contexto: **baixo nas entradas atuais; médio para integridade/disponibilidade do build se configuração ou stats não confiáveis forem introduzidos**. Probabilidade baixa no estado verificado, condicionada à integridade de fontes/ambiente. Confiança alta no defeito reproduzido; média no alcance completo do build; produção não verificada. Nenhum import direto nos agentes/catálogo ou pacote nos traces locais foi identificado.

### Cache: condições e limites

[GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), CVE-2026-73089: o cenário exige processo duradouro, consultas distintas influenciadas por entrada externa e volume suficiente para acumular memória. O build observado é finito e usa targets/configuração fixa; não foi identificado endpoint que aceite consultas Browserslist. A ausência de eviction foi confirmada estaticamente. Nenhum teste volumétrico, heap stress ou OOM foi executado.

Contexto: **baixo para o build atual**; impacto potencial alto de disponibilidade se futuramente houver serviço duradouro com queries controláveis. Probabilidade baixa nas condições verificadas; confiança alta na ausência do patch, média no alcance e não verificada na infraestrutura publicada.

## Tratamentos para Browserslist

| Opção proposta | Custo / compatibilidade | Limitações |
|---|---|---|
| Revisar/bloquear stats e consultas não confiáveis no build, executar fontes externas isoladas sem segredos | Baixo a médio; preserva Next e agentes | Processo/políticas de CI não verificados; exige aprovação para implementação |
| Fixar stats confiáveis via mecanismo oficial BROWSERSLIST_STATS e delimitar busca com BROWSERSLIST_ROOT_PATH | Médio; sem mexer em internals | Não corrige normalizeStats; pode alterar targets/estatísticas; precisa validar build e política de dados |
| BROWSERSLIST_DISABLE_CACHE em processos de build que precisem dessa mitigação | Baixo; controle presente no bundle | Mitiga escrita dos caches, não stats; custo de CPU/recomputação; validar desempenho antes de adotar |
| Migrar somente quando um Next oficial contiver ambos os patches demonstrados no artefato | Médio; solução preferida definitiva | Ainda sem candidato corrigido confirmado; repetir validação integral e inspecionar tarball |
| Aceitação temporária condicionada | Baixo esforço técnico | Risco permanece; aprovação, vencimento e gatilhos são obrigatórios na decisão proposta |

Nenhuma dessas configurações foi aplicada. WAF, proteção AVIF da Vercel e validação de payload dos agentes não são controles demonstrados para entrada em globs/stats do build. Não usar audit runtime zero como prova da segurança do bundle.

## Recomendação e gate humano

Para braces: propor exceção temporária condicionada à manutenção do caminho atual sem globs rootDir não confiáveis, verificação de isolamento/timeouts e revisão de alterações do lint. Preferir release upstream oficial quando disponível.

Para Browserslist: registrar o defeito vendorizado como confirmado, com exposição contextual limitada no projeto; propor controles de integridade/isolamento do build e exceção temporária separada até correção oficial demonstrável. Não fazer upgrade 16.4.0 com justificativa de correção desse achado. Guardar ambos os resíduos abertos.

Se aprovada, a exceção proposta deveria ter responsável designado pela Human Governance, revisão até **23/10/2026** (14 dias), e expiração antecipada se surgir patch oficial, novo uso de stats/queries, configuração rootDir glob, build de contribuição não confiável sem isolamento ou evidência de alcance runtime. Expiração exige reavaliação; não renovação automática. Não foi criado monitor/agendamento, waiver, dismiss de alerta ou mudança de pipeline.

Decisões necessárias: aceitar ou rejeitar cada exceção separadamente; definir responsável/prazo; autorizar e verificar controles de CI/build; autorizar avaliação futura de versão oficial corrigida. Caso a organização exija zero achados, manter o gate bloqueado por política até patch ou projeto separado de substituição de tooling — não mascarar o audit.

## Evidências e limitações finais

Artefatos em `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`: lot14-stage05-audit-all.json; lot14-stage05-pack.json e tarballs oficiais baixados via npm pack --ignore-scripts; lot14-stage05-upstream; lot14-stage05-probes.mjs/json/log; lot14-stage05-fixture; lot14-stage05-bundle-comparison.json. Probes concluíram com exit 0 em Node 24.16.0; exceções esperadas foram capturadas. Subprocesso teve timeout de 5s, fixture de poucos bytes, padrões limitados a profundidade 8. Nenhum teste destrutivo ou de exaustão.

Traces: 25 arquivos nft.json do build local inspecionados, nenhum listando braces ou compiled/browserslist. Não provam ausência de código incorporado de outras maneiras nem substituem SBOM/inspeção de artefato Vercel. CI, branch protection, permissões de filesystem de produção e configuração de ambiente implantado permanecem não verificados. As validações integrais aprovadas dos Stages 02/04 continuam como referência funcional; nenhuma produção foi alterada.

**AWAITING HUMAN APPROVAL**
