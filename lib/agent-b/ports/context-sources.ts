import type { CatalogPublication, CatalogRead, GovernedCatalog } from "../core/context-sources.ts";
export interface ContextSourcesPort {
  // Publication must repeat governance validation inside the atomic transaction.
  publish(actor: string, input: CatalogPublication): Promise<GovernedCatalog>;
  read(actor: string, input: CatalogRead): Promise<readonly GovernedCatalog[]>;
}
