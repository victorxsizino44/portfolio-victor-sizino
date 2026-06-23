import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CasesClosingBlock() {
  return (
    <section className="mx-auto max-w-[1096px] px-5 py-9 md:px-8">
      <div className="flex flex-col justify-between gap-5 rounded-lg border border-line bg-white p-6 shadow-sm md:flex-row md:items-center md:p-7">
        <div>
          <p className="section-label">Proxima conversa</p>
          <h2 className="mt-3 max-w-[620px] text-2xl font-black leading-8 text-ink">
            Quer discutir produto, IA, discovery ou delivery tecnico?
          </h2>
        </div>
        <Link
          className="violet-button-hover inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-ink bg-ink px-5 text-sm font-black leading-none text-white outline-offset-4"
          href="/contato"
        >
          Falar com Victor
          <ArrowRight size={16} strokeWidth={2.3} />
        </Link>
      </div>
    </section>
  );
}
