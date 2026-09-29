import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { conversationText, finishTurn, type ConversationTurn } from "../../app/components/agent-b/conversation-view.ts";
import { projectConversation } from "../../lib/agent-b/core/conversation-projection.ts";

const candidate={kind:"ABSTAIN",discoveryId:"test-discovery",runtimeVersion:0,reason:"UNKNOWN_INFORMATION_NEED",resolution:"CLARIFY"};
test("B14-A golden interaction preserves both user/agent turns in order",()=>{
  const first="Quero estruturar um novo produto digital.";
  const second="Quero criar uma plataforma para pequenos lojistas controlarem estoque e vendas sem precisar usar planilhas.";
  let turns:ConversationTurn[]=[{id:"1",message:first}];
  const response=projectConversation(candidate,{message:first});
  turns=finishTurn(turns,"1",{answer:conversationText(response)});
  turns=[...turns,{id:"2",message:second}];
  const next=projectConversation(candidate,{message:second,previousPrompt:response.intent});
  turns=finishTurn(turns,"2",{answer:conversationText(next)});
  assert.deepEqual(turns.map(t=>t.message),[first,second]);
  assert.match(turns[0].answer!,/problema.*para quem/);
  assert.match(turns[1].answer!,/exemplo concreto/);
  assert.doesNotMatch(turns.map(t=>t.answer).join(" "),/ABSTAIN|UNKNOWN|Avaliação governada|Ainda não há base suficiente/);
  assert.equal(response.materialExecutionAllowed,false);assert.equal(next.materialExecutionAllowed,false);
  assert.equal(candidate.kind,"ABSTAIN");
});
test("B14-A retry replaces error in the same turn without duplicating history",()=>{
  const original:ConversationTurn[]=[{id:"1",message:"contexto",answer:"pergunta"},{id:"2",message:"resposta"}];
  const failed=finishTurn(original,"2",{error:"Tente novamente"});
  assert.equal(original[1].error,undefined);
  const accepted=finishTurn(failed,"2",{answer:"próxima pergunta"});
  assert.equal(accepted.length,2);assert.equal(accepted[1].error,undefined);
  assert.deepEqual(finishTurn(accepted,"2",{answer:"próxima pergunta"}),accepted);
  assert.deepEqual(accepted[0],original[0]);
});
test("B14-A material blocker, human decision and evidence wording stay intact",()=>{
  for(const interaction of ["CLARIFY","ESCALATE","CONFIRM","REQUEST_EVIDENCE","CLOSE"]){
    const response=projectConversation({kind:"SUBSTANTIVE",discoveryId:"test",runtimeVersion:0,interaction,navigation:"RETURN",progression:"BLOCK",requiresHumanDecision:true});
    assert.equal(conversationText(response),response.text);
    assert.match(conversationText(response),/bloqueado.*decisão humana/);
  }
  const blocked=projectConversation({...candidate,reason:"INSUFFICIENT_GOVERNED_CONTEXT",resolution:"BLOCK"});
  assert.equal(conversationText(blocked),blocked.text);
});
test("B14-A presentation reuses Agent R styles without runtime imports or transcript persistence",()=>{
  const source=readFileSync(new URL("../../app/components/agent-b/AgentBExperience.tsx",import.meta.url),"utf8");
  for(const className of ["agent-chat","agent-messages","agent-message-user","agent-message-bot","agent-input","agent-loading"])
    assert.ok(source.includes(className));
  assert.match(source,/evaluateProductConversation/);
  assert.match(source,/turns.map/);assert.match(source,/scrollTop = messagesRef.current.scrollHeight/);
  assert.match(source,/!event.shiftKey && !event.nativeEvent.isComposing/);
  assert.doesNotMatch(source,/agente-r|AgentRSection|localStorage|setItem|dangerouslySetInnerHTML|Discovery State|Active Domain|Session · Governed/);
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(css,/\.agent-messages\s*\{[^}]*overflow-y: auto/);
  assert.match(css,/\.agent-message-user\s*\{[^}]*max-width: 88%/);
});
