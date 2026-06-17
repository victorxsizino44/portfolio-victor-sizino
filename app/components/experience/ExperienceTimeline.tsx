import { experiences } from "../../data/experience";
import ExperienceCard from "./ExperienceCard";

export default function ExperienceTimeline() {
  return (
    <section id="minha-trajetoria" className="border-b border-line pb-6" aria-labelledby="experience-timeline-title">
      <h2 id="experience-timeline-title" className="text-xs font-black uppercase tracking-[0.16em] text-dark">
        Minha trajetória
      </h2>
      <div className="relative mt-5 grid gap-4 md:gap-0">
        <span className="absolute bottom-6 left-0 top-6 w-px bg-violet/25 md:left-0" aria-hidden="true" />
        {experiences.map((experience, index) => (
          <div className="relative pl-5 md:pb-4" key={experience.company}>
            <span
              className="absolute left-[-5px] top-8 z-10 size-3 rounded-full border-2 border-violet bg-white md:top-10"
              aria-hidden="true"
            />
            <ExperienceCard experience={experience} defaultOpen={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
