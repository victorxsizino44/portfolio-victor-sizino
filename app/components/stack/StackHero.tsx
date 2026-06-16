export default function StackHero() {
  return (
    <section id="inicio" className="pb-7 pt-8 md:pt-10">
      <div className="grid grid-cols-[minmax(0,1fr)_118px] items-center gap-5 sm:grid-cols-[minmax(0,1fr)_190px] lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-violet">Stack & Skills</p>
          <h1 className="max-w-[650px] text-[34px] font-black leading-[1.05] tracking-normal text-ink sm:text-[38px] md:text-[54px]">
            Skills & Stack<span className="text-violet">.</span>
          </h1>
          <p className="mt-4 max-w-[650px] text-xs leading-6 text-muted sm:text-sm md:text-base md:leading-7">
            A combinacao entre visao de produto, expertise tecnica e inteligencia artificial para construir produtos
            digitais que geram impacto real.
          </p>
        </div>
        <div className="relative min-h-[150px] overflow-hidden sm:min-h-[220px] lg:min-h-[330px]" aria-hidden="true">
          <div className="dot-grid absolute inset-0 opacity-70 [transform:perspective(560px)_rotateX(58deg)_rotateZ(-8deg)]" />
          <div className="absolute bottom-8 left-1/2 h-20 w-24 -translate-x-1/2 rounded-lg bg-white shadow-lg ring-1 ring-line sm:h-28 sm:w-32 lg:h-36 lg:w-40" />
          <div className="absolute bottom-[86px] left-1/2 h-16 w-16 -translate-x-1/2 rotate-45 rounded-[18px] bg-violet shadow-[0_18px_40px_rgba(99,102,241,0.35)] sm:bottom-[126px] sm:h-20 sm:w-20 lg:bottom-[172px] lg:h-28 lg:w-28 lg:rounded-[28px]">
            <div className="absolute inset-0 rounded-[inherit] bg-white/10" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-xs font-black text-white lg:text-lg">
              VS.
            </div>
          </div>
          <div className="absolute bottom-8 left-5 size-9 rounded-lg bg-white shadow-md ring-1 ring-line sm:size-12 lg:left-12 lg:size-16" />
          <div className="absolute bottom-14 right-4 size-8 rounded-lg bg-white shadow-md ring-1 ring-line sm:size-11 lg:right-10 lg:size-14" />
          <div className="absolute right-1 top-10 hidden size-9 rounded-lg bg-white shadow-md ring-1 ring-line sm:block lg:right-20 lg:size-12" />
          <div className="absolute left-16 top-16 hidden size-8 rounded-lg bg-white shadow-md ring-1 ring-line lg:block" />
          <div className="absolute inset-x-8 bottom-0 h-20 bg-gradient-to-t from-canvas to-transparent" />
        </div>
      </div>
    </section>
  );
}
