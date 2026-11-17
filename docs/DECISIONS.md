# Decision log

Format: ID, decision, alternatives rejected, reason, status. Dates are 2026. Add new entries at the bottom; never rewrite history, mark a decision "Superseded by D-xx" instead.

Source of the original plan: https://claude.ai/artifact/NDUbsn3XwpXhLgS4CvWpre (referred to below as "the plan").

---

## D-01 Core stack (15 Nov, M0)
**Decision:** Next.js 16.4.6 (App Router), React 19.3.1, TypeScript 5.9 strict, Tailwind CSS 4.3.5, ESLint 9, pnpm.
**Rejected:** TypeScript 7.0.2 (latest on npm at the time): it is a different compiler generation and Next's type-check integration with it is unverified. ESLint 10: `eslint-config-next` supports it on paper but the plugin ecosystem is unverified. Astro and Vite SPA (see the plan, section 6 and Phase 2 debate).
**Reason:** Versions were read from the npm registry on 15 Nov 2026. The config files (`tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `next.config.ts`, `.gitignore`) follow the official `create-next-app` 16.4.6 template, with these deviations: stricter `tsconfig.json` (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, `allowJs: false`, `@/*` mapped to `./src/*`), `poweredByHeader: false` in `next.config.ts`, a Node-globals block for `scripts/` in the ESLint config, and decisions D-02 and D-14. `@types/node` is pinned to 22 to match `.nvmrc`.
**Status:** Decided. Unverified by a real build (HANDOFF A-02).

## D-02 Dependencies are added per milestone, not up front (15 Nov)
**Decision:** M0 installs only what M0 uses. `gsap`, `lenis`, `cmdk` arrive in M1 (`@gsap/react` is deferred until a component needs `useGSAP`; neither M1 nor M2 does, see D-29); `three` and `@react-three/fiber` in M2 (`@react-three/drei` only if M3 needs it, D-29); `zod` plus the email provider SDK in M4; `@react-three/rapier` in M3 (Lab); `r3f-perf` in M5 dev-only.
**Rejected:** The plan's section 15 command that installs everything in M0.
**Reason:** Unused dependencies cost install time, audit noise and bundle risk, and every dependency must be justified by the feature that needs it.
**Status:** Decided. Supersedes plan section 15 install line.

## D-03 The brand pack is the source of truth for colour (15 Nov)
**Decision:** Tokens use the values in the supplied logo package v2.1: ink `#0B1020`, paper `#F4F6FA`, orange `#FF5F00`, cobalt `#0052CC`, sky `#6FA0FF`.
**Supersedes:** The plan's proposed `#16181B` ink, `#F4F5F6` paper and `#101214` scope. The separate `scope` token is removed: dark viewports use `ink`.
**Reason:** The owner's logo pack already fixes these values and the logo contrast notes (`docs/brand-pack-contrast.txt`) were computed against them. Matching them keeps logo, page and viewport visually consistent.
**Status:** Decided.

## D-04 Light page, dark viewports (carried from the plan; owner confirmed)
**Decision:** Page surface is `paper`; `ink` surfaces appear only in live WebGL or code viewports.
**Rejected:** All-dark theme, light/dark toggle.
**Reason:** Orange and cobalt need opposite surfaces for text. Orange on paper is 2.82:1 (fails text), cobalt on ink is 2.78:1 (fails text). Light page lets cobalt carry text (6.3:1); dark viewports let orange carry signal (6.2:1). Dark everywhere would also match a known "near-black plus one vivid accent" default look.
**Status:** Decided. A toggle is a possible M5 stretch only.

## D-05 Contrast rules (15 Nov)
**Decision, enforced by `scripts/check-contrast.mjs`:**
- Orange is never text on paper. Orange fills carry ink labels (6.21:1).
- Cobalt is text on paper only. On ink, cobalt is decorative: 2.78:1 fails the 3:1 needed for meaningful graphics. This corrects the plan, which had cobalt "structure lines" carrying meaning in viewports. Meaningful lines and text in viewports use `sky` or `paper`.
- Focus ring is `ink` on paper and `paper` inside `[data-viewport]` (orange fails 3:1 on paper).
- Never place orange directly on cobalt (2.24:1, forbidden by the brand pack).
**Status:** Decided.

## D-06 Banned patterns are enforced mechanically (15 Nov)
**Decision:** The Tailwind theme wipes colour, shadow, blur, radius, animation, easing and text-size defaults (`--color-*: initial` and friends) so banned classes cannot compile. `scripts/check-banned.mjs` additionally scans `src/` for gradients, shadows and blur, chromatic Tailwind scales, large radii, card components, bounce or elastic easing, hover scale, em dashes, emoji, and off-scale spacing. A line can opt out with a `banned-ok: reason` comment.
**Reason:** Rules written in prose drift. The scanner was self-tested on a deliberately bad file and passes on the clean repo.
**Limits:** Tailwind gradient utilities (`bg-linear-*`) cannot be removed by theme config, so the scanner is the control there. The scanner is line-based and heuristic.
**Status:** Decided.

## D-07 Typography (15 Nov)
**Decision:** Display Hubot Sans (variable, weight 200 to 900, width 75% to 125%), text Switzer, data-only mono JetBrains Mono (variable, weight 100 to 800).
**Rejected:** Geist (the `create-next-app` default, reads as a starter template), Clash Grotesk with Satoshi (the trendy pairing), Bricolage Grotesque (too playful for security and enterprise buyers).
**Verified:** Hubot Sans and JetBrains Mono are SIL OFL 1.1 (Fontsource package metadata and the licence files shipped in `src/fonts/`). This closes the plan's "verify Hubot Sans licence" risk. Axis ranges come from the Fontsource CSS.
**Provenance:** woff2 files are the Latin subset from `@fontsource-variable/hubot-sans@5.3.0` and `@fontsource-variable/jetbrains-mono@5.3.0`, fetched as npm tarballs (not installed). The Latin subset covers Basic Latin, Latin-1 and general punctuation, which is enough for English-only copy. It excludes arrows (U+2192), so do not use `→` in copy.
**Mono rule:** JetBrains Mono is for real data only (coordinates, part numbers, timestamps, code), never a decorative shortcut.
**Status:** All three families decided and bundled (Switzer: D-33).

## D-08 Type scale (15 Nov)
**Decision:** Fluid between 360px and 1440px viewports. Text steps use a 1.25 ratio: small 13 to 14px, body 16 to 18px, lead 20 to 22.5px, title 25 to 28px, headline 31 to 35px. Display steps: display 36 to 72px, hero 48 to 120px. Letter spacing -0.02em (display) and -0.03em (hero). Body line height 1.55, headings 1.0 to 1.2.
**Implementation:** `--text-*` tokens in `globals.css`; utilities `text-small`, `text-body`, `text-lead`, `text-title`, `text-headline`, `text-display`, `text-hero`. The `clamp()` values were computed by linear interpolation, not guessed.
**Status:** Decided. Tune after seeing it on real devices.

## D-09 Spacing and grid (15 Nov)
**Decision:** Allowed spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px (Tailwind multipliers 1, 2, 3, 4, 6, 8, 12, 16, 24, 32). Grid is 4 columns on phones, 8 on tablets (48rem), 12 on desktop (64rem); gutters 16, 24, 32 px; max content width 80rem.
**Enforcement caveat:** I did not find a verified way to remove Tailwind's other numeric spacing utilities, so the scale is enforced by `check-banned.mjs`, not by the compiler. If a verified Tailwind option exists, adopt it and note it here.
**Status:** Decided.

## D-10 Phone-first foundations (15 Nov)
**Decision:** `viewportFit: "cover"` with `--safe-*` inset tokens; `100svh` not `100vh`; tap targets at least 44px (`min-h-11`); no hover-only interaction; reduced-motion rule in the base layer; design at 360px first. The rendering-tier system (SVG, light WebGL, full WebGL) is specified in the plan section 5 and built in M1 and M2.
**Status:** Foundations in M0; the rest scheduled.

## D-11 Switzer is wired with plain @font-face, not next/font/local (15 Nov)
**Decision:** `globals.css` declares `@font-face` for `Switzer` pointing at `/fonts/Switzer-Variable.woff2` in `public/`. Until the file exists the system sans stack is used.
**Rejected:** `next/font/local` for Switzer now.
**Reason:** Fontshare was not reachable from the build sandbox, so the file could not be fetched. `next/font/local` fails the build when its file is missing; a plain `@font-face` just falls back. Once the file is added, migrate it to `next/font/local` in `src/fonts/` for preloading and automatic fallback metrics (HANDOFF A-01).
**Status:** Superseded by D-33 (Switzer is now bundled with `next/font/local`).

## D-12 Logo and icon handling (15 Nov)
**Decision:** Copy only the assets the site needs into the repo: horizontal colour and reverse lockups, colour and reverse icons, 192 and 512 px icons. The favicon set uses the Next.js file conventions: `src/app/favicon.ico`, `src/app/icon.svg` (the adaptive `favicon.svg`), `src/app/apple-icon.png`. The full pack (PSD, EPS, PDF, PNG, about 47 MB) stays outside the repo.
**Brand pack rules to obey** (from its README): clear space is 3 units (the stem width) on all sides; horizontal lockup at least 160px wide, below that use the icon or the one-line lockup; icon at least 16px (use the favicon files under 32px); never recolour, rotate, stretch, add shadows or put the icon in a badge.
**Note:** `5iveStack-Labs_horizontal_reverse.svg` includes its own ink background rectangle and padding. Use it only on `ink` surfaces.
**Pack version:** "Logo Package v2.1, Routed Five, orange primary", dated 14 Nov 2026.
**Status:** Decided.

## D-13 Ink and paper differ slightly from the brand pack's "white" numbers (15 Nov)
**Note:** The pack's contrast figures were computed on white. The site surface is `paper` `#F4F6FA`, so the real numbers are slightly lower (for example cobalt 6.30:1 on paper vs 6.82:1 on white; orange 2.82:1 on paper vs 3.05:1 on white). `check-contrast.mjs` uses paper.
**Status:** Informational.

## D-14 Tooling choices (15 Nov)
**Decision:** No `packageManager` field (do not force a pnpm version on the team); `.nvmrc` pins Node 22; `engines.node >= 20.9.0` matches Next 16. `next lint` is not used: the lint script is `eslint`, as in the official template. `typecheck` is a separate script.
**Status:** Decided.

## D-15 M0 page reads colours from globals.css (15 Nov)
**Decision:** The proof page parses `--color-*` from `src/app/globals.css` at build time so displayed hex values cannot drift from the real tokens.
**Trade-off:** It reads a source file from a server component. Acceptable for a throwaway page that is removed in M2.
**Status:** Decided.

## D-16 Theme tokens are `@theme static` (15 Nov)
**Decision:** The main `@theme` block is `static`, so every token is always emitted as a CSS variable. Font tokens stay `@theme inline` because they reference `next/font` variables, so fonts are applied through utilities (`font-text`, `font-display`, `font-mono`) on elements, not through `var(--font-*)` in plain CSS.
**Reason:** Tailwind v4 normally emits only the variables it sees used; `static` guarantees JS (later the WebGL code) and plain CSS can read tokens. Behaviour of `static` combined with the `--*: initial` wipes was not tested (HANDOFF section 3).
**Status:** Decided, unverified.

## D-17 Lenis only on fine-pointer devices at Tier 1+, loaded lazily (15 Nov, M1)
**Decision:** Lenis smooths mouse-wheel scrolling only. It is created only when the tier is 1 or higher AND the device has a fine pointer with hover. Phones, tablets and Simple mode use native scrolling and never download Lenis. GSAP, ScrollTrigger and Lenis are loaded with dynamic `import()` after hydration. Lenis runs with `autoRaf: false`, driven by `gsap.ticker`, with `lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker.lagSmoothing(0)` (the integration shown in the Lenis README). `syncTouch` is false.
**Rejected:** Lenis on all devices (the plan said touch scroll stays native, so Lenis would add JS for no effect on phones); `lenis/react` wrapper (less control over lifecycle); static imports (adds first-load JS).
**Details:** Lenis honours `prefers-reduced-motion` itself, and our tier logic also disables it. The Lenis CSS rules are copied into `globals.css` from `lenis@1.3.27 dist/lenis.css`; re-copy them when upgrading Lenis. Anchor links use `anchors: { offset: -headerHeight }`, measured once at start; native scrolling uses `scroll-padding-top` on `html`.
**Status:** Decided, unverified in a browser (HANDOFF section 3).

## D-18 Tier detection and Simple mode (15 Nov, M1)
**Decision:** `src/lib/tier.ts` computes a tier and exposes it with `useTierState()`.
- Tier 0 if Simple mode is on, reduced motion is requested, Save-Data is on, WebGL is unavailable, or WebGL context was reported lost.
- Tier 2 if a fine pointer with hover, a viewport of 64rem or wider, and at least 4 logical cores.
- Otherwise Tier 1.
- `stepDownTier()` lowers the ceiling by one for the session (called by the M2 performance monitor). `reportWebglLost()` forces Tier 0. Turning Simple mode off clears the ceiling.
- Simple mode persists in `localStorage` under `5ive:simple-mode`, with every storage call in try/catch, and syncs across tabs.
- The server render and first client render both report Tier 0 so HTML and hydration match; the real tier arrives right after mount. `html[data-tier]` and `html[data-simple]` mirror the state for CSS and debugging.
- The WebGL probe creates one context and releases it immediately, because browsers cap open contexts.
**Caveats:** Core count is a rough hint. Save-Data and `connection` are not available in every browser. The 4-core threshold is a guess to tune on real devices (HANDOFF Q-10).
**Status:** Decided.

## D-19 Orange page-progress bar (15 Nov, M1)
**Decision:** A 2px orange bar on the header's bottom edge shows scroll progress. It is scaled with `transform: scaleX(var(--page-progress))`. The variable is written by `ScrollEngine`, not by React state, so scrolling causes no re-render. Tier 0 uses a plain passive scroll listener (no GSAP downloaded); Tier 1+ uses ScrollTrigger.
**Reason:** It is the "active scroll indicator" use of orange the brand rules allow, and it exercises the real ScrollTrigger-to-CSS-variable pattern that M2 and M3 will use.
**Status:** Decided.

## D-20 Command palette (15 Nov, M1)
**Decision:** `cmdk` dialog opened by a visible Menu button on every screen size, and by Ctrl+K or Cmd+K. Phone: full-screen sheet with safe-area padding and a visible Close button. md and up: centred 36rem dialog. Header links are shown from `lg` upward only. Items use ink-on-paper, and ink background with paper text when selected; muted text is never used inside items because muted-on-ink fails contrast. The input text is body size (16px or more) so iOS does not zoom. While open, Lenis is paused through `lockScroll()` and the list carries `data-lenis-prevent`.
**Rejected:** Keyboard-only trigger (excludes touch users); a custom combobox (cmdk is small, headless and accessible); showing the macOS command symbol (not in the Latin font subset).
**Known risk:** cmdk's Radix dialog may log a dev-only warning about a missing dialog title. Fix if it appears: add `@radix-ui/react-dialog` as a direct dependency and render a visually hidden `Dialog.Title`.
**Status:** Decided.

## D-21 Navigation items are temporary (15 Nov, M1)
**Decision:** `src/content/nav.ts` points at the M0 proof-sheet sections so anchors can be tested now. The final information architecture is Systems `#systems`, Work `#work`, Lab `#lab`, Consult `#consult`. Replace in M2 and M3.
**Status:** Temporary.

## D-22 GSAP licence resolved (15 Nov, M1)
**Finding:** GSAP 3.15.1 ships under the "Standard no charge license". Webflow's announcement says the whole toolset, including formerly paid plugins such as SplitText, is free and that the standard licence now covers commercial use. This closes HANDOFF A-03 in substance. Someone should still skim the licence text at gsap.com/standard-license once for restrictions that apply to the company's use.
**Status:** Resolved, with the one follow-up above.

## D-23 Minimal footer holds the Simple mode toggle (15 Nov, M1)
**Decision:** A small footer (company name and the Simple mode toggle with a one-line explanation) ships in M1 so the toggle is visible on every page and device. Contact details and links join it in M3 and M4.
**Status:** Decided.

## D-24 Skip link and landmarks (15 Nov, M1)
**Decision:** A skip link is the first focusable element and moves focus to `<main id="main" tabIndex={-1}>`. `main` suppresses its focus outline because it is a container, not a control. Every page must keep one `main` with that id.
**Status:** Decided.

## D-25 Layer value labels: L4 Scalability, L5 Usability (15 Nov, M2)
**Decision:** The owner confirmed the value-to-layer mapping and asked for the buzzwords "Innovation" and "Creativity" to be swapped for something concrete. L4 (custom software and backend) is labelled **Scalability** and L5 (Android and interfaces) **Usability**. L1 Precision, L2 Reliability and L3 Security are unchanged.
**Reason:** Both new words are testable engineering qualities rather than self-praise, and each can be backed by a proof line from real work. They live only in `src/content/layers.ts`, so changing them is a one-line edit.
**Status:** My pick, awaiting the owner's confirmation of the exact words (HANDOFF Q-11). Proceed with these meanwhile.

## D-26 Home page structure and the proof sheet (15 Nov, M2)
**Decision:** `/` is now the real home page: hero (headline, placeholder description, contact actions, dark viewport) followed by the five layers as readable text. In M2 this was a plain list ordered as the stack appears (L5 at the top); in M3a the list became the Systems walk (D-36), which carries the same text and reads in order L1 to L5. The M0 proof sheet moved to `/tokens` (noindex, not linked, removed in M5).
**Deviation from the plan:** The plan called for one shared canvas via Drei `View` for the hero and the Systems walk. M2 uses a single plain `Canvas` inside the hero viewport. Revisit in M3: the Systems walk can either reuse the same sticky viewport or adopt `View`.
**Status:** Decided.

## D-27 WebGL scene design (15 Nov, M2)
**Decision:** `StackScene.tsx` is fully procedural: no model files, textures or postprocessing, and no glow.
- Orthographic camera at about 24 degrees elevation and 45 degrees azimuth (position 12.95, 8, 12.95), matching the SVG's rhombus proportions (half height about 0.4 of half width). Zoom is recomputed from the container size so all five layers fit even at full scroll separation.
- Each layer is an ink slab with paper edges and a plane carrying a custom GLSL pattern: traces (L1), chips and pins (L2), network lattice (L3), code lines with a blinking cursor (L4), interface wireframe (L5). Sky draws structure, orange draws signal. Colours are read from the CSS tokens at runtime.
- An orange signal bus with three travelling packets stands at the front corner and links the layers. It spans exactly L1 to L5 (it first overshot the bottom layer, seen in the owner's screenshot and fixed).
- Load animation: layers rise apart and their patterns sweep in (GSAP, 1.8s, power3.out). Scroll: layers separate by up to 25% more across the first screen (ScrollTrigger progress written into a ref). Tier 2: gentle tilt following the pointer. Tier 1: slow self-drift, no pointer handlers, so vertical page scrolling is never trapped (`touch-action: pan-y`).
- Anti-aliasing only on Tier 2; pixel ratio capped at 2 (Tier 2) and 1.5 (Tier 1).
- Per-frame code mutates refs and uniforms only; nothing calls `setState` in the frame loop.
- Shader detail: every `fwidth`-based stroke is evaluated outside divergent branches, and `#include <colorspace_fragment>` converts the output colours to sRGB.
**Status:** Decided. **Never run.** GLSL compile errors, camera fit and look are unverified (HANDOFF section 3).

## D-28 Fallbacks and failure handling (15 Nov, M2)
**Decision:** The static SVG (`StackSvg.tsx`) is always rendered underneath. It is the entire visual on Tier 0 and the placeholder while the scene loads, and fades out (300ms) once the canvas reports ready. WebGL is only mounted on Tier 1 or 2, after hydration, through `next/dynamic` with `ssr: false`. Rendering pauses (`frameloop="never"`) while the viewport is off screen. A React error boundary and a `webglcontextlost` listener both call `reportWebglLost()`, which drops the visitor to Tier 0 for the session. `FpsGuard` measures frame rate in 2-second windows, ignores the first three windows (shader compilation and the load animation), ignores stalls over 0.5s, and calls `stepDownTier()` after two consecutive windows under 35 fps. It never steps back up.
**Caveat:** The SVG and the 3D scene are different drawings, so the crossfade may look slightly jumpy. Judge on a real device (HANDOFF section 3).
**Status:** Decided.

## D-29 M2 dependencies (15 Nov)
**Decision:** Added `three` 0.187.0 and `@react-three/fiber` 9.8.2 (runtime) and `@types/three` 0.187.0 (dev). NOT added: `@react-three/drei` (the plain-three scene and our own FPS guard replace what M2 would have used it for; `Edges`, `View` and `PerformanceMonitor` are not needed yet) and `@gsap/react` (GSAP is used imperatively with explicit cleanup). Both remain candidates for M3.
**Reason:** Smaller bundle and fewer moving parts. Versions were read from the npm registry on 15 Nov 2026 and the fiber peer range (React 19 below 19.4) matches React 19.3.1.
**Status:** Decided.

## D-30 Contact actions and the call to action (15 Nov, M2)
**Decision:** Owner-supplied contact details live in `src/content/site.ts`: fivestacklabs@gmail.com, +265 991 974 388 (phone and WhatsApp). The hero's primary call to action is an orange "Message us on WhatsApp" button (`https://wa.me/265991974388`) with an "Email us" link beside it. The footer lists email, phone and WhatsApp, and the command palette has a Contact group (WhatsApp, Call, Email). The M4 consultation form will become the primary action and the WhatsApp button will move beside it.
**Note:** Opening WhatsApp or a mailto link sends nothing through this website, so these links collect no personal data on the site itself.
**Status:** Decided.

## D-31 Placeholder copy (15 Nov, M2)
**Decision:** The owner approved placeholder copy to be changed later. Placeholders: the headline "We build every layer, from circuit board to app.", `site.description`, and the five layer summaries. Each is marked PLACEHOLDER in the code and must be replaced with real proof lines (HANDOFF Q-04, Q-06). Rule unchanged: no invented numbers, logos or testimonials.
**Status:** Interim.

## D-32 Site stays noindex until launch (15 Nov, M2)
**Decision:** `layout.tsx` keeps `robots: noindex, nofollow` so placeholder copy and preview deployments are not indexed. Remove it in M5 at launch.
**Status:** Decided.

## D-33 Switzer bundled with next/font/local, and what its licence requires (15 Nov 2026)
**Decision:** The owner downloaded Switzer from Fontshare and supplied `Switzer_Complete.zip`. `Switzer-Variable.woff2` (weight 100 to 900, upright only) is in `src/fonts/` with `Switzer-FFL.txt` and is loaded through `next/font/local` in `layout.tsx`, preloaded, with `adjustFontFallback: "Arial"`. The interim `@font-face` in `globals.css` and the empty `public/fonts/` folder were removed. No italic is bundled; add `Switzer-VariableItalic.woff2` only if italics are needed.
**Licence read (ITF Free Font License v2.0, dated 17 Aug 2026, `src/fonts/Switzer-FFL.txt`):** commercial use is allowed, and self-hosting on the company's own websites with `@font-face` is allowed. It forbids modifying the font files (the licence names WOFF2 modification, so the file must NOT be subsetted or converted), providing the font files to external designers, agencies or contractors, and making them available to third parties. Consequences:
- Keep the Git repository private; never publish the font files (HANDOFF A-07).
- Anyone outside the company who works on the code must download Switzer from Fontshare themselves.
- `next/font/local` serves the file unmodified, which stays within the licence. I have not subsetted it (unlike Hubot Sans and JetBrains Mono, which are OFL and were taken as Latin subsets from Fontsource).
**Rejected:** subsetting Switzer to save bytes; putting the file in `public/` (it would be exposed at a guessable URL, and `next/font` already optimises delivery).
**Status:** Decided. Supersedes D-11.

## D-34 Privacy notice approach (15 Nov 2026)
**Decision:** The owner asked for professional privacy wording with citations to the governing law. `docs/privacy-notice-draft.md` was written from the primary text of the Data Protection Act, 2024 of Malawi (Act No. 3 of 2024), which I read in full on 15 Nov 2026, and cites its sections: lawful bases (8), consent (14), information at collection (15(1)(a) to (h)), children (17), data subject rights (19 to 25), security (13, 35), breach notification (36, 37), cross-border transfers (38, 39), registration (41), complaints (44), penalties (45) and civil remedies (47). It is also written to the GDPR and UK GDPR standard (article numbers cited from general knowledge, not re-checked).
- Three parts: owner compliance map (not published), the notice for `/privacy`, and a short notice plus required unticked checkbox for the consultation form.
- Placeholders in [brackets] mark facts only the owner has (legal entity, address, retention periods, MACRA contact).
- Section 53 gave non-significant controllers a 24-month exemption from commencement; with commencement reported as 3 June 2024, that exemption appears to have ended around 3 June 2026, so the Act should be treated as applicable now. Confirm the Gazette commencement date.
- It is a draft, not legal advice. A Malawian lawyer must review it before publication.
**Status:** Draft. Build `/privacy` and the form notice in M4.

## D-35 First verification: owner's desktop screenshots (15 Nov 2026)
**Record:** The owner ran M2 locally and sent three desktop screenshots (about 1820px wide, development mode). They show the home page rendering, the five-layer WebGL scene with all patterns (so the shader compiled), the orange progress bar, the footer with contact links and the Simple mode button, and the new fonts. One defect was visible (signal bar overshooting the bottom layer) and was fixed. Nothing was shown about phones, the console, the command palette, Simple mode switching or tier behaviour. Full list: HANDOFF section 2.
**Phone addendum (S20 Ultra, Chrome, live site, 15 Nov 2026):** five phone screenshots show the home page, the WebGL stack on Tier 1, the progress bar, the full-screen Menu sheet and the Systems walk (sticky viewport, lifted active layer, orange step marker) all working. See HANDOFF section 2 for the list and what is still untested.
**Status:** Partial verification. Other phone widths and an iPhone remain.

## D-36 Systems walk (15 Nov 2026, M3a)
**Decision:** The "Five layers, one team" list became the Systems walk (`SystemsWalk.tsx`), anchored at `#systems` (header and palette link updated).
- A dark viewport stays visible with CSS `position: sticky`, not ScrollTrigger pinning, so phones keep native scrolling and avoid address-bar resize problems (plan section 5). On phones it sits under the header at 38% of the screen height; on desktop it sits beside the text.
- An `IntersectionObserver` with a 1%-tall band 60% of the way down the screen decides the active step; React state changes only when the active step changes. The viewport receives `focus` (layer level 1 to 5, or 0 for none). In WebGL the focused layer lifts by 0.28 units while others dim (shader alpha down to 30%, edges down to 25%); in the SVG fallback the focused layer lifts 14 units and the others fade to 30%. The orange marker beside the active step is the "active indicator" use of orange.
- Reuses `StackViewport` and `StackScene` (new `mode="walk"`: layers stay fully separated, no scroll scrubbing, no pointer tilt). There are at most two WebGL contexts on the page, and each scene is mounted only when its viewport first comes within 100px of the screen, so the Systems scene costs nothing until needed.
- Layers now carry a `services` list taken from the owner's company scope (real service names, not placeholder copy).
**Not done:** a rendering-tier-aware reduction of the walk on very low-end phones beyond what Tier 0/1 already do. If the second canvas hurts performance on the S20 Ultra, the fix is to reuse a single canvas.
**Status:** Decided. Unverified.

## D-37 Work section (15 Nov 2026, M3b)
**Decision:** `WorkSection.tsx` shows two projects, SMS Malawi and Saviour Digital Solutions, from the owner's own description and screenshots (`Resources.zip`). Each project is a text column (name, summary, role, "Built with" only where the owner said what it was, live link) plus four screenshots. On phones the screenshots form a swipeable strip inside its own scroll box (85% wide so the next image peeks in, scroll snapping, keyboard-focusable, with a "Swipe to see more screens." hint), so the page never scrolls sideways; from `lg` up they sit in a two-column grid. No cards: hairline rules only; screenshots keep a thin border so light pages stay visible.
- **Images:** 8 screenshots converted to WebP at 1400px wide, quality 78 (29 to 84 KB each, about 400 KB total), stored in `public/work/` and delivered through `next/image` (lazy, responsive `sizes`). Descriptive alt text was written for each from what is visible.
- **Facts only:** no outcome numbers or client results because none were supplied. The SMS Malawi stack was not given, so it is omitted.
- **Not done:** drawers or modal galleries (the plan's idea). With two projects and short text, inline rows are simpler and faster on phones. Revisit when there are more projects or long case studies.
- **Privacy and permission:** the owner said they have permission to show these projects. The SMS screenshots show a real school's name and a photo of its building. The sign-in and application screens show empty fields only. HANDOFF Q-04 asks for a written OK from the client.
**Status:** Decided. Unverified on devices.

## D-38 Hero headline and primary action (15 Nov 2026)
**Decision:** The owner asked for a catchier headline in the same direction and for email to be the primary action. The headline is now **"From sensor to screen, we build every layer."** It keeps the hardware-to-software message, opens with a rhythm (sensor, screen), and matches the five-layer stack. The orange primary button is **"Email us"**, opening `mailto:fivestacklabs@gmail.com` with a prefilled subject ("Enquiry from the 5iveStack Labs website"); "Message us on WhatsApp" is the secondary text link. The M4 consultation form will become the primary action.
**Alternatives offered to the owner:** "Circuit board to cloud, built by one team."; "Hardware to app. One team."; "We build the whole stack, down to the silicon."; the previous "We build every layer, from circuit board to app."
**Status:** Still a PLACEHOLDER until the owner approves (HANDOFF Q-12).

## D-39 Live URL and metadataBase (15 Nov 2026)
**Decision:** The owner deployed the site to Vercel at https://5ivestack-labs.vercel.app. `site.url` holds it and `layout.tsx` sets `metadataBase` from it so future Open Graph and canonical URLs resolve. The site stays `noindex` (D-32) until launch. Replace `site.url` when a custom domain is attached.
**Status:** Decided.

## D-40 Consultation form (15 Nov 2026, M4)
**Decision:** A three-step form in the "Start a consultation" section (`#consult`): (1) what you need (six services, multiple choice), (2) about you (organisation type, name, email, optional phone), (3) your message, the short privacy notice and a required, unticked consent checkbox. One question group per screen suits phones. Controls are at least 44px, text is 16px or larger (no iOS zoom), errors are stated in words ("Problem: ..."), and focus moves to each step's heading. The steps are a real sequence, so "Step 1 of 3" is used. The success screen repeats the visitor's email and offers email and WhatsApp as a fallback. The hero's primary button stays "Email us" (D-38); the form is the structured alternative.
**Rejected:** a single long form (poor on phones); a CAPTCHA (friction, third-party tracking); sending the visitor a confirmation email (more data and a spam-relay risk).
**Status:** Decided. Unverified on devices.

## D-41 Sending, spam defence and the on/off switch (15 Nov 2026, M4)
**Decision:** `POST /api/consult` sends one plain-text email through the Resend REST API (`POST https://api.resend.com/emails`, Bearer key, JSON body; `from`, `to`, `subject`, `text`, `reply_to`). I verified the endpoint and fields against Resend's documentation on 15 Nov 2026. No SDK is installed (no new dependency). The email carries a consent timestamp and the privacy notice date, and Reply-To is the visitor's address. Nothing is stored in a database, and the visitor's details are never logged (only the provider's status code on failure).
- **Defences:** same-origin check, hidden honeypot field (silently accepted, nothing sent), three-second time trap, authoritative server-side validation (`src/lib/consult.ts`, tested with Node: dedupes services, strips control characters and line breaks, rejects bad email, phone and message, requires consent), and a light in-memory rate limit of 5 requests per IP per hour (per serverless instance, so it only blunts casual abuse; add a shared store if spam appears).
- **Switch:** `consultEnabled()` is true only when `CONSULT_ENABLED=true`, `RESEND_API_KEY` is set AND `privacy.reviewed` is true. Until then the section shows plain contact links and the API returns 503. This enforces the rule that the form must not go live without a reviewed notice. The home page is built statically, so redeploy after changing the environment.
- **Provider facts to remember:** the test sender `onboarding@resend.dev` only delivers to the email the Resend account was created with (so create it with fivestacklabs@gmail.com, or verify a domain); the free plan was reported as 3,000 emails per month with a 100 per day cap (secondary source; confirm).
**Rejected:** the Resend SDK (an extra dependency for one call), SMTP through Gmail (app passwords, fragile), storing requests in a database (more personal data to protect).
**Status:** Decided. Unverified end to end.

## D-42 Privacy Notice page (15 Nov 2026, M4)
**Decision:** `/privacy` renders the notice from `docs/privacy-notice-draft.md` Part B, with the Malawi Data Protection Act, 2024 section references checked against the Act's published text. Unknown facts live in `src/content/privacy.ts`; each shows as "[... to be confirmed]" and a DRAFT banner lists them until none remain and `reviewed` is true. The Resend email provider is now named. The page is `noindex` like the rest of the site and linked from the footer and from the form. The form's short notice reads its entity name and retention wording from the same facts, so the two cannot disagree.
**Status:** Draft until reviewed by a Malawian lawyer (HANDOFF Q-08, A-08). Superseded by D-43: reviewed on 15 Nov 2026 per the owner.

## D-43 Privacy facts supplied and review recorded (16 Nov 2026)
**Decision:** The owner said a Malawian lawyer reviewed `/privacy` on the night of 15 Nov 2026 and asked for `reviewed: true`, which is set. Facts entered in `src/content/privacy.ts`: address "M & L Attorneys, Private Bag 202, Blantyre" (the page adds ", Malawi"), retention for enquiries "for up to 1 year after our last contact" (the owner chose 1 year; the draft suggested 24 months), last updated "16 November 2026" (my choice of date, editable), and the MACRA contact "Malawi Communications Regulatory Authority, 9 Salmin Amour Road, Private Bag 261, Blantyre, Malawi; macra.mw", taken from MACRA's own complaints page on 16 Nov 2026 (confirm a data-protection-specific contact with MACRA or counsel).
**Still missing:** the registered legal entity name, retention for server logs and for contract records. They show as "[... to be confirmed]" with a DRAFT banner on `/privacy`. The form gate does not check for them (it checks the switch, the key and `reviewed`), so it can be switched on while they are missing; the HANDOFF tells the owner to fill them first.
**Caveat:** I have not seen the lawyer's review and cannot verify it. The address may be the law firm's own contact rather than the registered office (Q-13).
**Status:** Decided; supersedes the "draft until reviewed" status of D-42.

## D-44 Search-engine launch switch and metadata (16 Nov 2026, M5a)
**Decision:** `SITE_INDEXABLE` (build-time environment variable, `src/lib/seo.ts`) controls everything: when not `true`, every page is noindex, `/robots.txt` disallows all and `/sitemap.xml` is empty. When `true`, pages are indexable, robots allows `/` but not `/api/` or `/tokens`, and the sitemap lists the home page and `/privacy` (no invented modified dates). Metadata: title template "%s | 5iveStack Labs" with default "5iveStack Labs | Software, embedded systems, networks and CCTV", description from `site.description` (still PLACEHOLDER copy), Open Graph and Twitter large-image cards, per-page canonical links, `metadataBase` from `site.url`, and one JSON-LD `Organization` with only facts already public on the site (name, url, logo, email, phone, English). The social preview is a static 1200 by 630 PNG: the brand reverse logo (900px wide) centred on brand ink, with alt text files.
**Rejected:** a generated image through `ImageResponse` (extra runtime risk for no gain), claiming service areas or social profiles that were not supplied.
**Status:** Decided. Unverified in the live build.

## D-45 Baseline security headers (16 Nov 2026, M5a)
**Decision:** `next.config.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` that disables camera, microphone, geolocation, payment and USB, on every route. HTTPS and HSTS are handled by Vercel.
**Not done on purpose:** a Content-Security-Policy. Next.js needs per-request nonces for inline scripts, and a wrong policy would break the site silently; add it later as its own tested task.
**Status:** Decided. Check nothing breaks (HANDOFF M5a checks).

## D-46 Accessibility review (16 Nov 2026, M5a)
**Decision:** A static review against WCAG 2.1 AA with 2.2 notes is in `docs/accessibility-review.md`. Fixes made: the graphic viewport (SVG and canvas) is `aria-hidden` as a whole because its meaning is in the page text; required form fields are marked in their labels and with `required`. Open: a pause control near the hero (WCAG 2.2.2, Q-15), the command palette's dialog title, and all device tests (screen readers, keyboard, zoom, text spacing).
**Status:** Review done; device testing outstanding.

## D-47 Pause-animation button declined (16 Nov 2026)
**Decision:** The owner said not to apply the pause-animation button recommended in the accessibility review. It had been built (a global paused flag in the tier store and a toggle under the hero) and was removed completely; nothing of it was delivered. The ways to stop the animation remain Simple mode (footer and Menu) and the visitor's reduced-motion setting, which the site respects. WCAG 2.2.2 (Pause, Stop, Hide) is a Level A criterion, so this is a known, owner-accepted gap; revisit if the site is ever assessed against WCAG.
**Status:** Decided by the owner.

## D-48 Lab: CCTV coverage planner (16 Nov 2026, M3c)
**Decision:** The Lab section (`#lab`) opens with a real, working tool: a CCTV coverage planner. A 12 by 8 metre room has outer walls and a partition with a 2 metre doorway. Up to four cameras, each with direction (0 to 359 degrees), field of view (40 to 120) and range (3 to 20 metres). The room is sampled on a 0.25 m grid; a camera sees a point if it is in range, inside the field of view, and no wall blocks the straight line. The plan shows covered cells (brighter where cameras overlap) and the coverage percentage in a live status line.
- **Honest framing:** the page says it is a simplified 2D estimate that ignores lens quality, lighting, mounting height, furniture and people, so it is a way to think about placement, not a design or a quote. It runs only in the browser; nothing is sent or stored (so it adds nothing to the privacy notice).
- **Phones:** the canvas draws; camera markers are real buttons laid over it (44px targets, `touch-action: none` on the markers only), so dragging a marker moves it but touching anywhere else still scrolls the page. Arrow keys move a focused marker (Shift for bigger steps); sliders and buttons provide a non-drag route.
- **On demand:** the planner downloads and runs only after "Open the planner" is pressed (dynamic import).
- **Colours:** read from the CSS tokens at draw time; the plan sits in a dark viewport (a live sandbox, so a container is allowed).
- **Still to come:** the owner's own experiments (Q-05) and the second demo from the plan (a signal scope for the embedded side).
**Status:** Decided. Unverified on devices.

## D-49 Email route diagnostics (16 Nov 2026)
**Decision:** After the owner reported the form failing, `/api/consult` now logs the email provider's error name and message (first 300 characters; no request body, no visitor details), catches network errors when calling the provider, and trims spaces and wrapping quotes from `RESEND_API_KEY`, `CONSULT_TO`, `CONSULT_FROM` and `CONSULT_ENABLED`. Visitors still see only the generic message. The likely cause is Resend's test-sender rule (the test sender delivers only to the Resend account's own email), see HANDOFF section 5a troubleshooting.
**Status:** Decided. Cause of the owner's failure not yet confirmed.

---

## Carried-forward decisions from the plan (still in force)
- One scroll owner: Lenis on window plus GSAP ScrollTrigger as the only choreography layer; no Drei ScrollControls, no Motion library.
- Hero geometry is procedural; no `.glb` in v1; no bloom or glow. (The shared-canvas-via-`View` idea is deferred, D-26.)
- Three rendering tiers (SVG, light WebGL, full WebGL) with runtime step-down and a visible Simple mode.
- No ScrollTrigger pinning on phones; CSS sticky plus ScrollTrigger progress.
- No database; consultation requests go out as email from a route handler (built, D-40 and D-41).
- No telemetry in v1 unless a real feed exists.
- Five layers L1 to L5 from hardware to software, labelled with the five values; the mapping was confirmed by the owner on 15 Nov 2026 (labels for L4 and L5 changed, D-25).
- English only; Vercel; npm and pnpm available to the owner locally.
