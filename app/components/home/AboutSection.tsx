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
        <h2 className="about-title">Construindo produtos que unem negocio, tecnologia e inteligencia artificial.</h2>
        <p className="about-copy">
          Minha trajetoria comecou em UX/UI Design, evoluiu para Engenharia Front-end e hoje atua na lideranca de
          produtos digitais e iniciativas de Inteligencia Artificial.
          <br />
          <br />
          Essa visao multidisciplinar me permite conectar usuarios, negocio e tecnologia para transformar desafios
          complexos em solucoes escalaveis.
          <br />
          <br />
          Ao longo da carreira participei de produtos, plataformas e iniciativas para empresas como Carrefour,
          Stefanini, Reclame Aqui, HireVue, IPNET e Webbiz.ie, alem de projetos de contexto publico como AGU e SETUR, atuando desde a descoberta do problema ate a entrega e
          evolucao da solucao.
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
