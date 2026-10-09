# LOT14-EXC-SEC02-BROWSERSLIST-BUNDLE — Registro de exceção temporária condicional

**DRAFT — NOT EFFECTIVE — AWAITING HUMAN APPROVAL**. Preparado em 09/10/2026. Não é waiver ativo, dispensa de alerta ou autorização de deploy.

| Campo | Registro |
|---|---|
| Responsável proposto | Victor Sizino — Human Governance Authority e responsável pelo repositório; confirmação de designação no próximo gate |
| Executor proposto do acompanhamento | Victor Sizino; apoio técnico somente sob autorização |
| Aprovador | Human Governance; aprovação específica desta exceção ainda pendente |
| Revisão e expiração máxima | 23/10/2026, 23:59, America/Sao_Paulo; sem renovação automática |
| Data de início efetivo | Nenhuma; somente após controles verificados e novo gate registrado |
| Branch / baseline | codex/lot-14-portfolio-security-hardening / ed70452f52a04c6678bcf14e69869b2e368984fb |
| Objeto | Browserslist 4.28.1 compilado no Next 16.3.8; GHSA-73wf-gq98-2v4g e GHSA-c83g-rgw3-j3cx |

Riscos: stats não confiáveis podem gerar TypeError/escrita no protótipo do acumulador; consultas distintas acumuladas em processo duradouro podem esgotar memória. Defeito stats reproduzido com entrada pequena no Stage 05; cache sem eviction confirmado estaticamente, sem exaustão. Severity oficial high; risco contextual baixo nas entradas atuais, médio para integridade/disponibilidade do build se stats/configuração não confiáveis forem introduzidos. Confiança alta no defeito; produção e controles externos não verificados.

Escopo máximo da eventual exceção: bundle identificado por SHA-256 `44CCD5540448327464887AE6B9E7F5BB99506DFAC6A8DA54D942074DAFD23905`, com Next 16.3.8 e uso de build verificado. Não inclui queries/stats fornecidos por clientes, novos consumidores runtime, outros bundles/advisories ou mudança de versão sem reavaliação. O Browserslist externo 4.28.7 já corrigido permanece preservado. Audit runtime zero não comprova correção do bundle.

Controles locais parciais: configuração Browserslist ausente; ausência de stats nos ancestrais inspecionados; helper Next captura exceção e retorna targets padrão, com possível fallback silencioso; nenhuma correspondência nos 25 traces locais. Não são garantia global nem política de CI. Next 16.4.0 inspecionado no Stage 05 tinha bundle idêntico; upgrade não deve ser tratado como remediação.

Condições precedentes obrigatórias:

1. C03/C04/C05/C06/C07/C08/C09/C10 do relatório Stage 06 comprovados: revisão de lock/configuração/stats/queries, build isolado, privilégios mínimos, timeouts e checks/revisão obrigatórios.
2. Confirmar ambiente de build e diretórios/variáveis de configuração efetivos sem expor valores sensíveis. Evidenciar que entradas não confiáveis não chegam a stats/queries e que o artefato publicado não introduz caminho runtime. Settings/controles Vercel ainda não foram comprovados neste stage.
3. Run no SHA proposto e novo gate humano específico; documentar residual e limites. Qualquer condição não satisfeita mantém a exceção não efetiva.

Tratamento recomendado agora: **adiar/rejeitar a ativação no estado atual**. Após controles, considerar aceitação temporária limitada e isolada da exceção braces. Preferir correção oficial do framework quando o artefato incorporar ambos os patches. Configurações oficiais de cache/stats são opções para avaliação futura, não controles ativos; não alterar internals.

Expiração antecipada/reabertura: versão oficial com bundle corrigido; alteração de hash/Next; novo arquivo stats, configuração Browserslist, variável ou consumidor; queries externas/processo duradouro; falha de isolamento/revisão/timeout; incidente; evidência runtime; novo advisory; perda de checks/proteção. Suspender elegibilidade e apresentar novo gate. Sem renovação automática.

Acompanhamento proposto: consultas manuais em 09/10, 16/10 e 23/10 e por mudança relevante. Conferir [advisory stats](https://github.com/advisories/GHSA-73wf-gq98-2v4g), [advisory cache](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), releases Next e fonte do vendor; baixar candidato oficial apenas em diretório isolado e comparar artefato com patches f9914ad/f2931a3. Não usar apenas número de versão ou audit externo como evidência. Manter alertas e registro manual visíveis; não excluir pacotes ou suprimir avisos para declarar fechamento.

Critério de encerramento por correção: bundle oficial comprovadamente corrigido para stats e cache, compatibilidade técnica demonstrada, instalação reproduzível e validação integral de agentes/catálogo/imagens; aprovação humana de encerramento. Exceção não fecha SEC-02.

Decisão humana pendente: confirmar responsável; autorizar controles em novo escopo; após evidências, aceitar/rejeitar individualmente e registrar condições/prazo. **AWAITING HUMAN APPROVAL**.
