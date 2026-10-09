# Stage 12 — First-Push Deployment Containment Decision Report

VS Method™ — LOT-14. Data: 09/10/2026.

**Resultado: BLOCKED para publicação com garantia prévia de ausência de deployment indesejado. Status: AWAITING HUMAN APPROVAL.** Existem mecanismos administrativos anteriores ao push, mas nenhum foi ativado/verificado como contenção. A regra versionada continua tecnicamente válida e ainda não foi exercitada remotamente.

## 1. Escopo e preservação

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD/baseline: `ed70452f52a04c6678bcf14e69869b2e368984fb`.

Os **18 arquivos** do inventário Stage 11 foram comparados com seus hashes aprovados e preservados integralmente, incluindo vercel.json, CI, SEC-01/SEC-02, assessment, relatórios e registros de exceção. Neste stage foi acrescentado somente este relatório; nenhum arquivo de configuração foi alterado. Nenhum commit, push, PR, merge, deploy ou alteração administrativa ocorreu. Valores secretos não foram acessados. Exceções SEC-02 continuam **DRAFT / NOT EFFECTIVE**; SEC-03/SEC-04 não iniciados.

## 2. Evidência disponível

Stage 11 comprovou por leitura autenticada: Root Directory vazio/raiz, Production Branch main, Preview para branches não atribuídas, vínculo com o repositório correto, Standard Protection ativa, Ignored Build Step Automatic, Node.js 24.x e ausência de ambientes customizados. Um projeto foi identificado no único escopo acessível; vínculos em contas/equipes inacessíveis permanecem fora do inventário.

Neste Stage 12 foi reconferida somente a seção **Branch Tracking do Preview**, com sessão autenticada e sem alterações. O checkbox estava ativo e habilitado para edição; a política exibida era All unassigned branches. A instrução oficial da interface informa que o tracking cria deployments de branches não associadas a outro ambiente; quando desativado, CLI/API ainda podem criar deployments. Essa evidência comprova disponibilidade e semântica declarada do controle, não sua eficácia após mudança, pois nenhuma mudança foi feita.

Fonte autenticada: [Preview environment settings](https://vercel.com/victorvsp-8899s-projects/portfolio-victor-sizino/settings/environments/preview). Metadados não secretos foram registrados fora do repositório. A documentação geral também descreve Preview automático por push não produtivo e PR. [Environments](https://vercel.com/docs/deployments/environments).

## 3. Regra versionada e primeiro evento Git

O arquivo aprovado mantém exclusivamente:

```json
"git": {
  "deploymentEnabled": {
    "codex/lot-14-portfolio-security-hardening": false
  }
}
```

O mapa oficial deixa branches não especificadas habilitadas e permite deployment se houver correspondência true sobreposta. A regra literal não afeta main nem as demais branches e não contém tal sobreposição. [Git Configuration](https://vercel.com/docs/project-configuration/git-configuration).

A configuração na raiz é compatível com o Root Directory confirmado. **Esperado:** a integração considerar o arquivo presente na revisão enviada já no primeiro evento. **Não comprovado:** qual revisão é lida pelo serviço em cada fase do primeiro evento, atomicidade, ausência de objeto de deployment, build ou Preview antes da aplicação da exclusão. As fontes consultadas não documentam garantia específica desse bootstrap; não houve evento experimental.

Não há incompatibilidade identificada que justifique alterar vercel.json. Tampouco há fundamento para publicar a configuração previamente em main como requisito; isso ampliaria o escopo para produção. O primeiro commit eventualmente publicado deve conter o arquivo, preservando essa camada adicional, mas ela sozinha não satisfaz a exigência de garantia prévia verificada.

**Risco residual explícito:** Preview/build/deployment automático inesperado no primeiro push, enquanto não existe contenção administrativa anterior ao evento. Possível risco não significa exploração, falha ou race condition comprovada no projeto.

## 4. Três controles diferentes

| Tipo | O que controla | O que não comprova |
| --- | --- | --- |
| Bloqueio de build | Ignored Build Step pode cancelar o build | Ausência de deployment/registro, webhook ou processamento inicial |
| Bloqueio de criação automática | Branch Tracking/Deployment Sources/vínculo Git limitam caminhos que criam deployments | Ausência de caminhos manuais/API/hook não cobertos ou de eventos já enfileirados |
| Proteção de acesso | Standard Protection exige autenticação nos URLs cobertos | Bloqueio de build/criação, isolamento de backend ou ausência de exceções |

Ignored Build Step retorna 0 para skip e 1 ou maior para permitir build. Um erro pode permitir o build; portanto não é um bloqueio seguro por si só. Builds cancelados por esse mecanismo contam nos limites de deployments/concurrency. [Guia oficial](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel), [Monorepos](https://vercel.com/docs/monorepos).

Proteção de acesso continua útil, mas não substitui contenção de disparo. [Deployment Protection](https://vercel.com/docs/deployment-protection). Desativar comentários/statuses também não desativa deployment; não se recomenda ocultar evidências.

## 5. Mecanismos anteriores ao primeiro push

| Mecanismo | Aplicação antes do push | Impacto esperado e limites | Avaliação |
| --- | --- | --- | --- |
| vercel.json aprovado | Existe localmente, entra no evento quando publicado | Somente LOT-14; depende da leitura remota do arquivo | Manter; insuficiente para garantia prévia demonstrada |
| **Desativar temporariamente Branch Tracking do Preview** | Setting remoto disponível no projeto, independente do novo commit | Interrompe criação automática por tracking de todas as branches não atribuídas; Production tracking separado; CLI/API continuam possíveis | **Opção administrativa preferida no plano atual**, sujeita a gate e releitura persistida |
| Ignored Build Step exato para LOT-14 | Setting remoto possível antes do evento | Pode preservar builds de outras branches; deployment cancelado/registro ainda possível; erros e precedência devem ser avaliados | Alternativa se o objetivo aceitar cancelamento de build/registro; não cumpre zero início de deployment |
| Desconectar Git somente deste projeto | Setting documentado antes do push | Suspende automação Git também de main e outras branches; mantém outros mecanismos; reconexão exige análise de eventos | Fallback com abrangência maior e janela de congelamento |
| Deployment Sources com Git bloqueado apenas para Preview | Política remota independente do arquivo; precisa estar enforced | Bloqueia mecanismo Git no ambiente escolhido, preservando regra de Production; CLI/API/hook são fontes independentes | Oficial para Pro/Enterprise; **não disponível no plano Hobby observado**, sem upgrade autorizado |
| Repo diagnóstico separado sem vínculo Vercel | Isolamento do destino antes de publicar | Sem alteração no projeto original; cópia/publicação em outro destino e checks sem contexto do PR original | Alternativa se mudanças administrativas no projeto não forem admitidas; criação/publicação requerem novo gate |
| Pausar projeto / desativar promoção produtiva | Settings remotos possíveis | Pausar causa 503 em produção; desativar promoção ainda cria deployments | Rejeitado para este objetivo |

Deployment Policies controla Git Sources e Deployment Sources por ambientes; exige Pro/Enterprise e Owner. Não se trata de uma exclusão exata por nome de branch e não se propõe upgrade. [Deployment Policies](https://vercel.com/docs/deployments/deployment-policy).

A desconexão por Settings → Git → Connected Git Repository → Disconnect é documentada oficialmente. Não foi acionada. [Git settings](https://vercel.com/docs/project-configuration/git-settings). Pausar projeto interfere no serviço produtivo com 503, portanto não é contenção proporcional. [Managing projects](https://vercel.com/docs/projects/managing-projects).

Não alterar Production Branch, permissões da GitHub App, autenticação, segredos ou hooks como atalho. Verified Commits/Fork Protection não são controles apropriados para bloquear a publicação autorizada de uma branch interna. Nenhum mecanismo consultado permite garantir ausência absoluta de todo log/status/objeto Vercel em todos os caminhos e contas sem verificação adicional.

## 6. Efeitos da opção preferida

Desativar Preview Branch Tracking antes do push evita depender exclusivamente do novo arquivo para controlar esse caminho de criação, conforme a semântica da interface. A hipótese operacional pressupõe main ainda associada a Production, nenhum ambiente customizado que capture LOT-14, configuração efetiva persistida e ausência de outro projeto/caminho externo que faça deploy.

| Área | Efeito esperado | Verificação necessária |
| --- | --- | --- |
| Produção existente | Não pretende alterar deployment servido, domínio ou autenticação | Registrar deployment produtivo atual; confirmar setting Production/main inalterado e disponibilidade sem chamadas funcionais de agentes |
| Novos pushes main | Tracking de Production continua habilitado | Comparar configuração anterior/posterior; não fazer push de teste |
| Outras branches não atribuídas | Novos Previews automáticos ficam temporariamente suspensos | Aprovar janela de suspensão; coordenação humana de outros trabalhos |
| Previews existentes | Não há proposta de cancelar, excluir ou mudar proteção de deployments existentes | Registrar IDs/estados relevantes; preservação de serviço não foi testada nesta avaliação |
| Integração Git | Vínculo permanece conectado | Releitura da seção Git; não alterar instalação GitHub |
| GitHub Actions | Eventos push/PR e workflow continuam disponíveis | Primeira execução posterior exige publicação autorizada; desativar tracking Vercel não altera YAML |
| CLI/API/hooks/integrações externas | Não ficam automaticamente contidos por esse checkbox | Congelamento operacional e confirmação dos responsáveis; não consultar valores secretos |

Assim, a opção exige aceitação explícita de **suspensão temporária de novos Previews de outras branches**. Não existe, entre os controles comprovados no plano Hobby, contenção administrativa exata só LOT-14 que simultaneamente garanta zero início de deployment e preserve todos os novos Previews de outras branches. Se esse efeito for inadmissível, manter bloqueio e avaliar destino diagnóstico separado.

## 7. Procedimento proposto de ativação e aceite

**Somente plano; nenhuma etapa de mutação está autorizada por este relatório.**

1. Gate humano deve definir o objetivo: nenhum deployment automático LOT-14 iniciado, versus nenhum build executado, versus ausência absoluta de qualquer registro. Definir escopo de projeto/contas, janela, responsável administrativo e resposta a incidente. Não aceitar implicitamente Preview residual.
2. Reconfirmar os 18 arquivos e incluir este relatório somente se aprovado no próximo inventário. Congelar novos eventos concorrentes no projeto durante a janela; não conceder acessos ou mudar regras automaticamente.
3. Registrar estado anterior: projeto/escopo, Root Directory, Production/main, Preview tracking true, Standard Protection, vínculo Git, deployments ativos/enfileirados e SHA produtiva. Confirmar outros projetos com o responsável do repositório; ausência no escopo visível não é inventário global.
4. Com autorização específica, administrador desativa **somente Branch Tracking de Preview**. Aplicar pelo fluxo normal e recarregar a página. Registrar checkbox false persistido e evento de atividade, se disponível. Confirmar main, proteção, domínios e vínculo inalterados. Sem evidência persistida, **não publicar**.
5. Resolver, por decisão humana, eventos/filas já existentes e automações independentes. O controle não comprova cancelamento de algo iniciado antes de sua ativação. Não cancelar/excluir/redeployar automaticamente.
6. Gate de publicação separado: commit inicial contém vercel.json e toda a árvore aprovada; conferir SHA/arquivo/branch antes do primeiro push. Nenhum push intermediário sem a regra. Publicar somente a branch LOT-14 e observar por SHA, adiando PR para reduzir eventos até concluir a primeira observação.
7. Registrar execução GitHub Actions e atividade Vercel. Aceite de contenção do evento requer ausência de deployment/build automático LOT-14, com janela de observação definida no gate e auditoria de eventos suficiente; não usar silêncio momentâneo como prova. Se aparecer um deployment, registrar ID/target/SHA/estado e interromper novos eventos.
8. Validar CI conforme Stage 08: Validation esperado aprovado; Dependency audit continua bloqueante pelos cinco high se persistirem. Preservar artifacts dos audits; nenhuma exceção/ocultação para produzir status verde.

Releitura de checkbox antes do push comprova configuração ativa; comportamento só pode ser observado após evento real autorizado. Não equivale a garantia matemática de funcionamento do serviço externo. Se zero risco residual for requisito absoluto, permanecer sem publicação no repositório conectado e avaliar isolamento do destino GitHub com governança própria.

## 8. Rollback e restauração

Se houver falha ao configurar/reler o controle antes de publicar, parar sem push e propor restauração do checkbox ao estado registrado, mediante autorização. Não usar deployment como teste. Se a configuração administrativa não for permitida, a publicação continua bloqueada.

Depois do diagnóstico, **não reativar Preview tracking automaticamente**: reativação pode permitir novos eventos e a regra versionada ainda exige evidência de reconhecimento remoto. Planejar confirmação oficial/suporte ou observação autorizada dessa condição, revisão de filas e novo gate de restauração. Reativação restaura a criação automática de Previews das demais branches; comportamento de replay de eventos anteriores não foi comprovado.

Qualquer nova publicação/reconexão deve manter vercel.json no SHA alvo. Não remover o arquivo como rollback de contenção: isso reabilitaria LOT-14 e pode disparar deployment no próprio push. Não reverter SEC-01/SEC-02 ou usar reset --hard, git clean ou force push. Revert não elimina Preview já criado. Cancelamento/exclusão de deployment, desconexão ou intervenção administrativa adicional exige autorização explícita.

O plano de restauração deve registrar: estado anterior/atual, responsável, momento de alteração, produção preservada, decisão sobre filas e critério de encerramento da janela. A governança deve evitar deixar suspensão temporária sem responsável/prazo. Nenhuma restauração é necessária agora porque nada foi ativado.

## 9. Riscos residuais e decisão necessária

| Risco | Estado atual / tratamento |
| --- | --- |
| Preview no primeiro push | **Residual e não aceito**; regra versionada não exercitada; controle administrativo ainda ativo para criação |
| Outros projetos ou caminhos CLI/API/hooks | Não cobertos pelo inventário/checkbox; requer confirmação operacional, sem revelar segredos |
| Eventos em fila e reativação | Efeitos não verificados; revisar antes de ativação/restauração |
| Backend compartilhado de Preview | Stage 11 mostrou bindings em Production/Preview; proteção de acesso não comprova isolamento |
| Suspensão de outros Previews | Efeito da contenção proposta, exige aprovação específica |
| Produção | Não alterar main/domínios/proteção; usar controle Preview, evitando pause e bloqueio Git global |

**Decisão proposta para o próximo gate:** autorizar uma janela administrativa limitada para desativar/reler Preview Branch Tracking, assumindo suspensão temporária de novos Previews das outras branches, mantendo produção e integração conectadas. Autorizar publicação somente depois da evidência dessa contenção e da revisão dos caminhos/filas. Essa autorização é distinta de autorizar commit/push/PR, restauração, deploy, merge ou aceitação SEC-02.

Alternativa se não forem aceitas mudanças administrativas ou suspensão de Previews: autorizar avaliação de repositório diagnóstico sem vínculo Vercel, sem criar/publicar nada neste stage. Manter validações locais até essa decisão. Não recomendar primeiro push exploratório com Preview potencial não autorizado.

**BLOCKED no estado atual** para a garantia exigida. A estratégia proposta poderá sustentar um gate **CONDITIONAL** após aprovação e confirmação dos controles; READY depende de critérios e evidências definidos pelo gate, sem presumir eficácia remota.

## 10. Evidência e encerramento

Os hashes dos 18 arquivos Stage 11 foram preservados; git diff --check aprovado para os arquivos rastreados. Não foram executadas instalação, testes funcionais, deployment ou mudanças de configuração. Evidência externa: `lot14-stage12-before-integrity.json`, `lot14-stage12-final-integrity.json` e `lot14-stage12-containment-evidence.json`, em `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`.

**AWAITING HUMAN APPROVAL**
