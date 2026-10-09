import type { Mold3Product } from "../data/mold3";

export type Mold3Sort = "recent" | "price-asc" | "price-desc";

export function getMold3Categories(products: readonly Mold3Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function selectMold3Products(products: readonly Mold3Product[], category: string, sort: Mold3Sort): Mold3Product[] {
  const selected = products.filter((product) => !category || product.category === category);
  if (sort === "price-asc") selected.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") selected.sort((a, b) => b.price - a.price);
  return selected;
}

export function formatMold3Price(price: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export function mold3InterestMessage(name?: string): string {
  return name
    ? `Olá! Vi ${name} no catálogo da Mold3 e tenho interesse. Queria conversar sobre peças, quantidades e cores disponíveis.`
    : "Olá! Vi o catálogo da Mold3 e tenho interesse em uma collab. Queria conversar sobre peças, quantidades e cores disponíveis.";
}
