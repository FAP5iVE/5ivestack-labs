import { StackViewport } from "@/components/hero/StackViewport";
import { consultation, layers } from "@/content/layers";
import { site } from "@/content/site";

// Visual order matches the stack in the hero: L5 at the top, L1 at the bottom.
const stackTopDown = [...layers].sort((a, b) => b.level - a.level);

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="focus:outline-none">
      <section aria-labelledby="hero-title" className="py-12 md:py-16">
        <div className="grid-page items-center gap-y-12">
          <div className="col-span-full lg:col-span-5">
            <h1
              id="hero-title"
              className="font-display font-wide text-display font-bold"
            >
              We build every layer, from circuit board to app.
            </h1>
            <p className="mt-6 max-w-[var(--measure)] text-lead text-ink-muted">
              {site.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
              >
                Message us on WhatsApp
              </a>
              <a
                href={site.emailHref}
                className="inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
              >
                Email us
              </a>
            </div>
          </div>
          <div className="col-span-full lg:col-span-7">
            <StackViewport />
          </div>
        </div>
      </section>

      <section
        id="layers"
        aria-labelledby="layers-title"
        className="border-t border-rule py-16"
      >
        <div className="grid-page gap-y-8">
          <h2
            id="layers-title"
            className="col-span-full font-display text-headline font-semibold lg:col-span-4"
          >
            Five layers, one team
          </h2>
          <ol className="col-span-full lg:col-span-8">
            {stackTopDown.map((layer) => (
              <li
                key={layer.level}
                className="grid gap-x-6 gap-y-2 border-t border-rule py-6 md:grid-cols-[10rem_1fr]"
              >
                <p>
                  <span className="block font-mono text-small tabular-nums text-ink-muted">
                    L{layer.level}
                  </span>
                  <span className="block text-body font-medium">{layer.value}</span>
                </p>
                <div>
                  <h3 className="font-display text-title font-semibold">{layer.name}</h3>
                  <p className="mt-2 max-w-[var(--measure)] text-body text-ink-muted">
                    {layer.summary}
                  </p>
                </div>
              </li>
            ))}
            <li className="grid gap-x-6 gap-y-2 border-y border-rule py-6 md:grid-cols-[10rem_1fr]">
              <p className="text-body font-medium">{consultation.label}</p>
              <div>
                <h3 className="font-display text-title font-semibold">
                  {consultation.name}
                </h3>
                <p className="mt-2 max-w-[var(--measure)] text-body text-ink-muted">
                  {consultation.summary}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
