// Scans src/ for patterns the 5iveStack design rules ban (docs/DECISIONS.md D-06).
// Heuristic, line based. Append `banned-ok: reason` in a comment on a line to
// allow a deliberate exception (for example a GLSL string containing "blur").
// Run: pnpm check:banned   (exit code 1 on any hit)
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = "src";
const EXT = new Set([".ts", ".tsx", ".css", ".mdx", ".md"]);
const ALLOWED_SPACING = new Set(["0", "1", "2", "3", "4", "6", "8", "12", "16", "24", "32", "px"]);
const SPACING_PROPS =
  "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y";

export const rules = [
  { id: "gradient", re: /\bbg-(gradient|linear|radial|conic)|\b(linear|radial|conic)-gradient\(/, why: "no gradients" },
  { id: "glow-shadow", re: /\b(shadow-|drop-shadow|inset-shadow|text-shadow)|box-shadow|backdrop-blur|\bblur-|filter:\s*blur/, why: "no shadows, glows or blur" },
  { id: "clip-text", re: /\bbg-clip-text\b/, why: "no gradient text" },
  { id: "chromatic", re: /\b(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|accent|caret|divide|placeholder)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/, why: "Tailwind chromatic scales are banned; use palette tokens" },
  { id: "big-radius", re: /\brounded-(md|lg|xl|2xl|3xl|full)\b/, why: "only rounded-control is allowed, on interactive controls" },
  { id: "card", re: /<Card(Header|Content|Footer|Title)?\b|\bCard(Header|Content)\b/, why: "no card wrappers" },
  { id: "bounce", re: /animate-(bounce|pulse|ping)|ease-(bounce|elastic)|\b(elastic|bounce|back)\.(out|in)/, why: "no bounce or elastic easing" },
  { id: "hover-scale", re: /(group-)?hover:scale-/, why: "no image or element scale on hover" },
  { id: "em-dash", re: /\u2014/, why: "no em dashes in copy" },
  { id: "emoji", re: /\p{Extended_Pictographic}/u, why: "no emoji" },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (EXT.has(path.extname(p))) yield p;
  }
}

export function scanLine(line) {
  if (line.includes("banned-ok")) return [];
  // Theme wipe lines such as `--shadow-*: initial;` are the enforcement, not a violation.
  if (/^\s*--[a-z-]+-\*:\s*initial/.test(line)) return [];
  const hits = [];
  for (const r of rules) if (r.re.test(line)) hits.push(`${r.id}: ${r.why}`);
  // Off-scale spacing heuristic: p-5, mt-7, gap-10 ...
  const spacing = new RegExp(`(?<![\\w-])-?(?:${SPACING_PROPS})-(\\d+(?:\\.\\d+)?)(?![\\d./\\w-])`, "g");
  for (const m of line.matchAll(spacing)) {
    if (!ALLOWED_SPACING.has(m[1])) hits.push(`spacing: ${m[0]} is off the scale (4,8,12,16,24,32,48,64,96,128px)`);
  }
  return hits;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("check-banned.mjs")) {
  let count = 0;
  for (const file of walk(ROOT)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const hit of scanLine(line)) {
          count += 1;
          console.error(`${file}:${i + 1}  ${hit}`);
        }
      });
  }
  if (count > 0) {
    console.error(`\n${count} banned pattern(s) found.`);
    process.exit(1);
  }
  console.log("Banned-pattern check passed.");
}
