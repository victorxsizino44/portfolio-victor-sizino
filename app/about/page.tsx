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
    "Conheca a trajetoria de Victor Sizino, AI Product Manager e Technical Product Manager com experiencia em Produto, Tecnologia, Design, IA e projetos digitais no Brasil e na Irlanda.",
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
