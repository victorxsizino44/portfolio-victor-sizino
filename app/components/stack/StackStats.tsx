import { stackMetrics } from "../../data/stack";

export default function StackStats() {
  return (
    <section aria-label="Indicadores de experiencia" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4 md:gap-4">
      {stackMetrics.map(({ title, description, icon: Icon }) => (
        <article className="card-border flex min-h-[86px] items-center gap-4 px-4 py-4 md:min-h-[92px] md:px-5" key={title}>
          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-violet/10 text-violet ring-1 ring-violet/10">
            <Icon aria-hidden="true" size={25} strokeWidth={2.1} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-[18px] font-black leading-[22px] text-ink">{title}</h2>
            <p className="m-0 mt-1 text-xs font-bold leading-3 text-muted">{description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
