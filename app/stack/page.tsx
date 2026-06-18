import type { Metadata } from "next";
import CertificationsSection from "../components/stack/CertificationsSection";
import CoreCompetencies from "../components/stack/CoreCompetencies";
import ProficiencyLegend from "../components/stack/ProficiencyLegend";
import StackCTA from "../components/stack/StackCTA";
import StackCategoryCard from "../components/stack/StackCategoryCard";
import StackHero from "../components/stack/StackHero";
import StackStats from "../components/stack/StackStats";
import ValueSection from "../components/stack/ValueSection";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";
import { stackCategories } from "../data/stack";

export const metadata: Metadata = {
  title: "Stack & Skills | Victor Sizino",
  description:
    "Conheca as principais competencias, stacks e ferramentas de Victor Sizino em AI Product Management, Technical Product Management, Produto, IA, Design e Front-End.",
};

export default function StackPage() {
  const orderedCategoryTitles = [
    "AI & Automacao",
    "Product Management",
    "Technical Product Management",
    "Analytics & Growth",
    "Agile & Delivery",
    "Gestao de Produto",
    "Product Design",
    "Front-End Development",
  ];
  const orderedCategories = orderedCategoryTitles
    .map((title) => stackCategories.find((category) => category.title === title))
    .filter((category): category is (typeof stackCategories)[number] => Boolean(category));

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      <Header />
      <main className="mx-auto max-w-[1096px] px-5 pb-9 md:px-8">
        <div className="min-w-0">
          <StackHero />
          <StackStats />
          <div className="grid gap-6">
            <ProficiencyLegend />
            <section aria-labelledby="stack-categories-title" className="border-b border-line pb-6">
              <h2 id="stack-categories-title" className="sr-only">
                Categorias principais de stack
              </h2>
              <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                <CoreCompetencies variant="desktop" />
                {orderedCategories.map((category, index) => (
                  <StackCategoryCard category={category} index={index} key={category.title} mode="desktop" />
                ))}
              </div>
              <div className="grid gap-3 md:hidden">
                <CoreCompetencies variant="mobile" />
                {orderedCategories.map((category, index) => (
                  <StackCategoryCard category={category} index={index} key={category.title} mode="mobile" />
                ))}
              </div>
            </section>
            <CertificationsSection />
            <ValueSection />
            <StackCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
