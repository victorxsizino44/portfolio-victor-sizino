type CasesHeroProps = {
  total: number;
};

export default function CasesHero({ total }: CasesHeroProps) {
  return (
    <section className="mx-auto max-w-[1096px] px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
      <p className="section-label">Cases de produto</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(260px,0.22fr)] lg:items-end">
        <div>
          <h1 className="max-w-[780px] text-[34px] font-black leading-[1.05] tracking-normal text-ink md:text-[48px]">
            Produto, IA, UX e tecnologia conectados a impacto de negocio.
          </h1>
          <p className="mt-5 max-w-[720px] text-base leading-7 text-muted">
            Uma selecao de cases que mostram Victor Sizino atuando como Product Manager e Technical Product Manager,
            conectando discovery, estrategia, delivery, experiencia e viabilidade tecnica.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <span className="block text-3xl font-black leading-none text-violet">{total}</span>
          <span className="mt-2 block text-sm font-bold leading-5 text-muted">cases estruturados para leitura de hiring teams</span>
        </div>
      </div>
    </section>
  );
}
