/*
  Worker for the Lab code tool (decision D-57). Runs the visitor's own JavaScript, off the page.
  Served with its own Content-Security-Policy header (see next.config.ts): connect-src 'none'
  blocks every network request, script-src allows evaluation here and nowhere else on the site.
  The page stops this worker after 2 seconds. The lines below also remove the network functions,
  as a second layer, so the code gets a plain "undefined" instead of a blocked request.
*/
"use strict";
for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "BroadcastChannel", "indexedDB", "caches"]) {
  try { Object.defineProperty(self, name, { value: undefined, writable: false, configurable: false }); } catch (e) {}
}
const MAX_LINES = 200;
const MAX_CHARS = 20000;
self.onmessage = (event) => {
  const lines = [];
  let chars = 0;
  let truncated = false;
  const show = (v) => {
    if (typeof v === "string") return v;
    if (typeof v === "undefined" || typeof v === "function") return String(v);
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };
  const log = (...args) => {
    if (lines.length >= MAX_LINES || chars >= MAX_CHARS) { truncated = true; return; }
    const line = args.map(show).join(" ");
    chars += line.length;
    lines.push(line);
  };
  const fakeConsole = { log, info: log, warn: log, error: log };
  let error = null;
  try { new Function("console", event.data)(fakeConsole); }
  catch (e) { error = e && e.message ? (e.name + ": " + e.message) : String(e); }
  self.postMessage({ lines, truncated, error });
};
