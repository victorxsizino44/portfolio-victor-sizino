import Image from "next/image";
import { ArrowRight, Download, MessageCircle } from "lucide-react";
import { skills } from "../../data/home";

export default function HeroSection() {
  return (
    <section id="inicio" className="mx-auto max-w-[1096px] border-b border-line px-5 pb-8 pt-12 md:px-8">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_520px]">
        <div className="pb-9">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Ola, eu sou</p>
          <h1 className="max-w-3xl text-[56px] font-black leading-[0.95] tracking-normal md:text-[72px]">
            Victor Sizino<span className="text-violet">.</span>
          </h1>
          <p className="mt-5 text-[24px] leading-8 text-muted">AI Technical Product Manager</p>
          <p className="mt-5 max-w-[440px] text-base leading-7 text-muted">
            Transformo problemas complexos em produtos digitais escalaveis utilizando Produto, Tecnologia, Inteligencia
            Artificial e Automacao.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              className="inline-flex h-11 min-w-[132px] items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-bold text-white shadow-md"
              href="#cases"
            >
              Ver Cases <ArrowRight size={17} />
            </a>
            <a
              className="inline-flex h-11 min-w-[154px] items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm"
              href="#agente-r"
            >
              Conversar com Agente R <MessageCircle size={16} />
            </a>
            <a
              className="inline-flex h-11 min-w-[132px] items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm"
              href="/victor-sizino-cv.pdf"
            >
              Baixar CV <Download size={16} />
            </a>
          </div>
        </div>
        <div className="relative min-h-[430px] overflow-hidden">
          <div className="dot-grid absolute inset-x-0 top-0 h-[360px]" />
          <Image
            src="/images/victor-hero-v2.png"
            alt="Victor Sizino"
            width={520}
            height={505}
            priority
            className="relative z-10 ml-auto h-[430px] w-full max-w-[520px] object-contain object-top"
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-4">
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
