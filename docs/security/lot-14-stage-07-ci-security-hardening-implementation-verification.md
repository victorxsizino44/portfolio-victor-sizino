# Stage 07 — CI Security Hardening Implementation & Verification Report

VS Method™ — LOT-14. 09/10/2026, America/Sao_Paulo. **AWAITING HUMAN APPROVAL**.

## Resultado

Workflow local preparado para push de branches e pull_request, sem deploy. Sintaxe/expressões validadas por actionlint 1.7.12 e estrutura revisada. Instalação reproduzível, árvore, lint, typecheck, 456 testes e build local aprovados. Audit completo permanece **FAIL: cinco high / exit 1**; runtime **PASS: zero / exit 0**. Esse resultado deve reprovar o job de auditoria, sem mascarar achados.

**Não houve execução real no GitHub Actions.** Runner Linux, instalação das Actions, upload de artefatos e cancelamento remotos ainda não foram demonstrados. Exceções LOT14-EXC-SEC02-BRACES e LOT14-EXC-SEC02-BROWSERSLIST-BUNDLE permanecem **DRAFT / NOT EFFECTIVE**.

## Integridade e arquivos

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD/baseline: `ed70452f52a04c6678bcf14e69869b2e368984fb`.

Novos arquivos deste stage:

- `.github/workflows/ci.yml`.
- Este relatório.

Nenhum código funcional, agente, catálogo, migration, dependência, lockfile, configuração GitHub/Vercel ou registro de exceção foi modificado. Alterações SEC-01/SEC-02 anteriores e todos os documentos existentes foram preservados por hashes. Nenhum commit, push, PR, merge ou deploy.

SHA-256 preservados: package.json `BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E`; package-lock.json `B14746FC413E2529BEC0A3B0B30943449D19949EF79F53E3E91C296319A63651`; next-env.d.ts `1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37`. Next 16.3.8 e sharp 0.35.5 preservados.

## Pipeline implementado

Workflow **Portfolio CI**, com dois jobs independentes em GitHub-hosted `ubuntu-24.04`:

1. **Validation:** checkout, Node 24.16.0, npm 11.13.0 fixado no runner, npm ci, npm ls --all, lint, typecheck, testes e build de produção. Instalação do npm CLI é global no runner efêmero e não altera dependências do projeto. Versões são verificadas por igualdade antes dos checks.
2. **Dependency audit:** checkout/runtime/instalação próprios; audit completo e runtime em steps separados; JSON, stderr e código de saída em arquivos distintos. Upload de evidência limitada ao diretório de audit, retenção de 14 dias.

Push cobre branches, sem filtro de paths que deixe check obrigatório pendente. pull_request usa o checkout padrão do evento (merge ref), sem checkout de head em contexto privilegiado. Não há pull_request_target, workflow_run, deployment, ambiente protegido, PAT, OIDC ou referência a secrets.

Cada job tem limite global de 20 minutos. Steps têm limites próprios: checkout 2, setup/npm 3, npm ci 8, árvore 2, lint/typecheck/testes 5, build 10, cada audit/upload 3 minutos. O limite global prevalece; os limites não se somam como orçamento garantido. Concorrência agrupa por workflow/evento/PR ou ref e cancela a execução anterior do mesmo grupo; push e PR não cancelam um ao outro inadvertidamente.

## Actions e referências verificadas

| Action | Release consultada | SHA fixado |
|---|---|---|
| [actions/checkout](https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1) | v7.0.1 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| [actions/setup-node](https://github.com/actions/setup-node/commit/949feb2413d6458794dcd2491c4babbbce0c15c1) | v7.1.0 | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| [actions/upload-artifact](https://github.com/actions/upload-artifact/commit/cf430e030ddbb5b0abf93d22962f4752f3646cd9) | v7.0.2 | cf430e030ddbb5b0abf93d22962f4752f3646cd9 |

Tags foram resolvidas pelo GET autenticado nos repositórios oficiais, incluindo dereference de tag quando necessário. action.yml de cada SHA foi inspecionado para inputs e runtime node24; referências foram comparadas com o YAML local. Isso verifica procedência da referência e compatibilidade declarada, não equivale a auditoria completa de todo dist/ das Actions ou prova de execução remota.

## Matriz de controles

| Controle | Implementação local | Evidência / limite |
|---|---|---|
| Eventos não privilegiados | push de branches e pull_request | Sem pull_request_target/workflow_run |
| Privilégio mínimo | permissions: contents: read | Demais permissões não concedidas pelo workflow; sem id-token/write/deploy |
| Credenciais checkout | persist-credentials: false | clean: false; nenhum reset/clean local executado |
| Runtime reproduzível | Node 24.16.0 / npm 11.13.0 / npm ci | Lock v3 preservado; instalado e testado localmente |
| Actions imutáveis | Três referências por SHA completo | GET oficial + action.yml + actionlint |
| Isolamento | Jobs separados, runner hosted, sem segredos de produção referenciados | Sem self-hosted, environment ou credencial de provider; configuração externa ainda não comprovada |
| Caches | package-manager-cache: false; sem action cache | Sem compartilhamento de cache de build/dependências entre contribuições e jobs |
| Lifecycle scripts | npm ci padrão no runner isolado | Compatibilidade preservada; scripts de dependências executáveis continuam sendo código não confiável |
| Timeouts/cancelamento | Limites de job/step e cancel-in-progress | Estrutura validada; cancelamento remoto não executado |
| Funcionalidade | Scripts existentes, sem alterações | 456 testes e build local sem ambiente de aplicação |
| Auditoria completa | Exit original preservado e step sem continue-on-error | Cinco high mantêm job reprovado |
| Auditoria runtime | Step independente executável após falha do completo | Zero local; não cobre defeito vendorizado de Browserslist |
| Evidências | Upload com if !cancelled() e install.outcome=success | Funciona estruturalmente após falha de audit; cancelamento/timeout pode impedir coleta |
| Revisão/proteção da main | Apenas recomendações | Nenhuma configuração remota alterada; lacunas Stage 06 permanecem |

A ausência de referência a segredos de produção não elimina tokens internos de Actions/artifact com escopo de execução. O workflow não os transforma em autorização de deploy. Políticas remotas de forks, permissões padrão, proteção/bypass e comportamento Vercel continuam sujeitos a verificação administrativa.

## Política de audit com exceções inativas

O step completo captura o status real do npm, escreve JSON/stderr/exit-code, imprime o JSON e retorna o mesmo status. set +e é usado apenas durante captura, seguido de set -e e exit do status original. Não há npm audit || true, continue-on-error, filtro de severity, allowlist ou leitura de exceção para transformar achados em sucesso.

O runtime e o upload usam `!cancelled() && steps.install.outcome == 'success'`, permitindo execução após falha do audit completo. Não dependem de sucesso do step anterior. A falha completa permanece no resultado do job; sucesso runtime/upload não a apaga. Falhas de registry/scanner também reprovam, sem se passarem por audit limpo. Falha de instalação impede os audits subsequentes e reprova o job.

Portanto, com a árvore atual, **Dependency audit deve falhar quando executado remotamente**. Validation pode passar independentemente. Não declarar CI totalmente aprovado nem integrar via bypass do check. Eventual política de exceção futura exigiria autorização específica, controle estrito por advisory/cadeia/versão/hash/prazo e preservação de evidências; não foi implementada e aprovação deste stage não a ativa.

## Validações locais

| Verificação | Resultado |
|---|---|
| actionlint 1.7.12 | PASS, exit 0; sem diagnóstico de workflow |
| Parse YAML + revisão/assertions estruturais | PASS: eventos, SHA oficiais, permissions, runner, timeouts, credenciais, cache, condições pós-falha e ausência de continue-on-error/secrets |
| npm ci --no-audit --no-fund | PASS, exit 0, 380 pacotes; lock preservado |
| npm ls --all | PASS, exit 0 |
| Lint | PASS, exit 0 |
| Typecheck em fonte sem .next prévia | PASS, exit 0 |
| Testes | **456/456 PASS**, zero falhas/skips/cancelamentos |
| Build de produção em fonte limpa | PASS, exit 0; compilação, TypeScript, páginas e traces concluídos |
| Audit completo | **FAIL esperado**, exit 1, cinco high: braces e quatro pais na cadeia |
| Audit runtime | PASS, exit 0, zero achados |
| Integridade e git diff --check | PASS |

Ambiente: Windows / PowerShell, Node 24.16.0, npm 11.13.0. Após npm ci no workspace, os checks funcionais rodaram em cópia isolada das fontes em `lot14-stage07-clean-source`, sem .env.local e sem .next prévia, com junction para a árvore de dependências instalada. Nenhuma variável de aplicação listada em .env.example estava herdada pelo processo; valores não foram coletados. A cópia excluiu arquivos locais de ambiente e não modificou fontes originais. Build gerou arquivos somente nessa cópia.

Limitação inicial: criação da junction foi recusada por EPERM no sandbox; checks iniciados sem dependências falharam. A junction foi criada fora do sandbox e todos os checks afetados foram repetidos com sucesso. Isso foi limitação do preparo do ambiente de teste, não regressão funcional. npm ci, consultas de audit e build também precisaram execução fora do sandbox. Aviso existente MODULE_TYPELESS_PACKAGE_JSON permaneceu nos testes, sem alteração de tipo de módulo.

actionlint foi baixado da [release oficial v1.7.12](https://github.com/rhysd/actionlint/releases/tag/v1.7.12) somente no diretório de evidências. ZIP verificado contra digest oficial SHA-256 `6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9`. ShellCheck/Pyflakes não estavam disponíveis e foram desativados; scripts Bash foram revisados, mas não executados num runner Linux. Comandos npm foram executados localmente via PowerShell. A coleta de artefatos Actions e semântica de run real seguem pendentes.

Não se repetiram as 41 verificações HTTP/navegador, pois nenhuma implementação funcional mudou; a referência funcional adicional permanece Stage 04. Não houve operação real nos providers, banco ou serviços dos agentes.

## Plano de ativação remota — somente proposto

1. Novo gate autoriza explicitamente commit/publicação; registrar SHA final e validar novamente integridade. Nenhum desses passos foi executado.
2. Executar primeira run push/PR, confirmar runner/Node/npm, instalação Linux/optional binaries, ausência de ambiente de produção, checks funcionais, códigos dos dois audits, artifact completo e cancelamento. O job audit deve permanecer vermelho pelos resíduos enquanto a política atual vigorar.
3. Verificar administrativamente políticas de forks/Actions/token, runners e Vercel; impedir execução de contribuições não confiáveis com segredos de produção. O workflow local não modifica builds automáticos da Vercel nem seus settings.
4. Preparar proteção da main com PR/revisão humana, checks obrigatórios **Validation** e **Dependency audit**, SHA atual, restrição de bypass e proteção de alterações sensíveis. Confirmar os nomes/contextos exatos após a primeira run real, em vez de presumir identificação por texto do YAML. CODEOWNERS/revisão de package/lock/config/workflows/stats podem complementar, mas exigem autorização e configuração obrigatória de review.
5. Com audit vermelho, não usar sucesso runtime como substituto nem ignorar o check para integrar. Remediação oficial ou novo gate para política estreita de exceção é necessário antes de uma integração normal que exija todos os checks verdes. Nenhuma exceção se torna efetiva por existir este pipeline.

Este plano não concede autorização de commit, push, PR, merge, deploy ou mudanças administrativas. Preparação local não fecha SEC-02; Browserslist embutido continua documentado fora da cobertura do audit externo.

## Evidências

Diretório: `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`. Arquivos lot14-stage07-before-hashes.json, action-references.json, actionlint.log, ci.log, tree/lint/typecheck-clean/tests/build-clean.log, audit-all/runtime.json e respectivos exit.txt, environment-presence.json. Cópia limpa e ferramenta actionlint permanecem isoladas nesse diretório. Não houve artefato publicado no GitHub.

**AWAITING HUMAN APPROVAL**
