"use client";

import {
  ArrowRight,
  Boxes,
  FileCheck2,
  FileInput,
  Lightbulb,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { evaluateProductConversation, ProductRequestError, type ProductUIState } from "./runtime-client";
import type { ConversationResponse } from "../../../lib/agent-b/core/conversation-projection";

import { conversationText, finishTurn, type ConversationTurn } from "./conversation-view";

import { readContinuity, enterDiscovery } from "./continuity-client";
import type { ContinuityChoice, HumanStatus } from "../../../lib/agent-b/core/product-continuity";
import type { ProductHandle } from "../../../lib/agent-b/core/product-runtime";

const quickActions = [
  {
    label: "Iniciar um novo Discovery",
    prompt: "Quero iniciar um novo Discovery. Minha iniciativa é...",
    icon: SearchCheck,
  },
  {
    label: "Estruturar uma ideia de produto",
    prompt: "Quero estruturar uma ideia de produto. O contexto inicial é...",
    icon: Lightbulb,
  },
  {
    label: "Transformar contexto em Briefing",
    prompt: "Quero transformar este contexto em um Briefing governado: ",
    icon: FileInput,
  },
];

const capabilities = [
  { label: "Contexto e objetivos", icon: MessageSquareText },
  { label: "Facts, assumptions e gaps", icon: SearchCheck },
  { label: "Constraints e dependencies", icon: Boxes },
  { label: "Readiness e governança humana", icon: ShieldCheck },
];

export default function AgentBExperience() {
  const [draft, setDraft] = useState("");
  const [choices,setChoices]=useState<ContinuityChoice[]>([]);
  const [entryLoading,setEntryLoading]=useState(true);
  const [entryError,setEntryError]=useState("");
  const [active,setActive]=useState<ProductHandle|null>(null);
  const [humanStatus,setHumanStatus]=useState<HumanStatus|null>(null);
  const [continuation,setContinuation]=useState("");
  useEffect(()=>{
    let mounted=true;
    readContinuity().then(items=>{if(mounted)setChoices(items);})
      .catch(()=>{if(mounted)setEntryError("Não foi possível verificar suas Discoveries. Tente novamente.");})
      .finally(()=>{if(mounted)setEntryLoading(false);});
    return ()=>{mounted=false;};
  },[]);
  const [status, setStatus] = useState<ProductUIState>("idle");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const busy = status === "initializing" || status === "loading";
  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [turns, busy]);
  const inFlight = useRef(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const previousPrompt = useRef<ConversationResponse["intent"] | undefined>(undefined);

  const selectAction = (prompt: string) => {
    setDraft(prompt);

    window.requestAnimationFrame(() => composerRef.current?.focus());
  };
  const refreshEntries=async()=>{
    setEntryLoading(true);setEntryError("");
    try{setChoices(await readContinuity());}catch{setEntryError("Não foi possível verificar suas Discoveries.");}
    finally{setEntryLoading(false);}
  };
  const enter=async(choice?:ContinuityChoice)=>{
    if(inFlight.current)return;
    inFlight.current=true;setStatus("initializing");setEntryError("");
    try{
      const result=await enterDiscovery(window.sessionStorage,choice);
      setActive(result.runtime);setHumanStatus(result.status);setContinuation(result.continuation);
      setTurns([]);setDraft("");previousPrompt.current=undefined;setStatus("ready");
    }catch(error){
      const state=error instanceof ProductRequestError?error.state:"error";setStatus(state);
      setEntryError(state==="conflict"?"O estado mudou. Atualize a lista antes de continuar.":"Não foi possível abrir esta Discovery agora. Nenhuma nova Discovery foi criada como alternativa.");
    }finally{inFlight.current=false;}
  };
  const submit = async (retry?: ConversationTurn) => {
    if (inFlight.current || !active || (!retry && !draft.trim())) return;
    const turn = retry ?? {id:crypto.randomUUID(),message:draft.trim(),capturedAt:new Date().toISOString()};
    inFlight.current = true; setStatus("initializing");
    if (!retry) { setTurns(current => [...current, turn]); setDraft(""); }
    else setTurns(current => current.map(item => item.id === turn.id ? {...item,error:undefined} : item));
    try {
      const handle = active;
      setStatus("loading");
      const {action,response} = await evaluateProductConversation(handle,{message:turn.message,previousPrompt:previousPrompt.current},fetch,{operationId:turn.id,capturedAt:turn.capturedAt!});
      setActive({...handle,runtimeVersion:action.runtimeVersion});
      if (action.kind === "ABSTAIN") setStatus("abstain");
      else setStatus("substantive");
      setTurns(current => finishTurn(current,turn.id,{answer:conversationText(response)}));
      previousPrompt.current=response.intent;
    } catch (error) {
      const next = error instanceof ProductRequestError ? error.state : "error";
      setStatus(next);
      const message = next === "unauthorized" ? "Não foi possível autorizar seu acesso a esta conversa. Verifique sua sessão antes de tentar novamente."
        : next === "conflict" ? "O contexto desta conversa mudou. Tente novamente para consultar o estado atual."
        : "Não foi possível obter uma resposta agora. Você pode tentar novamente sem reenviar sua mensagem.";
      setTurns(current => finishTurn(current,turn.id,{error:message}));
    } finally { inFlight.current = false; }
  };

  return (
    <section aria-labelledby="agent-b-title" className="mx-auto max-w-[1096px] px-5 pb-12 pt-8 md:px-8 md:pb-16 md:pt-12">
      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-lg">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-10 lg:p-10">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.18em] text-violet">
              <div aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-violet text-lg font-black tracking-normal text-white shadow-md">
                B.
              </div>
              <span>VS Method™ · Briefing & Discovery Agent</span>
            </div>

            <h1 id="agent-b-title" className="mt-7 max-w-[520px] text-[34px] font-black leading-[1.08] tracking-[-0.035em] text-ink sm:text-[44px] lg:text-[48px]">
              <span className="text-violet">Agent B™</span> — Briefing & Discovery Agent
            </h1>

            <div className="mt-6 max-w-[560px] space-y-4 text-[14px] leading-6 text-muted sm:text-[15px]">
              <p>
                O Agent B™ conecta esta experiência ao estado governado do Discovery. A avaliação usa informações persistidas e respeita as decisões humanas necessárias.
              </p>
              <p>
                O modelo conceitual prevê a identificação de gaps, validação de informações e organização de evidências para um futuro <strong className="font-extrabold text-dark">Governed Briefing</strong>.
              </p>
            </div>

            <div aria-label="Capacidades governadas" className="mt-7 grid gap-2 sm:grid-cols-2">
              {capabilities.map(({ label, icon: Icon }) => (
                <div className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-canvas px-3 text-xs font-bold text-dark" key={label}>
                  <Icon aria-hidden="true" className="shrink-0 text-violet" size={17} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <p className="mt-7 text-sm font-semibold leading-6 text-dark">
              Descreva sua iniciativa para orientar a conversa. Declarações explícitas elegíveis podem ser registradas como informação não verificada. A conversa não cria decisões humanas.
            </p>

            <div aria-label="Ações sugeridas" className="mt-4 grid gap-2">
              {quickActions.map(({ label, prompt, icon: Icon }) => (
                <button
                  className="standard-hover flex min-h-12 w-full items-center gap-3 rounded-lg border border-line bg-white px-4 text-left text-xs font-extrabold text-dark"
                  key={label}
                  onClick={() => selectAction(prompt)}
                  disabled={busy}
                  type="button"
                >
                  <Icon aria-hidden="true" className="shrink-0 text-violet" size={17} />
                  <span className="flex-1">{label}</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </button>
              ))}

            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-4 rounded-xl border border-line p-4 text-sm" aria-label="Continuar ou iniciar Discovery">
              {entryLoading ? <p role="status">Verificando Discoveries acessíveis…</p> : <>
                {choices.map((choice,index)=><button key={choice.discoveryId} className="mb-2 block font-bold text-violet" disabled={busy} onClick={()=>void enter(choice)} type="button">Continuar Discovery {choices.length>1?index+1:""}</button>)}
                <button className="font-bold text-violet" disabled={busy||!!entryError} onClick={()=>void enter()} type="button">Iniciar nova Discovery</button>
              </>}
              {entryError&&<p role="alert">{entryError}</p>}
              <button className="mt-2 block text-xs underline" disabled={busy||entryLoading} onClick={()=>void refreshEntries()} type="button">Atualizar lista de Discoveries</button>
            </div>
            {humanStatus&&<aside className="mb-4 rounded-xl border border-line p-4 text-sm" aria-label="Estado da Discovery">
              <p className="mb-2 text-xs text-muted">Estado consultado ao abrir esta Discovery</p>
              <strong>{humanStatus.title}</strong><ul className="mt-2 list-disc pl-4">{humanStatus.items.map(item=><li key={item}>{item}</li>)}</ul><p className="mt-2">{humanStatus.review}</p>
            </aside>}
          <div className="agent-chat min-w-0" aria-label="Conversa com Agent B">
            <header className="agent-chat-header">
              <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-violet text-sm font-black text-white">B.</div>
              <div><strong>AGENT B™</strong><span>Briefing & Discovery Agent</span></div>
            </header>
            <div className="agent-messages" role="log" aria-label="Mensagens da conversa" aria-live="polite" ref={messagesRef}>
              <div className="agent-message agent-message-bot"><p>{continuation || "Escolha uma Discovery para continuar ou inicie uma nova."}</p></div>
              {turns.map(turn => (
                <div key={turn.id} className="flex min-w-0 flex-col gap-2">
                  <div className="agent-message agent-message-user break-words [overflow-wrap:anywhere]" aria-label="Você"><p>{turn.message}</p></div>
                  {turn.answer && <div className="agent-message agent-message-bot break-words [overflow-wrap:anywhere]" aria-label="Agent B"><p>{turn.answer}</p></div>}
                  {turn.error && <div className="agent-message agent-message-bot" role="status">
                    <p>{turn.error}</p>
                    <button className="mt-2 font-bold text-violet underline" type="button" disabled={busy} onClick={() => void submit(turn)}>Tentar novamente</button>
                  </div>}
                </div>
              ))}
              {busy && <div className="agent-message agent-message-bot agent-loading" role="status">
                <span>Agent B está preparando a resposta</span>
                <span className="agent-loading-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>}
            </div>
            <form className="agent-input" onSubmit={event => {event.preventDefault();void submit();}}>
              <textarea aria-label="Mensagem para Agent B" maxLength={2000} disabled={!active || busy || turns.some(turn => !!turn.error)}
                onChange={event => setDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {event.preventDefault();void submit();}
                }}
                placeholder="Descreva sua iniciativa ou responda à pergunta..." ref={composerRef} rows={1} value={draft} />
              <button aria-label="Enviar mensagem" disabled={!active || busy || !draft.trim() || turns.some(turn => !!turn.error)} type="submit"><ArrowRight size={20} /></button>
            </form>
            <p className="mt-2 text-[10px] text-muted">Enter envia · Shift+Enter quebra a linha · Histórico somente nesta página</p>
          </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-line bg-canvas px-5 py-4 text-xs leading-5 text-muted sm:px-8 lg:px-10">
          <FileCheck2 aria-hidden="true" className="mt-0.5 shrink-0 text-violet" size={17} />
          <p>
            <strong className="font-extrabold text-dark">Discovery before Output.</strong> O Agent B™ não inventa respostas, não resolve ambiguidades silenciosamente e não substitui decisões humanas.
          </p>
        </div>
      </div>
    </section>
  );
}
