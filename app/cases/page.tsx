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
  const engineeringCases = cases.filter((item) => item.group === "engineering");
  const productCaseStudies = cases.filter((item) => item.group === "product-case-study");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <CasesHero total={getAllCases().length} />

        <section className="mx-auto max-w-[1096px] px-5 pb-10 md:px-8">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="section-label">Explorar</p>
              <h2 className="mt-3 text-2xl font-black leading-8 text-ink">Selected Engineering Work</h2>
            </div>
            <CaseFilters categories={categories} activeCategory={activeCategory} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {engineeringCases.map((item) => (
              <CaseCard item={item} key={item.slug} />
            ))}
          </div>

          {productCaseStudies.length ? (
            <section className="mt-12 border-t border-line pt-9" aria-labelledby="product-case-study-title">
              <p className="section-label">Estudos de produto</p>
              <h2 id="product-case-study-title" className="mt-3 text-2xl font-black leading-8 text-ink">
                Product Case Study
              </h2>
              <p className="mt-3 max-w-[760px] text-sm leading-6 text-muted">
                Estudos estruturados a partir de problemas e oportunidades de produtos digitais para demonstrar raciocínio de produto,
                análise de experiência e construção de hipóteses. Não representam necessariamente projetos implementados, vínculos
                profissionais ou resultados obtidos em produção.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productCaseStudies.map((item) => (
                  <CaseCard item={item} key={item.slug} />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <CasesClosingBlock />
      </main>
      <Footer />
    </div>
  );
}
