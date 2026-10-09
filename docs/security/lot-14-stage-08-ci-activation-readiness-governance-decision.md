# Stage 08 — CI Activation Readiness & Governance Decision Report

Data: 09/10/2026. Método: VS Method™ — LOT-14.

**Status: AWAITING HUMAN APPROVAL.** Preparação local verificada; publicação, execução remota, proteção da main e aceitação de risco não realizadas nem autorizadas por este relatório.

## 1. Integridade e escopo

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD e baseline: `ed70452f52a04c6678bcf14e69869b2e368984fb`.

As alterações locais aprovadas de SEC-01/SEC-02, os documentos anteriores e o workflow Stage 07 foram preservados. Permanecem modificados `package.json`, `package-lock.json` e `next-env.d.ts`; `.github/` e `docs/security/` permanecem não rastreados. Este stage acrescenta somente este relatório ao repositório.

| Arquivo | SHA-256 preservado |
| --- | --- |
| package.json | BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E |
| package-lock.json | B14746FC413E2529BEC0A3B0B30943449D19949EF79F53E3E91C296319A63651 |
| next-env.d.ts | 1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37 |
| .github/workflows/ci.yml | FA7ECDF201FBC237D14CD26307BEA327FF18A583B7F154CD2B0C72997BDF0AC2 |

Next.js 16.3.8 e sharp 0.35.5 preservados. Permanecem as resoluções aprovadas de baseline-browser-mapping 2.11.0, source-map-js 1.2.2, brace-expansion 1.1.21/5.0.12, browserslist 4.28.7 e js-yaml 4.3.2, incluindo suas transitivas necessárias. Nenhum override novo.

As exceções `LOT14-EXC-SEC02-BRACES` e `LOT14-EXC-SEC02-BROWSERSLIST-BUNDLE` continuam **DRAFT / NOT EFFECTIVE**, com revisão até 23/10/2026. A aprovação técnica dos stages anteriores não as torna efetivas.

## 2. Actions e requisitos do runner

As referências foram reconferidas nos repositórios oficiais: os três SHAs correspondem às tags indicadas, e seus metadados utilizam Node 24.

| Action | Tag oficial | SHA fixado | Requisito |
| --- | --- | --- | --- |
| checkout | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | Runner ≥ 2.327.1 |
| setup-node | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` | Runner ≥ 2.327.1 |
| upload-artifact | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` | Node 24; verificar runner ≥ 2.327.1 na execução |

Fontes oficiais nos commits efetivos: [checkout README](https://github.com/actions/checkout/blob/3d3c42e5aac5ba805825da76410c181273ba90b1/README.md), [setup-node README](https://github.com/actions/setup-node/blob/949feb2413d6458794dcd2491c4babbbce0c15c1/README.md), [upload-artifact action.yml](https://github.com/actions/upload-artifact/blob/cf430e030ddbb5b0abf93d22962f4752f3646cd9/action.yml).

O requisito adicional de checkout ≥ 2.329.0 refere-se a comandos Git autenticados em Docker container actions, caminho não usado neste workflow. O README de upload-artifact não declara explicitamente o mínimo; a exigência de Node 24 fundamenta a baseline operacional acima. A versão real do runner hospedado permanece pendente da primeira execução. Node da aplicação: 24.16.0; npm: 11.13.0, ambos verificados explicitamente pelo workflow.

## 3. Matriz de controles

| Controle | Evidência local | Estado / limite |
| --- | --- | --- |
| Eventos | push em todas as branches e pull_request; sem filtros de paths | Confirmado; sem pull_request_target |
| Permissões | contents: read; demais permissões não concedidas | Confirmado; sem deploy ou id-token |
| Checkout | persist-credentials: false | Confirmado; clean: false depende do workspace novo do runner hospedado |
| Isolamento | Dois jobs independentes em ubuntu-24.04 | Declarado; execução Linux remota ainda não verificada |
| Segredos | Nenhuma referência a secrets, ambientes de produção ou credenciais de deploy | Confirmado no YAML; políticas externas não verificadas |
| Instalação | npm ci a partir do lockfile; npm ls --all | Confirmado; scripts de instalação ainda executam código das dependências |
| Cache | package-manager-cache: false; sem Action de cache | Confirmado; nenhum cache compartilhado de dependências configurado |
| Timeouts | Jobs: 20 min; etapas: 2–10 min | Confirmado; soma dos máximos pode exceder o limite global |
| Concorrência | Cancela execução anterior do mesmo evento e PR/ref | Confirmado; push e PR têm grupos distintos |
| Validação | lint, typecheck, testes, build | Scripts compatíveis; resultados locais anteriores preservados |
| Audit completo | Exit code original; sem continue-on-error, allowlist ou ocultação | Falha esperada enquanto persistem cinco high |
| Audit runtime | Etapa própria após instalação, inclusive se audit completo falhar | Não constitui check obrigatório independente |
| Evidência | JSON, stderr e exit code; upload com retenção de 14 dias | Verificado sinteticamente; backend remoto pendente |

O token mínimo e a ausência de segredos reduzem privilégios disponíveis ao código de contribuições. Não comprovam sandbox contra acesso à rede, scripts npm maliciosos ou políticas administrativas externas. Não reutilizar este desenho em runner próprio persistente sem nova análise.

## 4. Falhas e preservação dos audits

As condições `!cancelled() && steps.install.outcome == 'success'` do audit runtime e do upload contêm uma função de status. Portanto, não recebem o `success()` implícito que impediria execução após falha anterior. O erro do audit completo permanece no resultado do job. [Semântica oficial de expressões](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions).

Foram executadas seis simulações Bash limitadas, extraindo os scripts reais do YAML e substituindo somente o comando npm por um stub externo ao repositório. Cenários: completo 1/runtime 0; ambos com erro do scanner 2; ambos com vulnerabilidades 1. Todas preservaram o exit code original e os arquivos JSON, stderr e exit-code; o cenário de erro preservou stderr. Isso verifica os scripts, não o motor de condições ou o upload do GitHub.

Limitações: falha antes/concomitante à instalação não produz necessariamente audits; cancelamento, timeout global e perda do runner podem impedir upload. Timeout de etapa pode deixar arquivos parciais e faltar exit-code. `if-no-files-found: error` detecta ausência total, não completude dos seis arquivos. Na primeira execução, verificar os seis arquivos e interpretar JSON e códigos, sem considerar artefato parcial evidência suficiente.

## 5. Validações e riscos residuais

Actionlint 1.7.12 foi reexecutado neste stage: exit 0, sem diagnósticos. ShellCheck e Pyflakes não estavam disponíveis; as simulações Bash cobrem os scripts de audit, não todas as etapas.

Os resultados Stage 07 continuam aplicáveis ao conteúdo preservado: npm ci, npm ls --all, lint, typecheck, 456 testes e build aprovados localmente com Node 24.16.0/npm 11.13.0. Audit completo: exit 1, cinco high; audit runtime: exit 0, zero vulnerabilidades reportadas. Não foram repetidos instalação, build, testes funcionais ou verificações HTTP neste stage sem mudanças nos respectivos arquivos. Não há evidência de nova regressão introduzida pelo Stage 08.

Os cinco high representam a cadeia de braces 3.0.3, advisory `GHSA-vfj7-8cjw-p6xm`, e não cinco explorações comprovadas. A cópia compilada de Browserslist no Next.js permanece risco separado, sem cobertura suficiente do npm audit. A análise Stage 05 continua sendo a referência para alcance e confiança; nenhuma exceção foi ativada. Aprovação local não comprova compatibilidade de produção na Vercel.

## 6. Checks iniciais e decisão de bloqueio

Recomendação para proteção efetiva: exigir **Validation** e **Dependency audit**, com nomes/contextos e origem GitHub Actions confirmados após uma execução real. Dependency audit ficará vermelho enquanto o audit completo permanecer bloqueado; essa proteção impede merge nesse estado e mantém a decisão humana pendente.

É possível observar Validation verde na primeira execução, mas isso não autoriza merge nem aceitação residual. Exigir somente Validation deixaria o audit sem força de bloqueio; essa opção não é recomendada como proteção suficiente enquanto as exceções não forem efetivas. O audit runtime é uma etapa do mesmo job, não um check separado selecionável. Criar outro check exigiria futura alteração autorizada do workflow.

Não selecionar contextos presumidos antes de confirmar os nomes reais, a aplicação emissora e a SHA avaliada. Um status Vercel não substitui esses checks. Não habilitar merge queue neste plano: o workflow não contempla merge_group.

## 7. Plano de ativação — ainda não executado

1. **Gate de publicação:** autorizar expressamente commit, push, PR e primeira execução diagnóstica. Confirmar escopo dos arquivos e responsável humano. Esse gate não inclui merge, deploy, proteção remota ou ativação de exceções.
2. **Verificar integração Vercel antes do push:** o histórico remoto contém status Vercel, mas as configurações atuais de Preview não foram verificadas. A integração pode criar deploys automaticamente em pushes e PRs. Obter evidência das configurações e decisão humana sobre Preview automático ou sua prevenção por mudança separadamente autorizada. O YAML sem privilégios de deploy não impede a integração externa. [Comportamento oficial Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github).
3. **Preparar commit revisado:** incluir explicitamente os três arquivos aprovados de SEC-01/SEC-02, `.github/workflows/ci.yml` e os relatórios/assessment/registros de risco de `docs/security/`. Revisar diff e conteúdo integral dos documentos antes de staging, sem inclusão indiscriminada de arquivos, credenciais ou artefatos locais. Commit proposto: `LOT-14: harden dependencies and add validation CI`. A publicação apenas do workflow deixaria as correções fora da árvore remota.
4. **Publicar somente a branch autorizada:** registrar SHA do commit; primeiro push executará o evento push. Abrir PR inicialmente draft para main, relacionando relatórios e bloqueios. Nenhum merge nesta fase. Registrar separadamente execuções de push e PR.
5. **Inspecionar execução diagnóstica:** verificar runner ≥ 2.327.1, Node/npm exatos, instalação Linux/sharp, árvore, lint/typecheck, 456 testes e build; confirmar full audit vermelho e runtime verde conforme evidência vigente. Comparar qualquer mudança nos advisories, baixar os seis arquivos de audit e registrar run ID, tentativa, SHA, evento e contexts. Falha do scanner ou artefatos incompletos não equivalem ao resultado residual esperado.
6. **Gate administrativo:** aprovar configuração de proteção após os contextos existirem e os resultados serem revisados. Aplicação exclusivamente por pessoa/acesso autorizado em etapa futura.
7. **Gate de merge/riscos:** remediação oficial ou decisão explícita de tratamento residual, com controles verificados e política de CI compatível aprovada em novo stage. Não inferir aprovação das exceções a partir da execução diagnóstica. Deploy e validação de produção exigem autorização própria.

## 8. Proteção recomendada da main

Proposta, não aplicada: PR obrigatório; pelo menos uma aprovação humana independente; descarte de aprovações obsoletas e aprovação do último push por outra pessoa; conversas resolvidas; Validation e Dependency audit obrigatórios com branch atualizada; origem dos checks restrita à aplicação esperada quando disponível; proibir force push e exclusão; aplicar as exigências também aos administradores e desabilitar bypass rotineiro. Confirmar suporte do plano e configuração efetiva antes de declarar controle ativo. [Proteção de branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

O autor não pode aprovar seu próprio PR. A existência de revisor independente com acesso adequado não foi comprovada; caso falte, a governança precisa resolver esse requisito antes de exigir aprovação, sem concessão automática de acesso ou bypass. [Revisões obrigatórias](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews).

Qualquer exceção emergencial de bypass exige decisão humana separada, justificativa, responsável, prazo e restauração dos controles; não está concedida aqui. CODEOWNERS, merge queue e exigência de assinaturas não foram implementados por este plano.

## 9. Evidências locais versus acesso remoto/administrativo

| Item | Resultado / acesso necessário |
| --- | --- |
| Hashes, scripts, YAML, falhas sintéticas | Verificado localmente |
| Tags/SHAs/README das Actions | Verificado em fontes oficiais remotas, somente leitura |
| main remota | SHA da baseline reconfirmada; resposta indica protected=false |
| Proteção detalhada | Consulta anterior retornou 403 por limitação da integração; não comprova proteção ativa |
| Rulesets/checks anteriores | Stage 06: rulesets vazios, sem checks obrigatórios e sem execução Actions; não equivale a inventário administrativo atualizado |
| Token default, aprovação de forks, allowlist de Actions, runners, políticas da organização | Não verificados; requerem acesso administrativo adequado |
| Contexts, runner real, upload/retention efetivo, execução Linux | Requerem primeira execução GitHub Actions |
| Vercel Preview/runtime/configurações | Não verificados; requerem acesso e evidência da plataforma |

## 10. Rollback e critérios de aceite

Antes da ativação administrativa, exportar a configuração existente e registrar o workflow/SHA publicado. Diante de falha material, manter PR bloqueado e suspender novas etapas; investigar a evidência antes de propor alteração. Se necessário, reverter somente a mudança de CI por commit revisado e autorizado, preservando SEC-01/SEC-02. Não usar reset --hard, git clean, force push ou downgrade inseguro.

Reverter workflow pode deixar checks obrigatórios pendentes. Qualquer ajuste de proteção exige novo gate administrativo, controle explícito de bloqueio de merges e restauração verificável; não remover exigências automaticamente. Push de rollback também pode disparar Vercel, portanto depende da mesma decisão sobre deploy automático. Neste stage, nenhuma alteração remota exige rollback.

Aceite da primeira execução: Validation aprovada; versão do runner/Node/npm registrada; lockfile consistente; testes/build Linux aprovados; resultado de ambos os audits interpretável; seis arquivos íntegros preservados; nenhum segredo de produção utilizado; SHA/contextos corretos; cinco high visíveis caso continuem presentes. O workflow inteiro não será declarado aprovado enquanto Dependency audit falhar.

Aceite da proteção: evidência administrativa de regras efetivas, checks de origem correta, revisão independente disponível, ausência de bypass rotineiro e comportamento de bloqueio validado. Aceite de risco é uma decisão separada, condicionada aos registros e controles; não ocorreu.

## 11. Decisões humanas pendentes

- Autorizar ou adiar publicação e primeira execução diagnóstica.
- Resolver a possibilidade de Preview automático Vercel antes do push.
- Aprovar checks obrigatórios com Dependency audit bloqueante e a proteção proposta, incluindo revisor independente.
- Confirmar responsáveis/revisão das exceções e decidir seu tratamento em gate separado; ambas continuam DRAFT / NOT EFFECTIVE.

Recomendação: avançar somente após o gate de publicação e a decisão sobre efeitos Vercel, mantendo merge bloqueado. Evidência local favorável não substitui execução GitHub nem verificação administrativa.

Evidências auxiliares fora do repositório: `lot14-stage08-before-hashes.json`, `lot14-stage08-readiness-evidence.json` e `lot14-stage08-audit-probes.json`, no diretório de evidências local `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`.

**AWAITING HUMAN APPROVAL**
