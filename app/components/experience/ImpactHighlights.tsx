import { impactHighlights } from "../../data/experience";

export default function ImpactHighlights() {
  return (
    <section className="card-border min-w-0 overflow-hidden p-5">
      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-dark">Impactos acumulados</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {impactHighlights.map(({ title, description, icon: Icon }) => (
          <article className="flex min-w-0 items-start gap-3" key={description}>
            <span className="grid size-10 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon size={18} strokeWidth={2} />
            </span>
            <p className="m-0 min-w-0 text-xs leading-5 text-muted">
              <strong className="block text-sm font-black text-ink">{title}</strong>
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
