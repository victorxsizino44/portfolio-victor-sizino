import { journeyHighlights } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutHighlights() {
  return (
    <section className="min-w-0">
      <AboutSectionTitle eyebrow="Destaques da jornada" />
      <div className="mt-6 grid gap-3">
        {journeyHighlights.map(({ title, description, icon: Icon }) => (
          <article className="card-border flex gap-4 p-5" key={title}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon size={18} strokeWidth={2} />
            </span>
            <div>
              <h2 className="-mt-0.5 text-sm font-black leading-[15px]">{title}</h2>
              {description ? <p className="mt-2 text-xs leading-5 text-muted">{description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
