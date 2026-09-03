import { cases } from "../data/cases";
import type { CaseGroup, CaseNavigationItem } from "../types/case";

const canonicalSlugOrder = [
  "case-portfolio-platform-agent-r",
  "case-carrefour-ecommerce",
  "case-agu",
  "case-via-varejo-ads",
  "case-ra-reviews",
  "case-portal-turismo-setur",
  "case-hirevue-ai-platform",
  "case-houzbuddy",
  "case-meliuz-browse-in-app",
] as const;

const homeFeaturedSlugs = ["case-hirevue-ai-platform", "case-agu", "case-ra-reviews"] as const;

export function getAllCases() {
  return canonicalSlugOrder.map((slug) => cases.find((item) => item.slug === slug)).filter((item) => item !== undefined);
}

export function getCaseBySlug(slug: string) {
  return cases.find((item) => item.slug === slug);
}

export function getAdjacentCases(slug: string): {
  previous?: CaseNavigationItem;
  next?: CaseNavigationItem;
} {
  const item = getCaseBySlug(slug);

  if (!item) {
    return {};
  }

  const groupedCases = getCasesByGroup(item.group);
  const currentIndex = groupedCases.findIndex((candidate) => candidate.slug === slug);

  if (currentIndex === -1) {
    return {};
  }

  const toNavigationItem = (index: number): CaseNavigationItem | undefined => {
    const item = groupedCases[index];

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

export function getCasesByGroup(group: CaseGroup) {
  return getAllCases().filter((item) => item.group === group);
}

export function getHomeFeaturedCases() {
  return homeFeaturedSlugs.map((slug) => getCaseBySlug(slug)).filter((item) => item !== undefined);
}

export function getCasesByCategory(category: string) {
  if (category === "Todos") {
    return getAllCases();
  }

  return getAllCases().filter((item) => item.filterCategory === category);
}
