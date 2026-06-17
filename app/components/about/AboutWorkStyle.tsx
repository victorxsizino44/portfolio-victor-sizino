import { workStyles } from "../../data/about";
import AboutSectionTitle from "./AboutSectionTitle";

export default function AboutWorkStyle() {
  return (
    <section className="min-w-0">
      <AboutSectionTitle eyebrow="Como eu trabalho" />
      <p className="mt-5 text-sm leading-6 text-muted">
        Sou autodidata e acredito que os melhores produtos surgem quando estrategia, tecnologia e experiencia caminham
        juntas.
      </p>
      <p className="mt-4 text-sm leading-6 text-muted">
        Trabalho lado a lado com liderancas e times multidisciplinares para entender os desafios do negocio e transformar
        problemas complexos em solucoes praticas, escalaveis e centradas no usuario.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {workStyles.map(({ title, description, icon: Icon }) => (
          <article className="card-border p-5" key={title}>
            <span className="grid size-10 place-items-center rounded-lg border border-line bg-white text-violet">
              <Icon size={19} strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-sm font-black leading-5">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
