"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
};

export default function Tooltip({ label, children }: TooltipProps) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isPointerInteractionRef = useRef(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setIsDismissed(true);
        buttonRef.current?.blur();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsDismissed(true);
        buttonRef.current?.blur();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <span
      className="group relative inline-flex items-center self-center"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
          setIsDismissed(false);
        }
      }}
      onMouseEnter={() => {
        setIsDismissed(false);
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (!wrapperRef.current?.contains(document.activeElement)) {
          setIsOpen(false);
        }
      }}
      ref={wrapperRef}
    >
      <button
        aria-describedby={tooltipId}
        aria-label={label}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink transition duration-200 hover:border-violet hover:text-violet focus-visible:border-violet focus-visible:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(99,102,241,0.32)]"
        onClick={() => {
          setIsDismissed(false);
          setIsOpen(true);
          window.setTimeout(() => {
            isPointerInteractionRef.current = false;
          }, 0);
        }}
        onFocus={() => {
          if (!isPointerInteractionRef.current) {
            setIsDismissed(false);
            setIsOpen(true);
          }
        }}
        onMouseDown={() => {
          isPointerInteractionRef.current = true;
        }}
        onPointerDown={() => {
          isPointerInteractionRef.current = true;
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            setIsDismissed(true);
            event.currentTarget.blur();
          }
        }}
        ref={buttonRef}
        type="button"
      >
        <Info aria-hidden="true" size={10} strokeWidth={2.6} />
      </button>
      <span
        className={`pointer-events-none absolute left-1/2 top-6 z-20 w-[min(68vw,360px)] -translate-x-1/2 rounded-lg border border-line bg-white px-4 py-3 text-left text-xs font-semibold leading-5 text-muted opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:left-0 md:w-[360px] md:translate-x-0 ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        } ${
          isDismissed ? "!-translate-y-1 !opacity-0" : ""
        }`}
        id={tooltipId}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}
