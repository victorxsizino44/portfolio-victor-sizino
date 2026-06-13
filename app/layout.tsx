import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victor Sizino | AI Technical Product Manager",
  description:
    "Portfolio de Victor Sizino, AI Technical Product Manager especializado em Produto, Inteligencia Artificial, Automacao, UX e Tecnologia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
