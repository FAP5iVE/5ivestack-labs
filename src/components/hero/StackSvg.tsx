import { layers } from "@/content/layers";

/*
  Static SVG version of the five-layer stack. It is the whole hero visual on Tier 0
  (reduced motion, Save-Data, no WebGL, Simple mode) and the placeholder while the
  WebGL scene loads. Purely decorative: the text list on the page is the accessible
  equivalent, so this is aria-hidden. Lines stay a constant 1.5px wide.

  Geometry: each slab is an isometric rhombus. (u, v) are coordinates on its top
  face, both 0 to 1; (0,0) is the back vertex and (1,1) is the front vertex.
*/

const VIEW_W = 640;
const VIEW_H = 600;
const CX = 320; // horizontal centre
const A = 170; // half width of a top face
const B = 68; // half height of a top face
const T = 12; // slab thickness
const GAP = 100; // vertical distance between layers

type Pt = [number, number];
type Seg = { pts: Pt[]; signal?: boolean; heavy?: boolean };

const centreY = (level: number) => 90 + (5 - level) * GAP; // L5 at the top, L1 at the bottom

function point(y: number, u: number, v: number): string {
  const x = CX + (u - v) * A;
  const py = y + (u + v - 1) * B;
  return `${x.toFixed(1)} ${py.toFixed(1)}`;
}

function path(y: number, pts: Pt[]): string {
  return pts.map(([u, v], i) => `${i === 0 ? "M" : "L"}${point(y, u, v)}`).join(" ");
}

const rect = (u0: number, v0: number, u1: number, v1: number): Pt[] => [
  [u0, v0],
  [u1, v0],
  [u1, v1],
  [u0, v1],
  [u0, v0],
];

function pattern(mode: number): Seg[] {
  switch (mode) {
    case 0: // traces
      return [
        { pts: [[0.1, 0.25], [0.5, 0.25], [0.5, 0.7], [0.9, 0.7]], signal: true },
        { pts: [[0.1, 0.55], [0.3, 0.55], [0.3, 0.9]] },
        { pts: [[0.55, 0.1], [0.7, 0.1], [0.7, 0.4], [0.9, 0.4]] },
        { pts: [[0.15, 0.85], [0.45, 0.85]] },
      ];
    case 1: { // chip with pins
      const pins: Seg[] = [];
      for (const k of [0.4, 0.5, 0.6]) {
        pins.push({ pts: [[k, 0.3], [k, 0.35]] });
        pins.push({ pts: [[k, 0.65], [k, 0.7]] });
        pins.push({ pts: [[0.3, k], [0.35, k]] });
        pins.push({ pts: [[0.65, k], [0.7, k]] });
      }
      return [
        { pts: rect(0.35, 0.35, 0.65, 0.65) },
        ...pins,
        { pts: [[0.08, 0.5], [0.3, 0.5]], signal: true },
      ];
    }
    case 2: { // lattice
      const grid: Seg[] = [];
      for (const k of [0.25, 0.5, 0.75]) {
        grid.push({ pts: [[k, 0], [k, 1]] });
        grid.push({ pts: [[0, k], [1, k]] });
      }
      return [...grid, { pts: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], signal: true }];
    }
    case 3: { // code lines
      const rows = [0.15, 0.28, 0.41, 0.54, 0.67, 0.8];
      const starts = [0.1, 0.18, 0.18, 0.1, 0.26, 0.1];
      const lens = [0.5, 0.3, 0.6, 0.25, 0.45, 0.35];
      const bars: Seg[] = rows.map((v, i) => ({
        pts: [[starts[i] ?? 0.1, v], [(starts[i] ?? 0.1) + (lens[i] ?? 0.3), v]] as Pt[],
      }));
      return [...bars, { pts: [[0.37, 0.54], [0.41, 0.54]], signal: true, heavy: true }];
    }
    default: // interface wireframe
      return [
        { pts: rect(0.1, 0.1, 0.9, 0.9) },
        { pts: [[0.1, 0.78], [0.9, 0.78]] },
        { pts: [[0.35, 0.78], [0.35, 0.1]] },
        { pts: rect(0.45, 0.45, 0.85, 0.68) },
        { pts: [[0.62, 0.2], [0.82, 0.2]], signal: true, heavy: true },
      ];
  }
}

/** `focus` is a layer level (1 to 5) to highlight in the Systems walk; 0 shows all layers equally. */
export function StackSvg({ focus = 0 }: { focus?: number }) {
  const ordered = [...layers].sort((a, b) => a.level - b.level);
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 h-full w-full"
    >
      {ordered.map((layer) => {
        const y = centreY(layer.level);
        const top = `M${CX} ${y - B} L${CX + A} ${y} L${CX} ${y + B} L${CX - A} ${y} Z`;
        const left = `M${CX - A} ${y} L${CX} ${y + B} L${CX} ${y + B + T} L${CX - A} ${y + T} Z`;
        const right = `M${CX + A} ${y} L${CX} ${y + B} L${CX} ${y + B + T} L${CX + A} ${y + T} Z`;
        const isActive = focus === layer.level;
        const dimmed = focus > 0 && !isActive;
        return (
          <g
            key={layer.level}
            style={{
              opacity: dimmed ? 0.3 : 1,
              transform: `translateY(${isActive ? -14 : 0}px)`,
              transition: "opacity 400ms, transform 400ms",
            }}
          >
            <path d={left} className="fill-ink stroke-paper" strokeOpacity={0.6} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <path d={right} className="fill-ink stroke-paper" strokeOpacity={0.6} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <path d={top} className="fill-ink stroke-paper" strokeOpacity={0.8} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            {pattern(layer.mode).map((seg, i) => (
              <path
                key={i}
                d={path(y, seg.pts)}
                fill="none"
                className={seg.signal ? "stroke-orange" : "stroke-sky"}
                strokeOpacity={seg.signal ? 1 : 0.6}
                strokeWidth={seg.heavy ? 3 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {layer.level < 5 ? (
              // The signal bus rises from this layer's front corner to the layer above.
              <path
                d={`M${CX} ${y + B} L${CX} ${y - GAP + B + T}`}
                fill="none"
                className="stroke-orange"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
