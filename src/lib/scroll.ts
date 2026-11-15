import type Lenis from "lenis";

/*
  Holds the single Lenis instance (when one exists) so other components can
  pause it, for example while the command palette is open. Lenis only exists
  on fine-pointer devices at Tier 1 or 2; everywhere else these are no-ops.
*/

let instance: Lenis | null = null;
let locks = 0;

export function registerLenis(next: Lenis | null): void {
  instance = next;
  if (next && locks > 0) next.stop();
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Pause smooth scrolling. Returns a function that releases this lock. Locks stack. */
export function lockScroll(): () => void {
  locks += 1;
  instance?.stop();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) instance?.start();
  };
}
