import { navItems } from "../../data/home";

export default function Header() {
  return (
    <header className="mx-auto flex max-w-[1096px] items-center justify-between border-b border-line px-5 py-6 md:px-8">
      <a href="#inicio" className="text-[32px] font-black leading-none tracking-normal">
        VS<span className="text-violet">.</span>
      </a>
      <nav className="hidden items-center gap-8 text-[13px] font-semibold md:flex">
        {navItems.map((item, index) => (
          <a
            href={`#${item.toLowerCase()}`}
            className={index === 0 ? "border-b-2 border-ink pb-2" : "pb-2 text-dark/80 hover:text-ink"}
            key={item}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
