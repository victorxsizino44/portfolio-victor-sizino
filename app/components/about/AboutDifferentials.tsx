import { ChevronRight } from "lucide-react";
import { differentials } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutDifferentials() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 py-9 md:px-8">
      <AboutSectionTitle eyebrow="O que me diferencia" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {differentials.map(({ title, description, icon: Icon }) => (
          <article className="card-border standard-hover p-5" key={title}>
            <span className="grid size-11 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon size={21} strokeWidth={2} />
            </span>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-black leading-5">{title}</h2>
              <ChevronRight className="text-ink md:hidden" size={16} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
