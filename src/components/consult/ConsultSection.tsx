import { site } from "@/content/site";
import { consultEnabled } from "@/lib/consult-config";
import { ConsultForm } from "./ConsultForm";

/*
  "Start a consultation" (decision D-40). The form appears only when consultEnabled()
  is true; until then visitors see plain contact options, so nothing half-finished is
  ever shown. The page is built statically: redeploy after changing environment variables.
*/
export function ConsultSection() {
  const enabled = consultEnabled();
  return (
    <section
      id="consult"
      aria-labelledby="consult-title"
      className="mt-24 border-t border-rule pt-16"
    >
      <div className="grid-page gap-y-8">
        <div className="col-span-full lg:col-span-4">
          <h2 id="consult-title" className="font-display text-headline font-semibold">
            Start a consultation
          </h2>
          <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
            Tell us what you need. We reply by email, and we can follow up by phone or WhatsApp if
            you prefer.
          </p>
        </div>
        <div className="relative col-span-full lg:col-span-8">
          {enabled ? (
            <ConsultForm />
          ) : (
            <div className="border-t border-rule pt-8">
              <p className="max-w-[var(--measure)] text-body">
                Online requests open soon. Until then, contact us directly:
              </p>
              <ul className="mt-4 flex flex-col">
                <li>
                  <a
                    href={site.emailEnquiryHref}
                    className="inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={site.phoneHref}
                    className="inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
                  >
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={site.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
                  >
                    WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
