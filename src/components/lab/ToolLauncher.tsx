"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/*
  Opens a Lab tool on demand (decisions D-48, D-50, D-54). Each tool is its own lazily loaded
  chunk, so nothing downloads or runs until the visitor presses the button.
*/
const loading = () => <p className="text-body text-ink-muted">Loading.</p>;
const tools = {
  planner: dynamic(() => import("./CoveragePlanner"), { ssr: false, loading }),
  scope: dynamic(() => import("./SignalScope"), { ssr: false, loading }),
  link: dynamic(() => import("./LinkReliability"), { ssr: false, loading }),
  capacity: dynamic(() => import("./CapacityPlanner"), { ssr: false, loading }),
  readability: dynamic(() => import("./ReadabilityCheck"), { ssr: false, loading }),
  code: dynamic(() => import("./CodeLab"), { ssr: false, loading }),
};

export function ToolLauncher({
  tool,
  openLabel,
  closeLabel,
}: {
  tool: keyof typeof tools;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const Tool = tools[tool];

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
        {openLabel}
      </button>
    );
  }
  return (
    <div ref={regionRef} tabIndex={-1} className="focus:outline-none">
      <Tool />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-8 inline-flex min-h-11 items-center rounded-control border border-ink px-6 text-body font-medium"
      >
        {closeLabel}
      </button>
    </div>
  );
}
