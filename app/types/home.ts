import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";

export type StackIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type NavItem = string;

export type SkillItem = {
  label: string;
  icon: LucideIcon;
};

export type ExpertiseItem = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

export type CaseItem = {
  title: string;
  badge: string;
  badgeClass: string;
  image: string;
  description: string;
  stats: string[];
  tags: string[];
};

export type CompanyItem = {
  name: string;
  segment: string;
  context: string;
  description: string;
  logo: string;
};

export type TimelineItem = {
  year: string;
  role: string;
  description: string;
};

export type ProcessItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HighlightItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type StackItem = {
  name: string;
  icon: StackIcon;
};
