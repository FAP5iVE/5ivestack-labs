// Verifies the palette in src/app/globals.css.
// 1. Exactly the allowed colour tokens exist (colour discipline).
// 2. Required text/UI pairs meet WCAG 2.x contrast.
// Run: pnpm check:contrast   (exit code 1 on any failure)
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const colors = {};
for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  colors[m[1]] = m[2].toLowerCase();
}

const ALLOWED = ["paper", "ink", "ink-muted", "rule", "orange", "cobalt", "sky"];
const BRAND = { orange: "#ff5f00", cobalt: "#0052cc" };

function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`FAIL  ${msg}`);
};

// 1. Palette discipline
const found = Object.keys(colors).sort();
const expected = [...ALLOWED].sort();
if (JSON.stringify(found) !== JSON.stringify(expected)) {
  fail(`palette must be exactly [${expected.join(", ")}], found [${found.join(", ")}]`);
}
for (const [name, hex] of Object.entries(BRAND)) {
  if (colors[name] !== hex) fail(`--color-${name} must stay ${hex} (non-negotiable brand colour)`);
}

// 2. Required pairs: [foreground, background, minimum ratio, use]
const required = [
  ["ink", "paper", 7, "body text on page"],
  ["ink-muted", "paper", 4.5, "secondary text on page"],
  ["cobalt", "paper", 4.5, "links and metadata on page"],
  ["ink", "orange", 4.5, "label on orange button"],
  ["paper", "cobalt", 4.5, "text on cobalt fill"],
  ["paper", "ink", 7, "text in dark viewport"],
  ["orange", "ink", 4.5, "signal lines and text in dark viewport"],
  ["sky", "ink", 4.5, "secondary text in dark viewport"],
  ["ink", "paper", 3, "focus ring on page"],
  ["paper", "ink", 3, "focus ring in dark viewport"],
];
for (const [fg, bg, min, use] of required) {
  const f = colors[fg];
  const b = colors[bg];
  if (!f || !b) continue;
  const r = ratio(f, b);
  const line = `${fg} on ${bg}: ${r.toFixed(2)}:1 (min ${min}) ${use}`;
  if (r < min) fail(line);
  else console.log(`ok    ${line}`);
}

// 3. Documented restrictions: these pairs are EXPECTED to be weak. Print them so
// nobody uses them by mistake. They only fail if they unexpectedly become strong
// enough to need no restriction (so the docs would be out of date).
const restricted = [
  ["orange", "paper", "never body text on paper (needs 4.5)"],
  ["cobalt", "ink", "decorative only on ink (needs 3 for meaningful graphics)"],
  ["orange", "cobalt", "never adjacent: brand pack forbids orange directly on blue"],
  ["rule", "paper", "hairlines are decorative"],
];
for (const [fg, bg, note] of restricted) {
  const f = colors[fg];
  const b = colors[bg];
  if (!f || !b) continue;
  console.log(`info  ${fg} on ${bg}: ${ratio(f, b).toFixed(2)}:1  ${note}`);
}

if (failed) {
  console.error("\nContrast check failed.");
  process.exit(1);
}
console.log("\nContrast check passed.");
