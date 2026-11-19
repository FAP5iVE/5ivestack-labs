"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { reportWebglLost, useTierState } from "@/lib/tier";

/*
  Home hero (decision D-60). A closed laptop opens as the visitor scrolls, the camera flies into
  its screen, and the screen is the hero: a photo, a flat ink veil and the headline.
  - The server HTML, Tier 0 (reduced motion, Save-Data, Simple mode, no WebGL, context lost) and
    the moment before the 3D code loads all show the same thing: the screen content as a plain
    full-width hero. Nothing here depends on JavaScript to be readable.
  - On Tier 1 and 2 the 3D rig (laptopRig.ts) is loaded after hydration. It turns this section
    into a tall runway with a sticky stage and moves the .hero-screen node into the 3D scene.
    React never re-renders that node, so moving it is safe, and the rig puts it back on teardown.
  - The screen is inert until it is fully open, so hidden links cannot be tabbed to or clicked.
*/
export function LaptopHero() {
  const { tier } = useTierState();
  const eligible = tier >= 1;

  const rootRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // The tier can step down later (frame rate monitor in the Systems scene). The hero reads the
  // tier once when it starts and is not rebuilt for a step between Tier 2 and Tier 1.
  const tierRef = useRef(tier);
  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  useEffect(() => {
    if (!eligible) return;
    const root = rootRef.current;
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const home = homeRef.current;
    const screen = screenRef.current;
    if (!root || !runway || !stage || !home || !screen) return;

    let cancelled = false;
    let rig: { destroy: () => void } | null = null;
    void import("./laptopRig").then(({ mountLaptop }) => {
      if (cancelled) return;
      rig = mountLaptop({
        root,
        runway,
        stage,
        home,
        screen,
        tier: tierRef.current === 2 ? 2 : 1,
        onContextLost: reportWebglLost,
      });
    });
    return () => {
      cancelled = true;
      rig?.destroy();
    };
  }, [eligible]);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="hero-root"
    >
      <div ref={runwayRef} className="hero-runway">
        <div ref={stageRef} data-viewport className="hero-stage">
          <div ref={homeRef} className="hero-home">
            <div ref={screenRef} className="hero-screen">
              <Image
                src="/hero/hero-sunset.webp"
                alt=""
                fill
                sizes="(orientation: portrait) 160vh, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
              <div aria-hidden className="hero-scrim" />
              <div className="hero-frame">
                <div className="grid-page w-full pb-12 pt-12 md:pb-16">
                  <div className="col-span-full lg:col-span-9">
                    <h1
                      id="hero-title"
                      className="font-display font-wide text-display font-bold"
                    >
                      We build what moves buusinesses forward
                    </h1>
                    <p className="mt-6 max-w-[var(--measure)] text-lead">{site.description}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      <a
                        href={site.emailEnquiryHref}
                        className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
                      >
                        Email us
                      </a>
                      <a
                        href={site.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-body underline underline-offset-4"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a
            href="#systems"
            className="hero-skip sr-only focus:not-sr-only focus:absolute focus:bottom-4 focus:right-4 focus:z-20 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
          >
            Skip the intro
          </a>
          <p aria-hidden className="hero-cue font-text text-small">
            <span className="mx-auto mb-2 block h-8 w-0.5 bg-orange" />
            Scroll to open
          </p>
        </div>
      </div>
    </section>
  );
}
