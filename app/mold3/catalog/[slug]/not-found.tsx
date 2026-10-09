import Link from "next/link";

export default function ProductNotFound() {
  return <main className="mold3-container mold3-empty"><h1>Peça não encontrada.</h1><p>Explore as peças disponíveis no catálogo.</p><Link className="mold3-button" href="/mold3/catalog">Voltar ao catálogo</Link></main>;
}
