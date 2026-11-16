/*
  Launch switch for search engines (decision D-44). Until SITE_INDEXABLE=true is set at BUILD time,
  every page says noindex, robots.txt disallows everything and the sitemap is empty, so placeholder
  copy and preview deployments are never indexed. Server files only.
*/
export const indexable = process.env.SITE_INDEXABLE === "true";
