import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, CircleCheck, ClipboardList, ShieldQuestion } from "lucide-react";
import CaseAccordionMobile from "../../components/cases/CaseAccordionMobile";
import CaseHero from "../../components/cases/CaseHero";
import CaseImpact from "../../components/cases/CaseImpact";
import CaseNavigation from "../../components/cases/CaseNavigation";
import CaseProcess from "../../components/cases/CaseProcess";
import CaseQuote from "../../components/cases/CaseQuote";
import CaseSectionCard from "../../components/cases/CaseSectionCard";
import CaseStack from "../../components/cases/CaseStack";
import Footer from "../../components/home/Footer";
import Header from "../../components/home/Header";
import { getAdjacentCases, getAllCases, getCaseBySlug } from "../../lib/cases";

type CasePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const items = getAllCases();

  return items.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCaseBySlug(slug);

  if (!item) {
    return {
      title: "Case nao encontrado | Victor Sizino",
    };
  }

  return {
    title: `${item.title} | Victor Sizino`,
    description: item.heroDescription,
  };
}

export default async function CaseDetailsPage({ params }: CasePageProps) {
  const { slug } = await params;
  const item = getCaseBySlug(slug);

  if (!item) {
    notFound();
  }

  const adjacentCases = getAdjacentCases(slug);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main className="mx-auto max-w-[1096px] px-5 pb-12 md:px-8">
        <CaseHero item={item} />

        <div className="mt-8 hidden gap-8 md:grid">
          <section aria-label="Contexto, problema e atuacao" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <CaseSectionCard title="Contexto" icon={ClipboardList}>
              <p>{item.context}</p>
            </CaseSectionCard>
            <CaseSectionCard title="Problema" icon={ShieldQuestion}>
              <p>{item.problem}</p>
            </CaseSectionCard>
          </section>

          <section>
            <CaseSectionCard title="Minha atuacao" icon={BriefcaseBusiness}>
              <p>{item.myRole}</p>
              <ul className="mt-5 grid gap-3">
                {item.myRoleBullets.map((bullet) => (
                  <li className="flex items-start gap-2" key={bullet}>
                    <CircleCheck className="mt-0.5 flex-none text-violet" size={16} strokeWidth={2.4} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CaseSectionCard>
          </section>

          <CaseProcess steps={item.process} />
          <div className="grid gap-4 lg:grid-cols-2">
            <CaseImpact items={item.impact} />
            <CaseStack tools={item.tools} />
          </div>
          <section className={item.quote ? "grid items-stretch gap-4 lg:grid-cols-2" : ""}>
            <CaseSectionCard title="Aprendizados">
              <p>{item.learnings}</p>
            </CaseSectionCard>
            <CaseQuote quote={item.quote} />
          </section>
        </div>

        <div className="mt-6 md:hidden">
          <CaseAccordionMobile item={item} />
        </div>

        <div className="mt-8">
          <CaseNavigation previous={adjacentCases.previous} next={adjacentCases.next} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
