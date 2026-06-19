import { ArrowRight } from "lucide-react";
import { process, timeline } from "../../data/home";

export default function ExperienceSection() {
  return (
    <section id="experiencia" className="mx-auto grid max-w-[1096px] gap-12 px-5 py-12 md:px-8 lg:grid-cols-[330px_1fr]">
      <div>
        <p className="section-label">Minha Evolucao</p>
        <div className="timeline-list">
          {timeline.map(({ year, role, description }) => (
            <div className="timeline-item" key={year}>
              <span className="timeline-year">{year}</span>
              <span className="timeline-dot" />
              <p className="timeline-copy">
                <strong className="timeline-role">{role}</strong>
                <br />
                <span className="timeline-description">{description}</span>
              </p>
            </div>
          ))}
        </div>
        <a className="timeline-link" href="/experiencia">
          Conheça minha historia <ArrowRight className="text-violet" size={15} />
        </a>
      </div>
      <div>
        <p className="section-label">Como eu trabalho</p>
        <div className="work-grid">
          {process.map(({ title, description, icon: Icon }) => (
            <article className="work-card" key={title}>
              <Icon className="work-card-icon" size={32} strokeWidth={2} />
              <h3 className="work-card-title">{title}</h3>
              <p className="work-card-text">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
