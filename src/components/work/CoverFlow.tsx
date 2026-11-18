"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import type { WorkImage } from "@/content/work";
import { useTierState } from "@/lib/tier";

/*
  Work screenshots as a curved 3D ribbon (decision D-53). The centre screenshot faces
  the viewer; the ones either side curve away along an outward arc and tuck behind it
  (CSS 3D transforms plus z-index depth, no libraries; the maths is in globals.css under
  .flow-card). Browse by swiping or dragging sideways, with the arrow keys, by pressing a
  side screenshot, or with the Previous and Next buttons.
  Vertical swipes still scroll the page (touch-action: pan-y on the stage).
  Tier 0 (Simple mode, reduced motion, Save-Data, no WebGL) and visitors without
  JavaScript get the plain swipeable strip instead, because Simple mode promises no 3D.
*/

const DRAG_START_PX = 8; // movement before a press counts as a drag
const SWIPE_PX = 40; // sideways distance that changes the screenshot
const VISIBLE_RANGE = 2; // screenshots this far from the centre stay visible

const navButton =
  "inline-flex min-h-11 items-center rounded-control border border-ink px-4 text-body font-medium aria-disabled:border-rule aria-disabled:text-ink-muted";

type Props = { name: string; images: readonly WorkImage[] };

function FlatStrip({ name, images }: Props) {
  return (
    <>
      <ul
        tabIndex={0}
        aria-label={`${name} screenshots`}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0"
      >
        {images.map((image) => (
          <li key={image.src} className="w-[85%] shrink-0 snap-start lg:w-auto">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 28rem, 85vw"
              className="h-auto w-full border border-rule"
            />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-small text-ink-muted lg:hidden">Swipe to see more screens.</p>
    </>
  );
}

function Flow({ name, images }: Props) {
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const count = images.length;

  const goTo = (index: number) => setActive(Math.min(count - 1, Math.max(0, index)));

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    suppressClick.current = false;
    drag.current = { x: e.clientX, moved: false };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.moved) return;
    if (Math.abs(e.clientX - d.x) > DRAG_START_PX) {
      d.moved = true;
      // Capture only once it is a real drag, so a plain press still reaches the buttons.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) suppressClick.current = true;
    const dx = e.clientX - d.x;
    if (dx <= -SWIPE_PX) goTo(active + 1);
    else if (dx >= SWIPE_PX) goTo(active - 1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target =
      e.key === "ArrowRight" ? active + 1 : e.key === "ArrowLeft" ? active - 1 : e.key === "Home" ? 0 : e.key === "End" ? count - 1 : null;
    if (target === null) return;
    e.preventDefault();
    goTo(target);
  }

  const current = images[active];

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} screenshots`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        className="flow-stage"
      >
        <ul className="flow-list">
          {images.map((image, i) => {
            const offset = i - active;
            const distance = Math.abs(offset);
            const style = { "--o": offset, "--ad": distance } as CSSProperties;
            const picture = (
              <Image
                src={image.src}
                alt={offset === 0 ? image.alt : ""}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 28rem, 70vw"
                draggable={false}
                className="block h-auto w-full border border-rule"
              />
            );
            return (
              <li
                key={image.src}
                className="flow-card"
                style={style}
                data-hidden={distance > VISIBLE_RANGE}
              >
                {offset === 0 ? (
                  picture
                ) : (
                  <button
                    type="button"
                    aria-label={`Show screen ${i + 1} of ${count}`}
                    onClick={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                      }
                      goTo(i);
                    }}
                    className="block w-full cursor-pointer"
                  >
                    {picture}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p role="status" className="text-small text-ink-muted">
          Screen {active + 1} of {count}
          <span className="sr-only">: {current?.alt}</span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            aria-disabled={active === 0}
            onClick={() => goTo(active - 1)}
            className={navButton}
          >
            Previous<span className="sr-only"> screen</span>
          </button>
          <button
            type="button"
            aria-disabled={active === count - 1}
            onClick={() => goTo(active + 1)}
            className={navButton}
          >
            Next<span className="sr-only"> screen</span>
          </button>
        </div>
      </div>
      <p className="mt-2 text-small text-ink-muted">
        Swipe or drag sideways, or use the arrow keys.
      </p>
    </div>
  );
}

export function CoverFlow(props: Props) {
  const { tier } = useTierState();
  return tier === 0 ? <FlatStrip {...props} /> : <Flow {...props} />;
}
