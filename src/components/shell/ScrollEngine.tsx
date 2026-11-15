"use client";

import { useEffect } from "react";
import { registerLenis } from "@/lib/scroll";
import { useTierState } from "@/lib/tier";

/*
  Scroll lifecycle (decisions D-17, D-19). Renders nothing.
  - Always: writes page progress (0 to 1) into the CSS variable --page-progress.
    No React state, so scrolling never re-renders anything.
      Tier 0: a plain passive scroll listener (no GSAP is downloaded).
      Tier 1+: GSAP ScrollTrigger.
  - Only on fine-pointer devices at Tier 1+: Lenis smooths wheel scrolling and
    is driven by the GSAP ticker so ScrollTrigger and (later) WebGL share one
    clock. Touch scrolling is always native.
  GSAP and Lenis are loaded with dynamic import() after hydration to keep the
  first-load JavaScript small.
*/
export function ScrollEngine() {
  const { tier, finePointer } = useTierState();
  const smooth = tier >= 1 && finePointer;

  // Tier 0 progress: native listener.
  useEffect(() => {
    if (tier !== 0) return;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      root.style.setProperty("--page-progress", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tier]);

  // Tier 1+ progress: ScrollTrigger.
  useEffect(() => {
    if (tier === 0) return;
    let cancelled = false;
    let teardown = () => {};
    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      // Phone address bars resize the viewport while scrolling; do not refresh on that.
      ScrollTrigger.config({ ignoreMobileResize: true });
      const root = document.documentElement;
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          root.style.setProperty("--page-progress", self.progress.toFixed(4));
        },
      });
      teardown = () => trigger.kill();
    })();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [tier]);

  // Lenis, driven by the GSAP ticker.
  useEffect(() => {
    if (!smooth) return;
    let cancelled = false;
    let teardown = () => {};
    void (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      // Anchor links must stop below the sticky header. Measured once at start.
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const lenis = new Lenis({
        autoRaf: false, // GSAP's ticker drives it
        smoothWheel: true,
        syncTouch: false, // touch stays native
        anchors: { offset: -headerHeight },
      });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      registerLenis(lenis);
      teardown = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33); // restore GSAP's defaults
        registerLenis(null);
        lenis.destroy();
      };
    })();
    return () => {
      cancelled = true;
      teardown();
    };
  }, [smooth]);

  return null;
}
