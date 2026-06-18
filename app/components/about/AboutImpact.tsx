import { impactMetrics } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutImpact() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 py-9 md:px-8">
      <AboutSectionTitle eyebrow="Impacto" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {impactMetrics.map(({ value, label }) => (
          <article className="card-border min-h-[118px] p-5" key={value}>
            <h2 className="text-[22px] font-black leading-7 text-violet">{value}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
