import type { Metadata } from "next";
import ExperienceCTA from "../components/experience/ExperienceCTA";
import ExperienceHero from "../components/experience/ExperienceHero";
import ExperienceSidebar from "../components/experience/ExperienceSidebar";
import ExperienceTimeline from "../components/experience/ExperienceTimeline";
import ImpactHighlights from "../components/experience/ImpactHighlights";
import InternationalExperience from "../components/experience/InternationalExperience";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";

export const metadata: Metadata = {
  title: "Experiência | Victor Sizino",
  description:
    "Experiência profissional de Victor Sizino em Produto, IA, Tecnologia, e-commerce, fintech, governo e projetos internacionais.",
};

export default function ExperienciaPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <ExperienceHero />
        <div className="mx-auto grid max-w-[1096px] gap-6 px-5 pb-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="grid min-w-0 gap-6">
            <ImpactHighlights />
            <div className="lg:hidden">
              <ExperienceSidebar variant="mobile" />
            </div>
            <ExperienceTimeline />
            <InternationalExperience />
            <ExperienceCTA />
          </div>
          <ExperienceSidebar variant="desktop" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
