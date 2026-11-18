"use client";

/*
  Shared helpers for the Lab tools (decision D-54): a slider row that stacks on narrow
  phones (label and value above, full-width slider below) and sits in one line from md up,
  a number formatter, and a reader for the colour tokens in globals.css.
*/

export const nf = (n: number, digits = 0): string =>
  n.toLocaleString("en-GB", { maximumFractionDigits: digits });

export function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}

export function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  display,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  display: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 border-t border-rule py-2 md:grid-cols-[10rem_1fr_7rem]">
      <label htmlFor={id} className="text-body">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="col-span-2 row-start-2 h-11 w-full accent-ink md:col-span-1 md:col-start-2 md:row-start-1"
      />
      <output
        htmlFor={id}
        className="col-start-2 row-start-1 justify-self-end font-mono text-small tabular-nums md:col-start-3 md:justify-self-start"
      >
        {display}
      </output>
    </div>
  );
}
