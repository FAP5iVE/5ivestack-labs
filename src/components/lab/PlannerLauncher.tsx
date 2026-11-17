"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/* The planner only downloads and runs when the visitor asks for it (Lab rule, decision D-48). */
const CoveragePlanner = dynamic(() => import("./CoveragePlanner"), {
  ssr: false,
  loading: () => <p className="text-body text-ink-muted">Loading the planner.</p>,
});

export function PlannerLauncher() {
  const [open, setOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) regionRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
      >
        Open the planner
      </button>
    );
  }
  return (
    <div ref={regionRef} tabIndex={-1} className="focus:outline-none">
      <CoveragePlanner />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-8 inline-flex min-h-11 items-center rounded-control border border-ink px-6 text-body font-medium"
      >
        Close the planner
      </button>
    </div>
  );
}
