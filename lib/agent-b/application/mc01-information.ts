import { z } from "zod";
import { DiscoveryIdSchema, EntityVersionSchema, InformationRecordIdSchema, TimestampSchema } from "../core/primitives.ts";
import { DiscoveryInformationRecordSchema } from "../core/mc01.ts";
import { FoundationError } from "../core/identity-access.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { Mc01PersistencePort, PersistedInformationRecord } from "../ports/mc01-persistence.ts";

const createInput = z.strictObject({ record: DiscoveryInformationRecordSchema, now: TimestampSchema.optional() });
const readInput = z.strictObject({ discoveryId: DiscoveryIdSchema, recordId: InformationRecordIdSchema });
const updateInput = z.strictObject({ discoveryId: DiscoveryIdSchema, record: DiscoveryInformationRecordSchema, expectedEntityVersion: EntityVersionSchema, now: TimestampSchema.optional() });
const lineageInput = z.strictObject({ discoveryId: DiscoveryIdSchema, lineageRootId: InformationRecordIdSchema });

export class Mc01InformationService {
  private readonly identity: IdentityPort;
  private readonly persistence: Mc01PersistencePort;
  constructor(identity: IdentityPort, persistence: Mc01PersistencePort) { this.identity = identity; this.persistence = persistence; }

  private async principal() {
    const current = await this.identity.current();
    if (!current) throw new FoundationError("AUTHENTICATION_REQUIRED");
    return current;
  }

  async create(input: unknown): Promise<PersistedInformationRecord> {
    const parsed = createInput.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.principal();
    if (parsed.data.record.discoveryId.trim().length === 0) throw new FoundationError("INVALID_INPUT");
    return this.persistence.create({ identityId: current.identityId, record: parsed.data.record, now: parsed.data.now ?? new Date().toISOString() as never });
  }

  async read(input: unknown) {
    const parsed = readInput.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.principal();
    return this.persistence.read({ identityId: current.identityId, ...parsed.data });
  }

  async update(input: unknown) {
    const parsed = updateInput.safeParse(input);
    if (!parsed.success || parsed.data.record.discoveryId !== parsed.data.discoveryId) throw new FoundationError("INVALID_INPUT");
    const current = await this.principal();
    return this.persistence.update({ identityId: current.identityId, ...parsed.data, now: parsed.data.now ?? new Date().toISOString() as never });
  }

  async lineage(input: unknown) {
    const parsed = lineageInput.safeParse(input);
    if (!parsed.success) throw new FoundationError("INVALID_INPUT");
    const current = await this.principal();
    return this.persistence.listLineage({ identityId: current.identityId, ...parsed.data });
  }
}
