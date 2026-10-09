"use client";

import { useState } from "react";
import { MOLD3_PRICE_NOTE, type Mold3Product, type Mold3Color } from "../../data/mold3";
import { whatsappUrl } from "../../data/contact";
import { formatMold3Price, mold3InterestMessage } from "../../lib/mold3";
import ProductGallery from "./ProductGallery";
import Colors from "./Colors";
import PrintInfo from "./PrintInfo";

export default function ProductDetail({ product }: { product: Mold3Product }) {
  const images = [product.mainImage, ...product.gallery];
  const [active, setActive] = useState(0);
  const setColor = (color: Mold3Color) => {
    const index = images.findIndex((image) => image.color === color);
    if (index >= 0) setActive(index);
  };

  return (
    <div className="mold3-product-layout">
      <ProductGallery images={images} active={active} onImageChange={setActive} />
      <div className="mold3-product-copy">
        <p className="section-label">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="mold3-price">{formatMold3Price(product.price)}</p>
        <p className="mold3-price-note">{MOLD3_PRICE_NOTE}</p>
        <p className="mold3-description">{product.description}</p>
        <Colors activeColor={images[active].color} onColorChange={setColor} />
        <dl>
          <div><dt>Dimensões</dt><dd>{product.dimensions}</dd></div>
          <div><dt>Disponibilidade</dt><dd>{product.availability}</dd></div>
        </dl>
        <PrintInfo />
        <a className="violet-button-hover mold3-button" href={whatsappUrl(mold3InterestMessage(product.name))} target="_blank" rel="noopener noreferrer">Quero essa peça <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}
