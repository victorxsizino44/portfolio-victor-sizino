import { ArrowRight, ExternalLink, Send } from "lucide-react";

export default function ExperienceCTA() {
  return (
    <section className="card-border p-5 md:flex md:items-center md:justify-between md:gap-8 md:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-12 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
          <Send size={22} />
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-xl font-black leading-7 text-ink">Vamos construir o próximo case de sucesso juntos?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Estou sempre aberto a novos desafios e oportunidades que geram impacto real.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-0 md:flex md:flex-none">
        <a
          className="violet-button-hover inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-6 text-sm font-black text-white shadow-md"
          href="/cases"
        >
          Ver meus cases <ArrowRight size={16} />
        </a>
        <a
          className="standard-hover inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-line bg-white px-6 text-sm font-black text-ink shadow-sm"
          href="/contato"
        >
          Falar comigo <ExternalLink size={15} />
        </a>
      </div>
    </section>
  );
}
