import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://victor-sizino.vercel.app";
const siteTitle = "Victor Sizino | Senior Front-End Developer";
const siteDescription =
  "Portfólio de Victor Sizino, Senior Front-End Developer com capacidades full-stack e experiência na construção de produtos digitais com inteligência artificial.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Victor Sizino",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: { card: "summary", title: siteTitle, description: siteDescription },
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
