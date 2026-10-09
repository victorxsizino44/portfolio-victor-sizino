# Stage 10 — Vercel Preview Deployment Isolation Implementation & Verification Report

VS Method™ — LOT-14. Data: 09/10/2026.

**Status: AWAITING HUMAN APPROVAL.** Configuração local implementada e validada no escopo utilizado; eficácia na Vercel ainda não comprovada por execução real. Stage 11 não iniciado.

## Baseline e contexto

Branch confirmada: `codex/lot-14-portfolio-security-hardening`. HEAD/baseline preservado: `ed70452f52a04c6678bcf14e69869b2e368984fb`.

Contexto remoto fornecido como confirmado pela Human Governance neste stage: projeto `portfolio-victor-sizino`, integração GitHub conectada, Production Branch `main`, Preview para branches não atribuídas e Standard Protection habilitada. Esses fatos atualizam as lacunas do Stage 09; não foram reconfirmados por acesso administrativo pelo agente. Root Directory remoto não foi informado nem verificado.

Working tree preexistente: package.json, package-lock.json e next-env.d.ts modificados; .github/ e docs/security/ não rastreados. Alterações aprovadas e documentos anteriores preservados por comparação de hashes. Não houve instalação, atualização de dependências, alteração funcional ou descarte de arquivos.

## Arquivos e configuração

Acrescentados exclusivamente:

- `vercel.json`, na raiz do repositório.
- `docs/security/lot-14-stage-10-vercel-preview-isolation-implementation-verification.md`, este relatório.

Configuração implementada:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "codex/lot-14-portfolio-security-hardening": false
    }
  }
}
```

Uma única exclusão literal, sem wildcard, regra global ou habilitação sobreposta. Main e todas as outras branches permanecem habilitadas por padrão, sem sobrescrever suas políticas externas. Não acrescentar `"*": true`: uma correspondência true sobreposta pode permitir deployment da branch excluída. [Semântica oficial de git.deploymentEnabled](https://vercel.com/docs/project-configuration/git-configuration).

Não foram alterados comandos de build/install, framework, runtime, domínios, ambientes, autenticação, proteção, variáveis, integrações ou workflow. O arquivo limita somente deployments automáticos via Git da branch indicada; não desabilita deployment manual/CLI, hooks ou promoção por outros mecanismos.

## Root Directory e conflitos

Root Directory **esperado localmente: `.`**, raiz do repositório. A inspeção encontrou somente um package.json do projeto, com scripts Next.js, ao lado de next.config.js e app/. Não foram encontrados vercel.json, vercel.toml, vercel.ts ou .vercel/project.json preexistentes na árvore do projeto inspecionada, excluindo dependências e artefatos de build. Nenhum conflito local identificado.

O arquivo deve estar na raiz do projeto reconhecida pela Vercel. [Configuração estática oficial](https://vercel.com/docs/project-configuration/vercel-json). Antes de publicação, confirmar que o Root Directory remoto é a raiz do repositório e que nenhum caminho/configuração alternativo torna este arquivo ineficaz. Se for diferente, interromper a publicação e revisar a localização por novo gate; não mudar settings automaticamente. Identificar também outros projetos conectados ao mesmo repositório e suas raízes.

## Validação técnica

Schema oficial baixado de `https://openapi.vercel.sh/vercel.json` em 09/10/2026, sem autenticação ou alteração remota. SHA-256 da cópia: `4493cbebf8c320b79d1ef18fb5aa99b0962469857e414ff67cba9cfc0d481eb3`.

JSON.parse aprovado. Utilizado Ajv 6.15.0 já instalado, com suporte ao Draft 04 declarado pelo schema. A compilação do **schema completo** foi rejeitada: campos não utilizados de functions/services/experimentalServicesV2 declaram exclusiveMinimum numérico, incompatível com o Draft 04 indicado. Essa falha é registrada, não tratada como aprovação integral do schema.

Validação concluída com os trechos oficiais **inalterados** de `$schema` e `git`, incluindo type/additionalProperties da raiz. Todos os campos presentes em vercel.json estão cobertos por esse recorte. Asserções adicionais garantem somente as chaves autorizadas e exatamente a entrada literal false. Controle negativo rejeitou string `"false"` no lugar de booleano. Não foi alterada a cópia do schema oficial nem instalado tooling adicional.

Minimatch 3.1.5 já instalado foi usado para modelar a correspondência documentada. Onze cenários passaram. Este é um teste local da regra e da semântica documentada, não o motor privado nem uma execução da Vercel.

| Branch sintética | Deployment automático no modelo | Resultado |
| --- | --- | --- |
| codex/lot-14-portfolio-security-hardening | Desabilitado | PASS |
| main | Habilitado | PASS |
| master | Habilitado | PASS |
| develop | Habilitado | PASS |
| feature/example | Habilitado | PASS |
| codex/lot-13-catalog | Habilitado | PASS |
| codex/lot-14-portfolio-security-hardening-v2 | Habilitado | PASS |
| codex/lot-14-portfolio-security-hardening/child | Habilitado | PASS |
| codex/lot-14-portfolio-security | Habilitado | PASS |
| prefix/codex/lot-14-portfolio-security-hardening | Habilitado | PASS |
| Codex/lot-14-portfolio-security-hardening | Habilitado | PASS |

Nenhuma dessas branches foi criada ou publicada para o teste. A preservação universal das demais branches decorre da chave literal única e do default documentado; os cenários verificam exemplos e nomes semelhantes.

## Integridade e diff

Hashes anteriores preservados para manifest, lockfile, next-env.d.ts, next.config.js, CI, assessment, registros de exceção e relatórios Stages 02–09. Em especial:

| Arquivo | SHA-256 preservado |
| --- | --- |
| package.json | BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E |
| package-lock.json | B14746FC413E2529BEC0A3B0B30943449D19949EF79F53E3E91C296319A63651 |
| next-env.d.ts | 1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37 |
| .github/workflows/ci.yml | FA7ECDF201FBC237D14CD26307BEA327FF18A583B7F154CD2B0C72997BDF0AC2 |

Next.js 16.3.8, sharp 0.35.5 e as correções transitivas SEC-02 permanecem no lockfile preservado. O audit completo continuará bloqueante conforme Stage 08; não foi enfraquecido para permitir publicação. Exceções braces e Browserslist continuam **DRAFT / NOT EFFECTIVE**.

git diff --check aprovado para alterações rastreadas; o novo JSON também foi validado por parse/schema aplicável. O incremento Stage 10 consiste nos dois arquivos listados, sem alteração dos arquivos preexistentes comparados. Não foram repetidos lint/build/456 testes: o stage não altera runtime ou seus scripts; as validações locais anteriores permanecem referência, sem nova alegação de execução.

## Limitações e riscos residuais

- Configuração ainda não publicada; nenhuma prova de processamento da regra pela Vercel no primeiro push ou em PR.
- Root Directory e inventário de outros projetos precisam confirmação antes de publicar.
- O efeito esperado exige que a integração leia este vercel.json da revisão publicada. Confirmar essa condição na primeira execução autorizada, sem declarar isolamento completo antecipadamente.
- Bloqueio de deployment automático não elimina necessariamente webhook, status, logs ou registros Vercel. Standard Protection é controle de acesso separado, não substituto desta regra.
- Deployments existentes não são cancelados ou removidos; mecanismos manuais/externos continuam sujeitos à governança.
- Schema completo não compilável com seu dialeto declarado; validação foi explicitamente limitada aos campos oficiais utilizados. Se a plataforma rejeitar a configuração ou ignorá-la, interromper publicação adicional e apresentar alternativa; não fazer fallback global automático.
- Alteração/remoção futura do mapa ou renomeação da branch pode reabilitar deployments. Revisão humana de configuração continua necessária.

## Rollback e publicação controlada

Antes de publicar, rollback consiste em decisão humana para retirar a nova configuração, preservando todo o trabalho anterior; nenhuma exclusão foi executada neste stage. Depois de publicação autorizada, propor commit revisado que remova apenas a regra/arquivo criado, pois não havia configuração anterior. Não usar reset --hard, git clean ou force push. Remover a regra pode disparar deployment no próprio push de rollback: obter autorização de seus efeitos antes de executar.

Recomendação: considerar a implementação local pronta para revisão, condicionando o próximo gate à confirmação do Root Directory `.` e do alcance da integração. O futuro gate deve autorizar explicitamente commit/push/PR e diagnóstico GitHub Actions, incluindo vercel.json desde o primeiro push. Publicar somente a branch aprovada, sem merge ou deploy manual; observar a ausência de build/deployment automático LOT-14 e os artefatos/checks do CI. Se surgir deployment inesperado, interromper novas operações e solicitar decisão humana, sem alteração remota automática.

Main e outras branches não devem ser publicadas como teste. A ausência de bloqueio indevido nelas foi modelada localmente; preservação operacional deve ser observada em eventos legítimos posteriormente autorizados. Não ativar exceções nem declarar SEC-02 integralmente resolvido.

Evidências auxiliares externas ao repositório: `lot14-stage10-before-hashes.json`, `lot14-stage10-final-integrity.json`, `lot14-stage10-vercel-schema.json`, `lot14-stage10-validate.cjs` e `lot14-stage10-validation.json`, no diretório `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`.

**AWAITING HUMAN APPROVAL**
