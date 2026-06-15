import Image from "next/image";
import { aboutCompanies } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutCompanies() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 py-8 md:px-8 md:py-10">
      <AboutSectionTitle eyebrow="Empresas e projetos" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
        {aboutCompanies.map(({ name, role, logo }) => (
          <article className="card-border flex min-h-[118px] flex-col items-center justify-center gap-3 p-4 text-center" key={name}>
            <div className="flex h-9 w-full items-center justify-center">
              {logo ? (
                <Image src={logo} alt={`Logo ${name}`} width={92} height={42} className="max-h-9 w-auto object-contain" />
              ) : (
                <span className="text-base font-black leading-none">{name}</span>
              )}
            </div>
            <p className="text-[11px] font-bold leading-4 text-muted">{role}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
