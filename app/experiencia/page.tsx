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
  title: "Experiência Profissional | Victor Sizino",
  description:
    "Trajetória profissional de Victor Sizino em Engenharia Front-End, React, Next.js, TypeScript, liderança técnica, capacidades full-stack, AI Product Engineering e produto.",
  alternates: { canonical: "/experiencia" },
  openGraph: {
    title: "Experiência Profissional | Victor Sizino",
    description: "10+ anos em tecnologia e produtos digitais, com Engenharia Front-End, liderança técnica, capacidades full-stack e experiência internacional.",
    url: "/experiencia",
  },
  twitter: {
    card: "summary",
    title: "Experiência Profissional | Victor Sizino",
    description: "10+ anos em tecnologia e produtos digitais, com Engenharia Front-End, liderança técnica, capacidades full-stack e experiência internacional.",
  },
};

export default function ExperienciaPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <ExperienceHero />
        <div className="mx-auto grid max-w-[1096px] gap-6 px-5 py-9 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
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
