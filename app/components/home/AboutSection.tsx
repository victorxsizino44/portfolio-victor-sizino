import Image from "next/image";
import { highlights } from "../../data/home";

export default function AboutSection() {
  return (
    <div className="grid gap-7 md:grid-cols-[156px_1fr_344px] md:gap-8">
      <Image
        src="/images/victor-card-v2.png"
        alt="Victor Sizino"
        width={156}
        height={180}
        className="h-[112px] w-[112px] rounded-lg object-cover shadow-sm md:h-[180px] md:w-[156px]"
      />
      <div className="min-w-0">
        <p className="section-label">Sobre mim</p>
        <h2 className="about-title">Engenharia Front-End apoiada por visão de produto e capacidade end-to-end.</h2>
        <p className="about-copy">
          Minha trajetória começou em Design, evoluiu para Engenharia Front-End e liderança técnica, com experiência
          profissional em interfaces e produtos digitais.
          <br />
          <br />
          Atuo com React, Next.js, TypeScript e JavaScript, combinando capacidades full-stack e integração de serviços de
          IA para construir experiências digitais completas, sem perder o foco em clareza, qualidade e necessidades reais.
          <br />
          <br />
          Ao longo da carreira participei de produtos, plataformas e iniciativas para empresas como Carrefour,
          Stefanini, Reclame Aqui, HireVue, IPNET e Webbiz.ie, além de projetos de contexto público como AGU e SETUR, atuando desde a descoberta do problema até a entrega e
          evolução da solução, preservando também experiência em Product e Technical Product Management.
        </p>
      </div>
      <div className="about-highlights">
        {highlights.map(({ title, description, icon: Icon }) => (
          <div className="about-highlight" key={title}>
            <span className="icon-box">
              <Icon size={17} />
            </span>
            <p>
              <strong>{title}</strong>
              <br />
              <span className="text-muted">{description}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
