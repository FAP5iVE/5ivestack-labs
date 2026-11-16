import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { indexable } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
