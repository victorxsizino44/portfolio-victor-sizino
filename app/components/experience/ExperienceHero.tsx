import Image from "next/image";
import { floatingCards } from "../../data/experience";
import ExperienceStats from "./ExperienceStats";

export default function ExperienceHero() {
  return (
    <section id="inicio" className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-9 md:px-8 md:pt-12">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_470px]">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Experiência</p>
          <h1 className="max-w-[650px] text-[38px] font-black leading-[1.05] tracking-normal text-ink">
            Mais de 10 anos transformando negócios em impacto real<span className="text-violet">.</span>
          </h1>
          <p className="mt-5 max-w-[640px] text-sm leading-6 text-muted md:text-base md:leading-7">
            Atuei em diferentes segmentos, liderando produtos e times multidisciplinares para entregar soluções que geram
            valor, crescem negócios e melhoram a vida de milhões de pessoas.
          </p>
          <div className="mt-7">
            <ExperienceStats />
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden md:min-h-[470px]">
          <div className="dot-grid absolute inset-x-0 top-0 h-[360px] opacity-80 md:h-[440px]" />
          <Image
            src="/images/victor-hero-v2.png"
            alt="Victor Sizino em foto de perfil profissional"
            width={520}
            height={505}
            priority
            className="relative z-10 mx-auto h-[350px] w-full max-w-[390px] object-contain object-bottom md:h-[470px] md:max-w-[470px]"
          />
          {floatingCards.map(({ title, description, icon: Icon }, index) => (
            <div
              className={[
                "absolute z-20 hidden w-[138px] rotate-[-2deg] rounded-lg border border-line bg-white p-4 shadow-md md:block",
                index === 0 ? "left-3 top-16" : "",
                index === 1 ? "left-5 top-[205px]" : "",
                index === 2 ? "right-2 top-28 rotate-[6deg]" : "",
              ].join(" ")}
              key={title}
            >
              <Icon className="mb-3 text-ink" size={24} strokeWidth={1.9} />
              <p className="m-0 text-xs font-black leading-4 text-ink">{title}</p>
              <p className="m-0 mt-1 text-[11px] font-bold leading-4 text-ink">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
