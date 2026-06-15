import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { heroBadges } from "../../data/about";

export default function AboutHero() {
  return (
    <section className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-9 md:px-8 md:py-10">
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_520px]">
        <div className="min-w-0">
          <p className="section-label text-violet">Sobre</p>
          <h1 className="mt-5 max-w-[590px] text-[36px] font-black leading-[1.08] tracking-normal sm:text-[44px] md:text-[52px]">
            Estrategia. Tecnologia. Produto. Impacto real<span className="text-violet">.</span>
          </h1>
          <p className="mt-6 max-w-[540px] text-sm leading-6 text-muted md:text-base md:leading-7">
            Atuo conectando negocio, produto, design e engenharia para transformar problemas complexos em solucoes digitais
            escalaveis.
          </p>
          <p className="mt-4 max-w-[540px] text-sm leading-6 text-muted md:text-base md:leading-7">
            Com mais de 10 anos de experiencia, ja atuei em empresas privadas, governo, startups e projetos internacionais,
            sempre com foco em gerar impacto mensuravel para usuarios e organizacoes.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:max-w-[360px] md:flex-row md:flex-wrap">
            <a
              className="inline-flex h-11 items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              href="/#cases"
            >
              Ver cases <ArrowRight size={17} />
            </a>
            <a
              aria-label="Ver perfil de Victor Sizino no LinkedIn"
              className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-violet/40 hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              href="https://www.linkedin.com/"
              rel="noreferrer"
              target="_blank"
            >
              Ver LinkedIn <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-line bg-white shadow-sm sm:min-h-[380px]">
          <div className="dot-grid absolute inset-0 opacity-80" />
          <Image
            src="/images/victor-hero-v2.png"
            alt="Victor Sizino"
            width={520}
            height={505}
            priority
            className="absolute bottom-0 left-1/2 z-10 h-[300px] w-[330px] max-w-none -translate-x-1/2 object-contain object-bottom sm:h-[390px] sm:w-[430px]"
          />
          {heroBadges.map(({ title, lines, icon: Icon, position }) => (
            <div
              className={`absolute z-20 hidden w-[122px] rounded-lg border border-violet/20 bg-white/92 p-4 text-xs font-black leading-4 shadow-md backdrop-blur sm:block ${position}`}
              key={title}
            >
              <Icon className="mb-3 text-violet" size={24} strokeWidth={2} />
              <p>{title}</p>
              {lines?.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
