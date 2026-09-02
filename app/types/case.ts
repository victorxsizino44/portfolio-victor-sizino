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

export type CaseStudy = {
  slug: string;
  title: string;
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
