# Stage 06 — Residual Risk Governance & CI Control Verification Report

VS Method™ — LOT-14 — SEC-02. 09/10/2026, America/Sao_Paulo.

**AWAITING HUMAN APPROVAL.** Dois registros condicionais preparados, ambos **DRAFT / NOT EFFECTIVE**. As evidências atuais não sustentam ativação de nenhuma exceção: main está sem proteção/checks obrigatórios, não existem workflows versionados nem execuções GitHub Actions registradas, e isolamento/timeout/revisão do build externo não foram comprovados.

## Estado preservado

Branch local: `codex/lot-14-portfolio-security-hardening`. HEAD: `ed70452f52a04c6678bcf14e69869b2e368984fb`. A consulta GitHub de main confirmou o mesmo SHA. SEC-01 e SEC-02 Stage 04 permanecem exclusivamente locais e aprovados tecnicamente; o status Vercel observado pertence à baseline anterior às correções.

Hashes preservados: package.json `BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E`; package-lock.json `B14746FC413E2529BEC0A3B0B30943449D19949EF79F53E3E91C296319A63651`; next-env.d.ts `1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37`. Foram registrados também hashes de eslint.config.mjs, next.config.js, assessment e relatórios Stages 02–05.

Alterações deste stage: somente este relatório e dois novos registros Markdown de risco. Sem dependências, código, workflows, configurações, migrations ou credenciais modificados. Nenhum commit, push, PR, merge, deploy, aceitação, dismissal ou ocultação de alerta. SEC-03 e SEC-04 não iniciados.

## Evidências GitHub e limites de acesso

Consultas autenticadas GET ao repositório público victorxsizino44/portfolio-victor-sizino, observadas em 09/10/2026 às 03:45 UTC aproximadamente:

- [main](https://api.github.com/repos/victorxsizino44/portfolio-victor-sizino/branches/main): protected=false, protection.enabled=false, enforcement_level=off, contexts/checks vazios. **Ausência de proteção/checks obrigatórios comprovada pela resposta de branch**.
- [Rulesets incluindo pais](https://api.github.com/repos/victorxsizino44/portfolio-victor-sizino/rulesets?includes_parents=true): resposta `[]`. Nenhum ruleset retornado pela consulta disponível.
- [Raiz de main](https://api.github.com/repos/victorxsizino44/portfolio-victor-sizino/contents?ref=main): não contém .github; git ls-tree HEAD e Test-Path literal local também confirmam ausência. Não há workflows GitHub Actions, dependabot.yml ou CODEOWNERS no escopo versionado inspecionado.
- [Runs GitHub Actions](https://api.github.com/repos/victorxsizino44/portfolio-victor-sizino/actions/runs?per_page=10): total_count=0. Não existem runs registrados retornados; não prova que nenhum run histórico foi removido nem que não há serviço externo.
- [Check runs da baseline](https://api.github.com/repos/victorxsizino44/portfolio-victor-sizino/commits/ed70452f52a04c6678bcf14e69869b2e368984fb/check-runs): total_count=0.
- Status combinado retornou somente contexto **Vercel / success**, com [deployment associado](https://vercel.com/victorvsp-8899s-projects/portfolio-victor-sizino/3puYoCpsjF5mjbgfD9Z7atSnndxq). Isso não comprova execução de npm ci, lint, testes, audits, proteção ou aprovação obrigatória.
- GET detalhado de /branches/main/protection retornou **403 Resource not accessible by integration**. O conector não permite essa leitura administrativa; o campo admin=true retornado na metadata do usuário/repositório não amplia o escopo efetivo da integração. Não interpretar 403 como ausência; a evidência de ausência vem da resposta separada de branch.

Não foram acessados segredos, alteradas permissões ou configurações administrativas. Defaults de permissões Actions, política de aprovação de forks, allowlist de actions, runners, ambientes protegidos, bypass administrativo, settings e isolamento Vercel permanecem não verificáveis pelas capacidades utilizadas. Para comprovar esses controles, é necessária evidência administrativa read-only ou inspeção autorizada com acesso apropriado em outro gate. Nenhuma configuração externa foi presumida ativa.

## Matriz de controles

Legenda: **Comprovado** = evidência concreta no escopo indicado; **Ausente** = ausência comprovada nesse escopo; **Não verificado** = acesso/evidência insuficiente. Controle local ou documentação não equivale a enforcement de CI.

| ID | Controle | Estado e evidência | Lacuna para eventual exceção |
|---|---|---|---|
| C01 | Integridade do estado aprovado | Comprovado localmente: hashes SEC-01/02, manifest/lock e docs preservados | Não há artefato publicado das correções |
| C02 | Lock e origem de instalação | Comprovado local: lock v3, 467 entradas HTTPS em registry.npmjs.org, nenhuma sem integrity; npm ci passou no Stage 04 | Integrity verifica bytes, não benignidade/proveniência; não comprova política remota |
| C03 | Instalação reproduzível obrigatória | Comprovado apenas local; Ausente em workflow versionado; .npmrc de projeto ausente | Comprovar npm ci no SHA revisado, lock não alterado; configuração global/CI não verificada |
| C04 | Lifecycle scripts e privilégio de instalação | Sem lifecycle scripts no manifest raiz; lock indica hasInstallScript em unrs-resolver | Não verificado isolamento/segredos durante instalação; npm ci padrão pode executar scripts |
| C05 | Runner isolado para código não confiável | Não verificado externo; não há runner/workflow definido no repo | Evidenciar runner efêmero sem segredos de produção, sem escrita/deploy e sem reutilização insegura |
| C06 | Token mínimo / eventos seguros / cache | Não verificado administrativo e externo | Política de token read-only, ausência de checkout não confiável em contexto privilegiado e separação de caches |
| C07 | Timeouts de jobs/steps | Ausente em CI versionado; limites Vercel não verificados | Definir e demonstrar limites/cancelamento para install/lint/test/typecheck/build |
| C08 | Revisão de configuração/lock/workflows | CODEOWNERS ausente; main sem proteção; revisão mandatória não comprovada | Revisão explícita e obrigatória dos caminhos sensíveis e alterações que invalidam escopo |
| C09 | Stats/queries/globs não confiáveis | Stage 05 comprovou ausência local de rootDir glob, config/stats e caminho HTTP identificado | Revalidar o ambiente real de build; não permitir arquivos/variáveis/queries não revisados |
| C10 | Checks obrigatórios e proteção de main | Ausente: protected=false, checks vazios, rulesets `[]` | Comprovar proteção efetiva, checks no SHA atual e política de bypass; sem habilitação neste stage |
| C11 | Validações funcionais e segurança | Comprovado local Stage 04: lint/typecheck/build, 456 testes, 41 HTTP e navegador; audit 5 high/0 runtime | Não há esses checks remotos; Vercel success não os substitui |
| C12 | Visibilidade e acompanhamento de riscos | Comprovados registros/audits locais preservados; nenhum alerta ocultado pelo agente | Status/configuração real de Dependabot não verificado; acompanhamento formal ainda precisa dono/decisão |

Manifest não fixa engines/packageManager; vários ranges continuam latest, preservados pelo escopo aprovado. Com lock e npm ci a árvore local é reproduzível; instalar por npm install/regerar lock pode resolver outras versões. Não se propõe upgrade indiscriminado ou alteração dessas declarações neste stage.

## Dois registros independentes

| Registro | Responsável proposto | Prazo máximo | Recomendação atual |
|---|---|---|---|
| [LOT14-EXC-SEC02-BRACES](</C:/Users/victo/Documents/portfoliio victor/docs/security/lot-14-risk-exception-braces.md>) | Victor Sizino, confirmação no gate | 23/10/2026, 23:59 BRT | Não ativar; aguardar controles e decisão específica |
| [LOT14-EXC-SEC02-BROWSERSLIST-BUNDLE](</C:/Users/victo/Documents/portfoliio victor/docs/security/lot-14-risk-exception-browserslist-bundled.md>) | Victor Sizino, confirmação no gate | 23/10/2026, 23:59 BRT | Não ativar; aguardar controles e decisão específica |

A designação é proposta, não uma delegação ou aprovação já efetivada. Os registros definem escopo/version/hash, evidências, condições precedentes, monitoramento, expiração antecipada, reabertura e encerramento. Aprovação de um não aprova o outro. Não há início efetivo ou prazo prorrogado automaticamente se os controles demorarem.

braces: contexto local baixo, sem patch oficial identificado no Stage 05, cadeia de lint cujo ramo rootDir glob está inativo na configuração verificada. A falta de controle obrigatório de mudanças impede sustentar esse estado como premissa duradoura de aceitação.

Browserslist: defeito stats confirmado no bundle e cache sem limite; uso atual limitado ao build identificado, com fallback parcial em um helper. Sem controle comprovado de configuração/ambiente externo, não é defensável tratar a ausência atual de entrada como mitigação suficiente. Next 16.4.0 inspecionado no Stage 05 contém bundle idêntico; atualização externa/override não o corrige.

## Controles mínimos propostos — não implementados

1. **CI reproduzível no SHA revisado:** Node 24 e versão npm definida, lock preservado, npm ci, npm ls, lint, typecheck, testes, build e audits completo/runtime separados. Instalação e execução de código sempre em ambiente isolado, sem credenciais de produção. Não adicionar ignore-scripts indiscriminadamente: avaliar scripts necessários e compatibilidade antes de adotar política específica. A semântica de lock congelado é documentada em [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
2. **Isolamento de contribuições não confiáveis:** runner efêmero, permissões mínimas, sem deploy/OIDC/segredos de produção, checkout sem credencial persistente, actions revisadas e fixadas por SHA. Não executar checkout de PR não confiável em contexto privilegiado pull_request_target/workflow_run. Caches de contribuições não confiáveis não podem alimentar jobs privilegiados sem validação. Essas práticas seguem a [referência de segurança GitHub](https://docs.github.com/en/actions/reference/security/secure-use); implementação futura precisa de evidência real, não somente template.
3. **Timeout explícito:** proposta inicial job máximo 20 minutos, instalação 8, lint/typecheck/testes 5 cada, build 10, ajustados após medição de run isolado. Limites de step/job se sobrepõem; não são soma garantida. Usar cancellation e limite de concorrência para evitar acúmulo; não executar testes de exaustão. [Sintaxe oficial GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) descreve timeout-minutes.
4. **Revisão e proteção:** exigir PR/revisão humana e checks bem-sucedidos no SHA atual antes de integração; evidenciar política de bypass. Revisar package.json/lock, npm config, eslint/Next/Babel/PostCSS, arquivos e variáveis de Browserslist/stats, workflows e scripts de build. Preservar regras de arquitetura/governança do Agent B. CODEOWNERS pode complementar revisão, mas sozinho não a obriga e não substitui proteção.
5. **Entradas de build controladas:** aceitar somente configurações/stats/queries revisados; não importar entradas de cliente para globs/stats. Verificar cwd, ancestrais e nomes de variáveis no ambiente de build sem divulgar valores. Se for necessário usar controles BROWSERSLIST de cache/stats, avaliar em novo escopo e repetir validação; não são ativos agora.
6. **Audit sem ocultação:** preservar JSON completo e runtime como artefatos; manter severidades e advisories visíveis. O audit completo ainda pode retornar 1. Somente após gate efetivo, política explícita poderia avaliar advisory + cadeia + versões/hash + vencimento; qualquer achado novo ou escopo alterado deve falhar/reabrir. Não usar `|| true`, filtros globais de high, omit=dev como único scanner ou dismissal para simular aprovação. O bundle requer evidência manual além do audit.

Estes controles requerem autorização nova para alteração de workflows/settings. Este stage autoriza somente preparação e inspeção; nenhuma configuração foi criada ou aplicada.

## Acompanhamento de patches e decisão

Rotina manual proposta, sob responsabilidade confirmada: revisar em 16/10 e até 23/10, além de cada mudança relevante; evidência técnica inicial de 09/10 está no Stage 05. Para braces, consultar registry/release/advisory e PR upstream, distinguindo proposta de patch publicado. Para Next, consultar release/fonte e comparar tarball oficial com os patches de stats e eviction; número de versão e audit externo não bastam. Registrar resultados mesmo quando nenhum patch existir. Não foi criado agendamento, bot, issue ou mensagem externa.

Expiração antecipada comum: patch disponível, escopo/versão/hash alterado, novo advisory, novo caminho runtime, entrada não confiável, incidente, perda de revisão/isolamento/timeout/proteção, evidência contraditória. Reabrir e suspender elegibilidade; sem renovação automática. Encerramento por correção exige artefato demonstravelmente corrigido, árvore reproduzível, validação integral e decisão humana.

**Decisão recomendada para ambos: manter DRAFT / NOT EFFECTIVE e adiar a aceitação temporária.** Não rejeitar automaticamente a análise técnica nem descartar correções aprovadas. A governança pode aprovar um próximo stage estritamente para implementar/verificar controles, ou rejeitar as exceções e exigir remediação oficial/alternativa em escopo separado. Um gate para ativação deve identificar registros individualmente, responsável, controles comprovados, SHA/artefatos, limites e data de expiração; não confundir aprovação deste relatório com ativação implícita.

## Artefatos e validação deste stage

Evidência compacta das respostas GitHub: `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/lot14-stage06-github-evidence.json`. Hashes anteriores: lot14-stage06-before-hashes.json no mesmo diretório. Metadata de branch, rulesets, root, runs, checks, status e erro 403 foram registrados sem tokens/segredos. A varredura considera arquivos do projeto, não workflows internos de pacotes node_modules.

Checks deste stage: confirmação de branch/baseline/working tree, hashes de integridade, inspeção de arquivos/manifest/lock, GETs GitHub e git diff --check. Não se repetiu instalação, build, suíte ou PoC, porque não houve mudança executável. Os resultados funcionais Stage 04 continuam referência local, com produção pendente.

**AWAITING HUMAN APPROVAL**
