import type { Metadata } from "next";
import Image from "next/image";
import { readFileSync } from "node:fs";
import path from "node:path";

/*
  M0 token proof sheet, kept as a developer-only route at /tokens (moved from the
  home page in M2). It is not linked anywhere and is removed in M5.
  Colour hex values are read from globals.css so this page cannot drift.
*/

export const metadata: Metadata = {
  title: "Token proof | 5iveStack Labs",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "paper", role: "Page surface" },
  { name: "ink", role: "Text, and the dark viewport surface" },
  { name: "ink-muted", role: "Secondary text on paper" },
  { name: "rule", role: "1px hairlines, decorative only" },
  { name: "orange", role: "Actions, active marker, signal lines. Never text on paper" },
  { name: "cobalt", role: "Links and metadata on paper. Decorative on ink" },
  { name: "sky", role: "Restricted: text and lines on ink only" },
] as const;

const typeSteps = [
  { cls: "text-small", name: "small", range: "13 to 14px", sample: "Hardware to software, one team" },
  { cls: "text-body", name: "body", range: "16 to 18px", sample: "Hardware to software, one team" },
  { cls: "text-lead", name: "lead", range: "20 to 22.5px", sample: "Hardware to software, one team" },
  { cls: "text-title", name: "title", range: "25 to 28px", sample: "Hardware to software" },
  { cls: "text-headline", name: "headline", range: "31 to 35px", sample: "Hardware to software" },
  { cls: "font-display font-wide font-bold text-display", name: "display", range: "36 to 72px", sample: "Every layer" },
  { cls: "font-display font-wide font-bold text-hero", name: "hero", range: "48 to 120px", sample: "Every layer" },
] as const;

const spacing = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32] as const;

function readColorTokens(): Record<string, string> {
  const css = readFileSync(
    path.join(process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  const out: Record<string, string> = {};
  for (const match of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    const [, name, hex] = match;
    if (name && hex) out[name] = hex.toUpperCase();
  }
  return out;
}

export default function Page() {
  const tokens = readColorTokens();

  return (
    <main id="main" tabIndex={-1} className="py-12 focus:outline-none">
      <div className="grid-page">
        <header className="col-span-full pb-12">
          <Image
            src="/brand/5iveStack-Labs_horizontal_color.svg"
            alt="5iveStack Labs"
            width={584}
            height={109}
            priority
            className="h-auto w-48"
          />
          <h1 className="mt-12 font-display font-wide text-display font-bold">
            Token proof
          </h1>
          <p className="mt-4 max-w-[var(--measure)] text-lead text-ink-muted">
            This developer-only sheet shows every design token at phone and
            desktop widths. It is removed before launch.
          </p>
        </header>

        <section aria-labelledby="palette" className="col-span-full border-t border-rule pt-8">
          <h2 id="palette" className="font-display text-title font-semibold">
            Palette
          </h2>
          <ul className="mt-6">
            {palette.map(({ name, role }) => (
              <li
                key={name}
                className="grid grid-cols-[3rem_1fr] items-center gap-4 border-t border-rule py-4"
              >
                <span
                  aria-hidden
                  className="block h-12 w-12 border border-rule"
                  style={{ backgroundColor: `var(--color-${name})` }}
                />
                <span>
                  <span className="block text-body">{name}</span>
                  <span className="block font-mono text-small tabular-nums text-ink-muted">
                    {tokens[name] ?? "missing"}
                  </span>
                  <span className="block text-small text-ink-muted">{role}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="type" className="col-span-full mt-12 border-t border-rule pt-8">
          <h2 id="type" className="font-display text-title font-semibold">
            Type scale
          </h2>
          <ul className="mt-6">
            {typeSteps.map(({ cls, name, range, sample }) => (
              <li key={name} className="border-t border-rule py-6">
                <p className="font-mono text-small tabular-nums text-ink-muted">
                  {name} / {range}
                </p>
                <p className={`mt-2 ${cls}`}>{sample}</p>
              </li>
            ))}
            <li className="border-t border-rule py-6">
              <p className="font-mono text-small text-ink-muted">mono, data only</p>
              <p className="mt-2 font-mono text-body tabular-nums">
                X 412  Y 890  t 00:04:12
              </p>
            </li>
          </ul>
        </section>

        <section aria-labelledby="space" className="col-span-full mt-12 border-t border-rule pt-8">
          <h2 id="space" className="font-display text-title font-semibold">
            Spacing scale
          </h2>
          <ul className="mt-6">
            {spacing.map((n) => (
              <li
                key={n}
                className="grid grid-cols-[5rem_1fr] items-center gap-4 border-t border-rule py-3"
              >
                <span className="font-mono text-small tabular-nums text-ink-muted">
                  {n * 4}px
                </span>
                <span
                  aria-hidden
                  className="block h-2 bg-ink"
                  style={{ width: `${n / 4}rem` }}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="controls" className="col-span-full mt-12 border-t border-rule pt-8">
          <h2 id="controls" className="font-display text-title font-semibold">
            Controls
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <a
              href="#main"
              className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
            >
              Start a consultation
            </a>
            <a href="#main" className="text-body text-cobalt underline underline-offset-4">
              A link on paper
            </a>
          </div>
          <p className="mt-4 max-w-[var(--measure)] text-small text-ink-muted">
            Orange fills carry ink labels (6.2:1). The focus ring is ink. Tab
            through these two controls to check it.
          </p>
        </section>

        <section aria-labelledby="viewport" className="col-span-full mt-12 border-t border-rule pt-8">
          <h2 id="viewport" className="font-display text-title font-semibold">
            Dark viewport
          </h2>
          <div data-viewport className="mt-6 bg-ink p-6 text-paper">
            <p className="font-mono text-small tabular-nums text-sky">
              signal path / L1 to L5
            </p>
            <span aria-hidden className="mt-4 block h-0.5 w-full bg-orange" />
            <span aria-hidden className="mt-3 block h-0.5 w-2/3 bg-cobalt" />
            <p className="mt-6 text-body">
              Paper text on ink is 17.5:1. Sky text on ink is 7.4:1.
            </p>
            <p className="mt-2 text-small text-sky">
              Cobalt on ink is 2.8:1, so cobalt is decorative here and never
              carries meaning.
            </p>
            <Image
              src="/brand/5iveStack-Labs_horizontal_reverse.svg"
              alt="5iveStack Labs"
              width={680}
              height={205}
              className="mt-6 h-auto w-48"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
