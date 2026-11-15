"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { reportWebglLost, useTierState } from "@/lib/tier";
import { StackSvg } from "./StackSvg";

/*
  The dark instrument viewport, used by the hero and by the Systems walk
  (decisions D-26 to D-28, D-36).
  - Tier 0 (and while loading, and after any WebGL failure): the static SVG.
  - Tier 1 and 2: the WebGL scene, loaded lazily AFTER hydration and only once the
    viewport has first come near the screen, so a second instance further down the
    page costs nothing until it is needed. The SVG fades out once the canvas is ready.
  - Rendering pauses while the viewport is off screen.
  - A render error or a lost WebGL context drops the visitor to Tier 0.
  Props:
    mode  "hero" scrolls and tilts; "walk" keeps layers separated and highlights `focus`.
    focus layer level 1 to 5 to highlight (walk mode); 0 for none.
    className sizing classes for the box (default is a 16:15 box).
*/

const StackScene = dynamic(() => import("./StackScene"), { ssr: false });

class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function StackViewport({
  mode = "hero",
  focus = 0,
  className = "aspect-[16/15] w-full",
}: {
  mode?: "hero" | "walk";
  focus?: number;
  className?: string;
}) {
  const { tier } = useTierState();
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [everVisible, setEverVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    // Without IntersectionObserver (very old browsers) the visitor simply keeps the SVG.
    if (!host || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? true;
        setVisible(inView);
        if (inView) setEverVisible(true);
      },
      { rootMargin: "100px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const webgl = tier >= 1;
  const svgHidden = webgl && everVisible && ready;

  return (
    <div
      ref={hostRef}
      data-viewport
      data-tier-view={webgl ? "webgl" : "svg"}
      className={`relative overflow-hidden bg-ink ${className}`}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${svgHidden ? "opacity-0" : "opacity-100"}`}
      >
        <StackSvg focus={focus} />
      </div>
      {webgl && everVisible ? (
        <SceneBoundary onError={reportWebglLost}>
          <StackScene
            key={tier}
            tier={tier === 2 ? 2 : 1}
            active={visible}
            mode={mode}
            focus={focus}
            onReady={() => setReady(true)}
          />
        </SceneBoundary>
      ) : null}
    </div>
  );
}
