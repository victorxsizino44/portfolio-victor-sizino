import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victor Sizino | Technical Product Manager",
  description:
    "Portfolio de Victor Sizino, Technical Product Manager focado em produto, design, engenharia e IA.",
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
