type AboutSectionTitleProps = {
  eyebrow: string;
  title?: string;
  description?: string;
};

export default function AboutSectionTitle({ eyebrow, title, description }: AboutSectionTitleProps) {
  return (
    <div className="min-w-0">
      <p className="section-label text-violet">{eyebrow}</p>
      {title ? <h2 className="mt-4 max-w-2xl text-[28px] font-black leading-9 md:text-[34px] md:leading-10">{title}</h2> : null}
      {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
    </div>
  );
}
