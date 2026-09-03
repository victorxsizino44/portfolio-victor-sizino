export type CaseMetric = {
  label: string;
  value: string;
};

export type CaseProcessStep = {
  title: string;
  description: string;
};

export type CaseImpact = {
  title: string;
  description: string;
  value?: string;
};

export type CaseNavigationItem = {
  slug: string;
  title: string;
  thumbnailImage?: string;
};

export type CaseGroup = "engineering" | "product-case-study";

export type CaseEvidenceClass =
  | "primary-authorial-engineering"
  | "primary-professional-frontend-engineering"
  | "primary-professional-fullstack-contribution"
  | "secondary-frontend-engineering"
  | "secondary-frontend-product"
  | "secondary-frontend-data-integration"
  | "secondary-ai-product-engineering"
  | "supporting-historical-design-frontend"
  | "conceptual-product-study";

export type CaseStudy = {
  slug: string;
  title: string;
  group: CaseGroup;
  evidenceClass: CaseEvidenceClass;
  company: string;
  period?: string;
  location?: string;
  category: string;
  filterCategory: string;
  shortDescription: string;
  heroDescription: string;
  coverImage: string;
  coverAlt?: string;
  thumbnailImage?: string;
  tags: string[];
  highlights?: string[];
  heroMetrics?: CaseMetric[];
  duration: string;
  role: string;
  squad: string;
  projectType: string;
  context: string;
  problem: string;
  myRole: string;
  myRoleBullets: string[];
  process: CaseProcessStep[];
  impact: CaseImpact[];
  tools: string[];
  learnings: string;
  quote?: string;
  featured?: boolean;
};
