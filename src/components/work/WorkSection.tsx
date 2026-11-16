import Image from "next/image";
import { projects } from "@/content/work";

/*
  Selected work (decision D-37). Each project is a text column plus a row of real
  screenshots. On phones the screenshots form a swipeable strip inside their own
  scroll box (so the page itself never scrolls sideways); from lg up they sit in
  a two-column grid. No cards: hairline rules only. Screenshots are content and
  keep a thin border so light pages stay visible on the light background.
*/
export function WorkSection() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="mt-24 border-t border-rule pt-16"
    >
      <div className="grid-page gap-y-12">
        <h2
          id="work-title"
          className="col-span-full font-display text-headline font-semibold"
        >
          Selected work
        </h2>

        {projects.map((project) => (
          <article
            key={project.slug}
            aria-labelledby={`work-${project.slug}`}
            className="col-span-full border-t border-rule pt-8 lg:grid lg:grid-cols-12 lg:gap-x-8"
          >
            <div className="lg:col-span-4">
              <h3
                id={`work-${project.slug}`}
                className="font-display text-title font-semibold"
              >
                {project.name}
              </h3>
              <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
                {project.summary}
              </p>
              <dl className="mt-6">
                <div className="grid grid-cols-[6rem_1fr] gap-4 border-t border-rule py-3">
                  <dt className="text-small text-ink-muted">Role</dt>
                  <dd className="text-body">{project.role}</dd>
                </div>
                {project.builtWith ? (
                  <div className="grid grid-cols-[6rem_1fr] gap-4 border-t border-rule py-3">
                    <dt className="text-small text-ink-muted">Built with</dt>
                    <dd className="text-body">{project.builtWith}</dd>
                  </div>
                ) : null}
              </dl>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4"
              >
                Visit the live site
                <span className="sr-only"> for {project.name} (opens in a new tab)</span>
              </a>
            </div>

            <div className="mt-8 lg:col-span-8 lg:mt-0">
              <ul
                tabIndex={0}
                aria-label={`${project.name} screenshots`}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0"
              >
                {project.images.map((image) => (
                  <li key={image.src} className="w-[85%] shrink-0 snap-start lg:w-auto">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 28rem, 85vw"
                      className="h-auto w-full border border-rule"
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-small text-ink-muted lg:hidden">
                Swipe to see more screens.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
