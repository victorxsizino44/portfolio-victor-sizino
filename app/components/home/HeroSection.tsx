import Image from "next/image";
import { ArrowRight, Download, MessageCircle } from "lucide-react";
import { skills } from "../../data/home";

export default function HeroSection() {
  return (
    <section id="inicio" className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-9 md:px-8 md:pt-12">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_520px]">
        <div className="min-w-0 pb-5 md:pb-9">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Ola, eu sou</p>
          <h1 className="max-w-3xl text-[40px] font-black leading-[0.98] tracking-normal sm:text-[48px] md:text-[72px]">
            Victor Sizino<span className="text-violet">.</span>
          </h1>
          <p className="mt-4 text-[20px] leading-7 text-muted md:mt-5 md:text-[24px] md:leading-8">AI Technical Product Manager</p>
          <p className="mt-4 w-full max-w-full text-sm leading-6 text-muted md:mt-5 md:max-w-[440px] md:text-base md:leading-7">
            Transformo problemas complexos em produtos digitais escalaveis utilizando Produto, Tecnologia, Inteligencia
            Artificial e Automacao.
          </p>
          <div className="mt-6 grid gap-3 sm:max-w-[360px] md:mt-7 md:max-w-none md:flex md:flex-wrap md:gap-4">
            <a
              className="inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-bold text-white shadow-md md:min-w-[132px]"
              href="#cases"
            >
              Ver Cases <ArrowRight size={17} />
            </a>
            <a
              className="inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm md:min-w-[154px]"
              href="#agente-r"
            >
              Conversar com Agente R <MessageCircle size={16} />
            </a>
            <a
              className="inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm md:min-w-[132px]"
              href="/victor-sizino-cv.pdf"
            >
              Baixar CV <Download size={16} />
            </a>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:hidden">
            {skills.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex min-h-9 min-w-0 items-center gap-2 rounded-lg border border-line bg-white px-3 text-[11px] font-bold shadow-sm"
              >
                <Icon className="shrink-0 text-violet" size={16} strokeWidth={2} />
                <span className="min-w-0 truncate">{label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[315px] overflow-hidden sm:min-h-[360px] lg:min-h-[430px]">
          <div className="dot-grid absolute inset-x-0 top-0 h-[280px] sm:h-[320px] lg:h-[360px]" />
          <Image
            src="/images/victor-hero-v2.png"
            alt="Victor Sizino"
            width={520}
            height={505}
            priority
            className="relative z-10 mx-auto h-[315px] w-full max-w-[390px] object-contain object-top sm:h-[360px] lg:ml-auto lg:h-[430px] lg:max-w-[520px]"
          />
        </div>
      </div>
      <div className="mt-2 hidden flex-wrap gap-4 md:flex">
        {skills.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="inline-flex h-9 items-center gap-3 rounded-lg border border-line bg-white px-4 text-xs font-bold shadow-sm"
          >
            <Icon className="text-violet" size={16} strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
