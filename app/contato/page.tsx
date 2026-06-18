"use client";

import Image from "next/image";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Zap,
} from "lucide-react";
import { FormEvent, useState } from "react";

const contactCards = [
  {
    title: "E-mail",
    value: "victor@victorsizino.com.br",
    action: "Copiar e-mail",
    href: "mailto:victor@victorsizino.com.br",
    icon: Mail,
    actionIcon: Copy,
  },
  {
    title: "LinkedIn",
    value: "linkedin.com/in/victorsizino",
    action: "Abrir LinkedIn",
    href: "https://www.linkedin.com/in/victorsizino",
    icon: ExternalLink,
    actionIcon: ExternalLink,
  },
  {
    title: "WhatsApp",
    value: "+55 11 98565-5503",
    action: "Conversar agora",
    href: "https://wa.me/5511985655503",
    icon: MessageCircle,
    actionIcon: MessageCircle,
  },
  {
    title: "Localização",
    value: "São Paulo, Brasil",
    badges: ["Remoto", "Híbrido", "Global"],
    icon: MapPin,
  },
];

const availability = [
  "AI Product Manager",
  "Technical Product Manager",
  "Product Manager",
  "Consultorias de IA",
  "Automação de Processos",
  "Produtos SaaS e Plataformas Digitais",
];

const expectations = [
  {
    title: "Produto",
    text: "Transformo problemas complexos em soluções escaláveis e que geram impacto real.",
    icon: Search,
  },
  {
    title: "IA",
    text: "Uso Inteligência Artificial para acelerar descoberta, execução e geração de valor.",
    icon: Bot,
  },
  {
    title: "Negócio",
    text: "Conecto estratégia, tecnologia e resultado para impulsionar crescimento.",
    icon: BarChart3,
  },
  {
    title: "Execução",
    text: "Atuo do discovery à entrega, sempre junto aos times e com foco em resultado.",
    icon: Zap,
  },
];

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

type FormState = {
  name: string;
  company: string;
  email: string;
  type: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  company: "",
  email: "",
  type: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText("victor@victorsizino.com.br");
    setCopiedEmail(true);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main className="mx-auto max-w-[1096px] px-5 md:px-8">
        <section className="border-b border-line pb-8 pt-9 md:pt-12">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_520px]">
            <div className="min-w-0 pb-5 md:pb-9">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">FALE COMIGO</p>
              <h1 className="max-w-3xl text-[40px] font-black leading-[0.98] tracking-normal sm:text-[48px] md:text-[72px]">
                Vamos construir algo juntos<span className="text-violet">.</span>
              </h1>
              <p className="mt-4 w-full max-w-full text-sm leading-6 text-muted md:mt-5 md:max-w-[460px] md:text-base md:leading-7">
                Estou disponível para oportunidades, consultorias e projetos envolvendo IA, Produto e Inovação.
              </p>
              <div className="mt-6 grid gap-3 sm:max-w-[360px] md:mt-7 md:max-w-none md:flex md:flex-wrap md:gap-4">
                <a
                  className="violet-button-hover inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-ink bg-ink px-5 text-sm font-bold text-white shadow-md md:min-w-[176px]"
                  href="#agenda"
                >
                  Agendar uma conversa <Calendar size={16} />
                </a>
                <a
                  className="standard-hover inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold shadow-sm md:min-w-[154px]"
                  href="https://www.linkedin.com/in/victorsizino"
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver meu LinkedIn <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <div className="relative min-h-[315px] overflow-hidden sm:min-h-[360px] lg:min-h-[430px]">
              <div className="dot-grid absolute inset-x-0 top-0 h-[280px] sm:h-[320px] lg:h-[360px]" />
              <Image
                src="/images/victor-hero-v2.png"
                alt="Victor Sizino"
                width={520}
                height={505}
                className="relative z-10 mx-auto h-[315px] w-full max-w-[390px] object-contain object-top sm:h-[360px] lg:ml-auto lg:h-[430px] lg:max-w-[520px]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mt-9 grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-rows-2">
            {contactCards.map(({ title, value, action, href, badges, icon: Icon, actionIcon: ActionIcon }) => (
              <article className="card-border standard-hover flex min-h-[210px] flex-col p-5 md:p-6 lg:min-h-0" key={title}>
                <span className="icon-box text-ink">
                  <Icon size={24} />
                </span>
                <h2 className="mt-7 text-xl font-black text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{value}</p>
                {badges ? (
                  <div className="mt-auto flex flex-wrap gap-2 pt-7">
                    {badges.map((badge) => (
                      <span className="rounded-md bg-violet/10 px-3 py-2 text-xs font-bold text-violet" key={badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : title === "E-mail" ? (
                  <button
                    className="standard-hover mt-auto inline-flex h-11 items-center gap-3 self-start rounded-lg border border-line bg-white px-5 text-sm font-bold text-ink shadow-sm"
                    onClick={copyEmail}
                    type="button"
                  >
                    {copiedEmail ? "E-mail copiado" : action} {ActionIcon ? <ActionIcon size={16} /> : null}
                  </button>
                ) : (
                  <a
                    className="standard-hover mt-auto inline-flex h-11 items-center gap-3 self-start rounded-lg border border-line bg-white px-5 text-sm font-bold text-ink shadow-sm"
                    href={href}
                    rel={href?.startsWith("http") ? "noreferrer" : undefined}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                  >
                    {action} {ActionIcon ? <ActionIcon size={16} /> : null}
                  </a>
                )}
              </article>
            ))}
          </div>

          <article id="agenda" className="card-border h-full p-5 md:p-6">
            <div className="flex items-center gap-4">
              <span className="icon-box text-ink">
                <Calendar size={20} />
              </span>
              <h2 className="text-2xl font-black">Agende uma conversa</h2>
            </div>
            <p className="mt-6 max-w-[360px] text-sm leading-6 text-muted">
              Escolha um horário na minha agenda para conversarmos sobre oportunidades, projetos ou parcerias.
            </p>
            <div className="mt-8 grid overflow-hidden rounded-lg border border-line bg-white md:grid-cols-[0.78fr_1fr]">
              <div className="border-b border-line p-6 md:border-b-0 md:border-r">
                <p className="text-xs text-muted">Victor Sizino</p>
                <h3 className="mt-2 text-2xl font-black leading-7">Reunião de Descoberta</h3>
                <p className="mt-7 flex items-center gap-2 text-sm font-semibold text-muted">
                  <Calendar className="text-ink" size={15} /> 30 min
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted">
                  <MapPin className="text-ink" size={15} /> Conversa online
                </p>
              </div>
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <button aria-label="Mês anterior" className="grid size-8 place-items-center rounded-lg text-ink transition hover:bg-violet/10 hover:text-violet" type="button">
                    ‹
                  </button>
                  <strong className="text-sm">Junho 2025</strong>
                  <button aria-label="Próximo mês" className="grid size-8 place-items-center rounded-lg text-ink transition hover:bg-violet/10 hover:text-violet" type="button">
                    ›
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted">
                  {weekDays.map((day, index) => (
                    <span key={`${day}-${index}`}>{day}</span>
                  ))}
                  {calendarDays.map((day) => (
                    <span
                      className={`grid size-8 place-items-center rounded-full ${
                        day === 12 ? "bg-violet text-white" : "text-dark"
                      }`}
                      key={day}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-xs font-semibold text-muted">Horário de Brasília (GMT-3)</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
          <article className="card-border p-5 md:p-6">
            <h2 className="text-2xl font-black">Ou envie uma mensagem</h2>
            <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold text-dark">
                  Nome
                  <input
                    className="h-12 rounded-lg border border-line bg-white px-4 text-sm font-medium outline-none focus:border-violet"
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Seu nome"
                    value={form.name}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-dark">
                  Empresa
                  <input
                    className="h-12 rounded-lg border border-line bg-white px-4 text-sm font-medium outline-none focus:border-violet"
                    onChange={(event) => updateField("company", event.target.value)}
                    placeholder="Nome da empresa"
                    value={form.company}
                  />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold text-dark">
                  E-mail
                  <input
                    className="h-12 rounded-lg border border-line bg-white px-4 text-sm font-medium outline-none focus:border-violet"
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="seu@email.com"
                    type="email"
                    value={form.email}
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold text-dark">
                  Tipo de contato
                  <select
                    className="h-12 rounded-lg border border-line bg-white px-4 text-sm font-medium text-muted outline-none focus:border-violet"
                    onChange={(event) => updateField("type", event.target.value)}
                    value={form.type}
                  >
                    <option value="">Selecione uma opção</option>
                    <option>Oportunidade de trabalho</option>
                    <option>Consultoria</option>
                    <option>Projeto de IA</option>
                    <option>Projeto de Produto</option>
                    <option>Networking</option>
                    <option>Outro</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-xs font-bold text-dark">
                Mensagem
                <textarea
                  className="min-h-[150px] resize-none rounded-lg border border-line bg-white px-4 py-4 text-sm font-medium outline-none focus:border-violet"
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Como posso te ajudar?"
                  value={form.message}
                />
              </label>
              {submitted ? (
                <p className="rounded-lg border border-violet/20 bg-violet/10 px-4 py-3 text-sm font-bold text-violet">
                  Mensagem preparada com sucesso. Em breve conectaremos este formulário ao envio real.
                </p>
              ) : null}
              <button className="contact-button m-0 h-12 w-full max-w-[230px] px-6 text-sm" type="submit">
                Enviar mensagem <Send size={16} />
              </button>
            </form>
          </article>

          <div className="grid gap-6">
            <article className="card-border p-5 md:p-6">
              <h2 className="text-2xl font-black">Disponibilidade Atual</h2>
              <p className="mt-4 flex items-center gap-2 text-base font-bold text-violet">
                <span className="size-2 rounded-full bg-violet" /> Aberto para novas oportunidades
              </p>
              <p className="mt-6 text-sm leading-6 text-muted">Atualmente estou interessado em:</p>
              <ul className="mt-5 grid gap-3">
                {availability.map((item) => (
                  <li className="flex items-start gap-3 text-sm font-semibold text-dark" key={item}>
                    <CheckCircle2 className="mt-0.5 text-ink" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card-border relative min-h-[220px] overflow-hidden p-5 md:p-6">
              <div className="relative z-10 max-w-[310px]">
                <h2 className="m-0 text-2xl font-black leading-8">Prefere conhecer meu trabalho?</h2>
                <p className="mt-4 text-sm leading-6 text-muted">
                  Converse com o Agente R e conheça mais sobre minha trajetória, experiências e projetos.
                </p>
                <a
                  className="standard-hover mt-6 inline-flex h-11 items-center gap-3 rounded-lg border border-line bg-white px-5 text-sm font-bold text-ink shadow-sm"
                  href="/#agente-r"
                >
                  Conversar com o Agente R <MessageCircle size={15} />
                </a>
              </div>
              <Image
                src="/images/agente-r.png"
                alt="Agente R"
                width={180}
                height={230}
                className="absolute bottom-6 right-6 hidden w-[132px] scale-[2.14] object-contain drop-shadow-lg sm:block"
              />
            </article>
          </div>
        </section>

        <section className="mt-12">
          <p className="section-label text-violet">O QUE VOCÊ PODE ESPERAR AO TRABALHAR COMIGO</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {expectations.map(({ title, text, icon: Icon }) => (
              <article className="card-border standard-hover p-5 md:p-6" key={title}>
                <span className="icon-box text-ink">
                  <Icon size={24} />
                </span>
                <h2 className="mt-7 text-xl font-black">{title}</h2>
                <p className="mt-4 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card-border relative my-9 flex flex-col gap-6 overflow-hidden p-6 md:min-h-[116px] md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          <div className="relative z-10 flex items-center gap-5">
            <span className="grid size-16 flex-none place-items-center rounded-lg bg-violet text-2xl font-black text-white shadow-md">
              VS.
            </span>
            <div>
              <h2 className="text-xl font-black leading-6 md:text-2xl md:leading-7">Vamos tirar sua ideia do papel?</h2>
              <p className="mt-2 max-w-[520px] text-sm leading-6 text-muted">
                Se você tem um desafio ou projeto em mente, vamos conversar. Estou pronto para ajudar.
              </p>
            </div>
          </div>
          <div className="dot-grid pointer-events-none absolute inset-y-5 left-[52%] hidden w-[190px] opacity-70 md:block" />
          <a className="contact-button relative z-10 m-0 h-12 px-6 text-sm" href="#agenda">
            Agendar conversa <Calendar size={16} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
