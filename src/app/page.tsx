import type { Metadata } from "next";
import { ConsultSection } from "@/components/consult/ConsultSection";
import { LaptopHero } from "@/components/hero/LaptopHero";
import { SystemsWalk } from "@/components/hero/SystemsWalk";
import { LabSection } from "@/components/lab/LabSection";
import { WorkSection } from "@/components/work/WorkSection";
import { site } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Structured data for search engines: facts only, all taken from src/content/site.ts.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/icon-512.png`,
  email: site.email,
  telephone: "+265991974388",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: site.email,
      telephone: "+265991974388",
      availableLanguage: "English",
    },
  ],
};

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="focus:outline-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
        }}
      />
      <LaptopHero />

      <SystemsWalk />
      <WorkSection />
      <LabSection />
      <ConsultSection />
    </main>
  );
}
