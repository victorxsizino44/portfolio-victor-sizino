# Stage 03 — SEC-02 Remediation Assessment & Decision Report

VS Method™ — LOT-14 — Portfolio Security Hardening  
09/10/2026, America/Sao_Paulo. **AWAITING HUMAN APPROVAL**.

## Conclusão para decisão

Recomenda-se uma rodada localizada de atualização de cinco famílias transitivas, respeitando os ranges dos pais: baseline-browser-mapping, source-map-js, brace-expansion em duas linhas, browserslist e js-yaml. Não é necessário mudar Next.js 16.3.8, sharp 0.35.5, React, Supabase, ESLint ou configurar overrides para essas resoluções.

Essa rodada não permite prometer fechamento integral de SEC-02: braces 3.0.3 não possui versão corrigida oficial publicada nas consultas realizadas, e há uma cópia de Browserslist embutida no Next que não será substituída por uma atualização do pacote externo. É necessária decisão humana explícita sobre o risco residual e eventual trabalho adicional. Não executar o downgrade eslint-config-next 14.2.35 sugerido por npm audit.

Este stage realizou somente análise, consultas e documentação. Nenhuma dependência, configuração, código, migration, banco ou credencial foi modificada. Não houve instalação, audit fix, commit, push, PR, merge ou deploy.

## Baseline preservada

Branch confirmada: `codex/lot-14-portfolio-security-hardening`. HEAD: `ed70452f52a04c6678bcf14e69869b2e368984fb`. As alterações locais SEC-01 permanecem em package.json, package-lock.json e next-env.d.ts; assessment e relatório Stage 02 continuam não versionados e preservados. SEC-01 está aprovado tecnicamente em ambiente local, com validação em produção pendente.

SHA-256 antes/depois deste stage:

| Arquivo | Hash |
|---|---|
| package.json | BDA6946A8EB9E374835B55E660740F125440A7963F2D8BADE9D7CE07F831DC7E |
| package-lock.json | 36FA36F2DB2298B3EFA70D45C71AF1C61071D0719D87D7C99159B2D0F0A2C133 |
| next-env.d.ts | 1B59D4C6B83807DB275D43F3CF2CC8E9323F465FAB764EEA091CC5BECD5BAD37 |
| portfolio-security-assessment-v1.md | 37736A884AB7EEDE2DA4B898BABA0D7394BEFC31A5E3D0A69976694A0DB57A44 |

## Scanner e cadeias responsáveis

Novas consultas npm audit completo/runtime reproduzem o Stage 02: **10 pacotes (9 high, 1 moderate)** e **2 pacotes runtime (1 high, 1 moderate)**, zero critical. Ambos retornam exit 1 por achados pendentes. Next e sharp não aparecem. Contagens agregam efeitos transitivos; não representam dez vulnerabilidades exploráveis comprovadas.

| Pacote / scanner | Versão atual | Candidata mínima identificada | Origem e contexto |
|---|---|---|---|
| baseline-browser-mapping / moderate | 2.10.34 | 2.11.0 | Next ^2.9.19; Browserslist ^2.10.12. Árvore runtime, uso identificado de seleção de browsers/build |
| source-map-js / high | 1.2.1 | 1.2.2 | PostCSS ^1.2.1 e @tailwindcss/node ^1.2.1. Árvore runtime por PostCSS/Next; processamento de mapas no build |
| brace-expansion / high | 1.1.15 e 5.0.6 | 1.1.21 e 5.0.12 | ESLint → minimatch 3.1.5 (^1.1.7); typescript-eslint → typescript-estree → minimatch 10.2.5 (^5.0.5). Lint/dev |
| browserslist / high | 4.28.2 | 4.28.7 | Autoprefixer (^4.28.2) e Babel/helper-compilation-targets (^4.24.0), este via plugin React Hooks. Build/lint |
| js-yaml / high | 4.2.0 | 4.3.2 | ESLint → @eslint/eslintrc (^4.1.1). Configuração dev/lint |
| braces / high | 3.0.3 | Nenhuma publicada | micromatch → braces ^3.0.3. Lint/dev, sem caminho público identificado |
| micromatch / high por cadeia | 4.0.8 | Nenhuma candidata consultada elimina braces | fast-glob → micromatch ^4.0.4; micromatch exige braces ^3.0.3 |
| fast-glob / high por cadeia | 3.3.1 | 3.3.3 existe, mas mantém micromatch | @next/eslint-plugin-next fixa 3.3.1; 3.3.3 exige micromatch ^4.0.8 |
| @next/eslint-plugin-next / high por cadeia | 16.2.7 | 16.3.8 consultada, sem eliminar cadeia | Exige fast-glob 3.3.1; 16.4.0 também mantém essa dependência |
| eslint-config-next / high por cadeia; única dependência direta sinalizada | 16.2.7 (`latest` no manifest) | 16.3.8 consultada, alinhamento opcional | Exige plugin da mesma versão; atualizar não resolve braces |

As versões candidatas foram verificadas no registry npm. Latest consultados incluem baseline 2.11.28, Browserslist 4.29.3 e js-yaml 5.4.3: não são necessários ao plano mínimo. Não confundir versão latest com menor correção compatível.

## Registro de advisories

| Família | Advisories remanescentes |
|---|---|
| baseline-browser-mapping | [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv): process.exit em parâmetros inválidos/conflitantes; corrigido em 2.11.0 |
| source-map-js | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q): bloqueio de event loop por offsets de seções em source maps indexados; corrigido em 1.2.2 |
| brace-expansion | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp), [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895), [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr), [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7), [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p): CPU, expansão/memória e recursão. Alvos 1.1.21/5.0.12 cobrem os ranges desses registros nas duas cópias atuais |
| browserslist | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx): cache sem limite com queries distintas; [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g): crash/escrita de protótipo ao normalizar stats não confiáveis. Ambos corrigidos em 4.28.7 |
| js-yaml | [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m), [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj), [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh): custo excessivo de merge/omap; 4.3.2 cobre os três |
| braces e seus efeitos | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): recursão sem guarda em AST de padrões profundamente aninhados. <=3.0.3 afetado, patched versions: None. As entradas micromatch/fast-glob/plugin/config são efeitos transitivos desse registro |

Não se executaram PoCs, payloads de exaustão ou carga. A avaliação é estática/contextual, não demonstração de exploit.

## Alcance no projeto

**Runtime inventariado não equivale a request-time explorável.** Não há imports desses pacotes no código app/lib/tests pesquisado nem endpoint público de processamento de CSS, source maps, YAML, queries de browsers ou globs arbitrários. Mensagens Agent R/Agent B são dados dos contratos existentes; não foram encontradas ligações delas ao tooling analisado.

- PostCSS usa SourceMapConsumer em `lib/previous-map.js`, `input.js` e map-generator; source maps de CSS/arquivos ou dependências não confiáveis podem alcançar o parser durante build. Tailwind também usa SourceMapGenerator. A atualização é proporcional mesmo sem um caminho HTTP identificado.
- baseline-browser-mapping é requerido externamente pelo Browserslist compilado do Next. A versão instalada contém process.exit na combinação inválida envolvendo KaiOS/downstream browsers. Inputs normais são configuração/build; não foi identificado controle do visitante sobre esses parâmetros.
- Browserslist externo é usado por Autoprefixer e Babel em build/lint. Não há browserslist-stats.json versionado nem configuração Browserslist específica identificada; estatísticas podem ser descobertas em diretórios ancestrais, portanto a ausência no repo não certifica todo o filesystem de um runner. Repositório/PR/dependência não confiável é cenário relevante.
- js-yaml é carregado pelo leitor de configurações de @eslint/eslintrc. O comando atual usa `eslint.config.mjs`; existe `.eslintrc.json` legado, sem YAML versionado identificado. A presença do pacote não prova que o parser YAML foi exercitado pelo lint atual. Correção oficial dentro de ^4 é preferível a remover tooling.
- `@next/eslint-plugin-next/dist/utils/get-root-dirs.js` chama fast-glob para `settings.next.rootDir`. Sem esse setting, usa context.cwd. O config atual não define rootDir controlável; patterns de ESLint/minimatch são locais e versionados. Não há entrada pública identificada, mas um PR que altere configurações pode mudar essa fronteira.

Classificação contextual: prioridade imediata para as duas famílias inventariadas como runtime e seus caminhos de build; demais correções como prevenção de DoS no build/dev e risco de conteúdo/configuração não confiável. Confiança alta em versões/ranges; confiança limitada em exposição externa. Não houve introspecção de artefato Linux/produção, tracer de inputs nem audit administrativo de runners.

### Cópia embutida no Next

Foi identificado `node_modules/next/dist/compiled/browserslist/index.js`. Seu `normalizeStats` mantém `for...in` e acesso `e[n].versions.length` sem a guarda de propriedade própria descrita no advisory de stats. Isso é evidência estática de uma implementação suspeita compatível com a condição descrita, não exploit confirmado nem atribuição de versão upstream exata.

Atualizar o pacote externo browserslist ou usar override npm não substitui esse bundle. Também não se deve inferir que npm audit cobre integralmente cópias vendorizadas. O bundle usa baseline-browser-mapping externamente, logo a correção baseline pode alcançá-lo; a lógica Browserslist embutida permanece questão separada.

Antes de declarar SEC-02 integralmente fechado, verificar release oficial Next com bundle corrigido ou obter esclarecimento upstream, com novo gate se exigir mudança do Next aprovado. Não se propõe editar node_modules, patch local silencioso ou substituir internals. Mesmo se audit runtime retornar zero na futura rodada, registrar essa limitação.

## Compatibilidade, breaking changes e overrides

Verificação semver local mostrou que todas as candidatas corrigidas propostas satisfazem os ranges dos pais atuais. Browserslist 4.28.7 exige baseline ^2.10.44, também satisfeito por 2.11.0; sua atualização traz dados caniuse-lite/node-releases/electron-to-chromium necessários, sujeitos a revisão de diff.

Node 24.16.0 local / 24.x Vercel, evidenciados no Stage 02, atendem engines das candidatas. brace-expansion 5.0.12 exige `20 || >=22`, dentro do runtime atual; não mover consumidores ^1 para a major 5. Manter as duas linhas corrigidas.

Não foi identificada mudança major necessária às cinco famílias. Isso não garante ausência de regressões: baseline passa de saída de processo para exceção em input inválido; brace-expansion limita/trunca padrões patológicos; correções YAML ajustam budgets/comportamento de entradas excessivas; Browserslist/dados podem alterar targets e CSS emitido. São mudanças observáveis de hardening que precisam de validação.

js-yaml 5.4.3 é major fora de ^4.1.1; não necessário. ESLint 10, upgrade de Tailwind, Next 16.4 ou downgrade da config Next não fazem parte do mínimo. Alinhar eslint-config-next/plugin em 16.3.8 é opcional, com mudanças de regras/dependências e sem resolver braces; recomenda-se deixar fora desta rodada mínima.

Overrides: não necessários para os cinco alvos, pois as releases oficiais cabem nos ranges. fast-glob é pinado pelo plugin, mas forçar 3.3.3 continuaria com micromatch/braces. Não há versão braces corrigida para impor. Não substituir braces por brace-expansion: são pacotes/APIs diferentes. Fork, patch ou troca de biblioteca exigiria aprovação específica, revisão de manutenção e novos testes; não recomendado como primeiro passo.

## Plano mínimo proposto, ainda não executado

1. Após aprovação, salvar snapshot exato da implementação SEC-01 e dos arquivos locais/documentos, com checksums. Revalidar advisories/registry antes de resolver.
2. Atualizar somente baseline-browser-mapping para 2.11.0 e source-map-js para 1.2.2, por resolução oficial transitiva dentro dos ranges. Manter Next 16.3.8 e sharp 0.35.5.
3. Atualizar brace-expansion 1.1.15 → 1.1.21 e 5.0.6 → 5.0.12, browserslist 4.28.2 → 4.28.7 e js-yaml 4.2.0 → 4.3.2. Aceitar apenas transitivas necessárias declaradas pelos pais.
4. Usar resolução npm direcionada com diff revisado. Não adicionar transitivas como dependências diretas nem executar update global. Se npm resolver releases posteriores, comparar com os alvos aprovados e obter decisão sobre diferenças significativas, em vez de editar integrity manualmente.
5. Validar instalação reproduzível e executar gates abaixo. Manter documentados braces e o bundle Browserslist.

Expectativa pelo inventário atual, não resultado testado: remover cinco nomes sinalizados e os dois runtime externos; poderiam restar **cinco entradas high** da cadeia config/plugin/fast-glob/micromatch/braces, todas derivadas do mesmo advisory. Repetir audits para confirmar, sem prometer essa contagem futura. SEC-02 permanecerá parcialmente aberto enquanto os residuais não forem resolvidos ou aceitos pela Human Governance.

## Critérios de aceite e verificação da futura implementação

- Diff limitado aos alvos/ranges aprovados e transitivas justificadas; nenhuma mudança de Agent R, Agent B, Mold3, migrations ou governança. Next 16.3.8/sharp 0.35.5 preservados.
- `npm ls` sem invalid/extraneous; nenhuma cópia antiga dos cinco alvos alcançáveis no lock; integrities e pacotes nativos SEC-01 preservados.
- `npm ci` com lock consistente/inalterado após instalação; conferir runtime Node e versão efetivamente carregada. Registrar a política de scripts usada.
- Audits completo e omit=dev; alvos removidos; runtime externo sem os dois advisories. Residual braces e bundle apresentados nominalmente, sem mascarar scanner ou usar um gate zero global incompatível com upstream sem patch.
- Lint e typecheck aprovados; build de produção aprovado. Revisar diferença de targets/CSS de Browserslist e testar responsividade, filtros e galeria Mold3.
- Suite existente: pelo menos o baseline 456/456, sem falhas/skips inesperados. Repetir smoke HTTP das 41 verificações do Stage 02 e contratos Agent R/Agent B com mocks, sem chamadas válidas à produção.
- Testes focados, se necessários: fixture pequena de source map válido/indexado e input inválido com limite de execução em subprocesso; baseline inválida deve lançar erro controlável sem encerrar processo chamador; glob/config/JSON/YAML ordinários usados pelo tooling. Não executar DoS não limitado nem copiar PoC volumoso contra ambiente compartilhado.
- Interromper diante de nova major, necessidade de override incompatível, alteração arquitetural ou regressão material; apresentar alternativas ao novo gate.

Não se executaram builds/testes nesta análise: os resultados 456/456 e 41/41 são baseline Stage 02, não validação das candidatas ainda não instaladas. Produção SEC-01 também segue pendente de publicação autorizada e verificação.

## Rollback proposto

Como SEC-01 está sem commit e o HEAD ainda é pré-correção, **não usar git reset/clean/restore para HEAD como rollback SEC-02**: isso perderia alterações aprovadas. Restaurar somente os arquivos de dependência alterados pela rodada SEC-02 a partir do snapshot exato do Stage 02, sem sobrescrever trabalho posterior nem documentos. Reinstalar com npm ci e repetir checks essenciais. Se houver edições posteriores concorrentes, reverter seletivamente o diff SEC-02.

Nenhum rollback de produção é necessário neste plano local; qualquer publicação/rollback remoto exige autorização separada.

## Decisões humanas necessárias

1. Autorizar implementação das cinco famílias nas versões/ranges propostas e transitivas estritamente necessárias, com os critérios acima.
2. Decidir se aceita temporariamente o risco de braces limitado ao tooling/configuração identificada, ou exige solução upstream/fork substituição sob novo escopo. Não se recomenda downgrade de config Next ou override fictício.
3. Decidir sobre investigação/remediação da cópia Browserslist embutida e eventual release Next oficial, sem considerar audit externo zero como prova de fechamento.
4. Alinhamento eslint-config-next 16.3.8 é opcional e não faz parte da recomendação mínima; caso desejado, autorizar como alteração de tooling separadamente.

## Evidências

Auxiliares fora do repo em `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`: `lot14-stage03-tree.json`, `lot14-stage03-audit-all.json`, `lot14-stage03-audit-runtime.json`. Registry consultado por npm view; código instalado e lock lidos; advisories primários vinculados acima.

Somente este relatório foi acrescentado ao repositório neste stage. **Status: AWAITING HUMAN APPROVAL.** Implementação não iniciada.
