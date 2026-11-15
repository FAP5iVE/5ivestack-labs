"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { reportWebglLost, useTierState } from "@/lib/tier";
import { StackSvg } from "./StackSvg";

/*
  The dark instrument viewport (decisions D-26 to D-29).
  - Tier 0 (and while loading, and after any WebGL failure): the static SVG.
  - Tier 1 and 2: the WebGL scene, loaded lazily AFTER hydration so the headline
    and call to action paint first. The SVG fades out once the canvas is ready.
  - Rendering pauses while the viewport is off screen.
  - A render error or a lost WebGL context drops the visitor to Tier 0.
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

export function StackViewport() {
  const { tier } = useTierState();
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "100px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const webgl = tier >= 1;
  const svgHidden = webgl && ready;

  return (
    <div
      ref={hostRef}
      data-viewport
      data-tier-view={webgl ? "webgl" : "svg"}
      className="relative aspect-[16/15] w-full overflow-hidden bg-ink"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${svgHidden ? "opacity-0" : "opacity-100"}`}
      >
        <StackSvg />
      </div>
      {webgl ? (
        <SceneBoundary onError={reportWebglLost}>
          <StackScene
            key={tier}
            tier={tier === 2 ? 2 : 1}
            active={visible}
            onReady={() => setReady(true)}
          />
        </SceneBoundary>
      ) : null}
    </div>
  );
}
