"use client";

import { setSimpleMode, useTierState } from "@/lib/tier";

/* Visible control for Tier 0: a plain page with no 3D and no smooth scrolling. */
export function SimpleModeToggle() {
  const { simple } = useTierState();
  return (
    <div>
      <button
        type="button"
        aria-pressed={simple}
        aria-describedby="simple-mode-help"
        onClick={() => setSimpleMode(!simple)}
        className="inline-flex min-h-11 items-center gap-3 rounded-control border border-ink px-4 text-body font-medium"
      >
        <span>Simple mode</span>
        <span aria-hidden className="font-mono text-small">
          {simple ? "On" : "Off"}
        </span>
      </button>
      <p id="simple-mode-help" className="mt-2 text-small text-ink-muted">
        A plain page with no 3D and no smooth scrolling.
      </p>
    </div>
  );
}
