import type { Metadata } from "next";
import { ArrowDown, MessageCircle } from "lucide-react";
import Catalog from "../../components/mold3/Catalog";
import PrintInfo from "../../components/mold3/PrintInfo";
import { mold3Products } from "../../data/mold3";
import { whatsappUrl } from "../../data/contact";
import { mold3InterestMessage } from "../../lib/mold3";

export const metadata: Metadata = {
  title: "Catálogo Mold3 | Peças para collab",
  description: "Peças 3D com preço especial para collabs com artistas, tatuadores e criadores transformarem com sua própria identidade.",
  alternates: { canonical: "/mold3/catalog" },
};

export default function Mold3CatalogPage() {
  return <main className="mold3-container" id="mold3-main">
    <section className="mold3-hero" aria-labelledby="mold3-hero-title">
      <p className="section-label">Mold3 · Collabs criativas</p>
      <h1 id="mold3-hero-title">Sua arte.<br />Nossa impressão.</h1>
      <p className="mold3-intro">Peças 3D com preço especial para collabs com artistas, tatuadores e criadores transformarem com sua própria identidade.</p>
      <a className="violet-button-hover mold3-button" href="#pecas">Ver peças <ArrowDown size={18} aria-hidden="true" /></a>
      <ol className="mold3-steps" role="list" aria-label="Como funciona a collab">{["Você escolhe a peça", "Nós produzimos em 3D", "Você customiza com sua arte", "O resultado é compartilhado"].map((step, index) => <li key={step}><span className="mold3-step-number" aria-hidden="true">0{index + 1}</span><span className="mold3-step-copy">{step}</span></li>)}</ol>
    </section>
    <Catalog products={mold3Products} />
    <PrintInfo />
    <section className="mold3-cta" aria-labelledby="mold3-collab-title"><div><p className="section-label">Vamos criar juntos</p><h2 id="mold3-collab-title">Sua próxima collab começa aqui.</h2><p>Conversamos sobre peças, quantidades, cores e os detalhes da parceria pelo WhatsApp.</p></div><a className="violet-button-hover mold3-button" href={whatsappUrl(mold3InterestMessage())} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <MessageCircle size={18} aria-hidden="true" /></a></section>
  </main>;
}
