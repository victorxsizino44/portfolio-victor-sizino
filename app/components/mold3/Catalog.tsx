"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";
import { whatsappUrl } from "../../data/contact";
import { MOLD3_PRICE_NOTE, type Mold3Product } from "../../data/mold3";
import { formatMold3Price, getMold3Categories, mold3InterestMessage, selectMold3Products, type Mold3Sort } from "../../lib/mold3";

export default function Catalog({ products }: { products: readonly Mold3Product[] }) {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<Mold3Sort>("recent");
  const categories = getMold3Categories(products);
  const visible = selectMold3Products(products, category, sort);

  return (
    <section id="pecas" className="mold3-list" aria-labelledby="mold3-pieces-title">
      <div className="mold3-toolbar">
        <p className="section-label">Catálogo</p>
        <h2 id="mold3-pieces-title">Uma base para sua criação.</h2>
      </div>
      <div className="mold3-filterbar">
        <div className="mold3-controls">
          <label htmlFor="mold3-category">Categoria<span className="mold3-select-wrap"><select id="mold3-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Todos</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select><ChevronDown size={16} aria-hidden="true" /></span></label>
          <label htmlFor="mold3-sort">Ordenar por<span className="mold3-select-wrap"><select id="mold3-sort" value={sort} onChange={(event) => setSort(event.target.value as Mold3Sort)}>
            <option value="recent">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select><ChevronDown size={16} aria-hidden="true" /></span></label>
        </div>
        <p className="mold3-count" role="status" aria-live="polite" aria-atomic="true">{visible.length} {visible.length === 1 ? "peça" : "peças"}</p>
      </div>
      {visible.length ? <div className="mold3-grid">
        {visible.map((product) => <Link className="card-border standard-hover mold3-card" href={`/mold3/catalog/${product.slug}`} key={product.slug}>
          <div className="mold3-card-image"><Image src={product.mainImage.src} alt={product.mainImage.alt} fill sizes="(max-width: 359px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 260px" /></div>
          <div className="mold3-card-copy"><p className="section-label">{product.category}</p><h3>{product.name}</h3><p className="mold3-price">{formatMold3Price(product.price)}</p><p className="mold3-price-note">{MOLD3_PRICE_NOTE}</p><span className="mold3-piece-link">Ver peça <ArrowUpRight size={16} aria-hidden="true" /></span></div>
        </Link>)}
      </div> : <div className="card-border mold3-empty">
        <h3>{products.length ? "Nenhuma peça nesta categoria." : "As peças chegam em breve."}</h3>
        <p>{products.length ? "Limpe o filtro para explorar as outras peças." : "Estamos preparando o catálogo. Enquanto isso, podemos conversar sobre sua collab pelo WhatsApp."}</p>
        {products.length ? (
          <button className="standard-hover mold3-button mold3-button-secondary" type="button" onClick={() => setCategory("")}>Limpar filtro</button>
        ) : (
          <a className="standard-hover mold3-button mold3-button-secondary" href={whatsappUrl(mold3InterestMessage())} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <MessageCircle size={18} aria-hidden="true" /></a>
        )}
      </div>}
    </section>
  );
}
