"use client";

import Image from "next/image";
import { ArrowRight, Boxes, PackageCheck, Rocket, Sparkles } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessage: Message = {
  role: "assistant",
  content:
    "Ola! Sou o Agente R.\n\nFui treinado para apresentar a trajetoria profissional de Victor Sizino, compartilhar projetos, experiencias, habilidades tecnicas e iniciativas envolvendo Produto, IA, UX, Desenvolvimento e Automacoes.\n\nVoce pode me perguntar sobre:\n- Cases\n- Carreira\n- IA\n- Projetos\n- Tecnologias\n- Metodologias\n- Experiencias profissionais",
};

const agentBenefits = [
  { text: "Conheça experiências e projetos", icon: Boxes },
  { text: "Explore cases e resultados", icon: Rocket },
  { text: "Pergunte sobre IA e automação", icon: PackageCheck },
  { text: "Construído com OpenAI + Make + Agente R", icon: Sparkles },
];

export function AgentRSection() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;

    if (!messagesElement) return;

    messagesElement.scrollTop = messagesElement.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agente-r", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent API failed with status ${response.status}.`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Nao encontrei uma resposta para essa pergunta agora.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao consultar o Agente R.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <section id="agente-r" className="agent-section mx-auto max-w-[1096px] px-5 py-10 md:px-8">
      <div className="agent-shell">
        <div className="agent-intro">
          <div className="agent-kicker">
            <span className="agent-logo">VS.</span>
            <span>Agente digital</span>
          </div>
          <h2 className="agent-title">
            Converse com o agente <span>R</span>
            <Sparkles size={16} />
          </h2>
          <p className="agent-copy">
            Sou o <strong>Agente R</strong>, seu agente MIB digital.
            <br />
            <em>(Most Intelligent Buddy)</em>
          </p>
          <p className="agent-copy">
            Sou um agente de Inteligência Artificial desenvolvido para apresentar a trajetória profissional de Victor
            Sizino de forma interativa.
          </p>
          <p className="agent-copy">
            Fui treinado com experiências, cases, projetos, tecnologias e iniciativas envolvendo Produto, IA,
            Automação, UX e Desenvolvimento Digital.
          </p>
          <p className="agent-copy">
            Experimente perguntar sobre empresas onde ele atuou, desafios resolvidos, resultados alcançados ou projetos
            de Inteligência Artificial.
          </p>

          <div className="agent-benefits">
            {agentBenefits.map(({ text, icon: Icon }) => (
              <div className="agent-benefit" key={text}>
                <Icon size={18} />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <Image src="/images/agente-r.png" alt="Agente R" width={260} height={365} className="agent-mascot" />
        </div>

        <div className="agent-chat" aria-label="Chat com Agente R">
          <div className="agent-chat-header">
            <Image src="/images/agente-r-chat-avatar.png" alt="" width={48} height={48} className="agent-avatar" />
            <div>
              <strong>AGENTE R</strong>
              <span>
                <i /> Online
              </span>
            </div>
          </div>

          <div className="agent-messages" aria-live="polite" ref={messagesRef}>
            {messages.map((message, index) => (
              <div
                className={`agent-message ${
                  message.role === "user" ? "agent-message-user" : "agent-message-bot"
                }`}
                key={`${message.role}-${index}`}
              >
                {message.content.split("\n").map((line, lineIndex) => (
                  <p key={`${line}-${lineIndex}`}>{line || "\u00a0"}</p>
                ))}
              </div>
            ))}
            {loading && (
              <div className="agent-message agent-message-bot agent-loading">
                <span>Agente R esta pensando</span>
                <span className="agent-loading-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}
          </div>

          <form className="agent-input" onClick={() => inputRef.current?.focus()} onSubmit={handleSubmit}>
            <textarea
              aria-label="Pergunte algo ao Agente R"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo ao Agente R..."
              ref={inputRef}
              rows={1}
              value={input}
            />
            <button aria-label="Enviar pergunta" disabled={loading || !input.trim()} type="submit">
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AgentRSection;
