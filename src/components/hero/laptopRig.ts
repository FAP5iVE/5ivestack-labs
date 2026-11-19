/*
  Laptop scroll rig (decision D-60). Loaded lazily by LaptopHero, only on Tier 1 and 2.
  Everything is procedural: no model files, no photo textures, no postprocessing, no glow.

  How it works
  - A closed laptop lies on a dark stage. Scrolling through the runway opens the lid around its
    hinge, then flies the camera into the screen until the screen fills the stage.
  - The screen is the real hero HTML. It is projected with CSS3DRenderer using the same camera as
    the WebGL laptop, and the laptop's display is a transparent hole in the WebGL canvas, so the
    HTML shows through it (the standard CSS3D plus WebGL cut-out technique).
  - World units are CSS pixels: the display plane is --screen-w px wide in the CSS3D scene and the
    laptop model is scaled to match. At the end of the flight the camera sits exactly one CSS
    perspective distance from the plane, so one plane pixel is one screen pixel.
  - At the very end the screen is moved out of the 3D layer into the stage as plain flat DOM, at
    the same size and crop, so text is sharp and links work. Scrolling back reverses it.
  - Rendering happens only when the scroll state or stage size changes and while the stage is on
    screen. Scroll progress comes from GSAP ScrollTrigger (no pinning: the stage is CSS sticky).
*/

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

export type LaptopRigOptions = {
  root: HTMLElement; // the <section>; receives data-laptop, data-flat and the size variables
  runway: HTMLElement; // tall box whose scroll distance drives the animation
  stage: HTMLElement; // sticky box that holds the canvas and the CSS3D layer
  home: HTMLElement; // where the screen lives when the rig is off
  screen: HTMLElement; // the hero HTML, moved into the 3D scene
  tier: 1 | 2;
  onContextLost: () => void;
};

export type LaptopRig = { destroy: () => void };

// ---- Model dimensions, in model units (the display is 3.2 wide, 16:10) ----
const SCREEN_ASPECT = 1.6;
const SW = 3.2; // display width
const SH = SW / SCREEN_ASPECT; // display height, 2.0
const LW = 3.4; // lid width
const LH = 2.3; // lid height
const LT = 0.07; // lid thickness
const BW = 3.4; // base width
const BD = 2.3; // base depth
const BT = 0.1; // base thickness
const HINGE_Y = BT + 0.03;
const HINGE_Z = -BD / 2 + 0.02;
const BEZEL_TOP = 0.1;
const SCREEN_CY = LH - BEZEL_TOP - SH / 2; // display centre, measured up the lid
const OPEN_ANGLE = THREE.MathUtils.degToRad(106);
const FOV = 32;

// ---- Scroll choreography (progress 0 to 1 across the runway) ----
const LID_START = 0.03;
const LID_END = 0.42;
const FLY_START = 0.28;
const FLY_END = 0.9;
const FLAT_ON = 0.985; // hand over to flat DOM at or above this
const FLAT_OFF = 0.965; // go back to 3D below this

const Y_AXIS = new THREE.Vector3(0, 1, 0);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Colours come from the CSS tokens so there is one source of truth.
function readToken(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim();
  return new THREE.Color(raw || "#ffffff");
}

type KeyRect = { x: number; z: number; w: number; d: number };

// Plain chiclet layout: a short function row, four full rows and a bottom row. Width 2.8.
function keyLayout(): KeyRect[] {
  const keys: KeyRect[] = [];
  const pitch = 0.2;
  const x0 = -1.4 + pitch / 2;
  const row = (z: number, d: number, count: number) => {
    for (let i = 0; i < count; i += 1) keys.push({ x: x0 + i * pitch, z, w: pitch, d });
  };
  row(-0.95, 0.11, 14);
  row(-0.76, 0.17, 14);
  row(-0.56, 0.17, 14);
  row(-0.36, 0.17, 14);
  row(-0.16, 0.17, 14);
  const zb = 0.04;
  for (let i = 0; i < 3; i += 1) {
    keys.push({ x: -1.4 + 0.15 + i * 0.3, z: zb, w: 0.3, d: 0.17 });
    keys.push({ x: 1.4 - 0.15 - i * 0.3, z: zb, w: 0.3, d: 0.17 });
  }
  keys.push({ x: 0, z: zb, w: 1.0, d: 0.17 });
  return keys;
}

export function mountLaptop(opts: LaptopRigOptions): LaptopRig | null {
  const { root, runway, stage, home, screen } = opts;

  // Do not start a runway under a visitor who is already part-way down the page.
  if (window.scrollY > 24) return null;
  if (screen.parentNode !== home) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: opts.tier === 2,
      alpha: true,
      powerPreference: opts.tier === 2 ? "high-performance" : "default",
    });
  } catch {
    return null;
  }

  // Turn the section into a runway first, so the stage has its real size when measured.
  root.dataset.laptop = "on";
  root.dataset.flat = "false";
  const startW = stage.clientWidth;
  const startH = stage.clientHeight;
  if (startW < 300 || startH < 420) {
    delete root.dataset.laptop;
    delete root.dataset.flat;
    renderer.dispose();
    return null;
  }

  let destroyed = false;
  const screenNext = screen.nextSibling;
  const colors = {
    ink: readToken("ink"),
    paper: readToken("paper"),
    rule: readToken("rule"),
    inkMuted: readToken("ink-muted"),
  };

  // ---------------------------------------------------------------- WebGL scene
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.tier === 2 ? 2 : 1.5));

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envTarget = pmrem.fromScene(envScene, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.9;
  track(envTarget);
  envScene.dispose();
  pmrem.dispose();

  const key = new THREE.DirectionalLight(colors.paper, 1.1);
  key.position.set(-3, 6, 5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(FOV, startW / startH, 1, 10000);

  const aluminium = track(
    new THREE.MeshStandardMaterial({ color: colors.rule, metalness: 0.85, roughness: 0.36 }),
  );
  const trackpadMat = track(
    new THREE.MeshStandardMaterial({ color: colors.paper, metalness: 0.7, roughness: 0.22 }),
  );
  const darkMat = track(
    new THREE.MeshStandardMaterial({ color: colors.ink, metalness: 0.05, roughness: 0.55 }),
  );
  const dotMat = track(new THREE.MeshBasicMaterial({ color: colors.inkMuted }));
  // Transparent hole: written with no blending so the CSS3D screen behind the canvas shows through.
  const holeMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0,
      blending: THREE.NoBlending,
      side: THREE.DoubleSide,
    }),
  );

  const group = new THREE.Group();
  scene.add(group);

  // Base
  const baseGeo = track(new RoundedBoxGeometry(BW, BT, BD, 4, 0.035));
  const base = new THREE.Mesh(baseGeo, aluminium);
  base.position.set(0, BT / 2, 0);
  group.add(base);

  // Keys (one instanced mesh)
  const keyRects = keyLayout();
  const keyGeo = track(new RoundedBoxGeometry(1, 1, 1, 2, 0.1));
  const keys = new THREE.InstancedMesh(keyGeo, darkMat, keyRects.length);
  const dummy = new THREE.Object3D();
  const KEY_H = 0.022;
  const KEY_GAP = 0.03;
  keyRects.forEach((k, i) => {
    dummy.position.set(k.x, BT + KEY_H / 2, k.z);
    dummy.scale.set(k.w - KEY_GAP, KEY_H, k.d - KEY_GAP);
    dummy.updateMatrix();
    keys.setMatrixAt(i, dummy.matrix);
  });
  keys.instanceMatrix.needsUpdate = true;
  group.add(keys);
  track(keys);

  // Trackpad
  const padGeo = track(new RoundedBoxGeometry(1.15, 0.006, 0.7, 2, 0.003));
  const pad = new THREE.Mesh(padGeo, trackpadMat);
  pad.position.set(0, BT + 0.002, 0.62);
  group.add(pad);

  // Hinge barrel
  const hingeGeo = track(new THREE.CylinderGeometry(0.042, 0.042, 2.6, 16));
  hingeGeo.rotateZ(Math.PI / 2);
  const hinge = new THREE.Mesh(hingeGeo, darkMat);
  hinge.position.set(0, HINGE_Y, HINGE_Z);
  group.add(hinge);

  // Lid: pivot at the hinge. In its own frame the lid stands up (+Y) and the screen faces +Z.
  const lid = new THREE.Group();
  lid.position.set(0, HINGE_Y, HINGE_Z);
  group.add(lid);

  const lidGeo = track(new RoundedBoxGeometry(LW, LH, LT, 4, 0.035));
  const lidBody = new THREE.Mesh(lidGeo, aluminium);
  lidBody.position.set(0, LH / 2, -LT / 2);
  lid.add(lidBody);

  const plateGeo = track(new THREE.PlaneGeometry(LW - 0.05, LH - 0.05));
  const plate = new THREE.Mesh(plateGeo, darkMat);
  plate.position.set(0, LH / 2, 0.0015);
  lid.add(plate);

  const holeGeo = track(new THREE.PlaneGeometry(SW, SH));
  const hole = new THREE.Mesh(holeGeo, holeMat);
  hole.position.set(0, SCREEN_CY, 0.003);
  lid.add(hole);

  const dotGeo = track(new THREE.CircleGeometry(0.014, 16));
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(0, LH - BEZEL_TOP / 2, 0.0032);
  lid.add(dot);

  // Brand mark on the outside of the lid. Upright for a viewer in front of the closed laptop.
  let logoMesh: THREE.Mesh | null = null;
  const logoGeo = track(new THREE.PlaneGeometry(0.5, 0.5));
  const logoMat = track(
    new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }),
  );
  let dirty = true;
  new THREE.TextureLoader().load("/brand/icon-512.png", (texture) => {
    if (destroyed) {
      texture.dispose();
      return;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    logoMat.map = texture;
    logoMat.needsUpdate = true;
    track(texture);
    logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, LH / 2, -LT - 0.002);
    logoMesh.rotation.x = Math.PI;
    lid.add(logoMesh);
    dirty = true;
  });

  // ---------------------------------------------------------------- CSS3D screen
  const holder = document.createElement("div");
  const cssScene = new THREE.Scene();
  const cssObject = new CSS3DObject(holder);
  cssObject.element.style.pointerEvents = "none";
  cssScene.add(cssObject);
  const css3d = new CSS3DRenderer();
  css3d.domElement.className = "hero-layer";
  renderer.domElement.className = "hero-layer";
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.prepend(renderer.domElement);
  stage.prepend(css3d.domElement);
  holder.appendChild(screen);
  screen.inert = true;

  // ---------------------------------------------------------------- layout
  let W = startW;
  let H = startH;
  let m = 1; // CSS px per model unit
  let dFinal = 1000;
  let dFar = 1000; // camera distance for the closed laptop, in px

  const layout = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w < 2 || h < 2) return;
    W = w;
    H = h;
    // The display plane covers the stage at 16:10. Sizes keep the stage's parity so every offset
    // is a whole pixel (sharp text in flat mode).
    const wp = W + 2 * Math.ceil((Math.max(W, SCREEN_ASPECT * H) - W) / 2);
    const hp = H + 2 * Math.ceil((wp / SCREEN_ASPECT - H) / 2);
    m = wp / SW;
    const fx = (wp - W) / 2;
    const fy = (hp - H) / 2;

    const style = root.style;
    style.setProperty("--screen-w", `${wp}px`);
    style.setProperty("--screen-h", `${hp}px`);
    style.setProperty("--frame-w", `${W}px`);
    style.setProperty("--frame-h", `${H}px`);
    style.setProperty("--frame-x", `${fx}px`);
    style.setProperty("--frame-y", `${fy}px`);
    style.setProperty("--flat-x", `${-fx}px`);
    style.setProperty("--flat-y", `${-fy}px`);
    holder.style.width = `${wp}px`;
    holder.style.height = `${hp}px`;

    renderer.setSize(W, H);
    css3d.setSize(W, H);
    camera.aspect = W / H;
    camera.fov = FOV;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    dFinal = H / (2 * tanHalf); // CSS perspective distance: 1 plane px = 1 screen px
    camera.near = dFinal * 0.02;
    camera.updateProjectionMatrix();
    group.scale.setScalar(m);

    // Far pose: a three-quarter view of the closed laptop, framed to fit the stage.
    const aspect = W / H;
    const widthFit = LW / (aspect >= 1 ? 0.5 : 0.62) / (2 * tanHalf * aspect);
    const heightFit = 3.6 / (2 * tanHalf);
    dFar = Math.max(widthFit, heightFit) * m;
    camera.far = dFar * 4;
    camera.updateProjectionMatrix();
    dirty = true;
  };

  // ---------------------------------------------------------------- per-frame state
  const C = new THREE.Vector3();
  const N = new THREE.Vector3();
  const U = new THREE.Vector3();
  const pNear = new THREE.Vector3();
  const pFarNow = new THREE.Vector3();
  const tFarNow = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  const scratchScale = new THREE.Vector3();
  let isFlat = false;

  const pose = (p: number) => {
    const open = ease(seg(p, LID_START, LID_END));
    lid.rotation.x = Math.PI / 2 - open * OPEN_ANGLE;
    group.updateMatrixWorld(true);
    hole.getWorldPosition(C);
    N.set(0, 0, 1).transformDirection(hole.matrixWorld);
    U.set(0, 1, 0).transformDirection(hole.matrixWorld);

    // Far pose: a three-quarter view from above that, as the lid opens, lowers, swings round to the
    // front, rises and backs off, so the taller open laptop stays whole in the frame.
    const el = THREE.MathUtils.degToRad(42 - open * 17);
    const az = THREE.MathUtils.degToRad(-16 * (1 - open));
    const dist = dFar * (1 + 0.35 * open);
    tFarNow.set(0, (0.1 + open * 1.0) * m, 0);
    pFarNow.set(
      Math.sin(az) * Math.cos(el) * dist,
      Math.sin(el) * dist + tFarNow.y,
      Math.cos(az) * Math.cos(el) * dist,
    );

    const e = ease(seg(p, FLY_START, FLY_END));
    pNear.copy(N).multiplyScalar(dFinal).add(C);
    camera.position.lerpVectors(pFarNow, pNear, e);
    tgt.lerpVectors(tFarNow, C, e);
    camera.up.lerpVectors(Y_AXIS, U, e).normalize();
    camera.lookAt(tgt);

    // Put the CSS3D screen exactly on the display. Its size is already in px, so scale stays 1.
    hole.matrixWorld.decompose(cssObject.position, cssObject.quaternion, scratchScale);
    cssObject.scale.set(1, 1, 1);
  };

  const setFlat = (flat: boolean) => {
    if (flat === isFlat) return;
    isFlat = flat;
    if (flat) {
      stage.appendChild(screen);
      css3d.domElement.style.display = "none";
      renderer.domElement.style.display = "none";
    } else {
      holder.appendChild(screen);
      css3d.domElement.style.display = "";
      renderer.domElement.style.display = "";
      dirty = true;
    }
    root.dataset.flat = flat ? "true" : "false";
    screen.inert = !flat;
  };

  const apply = (p: number) => {
    root.style.setProperty("--hero-p", p.toFixed(4));
    setFlat(isFlat ? p >= FLAT_OFF : p >= FLAT_ON);
    if (isFlat) return;
    pose(p);
    renderer.render(scene, camera);
    css3d.render(cssScene, camera);
  };

  // ---------------------------------------------------------------- scroll
  gsap.registerPlugin(ScrollTrigger);
  const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;
  let target = 0;
  let current = 0;
  const trigger = ScrollTrigger.create({
    trigger: runway,
    start: () => `top ${stickyTop()}px`,
    end: () => `bottom ${stickyTop() + stage.clientHeight}px`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      target = self.progress;
    },
  });

  let visible = true;
  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? true;
          if (visible) dirty = true;
        });
  observer?.observe(stage);

  const tick = (_time: number, deltaMs: number) => {
    if (destroyed || !visible) return;
    const diff = target - current;
    if (Math.abs(diff) > 0.0002) {
      // Light damping so wheel steps and touch flicks glide instead of snapping.
      current += diff * (1 - Math.exp((-Math.min(deltaMs, 100) / 1000) * 12));
      dirty = true;
    } else if (current !== target) {
      current = target;
      dirty = true;
    }
    if (!dirty) return;
    dirty = false;
    apply(current);
  };

  const resizeObserver =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => layout());

  const onLost = (event: Event) => {
    event.preventDefault();
    opts.onContextLost();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);

  // ---------------------------------------------------------------- go
  layout();
  trigger.refresh();
  target = trigger.progress;
  current = target;
  apply(current);
  gsap.ticker.add(tick);
  resizeObserver?.observe(stage);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    // Remember where the next section sits, so the page does not lurch when the runway collapses.
    const next = root.nextElementSibling;
    const anchorBefore = next?.getBoundingClientRect().top ?? 0;
    const keepAnchor = next !== null && anchorBefore < window.innerHeight;

    gsap.ticker.remove(tick);
    trigger.kill();
    observer?.disconnect();
    resizeObserver?.disconnect();
    renderer.domElement.removeEventListener("webglcontextlost", onLost);

    // Put the screen back where React put it, then turn the runway off.
    home.insertBefore(screen, screenNext);
    screen.inert = false;
    for (const name of [
      "--screen-w",
      "--screen-h",
      "--frame-w",
      "--frame-h",
      "--frame-x",
      "--frame-y",
      "--flat-x",
      "--flat-y",
      "--hero-p",
    ]) {
      root.style.removeProperty(name);
    }
    delete root.dataset.laptop;
    delete root.dataset.flat;
    css3d.domElement.remove();
    renderer.domElement.remove();

    // If the next section was on screen (or above it), keep it exactly where it was.
    if (keepAnchor && next) window.scrollBy(0, next.getBoundingClientRect().top - anchorBefore);

    disposables.forEach((item) => item.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return { destroy };
}
