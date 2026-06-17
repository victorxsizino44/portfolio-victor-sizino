"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "../../data/home";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const getHref = (item: string) => {
    if (item === "Inicio") {
      return "/";
    }

    if (item === "Sobre") {
      return "/about";
    }

    if (item === "Cases") {
      return "/cases";
    }

    if (item === "Experiência") {
      return "/experiencia";
    }

    if (item === "Skill & Stack") {
      return "/stack";
    }

    const anchor = item
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return `/#${anchor}`;
  };

  const isActive = (item: string) => {
    if (item === "Inicio") {
      return pathname === "/";
    }

    if (item === "Sobre") {
      return pathname === "/about";
    }

    if (item === "Cases") {
      return pathname === "/cases";
    }

    if (item === "Experiência") {
      return pathname === "/experiencia";
    }

    if (item === "Skill & Stack") {
      return pathname === "/stack";
    }

    return false;
  };

  return (
    <header className="relative mx-auto max-w-[1096px] border-b border-line px-5 py-5 md:px-8 md:py-6">
      <div className="flex max-w-full items-center justify-between">
        <a href="/" className="text-[30px] font-black leading-none tracking-normal md:text-[32px]">
          VS<span className="text-violet">.</span>
        </a>
        <nav className="hidden items-center gap-8 text-[13px] font-semibold md:flex">
          {navItems.map((item) => (
            <a
              href={getHref(item)}
              className={isActive(item) ? "border-b-2 border-violet pb-2 text-violet" : "pb-2 text-dark/80 hover:text-ink"}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          className="fixed right-5 top-5 z-50 grid size-11 place-items-center rounded-lg border border-line bg-white text-ink shadow-sm md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
        </button>
      </div>
      {isOpen ? (
        <nav className="fixed left-5 right-5 top-[76px] z-40 grid gap-2 rounded-lg border border-line bg-white p-2 text-sm font-bold shadow-md md:hidden">
          {navItems.map((item) => (
            <a
              className="rounded-md px-3 py-3 text-dark/80 hover:bg-canvas hover:text-ink"
              href={getHref(item)}
              key={item}
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
