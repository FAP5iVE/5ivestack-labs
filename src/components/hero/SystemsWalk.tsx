"use client";

import { useEffect, useRef, useState } from "react";
import { consultation, layers } from "@/content/layers";
import { StackViewport } from "./StackViewport";

/*
  Systems walk (decision D-36). A dark viewport stays in view (CSS sticky, no
  ScrollTrigger pinning, so phones keep native scrolling) while the text beside
  or below it walks up the five layers from hardware (L1) to the app (L5). An
  IntersectionObserver notices which step is crossing a line near the middle of
  the screen and tells the viewport which layer to highlight. The orange marker
  shows the active step. All the text is real HTML, so the section reads fully
  without the graphic.
*/

const walkOrder = [...layers].sort((a, b) => a.level - b.level);

export function SystemsWalk() {
  // 0 means no layer is highlighted (before the first step or on the consultation row).
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // A 1% tall band 60% of the way down the screen decides the active step.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.level ?? 0));
          }
        }
      },
      { rootMargin: "-60% 0px -39% 0px" },
    );
    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const stepClass = "relative border-t border-rule py-8 pl-6 lg:min-h-[28rem]";

  return (
    <section
      id="systems"
      aria-labelledby="systems-title"
      className="border-t border-rule pt-16"
    >
      <div className="grid-page">
        <div className="col-span-full">
          <h2 id="systems-title" className="font-display text-headline font-semibold">
            Five layers, one team
          </h2>
          <p className="mt-4 max-w-[var(--measure)] text-body text-ink-muted">
            Follow the signal from the hardware at the bottom up to the app at the top.
          </p>
        </div>

        <div className="col-span-full mt-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="sticky top-[calc(var(--header-h)+var(--safe-top))] z-10 bg-paper pb-4 lg:top-[calc(var(--header-h)+var(--safe-top)+1rem)] lg:col-span-6 lg:self-start lg:pb-0">
            <StackViewport
              mode="walk"
              focus={active}
              className="h-[38svh] min-h-64 w-full lg:aspect-[16/15] lg:h-auto"
            />
          </div>

          <ol className="lg:col-span-6">
            {walkOrder.map((layer, i) => (
              <li
                key={layer.level}
                data-level={layer.level}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={stepClass}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-8 h-8 w-0.5 origin-top bg-orange transition-transform duration-300 ${active === layer.level ? "scale-y-100" : "scale-y-0"}`}
                />
                <p>
                  <span className="block font-mono text-small tabular-nums text-ink-muted">
                    L{layer.level}
                  </span>
                  <span className="block text-body font-medium">{layer.value}</span>
                </p>
                <h3 className="mt-4 font-display text-title font-semibold">{layer.name}</h3>
                <p className="mt-2 max-w-[var(--measure)] text-body text-ink-muted">
                  {layer.summary}
                </p>
                <ul className="mt-4">
                  {layer.services.map((service) => (
                    <li key={service} className="border-t border-rule py-2 text-body">
                      {service}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li
              data-level={0}
              ref={(el) => {
                stepRefs.current[walkOrder.length] = el;
              }}
              className={`${stepClass} border-b border-rule`}
            >
              <p className="text-body font-medium">{consultation.label}</p>
              <h3 className="mt-4 font-display text-title font-semibold">
                {consultation.name}
              </h3>
              <p className="mt-2 max-w-[var(--measure)] text-body text-ink-muted">
                {consultation.summary}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
