import { projects } from "@/content/work";
import { CoverFlow } from "./CoverFlow";

/*
  Selected work (decisions D-37 and D-53). Each project is a text column plus its real
  screenshots, shown by CoverFlow as a curved 3D ribbon (or, in Simple mode and for
  reduced motion, the plain swipeable strip). No cards: hairline rules only. Screenshots
  are content and keep a thin border so light pages stay visible on the light background.
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
              <CoverFlow name={project.name} images={project.images} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
