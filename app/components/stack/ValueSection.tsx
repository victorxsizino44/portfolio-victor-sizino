import { valueItems } from "../../data/stack";

export default function ValueSection() {
  return (
    <section className="card-border p-4 md:p-5" aria-labelledby="value-title">
      <h2 id="value-title" className="text-xs font-black uppercase tracking-[0.12em] text-ink">
        Como eu transformo tecnologia em valor
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {valueItems.map(({ title, description, icon: Icon }) => (
          <article className="flex gap-4" key={title}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
              <Icon aria-hidden="true" size={19} strokeWidth={2} />
            </span>
            <div>
              <h3 className="m-0 text-xs font-black leading-5 text-violet">{title}</h3>
              <p className="m-0 mt-1 text-xs leading-5 text-ink">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
