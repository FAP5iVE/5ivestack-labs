# 5iveStack Labs website

Bespoke, scroll-driven, phone-first website for 5iveStack Labs (software, Android, embedded and IoT hardware, IT consultation, CCTV and security, networks).

**Status:** milestones M0 (foundation), M1 (scroll and shell) and M2 (hero) written, not yet build-verified. Read `docs/HANDOFF.md` first. It lists what is done, what is unverified, what is left and which questions are still open.

## Where to find things

| Need | File |
|---|---|
| Current status, remaining work, open questions, change log | `docs/HANDOFF.md` |
| Every decision with alternatives and reasons | `docs/DECISIONS.md` |
| Full build plan (milestones, architecture, page structure) | https://claude.ai/artifact/NDUbsn3XwpXhLgS4CvWpre |
| Design tokens (single source of truth) | `src/app/globals.css` |
| Draft privacy notice text and legal map | `docs/privacy-notice-draft.md` (the live page is `/privacy`) |
| Accessibility review | `docs/accessibility-review.md` |
| Brand pack notes and contrast numbers (copied from the logo package) | `docs/brand-pack-README.txt`, `docs/brand-pack-contrast.txt` |

## Licence warning

The Switzer font in `src/fonts/` is licensed under the ITF Free Font License. **Keep this repository private** and do not share the font files with outside contractors; they must download their own copy from Fontshare. Details: `docs/DECISIONS.md` D-33.

## Requirements

- Node 22 (`.nvmrc`); Next.js 16 needs Node 20.9 or newer
- pnpm 10 or newer

## Quick start

```bash
pnpm install        # creates pnpm-lock.yaml: commit it
pnpm dev            # http://localhost:3000
pnpm check          # contrast + banned patterns + lint + typecheck
pnpm build          # production build
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm check:contrast` | Verifies the palette in `globals.css` is exactly the allowed set and that required text/UI pairs meet WCAG contrast |
| `pnpm check:banned` | Scans `src/` for banned design patterns (gradients, shadows, cards, off-scale spacing, em dashes, emoji, bounce easing) |
| `pnpm lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `pnpm typecheck` | `tsc --noEmit` with strict settings |
| `pnpm check` | All four, in order. Run before every commit |

## Structure (M0 to M2)

```
src/app/        layout.tsx, page.tsx (home), tokens/page.tsx (developer-only proof sheet), globals.css (tokens), icons
src/components/hero/   StackViewport, StackSvg, StackScene, SystemsWalk (five-layer hero and Systems walk)
src/components/work/   WorkSection (selected work with real screenshots)
src/components/consult/   ConsultSection, ConsultForm (consultation form, switched off until activated)
src/components/lab/   LabSection, ToolLauncher, CoveragePlanner (CCTV coverage planner), SignalScope (sampling explorer)
src/app/api/consult/   route.ts (sends the request email)
src/app/privacy/   page.tsx (Privacy Notice)
src/components/shell/  Header, CommandPalette, ScrollEngine, Footer, SimpleModeToggle
src/lib/        tier.ts (rendering tier, Simple mode), scroll.ts (Lenis instance and lock), consult.ts and consult-config.ts (form validation and on/off switch)
src/content/    nav.ts, site.ts (contact and placeholder copy), layers.ts (the five layers), work.ts (projects), privacy.ts (facts the notice needs)
src/fonts/      Hubot Sans, Switzer and JetBrains Mono woff2 + licences (bundled by next/font/local)
public/brand/   selected logo SVGs and 192/512 icons (full pack is NOT in the repo)
public/work/    WebP screenshots for the Work section
scripts/        check-contrast.mjs, check-banned.mjs
docs/           HANDOFF.md, DECISIONS.md, brand pack notes
```

Further folders are created by the milestone that first needs them.

## Design rules in one paragraph

Light page (`paper`) with dark instrument viewports (`ink`) used only for live WebGL canvases. Colours are exactly: paper, ink, ink-muted, rule, orange `#FF5F00`, cobalt `#0052CC`, and the restricted sky. No cards, gradients, glows, shadows, bounce easing, emoji or em dashes. Spacing only from the 4/8/12/16/24/32/48/64/96/128 px scale. Phones are first-class: design at 360px, tap targets at least 44px, no hover-only interaction. Full reasoning is in `docs/DECISIONS.md`.

## Environment

The consultation form uses four variables, listed with explanations in `.env.example`: `CONSULT_ENABLED`, `RESEND_API_KEY`, `CONSULT_TO`, `CONSULT_FROM`. Put them in Vercel (Project Settings, Environment Variables) and in a local `.env.local`; never commit real values. The form stays hidden until they are set, the privacy notice is marked reviewed, and the site is redeployed. Steps: `docs/HANDOFF.md` section 5a. `SITE_INDEXABLE` (default false) is the switch that lets search engines index the site; see section 5b. `.env.local` is your own copy (never committed).

## Deployment

Vercel. Not configured yet (HANDOFF A-05).
