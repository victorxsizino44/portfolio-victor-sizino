import type { MetadataRoute } from "next";
import { getAllCases } from "./lib/cases";

const siteUrl = "https://victor-sizino.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/experiencia", "/stack", "/cases", "/contato", "/vs-method/agents/agent-b"];
  const caseRoutes = getAllCases().map((item) => `/cases/${item.slug}`);

  return [...staticRoutes, ...caseRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
