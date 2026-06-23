import Header from "./components/home/Header";
import HeroSection from "./components/home/HeroSection";
import AboutSection from "./components/home/AboutSection";
import ExpertiseSection from "./components/home/ExpertiseSection";
import CasesSection from "./components/home/CasesSection";
import CompaniesSection from "./components/home/CompaniesSection";
import ExperienceSection from "./components/home/ExperienceSection";
import AgentRSection from "./components/AgentRSection";
import StackContactSection from "./components/home/StackContactSection";
import Footer from "./components/home/Footer";
import { getAllCases } from "./lib/cases";

export default function Home() {
  const cases = getAllCases();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        <HeroSection />
        <section id="sobre" className="mx-auto max-w-[1096px] px-5 py-9 md:px-8">
          <AboutSection />
          <ExpertiseSection />
        </section>
        <CasesSection cases={cases} />
        <CompaniesSection />
        <ExperienceSection />
        <AgentRSection />
        <StackContactSection />
      </main>
      <Footer />
    </div>
  );
}
