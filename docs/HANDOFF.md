# Handoff: where the project stands

Last updated: 18 Nov 2026 (copy approved and polished, new footer, 3D Work gallery, six-tool Lab; see the change log). M0 to M4 are written; the privacy notice is marked reviewed; launch-readiness work (M5a: SEO, security headers, accessibility review) is written. The consultation form needs only the Resend key and a redeploy (section 5a). Two privacy facts and a few device tests are still open. **The site is live at https://5ivestack-labs.vercel.app** (noindex). The owner has checked it on a desktop and on a Samsung S20 Ultra (section 2). Other phones, an iPhone and the later features are unverified.
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
| Visual check on desktop | **Partly done** from three owner screenshots (see below) |
| Visual check on phone | **Partly done**: Samsung S20 Ultra, Chrome (see below). No iPhone, no other widths |

So M0 to M3a are "code complete" and only partly verified (the owner has run M2 on a desktop). The first person to run it must follow section 3 and record the results in the change log.

### Verified so far (owner's desktop screenshots, 15 Nov 2026, build of M2)
Three screenshots of the home page at about 1820px wide, development mode:
- The project installs and runs; the home page renders.
- Headline in Hubot Sans at its expanded width; body text and labels render in the intended families (Switzer, JetBrains Mono for `Ctrl K` and `L1` style labels). Looks right; confirm in devtools when convenient.
- The WebGL scene renders: all five layers show their own pattern (interface wireframe, code lines, network lattice with orange nodes, chips with some lit orange, circuit traces), the orange signal bar runs through the stack, and no layer is clipped at rest. This means the GLSL shader compiled.
- The orange progress bar under the header grows with scroll (partial mid-page, full at the bottom).
- Footer shows email, phone, WhatsApp and the Simple mode button (Off). Header shows the Systems/Layers link and `Menu  Ctrl K`.
- One defect spotted and fixed: the orange signal bar poked out below the bottom layer (now exactly spans L1 to L5).

### Verified on the owner's Samsung S20 Ultra (Chrome, 15 Nov 2026, live site, build M3a)
Five phone screenshots:
- Home loads: logo and a Menu button fit the header with no overflow; the headline wraps to three lines; the description, orange button and link are readable and large enough to tap.
- The WebGL stack runs on the phone (all five patterns, orange bus and nodes visible), so Tier 1 works on this device.
- The orange progress bar under the header advances as the page scrolls.
- The Menu opens as a full-screen sheet with the search box focused, a Close button and the groups Go to, Contact and Settings; an item highlights in ink on paper.
- The Systems walk works: the dark viewport stays under the header while the steps scroll beneath it, the matching layer lifts and brightens (L5 while the L5 step is active, with the orange marker beside the step), and after the last step no layer is highlighted.
- The footer lists email, phone and WhatsApp and the Simple mode button.
- One thing to polish: with a layer lifted, the top slab sits very close to the viewport's top edge. The camera fit margin was widened from 7.3 to 7.8 to give it room (check on the next test).

Still NOT confirmed on phones: other widths (320 to 430, tablet, landscape), an iPhone, Simple mode on a phone, Data Saver, step-down under load, and the new Work section. On desktop: browser console warnings or errors; `html[data-tier]` values; Lenis smoothing; opening, searching and closing the command palette; turning Simple mode on and off; layers separating on scroll; FPS step-down; the SVG-to-WebGL crossfade; the headline at other widths; and **every phone check**. The owner's priority is seamless display on any phone, so a phone screenshot set (home, menu open, Systems walk) at the S20 Ultra's width is the most useful next test.

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

### M3e checks (18 Nov 2026: footer, Work gallery, Lab tools)
Footer (D-52):
- [ ] Dark ink footer with four bands; the headline wraps cleanly at 320, 360, 412 and 430 px; "Email us" is orange with an ink label; no sideways scroll.
- [ ] The five value segments show L1 to L5 with their words; on touch they simply show (hover fill is decoration only).
- [ ] Explore links scroll to Systems, Work, Lab and Consult from the home page AND take you to the home page sections from `/privacy`.
- [ ] Simple mode button is readable on dark (paper border, sky help text) and still works; Tab focus ring is paper; "Back to top" scrolls to the top.
Work gallery (D-53):
- [ ] Each project shows a curved ribbon: centre screenshot facing you, neighbours tilted away and tucked behind it. Press a side screenshot, swipe or drag sideways, use Previous and Next, or press arrow keys, Home and End after Tab-focusing the gallery.
- [ ] Phone: swiping sideways changes the screenshot; swiping up or down scrolls the page and does not change it; no sideways page scroll at 320 to 430 px; Previous and Next are 44 px tall.
- [ ] Simple mode on (footer): the plain swipeable strip appears instead (no 3D). Reduced motion does the same.
- [ ] The live-region line reads "Screen 2 of 4" and a screen reader announces the description of the new screenshot.
Lab (D-54): each tool downloads only after its button is pressed (Network tab).
- [ ] Six tools in order: sensor sampling (L1), device link reliability (L2), CCTV planner (L3), server capacity (L4), readability and touch target (L5), code lab.
- [ ] Link reliability: default shows 30% loss, 2 retries, alert after 3; a grid of 60 squares (white, orange, outline), text with about 97.3%, 1.39 attempts, about 39 reports lost a day, about 0.03 false alerts a day. At 0% loss all squares are white. Raise loss to 70% with 0 retries: many outlines and orange rings.
- [ ] Capacity planner: default 1,500 users, 6 requests a minute, 100 a second per server, 2 servers: "Busy but coping", 75% busy, about 40 ms, "for 1,500 users you would want 3 servers". Set 5,000 users: "Overloaded", orange dot at the top.
- [ ] Readability check: starts as the site's ink on paper (17.5 to 1, all Pass except button size AAA at 32 px). Choose orange text on paper: about 2.8 to 1, Fail. The 44 px target passes both button rows.
- [ ] Code lab: Run shows the output of each of the three examples; `while (true) {}` stops with "Stopped" after about 2 seconds and the page stays usable; a typing mistake shows "Error: SyntaxError"; `typeof fetch` prints `undefined`. The text box does not zoom the page on iPhone.
- [ ] Phone, 320 px: every slider row has label and value above and a full-width slider below; the older tools' rows (sampling, CCTV) are usable.

### M3d checks (Lab: sensor sampling explorer)
- [ ] "Open the explorer" shows a dark chart with a smooth blue wave, orange dots (the samples) and a white stepped line (what the converter reports), four sliders (Signal, Sample rate, Resolution, Noise) and a sentence about the Nyquist limit.
- [ ] Default (500 Hz signal, 8,000 Hz sample rate, 6 bits, 2% noise): no aliasing message; "64 levels, 52.4 mV per step"; "48.0 kbit/s".
- [ ] Set Signal to 3,000 Hz and Sample rate to 4,000 Hz: the sentence turns into an aliasing warning and says the signal appears as 1,000 Hz, and the stepped line visibly shows a slower, wrong wave.
- [ ] Set Resolution to 2 to 4 bits: faint horizontal lines show the few available steps and the white line becomes very blocky. At 12 bits it follows the wave almost exactly.
- [ ] Phone: the chart fills the width without sideways scrolling; sliders are easy to use by thumb; the page scrolls normally when you drag over the chart.
- [ ] The explorer only downloads after pressing the button (check the Network tab).

### M3c checks (Lab: CCTV coverage planner)
- [ ] The Lab section shows a title, a short description, the "simplified estimate" note and an "Open the planner" button. Nothing heavy downloads until you press it.
- [ ] Pressing it shows a dark floor plan (12 by 8 metres) with a wall in the middle that has a gap (doorway), one numbered orange camera marker, and a blue shaded area showing coverage. "Coverage: NN% of the room, with 1 camera." appears under the plan.
- [ ] Moving the Direction, Field of view and Range sliders changes the shaded area and the percentage. Coverage behind the wall is blocked except through the doorway.
- [ ] Phone: dragging a camera marker moves it WITHOUT scrolling the page; dragging anywhere else on the plan scrolls the page normally. The markers are easy to hit (44px). Nothing overflows sideways at 320 to 430px. Sliders are easy to use by thumb.
- [ ] Keyboard: Tab to a marker, move it with the arrow keys (Shift for bigger steps); Tab reaches the camera buttons and sliders; "Add camera" (up to 4), "Remove selected" and "Close the planner" work.
- [ ] Two cameras overlapping show a brighter overlap. The percentage never exceeds 100.

### M5a checks (launch readiness)
- [ ] View source on the live site: `<title>` is "5iveStack Labs | Software, embedded systems, networks and CCTV"; there are Open Graph and Twitter tags; there is one JSON-LD script with the organisation, email and phone; the canonical link is `/` on the home page and `/privacy` on the Privacy Notice. While `SITE_INDEXABLE` is not true, `robots` says noindex.
- [ ] `/robots.txt` disallows everything now, and allows `/` (not `/api/` or `/tokens`) after launch. `/sitemap.xml` is empty now and lists two pages after launch.
- [ ] Opening `/opengraph-image.png` shows the logo on a dark 1200 by 630 image.
- [ ] Response headers (devtools, Network, any request) include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Nothing on the site breaks (fonts, images, WhatsApp and email links, the form).
- [ ] Screen reader: the hero and Systems graphics are skipped; headings read in order; the form announces required fields and errors.

### M4 checks (consultation form; only after activation, section 5a)
- [ ] The "Start a consultation" section shows a three-step form (What do you need, About you, Your message). Before activation it shows contact links instead.
- [ ] Phone (320 to 430px): each step fits without sideways scrolling; options are at least 44px tall; typing in a field does not zoom the page; Next and Back work; the on-screen keyboard does not hide the Send button when you scroll.
- [ ] Validation: leaving a step empty shows a plain "Problem: ..." message under the field (not colour alone) and keeps you on that step; a screen reader announces it.
- [ ] Step 3 shows the short privacy notice and the unticked consent checkbox; Send is blocked until it is ticked; the Privacy Notice link opens `/privacy` in a new tab.
- [ ] A successful submit shows "Thank you" and an email arrives at CONSULT_TO within a minute with name, email, phone, organisation type, services, message, a consent timestamp, and Reply-To set to the visitor.
- [ ] Spam checks: submitting in under 3 seconds (use a script or the browser console) is rejected; a filled hidden field is silently accepted but sends nothing; more than 5 submissions from one connection in an hour are refused.
- [ ] Turn the Resend key off (or set it wrong): the form shows an error with a direct email link, and no details are lost from the form.
- [ ] `/privacy` reads cleanly on a phone, has no DRAFT banner, and every `[... to be confirmed]` is gone.

### M3b checks (Work section and hero changes)
- [ ] Hero: the headline reads "From sensor to screen, we build every layer." and fits at 320, 360 and 412px without awkward breaks. The orange button says "Email us" and opens a new email to fivestacklabs@gmail.com with the subject already filled in. "Message us on WhatsApp" is now the secondary link.
- [ ] Work: two projects (SMS Malawi, Saviour Digital Solutions), each with a text column, a Role row, and four screenshots. The live links open the right sites in a new tab.
- [ ] Phone: each project's screenshots form a swipeable strip (about 85% wide so the next image peeks in), the page does not scroll sideways, and "Swipe to see more screens." shows.
- [ ] Desktop (lg and up): screenshots sit in a two-column grid beside the text.
- [ ] Images are sharp but light (each about 30 to 85 KB). Lighthouse mobile performance does not drop noticeably.
- [ ] Keyboard: each screenshot strip can be focused with Tab and scrolled with the arrow keys.
- [ ] The Work link appears in the header (lg and up) and in the Menu; it scrolls below the sticky header.

### M3a checks (Systems walk)
- [ ] Desktop: the `Systems` link scrolls to "Five layers, one team", the dark viewport stays beside the steps while you scroll, and as each step (L1 up to L5) crosses the middle of the screen the matching layer lifts and the others dim. The orange marker beside the active step appears.
- [ ] After the last step ("IT and technical consultation") no layer is highlighted.
- [ ] Phone: the viewport sits under the header at about 38% of the screen height and stays there while the steps scroll beneath it; all five layers are still visible; text is never hidden behind the viewport except while scrolling under it.
- [ ] No horizontal scroll at 320 to 430px. The viewport is not clipped.
- [ ] Simple mode on: the SVG version does the same lifting and dimming (no canvas). With reduced motion the change is instant.
- [ ] Two canvases exist at most. The second (Systems) is created only when you first scroll near it; the first pauses when off screen.
- [ ] Keyboard: the page works with Tab only (no focus traps in the sticky viewport).

5. If `next build` complains about `LayoutProps` or similar type helpers, note it: the template uses generated types that appear after the first `next dev` or `next build`. Run `pnpm dev` once, then `pnpm typecheck`.
6. Record results under "Change log" below.

## 4. What exists now (M0 to M2)

| Path | What it is |
|---|---|
| `package.json` | Pinned core versions (see D-01), scripts |
| `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.nvmrc` | Config (see D-01, D-14) |
| `src/app/globals.css` | **All design tokens**: palette, radius, easing, type scale, grid, safe-area, base layer. Tailwind defaults for colour, shadow, blur, radius, animation, easing and text size are wiped |
| `src/app/layout.tsx` | Root layout: Hubot Sans, Switzer and JetBrains Mono via `next/font/local`, viewport (`viewportFit: cover`), `noindex` metadata (D-32), skip link, `ScrollEngine`, `Header`, `Footer` |
| `src/app/page.tsx` | **Home page**: hero (headline, placeholder description, WhatsApp and email actions, dark viewport) and the Systems walk (D-26, D-36) |
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
| `src/components/hero/StackViewport.tsx` | Dark viewport used by hero and Systems walk: SVG, then lazily loaded WebGL scene (mounted only once near the screen), error boundary, visibility pausing; props `mode`, `focus`, `className` (D-28, D-36) |
| `src/components/lab/LabSection.tsx`, `ToolLauncher.tsx`, `LabControls.tsx`, `CoveragePlanner.tsx`, `SignalScope.tsx`, `LinkReliability.tsx`, `CapacityPlanner.tsx`, `ReadabilityCheck.tsx`, `CodeLab.tsx` | Lab section: six tools opened on demand, one per layer plus a code lab (D-48, D-50, D-54). `LabSection.tsx` is a data list; `LabControls.tsx` holds the shared slider row |
| `src/components/work/CoverFlow.tsx` | Curved 3D ribbon for the Work screenshots, with the plain strip for Simple mode (D-53). Its CSS is the `.flow-*` block in `globals.css` |
| `docs/principles-brief.md` | Exactly what the owner must send for the Principles section (D-55) |
| `src/components/work/WorkSection.tsx` | Work section: text column plus real screenshots, swipe strip on phones (D-37) |
| `src/content/work.ts` | Project facts and screenshot metadata, from the owner's own text. No invented outcomes |
| `public/work/` | WebP screenshots (8 files, about 400 KB in total) for SMS Malawi and Saviour Digital Solutions |
| `src/components/hero/SystemsWalk.tsx` | The Systems section: sticky viewport plus five steps L1 to L5; highlights the active layer (D-36) |
| `src/components/hero/StackSvg.tsx` | Static SVG five-layer stack (Tier 0 and loading placeholder) |
| `src/components/hero/StackScene.tsx` | R3F scene: procedural slabs, GLSL patterns, signal bus, FPS guard (D-27) |
| `src/components/consult/ConsultSection.tsx`, `ConsultForm.tsx` | The consultation section (gated) and the three-step form (D-40) |
| `src/app/api/consult/route.ts` | POST endpoint: same-origin check, rate limit, honeypot, time trap, validation, one plain-text email via the Resend REST API (D-41) |
| `src/lib/consult.ts`, `src/lib/consult-config.ts` | Shared validation and options; the server-side on/off switch |
| `src/app/privacy/page.tsx`, `src/content/privacy.ts` | The Privacy Notice page and the facts it depends on (D-42) |
| `.env.example`, `.env.local` | The environment variables and what they do; `.env.local` is the owner's own copy to fill in (never committed) |
| `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts` | Launch switch for search engines (D-44) |
| `src/app/opengraph-image.png`, `twitter-image.png` (+ `.alt.txt`) | Social preview image (logo on ink, 1200 by 630) |
| `docs/accessibility-review.md` | Accessibility review: findings, fixes, open items (D-46) |
| `docs/privacy-notice-draft.md` | Draft privacy notice, form notice and owner compliance map. **Needs legal review** (Q-08) |
| `src/components/shell/ScrollEngine.tsx` | Renders nothing. Writes `--page-progress`; starts GSAP ScrollTrigger and (fine-pointer, Tier 1+) Lenis, lazily |
| `src/components/shell/Header.tsx` | Sticky header, logo, links from `lg`, orange progress bar |
| `src/components/shell/CommandPalette.tsx` | Menu button and cmdk palette (full-screen on phone) |
| `src/components/shell/SimpleModeToggle.tsx`, `Footer.tsx` | Simple mode control (has an `onDark` variant) and the dark four-band footer (D-52) |
| `docs/` | This file, `DECISIONS.md`, brand pack README and contrast notes |

## 5. Remaining work

### Actions needed (A-xx)
- **A-01 Switzer font: DONE** (15 Nov 2026). The owner supplied the Fontshare download; `Switzer-Variable.woff2` is bundled through `next/font/local` (D-33). Remember the licence limits: private repository, no modifying or subsetting the file, and outside contractors must download their own copy from Fontshare.
- **A-02 Run the first-run checklist** (section 3).
- **A-03 GSAP licensing: resolved in substance** (D-22). Skim gsap.com/standard-license once.
- **A-04 Verify the Tailwind spacing-scale enforcement option** (D-09), or keep the scanner as the control.
- **A-05 Create the Vercel project** (Git integration, Node 22). Production domain: see Q-09.
- **A-07 Keep the Git repository PRIVATE** and do not publish the font files (D-33). Anyone outside the company who needs to work on the code must download Switzer from Fontshare themselves and add it to `src/fonts/`.
- **A-09 Consultation email delivery: RESOLVED 16 Nov 2026.** The first live test failed with the generic message; the Vercel log showed status 401 (Resend did not recognise the API key). The owner re-entered the key and reported that sending now works. (If the destination is ever changed to an address other than the Resend account's own email, the test-sender rule applies: section 5a items 2 and 3.)
- **A-08 Privacy notice:** `/privacy` is built and shows a DRAFT banner listing the facts still missing. Owner: fill `src/content/privacy.ts` (items in `docs/privacy-notice-draft.md` Part A3), then have a Malawian lawyer review the page, then set `reviewed: true`.
- **A-06 Version control:** the project is not yet in a Git repository. Initialise, make a first commit after A-02 passes, and add a CI step running `pnpm check`.

### Milestones (details in the plan)
| Milestone | Scope | New dependencies | Exit |
|---|---|---|---|
| M0 foundation | Tokens, fonts, logo, checks | none | **Written, unverified** |
| M1 scroll and shell | Lenis plus GSAP lifecycle, header, skip link, command palette with visible phone Menu button, Simple mode toggle, rendering-tier detection | `gsap`, `lenis`, `cmdk` (`@gsap/react` moved to M2, D-02) | **Written, unverified.** Anchors, keyboard, focus, reduced motion all work on a real phone (M1 checks above) |
| M2 hero | **Written, unverified** (D-25 to D-32). Single canvas in the hero viewport (not Drei `View`, D-26), five procedural layers, trace shader (orange signal, sky and paper lines, no bloom), load sequence, SVG Tier 0, step-down, context-loss handling | `three`, `@react-three/fiber`, `@react-three/drei`, `@gsap/react` (+ `@types/three`) | Smooth on a mid-range Android, or the visitor lands on Tier 0 unharmed. Removes the M0 proof page |
| M3 sections (3a Systems walk, 3b Work and 3c Lab with the coverage planner and the sampling explorer are written, D-36, D-37, D-48 and D-50; the owner's own Lab experiments and the Principles section wait for content) | Systems walk (CSS sticky plus ScrollTrigger progress), Work drawers, Lab, Principles, then two added Lab demos | `@react-three/rapier` (Lab only, lazy) | All content real; every drawer works by touch |
| M4 consultation (**written, switched off until activated, see section 5a**) | Step-by-step configurator, route handler, email, spam checks | `zod`, email provider SDK (default pick Resend: confirm limits and domain verification first) | A phone-submitted test request arrives in the inbox |
| M5 hardening | Profiling, bundle analysis, image and font audit, accessibility review, SEO, Vercel deploy, real-device pass | `r3f-perf` (dev) | Budgets met on the throttled mobile profile |

Definition of done for every milestone: works at 360px; keyboard works; reduced motion works; Lighthouse mobile passes the budgets; `pnpm check` is clean; one real-phone test recorded in the change log.

### Budgets (proposals, tune after bundle analysis)
LCP under 2.5s, INP under 200ms, CLS under 0.1 on a throttled mobile profile. First-load JavaScript around 170 KB gzipped excluding the lazy 3D chunk. Images AVIF or WebP via `next/image` with explicit sizes.

## 5a. Activating the consultation form (M4)
The form is built but **invisible until all three switches are on** (D-41). Visitors currently see plain contact links in its place. To go live, in this order:
1. **Privacy facts. Mostly done 16 Nov 2026.** Filled: last updated date, address, retention for enquiries (1 year), MACRA contact. **Still `null`: legal entity name, retention for server logs, retention for contract records.** Until they are filled `/privacy` shows a DRAFT banner and "[... to be confirmed]" in those three places, even though the form can already be switched on. Fill them before the form goes public.
2. **Reviewed. Done.** `reviewed: true` is set (the owner confirmed on 16 Nov 2026 that a Malawian lawyer reviewed the notice the night before). Keep the lawyer's written confirmation with the company records. If the text of `/privacy` changes after review, ask the lawyer to re-check the changed parts and update the date.
3. **Resend account.** Create a free account at resend.com **using fivestacklabs@gmail.com** (the test sender `onboarding@resend.dev` only delivers to the account's own email address). Create an API key with sending access. The free plan was reported as 3,000 emails per month with a daily cap of 100 (a secondary source; confirm on Resend's pricing page). To send to any other address later, verify a domain in Resend.
4. **Local test first:** the owner's `.env.local` (not committed) already has the right names. Paste the key after `RESEND_API_KEY=`, run `pnpm dev`, and the form appears in the Consult section. **Vercel environment variables** (Project Settings, Environment Variables, Production): `CONSULT_ENABLED=true`, `RESEND_API_KEY=<the key>`, `CONSULT_TO=fivestacklabs@gmail.com`, `CONSULT_FROM=5iveStack Labs <onboarding@resend.dev>`. Never commit real values.
5. **Redeploy** (the page is built statically, so the form only appears on the next build).
6. **Test from a phone:** submit a request; it must arrive in the inbox with Reply-To set to the visitor's address. Then check the M4 list in section 3.

### If the form says "We could not send your request" (troubleshooting, 16 Nov 2026)
That message is deliberately generic. Find the real reason in this order:
1. **Vercel, your project, Logs (Runtime Logs), filter on `/api/consult`.** After the update in this delivery the log line reads like `consult: email provider returned status 403 validation_error: You can only send testing emails to your own email address ...`. (The earlier build logged only the status number, e.g. `status 403`.)
2. **The most likely cause: Resend's test sender.** While `CONSULT_FROM` is `5iveStack Labs <onboarding@resend.dev>`, Resend delivers ONLY to the email address your Resend account was created with. If you signed up to Resend with a different email than fivestacklabs@gmail.com, sends to `CONSULT_TO` are refused. Fix: set `CONSULT_TO` in Vercel to the email you use to log in to Resend (requests then arrive in that inbox, with Reply-To set to the visitor), or create the Resend account with fivestacklabs@gmail.com.
3. **Do not set `CONSULT_FROM` to a Gmail address.** Resend refuses to send from a domain you have not verified (gmail.com can never be verified). Leave it as `5iveStack Labs <onboarding@resend.dev>` until you own a domain and verify it in Resend.
4. **Status 401 (the owner's first log line, 16 Nov 2026).** In Resend's error list, 401 is `missing_api_key`: Resend did not recognise the key it was sent (it does not exist, was deleted, or is not active; an empty or wrongly pasted value gives the same result). It is NOT the test-sender problem (that is a 403). Fix, in order:\n   a. In Resend, API Keys, create a NEW key with Sending access for all domains. Resend shows the full key only once; copy it straight away (it starts with `re_`).\n   b. In Vercel, Settings, Environment Variables, edit `RESEND_API_KEY`: paste only the key. No quotes, no spaces, no `Bearer`, no `RESEND_API_KEY=` in front. Make sure it applies to **Production** and is in the same Vercel project as this site.\n   c. Deploy the latest code (the log line you saw, `returned status 401` with nothing after it, is the OLD logging; the new code adds Resend's reason and trims stray spaces and quotes) and **redeploy**.\n   d. Test the key outside the site, on your own computer, in PowerShell (replace the two placeholders; never paste the key into chat):\n   ```\n   $h = @{ Authorization = "Bearer PASTE_KEY_HERE"; "Content-Type" = "application/json" }\n   $b = '{"from":"onboarding@resend.dev","to":["YOUR_RESEND_LOGIN_EMAIL"],"subject":"test","text":"hello"}'\n   Invoke-RestMethod -Method Post -Uri https://api.resend.com/emails -Headers $h -Body $b\n   ```\n   If that returns an id and an email arrives, the key is good and the problem is how it was entered in Vercel. If it fails with 401, the key itself is wrong or deleted: create another.
5. **Variables not applied:** Vercel only applies new variables on the next deployment, and they must be set for the **Production** environment. Redeploy after every change.
6. **Resend dashboard, Emails or Logs:** shows each attempt and the reason it was refused.
If the log says something else, send me that one line (it contains no visitor details) and I will fix it.

## 5b. Launching to search engines (M5a)
The site is public at https://5ivestack-labs.vercel.app but tells search engines to ignore it (D-44). To launch:
1. Copy: the site description and layer summaries are approved and polished (D-51). Confirm the hero headline (Q-12). Delete `src/app/tokens/` if it still exists in your project.
   Principles section: optional for launch; see `docs/principles-brief.md`.
2. Fill the remaining privacy facts (section 5a step 1) and activate the form.
3. If you attach a custom domain, set it in `site.url` (`src/content/site.ts`).
4. Set `SITE_INDEXABLE=true` in Vercel (Production) and redeploy. Pages become indexable, `/robots.txt` allows crawling (except `/api/` and `/tokens`), and `/sitemap.xml` lists the home page and the Privacy Notice.
5. Add the site to Google Search Console and submit the sitemap. Check the social preview image by pasting the URL into a link previewer.
6. Run the accessibility device tests in `docs/accessibility-review.md` and a Lighthouse mobile run; record the results in the change log.

## 6. Questions (Q-xx)

Status: **Answered** (decision recorded), **Partly** (some information received), **Open** (still needed).

| ID | Question | Status | Notes and default |
|---|---|---|---|
| Q-01 | Is the `sky` colour (`#6FA0FF`) approved as a third colour, restricted to text and lines on dark viewports? | **Answered 15 Nov 2026: yes** | Recorded in `globals.css` and D-05 |
| Q-02 | Value-to-layer mapping | **Answered 15 Nov 2026: confirmed** | Owner asked to replace the buzzwords "Innovation" and "Creativity". Replaced with Scalability (L4) and Usability (L5), see D-25 and Q-11 |
| Q-03 | Destination email, phone and WhatsApp | **Answered 15 Nov 2026** | fivestacklabs@gmail.com, +265 991 974 388. Live in the hero (email is the primary button), footer, command palette, and the consultation form's destination (`CONSULT_TO`). Needs a Resend account created with this same address (section 5a) |
| Q-04 | Flagship projects (name, one line, owner's role, stack, real outcomes, 3 to 6 images, permission) | **Mostly answered 15 Nov 2026** | SMS Malawi and Saviour Digital Solutions are in the Work section with the owner's description, role (Developer), live links and four screenshots each. Saviour: built with HTML, CSS and JavaScript. Still open: the SMS Malawi stack, any real outcomes (numbers, client results), and a written OK that the client names and the school's photo shown in the screenshots may appear publicly. More projects "will come later" |
| Q-05 | Details of the 2 to 3 Lab experiments | **Answered 18 Nov 2026** | The owner has no experiments of their own and asked for labs matching the five layers, including a coding lab. Built as six tools (D-54). Owner may still add their own later |
| Q-06 | Company text: description, one line per service, social links | **Partly** | The description and layer summaries were approved and polished on 18 Nov 2026 (D-51). Still open: social links (none supplied) |
| Q-07 | Analytics | **Open, default none** | None in v1. Adding any requires a privacy notice change first |
| Q-08 | Privacy wording for the consultation form | **Answered 16 Nov 2026: reviewed** | The owner confirmed a Malawian lawyer reviewed `/privacy` the night of 15 Nov 2026; `reviewed: true` is set (D-43). Keep the lawyer's written confirmation |
| Q-09 | Production domain and DNS access | **Partly answered 15 Nov 2026** | Live at https://5ivestack-labs.vercel.app (the site stays noindex). Still open: a custom domain, if wanted |
| Q-10 | Test devices | **Answered 15 Nov 2026** | Samsung S20 Ultra (about 412px wide). Owner's priority: seamless on any phone size, because customers have different phones. Covered by the M2 width-sweep checklist (320 to 430, tablet, landscape) |
| Q-11 | Confirm the new L4 and L5 words: **Scalability** and **Usability** | **Answered 15 Nov 2026: confirmed** | Live in `src/content/layers.ts` |
| Q-12 | Hero headline and primary call to action | **Partly answered 15 Nov 2026** | Owner asked for something catchier in the same direction, and for email to be the primary action. Now: "From sensor to screen, we build every layer." with an orange "Email us" button (subject prefilled) and WhatsApp as the secondary link. The 18 Nov 2026 approval named the hero description and layer summaries, not the headline: please confirm "From sensor to screen, we build every layer." or pick an alternative from D-38 |
| Q-13 | Legal entity name, registration details and address | **Partly answered 16 Nov 2026** | Address supplied: "M & L Attorneys, Private Bag 202, Blantyre, Malawi" (entered as given; **please confirm** whether this is the registered office or the law firm's contact, and whether it should read "c/o"). Retention for enquiries: 1 year (entered). MACRA contact filled from MACRA's own complaints page. **Still needed:** the registered legal entity name (exactly as on the company registration certificate, for example "... Limited"; the owner asked what is wanted on 18 Nov 2026), retention for server logs, retention for contract records. Also confirm whether the M & L Attorneys address is the registered office |
| Q-14 | Real device test results from the first-run checklists (M0, M1, M2) | **Open** | Blocks calling any milestone "done" |
| Q-15 | Add a visible "Pause animation" button near the hero (WCAG 2.2.2)? | **Answered 16 Nov 2026: no** | The owner declined. It was built and then fully removed. The remaining way to stop the animation is Simple mode (footer and Menu) and the visitor's reduced-motion setting. WCAG 2.2.2 is a Level A criterion; the owner has accepted the gap (recorded in `docs/accessibility-review.md`) |
| Q-16 | Launch date, and approval of the placeholder copy (hero description, layer summaries) | **Partly answered 18 Nov 2026** | Copy approved (D-51). Launch date still open; needed before `SITE_INDEXABLE=true` (section 5b) |
| Q-17 | Principles section content (four to six principles, each with a true story) | **Open** | Exactly what is needed is in `docs/principles-brief.md` (D-55). Nothing is built or shown until supplied |

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
- **Copy:** description and layer summaries are approved (D-51); only the hero headline still needs a yes (Q-12).
- **Code lab and CSP:** the Lab's code tool runs in a Blob web worker. When the Content-Security-Policy task is done, the policy must allow `worker-src blob:` (D-54) or that tool breaks.
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
| 15 Nov 2026 | Claude | Owner ran M2 and sent three desktop screenshots (D-35): renders correctly. Fixed the signal bar overshooting the bottom layer. Built M3a: Systems walk (sticky viewport, layer highlighting, `services` per layer), lazy mounting of each scene, `#systems` nav. Phone verification still outstanding. |
| 15 Nov 2026 | Claude | Site went live on Vercel (owner). Phone screenshots from the S20 Ultra reviewed (D-35 addendum): home, menu sheet and Systems walk work. Built M3b: Work section from the owner's Resources.zip (8 screenshots converted to WebP, project facts from the owner's text), new headline, email as primary action with prefilled subject, `site.url` and `metadataBase`, wider camera fit margin (7.3 to 7.8), Work added to the nav. Q-04, Q-09, Q-11 and Q-12 updated. Deliverable zip now contains changed files only (owner's instruction). |
| 15 Nov 2026 | Claude | Built M4: three-step consultation form, `/api/consult` route (Resend REST API, no new packages), `/privacy` page with DRAFT banner, `.env.example`, footer Privacy link, Consult in the nav. The form is switched off until three conditions are met (D-41). Validation logic tested with Node (dedupe, sanitising, error messages). Nothing else in M4 has been run. |
| 16 Nov 2026 | Claude | Owner confirmed the privacy notice was lawyer-reviewed and supplied the address and 1-year retention. Set `reviewed: true`, filled address, retention for enquiries, last updated date and the MACRA contact (verified on macra.mw). Created `.env.local` template. Started M5a: noindex launch switch (`SITE_INDEXABLE`), robots and sitemap, metadata (title template, Open Graph, Twitter, canonical), JSON-LD, social preview image, baseline security headers, and an accessibility code review with two small fixes (decorative viewport hidden from assistive tech; required fields marked). Nothing run on a device. |
| 16 Nov 2026 | Claude | Owner declined the pause-animation button: built and fully removed (Q-15 answered no). Owner reported the consultation form shows "We could not send your request" after adding the Resend key in Vercel. Hardened `/api/consult`: logs the provider's error name and message (no visitor data), catches network failures, trims spaces and quotes from the environment values. Added troubleshooting steps (section 5a). Built M3c: Lab section with a working CCTV coverage planner (opens on demand, touch handles, keyboard support), Lab in the nav. Nothing run on a device. |
| 16 Nov 2026 | Claude | Owner sent the Vercel log line `consult: email provider returned status 401`. Checked Resend's error documentation: 401 is `missing_api_key` (Resend does not recognise the key: wrong, deleted or inactive). Added the exact fix and a PowerShell test to section 5a. Noted that the owner's log is in the old format, so the diagnostic update from the previous delivery has not been deployed yet. No code change. |
| 16 Nov 2026 | Claude | Owner confirmed Resend email now works (A-09 resolved). Built the second Lab demo, the sensor sampling explorer (D-50), and generalised the launcher (`ToolLauncher.tsx` replaces `PlannerLauncher.tsx`, which must be deleted from the project). Sampling arithmetic checked in Node. Nothing run on a device. |
| 18 Nov 2026 | Claude | Read the handoff, decisions, memory and code. Owner answered: no own Lab experiments (build labs for the five layers plus a coding lab), the company is registered with the Malawi government (asked what the entity name means), approved the placeholder copy with polish, asked for the Principles requirements in detail, a modern footer, and a creative display for the Work photos (chose the 3D coverflow). Done: copy polished (D-51); footer redesigned (D-52); Work screenshots as a curved 3D ribbon (D-53); Lab expanded to six tools (D-54); `docs/principles-brief.md` (D-55); old slider rows made phone-safe. Checked: banned-pattern and contrast scripts pass; Lab maths and examples tested in Node; the real gallery and Lab components bundled and run in headless Chromium (screenshots, touch swipe, drag, keyboard, infinite-loop stop). Not run: `pnpm install`, `pnpm build`, `pnpm lint`, `pnpm typecheck` (cannot install packages here; an approximate type check with stubbed types found no real errors), the full site, any real phone. |
