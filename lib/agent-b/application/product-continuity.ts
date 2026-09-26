import { currentRecordIds } from "../core/current-information.ts";
import { ContinuityRequestSchema, ContinuityResultSchema, projectRuntimeStatus } from "../core/product-continuity.ts";
import { FoundationError } from "../core/identity-access.ts";
import { DiscoveryFoundation } from "./discovery-foundation.ts";
import { RuntimeFoundation } from "./runtime-foundation.ts";
import { ProductRuntime } from "./product-runtime.ts";
import type { IdentityPort } from "../ports/identity.ts";
import type { DiscoveryPersistencePort, DiscoveryListingPort } from "../ports/discovery-persistence.ts";
import type { RuntimePersistencePort } from "../ports/runtime-persistence.ts";
import type { GovernedContextReadPort } from "../ports/governed-context.ts";

export class ProductContinuity {
  private identity:IdentityPort;
  private roots:DiscoveryPersistencePort & DiscoveryListingPort;
  private persistence:RuntimePersistencePort;
  private discovery:DiscoveryFoundation;
  private runtime:RuntimeFoundation;
  private product:ProductRuntime;
  constructor(identity:IdentityPort,roots:DiscoveryPersistencePort & DiscoveryListingPort,runtime:RuntimePersistencePort,context:GovernedContextReadPort){
    this.identity=identity;this.roots=roots;this.persistence=runtime;
    this.discovery=new DiscoveryFoundation(identity,roots);this.runtime=new RuntimeFoundation(identity,runtime);
    this.product=new ProductRuntime(identity,roots,runtime,context);
  }
  async execute(input:unknown){
    const parsed=ContinuityRequestSchema.safeParse(input);
    if(!parsed.success)throw new FoundationError("INVALID_INPUT");
    const {kind,...request}=parsed.data;
    if(kind==="ENTRY"){
      const actor=await this.identity.current();
      if(!actor)return ContinuityResultSchema.parse({kind:"ENTRY",choices:[]});
      const choices=[];
      for(const root of await this.roots.listOwned(actor.identityId)){
        await this.discovery.readRoot(root.discoveryId);
        const runtime=await this.runtime.read({discoveryId:root.discoveryId});
        if(!runtime)continue; // No initialization or identity creation on page load.
        if(runtime.discoveryId!==root.discoveryId)throw new FoundationError("ACCESS_DENIED");
        const sessions=await this.persistence.listSessions({identityId:actor.identityId,discoveryId:root.discoveryId});
        const previous=sessions.find(s=>s.sessionId===runtime.current.sessionId && s.discoveryId===root.discoveryId);
        if(!previous || sessions.some(s=>s.lifecycle==="OPEN"&&s.sessionId!==previous.sessionId))throw new FoundationError("CONCURRENT_MODIFICATION");
        choices.push({discoveryId:root.discoveryId,createdAt:root.createdAt,previousSessionId:previous.sessionId,
          expectedRuntimeVersion:runtime.runtimeVersion,status:projectRuntimeStatus(runtime)});
      }
      return ContinuityResultSchema.parse({kind:"ENTRY",choices});
    }
    if(parsed.data.kind==="NEW"){
      const handle=await this.product.initialize(request);
      const runtime=await this.runtime.read({discoveryId:handle.discoveryId});
      if(!runtime)throw new FoundationError("PROVIDER_UNAVAILABLE");
      return ContinuityResultSchema.parse({kind:"READY",runtime:handle,status:projectRuntimeStatus(runtime),
        continuation:"Nova Discovery iniciada. Que problema você quer explorar e para quem?"});
    }
    const {kind:_kind,...resume}=parsed.data;
    await this.discovery.readRoot(resume.discoveryId);
    const result=await this.runtime.resume(resume);
    // ResumeContext is derived by RuntimeFoundation AFTER the atomic operation.
    const current=await this.runtime.read({discoveryId:resume.discoveryId});
    if(!current||current.runtimeVersion!==result.context.runtimeVersion||current.current.sessionId!==result.session.sessionId)
      throw new FoundationError("CONCURRENT_MODIFICATION");
    const status=projectRuntimeStatus(current);
    const continuation=currentRecordIds(result.context.current).length
      ?"Vamos continuar esta Discovery. Há informações referenciadas no estado governado; vamos revisar o que ainda precisa ser esclarecido."
      :"Vamos continuar esta Discovery. Ainda não há informação referenciada como atual. Que contexto você deseja explorar?";
    return ContinuityResultSchema.parse({kind:"READY",runtime:{discoveryId:current.discoveryId,sessionId:result.session.sessionId,runtimeVersion:current.runtimeVersion},
      status,continuation});
  }
}
