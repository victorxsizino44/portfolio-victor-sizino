"use client";

import { Check } from "lucide-react";
import { MOLD3_COLORS, type Mold3Color } from "../../data/mold3";

export default function Colors({ activeColor, onColorChange }: { activeColor?: Mold3Color; onColorChange: (color: Mold3Color) => void }) {
  return <section className="mold3-colors" aria-labelledby="mold3-colors-title">
    <h2 id="mold3-colors-title">Cores disponíveis</h2>
    <p>Selecione uma cor para visualizar a peça. Os detalhes do pedido são combinados pelo WhatsApp.</p>
    <ul>{MOLD3_COLORS.map((color) => <li key={color.name}><button type="button" onClick={() => onColorChange(color.name)} aria-pressed={activeColor === color.name}><span className="mold3-swatch" style={{ backgroundColor: color.hex }} aria-hidden="true" />{color.name}{activeColor === color.name && <Check size={16} aria-hidden="true" />}</button></li>)}</ul>
  </section>;
}
