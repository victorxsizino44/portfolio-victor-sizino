"use client";

import Image from "next/image";
import { BriefcaseBusiness } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { companies } from "../../data/home";
import type { CompanyItem } from "../../types/home";
import CompanyModal from "./CompanyModal";

const initialsByCompany: Record<string, string> = {
  Carrefour: "CA",
  "Reclame Aqui": "RA",
  Méliuz: "M",
  IPNET: "IP",
  AGU: "AGU",
  SETUR: "ST",
  Webbix: "WB",
};

function getCompanyInitials(name: string) {
  if (initialsByCompany[name]) {
    return initialsByCompany[name];
  }

  const words = name.split(" ").filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function CompanyCardLogo({ company, initials }: { company: CompanyItem; initials: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [company.logo]);

  if (hasImageError) {
    return <span className="company-logo-fallback">{initials}</span>;
  }

  return (
    <span className="company-logo-image">
      <Image src={company.logo} alt={company.name} width={88} height={48} onError={() => setHasImageError(true)} />
    </span>
  );
}

export default function CompaniesSection() {
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const activeCardRef = useRef<HTMLButtonElement | null>(null);

  const openCompany = (company: CompanyItem, card: HTMLButtonElement) => {
    activeCardRef.current = card;
    setSelectedCompany(company);
  };

  const closeCompany = useCallback(() => {
    setSelectedCompany(null);
    window.requestAnimationFrame(() => {
      activeCardRef.current?.focus();
    });
  }, []);

  return (
    <section className="companies-section mx-auto max-w-[1096px] px-5 py-12 md:px-8" id="empresas">
      <div className="companies-header">
        <p className="section-label">Empresas & Projetos</p>
        <h2>
          Experiências construídas em diferentes mercados e{" "}
          <span>desafios digitais.</span>
        </h2>
        <p>
          Atuação em produtos, plataformas e iniciativas digitais para empresas, startups e órgãos públicos,
          conectando estratégia, experiência, tecnologia e impacto de negócio.
        </p>
      </div>

      <div className="companies-grid" aria-label="Empresas e projetos">
        {companies.map((company) => {
          const initials = getCompanyInitials(company.name);

          return (
            <button
              className="company-card"
              key={company.name}
              onClick={(event) => openCompany(company, event.currentTarget)}
              type="button"
            >
              <span className="company-logo">
                <CompanyCardLogo company={company} initials={initials} />
              </span>
              <span className="company-name">{company.name}</span>
              <span className="company-segment">{company.segment}</span>
            </button>
          );
        })}
      </div>

      <div className="companies-summary-card">
        <span className="companies-summary-icon" aria-hidden="true">
          <BriefcaseBusiness size={15} strokeWidth={2.4} />
        </span>
        <div>
          <strong>20+ projetos entregues</strong>
          <p>Experiência em empresas, startups e iniciativas digitais de diferentes segmentos.</p>
        </div>
      </div>

      {selectedCompany ? (
        <CompanyModal
          company={selectedCompany}
          initials={getCompanyInitials(selectedCompany.name)}
          onClose={closeCompany}
        />
      ) : null}
    </section>
  );
}
