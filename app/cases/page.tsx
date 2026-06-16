import type { Metadata } from "next";
import CasesSection from "../components/home/CasesSection";
import Footer from "../components/home/Footer";
import Header from "../components/home/Header";
import StackContactSection from "../components/home/StackContactSection";

export const metadata: Metadata = {
  title: "Cases | Victor Sizino",
  description:
    "Cases de Victor Sizino em Produto, IA, Tecnologia, e-commerce, governo, analytics e experiências digitais.",
};

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main className="pt-8">
        <CasesSection />
        <StackContactSection />
      </main>
      <Footer />
    </div>
  );
}
