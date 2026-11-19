"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTierState } from "@/lib/tier";

/*
  Laptop hero (decision D-60). A closed laptop opens as you scroll, the camera moves into its
  screen, the screen becomes the full-screen photo hero, and the headline appears over it.
  Then the page scrolls on normally.

  How it works
  - The laptop is CSS 3D (see the .lh-* rules in globals.css): a deck, a front edge and a lid
    hinged at the back. No model, no WebGL, no library.
  - .lh-stage is CSS position: sticky inside the taller .lh-wrap, so scrolling stays native. This
    component only reads the scroll position (passive listener, one animation frame at a time)
    and writes CSS custom properties on the stage. It never sets React state while scrolling.
  - The picture glides to the scroll position with a short damped follow (FOLLOW) rather than
    jumping with every scroll event, and the easing is smootherstep, so the lid moves like a
    damped hinge. The screen is dark until the lid is nearly open, then lights up.
  - Phases of the scroll runway (p goes from 0 to 1): 0 to OPEN_END the lid opens and the camera
    tilts to face the screen; from ZOOM_START to ZOOM_END the camera moves into the screen until it covers the
    viewport; the flat full-screen photo fades in over the last of the zoom (the two show the same
    photo with the same dark layer, so the swap is not visible); then the headline fades in.
  - The zoom end state is measured from the real layout (getBoundingClientRect), not guessed, and
    measured again when the stage resizes.
  - The real headline, text and links are ordinary page content passed in as children, so they
    are in the document from the start for search engines and screen readers. Links are taken out
    of the tab order until they are visible.
  - Simple mode, reduced motion and Save-Data (and visitors without JavaScript) get the finished
    hero with no laptop (data-mode="flat"). Reversing the scroll closes the laptop again.
*/

const IMAGE = { src: "/hero/skyline-sunset.webp", width: 2560, height: 1622 };
const FOCUS_X = 0.4; // horizontal point of the photo kept in view on tall screens (0 to 1)
const IMAGE_ASPECT = IMAGE.width / IMAGE.height;
const OPEN_DEG = 14; // how far the open lid leans back
const CLOSED_TILT = -42; // camera tilt while closed (degrees, negative looks down on the lid)
const OPEN_END = 0.38;
const ZOOM_START = 0.3; // the camera starts moving in just before the lid finishes opening
const ZOOM_END = 0.74;
const FOLLOW = 9; // how quickly the picture follows the scroll (per second); higher is tighter
const COPY_START = 0.74;
const COPY_END = 0.86;
const LINKS_ON = 0.84;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Smootherstep: starts and ends very gently, like a lid with a damped hinge.
const easeInOut = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const smooth = (from: number, to: number, x: number) => {
  const t = clamp01((x - from) / (to - from));
  return t * t * (3 - 2 * t);
};

type Fit = { tyEnd: number; sEnd: number; txEnd: number };

export type Pose = {
  lid: number;
  rx: number;
  s: number;
  tx: number;
  ty: number;
  cover: number;
  copy: number;
  cue: number;
  scene: number;
  off: number;
};

/** Everything the scroll position decides, as a pure function (exported for testing). */
export function pose(p: number, fit: Fit): Pose {
  const open = easeInOut(clamp01(p / OPEN_END));
  const zoomRaw = clamp01((p - ZOOM_START) / (ZOOM_END - ZOOM_START));
  const zoom = easeInOut(zoomRaw);
  const cover = smooth(0.86, 1, zoomRaw);
  return {
    lid: lerp(-90, OPEN_DEG, open),
    rx: lerp(CLOSED_TILT, -OPEN_DEG, open),
    s: Math.pow(fit.sEnd, zoom),
    tx: fit.txEnd * zoom,
    ty: fit.tyEnd * (0.5 * open + 0.5 * zoom), // keeps the whole open laptop in view before the zoom
    cover,
    copy: smooth(COPY_START, COPY_END, p),
    cue: 1 - smooth(0, 0.08, p),
    scene: cover >= 1 ? 0 : 1,
    off: 1 - smooth(0.45, 0.8, open),
  };
}

function Photo() {
  return (
    <>
      <Image
        src={IMAGE.src}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover"
        style={{ objectPosition: `${FOCUS_X * 100}% 50%` }}
      />
      <div className="lh-shade" />
    </>
  );
}

// Keyboard drawn as plain rectangles in a 100 by 64 box (the deck's proportions).
const KEY_ROWS = [14, 14, 13, 12, 8];
function Keys() {
  const keys: ReactNode[] = [];
  KEY_ROWS.forEach((count, row) => {
    const width = (92 - (count - 1) * 1) / count;
    for (let i = 0; i < count; i += 1) {
      keys.push(
        <rect
          key={`${row}-${i}`}
          x={4 + i * (width + 1)}
          y={row === 0 ? 5 : 5 + 4.6 + (row - 1) * 7.2 + 1.2}
          width={width}
          height={row === 0 ? 3.8 : 6.2}
          rx="0.9"
          fill="var(--color-ink)"
        />,
      );
    }
  });
  return (
    <svg viewBox="0 0 100 64" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {keys}
      <rect x="35" y="45.5" width="30" height="14.5" rx="1.6" fill="none" stroke="var(--color-ink)" strokeWidth="0.7" />
    </svg>
  );
}

export function LaptopHero({ children }: { children: ReactNode }) {
  const { simple, reducedMotion, saveData } = useTierState();
  const flat = simple || reducedMotion || saveData;
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flat) return;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const screen = screenRef.current;
    const content = contentRef.current;
    if (!wrap || !stage || !screen || !content) return;

    const links = Array.from(content.querySelectorAll<HTMLAnchorElement>("a"));
    let fit: Fit = { tyEnd: 0, sEnd: 1, txEnd: 0 };
    let frame = 0;
    let linksOn: boolean | null = null;

    const write = (v: Pose) => {
      const st = stage.style;
      st.setProperty("--lid", `${v.lid.toFixed(2)}deg`);
      st.setProperty("--rx", `${v.rx.toFixed(2)}deg`);
      st.setProperty("--s", v.s.toFixed(4));
      st.setProperty("--tx", `${v.tx.toFixed(1)}px`);
      st.setProperty("--ty", `${v.ty.toFixed(1)}px`);
      st.setProperty("--cover", v.cover.toFixed(3));
      st.setProperty("--copy", v.copy.toFixed(3));
      st.setProperty("--cue", v.cue.toFixed(3));
      st.setProperty("--scene", String(v.scene));
      st.setProperty("--off", v.off.toFixed(3));
    };

    // Where does the screen land once the lid is open and the camera faces it? From that,
    // work out the zoom and shifts that make it cover the viewport.
    const measure = () => {
      write({ lid: OPEN_DEG, rx: -OPEN_DEG, s: 1, tx: 0, ty: 0, cover: 0, copy: 0, cue: 0, scene: 1, off: 0 });
      const r = screen.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || st.width === 0) return;
      const visible = Math.min(1, st.width / st.height / IMAGE_ASPECT);
      const focus = FOCUS_X * (1 - visible) + visible / 2; // photo point the flat cover centres
      const edge = Math.max(0.2, 1 - 2 * Math.abs(focus - 0.5));
      const sEnd = Math.max(st.width / (r.width * edge), st.height / r.height) * 1.06;
      fit = {
        tyEnd: st.top + st.height / 2 - (r.top + r.height / 2),
        sEnd,
        txEnd: -(focus - 0.5) * r.width * sEnd,
      };
    };

    // Where the scroll position says we are (0 to 1).
    const readTarget = () => {
      const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      const box = wrap.getBoundingClientRect();
      const range = box.height - stage.offsetHeight;
      return range > 0 ? clamp01((stickyTop - box.top) / range) : 1;
    };

    // The picture follows the scroll with a short, damped glide instead of jumping with every
    // scroll event, so the lid and the camera move like a smooth hinge on phones and desktops.
    let current = readTarget();
    let last = 0;
    const apply = (p: number) => {
      write(pose(p, fit));
      const on = p >= LINKS_ON;
      if (on !== linksOn) {
        linksOn = on;
        links.forEach((a) => (on ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1")));
      }
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const target = readTarget();
      current += (target - current) * (1 - Math.exp(-dt * FOLLOW));
      if (Math.abs(target - current) < 0.0004) current = target;
      apply(current);
      if (current !== target) frame = window.requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (frame) return;
      last = performance.now();
      frame = window.requestAnimationFrame(tick);
    };
    const settle = () => {
      current = readTarget();
      apply(current);
    };

    const observer = new ResizeObserver(() => {
      measure();
      settle();
    });
    observer.observe(stage);
    measure();
    settle();
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      links.forEach((a) => a.removeAttribute("tabindex"));
      ["lid", "rx", "s", "tx", "ty", "cover", "copy", "cue", "scene", "off"].forEach((name) =>
        stage.style.removeProperty(`--${name}`),
      );
    };
  }, [flat]);

  return (
    <section
      ref={wrapRef}
      aria-labelledby="hero-title"
      data-mode={flat ? "flat" : "laptop"}
      className="lh-wrap"
    >
      <noscript>
        <style>{`.lh-wrap{height:auto}.lh-stage{--cover:1;--copy:1;position:relative;height:auto;min-height:min(var(--lh-h),46rem)}.lh-scene,.lh-tag,.lh-cue{display:none}`}</style>
      </noscript>
      <div ref={stageRef} className="lh-stage">
        <div className="lh-scene" aria-hidden="true">
          <div className="lh-rig">
            <div className="lh-deck">
              <Keys />
            </div>
            <div className="lh-front">
              <span className="lh-thumb" />
            </div>
            <div className="lh-hinge" />
            <div className="lh-lid">
              <div className="lh-face lh-lid-front">
                <div className="lh-bezel">
                  <div ref={screenRef} className="lh-screen">
                    <Photo />
                    <div className="lh-off" />
                    <div className="lh-notch" />
                  </div>
                </div>
              </div>
              <div className="lh-face lh-lid-back">
                <Image
                  src="/brand/5iveStack-Labs_icon_reverse.svg"
                  alt=""
                  width={512}
                  height={512}
                  className="h-auto w-[18%]"
                />
              </div>
              <div className="lh-edge lh-edge-top" />
              <div className="lh-edge lh-edge-left" />
              <div className="lh-edge lh-edge-right" />
            </div>
          </div>
        </div>

        <p aria-hidden="true" className="lh-tag px-4 font-display font-wide text-title font-semibold">
          We build what moves business forward.
        </p>
        <p aria-hidden="true" className="lh-cue text-small text-ink-muted">
          Scroll to open
        </p>

        <div className="lh-cover" aria-hidden="true">
          <Photo />
        </div>

        <div ref={contentRef} data-viewport className="lh-content">
          {children}
        </div>
      </div>
    </section>
  );
}
