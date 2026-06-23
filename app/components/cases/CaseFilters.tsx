import Link from "next/link";

type CaseFiltersProps = {
  categories: string[];
  activeCategory: string;
};

export default function CaseFilters({ categories, activeCategory }: CaseFiltersProps) {
  const items = ["Todos", ...categories];

  return (
    <nav aria-label="Filtrar cases" className="flex flex-wrap gap-2">
      {items.map((category) => {
        const isActive = category === activeCategory;
        const href = category === "Todos" ? "/cases" : `/cases?category=${encodeURIComponent(category)}`;

        return (
          <Link
            className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-bold leading-none outline-offset-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet/40 ${
              isActive
                ? "border-violet bg-violet text-white shadow-sm"
                : "border-line bg-white text-muted hover:border-violet/40 hover:text-ink"
            }`}
            href={href}
            key={category}
          >
            {category}
          </Link>
        );
      })}
    </nav>
  );
}
