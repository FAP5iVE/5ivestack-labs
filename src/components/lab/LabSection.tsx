import { PlannerLauncher } from "./PlannerLauncher";

/*
  Lab (decision D-48): small working tools. Each runs in the browser only and sends
  nothing anywhere. The owner's own experiments (HANDOFF Q-05) join this list when
  they are supplied; the planner is the first of the demos built for the Lab.
*/
export function LabSection() {
  return (
    <section id="lab" aria-labelledby="lab-title" className="mt-24 border-t border-rule pt-16">
      <div className="grid-page gap-y-12">
        <div className="col-span-full">
          <h2 id="lab-title" className="font-display text-headline font-semibold">
            Lab
          </h2>
          <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
            Small working tools. Each one runs in your browser and sends nothing anywhere.
          </p>
        </div>

        <article
          aria-labelledby="lab-planner"
          className="col-span-full border-t border-rule pt-8 lg:grid lg:grid-cols-12 lg:gap-x-8"
        >
          <div className="lg:col-span-4">
            <h3 id="lab-planner" className="font-display text-title font-semibold">
              CCTV coverage planner
            </h3>
            <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
              Place cameras in a room and see what they can cover. Change each camera&rsquo;s
              direction, field of view and range, and watch the coverage change.
            </p>
            <p className="mt-4 max-w-[var(--measure)] text-small text-ink-muted">
              A simplified 2D estimate. It ignores lens quality, lighting, mounting height,
              furniture and people, so it is a way to think about placement, not a design or a
              quote.
            </p>
          </div>
          <div className="mt-8 lg:col-span-8 lg:mt-0">
            <PlannerLauncher />
          </div>
        </article>
      </div>
    </section>
  );
}
