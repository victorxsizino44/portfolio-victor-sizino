import type { Metadata } from "next";
import AboutCompanies from "../components/about/AboutCompanies";
import AboutCTA from "../components/about/AboutCTA";
import AboutDifferentials from "../components/about/AboutDifferentials";
import AboutHero from "../components/about/AboutHero";
import AboutImpact from "../components/about/AboutImpact";
import AboutJourney from "../components/about/AboutJourney";
import AboutLearning from "../components/about/AboutLearning";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";

export const metadata: Metadata = {
  title: "Sobre | Victor Sizino",
  description:
    "Conheça a trajetória de Victor Sizino em Engenharia Front-End, React, Next.js, TypeScript, liderança técnica, capacidades full-stack e AI Product Engineering.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Sobre | Victor Sizino",
    description: "Trajetória em Engenharia Front-End, liderança técnica, capacidades full-stack, AI Product Engineering e produto.",
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "Sobre | Victor Sizino",
    description: "Trajetória em Engenharia Front-End, liderança técnica, capacidades full-stack, AI Product Engineering e produto.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <AboutHero />
        <AboutDifferentials />
        <AboutImpact />
        <AboutJourney />
        <AboutCompanies />
        <AboutLearning />
        <AboutCTA />
      </main>
      <Footer />
    </div>
  );
}
