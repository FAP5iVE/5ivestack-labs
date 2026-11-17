"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

/*
  CCTV coverage planner (Lab, decision D-48). A simplified 2D estimate of what
  cameras can see in one room. Everything runs in the browser; nothing is sent
  anywhere and nothing is stored.
  Model: a camera sees a point if the point is within its range, inside its field
  of view, and no wall blocks the straight line between them. The room is sampled
  on a 0.25 m grid. It ignores lens quality, lighting, height, furniture and
  people, so it is a teaching tool, not a design or a quote.
  Camera handles are real buttons laid over the canvas (44px targets, arrow keys
  move them, touch-action only disabled on the handles) so the page still scrolls
  everywhere else.
*/

type Pt = readonly [number, number];
type Camera = { id: number; x: number; y: number; angle: number; fov: number; range: number };

const ROOM_W = 12; // metres
const ROOM_H = 8;
const CELL = 0.25;
const MAX_CAMERAS = 4;

// Outer walls (drawn) and a partition with a 2 m doorway (blocks sight).
const OUTER: readonly [Pt, Pt][] = [
  [[0, 0], [ROOM_W, 0]],
  [[ROOM_W, 0], [ROOM_W, ROOM_H]],
  [[ROOM_W, ROOM_H], [0, ROOM_H]],
  [[0, ROOM_H], [0, 0]],
];
const PARTITION: readonly [Pt, Pt][] = [
  [[7, 0], [7, 3]],
  [[7, 5], [7, 8]],
];

function cross(a: Pt, b: Pt, c: Pt): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

// True when segment p1-p2 properly crosses segment p3-p4.
function crosses(p1: Pt, p2: Pt, p3: Pt, p4: Pt): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function sees(cam: Camera, px: number, py: number): boolean {
  const dx = px - cam.x;
  const dy = py - cam.y;
  if (dx * dx + dy * dy > cam.range * cam.range) return false;
  const bearing = (Math.atan2(dy, dx) * 180) / Math.PI;
  const delta = ((bearing - cam.angle + 540) % 360) - 180;
  if (Math.abs(delta) > cam.fov / 2) return false;
  const from: Pt = [cam.x, cam.y];
  const to: Pt = [px, py];
  return !PARTITION.some(([a, b]) => crosses(from, to, a, b));
}

const COLS = Math.round(ROOM_W / CELL);
const ROWS = Math.round(ROOM_H / CELL);

function computeCoverage(cameras: readonly Camera[]): { counts: Uint8Array; percent: number } {
  const counts = new Uint8Array(COLS * ROWS);
  let covered = 0;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const px = (col + 0.5) * CELL;
      const py = (row + 0.5) * CELL;
      let n = 0;
      for (const cam of cameras) if (sees(cam, px, py)) n += 1;
      counts[row * COLS + col] = n;
      if (n > 0) covered += 1;
    }
  }
  return { counts, percent: Math.round((covered / (COLS * ROWS)) * 100) };
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}

function rgba(hex: string, alpha: number): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const buttonClass =
  "inline-flex min-h-11 items-center rounded-control border border-ink px-4 text-body font-medium disabled:opacity-50";
const sliderRow = "grid grid-cols-[7rem_1fr_4rem] items-center gap-4 border-t border-rule py-2";

export default function CoveragePlanner() {
  const [cameras, setCameras] = useState<Camera[]>([
    { id: 1, x: 1.5, y: 1.5, angle: 35, fov: 90, range: 10 },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [width, setWidth] = useState(0);
  const nextId = useRef(2);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ id: number } | null>(null);

  const selected = cameras.find((c) => c.id === selectedId) ?? cameras[0];
  const { counts, percent } = useMemo(() => computeCoverage(cameras), [cameras]);

  // Track the box width so the plan always fits the screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Draw the plan.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const scale = width / ROOM_W; // pixels per metre
    const height = Math.round(scale * ROOM_H);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ink = token("ink");
    const paper = token("paper");
    const sky = token("sky");
    const orange = token("orange");

    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const n = counts[row * COLS + col] ?? 0;
        if (n === 0) continue;
        ctx.fillStyle = rgba(sky, n === 1 ? 0.3 : 0.55);
        ctx.fillRect(col * CELL * scale, row * CELL * scale, CELL * scale + 0.5, CELL * scale + 0.5);
      }
    }

    ctx.strokeStyle = paper;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const [a, b] of [...OUTER, ...PARTITION]) {
      ctx.beginPath();
      ctx.moveTo(a[0] * scale, a[1] * scale);
      ctx.lineTo(b[0] * scale, b[1] * scale);
      ctx.stroke();
    }

    if (selected) {
      const half = (selected.fov / 2) * (Math.PI / 180);
      const a = (selected.angle * Math.PI) / 180;
      ctx.strokeStyle = orange;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(selected.x * scale, selected.y * scale);
      ctx.arc(selected.x * scale, selected.y * scale, selected.range * scale, a - half, a + half);
      ctx.closePath();
      ctx.stroke();
    }
  }, [width, counts, selected]);

  const update = useCallback((id: number, patch: Partial<Camera>) => {
    setCameras((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  function moveTo(id: number, event: PointerEvent<HTMLButtonElement>) {
    const box = boxRef.current;
    if (!box || width === 0) return;
    const rect = box.getBoundingClientRect();
    const scale = width / ROOM_W;
    update(id, {
      x: clamp((event.clientX - rect.left) / scale, 0.3, ROOM_W - 0.3),
      y: clamp((event.clientY - rect.top) / scale, 0.3, ROOM_H - 0.3),
    });
  }

  function onKeyDown(camera: Camera, event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 1 : 0.25;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    update(camera.id, {
      x: clamp(camera.x + move[0], 0.3, ROOM_W - 0.3),
      y: clamp(camera.y + move[1], 0.3, ROOM_H - 0.3),
    });
  }

  function addCamera() {
    if (cameras.length >= MAX_CAMERAS) return;
    const id = nextId.current;
    nextId.current += 1;
    setCameras((list) => [...list, { id, x: 10.5, y: 6.5, angle: 215, fov: 90, range: 10 }]);
    setSelectedId(id);
  }

  function removeCamera() {
    if (cameras.length <= 1 || !selected) return;
    const rest = cameras.filter((c) => c.id !== selected.id);
    setCameras(rest);
    setSelectedId(rest[0]?.id ?? 1);
  }

  const scale = width > 0 ? width / ROOM_W : 0;

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        Drag the numbered camera markers around the room, or focus one and use the arrow keys (hold
        Shift for bigger steps). The wall in the middle blocks sight, with a 2 metre doorway.
      </p>

      <div ref={boxRef} data-viewport className="relative mt-6 w-full overflow-hidden bg-ink">
        <canvas ref={canvasRef} role="img" aria-label="Floor plan of a room showing what the cameras can see" className="block w-full" />
        {scale > 0
          ? cameras.map((camera, index) => (
              <button
                key={camera.id}
                type="button"
                aria-label={`Camera ${index + 1}, ${camera.id === selectedId ? "selected, " : ""}use arrow keys to move`}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = { id: camera.id };
                  setSelectedId(camera.id);
                }}
                onPointerMove={(event) => {
                  if (drag.current?.id === camera.id) moveTo(camera.id, event);
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={(event) => onKeyDown(camera, event)}
                onFocus={() => setSelectedId(camera.id)}
                className="absolute flex h-11 w-11 items-center justify-center"
                style={{
                  left: camera.x * scale,
                  top: camera.y * scale,
                  transform: "translate(-50%, -50%)",
                  touchAction: "none", // only the handles capture touch; the rest of the page scrolls
                }}
              >
                <span
                  aria-hidden
                  className={`flex h-7 w-7 items-center justify-center border-2 border-ink font-mono text-small font-medium text-ink ${
                    camera.id === selectedId ? "bg-orange" : "bg-paper"
                  }`}
                  style={{ borderRadius: "50%" }} // circular map-pin handle, not a UI card
                >
                  {index + 1}
                </span>
              </button>
            ))
          : null}
      </div>

      <p role="status" aria-live="polite" className="mt-4 text-body font-medium">
        Coverage: {percent}% of the room, with {cameras.length}{" "}
        {cameras.length === 1 ? "camera" : "cameras"}.
      </p>

      <div className="mt-6 grid gap-x-8 md:grid-cols-2">
        <fieldset>
          <legend className="text-body font-medium">Cameras</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {cameras.map((camera, index) => (
              <button
                key={camera.id}
                type="button"
                aria-pressed={camera.id === selectedId}
                onClick={() => setSelectedId(camera.id)}
                className={`${buttonClass} ${camera.id === selectedId ? "bg-ink text-paper" : ""}`}
              >
                Camera {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <button type="button" className={buttonClass} onClick={addCamera} disabled={cameras.length >= MAX_CAMERAS}>
              Add camera
            </button>
            <button type="button" className={buttonClass} onClick={removeCamera} disabled={cameras.length <= 1}>
              Remove selected
            </button>
          </div>
        </fieldset>

        {selected ? (
          <div className="mt-6 md:mt-0">
            <div className={sliderRow}>
              <label htmlFor="cam-angle" className="text-body">Direction</label>
              <input id="cam-angle" type="range" min={0} max={359} step={1} value={selected.angle}
                onChange={(e) => update(selected.id, { angle: Number(e.target.value) })}
                className="h-11 w-full accent-ink" />
              <output htmlFor="cam-angle" className="font-mono text-small tabular-nums">{selected.angle}°</output>
            </div>
            <div className={sliderRow}>
              <label htmlFor="cam-fov" className="text-body">Field of view</label>
              <input id="cam-fov" type="range" min={40} max={120} step={5} value={selected.fov}
                onChange={(e) => update(selected.id, { fov: Number(e.target.value) })}
                className="h-11 w-full accent-ink" />
              <output htmlFor="cam-fov" className="font-mono text-small tabular-nums">{selected.fov}°</output>
            </div>
            <div className={`${sliderRow} border-b`}>
              <label htmlFor="cam-range" className="text-body">Range</label>
              <input id="cam-range" type="range" min={3} max={20} step={1} value={selected.range}
                onChange={(e) => update(selected.id, { range: Number(e.target.value) })}
                className="h-11 w-full accent-ink" />
              <output htmlFor="cam-range" className="font-mono text-small tabular-nums">{selected.range} m</output>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
