import { ArrowRight, Mail } from "lucide-react";
import { aboutCtaIcon as Icon } from "../../data/about";

export default function AboutCTA() {
  return (
    <section className="mx-auto max-w-[1096px] px-5 py-9 md:px-8">
      <div className="card-border flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex min-w-0 gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
            <Icon size={25} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-[24px] font-black leading-8">Vamos construir o proximo grande produto?</h2>
            <p className="mt-2 max-w-[580px] text-sm leading-6 text-muted">
              Estou aberto a oportunidades como AI Product Manager, Technical Product Manager e Product Manager.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <a
            className="violet-button-hover inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 text-sm font-bold text-white shadow-md"
            href="/#cases"
          >
            Ver cases <ArrowRight size={17} />
          </a>
          <a
            className="standard-hover inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm"
            href="/#contato"
          >
            Entrar em contato <Mail size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
