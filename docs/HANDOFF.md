# Handoff: where the project stands

Last updated: 15 Nov 2026, end of milestone M2 (hero). M0, M1 and M2 are all written but NOT build-verified.
Read this first, then `docs/DECISIONS.md`. Update this file at the end of every working session: status, remaining work, open questions, change log.

Plan: https://claude.ai/artifact/NDUbsn3XwpXhLgS4CvWpre

## 1. Project in one paragraph

A bespoke, scroll-driven, phone-first website for 5iveStack Labs. Audience: local SMEs, schools, enterprises and partners. The owner leans toward software development and embedded hardware, so those layers get the most detail. The hero is a five-layer exploded stack from hardware to software, labelled with the five brand values. English only, hosted on Vercel. Brand colours `#FF5F00` (orange) and `#0052CC` (cobalt) are non-negotiable.

## 2. Verification status (be honest about this)

| Item | State |
|---|---|
| `scripts/check-contrast.mjs` | Run and passing. Numbers match the brand pack's own figures |
| `scripts/check-banned.mjs` | Run, passes on the repo; self-tested on a deliberately bad file |
| `pnpm install` | **NOT run** (M1 added `gsap`, `lenis`, `cmdk`; M2 added `three`, `@react-three/fiber`, `@types/three`). The build environment cannot install packages. No `pnpm-lock.yaml` exists yet |
| `pnpm build`, `pnpm lint`, `pnpm typecheck` | **NOT run.** All TypeScript, CSS, GLSL and config in M0 to M2 is hand-written against the official `create-next-app` 16.4.6 template and is untested |
| Visual check on phone and desktop | **NOT done** |

So M0 and M1 are "code complete, unverified". The first person to run it must follow section 3 and record the results in the change log.

## 3. First-run checklist (do this before starting M3)

1. `pnpm install`, then commit `pnpm-lock.yaml`.
2. `pnpm check`. Fix anything that fails. Typical suspects are listed below.
3. `pnpm dev`, open `http://localhost:3000` on desktop and on a real phone (same Wi-Fi, use the machine's LAN address).
4. Verify the Tailwind and font assumptions that I could not test:
   - [ ] **Palette wipe works:** temporarily add `bg-red-500` to an element. It must produce no background. Remove it after.
   - [ ] **Our tokens generate utilities:** `bg-paper`, `text-ink`, `text-ink-muted`, `bg-orange`, `text-cobalt`, `border-rule`, `rounded-control`, `text-hero`, `text-body`, `font-display`, `font-text`, `font-mono` all take effect on the proof page.
   - [ ] **Font weight utilities survived the `--font-*` wipe:** `font-medium`, `font-semibold`, `font-bold` change weight. (I expect Tailwind to keep `--font-weight-*`, unverified. If they do not work, define `--font-weight-medium: 500;` and so on in `@theme`.)
   - [ ] **`text-*` line-height and letter-spacing sub-tokens apply** (for example the hero has -0.03em tracking and 1.0 line height).
   - [ ] **`@utility grid-page` with nested media queries** gives 4 columns on phone, 8 at 48rem, 12 at 64rem.
   - [ ] **`@theme static` still wipes defaults and emits our tokens** (D-16): in browser devtools, `:root` should list `--color-paper`, `--color-orange`, `--text-hero` and so on, and should NOT list any Tailwind default colours.
   - [ ] **Switzer is the body font:** in devtools, a paragraph's rendered font is Switzer (Network tab shows `Switzer-Variable` loading, and the Fonts pane in Elements lists it). It was supplied by the owner on 15 Nov 2026 (D-33).
   - [ ] **Hubot Sans width axis works:** the `font-wide` class visibly widens the display text (`font-stretch: 112%`).
   - [ ] **Orange focus behaviour:** Tab through the two controls; the ring is ink, 2px.
   - [ ] **Dark viewport:** logo (reverse) sits cleanly on the ink panel; focus ring there is paper.
   - [ ] **Favicon:** browser tab shows the icon; dark mode shows the sky variant (adaptive `icon.svg`).

### M1 checks (after the M0 checks pass)
Use a desktop browser with a mouse for the first group and a real phone for the second.

Desktop:
- [ ] Wheel scrolling feels smoothed (Lenis). In devtools, `<html>` has class `lenis` and `data-tier="2"` (or `"1"` on a small window).
- [ ] The orange bar under the header grows as you scroll and reaches full width at the bottom.
- [ ] Header nav links (visible from 1024px wide) scroll to the right section and the heading is NOT hidden under the sticky header. **If it lands too high or too low, flip the sign of `offset` in `ScrollEngine.tsx`** (`-headerHeight` is my reading of the Lenis docs, not tested).
- [ ] `Ctrl+K` (or Cmd+K) opens the palette, the search box is focused, arrow keys move the highlight, Enter goes to the section, Escape closes, and focus returns to the Menu button.
- [ ] With the palette open, mouse-wheel does NOT scroll the page behind it. After closing, smooth scrolling works again.
- [ ] Console shows no cmdk or Radix warnings. If you see a "DialogContent requires a DialogTitle" warning, apply the fix in D-20.
- [ ] Tab from the top of the page: first stop is "Skip to content"; Enter moves to the main content.
- [ ] Footer "Simple mode" toggles to On: `html` loses class `lenis`, `data-tier="0"`, `data-simple="true"`; the progress bar still works; reload keeps the setting. Toggle it off to restore.
- [ ] DevTools rendering panel: emulate `prefers-reduced-motion: reduce`, reload. `data-tier` is `0` and there is no Lenis.

Phone (real device on the same Wi-Fi):
- [ ] Scrolling is native (no Lenis: `<html>` has no `lenis` class). The progress bar moves.
- [ ] The header shows the logo and a Menu button, no overflow at 360px width. Tap targets feel comfortable.
- [ ] Menu opens a full-screen sheet; typing in the search box does NOT zoom the page (iOS); Close works; selecting a section scrolls to it below the header; the page behind does not scroll while the sheet is open.
- [ ] The address bar showing and hiding while scrolling does not cause jumps in the progress bar or layout.
- [ ] Footer Simple mode button works by tap.

### M2 checks (hero; after the M0 and M1 checks pass)
Test on a desktop browser first, then the owner's Samsung S20 Ultra, then the width sweep below. The owner's requirement is that the site displays seamlessly on ANY phone size.

Desktop:
- [ ] Home page loads with the headline, description, orange WhatsApp button and the dark viewport. `/tokens` still shows the proof sheet.
- [ ] The viewport shows the SVG stack first, then the WebGL stack replaces it. **Open the browser console: there must be NO shader compile errors.** If there is one, the error log prints the GLSL line; fix `FRAG` in `src/components/hero/StackScene.tsx`.
- [ ] Five slabs are fully visible (none clipped) at rest and after scrolling down a screen (they separate further). Patterns are visible on every slab: traces (L1), chips (L2), lattice (L3), code lines with a blinking orange cursor (L4), interface wireframe (L5).
- [ ] Orange packets travel up the bar at the front corner. The load animation plays once (layers rise apart, patterns sweep in).
- [ ] Moving the mouse tilts the stack slightly (Tier 2 only).
- [ ] `html[data-tier]` is `2` on a capable desktop. Switching Simple mode on shows the static SVG only, no canvas element, and no `three` chunk loads after that point.
- [ ] Scroll the hero off screen: the GPU activity stops (`frameloop` is never). Scroll back: it resumes.
- [ ] DevTools Performance monitor: frame rate stays near 60. Throttle CPU 6x: after about 10 seconds the tier steps down (`data-tier` changes) and the scene re-mounts without errors.
- [ ] The headline ("We build every layer, from circuit board to app.") wraps sensibly at 1280px. It uses the expanded width axis, so check it is not too wide for its column; if it is, drop `font-wide` from the h1 in `src/app/page.tsx`.
- [ ] The SVG-to-WebGL crossfade does not look jarring. If it does, tell me and we will align the two drawings or remove the fade.

Phone, width sweep (browser device emulation, then real devices). Check each of 320, 360, 375, 390, 412 (S20 Ultra is about 412 wide), 430, 768 (tablet) and landscape:
- [ ] No horizontal scrolling anywhere. Headline, buttons, viewport and the layers list all fit.
- [ ] The WhatsApp button and Email link are at least 44px tall and easy to tap.
- [ ] The viewport stays in proportion (16 by 15) and all five layers are visible without cropping.
- [ ] Dragging a finger up and down over the viewport scrolls the page (the canvas must not trap vertical scrolling).
- [ ] On the S20 Ultra: the scene loads, runs smoothly, and `html[data-tier]` is `1`. If it stutters, note whether it stepped down to the SVG by itself.
- [ ] Turn on a phone's battery saver or Data Saver and reload: the site should show the SVG (Save-Data or reduced motion).
- [ ] In the layers list, every row reads cleanly at 320px (the value label above the layer name).

5. If `next build` complains about `LayoutProps` or similar type helpers, note it: the template uses generated types that appear after the first `next dev` or `next build`. Run `pnpm dev` once, then `pnpm typecheck`.
6. Record results under "Change log" below.

## 4. What exists now (M0 to M2)

| Path | What it is |
|---|---|
| `package.json` | Pinned core versions (see D-01), scripts |
| `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.nvmrc` | Config (see D-01, D-14) |
| `src/app/globals.css` | **All design tokens**: palette, radius, easing, type scale, grid, safe-area, base layer. Tailwind defaults for colour, shadow, blur, radius, animation, easing and text size are wiped |
| `src/app/layout.tsx` | Root layout: Hubot Sans, Switzer and JetBrains Mono via `next/font/local`, viewport (`viewportFit: cover`), `noindex` metadata (D-32), skip link, `ScrollEngine`, `Header`, `Footer` |
| `src/app/page.tsx` | **Home page**: hero (headline, placeholder description, WhatsApp and email actions, dark viewport) and the five-layer text list (D-26) |
| `src/app/tokens/page.tsx` | Developer-only token proof sheet at `/tokens` (noindex, unlinked, removed in M5) |
| `src/app/favicon.ico`, `icon.svg`, `apple-icon.png` | Favicon set from the brand pack |
| `src/fonts/` | Hubot Sans and JetBrains Mono woff2 (Latin subset, OFL) and Switzer variable woff2 (FFL, unmodified), each with its licence file. **Keep the repository private** (D-33) |
| `public/brand/` | Horizontal colour and reverse lockups, colour and reverse icons, 192 and 512 icons |
| `scripts/check-contrast.mjs` | Palette discipline plus WCAG contrast pairs |
| `scripts/check-banned.mjs` | Banned-pattern scanner |
| `src/lib/tier.ts` | Rendering tier (0, 1, 2) and Simple mode state; `useTierState()`, `setSimpleMode()`, `stepDownTier()`, `reportWebglLost()` (D-18) |
| `src/lib/scroll.ts` | Holds the single Lenis instance; `lockScroll()` pauses it (D-17) |
| `src/content/nav.ts` | Navigation items. Only sections that exist. Planned: Systems, Work, Lab, Consult |
| `src/content/site.ts` | Company name, contact details (owner supplied), PLACEHOLDER description (D-30, D-31) |
| `src/content/layers.ts` | The five layers: values, names, summaries (PLACEHOLDER), shader mode and seed (D-25) |
| `src/components/hero/StackViewport.tsx` | Dark viewport: SVG, then lazily loaded WebGL scene, with error boundary, visibility pausing (D-28) |
| `src/components/hero/StackSvg.tsx` | Static SVG five-layer stack (Tier 0 and loading placeholder) |
| `src/components/hero/StackScene.tsx` | R3F scene: procedural slabs, GLSL patterns, signal bus, FPS guard (D-27) |
| `docs/privacy-notice-draft.md` | Draft privacy notice, form notice and owner compliance map. **Needs legal review** (Q-08) |
| `src/components/shell/ScrollEngine.tsx` | Renders nothing. Writes `--page-progress`; starts GSAP ScrollTrigger and (fine-pointer, Tier 1+) Lenis, lazily |
| `src/components/shell/Header.tsx` | Sticky header, logo, links from `lg`, orange progress bar |
| `src/components/shell/CommandPalette.tsx` | Menu button and cmdk palette (full-screen on phone) |
| `src/components/shell/SimpleModeToggle.tsx`, `Footer.tsx` | Simple mode control and minimal footer |
| `docs/` | This file, `DECISIONS.md`, brand pack README and contrast notes |

## 5. Remaining work

### Actions needed (A-xx)
- **A-01 Switzer font: DONE** (15 Nov 2026). The owner supplied the Fontshare download; `Switzer-Variable.woff2` is bundled through `next/font/local` (D-33). Remember the licence limits: private repository, no modifying or subsetting the file, and outside contractors must download their own copy from Fontshare.
- **A-02 Run the first-run checklist** (section 3).
- **A-03 GSAP licensing: resolved in substance** (D-22). Skim gsap.com/standard-license once.
- **A-04 Verify the Tailwind spacing-scale enforcement option** (D-09), or keep the scanner as the control.
- **A-05 Create the Vercel project** (Git integration, Node 22). Production domain: see Q-09.
- **A-07 Keep the Git repository PRIVATE** and do not publish the font files (D-33). Anyone outside the company who needs to work on the code must download Switzer from Fontshare themselves and add it to `src/fonts/`.
- **A-08 Privacy notice:** owner to complete the items in `docs/privacy-notice-draft.md` Part A3, then have a Malawian lawyer review it. Build `/privacy` and the form notice in M4.
- **A-06 Version control:** the project is not yet in a Git repository. Initialise, make a first commit after A-02 passes, and add a CI step running `pnpm check`.

### Milestones (details in the plan)
| Milestone | Scope | New dependencies | Exit |
|---|---|---|---|
| M0 foundation | Tokens, fonts, logo, checks | none | **Written, unverified** |
| M1 scroll and shell | Lenis plus GSAP lifecycle, header, skip link, command palette with visible phone Menu button, Simple mode toggle, rendering-tier detection | `gsap`, `lenis`, `cmdk` (`@gsap/react` moved to M2, D-02) | **Written, unverified.** Anchors, keyboard, focus, reduced motion all work on a real phone (M1 checks above) |
| M2 hero | **Written, unverified** (D-25 to D-32). Single canvas in the hero viewport (not Drei `View`, D-26), five procedural layers, trace shader (orange signal, sky and paper lines, no bloom), load sequence, SVG Tier 0, step-down, context-loss handling | `three`, `@react-three/fiber`, `@react-three/drei`, `@gsap/react` (+ `@types/three`) | Smooth on a mid-range Android, or the visitor lands on Tier 0 unharmed. Removes the M0 proof page |
| M3 sections | Systems walk (CSS sticky plus ScrollTrigger progress), Work drawers, Lab, Principles, then two added Lab demos | `@react-three/rapier` (Lab only, lazy) | All content real; every drawer works by touch |
| M4 consultation | Step-by-step configurator, route handler, email, spam checks | `zod`, email provider SDK (default pick Resend: confirm limits and domain verification first) | A phone-submitted test request arrives in the inbox |
| M5 hardening | Profiling, bundle analysis, image and font audit, accessibility review, SEO, Vercel deploy, real-device pass | `r3f-perf` (dev) | Budgets met on the throttled mobile profile |

Definition of done for every milestone: works at 360px; keyboard works; reduced motion works; Lighthouse mobile passes the budgets; `pnpm check` is clean; one real-phone test recorded in the change log.

### Budgets (proposals, tune after bundle analysis)
LCP under 2.5s, INP under 200ms, CLS under 0.1 on a throttled mobile profile. First-load JavaScript around 170 KB gzipped excluding the lazy 3D chunk. Images AVIF or WebP via `next/image` with explicit sizes.

## 6. Questions (Q-xx)

Status: **Answered** (decision recorded), **Partly** (some information received), **Open** (still needed).

| ID | Question | Status | Notes and default |
|---|---|---|---|
| Q-01 | Is the `sky` colour (`#6FA0FF`) approved as a third colour, restricted to text and lines on dark viewports? | **Answered 15 Nov 2026: yes** | Recorded in `globals.css` and D-05 |
| Q-02 | Value-to-layer mapping | **Answered 15 Nov 2026: confirmed** | Owner asked to replace the buzzwords "Innovation" and "Creativity". Replaced with Scalability (L4) and Usability (L5), see D-25 and Q-11 |
| Q-03 | Destination email, phone and WhatsApp | **Answered 15 Nov 2026** | fivestacklabs@gmail.com, +265 991 974 388 (phone and WhatsApp). Live in `src/content/site.ts`, the hero, footer and command palette (D-30). The M4 form will send to the same email |
| Q-04 | Flagship projects (name, one line, owner's role, stack, real outcomes, 3 to 6 images, permission) | **Partly** | Candidates confirmed: SMS Malawi and the Saviour Digital Solutions site. Still need per project: one-line description, owner's role, stack, one or two real outcomes, 3 to 6 images, written permission to show. The owner has real images. More projects "will come later" |
| Q-05 | Details of the 2 to 3 Lab experiments | **Open** (owner will send later) | Default: Lab ships with the two added demos only |
| Q-06 | Company text: description, one line per service, social links | **Partly** | Owner approved a PLACEHOLDER description (written, D-31). Still open: real text, and social links (none supplied) |
| Q-07 | Analytics | **Open, default none** | None in v1. Adding any requires a privacy notice change first |
| Q-08 | Privacy wording for the consultation form | **Partly** | Draft written from the primary text of the Malawi Data Protection Act 2024: `docs/privacy-notice-draft.md`. Needs the owner's facts (legal entity, address, retention periods, MACRA contact) and review by a Malawian lawyer. See A-08 |
| Q-09 | Production domain and DNS access | **Open** | Owner will provide a Vercel URL soon. Default: Vercel preview URL |
| Q-10 | Test devices | **Answered 15 Nov 2026** | Samsung S20 Ultra (about 412px wide). Owner's priority: seamless on any phone size, because customers have different phones. Covered by the M2 width-sweep checklist (320 to 430, tablet, landscape) |
| Q-11 | Confirm the new L4 and L5 words: **Scalability** and **Usability** (my picks, D-25) | **Open** | Proceeding with these. One-line change in `src/content/layers.ts` |
| Q-12 | Hero headline "We build every layer, from circuit board to app." and the primary call to action (WhatsApp button) | **Open** | PLACEHOLDER. Owner to approve or reword |
| Q-13 | Legal entity name, registration details and address | **Open** | Needed for the privacy notice (Part B section 1) |
| Q-14 | Real device test results from the first-run checklists (M0, M1, M2) | **Open** | Blocks calling any milestone "done" |

Answered earlier: audience (local SMEs, schools, enterprises, partners), theme (light page with dark viewports), English only, Vercel hosting, owner can run npm and pnpm locally, logo and icon files supplied (the pack also has SVG variants without a background, usable if the reverse horizontal's own background is a problem), Switzer font supplied.

## 7. Known risks and gotchas
- **Unverified build** (section 2).
- **Switzer licence limits** (D-33): the repository must stay private, the font file must not be modified or subsetted, and outside contractors must download their own copy from Fontshare.
- **Orange contrast:** orange on paper is 2.82:1. Never use it for text there. Do not make focus rings orange.
- **Cobalt on ink is 2.78:1:** decorative only inside viewports.
- **Buzzword drift:** the owner asked for the generic words "Innovation" and "Creativity" to be replaced (now Scalability and Usability, D-25). Value labels stay small, each backed by one proof line from real work. Headlines say what the company builds.
- **No fabricated content:** no invented numbers, logos or testimonials. Placeholders must be visibly marked.
- **Logo rules** are in D-12. The reverse horizontal SVG carries its own background.
- **Unverified M1 assumptions:** Lenis anchor offset sign; cmdk dialog title warning; the 4-core Tier 2 threshold; `ScrollTrigger.config({ ignoreMobileResize: true })` is confirmed to exist in GSAP 3.15.1 source but its effect on real phones is untested.
- **Hydration flicker:** the tier and Simple mode state arrive after mount (server renders Tier 0), so the Simple mode button may flip from Off to On a moment after load. Expected, harmless.
- **Latin-only font subset:** no arrows or non-Latin characters in copy.
- **M2 is the least-tested code in the repo:** the GLSL shader, orthographic camera fit, scroll-linked animation and FPS step-down were never run. Expect fixes after the first real run (shader compile errors, framing, colour). The static SVG and error boundary mean a failure should degrade to the SVG, but verify that too.
- **iOS Safari WebGL quirks** are expected; the scene has a context-lost fallback to the SVG. No iPhone has been tested yet.
- **Placeholder copy** is live in the hero and layers list (D-31). Do not launch with it.
- **Privacy notice is a draft** and the form (M4) must not go live without the reviewed notice and the checkbox (Part C of the draft).
- **The plan's reference copy** mentions `create-next-app` and installing everything in M0. That is superseded by D-02.

## 8. Working agreements
- One feature, one document, one design at a time. Do not run parallel agents or parallel edits on the same area.
- Prefer editing existing files over adding new ones. A new file needs a reason, noted in the milestone.
- No package is added without a line in `docs/DECISIONS.md` or the milestone table explaining why.
- Update `docs/HANDOFF.md` and `docs/DECISIONS.md` in the same commit as the work.
- Before any new data is collected anywhere on the site, update the privacy notice first.

## 9. Change log

| Date | Who | What |
|---|---|---|
| 15 Nov 2026 | Claude | M0 written: config, tokens, fonts, logo and favicon set, token proof page, two check scripts, docs. Contrast and banned-pattern scripts run and pass. Package install, build, lint, typecheck and visual checks not possible in the build environment and still outstanding (A-02). |
| 15 Nov 2026 | Claude | M1 written: tier detection and Simple mode, Lenis plus GSAP ScrollTrigger lifecycle (lazy, fine-pointer only), page progress bar, sticky header, skip link, cmdk command palette (full-screen on phone), minimal footer, Lenis CSS, `scroll-padding-top`. Dependencies added: gsap 3.15.1, lenis 1.3.27, cmdk 1.1.1 (versions verified against the npm registry and their READMEs and type files). GSAP licence resolved (D-22). Contrast and banned-pattern scripts pass. Install, build, lint, typecheck and all browser checks still outstanding. |
| 15 Nov 2026 | Claude | M2 (hero) written: home page, hero copy (placeholder), static SVG stack, lazily loaded procedural WebGL stack with five GLSL patterns, signal bus, scroll and pointer choreography, FPS step-down, error and context-loss fallbacks, five-layer text list, owner contact details in hero, footer and palette. Proof sheet moved to `/tokens`. Deps added: `three` 0.187.0, `@react-three/fiber` 9.8.2, `@types/three`. Owner answered Q-01, Q-02, Q-03, Q-10, partly Q-04 and Q-06. Layer labels L4 and L5 changed to Scalability and Usability (D-25). Dates in earlier entries corrected (several said 16 Nov by mistake). Nothing in M2 has been run. |
| 15 Nov 2026 | Claude | Switzer supplied by the owner and bundled through `next/font/local` (D-33); interim `@font-face` removed. Licence read: private repository required, no subsetting. Privacy notice draft written from the primary text of the Malawi Data Protection Act 2024 (D-34). |
