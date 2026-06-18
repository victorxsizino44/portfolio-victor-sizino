import type { LucideIcon } from "lucide-react";

type CaseSectionCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
};

export default function CaseSectionCard({ title, children, icon: Icon }: CaseSectionCardProps) {
  return (
    <article className="card-border p-6 md:p-7">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="grid size-10 flex-none place-items-center rounded-lg border border-line bg-canvas text-ink">
            <Icon size={18} strokeWidth={2.2} />
          </span>
        ) : null}
        <h2 className="text-lg font-black leading-6 text-ink">{title}</h2>
      </div>
      <div className="mt-5 text-sm leading-6 text-muted">{children}</div>
    </article>
  );
}
