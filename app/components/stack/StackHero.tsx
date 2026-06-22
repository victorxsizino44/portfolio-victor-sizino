import Image from "next/image";

export default function StackHero() {
  return (
    <section id="inicio" className="border-b border-line pb-8 pt-9 md:pt-12">
      <div className="grid grid-cols-[minmax(0,1fr)_170px] items-center gap-5 sm:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_520px]">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Stack & Skills</p>
          <h1 className="max-w-[650px] text-[34px] font-black leading-[1.05] tracking-normal text-ink sm:text-[38px] md:text-[54px]">
            Skills & Stack<span className="text-violet">.</span>
          </h1>
          <p className="mt-4 max-w-[650px] text-xs leading-6 text-muted sm:text-sm md:text-base md:leading-7">
            A combinacao entre visao de produto, expertise tecnica e inteligencia artificial para construir produtos
            digitais que geram impacto real.
          </p>
        </div>
        <div className="relative min-h-[190px] overflow-hidden sm:min-h-[300px] lg:min-h-[390px]" aria-hidden="true">
          <Image
            alt=""
            className="absolute inset-0 h-full w-full scale-125 object-contain sm:scale-[1.22] lg:scale-[1.28]"
            fill
            priority
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 300px, 170px"
            src="/images/hero-stack.png"
          />
        </div>
      </div>
    </section>
  );
}
