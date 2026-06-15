import { careerTimeline } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutTimeline() {
  return (
    <section className="min-w-0">
      <AboutSectionTitle eyebrow="Minha trajetoria" />
      <div className="relative mt-7 grid gap-0">
        <span className="absolute left-[5px] top-[7px] h-[calc(100%-16px)] w-px bg-violet/45" aria-hidden="true" />
        {careerTimeline.map(({ period, role, description }) => (
          <article className="relative grid grid-cols-[12px_1fr] gap-[26px] pb-7 last:pb-0" key={`${period}-${role}`}>
            <span
              className="relative z-10 mt-[5px] size-3 rounded-full border-2 border-violet bg-canvas"
              aria-hidden="true"
            />
            <div>
              <p className="mb-[5px] text-[13px] font-medium leading-[14px] text-violet">{period}</p>
              <h2 className="m-0 text-[15px] font-black leading-[17px] text-ink">{role}</h2>
              <p className="mt-0 max-w-[275px] text-[13px] leading-[20px] text-muted">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
