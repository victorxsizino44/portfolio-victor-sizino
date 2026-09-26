import { z } from "zod";
import { DomainIdSchema } from "./primitives.ts";

export const DomainBindingSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("DOMAIN"), domainId: DomainIdSchema }),
  z.strictObject({ kind: z.literal("CORE_NEUTRAL") }),
]);
export type DomainBinding = z.infer<typeof DomainBindingSchema>;
// Legacy data remains readable, but missing data never means CORE_NEUTRAL.
export const domainBoundShape = { domainId: DomainIdSchema.optional(), domainBinding: DomainBindingSchema.optional() };
export function validDomainBinding(v: { domainId?: string; domainBinding?: DomainBinding }): boolean {
  return v.domainBinding ? v.domainId === undefined || (v.domainBinding.kind === "DOMAIN" && v.domainBinding.domainId === v.domainId) : v.domainId !== undefined;
}
export function bindingOf(v: { domainId?: string; domainBinding?: DomainBinding }): DomainBinding {
  if (!validDomainBinding(v)) throw new Error("INVALID_DOMAIN_BINDING");
  return v.domainBinding ?? { kind: "DOMAIN", domainId: DomainIdSchema.parse(v.domainId) };
}
export function bindingKey(v: { domainId?: string; domainBinding?: DomainBinding }): string {
  const b = bindingOf(v); return b.kind === "CORE_NEUTRAL" ? "CORE_NEUTRAL" : `DOMAIN:${b.domainId}`;
}
