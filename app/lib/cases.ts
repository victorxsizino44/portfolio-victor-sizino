import { cases } from "../data/cases";
import type { CaseNavigationItem } from "../types/case";

export function getAllCases() {
  return cases;
}

export function getCaseBySlug(slug: string) {
  return cases.find((item) => item.slug === slug);
}

export function getAdjacentCases(slug: string): {
  previous?: CaseNavigationItem;
  next?: CaseNavigationItem;
} {
  const currentIndex = cases.findIndex((item) => item.slug === slug);

  if (currentIndex === -1) {
    return {};
  }

  const toNavigationItem = (index: number): CaseNavigationItem | undefined => {
    const item = cases[index];

    if (!item) {
      return undefined;
    }

    return {
      slug: item.slug,
      title: item.title,
      thumbnailImage: item.coverImage,
    };
  };

  return {
    previous: toNavigationItem(currentIndex - 1),
    next: toNavigationItem(currentIndex + 1),
  };
}

export function getCaseCategories() {
  return Array.from(new Set(cases.map((item) => item.filterCategory)));
}

export function getCasesByCategory(category: string) {
  if (category === "Todos") {
    return getAllCases();
  }

  return cases.filter((item) => item.filterCategory === category);
}
