# Accessibility review (WCAG 2.1 AA, with WCAG 2.2 notes)

**Date:** 16 Nov 2026. **Method:** static review of the source code against the checklist in the accessibility-review skill, plus the computed contrast numbers from `scripts/check-contrast.mjs`. **Not done:** no screen reader, keyboard-only or zoom testing has been run on a device. Treat "Pass (by design)" as "the code is built for it", not "tested". The device tests are listed at the end.

## Summary

No blocking issues were found in the code. Two small fixes were made in this pass. Three items need a decision or a device test (listed under "Open").

## Perceivable

| Check | Result |
|---|---|
| 1.1.1 Text alternatives | Pass (by design). The logo link has an accessible name. Work screenshots have descriptive alt text. The hero and Systems graphics (SVG and WebGL) are decorative and are now `aria-hidden` as a whole, because all of their meaning is in the page text. **Fixed in this pass:** the viewport container was not hidden from assistive technology. |
| 1.3.1 Info and relationships | Pass (by design). One `h1`; sections use `h2`; items use `h3`; lists use `ol` and `ul`; form fields have labels, groups have `fieldset` and `legend`. **Fixed:** name, email and message are now marked required in the label text and with the `required` attribute. |
| 1.3.2 Meaningful sequence | Pass. Source order equals reading order. The Systems steps run L1 up to L5. |
| 1.4.1 Use of colour | Pass. Form errors start with the word "Problem:". The active Systems step is shown by an orange marker plus the highlighted layer, and the text is identical for all steps. |
| 1.4.3 Contrast (text) | Pass. Ink on paper 17.5:1, muted text on paper 5.5:1, cobalt links on paper 6.3:1, ink label on orange 6.2:1, paper on ink 17.5:1, sky on ink 7.4:1. Orange is never used for text on paper (2.8:1). |
| 1.4.4 Resize text and 1.4.10 Reflow | Pass (by design). Type is in `rem` with fluid `clamp()`; layout is single column at 320px. Needs a device check at 200% and 400% zoom. |
| 1.4.11 Non-text contrast | Mostly pass. Focus ring is ink (17.5:1). Orange button fill against paper is 2.8:1, but the button is identified by its 6.2:1 text label. Cobalt lines in the dark viewport (2.8:1) are decorative only. |
| 1.4.12 Text spacing | Likely pass (no fixed-height text containers). Needs a check with a text-spacing bookmarklet. |

## Operable

| Check | Result |
|---|---|
| 2.1.1 Keyboard | Pass (by design). Native controls everywhere. The screenshot strips are focusable and scrollable with arrow keys. The command palette (cmdk) manages its own focus and returns it to the Menu button. |
| 2.1.2 No keyboard trap | Pass (by design). The palette closes with Escape or the Close button. The sticky viewport has no focusable content. |
| 2.2.2 Pause, stop, hide | **Known gap, accepted by the owner (16 Nov 2026).** The hero and Systems graphics animate continuously (signal packets, blinking cursor) for longer than 5 seconds. A way to stop them exists (Simple mode in the footer and the Menu, and the system reduced-motion setting) but there is no control beside the hero. The owner declined a pause button (D-47). This is a Level A criterion. |
| 2.4.1 Bypass blocks | Pass. The skip link is the first stop and moves focus to `main`. |
| 2.4.2 Page titled | Pass. Titles use a template ("Privacy Notice | 5iveStack Labs"). |
| 2.4.3 Focus order, 2.4.7 Focus visible | Pass (by design). Visible 2px ink ring (paper inside dark viewports). Focus moves to the new heading at each form step. |
| 2.4.11 Focus not obscured (2.2) | Pass (by design). `scroll-padding-top` equals the sticky header height, so focus scrolling keeps elements below the header. |
| 2.5.5 and 2.5.8 Target size | Pass. Interactive targets are at least 44px. |

## Understandable

| Check | Result |
|---|---|
| 3.1.1 Language | Pass. `lang="en"`. |
| 3.2.x Predictable | Pass. Nothing changes context on focus or input. The form moves between steps only on Next and Back. |
| 3.3.1, 3.3.2, 3.3.3 Errors and labels | Pass (by design). Errors are announced with `role="alert"`, tied to fields with `aria-describedby`, and written as instructions. Each field keeps a visible label. Needs a screen reader check. |

## Robust

| Check | Result |
|---|---|
| 4.1.2 Name, role, value | Pass (by design). The Menu button has `aria-haspopup` and `aria-expanded`. Simple mode uses `aria-pressed`. **Open (low):** the command palette dialog may log a dev warning about a missing dialog title (D-20); the label is set through `aria-label`, but confirm with a screen reader. |
| 4.1.3 Status messages | Pass (by design). The success message uses `role="status"`; errors use `role="alert"`. |

## Open items

1. **Pause control near the hero** (WCAG 2.2.2): declined by the owner on 16 Nov 2026; accepted gap (D-47).
2. **Command palette title.** Verify the dialog announces a name with a screen reader; fix path in D-20.
3. **Device tests** (nothing below has been done): NVDA with Firefox or Chrome on Windows; TalkBack on the S20 Ultra; keyboard-only run through the whole page, the menu and the form; 200% and 400% zoom; text-spacing bookmarklet; reduced-motion and Save-Data settings.
