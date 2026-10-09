"use client";

import Image from "next/image";
import { type Mold3Image } from "../../data/mold3";

export default function ProductGallery({ images, active, onImageChange }: { images: readonly Mold3Image[]; active: number; onImageChange: (index: number) => void }) {
  const current = images[active];
  return (
    <div>
      <div className="mold3-main-image"><Image src={current.src} alt={current.alt} fill sizes="(max-width: 767px) 100vw, (max-width: 1095px) 55vw, 520px" priority /></div>
      {images.length > 1 && <div className="mold3-thumbnails" role="group" aria-label="Imagens da peça">
        {images.map((item, index) => <button key={item.src} type="button" aria-label={`Ver imagem ${index + 1}: ${item.alt}`} aria-pressed={index === active} onClick={() => onImageChange(index)}><Image src={item.src} alt="" fill sizes="72px" />{index === 1 && <span className="mold3-thumbnail-label">Medidas</span>}</button>)}
      </div>}
    </div>
  );
}
