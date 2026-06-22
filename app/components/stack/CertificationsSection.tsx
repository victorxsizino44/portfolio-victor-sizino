"use client";

import Image from "next/image";
import { FileBadge, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { certifications, continuousLearningCard } from "../../data/stack";
import type { Certification } from "../../data/stack";

function CertificationModal({ certification, onClose }: { certification: Certification; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,15,20,0.45)] p-4 backdrop-blur-md md:p-6"
      onPointerDown={onClose}
    >
      <div
        aria-labelledby="certification-modal-title"
        aria-modal="true"
        className="relative grid max-h-[calc(100vh-32px)] w-full max-w-[920px] overflow-y-auto rounded-lg border border-line bg-white p-4 shadow-[0_24px_70px_rgba(13,13,15,0.18)] md:p-6"
        onPointerDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Fechar modal"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-line bg-white text-ink transition duration-200 hover:border-violet hover:text-violet focus-visible:border-violet focus-visible:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(99,102,241,0.32)]"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] md:items-start">
          <div className="overflow-hidden rounded-lg border border-line bg-canvas">
            {certification.image ? (
              <Image
                alt={`Certificado do curso ${certification.title}`}
                className="h-auto w-full object-contain"
                height={720}
                sizes="(min-width: 768px) 560px, calc(100vw - 64px)"
                src={certification.image}
                width={960}
              />
            ) : (
              <div className="grid min-h-[260px] place-items-center p-8 text-center">
                <span className="grid size-12 place-items-center rounded-lg border border-line bg-white text-ink shadow-sm">
                  <FileBadge aria-hidden="true" size={22} strokeWidth={2} />
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 pr-10 md:pr-0">
            {certification.year ? (
              <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-violet">{certification.year}</p>
            ) : null}
            <h3 id="certification-modal-title" className="mt-3 text-xl font-black leading-7 text-ink md:text-2xl md:leading-8">
              {certification.title}
            </h3>
            {certification.institution ? (
              <p className="mt-3 text-sm font-bold leading-5 text-muted">{certification.institution}</p>
            ) : null}
            {certification.description ? (
              <p className="mt-5 text-sm font-semibold leading-6 text-muted">{certification.description}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificationsSection() {
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);

  function openCertification(certification: Certification) {
    setSelectedCertification(certification);
  }

  return (
    <section className="card-border p-4 md:p-5" aria-labelledby="certifications-title">
      <h2 id="certifications-title" className="text-xs font-black uppercase tracking-[0.12em] text-ink">
        Certificados & Formação Contínua
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="certifications-carousel min-w-0 overflow-x-auto rounded-lg border border-line bg-white">
          <div className="flex min-w-max">
            {certifications.map((certification, index) => (
              <button
                aria-label={`Abrir certificado: ${certification.title}`}
                className="group relative flex min-h-[124px] w-[278px] shrink-0 appearance-none items-center gap-4 border-0 bg-white p-4 text-left font-inherit text-inherit transition duration-200 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[rgba(99,102,241,0.32)]"
                key={certification.id}
                onClick={() => openCertification(certification)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openCertification(certification);
                  }
                }}
                onPointerUp={() => openCertification(certification)}
                type="button"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink transition duration-200 group-hover:border-violet group-hover:text-violet">
                  <FileBadge aria-hidden="true" size={19} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  {certification.year ? (
                    <span className="m-0 block text-xs font-black uppercase tracking-[0.16em] text-violet">
                      {certification.year}
                    </span>
                  ) : null}
                  <span className="mt-2 flex min-h-10 items-center text-xs font-black leading-5 text-ink md:text-[13px]">
                    {certification.title}
                  </span>
                  {certification.institution ? (
                    <span className="mt-2 block text-xs font-bold leading-5 text-muted">{certification.institution}</span>
                  ) : null}
                </span>
                {index < certifications.length - 1 ? (
                  <span className="absolute bottom-3 right-0 top-3 hidden w-px bg-line md:block" aria-hidden="true" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <article className="flex min-h-[112px] items-center gap-4 rounded-lg border border-line bg-white p-4 shadow-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-canvas text-ink">
            <Star aria-hidden="true" size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-black leading-5 text-ink md:text-[13px]">{continuousLearningCard.title}</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">{continuousLearningCard.description}</p>
          </div>
        </article>
      </div>

      {selectedCertification ? (
        <CertificationModal certification={selectedCertification} onClose={() => setSelectedCertification(null)} />
      ) : null}
    </section>
  );
}
