# LOT-13 — Catalog Expansion Round 01

Implementação local autorizada. Sem merge, deploy, publicação ou Stage 13.

## Conteúdo provisório para aprovação

Os nomes seguem a solicitação humana. Categorias, slugs e descrições abaixo são propostas para homologação. Os oito novos produtos precedem os seis anteriores; a ordem relativa anterior permanece preservada.

| Nome | Categoria proposta | Slug proposto | Preço | Dimensões |
|---|---|---|---|---|
| Porta-joias Folha | Porta-joias | porta-joias-folha | R$ 10,00 | 15,00 × 7,64 × 1,37 cm |
| Suporte de Celular Gato | Suportes de celular | suporte-celular-gato | R$ 11,00 | 6,13 × 11,87 × 8,12 cm |
| Porta-joias Gato | Porta-joias | porta-joias-gato | R$ 10,00 | 7,02 × 9,99 × 3,95 cm |
| Porta-velas Gato | Porta-velas | porta-velas-gato | R$ 11,00 | 11,25 × 7,28 × 3,98 cm |
| Porta-copos Padrão | Porta-copos | porta-copos-padrao | R$ 10,00 | 10,00 × 10,00 × 0,64 cm |
| Porta-copos Vitória Amazônica | Porta-copos | porta-copos-vitoria-amazonica | R$ 7,00 | 7,96 × 8,20 × 0,75 cm |
| Incensário Padrão | Incensários | incensario-padrao | R$ 11,00 | 21,99 × 4,00 × 2,69 cm |
| Suporte de Celular Cachorro | Suportes de celular | suporte-celular-cachorro | R$ 12,00 | 7,07 × 7,81 × 3,00 cm |

### Descrições propostas

- **Porta-joias Folha:** Porta-joias em formato de folha para organizar pequenos acessórios. Uma base com linhas orgânicas para receber pintura e a identidade de cada artista.
- **Suporte de Celular Gato:** Suporte de celular em formato de gato para compor a mesa com personalidade. Uma peça funcional aberta a cores, pintura e customização artística.
- **Porta-joias Gato:** Porta-joias em formato de gato para acomodar pequenos acessórios. Uma peça divertida para explorar pintura, detalhes e diferentes estilos de acabamento.
- **Porta-velas Gato:** Porta-velas em formato de gato com uma silhueta cheia de personalidade. Uma base decorativa para receber a interpretação e as cores de cada artista.
- **Porta-copos Padrão:** Porta-copos de formato simples para compor a mesa. Uma superfície versátil para experimentar pintura, padrões e identidade visual.
- **Porta-copos Vitória Amazônica:** Porta-copos inspirado nas formas da vitória-amazônica. Uma peça de linhas orgânicas que convida à customização com cores e diferentes acabamentos.
- **Incensário Padrão:** Incensário de formato alongado e linhas simples. Uma base decorativa para explorar pintura e criar uma peça com identidade própria.
- **Suporte de Celular Cachorro:** Suporte de celular em formato de cachorro para dar personalidade à mesa. Uma peça funcional pronta para receber cores e customização artística.

## Fontes e divergências

- Preços finais fixos conforme tabela aprovada; não recalculados em runtime.
- Dimensões do Incensário Padrão (21,99 × 4,00 × 2,69 cm) e do Suporte de Celular Cachorro (7,07 × 7,81 × 3,00 cm) confirmadas pela Human Governance nesta conversa. Nenhuma dimensão pendente.
- A imagem de medidas do Incensário Padrão mostra 21,9 × 4,0 × 2,7 cm. O HTML usa os valores humanos; o asset foi preservado. Revisar divergência visual.
- A imagem do cachorro mostra os mesmos eixos em outra ordem e arredonda 7,81 cm; o HTML mantém a ordem informada pela Human Governance.
- Azul e Verde do Porta-joias Gato usam os arquivos descritivos em português retornados pela API; ambas as cores foram conferidas visualmente. Não foram inventados IDs com sufixos.
- Referências em subpastas exemplo de Folha e Vitória Amazônica não foram incorporadas como substituição.
- As 60 referências anteriores permanecem intactas.
- Descoberta: GET autenticado server-side na Admin API, exclusivamente em script temporário; nenhuma chamada autenticada ou credencial na aplicação.

## Reconciliação dos 80 novos assets

### Porta-joias Folha

Pasta: samples/Leaf-shaped jewelry box. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Leaf-shaped_jewelry_box_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_main.png) |
| Medidas | Leaf-shaped_jewelry_box_-_measure | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_measure.png) |
| Azul | Leaf-shaped_jewelry_box_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_blue.png) |
| Verde | Leaf-shaped_jewelry_box_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_green.png) |
| Laranja | Leaf-shaped_jewelry_box_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_orange.png) |
| Cinza | Leaf-shaped_jewelry_box_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_grey.png) |
| Prateado | Leaf-shaped_jewelry_box_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_silver.png) |
| Branco | Leaf-shaped_jewelry_box_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484546/Leaf-shaped_jewelry_box_-_white.png) |
| Vermelho | Leaf-shaped_jewelry_box_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_red.png) |
| Preto | Leaf-shaped_jewelry_box_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484545/Leaf-shaped_jewelry_box_-_black.png) |

### Suporte de Celular Gato

Pasta: samples/Cat Phone Holder. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Cat_Phone_Holder_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484548/Cat_Phone_Holder_-_main.png) |
| Medidas | Cat_Phone_Holder_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484548/Cat_Phone_Holder_-_measures.png) |
| Azul | Cat_Phone_Holder_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484546/Cat_Phone_Holder_-_blue.png) |
| Verde | Cat_Phone_Holder_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484547/Cat_Phone_Holder_-_green.png) |
| Laranja | Cat_Phone_Holder_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484549/Cat_Phone_Holder_-_orange.png) |
| Cinza | Cat_Phone_Holder_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484548/Cat_Phone_Holder_-_grey.png) |
| Prateado | Cat_Phone_Holder_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484549/Cat_Phone_Holder_-_silver.png) |
| Branco | Cat_Phone_Holder_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484549/Cat_Phone_Holder_-_white.png) |
| Vermelho | Cat_Phone_Holder_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484549/Cat_Phone_Holder_-_red.png) |
| Preto | Cat_Phone_Holder_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484546/Cat_Phone_Holder_-_black.png) |

### Porta-joias Gato

Pasta: samples/Cat-shaped jewelry box. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Cat-shaped_jewelry_box_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484541/Cat-shaped_jewelry_box_-_main.png) |
| Medidas | Cat-shaped_jewelry_box_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484541/Cat-shaped_jewelry_box_-_measures.png) |
| Azul | Porta-joias_felino_azul_com_ouro | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484542/Porta-joias_felino_azul_com_ouro.png) |
| Verde | Porta-joias_felino_verde_com_joias | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484542/Porta-joias_felino_verde_com_joias.png) |
| Laranja | Cat-shaped_jewelry_box_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484541/Cat-shaped_jewelry_box_-_orange.png) |
| Cinza | Cat-shaped_jewelry_box_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484541/Cat-shaped_jewelry_box_-_grey.png) |
| Prateado | Cat-shaped_jewelry_box_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484542/Cat-shaped_jewelry_box_-_silver.png) |
| Branco | Cat-shaped_jewelry_box_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484542/Cat-shaped_jewelry_box_-_white.png) |
| Vermelho | Cat-shaped_jewelry_box_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484542/Cat-shaped_jewelry_box_-_red.png) |
| Preto | Cat-shaped_jewelry_box_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484541/Cat-shaped_jewelry_box_-_black.png) |

### Porta-velas Gato

Pasta: samples/Cat-shaped candle holder. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Cat-shaped_candle_holder_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493457/Cat-shaped_candle_holder_-_main.png) |
| Medidas | Cat-shaped_candle_holder_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493458/Cat-shaped_candle_holder_-_measures.png) |
| Azul | Cat-shaped_candle_holder_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493452/Cat-shaped_candle_holder_-_blue.png) |
| Verde | Cat-shaped_candle_holder_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493454/Cat-shaped_candle_holder_-_green.png) |
| Laranja | Cat-shaped_candle_holder_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493460/Cat-shaped_candle_holder_-_orange.png) |
| Cinza | Cat-shaped_candle_holder_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493454/Cat-shaped_candle_holder_-_grey.png) |
| Prateado | Cat-shaped_candle_holder_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493462/Cat-shaped_candle_holder_-_silver.png) |
| Branco | Cat-shaped_candle_holder_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493463/Cat-shaped_candle_holder_-_white.png) |
| Vermelho | Cat-shaped_candle_holder_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493461/Cat-shaped_candle_holder_-_red.png) |
| Preto | Cat-shaped_candle_holder_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791493453/Cat-shaped_candle_holder_-_black.png) |

### Porta-copos Padrão

Pasta: samples/Standard cup holder. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Standard_cup_holder_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485182/Standard_cup_holder_-_main.png) |
| Medidas | Standard_cup_holder_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485183/Standard_cup_holder_-_measures.png) |
| Azul | Standard_cup_holder_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485179/Standard_cup_holder_-_blue.png) |
| Verde | Standard_cup_holder_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485180/Standard_cup_holder_-_green.png) |
| Laranja | Standard_cup_holder_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485184/Standard_cup_holder_-_orange.png) |
| Cinza | Standard_cup_holder_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485181/Standard_cup_holder_-_grey.png) |
| Prateado | Standard_cup_holder_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485186/Standard_cup_holder_-_silver.png) |
| Branco | Standard_cup_holder_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485187/Standard_cup_holder_-_white.png) |
| Vermelho | Standard_cup_holder_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485185/Standard_cup_holder_-_red.png) |
| Preto | Standard_cup_holder_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791485178/Standard_cup_holder_-_black.png) |

### Porta-copos Vitória Amazônica

Pasta: samples/Victoria Amazonica Coaster. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Victoria_Amazonica_Coaster_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_main.png) |
| Medidas | Victoria_Amazonica_Coaster_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_measures.png) |
| Azul | Victoria_Amazonica_Coaster_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_blue.png) |
| Verde | Victoria_Amazonica_Coaster_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_green.png) |
| Laranja | Victoria_Amazonica_Coaster_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_orange.png) |
| Cinza | Victoria_Amazonica_Coaster_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_grey.png) |
| Prateado | Victoria_Amazonica_Coaster_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484536/Victoria_Amazonica_Coaster_-_silver.png) |
| Branco | Victoria_Amazonica_Coaster_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484536/Victoria_Amazonica_Coaster_-_white.png) |
| Vermelho | Victoria_Amazonica_Coaster_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484536/Victoria_Amazonica_Coaster_-_red.png) |
| Preto | Victoria_Amazonica_Coaster_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791484535/Victoria_Amazonica_Coaster_-_black.png) |

### Incensário Padrão

Pasta: samples/Standard incense burner. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Standard_incense_burner_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_main.png) |
| Medidas | Standard_incense_burner_-_measures | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_measures.png) |
| Azul | Standard_incense_burner_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419312/Standard_incense_burner_-_blue.png) |
| Verde | Standard_incense_burner_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419312/Standard_incense_burner_-_green.png) |
| Laranja | Standard_incense_burner_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_orange.png) |
| Cinza | Standard_incense_burner_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419312/Standard_incense_burner_-_grey.png) |
| Prateado | Standard_incense_burner_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_silver.png) |
| Branco | Standard_incense_burner_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_white.png) |
| Vermelho | Standard_incense_burner_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419313/Standard_incense_burner_-_red.png) |
| Preto | Standard_incense_burner_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791419312/Standard_incense_burner_-_black.png) |

### Suporte de Celular Cachorro

Pasta: samples/Dog-Shaped Phone Holder. 10 assets PNG.

| Papel | Public ID observado | Delivery URL permanente |
|---|---|---|
| Principal | Dog-Shaped_Phone_Holder_-_main | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413272/Dog-Shaped_Phone_Holder_-_main.png) |
| Medidas | Dog-Shaped_Phone_Holder_-_measure | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413274/Dog-Shaped_Phone_Holder_-_measure.png) |
| Azul | Dog-Shaped_Phone_Holder_-_blue | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413261/Dog-Shaped_Phone_Holder_-_blue.png) |
| Verde | Dog-Shaped_Phone_Holder_-_green | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413265/Dog-Shaped_Phone_Holder_-_green.png) |
| Laranja | Dog-Shaped_Phone_Holder_-_orange | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791414865/Dog-Shaped_Phone_Holder_-_orange.png) |
| Cinza | Dog-Shaped_Phone_Holder_-_grey | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413269/Dog-Shaped_Phone_Holder_-_grey.png) |
| Prateado | Dog-Shaped_Phone_Holder_-_silver | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791414870/Dog-Shaped_Phone_Holder_-_silver.png) |
| Branco | Dog-Shaped_Phone_Holder_-_white | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791414878/Dog-Shaped_Phone_Holder_-_white.png) |
| Vermelho | Dog-Shaped_Phone_Holder_-_red | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791414867/Dog-Shaped_Phone_Holder_-_red.png) |
| Preto | Dog-Shaped_Phone_Holder_-_black | [Delivery](https://res.cloudinary.com/ha6r0heb/image/upload/v1791413259/Dog-Shaped_Phone_Holder_-_black.png) |


## QA executado

- Lint, typecheck isolado após build, build e 456/456 testes: PASS.
- 14 detalhes e catálogo: HTTP 200. Slug inexistente: HTTP 404.
- 140 referências únicas: HTTP 200; 60 referências anteriores e demais dados dos seis produtos preservados, exceto preços autorizados.
- Sete categorias, três ordenações, 14 galerias e oito cores por produto verificados no navegador.
- Catálogo e detalhe inspecionados em 1440, 768, 390 e 320px; alinhamento e ausência de overflow verificados. Sem erros JavaScript detectados.
- Sete rotas públicas existentes retornaram 200. WhatsApp contextual preservado, sem envio de mensagens.
- Evidências: C:/Users/victo/.codex/visualizations/2026/10/07/01a11819-3c00-74b3-9e52-d9b648eeac5d/mold3-expansion-round01/evidence.md.
- Limitações: Edge headless, sem dispositivo físico. Pendente homologação do conteúdo e divergência visual do Incensário Padrão.

