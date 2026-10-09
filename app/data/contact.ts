export const WHATSAPP_PHONE = "5511985655503";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
