import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function AboutHero() {
  return (
    <section id="sobre" className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-9 md:px-8 md:pt-12">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_520px]">
        <div className="min-w-0 pb-5 md:pb-9">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Sobre</p>
          <h1 className="max-w-3xl text-[38px] font-black leading-[1.05] tracking-normal">
            Engenharia Front-End. Capacidade end-to-end. Produtos digitais<span className="text-violet">.</span>
          </h1>
          <p className="mt-4 text-[20px] leading-7 text-muted md:mt-5 md:text-[24px] md:leading-8">
            Senior Front-End Developer | Full-Stack &amp; AI Product Engineering
          </p>
          <p className="mt-4 w-full max-w-full text-sm leading-6 text-muted md:mt-5 md:max-w-[500px] md:text-base md:leading-7">
            Atuo com React, Next.js, TypeScript e JavaScript na construção de interfaces e produtos digitais, conectando
            engenharia, design e necessidades de negócio.
          </p>
          <p className="mt-4 w-full max-w-full text-sm leading-6 text-muted md:max-w-[500px] md:text-base md:leading-7">
            São 10+ anos de experiência em tecnologia e produtos digitais, com capacidades full-stack, integração de IA,
            liderança técnica, Product Management e experiência internacional.
          </p>
          <div className="mt-6 grid gap-3 sm:max-w-[360px] md:mt-7 md:max-w-none md:flex md:flex-wrap md:gap-4">
            <a
              className="violet-button-hover inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 text-sm font-bold text-white shadow-md md:min-w-[132px]"
              href="/cases"
            >
              Ver cases <ArrowRight size={17} />
            </a>
            <a
              aria-label="Ver perfil de Victor Sizino no LinkedIn"
              className="standard-hover inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm md:min-w-[132px]"
              href="https://www.linkedin.com/in/xsizinox/"
              rel="noreferrer"
              target="_blank"
            >
              Ver LinkedIn <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden sm:min-h-[400px] lg:min-h-[520px]">
          <div className="dot-grid absolute inset-x-0 top-0 h-[300px] sm:h-[360px] lg:h-[450px]" />
          <Image
            src="/images/victor-hero-v2.png"
            alt="Victor Sizino"
            width={520}
            height={505}
            priority
            className="relative z-10 mx-auto h-[340px] w-full max-w-[420px] object-contain object-top sm:h-[400px] lg:ml-auto lg:h-[520px] lg:max-w-[620px]"
          />
        </div>
      </div>
    </section>
  );
}
