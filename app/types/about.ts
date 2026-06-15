import type { LucideIcon } from "lucide-react";

export type AboutHeroBadge = {
  title: string;
  lines?: string[];
  icon: LucideIcon;
  position: string;
};

export type AboutDifferential = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type AboutMetric = {
  value: string;
  label: string;
};

export type AboutTimelineItem = {
  period: string;
  role: string;
  description: string;
};

export type AboutWorkStyle = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type AboutHighlight = {
  title: string;
  description?: string;
  icon: LucideIcon;
};

export type AboutCompany = {
  name: string;
  role: string;
  logo?: string;
};

export type AboutLearningGroup = {
  category: string;
  items: string[];
};
