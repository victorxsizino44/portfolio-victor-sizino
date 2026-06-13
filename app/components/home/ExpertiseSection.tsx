import { expertise } from "../../data/home";

export default function ExpertiseSection() {
  return (
    <>
      <p className="section-label mt-10">Minha expertise</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {expertise.map(({ title, icon: Icon, items }) => (
          <article className="card-border min-h-[190px] p-6" key={title}>
            <div className="flex items-center gap-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-canvas">
                <Icon className={title === "Technical Delivery" ? "text-violet" : "text-ink"} size={18} />
              </span>
              <h3 className="text-base font-bold">{title}</h3>
            </div>
            <ul className="mt-5 space-y-2 pl-[52px] text-sm leading-5">
              {items.map((item) => (
                <li className="flex items-start gap-2" key={item}>
                  <span className="mt-[7px] size-1 rounded-full bg-ink" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
