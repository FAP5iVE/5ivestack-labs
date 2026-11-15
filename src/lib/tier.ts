"use client";

/*
  Rendering tier and Simple mode (plan section 5, decisions D-18).
    Tier 0: SVG only, no WebGL, no smooth scroll. Used for reduced motion,
            Save-Data, no WebGL, WebGL context lost, Simple mode, or after
            repeated step-downs.
    Tier 1: phones and mid-range devices (light WebGL, built in M2).
    Tier 2: capable desktops (full WebGL, built in M2).
  The server and the first client render always report Tier 0, so server HTML
  and hydration match. Real values arrive right after mount.
*/

import { useSyncExternalStore } from "react";

export type Tier = 0 | 1 | 2;

export type TierState = {
  tier: Tier;
  simple: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  webgl: boolean;
  finePointer: boolean;
};

const SERVER_STATE: TierState = {
  tier: 0,
  simple: false,
  reducedMotion: false,
  saveData: false,
  webgl: false,
  finePointer: false,
};

const STORAGE_KEY = "5ive:simple-mode";
const QUERIES = [
  "(prefers-reduced-motion: reduce)",
  "(pointer: fine) and (hover: hover)",
  "(min-width: 64rem)",
] as const;

let state: TierState = SERVER_STATE;
let started = false;
let ceiling: Tier = 2; // lowered at runtime by stepDownTier()
let webglOk: boolean | null = null;
const listeners = new Set<() => void>();

function readSimple(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // storage can be blocked; treat as off
  }
}

function writeSimple(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the choice lasts until reload only.
  }
}

// Probe once, then release the context immediately: browsers cap open WebGL contexts.
function detectWebgl(): boolean {
  if (webglOk !== null) return webglOk;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglOk = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglOk = false;
  }
  return webglOk;
}

function compute(): TierState {
  const reducedMotion = window.matchMedia(QUERIES[0]).matches;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  const saveData = connection?.saveData === true;
  const simple = readSimple();
  const webgl = detectWebgl();
  const finePointer = window.matchMedia(QUERIES[1]).matches;
  const wide = window.matchMedia(QUERIES[2]).matches;
  const cores = navigator.hardwareConcurrency || 4;

  let tier: Tier = 1;
  if (simple || reducedMotion || saveData || !webgl) tier = 0;
  else if (finePointer && wide && cores >= 4) tier = 2;

  return {
    tier: Math.min(tier, ceiling) as Tier,
    simple,
    reducedMotion,
    saveData,
    webgl,
    finePointer,
  };
}

function publish(next: TierState): void {
  const keys = Object.keys(next) as (keyof TierState)[];
  if (keys.every((k) => next[k] === state[k])) return;
  state = next;
  // Hooks for CSS and debugging: html[data-tier="0|1|2"], html[data-simple="true|false"]
  const root = document.documentElement;
  root.dataset.tier = String(next.tier);
  root.dataset.simple = String(next.simple);
  listeners.forEach((listener) => listener());
}

function recompute(): void {
  publish(compute());
}

function start(): void {
  if (started) return;
  started = true;
  QUERIES.forEach((q) => window.matchMedia(q).addEventListener("change", recompute));
  window.addEventListener("storage", recompute); // Simple mode changed in another tab
  recompute();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

/** Turn Simple mode on or off. Turning it off also clears runtime step-downs. */
export function setSimpleMode(on: boolean): void {
  writeSimple(on);
  if (!on) ceiling = 2;
  recompute();
}

/** Call when frame rate stays low (M2 performance monitor). Never steps back up on its own. */
export function stepDownTier(): void {
  if (state.tier === 0) return;
  ceiling = Math.max(0, state.tier - 1) as Tier;
  recompute();
}

/** Call from the WebGL context-lost handler (M2). Drops to Tier 0 for the session. */
export function reportWebglLost(): void {
  webglOk = false;
  recompute();
}

export function useTierState(): TierState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
