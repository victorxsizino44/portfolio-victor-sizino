# LOT14-EXC-SEC02-BRACES — Registro de exceção temporária condicional

**DRAFT — NOT EFFECTIVE — AWAITING HUMAN APPROVAL**. Preparado em 09/10/2026. Não é waiver ativo, dispensa de alerta ou autorização de deploy.

| Campo | Registro |
|---|---|
| Responsável proposto | Victor Sizino — Human Governance Authority e responsável pelo repositório; confirmação de designação no próximo gate |
| Executor proposto do acompanhamento | Victor Sizino; apoio técnico somente sob autorização |
| Aprovador | Human Governance; aprovação específica desta exceção ainda pendente |
| Revisão e expiração máxima | 23/10/2026, 23:59, America/Sao_Paulo; sem renovação automática |
| Data de início efetivo | Nenhuma; somente após controles verificados e novo gate registrado |
| Branch / baseline | codex/lot-14-portfolio-security-hardening / ed70452f52a04c6678bcf14e69869b2e368984fb |
| Objeto | braces 3.0.3; GHSA-vfj7-8cjw-p6xm / CVE-2026-93687 |

Risco: recursão sem limite de profundidade pode interromper processo que consome padrões aninhados. Cadeia: eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces. Severity oficial high; contextual baixa nas condições locais verificadas, com potencial impacto alto na disponibilidade de lint/CI. Não há patch oficial publicado nas consultas Stage 05. Não há demonstração de exploração pública no portfólio.

Escopo máximo da eventual exceção: apenas essa cadeia de desenvolvimento nas versões aprovadas e com ausência de settings.next.rootDir contendo globs não confiáveis. Não inclui novos advisories, versões, runtime ou outros achados SEC. Os cinco pacotes high no audit são a propagação deste advisory; não autoriza excluir todos os high.

Evidência: Stage 05 calculou configuração efetiva sem settings.next, confirmou o ramo de glob não acionado, inspecionou walkers e traces locais. Stage 06 confirmou ausência de workflow, main sem proteção/checks obrigatórios, rulesets vazios e ausência de execuções Actions. Portanto os controles do processo **ainda não sustentam ativação**.

Condições precedentes obrigatórias:

1. Evidência de C03/C04/C05/C06/C07/C08/C10 do relatório Stage 06: instalação por lock revisado, runner isolado sem segredos de produção, token mínimo, limites de tempo, revisão de globs/configuração e proteção/checks obrigatórios.
2. Run dos checks no SHA efetivamente proposto, com lint/typecheck/testes/build aprovados e audit completo preservado. Não confundir evidência local com check obrigatório remoto.
3. Registro explícito de responsável, controles verificados, artefatos, decisão humana e prazo. Falha de qualquer condição mantém este registro não efetivo.

Tratamento recomendado agora: **adiar/rejeitar a ativação no estado atual**, mantendo o draft. Após comprovação dos controles, Human Governance pode aprovar aceitação temporária limitada ou exigir remediação por release oficial/substituição de tooling em escopo separado. Nenhuma decisão foi tomada automaticamente.

Expiração antecipada/reabertura: patch oficial publicado; mudança da cadeia/versão; introdução de rootDir glob ou padrões externos; execução de código não confiável com privilégios/segredos; falha de isolamento, timeout ou revisão; evidência runtime; novo advisory; incidente; perda de proteção/checks. Em qualquer gatilho, suspender a elegibilidade da exceção e apresentar novo gate. Expiração não equivale a atualização, rollback ou deploy automático.

Acompanhamento proposto: consultas manuais em 09/10, 16/10 e 23/10, e a cada mudança de lock/configuração, ao registry braces e [PR upstream #72](https://github.com/micromatch/braces/pull/72), [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Registrar data, versão publicada, fonte e decisão. Não instalar PR/fork nem assumir versão fictícia como patch. Manter audit bruto e alertas visíveis; não dismiss, ignore global, filtro de severidade ou desativação de auditoria.

Critério de encerramento por correção: release oficial compatível demonstrada no lock e árvore, desaparecimento deste advisory, instalação reproduzível e validação integral; aprovação humana de encerramento. Exceção temporária não fecha SEC-02.

Decisão humana pendente: confirmar responsável; autorizar implementação dos controles em novo escopo; após evidência, aceitar/rejeitar este risco individualmente e registrar condições/prazo. **AWAITING HUMAN APPROVAL**.
