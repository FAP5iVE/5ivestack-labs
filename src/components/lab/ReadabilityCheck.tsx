"use client";

import { useState } from "react";
import { nf, Slider, token } from "./LabControls";

/*
  Readability and touch-target check (Lab, decision D-54, layer L5 Usability). Two checks
  that decide whether people can use an interface without effort, using the WCAG 2.2
  rules: colour contrast (success criteria 1.4.3 and 1.4.6) and the size of a tap target
  (2.5.8 minimum 24 by 24 CSS pixels at level AA, 2.5.5 enhanced 44 by 44 at level AAA).
  Colours start as the site's own text and page colours. Runs in the browser only; sends
  and stores nothing.
*/

function channel(hex: string, start: number): number {
  const v = parseInt(hex.slice(start, start + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// WCAG treats text as large from 24 px, or from about 18.66 px (14 pt) when bold.
export function isLarge(px: number, bold: boolean): boolean {
  return bold ? px >= 18.66 : px >= 24;
}

function Result({ label, pass, need }: { label: string; pass: boolean; need: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-4 border-t border-rule py-3">
      <dt className="text-body">
        {label} <span className="text-small text-ink-muted">({need})</span>
      </dt>
      <dd className="text-body font-medium">{pass ? "Pass" : "Fail"}</dd>
    </div>
  );
}

const colourRow = "grid grid-cols-[1fr_auto] items-center gap-x-4 border-t border-rule py-2 md:grid-cols-[10rem_1fr]";

export default function ReadabilityCheck() {
  const [text, setText] = useState(() => token("ink"));
  const [page, setPage] = useState(() => token("paper"));
  const [size, setSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [target, setTarget] = useState(32);

  const ratio = contrast(text, page);
  const large = isLarge(size, bold);
  const needAA = large ? 3 : 4.5;
  const needAAA = large ? 4.5 : 7;

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        Two things decide whether people can use a screen without strain: whether the text stands
        out from its background, and whether the buttons are big enough to hit with a thumb.
        Choose colours and sizes and see whether they meet the WCAG 2.2 accessibility rules.
      </p>

      <div className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-2">
        <div>
          <div
            aria-hidden
            className="p-4"
            style={{ background: page, color: text, border: `1px solid ${token("rule")}` }}
          >
            <p style={{ fontSize: `${size}px`, fontWeight: bold ? 700 : 400, lineHeight: 1.4 }}>
              The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span
                className="inline-flex items-center justify-center text-small"
                style={{ width: target, height: target, border: `2px solid ${text}` }}
              >
                Tap
              </span>
              <span className="text-small">{target} by {target} px</span>
            </div>
          </div>
        </div>

        <div>
          <div className="border-b border-rule">
            <div className={colourRow}>
              <label htmlFor="read-text" className="text-body">Text colour</label>
              <input id="read-text" type="color" value={text} onChange={(e) => setText(e.target.value)}
                className="h-11 w-16 cursor-pointer md:w-full" />
            </div>
            <div className={colourRow}>
              <label htmlFor="read-page" className="text-body">Background</label>
              <input id="read-page" type="color" value={page} onChange={(e) => setPage(e.target.value)}
                className="h-11 w-16 cursor-pointer md:w-full" />
            </div>
            <Slider id="read-size" label="Text size" min={12} max={32} step={1} value={size}
              onChange={setSize} display={`${size} px`} />
            <div className={colourRow}>
              <label htmlFor="read-bold" className="inline-flex min-h-11 items-center gap-3 text-body">
                <input id="read-bold" type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)}
                  className="h-6 w-6 accent-ink" />
                Bold text
              </label>
            </div>
            <Slider id="read-target" label="Button size" min={16} max={64} step={2} value={target}
              onChange={setTarget} display={`${target} px`} />
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 max-w-[var(--measure)] text-body font-medium">
        Contrast {nf(ratio, 1)} to 1. This text counts as {large ? "large" : "normal-size"} text, so
        level AA needs {needAA} to 1.
      </p>
      <dl className="mt-4 md:max-w-[40rem]">
        <Result label="Text contrast, level AA" pass={ratio >= needAA} need={`${needAA} to 1`} />
        <Result label="Text contrast, level AAA" pass={ratio >= needAAA} need={`${needAAA} to 1`} />
        <Result label="Button size, level AA" pass={target >= 24} need="24 by 24 px" />
        <div className="border-b border-rule">
          <Result label="Button size, level AAA" pass={target >= 44} need="44 by 44 px" />
        </div>
      </dl>
    </div>
  );
}
