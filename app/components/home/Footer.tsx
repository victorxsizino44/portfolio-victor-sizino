import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1096px] flex-col items-start gap-5 border-t border-line px-5 py-7 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8">
      <p className="text-[30px] font-black leading-none">
        VS<span className="text-violet">.</span>
      </p>
      <p className="text-xs text-muted">2024 Victor Sizino. Todos os direitos reservados.</p>
      <div className="footer-socials">
        <a className="footer-linkedin" href="https://www.linkedin.com/" aria-label="LinkedIn">
          in
        </a>
        <a href="mailto:contato@victorsizino.com" aria-label="Email">
          <Mail size={19} />
        </a>
      </div>
    </footer>
  );
}
