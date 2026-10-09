import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "../../../components/mold3/ProductDetail";
import { mold3Products } from "../../../data/mold3";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = mold3Products.find((item) => item.slug === slug);
  if (!product) return { title: "Peça não encontrada | Mold3" };
  return { title: `${product.name} | Mold3`, description: product.description, alternates: { canonical: `/mold3/catalog/${product.slug}` } };
}

export default async function Mold3ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = mold3Products.find((item) => item.slug === slug);
  if (!product) notFound();
  return <main className="mold3-container mold3-detail" id="mold3-main">
    <nav aria-label="Navegação do catálogo"><Link className="mold3-back" href="/mold3/catalog">← Voltar ao catálogo</Link></nav>
    <ProductDetail key={product.slug} product={product} />
  </main>;
}
