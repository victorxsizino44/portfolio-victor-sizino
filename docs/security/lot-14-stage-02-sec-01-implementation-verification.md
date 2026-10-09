# Stage 02 — SEC-01 Implementation & Verification Report

VS Method™ — LOT-14 — Portfolio Security Hardening  
Conclusão: 09/10/2026, America/Sao_Paulo. **AWAITING HUMAN APPROVAL**.

## Resultado

SEC-01 remediado e validado na instalação local. Next.js 16.3.8 e sharp 0.35.5 estão no lockfile e nos módulos efetivamente instalados. Os audits atuais não contêm entradas para Next ou sharp. Não foi publicada a correção: produção permanece na baseline anterior.

Branch: `codex/lot-14-portfolio-security-hardening`. HEAD/baseline: `ed70452f52a04c6678bcf14e69869b2e368984fb`. Nenhum commit, push, PR, merge ou deploy. A transição sharp 0.34 → 0.35 foi explicitamente autorizada pela Human Governance antes da instalação.

## Escopo e versões

| Dependência | Antes | Depois | Motivo |
|---|---|---|---|
| Next.js | 16.2.7 | 16.3.8 | Release estável mínima identificada cobrindo os advisories revalidados |
| sharp | 0.34.5 | 0.35.5 | Correções libvips, libheif e librsvg; 0.35.4 ainda era afetada |
| @next/env e @next/swc-* | 16.2.7 | 16.3.8 | Pacotes do próprio Next |
| @swc/helpers | 0.5.15 | 0.5.23 | Requerido pelo Next atualizado |
| PostCSS | 8.5.15 top-level; 8.4.31 dentro do Next | 8.5.23, deduplicado | Next 16.3.8 exige exatamente 8.5.23 |
| nanoid | 3.3.12 | 3.3.20 | PostCSS atualizado exige ^3.3.16 |
| semver dentro de sharp | 7.8.2 | 7.8.5 | sharp atualizado exige ^7.8.5 |
| @img/sharp-* / libvips | 0.34.5 / 1.2.4 | 0.35.5 / 1.3.4 | Binários e metadados de plataformas da cadeia sharp |

O lock também registra os novos pacotes WASM de sharp e realocação de metadados de @emnapi/runtime na mesma cadeia. A cópia PostCSS antiga dentro de Next foi removida por deduplicação. Essas alterações transitivas decorrem dos requisitos da atualização autorizada; não houve rodada de correção SEC-02.

React/React DOM continuam 19.2.7; Supabase SSR/JS continuam 0.12.7/2.117.0. Todas as demais declarações diretas e devDependencies foram preservadas. Não foi acrescentada dependência direta de sharp nem override: a resolução 0.35.5 satisfaz o range ^0.35.4 declarado pelo Next.

## Arquivos

- `package.json`: somente Next mudou de `latest` para `16.3.8`.
- `package-lock.json`: resolução da cadeia necessária, com integrities.
- `next-env.d.ts`: Next gerou `import "./.next/types/root-params.d.ts";` durante o build; adaptação de tipos gerados, sem alteração de contrato público.
- Este relatório: novo arquivo de documentação.

O arquivo preexistente, não versionado, `docs/security/portfolio-security-assessment-v1.md` permanece integralmente preservado. SHA-256 antes/depois: `37736A884AB7EEDE2DA4B898BABA0D7394BEFC31A5E3D0A69976694A0DB57A44`.

Nenhuma alteração de app/lib/tests, catálogo, contratos/governança, migrations, banco, credenciais, next.config.js ou configurações de produção.

## Advisories SEC-01

Fontes principais revalidadas:

| Advisory | Correção mínima publicada | Resolução local |
|---|---|---|
| [GHSA-2xp9-vwfh-vxw4 — AVIF Image Optimization](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4) | Next 16.3.3, mitigação AVIF | Next 16.3.8 |
| [GHSA-vcvr-r3jv-pc5j — ImageResponse Node](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) | Next 16.3.6 | Next 16.3.8 |
| [GHSA-cjq9-62q9-8jv4 — SSRF Image Optimization](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) | Next 16.3.8 | Next 16.3.8 |
| [GHSA-f88m-g3jw-g9cj — libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | sharp 0.35.0 | sharp 0.35.5 |
| [GHSA-rgj7-g3m4-5g8c — libheif](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) | sharp 0.35.4 | sharp 0.35.5 |
| [GHSA-wq5f-xc86-pv6w — librsvg](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) | sharp 0.35.5 / librsvg 2.63.2 | sharp 0.35.5 / librsvg 2.63.2 |

O audit anterior continha 17 registros de advisory diretos em Next e três em sharp. Além dos acima, deixam de ser sinalizados os registros Next: GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-4c39-4ccg-62r3, GHSA-p9j2-gv94-2wf4, GHSA-q8wf-6r8g-63ch, GHSA-955p-x3mx-jcvp, GHSA-p293-qw3h-jr36, GHSA-4jqv-mc3x-m676, GHSA-39w2-rjm5-chcv, GHSA-f87g-xv8r-7p7x e GHSA-mcj8-r9mp-w47p. As URLs e os títulos individuais estão no audit anterior preservado. O [release 16.3.8](https://github.com/vercel/next.js/releases/tag/v16.3.8) documenta suas correções.

Presença anterior em range afetado não demonstrava exploração no produto. Não foi encontrado uso de next/og/ImageResponse ou sharp diretamente na aplicação; os caminhos e precondições de cada advisory continuam distintos. Não houve exploração ativa.

## Validação e reprodução

| Verificação | Resultado |
|---|---|
| `npm install next@16.3.8 --save-exact --ignore-scripts --no-audit --no-fund` | PASS |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS, 380 pacotes; lockfile inalterado |
| `npm ls next sharp react react-dom @supabase/ssr @supabase/supabase-js --depth=1` | PASS, Next 16.3.8 → sharp 0.35.5; versões preservadas |
| `npm run lint` | PASS, exit 0 |
| `npm run typecheck` | PASS antes do build e novamente após tipos gerados |
| `npm test` | PASS, 456/456, zero falhas/skips/cancelamentos |
| `npm run build` | PASS, Next 16.3.8/webpack; 30 páginas estáticas geradas |
| `npm audit --json` | Exit 1 por SEC-02 remanescente; 10 pacotes: 9 high, 1 moderate, zero critical |
| `npm audit --omit=dev --json` | Exit 1 por SEC-02 remanescente; 2 pacotes: 1 high, 1 moderate, zero critical |
| Smoke HTTP do build com `next start` | PASS, 41/41 |
| Interação no navegador | PASS: filtro Cases, três produtos, ordenação R$7/R$9/R$9, navegação e cor Verde na galeria |
| `git diff --check` | PASS |

SHA-256 do lockfile, igual antes e depois de npm ci: `36FA36F2DB2298B3EFA70D45C71AF1C61071D0719D87D7C99159B2D0F0A2C133`.

Os scripts de instalação de pacotes foram desativados nessa verificação; os binários prebuilt de sharp e SWC foram instalados e exercitados com sucesso. Não foi usado npm audit fix, --force ou atualização indiscriminada.

O primeiro build no sandbox falhou por EPERM ao criar `.next/static/chunks/app/cases/[slug]`. A repetição autorizada fora do sandbox compilou, passou TypeScript e concluiu. O primeiro smoke no sandbox não conseguiu conectar ao localhost; a repetição fora dele passou integralmente. São limitações do ambiente de execução, não regressões identificadas. Node emite aviso MODULE_TYPELESS_PACKAGE_JSON nos testes TS existentes; não se alterou o tipo de módulo neste stage.

O smoke verificou home, contato, página Agent B, catálogo, todos os 14 detalhes e 404 para produto inexistente. Verificou conversão de PNG local e três imagens Cloudinary aprovadas para WebP, com bytes decodificados por sharp: HTTP 200, dimensões válidas; host não allowlisted foi recusado com 400. Verificou 405 nos oito endpoints e 400/contratos/no-store para JSON inválido, além de 403 para origem divergente no Agent B. Nenhuma chamada válida foi enviada a webhook, Auth ou RPC. Testes automatizados usam mocks para integrações e cobrem sucesso/falha dos agentes, identidade, ownership e governança. Testes SQL estáticos/modelos não equivalem a introspecção do banco real.

## Runtime e Vercel

No [deployment de produção](https://vercel.com/victorvsp-8899s-projects/portfolio-victor-sizino/3puYoCpsjF5mjbgfD9Z7atSnndxq), a leitura do painel confirmou Production / Ready / Latest, main, SHA da baseline. Em Deployment Settings → Runtime Settings, **Node.js Version: 24.x**. O Node local é **24.16.0**. Metadados oficiais do npm para Next 16.3.8 e sharp 0.35.5 exigem Node **>=20.9.0**: a compatibilidade da versão Node está demonstrada. Nenhum setting foi alterado.

A biblioteca nativa local efetivamente carregada informa sharp 0.35.5, libvips 8.18.7, libheif 1.23.5 e librsvg 2.63.2. O lock contém os pacotes Linux para futura instalação pelo hosting, mas a execução desta rodada foi Windows: não se afirma ter executado o artefato atualizado no Linux/Vercel.

O [comunicado oficial Vercel](https://vercel.com/blog/reproducing-disclosing-and-fixing-the-libheif-vulnerability-with-hacktron-and-the-maintainers) confirma que todos os requests Next Image Optimization na plataforma passam pelo serviço central e que AVIF optimization/resizing foi desabilitado nele em 13/08/2026 para impedir a decodificação vulnerável. Isso confirma a mitigação declarada da plataforma, sem equivaler a extração das bibliotecas instaladas no deployment ou teste ativo de AVIF malicioso. O projeto mantém allowlist HTTPS estreita de Cloudinary e imagens aprovadas. Não foi verificado controle específico de SSRF/librsvg no serviço central, WAF, quotas ou todos os parâmetros internos do provedor.

Não houve deploy, portanto as versões corrigidas locais ainda não são as versões efetivas de produção. A aceitação da compatibilidade Node não substitui futura validação do artefato Vercel após publicação autorizada.

## Remanescentes SEC-02 e risco residual

Audit completo: @next/eslint-plugin-next, baseline-browser-mapping, brace-expansion, braces, browserslist, eslint-config-next, fast-glob, js-yaml, micromatch e source-map-js. São dez pacotes sinalizados, incluindo efeitos de cadeias transitivas, não dez exploits confirmados.

Runtime:

| Pacote | Severidade | Advisory | Contexto |
|---|---|---|---|
| baseline-browser-mapping | moderate | [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) | Terminação de processo com entrada inválida |
| source-map-js | high | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | DoS em offsets de source maps indexados |

No completo, brace-expansion mantém GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7 e GHSA-6j4f-fj2g-mc7p; braces mantém GHSA-vfj7-8cjw-p6xm; browserslist mantém GHSA-c83g-rgw3-j3cx e GHSA-73wf-gq98-2v4g; js-yaml mantém GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj e GHSA-2883-xcg3-v3hh. fast-glob, micromatch e pacotes ESLint aparecem como cadeias afetadas. Detalhes, nodes e fix suggestions estão no JSON completo.

PostCSS/nanoid deixam de ser sinalizados como consequência da cadeia exigida pelo novo Next; isso não fecha SEC-02. A presença de tooling na árvore runtime não comprova processamento de conteúdo hostil em requests. Nenhum caminho público de processamento de CSS/YAML/source maps/globs arbitrários foi acrescentado. SEC-03 a SEC-12 permanecem fora da implementação.

Não foi identificada regressão funcional material nas verificações executadas. Não houve teste end-to-end com serviços reais, teste de carga, pentest, teste Linux ou nova publicação. O audit é uma fotografia dos advisories conhecidos, não garantia de ausência de vulnerabilidades futuras. A configuração Node da Vercel foi lida por major; o patch exato de Node e as bibliotecas de seu otimizador central não foram extraídos.

## Evidências locais

Diretório auxiliar fora do repositório: `C:/Users/victo/.codex/visualizations/2026/10/09/01a11e85-e722-78a0-92a6-c5c7015037d0/`.

- `lot14-stage02-before-lock.json`: lockfile anterior preservado.
- `lot14-audit-all.json` / `lot14-audit-runtime.json`: scanner anterior.
- `lot14-stage02-audit-all.json` / `lot14-stage02-audit-runtime.json`: scanner após atualização.
- `lot14-stage02-tests.log`: suite 456/456.
- `lot14-stage02-smoke.mjs` / `lot14-stage02-smoke-results.json`: verificações transitórias, 41/41.

## Recomendação e Human Gate

Recomenda-se aprovar a implementação local de SEC-01 para a próxima etapa de revisão/entrega controlada. Commit, push, PR, merge e deploy continuam sem autorização. Quando uma publicação for explicitamente autorizada, confirmar versões e binários no novo artefato Vercel, revalidar Image Optimization e smoke dos produtos/agentes. SEC-02 deve receber stage próprio autorizado; não aceitar o audit global como limpo.

**Status: AWAITING HUMAN APPROVAL.** Encerrado neste gate; nenhuma implementação de outro achado está autorizada por este relatório.
