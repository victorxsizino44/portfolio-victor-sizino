# Stage 13 — Administrative Containment Activation & Verification Report

Status: AWAITING HUMAN APPROVAL. Publicação permanece BLOCKED.

## Autorização e janela

Responsável: Victor Sizino. Autorização humana explícita para desativar exclusivamente Preview Branch Tracking. Início da execução: 09/10/2026, 01h51 BRT (04h51 UTC). Verificação concluída: 01h53 BRT (04h53 UTC). Encerramento previsto da janela: 09/10/2026, 04h00 BRT. Não há autorização para restauração automática. A configuração continuará desativada até nova decisão humana; o encerramento da janela não reativa o controle.

Projeto autenticado: `portfolio-victor-sizino`. Equipe: `victorvsp-8899's projects` (Hobby).

## Execução e evidências

Em Settings → Environments → Preview, o estado anterior era Branch Tracking habilitado, com correspondência All unassigned branches. Foi desativado somente esse toggle, seguido de Save e recarga da página. A leitura do checkbox após recarga confirmou `checked: false`. Essa persistência é evidência administrativa real; nenhum evento Git ou deployment foi executado para testar o comportamento.

| Controle | Antes | Depois / evidência |
|---|---|---|
| Preview Branch Tracking | Habilitado | Desabilitado após salvar e recarregar |
| Production Branch | main | main; descrição de deployment a cada commit preservada |
| Auto-Assign Custom Production Domains | Habilitado | Habilitado |
| GitHub Integration | Conectada | victorxsizino44/portfolio-victor-sizino, Connected Jun 11 |
| Vercel Authentication | Habilitada, Standard Protection | Checkbox habilitado, Standard Protection |

As tentativas iniciais de interação direta com o input não alteraram seu estado. O clique no label visível alterou somente o toggle pretendido; Save e recarga confirmaram o resultado. Não foram revelados valores de variáveis, acionados outros controles ou excluídos deployments.

Evidências JPEG armazenadas fora do repositório em `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`:

- `stage13-activation-before.jpg`
- `stage13-activation-after.jpg`
- `stage13-production-after.jpg`
- `stage13-git-after.jpg`
- `stage13-protection-after.jpg`

## Integridade local

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD: `ed70452f52a04c6678bcf14e69869b2e368984fb`. Working tree contém as alterações locais preexistentes de SEC-01/SEC-02, CI e documentos. Hashes de package.json, package-lock.json, ci.yml e vercel.json coincidem com os aprovados. Única adição local desta execução: este relatório. Não houve commit, push, PR, merge, deploy, alteração de dependências, CI ou código funcional.

## Limitações e próximo gate

Novos Previews automáticos por Branch Tracking das branches não atribuídas ficam suspensos. A própria UI informa que deployments via CLI ou API continuam possíveis: o controle não comprova bloqueio de todos os mecanismos, eventos ou registros Vercel. Não foi realizado teste de primeiro push, nem inventário comparativo completo dos deployments existentes; nenhum deployment existente foi manipulado. Domínios não foram editados; não houve comparação exaustiva de todas as suas propriedades nesta execução.

Exceções SEC-02 permanecem DRAFT / NOT EFFECTIVE. Nenhum agendamento de restauração foi criado. A validação terminou dentro da janela; qualquer atividade adicional ou extensão exige o gate correspondente. Recomenda-se decisão humana separada sobre publicação controlada e primeira execução do CI, mantendo a contenção até essa decisão. Eventual rollback requer autorização explícita para reabilitar exclusivamente Preview Branch Tracking e verificar sua persistência; não será automático.

**AWAITING HUMAN APPROVAL**
