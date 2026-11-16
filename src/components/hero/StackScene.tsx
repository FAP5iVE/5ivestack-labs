"use client";

/*
  WebGL version of the five-layer stack (decisions D-26 to D-29).
  Loaded lazily by StackViewport, only on Tier 1 and 2. Everything here is
  procedural: no model files, no textures, no postprocessing, no glow.
  Per-frame work only mutates refs and shader uniforms. Nothing calls setState
  inside the frame loop.
*/

import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { layers } from "@/content/layers";
import { reportWebglLost, stepDownTier } from "@/lib/tier";

type Rig = {
  assemble: number; // 0 to 1, load animation
  explode: number; // 0 to 1, scroll through the first screen
  px: number; // pointer, -1 to 1 (Tier 2 hero only)
  py: number;
  focus: number; // layer level 1 to 5 to highlight, 0 for none (Systems walk)
};

type Colors = { ink: THREE.Color; paper: THREE.Color; sky: THREE.Color; orange: THREE.Color };

// Colours come from the CSS tokens so there is one source of truth.
function readToken(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim();
  return new THREE.Color(raw || "#ffffff");
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Derivative-based anti-aliasing (fwidth) must run in uniform control flow, so every
// stroke() below is evaluated unconditionally and results are combined with step().
const FRAG = /* glsl */ `
uniform float uMode;
uniform float uTime;
uniform float uSeed;
uniform float uReveal;
uniform float uDim;
uniform vec3 uSky;
uniform vec3 uOrange;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float stroke(float d, float w) {
  float aa = fwidth(d);
  return 1.0 - smoothstep(w - aa, w + aa, abs(d));
}

float fillShape(float d) {
  float aa = fwidth(d);
  return 1.0 - smoothstep(-aa, aa, d);
}

float sdBox(vec2 p, vec2 b) {
  vec2 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// Mode 0: circuit traces with packets of signal
void traces(vec2 uv, out float body, out float sig) {
  vec2 g = uv * 14.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id + uSeed);
  float w = 0.05;
  float sH = stroke(f.y, w);
  float sV = stroke(f.x, w);
  float cornerA = sH * (1.0 - step(0.0, f.x));
  float cornerB = sV * (1.0 - step(0.0, f.y));
  float pad = 1.0 - smoothstep(0.14, 0.18, length(f));
  float isH = 1.0 - step(0.3, h);
  float isV = step(0.3, h) * (1.0 - step(0.6, h));
  float isC = step(0.6, h) * (1.0 - step(0.8, h));
  float isP = step(0.93, h);
  float ink = isH * sH + isV * sV + isC * max(cornerA, cornerB) + isP * pad;
  float horizontal = max(isH, isC);
  float along = mix(f.y + 0.5, f.x + 0.5, horizontal);
  float t = fract(uTime * 0.35 + h * 9.0);
  float packet = 1.0 - smoothstep(0.0, 0.2, abs(along - t));
  float carries = step(0.82, hash(id.yx + uSeed + 3.1));
  body = ink;
  sig = ink * packet * carries;
}

// Mode 1: chips with pins
void chip(vec2 uv, out float body, out float sig) {
  vec2 g = uv * 4.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float r = max(abs(f.x), abs(f.y));
  float outline = stroke(r - 0.26, 0.012);
  float along = abs(f.x) > abs(f.y) ? f.y : f.x;
  float dash = step(0.5, fract(along * 14.0));
  float pins = stroke(r - 0.34, 0.03) * dash;
  float mark = 1.0 - smoothstep(0.03, 0.05, length(f - vec2(-0.17, 0.17)));
  body = max(max(outline, pins), mark);
  float lit = step(0.8, hash(id + uSeed + floor(uTime * 0.6)));
  sig = body * lit;
}

// Mode 2: network lattice with nodes
void lattice(vec2 uv, out float body, out float sig) {
  vec2 g = uv * 6.0;
  vec2 f = fract(g);
  float d = min(abs(f.x - f.y), abs(f.x + f.y - 1.0));
  float lines = stroke(d, 0.03);
  float n0 = length(f - 0.5);
  float n1 = min(length(f), length(f - vec2(1.0, 0.0)));
  float n2 = min(length(f - vec2(0.0, 1.0)), length(f - vec2(1.0, 1.0)));
  float node = 1.0 - smoothstep(0.07, 0.09, min(n0, min(n1, n2)));
  body = max(lines, node);
  sig = node * step(0.8, hash(floor(g) + uSeed + floor(uTime * 0.8)));
}

// Mode 3: lines of code with a blinking cursor
void code(vec2 uv, out float body, out float sig) {
  float rows = 16.0;
  float r = floor(uv.y * rows);
  float fy = fract(uv.y * rows) - 0.5;
  float indent = floor(hash(vec2(r, uSeed)) * 3.0) * 0.08;
  float len = 0.15 + 0.6 * hash(vec2(r + 7.0, uSeed));
  float x0 = 0.08 + indent;
  float inBar = step(x0, uv.x) * step(uv.x, x0 + len) * step(abs(fy), 0.18);
  float token = step(0.25, fract((uv.x - x0) * 9.0 + hash(vec2(r, 3.0))));
  float cursorRow = floor(fract(uTime * 0.12) * rows);
  float blink = step(0.5, fract(uTime * 1.5));
  float cursor = step(abs(r - cursorRow), 0.5) * step(abs(fy), 0.3)
    * step(x0 + len + 0.01, uv.x) * step(uv.x, x0 + len + 0.045);
  sig = cursor * blink;
  body = max(inBar * token, sig);
}

// Mode 4: interface wireframe with one highlighted control
void ui(vec2 uv, out float body, out float sig) {
  float w = 0.006;
  float header = stroke(sdBox(uv - vec2(0.5, 0.8), vec2(0.37, 0.05)), w);
  float side = stroke(sdBox(uv - vec2(0.27, 0.42), vec2(0.1, 0.27)), w);
  float c1 = stroke(sdBox(uv - vec2(0.64, 0.52), vec2(0.23, 0.11)), w);
  float c2 = stroke(sdBox(uv - vec2(0.64, 0.30), vec2(0.23, 0.07)), w);
  sig = fillShape(sdBox(uv - vec2(0.76, 0.17), vec2(0.09, 0.03)));
  body = max(max(max(header, side), max(c1, c2)), sig);
}

void main() {
  float body = 0.0;
  float sig = 0.0;
  if (uMode < 0.5) { traces(vUv, body, sig); }
  else if (uMode < 1.5) { chip(vUv, body, sig); }
  else if (uMode < 2.5) { lattice(vUv, body, sig); }
  else if (uMode < 3.5) { code(vUv, body, sig); }
  else { ui(vUv, body, sig); }

  float frame = stroke(sdBox(vUv - 0.5, vec2(0.495)), 0.004);
  body = max(body, frame);

  // Reveal sweeps across the plate from the back corner as the stack assembles.
  float sweep = (vUv.x + vUv.y) * 0.5;
  float vis = 1.0 - smoothstep(uReveal * 1.2 - 0.2, uReveal * 1.2, sweep);

  vec3 col = mix(uSky, uOrange, clamp(sig, 0.0, 1.0));
  float alpha = max(body * 0.6, sig) * vis * mix(1.0, 0.3, uDim);
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

const SLAB = 4; // slab width and depth in world units
const THICKNESS = 0.12;
const BUS = SLAB / 2 - 0.1; // the signal bus stands near the front corner

function spacingOf(rig: Rig): number {
  return (0.22 + 0.78 * rig.assemble) * (1 + 0.25 * rig.explode);
}

function Stack({ rig, tier, colors }: { rig: RefObject<Rig>; tier: 1 | 2; colors: Colors }) {
  const groupRef = useRef<THREE.Group>(null);
  const slabRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const rodRef = useRef<THREE.Mesh>(null);
  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const time = useRef(0);
  const fitted = useRef(false);
  const edgeRefs = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const focusAmt = useRef<number[]>([0, 0, 0, 0, 0]);

  const box = useMemo(() => new THREE.BoxGeometry(SLAB, THICKNESS, SLAB), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(box), [box]);
  const uniforms = useMemo(
    () =>
      layers.map((layer) => ({
        uMode: { value: layer.mode },
        uTime: { value: 0 },
        uSeed: { value: layer.seed },
        uReveal: { value: 0 },
        uDim: { value: 0 },
        uSky: { value: colors.sky },
        uOrange: { value: colors.orange },
      })),
    [colors],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    time.current += dt;
    const t = time.current;
    const { assemble, explode, px, py } = rig.current;

    // Fit the orthographic camera to the container so the whole stack always shows.
    const cam = state.camera as THREE.OrthographicCamera;
    const zoom = Math.min(state.size.width / 6.8, state.size.height / 7.8);
    if (!fitted.current || Math.abs(cam.zoom - zoom) > 0.01) {
      cam.zoom = zoom;
      if (!fitted.current) cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      fitted.current = true;
    }

    const spacing = spacingOf(rig.current);
    const focus = rig.current.focus;
    const kFocus = Math.min(1, dt * 6);
    layers.forEach((layer, i) => {
      // Smoothly lift the focused layer and dim the others (Systems walk).
      const amounts = focusAmt.current;
      const target = layer.level === focus ? 1 : 0;
      const amount = (amounts[i] ?? 0) + (target - (amounts[i] ?? 0)) * kFocus;
      amounts[i] = amount;
      const slab = slabRefs.current[i];
      if (slab) slab.position.y = (layer.level - 3) * spacing + 0.28 * amount;
      const mat = matRefs.current[i];
      if (mat) {
        const uTime = mat.uniforms["uTime"];
        const uReveal = mat.uniforms["uReveal"];
        const uDim = mat.uniforms["uDim"];
        if (uTime) uTime.value = t;
        if (uReveal) uReveal.value = Math.min(1, Math.max(0, (assemble - i * 0.06) / 0.7));
        if (uDim) uDim.value = focus > 0 ? 1 - amount : 0;
      }
      const edge = edgeRefs.current[i];
      if (edge) edge.opacity = focus > 0 ? 0.25 + 0.55 * amount : 0.6;
    });

    const total = 4 * spacing;
    const rod = rodRef.current;
    if (rod) rod.scale.y = total;
    packetRefs.current.forEach((packet, i) => {
      if (!packet) return;
      packet.position.y = (((t * 0.2 + i / 3) % 1) - 0.5) * total;
      packet.visible = assemble > 0.6;
    });

    // Tier 2 follows the pointer; Tier 1 drifts gently on its own.
    const group = groupRef.current;
    if (group) {
      const targetY = tier === 2 ? px * 0.2 : Math.sin(t * 0.25) * 0.1;
      const targetX = tier === 2 ? py * 0.05 : 0;
      const k = Math.min(1, dt * 4);
      group.rotation.y += (targetY - group.rotation.y) * k;
      group.rotation.x += (targetX - group.rotation.x) * k;
    }
  });

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <group
          key={layer.level}
          ref={(el) => {
            slabRefs.current[i] = el;
          }}
        >
          <mesh geometry={box}>
            <meshBasicMaterial color={colors.ink} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial
              ref={(el) => {
                edgeRefs.current[i] = el;
              }}
              color={colors.paper}
              transparent
              opacity={0.6}
            />
          </lineSegments>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, THICKNESS / 2 + 0.002, 0]}>
            <planeGeometry args={[SLAB - 0.2, SLAB - 0.2]} />
            <shaderMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              vertexShader={VERT}
              fragmentShader={FRAG}
              uniforms={uniforms[i]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        </group>
      ))}
      <mesh ref={rodRef} position={[BUS, 0, BUS]}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshBasicMaterial color={colors.orange} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[BUS, 0, BUS]}
          ref={(el) => {
            packetRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color={colors.orange} />
        </mesh>
      ))}
    </group>
  );
}

// Watches frame rate and asks for a lower tier when it stays low (never steps back up).
function FpsGuard() {
  const acc = useRef({ time: 0, frames: 0, strikes: 0, warmup: 3 });
  useFrame((_, delta) => {
    const a = acc.current;
    if (delta > 0.5) {
      // Tab was hidden or the page stalled; do not count that as slow rendering.
      a.time = 0;
      a.frames = 0;
      return;
    }
    a.time += delta;
    a.frames += 1;
    if (a.time < 2) return;
    const fps = a.frames / a.time;
    a.time = 0;
    a.frames = 0;
    if (a.warmup > 0) {
      a.warmup -= 1; // ignore shader compilation and the load animation
      return;
    }
    a.strikes = fps < 35 ? a.strikes + 1 : 0;
    if (a.strikes >= 2) {
      a.strikes = 0;
      stepDownTier();
    }
  });
  return null;
}

export default function StackScene({
  tier,
  active,
  mode,
  focus,
  onReady,
}: {
  tier: 1 | 2;
  active: boolean;
  mode: "hero" | "walk";
  focus: number;
  onReady: () => void;
}) {
  const rig = useRef<Rig>({ assemble: 0, explode: 0, px: 0, py: 0, focus: 0 });
  const colors = useMemo<Colors>(
    () => ({
      ink: readToken("ink"),
      paper: readToken("paper"),
      sky: readToken("sky"),
      orange: readToken("orange"),
    }),
    [],
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const state = rig.current;
    const tween = gsap.to(state, { assemble: 1, duration: 1.8, ease: "power3.out", delay: 0.2 });
    const walk = mode === "walk";
    // Hero: layers separate further as the visitor scrolls through the first screen.
    // Walk: layers stay fully separated and the page drives `focus` instead.
    if (walk) state.explode = 1;
    const trigger = walk
      ? null
      : ScrollTrigger.create({
          start: 0,
          end: () => window.innerHeight * 0.9,
          onUpdate: (self) => {
            state.explode = self.progress;
          },
        });
    let onMove: ((event: PointerEvent) => void) | null = null;
    if (tier === 2 && !walk) {
      onMove = (event) => {
        state.px = (event.clientX / window.innerWidth) * 2 - 1;
        state.py = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      tween.kill();
      trigger?.kill();
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [tier, mode]);

  useEffect(() => {
    rig.current.focus = focus;
  }, [focus]);

  return (
    <div className="absolute inset-0 touch-pan-y">
      <Canvas
        orthographic
        camera={{ position: [12.95, 8, 12.95], zoom: 40, near: 0.1, far: 100 }}
        dpr={[1, tier === 2 ? 2 : 1.5]}
        gl={{
          antialias: tier === 2,
          alpha: true,
          powerPreference: tier === 2 ? "high-performance" : "default",
        }}
        frameloop={active ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            reportWebglLost();
          });
          onReady();
        }}
      >
        <Stack rig={rig} tier={tier} colors={colors} />
        <FpsGuard />
      </Canvas>
    </div>
  );
}
