import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | Victor Sizino",
  description:
    "Entre em contato com Victor Sizino para oportunidades em Engenharia Front-End, React, Next.js, posições Full-Stack com foco em Front-End e AI Product Engineering.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: "Contato | Victor Sizino",
    description: "Contato profissional para oportunidades em Engenharia Front-End, React, Next.js, Full-Stack com foco em Front-End e AI Product Engineering.",
    url: "/contato",
  },
  twitter: {
    card: "summary",
    title: "Contato | Victor Sizino",
    description: "Contato profissional para oportunidades em Engenharia Front-End, React, Next.js, Full-Stack com foco em Front-End e AI Product Engineering.",
  },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
