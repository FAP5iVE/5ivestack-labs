import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { indexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/tokens"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
