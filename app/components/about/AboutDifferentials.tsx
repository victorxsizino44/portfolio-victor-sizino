import { ChevronRight } from "lucide-react";
import { differentials } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutDifferentials() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 py-8 md:px-8 md:py-10">
      <AboutSectionTitle eyebrow="O que me diferencia" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {differentials.map(({ title, description, icon: Icon }) => (
          <article className="card-border p-5 transition hover:-translate-y-0.5 hover:border-violet/35 hover:shadow-md" key={title}>
            <span className="grid size-11 place-items-center rounded-full bg-violet/10 text-violet">
              <Icon size={21} strokeWidth={2} />
            </span>
            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-black leading-5">{title}</h2>
              <ChevronRight className="text-violet md:hidden" size={16} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
