import { ToolLauncher } from "./ToolLauncher";

/*
  Lab (decisions D-48, D-50, D-54): small working tools, one for each of the five layers
  plus a code lab. Each runs in the browser only and sends nothing anywhere. They are listed
  from hardware (L1) up to software, matching the Systems section. The owner has no
  experiments of their own to add (answered 18 Nov 2026), so these tools are the Lab.
*/

type Lab = {
  id: string;
  /** Layer number and value word, or a plain label for the code lab. */
  level: number | null;
  value: string;
  title: string;
  about: string;
  note: string;
  tool: Parameters<typeof ToolLauncher>[0]["tool"];
  open: string;
  close: string;
};

const labs: readonly Lab[] = [
  {
    id: "scope",
    level: 1,
    value: "Precision",
    title: "Sensor sampling explorer",
    about:
      "See how an embedded device turns a smooth sensor signal into digital numbers. Change the signal, the sample rate and the resolution, and watch detail disappear or turn into false signals.",
    note: "A simplified, ideal model. It ignores real converter errors, sample-and-hold effects and anti-alias filters, so it explains the idea rather than predicting a real device.",
    tool: "scope",
    open: "Open the explorer",
    close: "Close the explorer",
  },
  {
    id: "link",
    level: 2,
    value: "Reliability",
    title: "Device link reliability",
    about:
      "A remote device reports over a radio link that drops messages. Choose how often messages are lost and how many retries the device makes, and see what arrives, what it costs in battery, and when a monitor wrongly decides the device is offline.",
    note: "A simplified model that treats every loss as independent. Real links lose messages in bursts, so it shows the trade-off rather than predicting a real network.",
    tool: "link",
    open: "Open the link tool",
    close: "Close the link tool",
  },
  {
    id: "planner",
    level: 3,
    value: "Security",
    title: "CCTV coverage planner",
    about:
      "Place cameras in a room and see what they can cover. Change each camera\u2019s direction, field of view and range, and watch the coverage change.",
    note: "A simplified 2D estimate. It ignores lens quality, lighting, mounting height, furniture and people, so it is a way to think about placement, not a design or a quote.",
    tool: "planner",
    open: "Open the planner",
    close: "Close the planner",
  },
  {
    id: "capacity",
    level: 4,
    value: "Scalability",
    title: "Server capacity planner",
    about:
      "See why a system that feels fast with a few users can fall over with many. Set the number of users, how busy each one is and what your servers can do, and watch response time collapse as you near the limit.",
    note: "A simplified queueing model. It ignores caching, databases, traffic bursts and slow requests, so it explains the shape of the problem rather than sizing a real system.",
    tool: "capacity",
    open: "Open the planner",
    close: "Close the planner",
  },
  {
    id: "readability",
    level: 5,
    value: "Usability",
    title: "Readability and touch-target check",
    about:
      "Test whether text stands out enough from its background and whether a button is big enough to hit with a thumb, against the WCAG 2.2 accessibility rules.",
    note: "Checks two rules only: colour contrast and target size. A real accessibility review covers much more.",
    tool: "readability",
    open: "Open the check",
    close: "Close the check",
  },
  {
    id: "code",
    level: null,
    value: "Software",
    title: "Code lab",
    about:
      "Run small JavaScript programs in your browser: smooth noisy sensor readings, check data with a CRC-8 checksum, and search a million items in a handful of steps. Edit the code and run it again.",
    note: "Your code runs in a background worker on your own device and stops after 2 seconds. Network calls are switched off, and nothing you type is sent or saved.",
    tool: "code",
    open: "Open the code lab",
    close: "Close the code lab",
  },
];

export function LabSection() {
  return (
    <section id="lab" aria-labelledby="lab-title" className="mt-24 border-t border-rule pt-16">
      <div className="grid-page gap-y-12">
        <div className="col-span-full">
          <h2 id="lab-title" className="font-display text-headline font-semibold">
            Lab
          </h2>
          <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
            Small working tools, one for each layer of the stack and a code lab. Each one runs in
            your browser and sends nothing anywhere.
          </p>
        </div>

        {labs.map((lab) => (
          <article
            key={lab.id}
            aria-labelledby={`lab-${lab.id}`}
            className="col-span-full border-t border-rule pt-8 lg:grid lg:grid-cols-12 lg:gap-x-8"
          >
            <div className="lg:col-span-4">
              <p className="text-small text-ink-muted">
                {lab.level ? (
                  <span className="font-mono tabular-nums">L{lab.level} </span>
                ) : null}
                {lab.value}
              </p>
              <h3 id={`lab-${lab.id}`} className="mt-2 font-display text-title font-semibold">
                {lab.title}
              </h3>
              <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">{lab.about}</p>
              <p className="mt-4 max-w-[var(--measure)] text-small text-ink-muted">{lab.note}</p>
            </div>
            <div className="mt-8 lg:col-span-8 lg:mt-0">
              <ToolLauncher tool={lab.tool} openLabel={lab.open} closeLabel={lab.close} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
