import type { NextConfig } from "next";

// Security headers (decisions D-45 and D-57).
// Content-Security-Policy: this site loads nothing from other websites (fonts, images and scripts
// are all its own; the form posts to its own /api/consult; the email provider is called by the
// server, not the browser). So every source is 'self', plus:
//  - data: and blob: for images (next/image placeholders, canvas),
//  - nothing extra for the Lab code tool: its worker is the file /lab/code-worker.js, which gets its
//    own, tighter policy below (no network at all, evaluation allowed for that worker only),
//  - 'unsafe-inline' for scripts and styles. Next.js writes small inline bootstrap scripts into
//    statically built pages and React uses inline style attributes. Removing 'unsafe-inline' from
//    script-src needs a per-request nonce, which forces every page to render on demand (D-57).
//  - 'unsafe-eval' and WebSocket only in development (React dev tools and hot reload).
// upgrade-insecure-requests is left out on purpose: it would break a local `next start` over http.
// To log problems without blocking anything, set CSP_REPORT_ONLY=true and redeploy.
const dev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "worker-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  {
    key:
      process.env.CSP_REPORT_ONLY === "true"
        ? "Content-Security-Policy-Report-Only"
        : "Content-Security-Policy",
    value: csp,
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

// The Lab code tool evaluates the visitor's own JavaScript, which needs 'unsafe-eval'. A worker takes
// its policy from its own response headers, so that allowance lives only on this one file and the
// site-wide policy above stays free of it. connect-src 'none' also stops the worker making requests.
// It comes last so it replaces the site-wide policy for this path (Next.js: later rules override).
const workerPolicy = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-eval'",
  "connect-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Do not advertise the framework in response headers.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/lab/code-worker.js",
        headers: [{ key: "Content-Security-Policy", value: workerPolicy }],
      },
    ];
  },
};

export default nextConfig;
