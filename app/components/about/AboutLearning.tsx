import { learningGroups } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutLearning() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 py-8 md:px-8 md:py-10">
      <AboutSectionTitle eyebrow="Aprendizado continuo" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {learningGroups.map(({ category, items }) => (
          <article className="card-border min-h-[166px] p-5" key={category}>
            <h2 className="text-[15px] font-black leading-5 text-violet">{category}</h2>
            <ul className="mt-5 grid list-disc gap-2.5 pl-4 text-[12px] font-semibold leading-5 text-dark/80 marker:text-dark/70">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
