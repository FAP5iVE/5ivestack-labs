/*
  The five layers, from hardware (L1) to software (L5). One source of truth for
  the hero scene, the SVG fallback and the text list on the page.
  Value labels were confirmed by the owner on 15 Nov 2026. L4 and L5 replace the
  originally proposed "Innovation" and "Creativity" (buzzwords) with concrete,
  testable qualities. See docs/DECISIONS.md D-25.
  The summaries below were approved by the owner on 18 Nov 2026 and polished the
  same day (D-51). They describe the services only: no outcomes or numbers.
*/
export type Layer = {
  level: 1 | 2 | 3 | 4 | 5;
  value: string;
  name: string;
  summary: string;
  /** Service names from the owner's company scope (not placeholder copy). */
  services: readonly string[];
  /** Which procedural pattern the WebGL shader and SVG draw on this layer. */
  mode: 0 | 1 | 2 | 3 | 4;
  /** Random seed for the shader pattern. */
  seed: number;
};

export const layers: readonly Layer[] = [
  {
    level: 1,
    value: "Precision",
    name: "Hardware and sensors",
    summary:
      "We design embedded and IoT hardware, from custom circuit boards to the sensors that measure the real world.",
    services: ["Embedded systems and IoT hardware design"],
    mode: 0,
    seed: 1.7,
  },
  {
    level: 2,
    value: "Reliability",
    name: "Firmware and device networks",
    summary:
      "Firmware, device connectivity and enterprise hardware setup, installed and configured to keep running day after day.",
    services: ["Enterprise hardware setup, installation and configuration"],
    mode: 1,
    seed: 4.3,
  },
  {
    level: 3,
    value: "Security",
    name: "Networks and physical security",
    summary:
      "Network design, installation and configuration, and CCTV installation that protects people, property and data.",
    services: ["Network design, installation and configuration", "CCTV and physical security installation"],
    mode: 2,
    seed: 2.9,
  },
  {
    level: 4,
    value: "Scalability",
    name: "Software and backend",
    summary:
      "Custom software and full-stack web platforms, designed to grow with your users and your business.",
    services: ["Custom software solutions", "Full-stack web platforms"],
    mode: 3,
    seed: 6.1,
  },
  {
    level: 5,
    value: "Usability",
    name: "Android and interfaces",
    summary:
      "Native and cross-platform Android apps and web interfaces that people can pick up and use without training.",
    services: ["Android applications, native and cross-platform"],
    mode: 4,
    seed: 3.4,
  },
] as const;

export const consultation = {
  label: "All five layers",
  name: "IT and technical consultation",
  summary:
    "Practical advice across hardware, networks and software, so you choose the right system before you commit to a build.",
} as const;
