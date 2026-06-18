import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CaseNavigationItem } from "../../types/case";

type CaseNavigationProps = {
  previous?: CaseNavigationItem;
  next?: CaseNavigationItem;
};

function NavigationCard({
  item,
  label,
  direction,
}: {
  item: CaseNavigationItem;
  label: string;
  direction: "previous" | "next";
}) {
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight;

  return (
    <Link
      className="standard-hover group flex min-h-[84px] items-center justify-between gap-4 rounded-lg border border-line bg-white p-4 shadow-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40"
      href={`/cases/${item.slug}`}
    >
      <div className={direction === "next" ? "order-1 text-right" : ""}>
        <span className="inline-flex items-center gap-1 text-xs font-black text-violet">
          {direction === "previous" ? <Icon className="text-ink" size={14} /> : null}
          {label}
          {direction === "next" ? <Icon className="text-ink" size={14} /> : null}
        </span>
        <p className="mt-2 text-sm font-semibold leading-5 text-muted transition group-hover:text-ink">{item.title}</p>
      </div>
      {item.thumbnailImage ? (
        <Image
          src={item.thumbnailImage}
          alt=""
          width={72}
          height={52}
          sizes="72px"
          className="h-[52px] w-[72px] rounded-md border border-line object-cover"
        />
      ) : null}
    </Link>
  );
}

export default function CaseNavigation({ previous, next }: CaseNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav aria-label="Navegacao entre cases" className="grid gap-4 border-t border-line pt-6 md:grid-cols-2">
      {previous ? <NavigationCard item={previous} label="Case anterior" direction="previous" /> : <span />}
      {next ? <NavigationCard item={next} label="Proximo case" direction="next" /> : <span />}
    </nav>
  );
}
