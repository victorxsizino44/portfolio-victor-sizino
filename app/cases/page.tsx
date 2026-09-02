import type { Metadata } from "next";
import CaseCard from "../components/cases/CaseCard";
import CaseFilters from "../components/cases/CaseFilters";
import CasesClosingBlock from "../components/cases/CasesClosingBlock";
import CasesHero from "../components/cases/CasesHero";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";
import { getAllCases, getCaseCategories, getCasesByCategory } from "../lib/cases";

export const metadata: Metadata = {
  title: "Cases | Victor Sizino",
  description:
    "Seleção de trabalhos de Victor Sizino em Engenharia Front-End, e-commerce, plataformas digitais, integrações, AI Product Engineering e produto.",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "Cases | Victor Sizino",
    description: "Trabalhos em Engenharia Front-End, plataformas digitais, integrações, AI Product Engineering e produto.",
    url: "/cases",
  },
  twitter: {
    card: "summary",
    title: "Cases | Victor Sizino",
    description: "Trabalhos em Engenharia Front-End, plataformas digitais, integrações, AI Product Engineering e produto.",
  },
};

type CasesPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const categories = getCaseCategories();
  const activeCategory = params?.category && categories.includes(params.category) ? params.category : "Todos";
  const cases = activeCategory === "Todos" ? getAllCases() : getCasesByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <CasesHero total={getAllCases().length} />

        <section className="mx-auto max-w-[1096px] px-5 pb-10 md:px-8">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="section-label">Explorar</p>
              <h2 className="mt-3 text-2xl font-black leading-8 text-ink">Todos os cases</h2>
            </div>
            <CaseFilters categories={categories} activeCategory={activeCategory} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <CaseCard item={item} key={item.slug} />
            ))}
          </div>
        </section>

        <CasesClosingBlock />
      </main>
      <Footer />
    </div>
  );
}
