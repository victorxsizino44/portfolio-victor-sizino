# B01 — prototype type reconciliation

Implementation note only. The approved B01 instruction authorizes this batch;
the B00 implementation reference remains intact as its historical foundation.
`app/types/agent-b.ts` is not a source of governed authority and is unchanged.

| Prototype type | Classification | Relationship to B01 |
| --- | --- | --- |
| AgentBMessageRole | presentation-only | Conversation roles are not evidence or governance roles. |
| AgentBMessage | presentation-only | Transcript content is not DiscoveryInformationRecord. |
| AgentBDiscoveryStatus | future reconciliation required | Mixes UI, service and discovery concerns; not a universal lifecycle. |
| AgentBReadiness | superseded by governed contract (semantic use only) | CompletionContract supplies separate level/status and explicit decision references. No direct cast or implicit uppercase conversion. |
| AgentBDiscoveryProgress | future reconciliation required | UI projection must eventually derive from governed state; domain labels/readiness are not authority. |
| AgentBSession | future reconciliation required | Bundles messages, discovery progress and a decision flag. SessionId and DiscoveryId are distinct; the flag is not human approval. |
| AgentBRequest | future reconciliation required | Future transport mapping must validate unknown input and distinguish session from discovery. No endpoint is defined here. |
| AgentBError | future reconciliation required | Presentation error codes do not establish a governed error contract. |

No complete prototype type is certified compatible with a governed contract.
“Superseded” concerns semantic authority, not deletion or migration: all legacy
types, imports, UI behavior and static prototype remain untouched.

B01 supplies structural schemas only. Zod success does not establish semantic
validity, human authority, evidence authenticity or eligibility for handoff.
Session ≠ Discovery; Resume ≠ state; Resume ≠ Transcript Replay;
Runtime Version ≠ Entity Version. Runtime primitives define no resume behavior.
