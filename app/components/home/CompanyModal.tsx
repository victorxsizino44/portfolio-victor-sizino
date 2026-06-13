"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CompanyItem } from "../../types/home";

type CompanyModalProps = {
  company: CompanyItem;
  initials: string;
  onClose: () => void;
};

function CompanyLogo({ company, initials }: { company: CompanyItem; initials: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [company.logo]);

  if (hasImageError) {
    return <span className="company-logo-fallback company-modal-logo-fallback">{initials}</span>;
  }

  return (
    <span className="company-modal-logo-frame">
      <Image src={company.logo} alt={company.name} width={88} height={48} onError={() => setHasImageError(true)} />
    </span>
  );
}

export default function CompanyModal({ company, initials, onClose }: CompanyModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const chips = company.context.split("•").map((item) => item.trim());

  useEffect(() => {
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="company-modal-overlay" onMouseDown={onClose}>
      <div
        aria-labelledby="company-modal-title"
        aria-modal="true"
        className="company-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button ref={closeButtonRef} aria-label="Fechar modal" className="company-modal-close" onClick={onClose}>
          <X size={18} strokeWidth={2.4} />
        </button>

        <div className="company-modal-header">
          <div className="company-modal-logo">
            <CompanyLogo company={company} initials={initials} />
          </div>
          <div>
            <h3 id="company-modal-title" className="company-modal-title">
              {company.name}
            </h3>
            <p className="company-modal-segment">{company.segment}</p>
          </div>
        </div>

        <div className="company-modal-content">
          <div>
            <p className="company-modal-label">Contexto</p>
            <p className="company-modal-description">{company.description}</p>
          </div>

          <div>
            <p className="company-modal-label">Atuação</p>
            <div className="company-modal-chips">
              {chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
