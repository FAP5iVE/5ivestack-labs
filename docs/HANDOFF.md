# Handoff: where the project stands

Last updated: 15 Nov 2026. M0 to M2, the Systems walk, the Work section and the consultation form (M4, switched off) are written. **The site is live at https://5ivestack-labs.vercel.app** (noindex). The owner has checked it on a desktop and on a Samsung S20 Ultra (section 2). Other phones, an iPhone and the later features are unverified.
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
| `.env.example` | The environment variables and what they do |
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
- **A-08 Privacy notice:** `/privacy` is built and shows a DRAFT banner listing the facts still missing. Owner: fill `src/content/privacy.ts` (items in `docs/privacy-notice-draft.md` Part A3), then have a Malawian lawyer review the page, then set `reviewed: true`.
- **A-06 Version control:** the project is not yet in a Git repository. Initialise, make a first commit after A-02 passes, and add a CI step running `pnpm check`.

### Milestones (details in the plan)
| Milestone | Scope | New dependencies | Exit |
|---|---|---|---|
| M0 foundation | Tokens, fonts, logo, checks | none | **Written, unverified** |
| M1 scroll and shell | Lenis plus GSAP lifecycle, header, skip link, command palette with visible phone Menu button, Simple mode toggle, rendering-tier detection | `gsap`, `lenis`, `cmdk` (`@gsap/react` moved to M2, D-02) | **Written, unverified.** Anchors, keyboard, focus, reduced motion all work on a real phone (M1 checks above) |
| M2 hero | **Written, unverified** (D-25 to D-32). Single canvas in the hero viewport (not Drei `View`, D-26), five procedural layers, trace shader (orange signal, sky and paper lines, no bloom), load sequence, SVG Tier 0, step-down, context-loss handling | `three`, `@react-three/fiber`, `@react-three/drei`, `@gsap/react` (+ `@types/three`) | Smooth on a mid-range Android, or the visitor lands on Tier 0 unharmed. Removes the M0 proof page |
| M3 sections (3a Systems walk and 3b Work are written, D-36 and D-37; Lab and Principles wait for content) | Systems walk (CSS sticky plus ScrollTrigger progress), Work drawers, Lab, Principles, then two added Lab demos | `@react-three/rapier` (Lab only, lazy) | All content real; every drawer works by touch |
| M4 consultation (**written, switched off until activated, see section 5a**) | Step-by-step configurator, route handler, email, spam checks | `zod`, email provider SDK (default pick Resend: confirm limits and domain verification first) | A phone-submitted test request arrives in the inbox |
| M5 hardening | Profiling, bundle analysis, image and font audit, accessibility review, SEO, Vercel deploy, real-device pass | `r3f-perf` (dev) | Budgets met on the throttled mobile profile |

Definition of done for every milestone: works at 360px; keyboard works; reduced motion works; Lighthouse mobile passes the budgets; `pnpm check` is clean; one real-phone test recorded in the change log.

### Budgets (proposals, tune after bundle analysis)
LCP under 2.5s, INP under 200ms, CLS under 0.1 on a throttled mobile profile. First-load JavaScript around 170 KB gzipped excluding the lazy 3D chunk. Images AVIF or WebP via `next/image` with explicit sizes.

## 5a. Activating the consultation form (M4)
The form is built but **invisible until all three switches are on** (D-41). Visitors currently see plain contact links in its place. To go live, in this order:
1. **Privacy facts.** Fill every `null` in `src/content/privacy.ts` (legal entity, address, last updated date, retention periods, MACRA contact). Open `/privacy`: the DRAFT banner lists what is still missing and disappears when none are. Have a Malawian lawyer review the page.
2. **Mark reviewed.** Set `reviewed: true` in `src/content/privacy.ts` only after that review.
3. **Resend account.** Create a free account at resend.com **using fivestacklabs@gmail.com** (the test sender `onboarding@resend.dev` only delivers to the account's own email address). Create an API key with sending access. The free plan was reported as 3,000 emails per month with a daily cap of 100 (a secondary source; confirm on Resend's pricing page). To send to any other address later, verify a domain in Resend.
4. **Vercel environment variables** (Project Settings, Environment Variables, Production): `CONSULT_ENABLED=true`, `RESEND_API_KEY=<the key>`, `CONSULT_TO=fivestacklabs@gmail.com`, `CONSULT_FROM=5iveStack Labs <onboarding@resend.dev>`. Never commit real values.
5. **Redeploy** (the page is built statically, so the form only appears on the next build).
6. **Test from a phone:** submit a request; it must arrive in the inbox with Reply-To set to the visitor's address. Then check the M4 list in section 3.

## 6. Questions (Q-xx)

Status: **Answered** (decision recorded), **Partly** (some information received), **Open** (still needed).

| ID | Question | Status | Notes and default |
|---|---|---|---|
| Q-01 | Is the `sky` colour (`#6FA0FF`) approved as a third colour, restricted to text and lines on dark viewports? | **Answered 15 Nov 2026: yes** | Recorded in `globals.css` and D-05 |
| Q-02 | Value-to-layer mapping | **Answered 15 Nov 2026: confirmed** | Owner asked to replace the buzzwords "Innovation" and "Creativity". Replaced with Scalability (L4) and Usability (L5), see D-25 and Q-11 |
| Q-03 | Destination email, phone and WhatsApp | **Answered 15 Nov 2026** | fivestacklabs@gmail.com, +265 991 974 388. Live in the hero (email is the primary button), footer, command palette, and the consultation form's destination (`CONSULT_TO`). Needs a Resend account created with this same address (section 5a) |
| Q-04 | Flagship projects (name, one line, owner's role, stack, real outcomes, 3 to 6 images, permission) | **Mostly answered 15 Nov 2026** | SMS Malawi and Saviour Digital Solutions are in the Work section with the owner's description, role (Developer), live links and four screenshots each. Saviour: built with HTML, CSS and JavaScript. Still open: the SMS Malawi stack, any real outcomes (numbers, client results), and a written OK that the client names and the school's photo shown in the screenshots may appear publicly. More projects "will come later" |
| Q-05 | Details of the 2 to 3 Lab experiments | **Open** (owner will send later) | Default: Lab ships with the two added demos only |
| Q-06 | Company text: description, one line per service, social links | **Partly** | Owner approved a PLACEHOLDER description (written, D-31). Still open: real text, and social links (none supplied) |
| Q-07 | Analytics | **Open, default none** | None in v1. Adding any requires a privacy notice change first |
| Q-08 | Privacy wording for the consultation form | **Partly** | `/privacy` page and the form's short notice are built from the draft (D-42). The form stays off until the owner fills the missing facts and a Malawian lawyer reviews it (section 5a) |
| Q-09 | Production domain and DNS access | **Partly answered 15 Nov 2026** | Live at https://5ivestack-labs.vercel.app (the site stays noindex). Still open: a custom domain, if wanted |
| Q-10 | Test devices | **Answered 15 Nov 2026** | Samsung S20 Ultra (about 412px wide). Owner's priority: seamless on any phone size, because customers have different phones. Covered by the M2 width-sweep checklist (320 to 430, tablet, landscape) |
| Q-11 | Confirm the new L4 and L5 words: **Scalability** and **Usability** | **Answered 15 Nov 2026: confirmed** | Live in `src/content/layers.ts` |
| Q-12 | Hero headline and primary call to action | **Partly answered 15 Nov 2026** | Owner asked for something catchier in the same direction, and for email to be the primary action. Now: "From sensor to screen, we build every layer." with an orange "Email us" button (subject prefilled) and WhatsApp as the secondary link. Still PLACEHOLDER until the owner approves. Alternatives are in D-38 |
| Q-13 | Legal entity name, registration details and address | **Open** | Needed for `/privacy` (fill `src/content/privacy.ts`). Also needed: retention periods, MACRA complaint contact, the publication date |
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
| 15 Nov 2026 | Claude | Owner ran M2 and sent three desktop screenshots (D-35): renders correctly. Fixed the signal bar overshooting the bottom layer. Built M3a: Systems walk (sticky viewport, layer highlighting, `services` per layer), lazy mounting of each scene, `#systems` nav. Phone verification still outstanding. |
| 15 Nov 2026 | Claude | Site went live on Vercel (owner). Phone screenshots from the S20 Ultra reviewed (D-35 addendum): home, menu sheet and Systems walk work. Built M3b: Work section from the owner's Resources.zip (8 screenshots converted to WebP, project facts from the owner's text), new headline, email as primary action with prefilled subject, `site.url` and `metadataBase`, wider camera fit margin (7.3 to 7.8), Work added to the nav. Q-04, Q-09, Q-11 and Q-12 updated. Deliverable zip now contains changed files only (owner's instruction). |
| 15 Nov 2026 | Claude | Built M4: three-step consultation form, `/api/consult` route (Resend REST API, no new packages), `/privacy` page with DRAFT banner, `.env.example`, footer Privacy link, Consult in the nav. The form is switched off until three conditions are met (D-41). Validation logic tested with Node (dedupe, sanitising, error messages). Nothing else in M4 has been run. |
