import delivery from "./mold3-cloudinary.json" with { type: "json" };
import expansionAssets from "./mold3-expansion-assets.json" with { type: "json" };

export const MOLD3_COLORS = [
  { name: "Azul", hex: "#2563eb", assetSuffix: "blue" },
  { name: "Verde", hex: "#72E95A", assetSuffix: "green" },
  { name: "Laranja", hex: "#ea580c", assetSuffix: "orange" },
  { name: "Cinza", hex: "#737373", assetSuffix: "grey" },
  { name: "Prateado", hex: "#c0c0c0", assetSuffix: "silver" },
  { name: "Branco", hex: "#ffffff", assetSuffix: "white" },
  { name: "Vermelho", hex: "#dc2626", assetSuffix: "red" },
  { name: "Preto", hex: "#171717", assetSuffix: "black" },
] as const;

export type Mold3Color = (typeof MOLD3_COLORS)[number]["name"];

export type Mold3Image = {
  src: string;
  alt: string;
  color?: Mold3Color;
};

export type Mold3Product = {
  name: string;
  slug: string;
  /** Final BRL price approved by Human Governance. */
  price: number;
  description: string;
  category: string;
  mainImage: Mold3Image;
  gallery: readonly Mold3Image[];
  /** Approved measurements with units, rendered as real HTML text. */
  dimensions: string;
  availability: string;
  featured: boolean;
};

export function mold3DeliveryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${delivery.cloudName}/image/upload/${encodeURIComponent(publicId)}.png`;
}

type ProductContent = Pick<Mold3Product, "name" | "slug" | "price" | "description" | "category" | "dimensions">;

function withAssets(product: ProductContent, prefix: string, approvedUrls: Partial<Record<Mold3Color | "Medidas", string>> = {}): Mold3Product {
  return {
    ...product,
    availability: "Disponível para produção",
    featured: false,
    mainImage: { src: mold3DeliveryUrl(`${prefix}_-_main`), alt: `${product.name} — imagem principal` },
    gallery: [
      { src: approvedUrls.Medidas ?? mold3DeliveryUrl(`${prefix}_-_measures`), alt: `Medidas de ${product.name}: ${product.dimensions}` },
      ...MOLD3_COLORS.map((color) => ({
        src: approvedUrls[color.name] ?? mold3DeliveryUrl(`${prefix}_-_${color.assetSuffix}`),
        alt: `${product.name} na cor ${color.name}`,
        color: color.name,
      })),
    ],
  };
}

/** Approved editorial order; "Mais recentes" preserves source order. */
const existingProducts: readonly Mold3Product[] = [
  withAssets({
    name: "Case para Isqueiro BIC — One Piece",
    slug: "case-isqueiro-bic-one-piece",
    category: "Cases",
    price: 9,
    description: "Case para isqueiro BIC inspirado no universo de One Piece, com textura baseada nos padrões marcantes dos Frutos do Diabo. Uma base cheia de personalidade para receber pintura, acabamento e a identidade de cada artista.",
    dimensions: "1,62 × 2,68 × 7,99 cm",
  }, "BIC_One-Piece_Case", { Preto: mold3DeliveryUrl("BIC_One_Piece_Case_-_black") }),
  withAssets({
    name: "Incensário de Gato",
    slug: "incensario-de-gato",
    category: "Incensários",
    price: 8,
    description: "Incensário em formato de gato, compacto e cheio de personalidade. Uma peça decorativa que também funciona como uma ótima base para pintura e customização artística.",
    dimensions: "8,00 × 8,19 × 2,22 cm",
  }, "Cat_Incense_Burner", {
    // Permanent URL supplied by Human Governance after the proposed ID returned 404.
    Laranja: "https://res.cloudinary.com/ha6r0heb/image/upload/v1791411853/Cat_Incense_Burner_-_orange_-_Copia.png",
  }),
  withAssets({
    name: "Case para Isqueiro Clipper — Mario Bros",
    slug: "case-isqueiro-clipper-mario-bros",
    category: "Cases",
    price: 9,
    description: "Case para isqueiro Clipper inspirado no universo de Mario Bros, transformando um objeto do dia a dia em uma peça divertida e customizável. Ideal para explorar cores, pintura e diferentes estilos de acabamento.",
    dimensions: "3,10 × 3,10 × 6,30 cm",
  }, "Clipper_Mario_Bros_Case"),
  withAssets({
    name: "Cinzeiro",
    slug: "cinzeiro",
    category: "Cinzeiros",
    price: 9,
    description: "Cinzeiro de formato clean e versátil, pensado como uma tela em branco para diferentes estilos de customização. Uma peça simples que ganha outra identidade nas mãos de cada artista.",
    dimensions: "8,00 × 8,00 × 2,00 cm",
  }, "Standard_Ashtray", {
    // Permanent URL supplied by Human Governance after the proposed ID returned 404.
    Medidas: "https://res.cloudinary.com/ha6r0heb/image/upload/v1791411380/Standard_Ashtray_-_measure.png",
  }),
  withAssets({
    name: "Incensário Gota",
    slug: "incensario-gota",
    category: "Incensários",
    price: 10,
    description: "Incensário com formato orgânico inspirado em uma gota, combinando linhas suaves e uma superfície ideal para customização. Uma peça decorativa feita para ganhar novas cores, texturas e interpretações.",
    dimensions: "10,00 × 9,99 × 3,50 cm",
  }, "Teardrop-shaped_incense_burner"),
  withAssets({
    name: "Case para Isqueiro BIC",
    slug: "case-isqueiro-bic",
    category: "Cases",
    price: 7,
    description: "Case compacto para isqueiro BIC, com formato simples e versátil para customização. Uma base para transformar um objeto cotidiano com pintura, ilustração e a identidade visual de cada artista.",
    dimensions: "1,62 × 2,68 × 7,99 cm",
  }, "Standard_Bic_Case"),
];

/** Only delivery URLs returned by read-only Cloudinary discovery; no guessed IDs. */
function withDiscoveredAssets(product: ProductContent, folder: keyof typeof expansionAssets): Mold3Product {
  const assets: Record<string, string> = expansionAssets[folder];
  return {
    ...product,
    availability: "Disponível para produção",
    featured: false,
    mainImage: { src: assets.main, alt: `${product.name} — imagem principal` },
    gallery: [
      { src: assets.measures, alt: `Medidas de ${product.name}: ${product.dimensions}` },
      ...MOLD3_COLORS.map((color) => ({ src: assets[color.assetSuffix], alt: `${product.name} na cor ${color.name}`, color: color.name })),
    ],
  };
}

/** Expansion copy and categories are provisional pending Human Governance review. */
const expansionProducts: readonly Mold3Product[] = [
  withDiscoveredAssets({
    name: "Porta-joias Folha", slug: "porta-joias-folha", category: "Porta-joias", price: 10,
    description: "Porta-joias em formato de folha para organizar pequenos acessórios. Uma base com linhas orgânicas para receber pintura e a identidade de cada artista.",
    dimensions: "15,00 × 7,64 × 1,37 cm",
  }, "Leaf-shaped jewelry box"),
  withDiscoveredAssets({
    name: "Suporte de Celular Gato", slug: "suporte-celular-gato", category: "Suportes de celular", price: 11,
    description: "Suporte de celular em formato de gato para compor a mesa com personalidade. Uma peça funcional aberta a cores, pintura e customização artística.",
    dimensions: "6,13 × 11,87 × 8,12 cm",
  }, "Cat Phone Holder"),
  withDiscoveredAssets({
    name: "Porta-joias Gato", slug: "porta-joias-gato", category: "Porta-joias", price: 10,
    description: "Porta-joias em formato de gato para acomodar pequenos acessórios. Uma peça divertida para explorar pintura, detalhes e diferentes estilos de acabamento.",
    dimensions: "7,02 × 9,99 × 3,95 cm",
  }, "Cat-shaped jewelry box"),
  withDiscoveredAssets({
    name: "Porta-velas Gato", slug: "porta-velas-gato", category: "Porta-velas", price: 11,
    description: "Porta-velas em formato de gato com uma silhueta cheia de personalidade. Uma base decorativa para receber a interpretação e as cores de cada artista.",
    dimensions: "11,25 × 7,28 × 3,98 cm",
  }, "Cat-shaped candle holder"),
  withDiscoveredAssets({
    name: "Porta-copos Padrão", slug: "porta-copos-padrao", category: "Porta-copos", price: 10,
    description: "Porta-copos de formato simples para compor a mesa. Uma superfície versátil para experimentar pintura, padrões e identidade visual.",
    dimensions: "10,00 × 10,00 × 0,64 cm",
  }, "Standard cup holder"),
  withDiscoveredAssets({
    name: "Porta-copos Vitória Amazônica", slug: "porta-copos-vitoria-amazonica", category: "Porta-copos", price: 7,
    description: "Porta-copos inspirado nas formas da vitória-amazônica. Uma peça de linhas orgânicas que convida à customização com cores e diferentes acabamentos.",
    dimensions: "7,96 × 8,20 × 0,75 cm",
  }, "Victoria Amazonica Coaster"),
  withDiscoveredAssets({
    name: "Incensário Padrão", slug: "incensario-padrao", category: "Incensários", price: 11,
    description: "Incensário de formato alongado e linhas simples. Uma base decorativa para explorar pintura e criar uma peça com identidade própria.",
    dimensions: "21,9 × 4,0 × 2,7 cm",
  }, "Standard incense burner"),
  withDiscoveredAssets({
    name: "Suporte de Celular Cachorro", slug: "suporte-celular-cachorro", category: "Suportes de celular", price: 12,
    description: "Suporte de celular em formato de cachorro para dar personalidade à mesa. Uma peça funcional pronta para receber cores e customização artística.",
    dimensions: "7,07 × 7,81 × 3,00 cm",
  }, "Dog-Shaped Phone Holder"),
];

/** Newest batch first; preserve the relative order of the six frozen products. */
export const mold3Products: readonly Mold3Product[] = [...expansionProducts, ...existingProducts];

export const MOLD3_PRICE_NOTE = "Preço especial para collabs";
