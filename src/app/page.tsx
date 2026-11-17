import type { Metadata } from "next";
import { ConsultSection } from "@/components/consult/ConsultSection";
import { StackViewport } from "@/components/hero/StackViewport";
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
      <section aria-labelledby="hero-title" className="py-12 md:py-16">
        <div className="grid-page items-center gap-y-12">
          <div className="col-span-full lg:col-span-5">
            <h1
              id="hero-title"
              className="font-display font-wide text-display font-bold"
            >
              From sensor to screen, we build every layer.
            </h1>
            <p className="mt-6 max-w-[var(--measure)] text-lead text-ink-muted">
              {site.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={site.emailEnquiryHref}
                className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
              >
                Email us
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>
          <div className="col-span-full lg:col-span-7">
            <StackViewport />
          </div>
        </div>
      </section>

      <SystemsWalk />
      <WorkSection />
      <LabSection />
      <ConsultSection />
    </main>
  );
}
