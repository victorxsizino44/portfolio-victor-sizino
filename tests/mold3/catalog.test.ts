import assert from "node:assert/strict";
import { test } from "node:test";
import { MOLD3_COLORS, MOLD3_PRICE_NOTE, mold3Products, type Mold3Product } from "../../app/data/mold3.ts";
import { whatsappUrl, WHATSAPP_PHONE } from "../../app/data/contact.ts";
import { formatMold3Price, getMold3Categories, mold3InterestMessage, selectMold3Products } from "../../app/lib/mold3.ts";

// Synthetic test records only. Never exported or registered as catalog content.
const records = [
  { slug: "test-new", category: "Test A", price: 12 },
  { slug: "test-middle", category: "Test B", price: 5 },
  { slug: "test-old", category: "Test A", price: 8 },
] as Mold3Product[];

test("category and price ordering compose without changing newest-first source", () => {
  assert.deepEqual(selectMold3Products(records, "Test A", "price-asc").map((p) => p.slug), ["test-old", "test-new"]);
  assert.deepEqual(selectMold3Products(records, "Test A", "price-desc").map((p) => p.slug), ["test-new", "test-old"]);
  assert.deepEqual(selectMold3Products(records, "", "recent").map((p) => p.slug), ["test-new", "test-middle", "test-old"]);
  assert.deepEqual(records.map((p) => p.price), [12, 5, 8]);
  assert.equal(selectMold3Products(records, "missing", "recent").length, 0);
  assert.equal(selectMold3Products(records, "", "recent").length, 3);
  assert.deepEqual(getMold3Categories(records), ["Test A", "Test B"]);
  assert.deepEqual(getMold3Categories([]), []);
});

test("WhatsApp uses shared contact, preserves product name and does not assume order choices", () => {
  const name = "Teste & imagem / 3D";
  const message = mold3InterestMessage(name);
  const url = new URL(whatsappUrl(message));
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, `/${WHATSAPP_PHONE}`);
  assert.equal(url.searchParams.get("text"), message);
  assert.ok(message.includes(name));
  assert.ok(message.includes("conversar sobre peças, quantidades e cores disponíveis"));
  assert.ok(!mold3InterestMessage().includes(name));
});

test("approved final price is formatted directly and palette is global", () => {
  assert.equal(formatMold3Price(8).replace(/\s/g, " "), "R$ 8,00");
  assert.equal(MOLD3_COLORS.length, 8);
  assert.deepEqual(MOLD3_COLORS.map((c) => c.name), ["Azul", "Verde", "Laranja", "Cinza", "Prateado", "Branco", "Vermelho", "Preto"]);
});

test("expanded catalog uses approved prices and 140 permanent references including Human Governance delivery amendments", () => {
  assert.equal(mold3Products.length, 14);
  assert.equal(new Set(mold3Products.map((product) => product.slug)).size, 14);
  assert.equal(new Set(mold3Products.map((product) => product.name)).size, 14);
  assert.deepEqual(mold3Products.map((p) => p.price), [10, 11, 10, 11, 10, 7, 11, 12, 9, 8, 9, 9, 10, 7]);
  assert.deepEqual(getMold3Categories(mold3Products), ["Cases", "Cinzeiros", "Incensários", "Porta-copos", "Porta-joias", "Porta-velas", "Suportes de celular"]);
  assert.equal(selectMold3Products(mold3Products, "Cases", "recent").length, 3);
  assert.equal(selectMold3Products(mold3Products, "Incensários", "recent").length, 3);
  assert.equal(selectMold3Products(mold3Products, "Cinzeiros", "recent").length, 1);
  assert.equal(selectMold3Products(mold3Products, "Porta-joias", "recent").length, 2);
  assert.equal(selectMold3Products(mold3Products, "Porta-copos", "recent").length, 2);
  assert.equal(selectMold3Products(mold3Products, "Porta-velas", "recent").length, 1);
  assert.equal(selectMold3Products(mold3Products, "Suportes de celular", "recent").length, 2);
  assert.equal(mold3Products.find((product) => product.slug === "incensario-padrao")?.dimensions, "21,9 × 4,0 × 2,7 cm");
  assert.equal(mold3Products.find((product) => product.slug === "suporte-celular-cachorro")?.dimensions, "7,07 × 7,81 × 3,00 cm");
  assert.equal(MOLD3_COLORS.find((color) => color.name === "Verde")?.hex, "#72E95A");
  assert.equal(selectMold3Products(mold3Products, "missing", "recent").length, 0);
  const urls = mold3Products.flatMap((p) => [p.mainImage.src, ...p.gallery.map((image) => image.src)]);
  assert.equal(new Set(urls).size, 140);
  for (const product of mold3Products) {
    assert.equal(product.gallery.length, 9);
    assert.deepEqual(product.gallery.slice(1).map((image) => image.color), MOLD3_COLORS.map((color) => color.name));
    assert.equal(product.availability, "Disponível para produção");
    assert.ok(product.dimensions.endsWith(" cm"));
  }
  assert.ok(urls.every((src) => { const url = new URL(src); return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/") && !url.search; }));
  const ids = urls.map((src) => new URL(src).pathname.split("/").pop());
  assert.ok(urls.includes("https://res.cloudinary.com/ha6r0heb/image/upload/v1791411853/Cat_Incense_Burner_-_orange_-_Copia.png"));
  assert.ok(urls.includes("https://res.cloudinary.com/ha6r0heb/image/upload/v1791411380/Standard_Ashtray_-_measure.png"));
  assert.ok(ids.includes("BIC_One_Piece_Case_-_black.png"));
  assert.equal(MOLD3_PRICE_NOTE, "Preço especial para collabs");
});
