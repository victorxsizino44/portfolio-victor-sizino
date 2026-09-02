import { ArrowRight, Send } from "lucide-react";
import { stack } from "../../data/home";

export default function StackContactSection() {
  return (
    <section id="stack" className="mx-auto grid max-w-[1096px] gap-10 border-t border-line px-5 py-9 md:px-8 lg:grid-cols-2">
      <div>
        <p className="section-label">Stack & ferramentas</p>
        <div className="mt-6 grid grid-cols-2 gap-3 min-[390px]:grid-cols-3 sm:grid-cols-4">
          {stack.map(({ name, icon: Icon }) => (
            <div className="card-border grid h-[70px] place-items-center text-center text-[11px] font-semibold" key={name}>
              <Icon className="text-ink" size={20} />
              {name}
            </div>
          ))}
        </div>
      </div>
      <div id="contato" className="contact-panel">
        <div>
          <p className="section-label">Vamos conversar?</p>
          <h2 className="contact-title">
            Procurando engenharia Front-End sênior,
            <br className="hidden sm:block" />
            capacidade full-stack e integração de IA?
          </h2>
          <p className="contact-copy">Vamos transformar desafios em produtos digitais claros, robustos e escaláveis.</p>
          <a className="contact-button" href="/contato#agenda">
            Agendar conversa <ArrowRight size={17} />
          </a>
        </div>
        <div className="contact-illustration" aria-hidden="true">
          <div className="contact-bubble contact-bubble-main">
            <span />
            <span />
            <span />
            <Send className="contact-plane" size={58} strokeWidth={1.7} />
          </div>
          <div className="contact-bubble contact-bubble-small">
            <i />
            <i />
            <i />
          </div>
          <div className="contact-trail" />
        </div>
      </div>
    </section>
  );
}
