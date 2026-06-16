import { ArrowRight } from "lucide-react";
import { stackCtaIcon as Icon } from "../../data/stack";

export default function StackCTA() {
  return (
    <section className="flex flex-col gap-6 rounded-lg border border-violet/15 bg-violet/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="flex min-w-0 gap-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-white text-violet shadow-sm">
          <Icon aria-hidden="true" size={25} strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-[24px] font-black leading-8 text-ink">Vamos conversar?</h2>
          <p className="mt-2 max-w-[580px] text-sm leading-6 text-muted">
            Quer saber como essas habilidades podem transformar seu produto?
          </p>
        </div>
      </div>
      <a
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet md:w-auto"
        href="/#contato"
      >
        Entrar em contato <ArrowRight aria-hidden="true" size={17} />
      </a>
    </section>
  );
}
