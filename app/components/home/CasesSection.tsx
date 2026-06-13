import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { cases } from "../../data/home";

export default function CasesSection() {
  return (
    <section id="cases" className="mx-auto max-w-[1096px] px-5 py-3 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="section-label">Cases de impacto</p>
        <a href="#contato" className="text-sm font-bold text-violet">
          Ver todos os cases <ArrowRight className="inline" size={15} />
        </a>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((item) => (
          <article className="case-card" key={item.title}>
            <Image src={item.image} alt="" fill className="case-card-image" />
            <div className="case-card-scrim" />
            <div className="case-card-content">
              <span className={`case-badge ${item.badgeClass}`}>{item.badge}</span>
              <div className="case-copy">
                <h3 className="case-title">{item.title}</h3>
                <p className="case-description">{item.description}</p>
              </div>
              <div className="case-results">
                <span className="case-results-label">Resultados</span>
                {item.stats.map((stat) => (
                  <span className="case-result-item" key={stat}>
                    <Check size={13} strokeWidth={2.4} />
                    {stat}
                  </span>
                ))}
              </div>
              <div className="case-tags">
                {item.tags.map((tag) => (
                  <span className="case-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
