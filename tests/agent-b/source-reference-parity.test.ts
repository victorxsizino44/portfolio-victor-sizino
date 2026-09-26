import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { SourceReferenceSchema, HumanDecisionReferenceSchema, TimestampSchema } from "../../lib/agent-b/core/primitives.ts";
import { DependencyContractSchema, FieldContractSchema } from "../../lib/agent-b/core/mc01.ts";
import { GovernedCatalogSchema } from "../../lib/agent-b/core/context-sources.ts";

const source={sourceId:"synthetic",reference:"synthetic"};
const stamp="2026-09-23T12:00:00Z";
const sql=readFileSync(new URL("../../supabase/migrations/20260922000900_agent_b_governed_context_sources.sql",import.meta.url),"utf8");
const sourceSql=sql.split("create function agent_b_private.context_source(")[1].split("$$;")[0];
const timestampSql=sql.split("create function agent_b_private.context_timestamp(")[1].split("$$;")[0];
const sqlPattern=timestampSql.match(/~ '([^']+)'/)![1];
// Local contract/SQL-shape regression. Actual PostgreSQL execution is a separate gate.
const allowed=sourceSql.match(/v-array\[([^\]]+)\]/)![1].split(",").map(s=>s.replaceAll("'",""));
for(const [name,input,valid] of [
 ["without timestamp",source,true], ["valid timestamp",{...source,recordedAt:stamp},true],
 ["offset/minute precision",{...source,recordedAt:"2026-09-23T12:00+03:00"},true],
 ["leap day/fraction",{...source,recordedAt:"2024-02-29T23:59:59.123456Z"},true],
 ["missing offset",{...source,recordedAt:"2026-09-23T12:00:00"},false],
 ["invalid offset",{...source,recordedAt:"2026-09-23T12:00:00+25:00"},false],
 ["invalid separator",{...source,recordedAt:"2026-09-23 12:00:00Z"},false],
 ["nonempty whitespace reference",{...source,reference:" "},true],
 ["invalid timestamp",{...source,recordedAt:"not-a-date"},false],
 ["invalid leap day",{...source,recordedAt:"2025-02-29T12:00:00Z"},false],
 ["invalid hour",{...source,recordedAt:"2026-09-23T24:00:00Z"},false],
 ["null timestamp",{...source,recordedAt:null},false],
 ["missing sourceId",{reference:"synthetic"},false], ["missing reference",{sourceId:"synthetic"},false],
 ["wrong sourceId type",{...source,sourceId:1},false], ["wrong reference type",{...source,reference:[]},false],
 ["extra property",{...source,extra:true},false], ["blank identifier",{...source,sourceId:"\t\u00a0"},false],
] as const) test("R08-06B SourceReference "+name,()=>{
 assert.equal(SourceReferenceSchema.safeParse(input).success,valid);
 if(valid){assert.ok(Object.keys(input).every(k=>allowed.includes(k)));}
 if("recordedAt" in input && typeof input.recordedAt==="string")assert.equal(new RegExp(sqlPattern).test(input.recordedAt),TimestampSchema.safeParse(input.recordedAt).success);
});

test("R08-06C migration has one declaration per function and intact dollar-quoted bodies",()=>{
 const declarations=[...sql.matchAll(/create (?:or replace )?function ([a-z_]+\.[a-z_]+)\(/g)].map(m=>m[1]);
 assert.equal(new Set(declarations).size,declarations.length);
 assert.equal((sql.match(/as \$\$/g)??[]).length,declarations.length);
 assert.equal((sql.match(/\$\$/g)??[]).length,declarations.length*2);
 assert.doesNotMatch(sql,/^\$;|^,false\);|as \$$/m);
 assert.equal((sql.match(/create function agent_b_private.context_source\(/g)??[]).length,1);
 assert.equal((sql.match(/create function agent_b_private.context_timestamp\(/g)??[]).length,1);
 assert.ok(sql.trimEnd().endsWith("grant execute on function public.agent_b_read_governed_context(uuid,uuid,text) to authenticated;"));
});

test("R08-06B SQL timestamp pattern matches the governed calendar/precision/offset contract",()=>{
 const expected=TimestampSchema._zod.pattern!.source.replaceAll("\\d","[0-9]").replaceAll("(?:","(");
 assert.equal(sqlPattern,expected);
 assert.match(sourceSql,/not \(v \? 'recordedAt'\) or agent_b_private.context_timestamp/);
 assert.match(sourceSql,/length\(v->>'reference'\)>0/);
 assert.doesNotMatch(sourceSql,/context_text\(v->'reference'\)/);
});

test("R08-06B nested decision/completion/dependency references retain optional source timestamp",()=>{
 const reference={decisionId:"decision",source:{...source,recordedAt:stamp},recordedAt:stamp};
 const dependency={dependencyId:"dep",critical:false,target:{kind:"DISCOVERY",discoveryId:"another-discovery"},status:"SATISFIED",source:reference.source};
 assert.equal(HumanDecisionReferenceSchema.safeParse(reference).success,true);
 assert.equal(DependencyContractSchema.safeParse(dependency).success,true);
 const field={fieldId:"field",domainId:"domain",entityVersion:0,informationRecordIds:[],completion:{level:"FIELD",status:"COMPLETE",dependencies:[dependency],humanDecision:reference}};
 assert.equal(FieldContractSchema.safeParse(field).success,true);
 assert.equal(GovernedCatalogSchema.safeParse({catalogId:"catalog",discoveryId:"d",version:0,predecessorVersion:null,createdAt:stamp,status:"PUBLISHED",kind:"FIELD_CATALOG",completeness:"COMPLETE",definitions:[{fieldId:"field",contract:field,requirement:"REQUIRED",scopeBinding:{kind:"DISCOVERY_WIDE"}}]}).success,true);
 const helper=sql.split("create function agent_b_private.context_dependency(")[1].split("create function agent_b_private.validate_context_catalog")[0];
 assert.match(helper,/context_source\(v->'source'\)/);
 assert.doesNotMatch(helper,/discoveryId'=d::text/);
 assert.match(sql,/f->'target'->>'discoveryId' is distinct from d::text/);
 assert.match(sql,/context_timestamp\(c->'createdAt'\)/);
 assert.match(sql,/context_timestamp\(v->'recordedAt'\)/);
});
