"use client";

import { useEffect, useRef, useState } from "react";

/*
  Code lab (Lab, decision D-54, software layers L4 and L5). A small JavaScript playground.
  The code you type runs inside a Web Worker created in your browser: it cannot touch the
  page, it is stopped after 2 seconds, its network functions are switched off, and the
  output is capped. Nothing you type is sent anywhere or saved. (A future
  Content-Security-Policy must allow worker-src blob: for this tool; see HANDOFF.)
*/

const LIMIT_MS = 2000;

const WORKER_SOURCE = `
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
`;

export const examples = [
  {
    id: "average",
    name: "Smooth a sensor",
    code: `// A noisy temperature sensor, smoothed with a moving average.
const readings = [20.1, 20.4, 25.9, 20.2, 20.3, 19.8, 20.5];
const window = 3;

const smoothed = readings.map((_, i) => {
  const recent = readings.slice(Math.max(0, i - window + 1), i + 1);
  return recent.reduce((sum, v) => sum + v, 0) / recent.length;
});

console.log("raw:     ", readings.join("  "));
console.log("smoothed:", smoothed.map((v) => v.toFixed(1)).join("  "));
`,
  },
  {
    id: "crc",
    name: "Check data with CRC-8",
    code: `// CRC-8 (polynomial 0x07): a checksum that exposes corrupted data.
function crc8(bytes) {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

const hex = (n) => "0x" + n.toString(16).padStart(2, "0");
const message = [0x48, 0x65, 0x6c, 0x6c, 0x6f]; // the text "Hello"

console.log("CRC-8 of the message:", hex(crc8(message)));
message[1] ^= 0x01; // flip a single bit, as noise on a wire might
console.log("After one flipped bit:", hex(crc8(message)));
`,
  },
  {
    id: "search",
    name: "Search fast",
    code: `// Binary search halves the search range at every step.
function search(sorted, target) {
  let low = 0;
  let high = sorted.length - 1;
  let steps = 0;
  while (low <= high) {
    steps++;
    const mid = (low + high) >> 1;
    if (sorted[mid] === target) return { index: mid, steps };
    if (sorted[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return { index: -1, steps };
}

const data = Array.from({ length: 1000000 }, (_, i) => i * 2);
console.log(search(data, 123456));
console.log("Checking one by one could take up to", data.length, "steps.");
`,
  },
] as const;

type Result = { lines: string[]; truncated: boolean; error: string | null; stopped: boolean };

const choice =
  "inline-flex min-h-11 items-center rounded-control border border-ink px-4 text-body font-medium aria-pressed:bg-ink aria-pressed:text-paper";

export default function CodeLab() {
  const [exampleId, setExampleId] = useState<string>(examples[0].id);
  const [code, setCode] = useState<string>(examples[0].code);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);

  function stop() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      workerRef.current?.terminate();
    };
  }, []);

  function run() {
    stop();
    setRunning(true);
    setResult(null);
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<{ lines: string[]; truncated: boolean; error: string | null }>) => {
      stop();
      setResult({ ...event.data, stopped: false });
      setRunning(false);
    };
    worker.onerror = () => {
      stop();
      setResult({ lines: [], truncated: false, error: "The code could not be run.", stopped: false });
      setRunning(false);
    };
    timerRef.current = window.setTimeout(() => {
      stop();
      setResult({ lines: [], truncated: false, error: null, stopped: true });
      setRunning(false);
    }, LIMIT_MS);
    worker.postMessage(code);
  }

  function load(id: string) {
    const example = examples.find((e) => e.id === id);
    if (!example) return;
    stop();
    setRunning(false);
    setExampleId(id);
    setCode(example.code);
    setResult(null);
  }

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        Pick an example, change it, and run it. It is plain JavaScript. The code runs only in your
        browser, in a background worker that is stopped after 2 seconds, with network calls
        switched off. Nothing you type is sent or saved.
      </p>

      <div role="group" aria-label="Examples" className="mt-6 flex flex-wrap gap-3">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            aria-pressed={exampleId === example.id}
            onClick={() => load(example.id)}
            className={choice}
          >
            {example.name}
          </button>
        ))}
      </div>

      <div data-viewport className="mt-6 bg-ink">
        <label htmlFor="code-input" className="sr-only">
          JavaScript code
        </label>
        <textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={14}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="block w-full resize-y bg-ink p-4 font-mono text-body leading-normal text-paper"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink disabled:opacity-60"
        >
          {running ? "Running" : "Run the code"}
        </button>
        <button
          type="button"
          onClick={() => load(exampleId)}
          className="inline-flex min-h-11 items-center rounded-control border border-ink px-6 text-body font-medium"
        >
          Reset the example
        </button>
      </div>

      <div role="status" aria-live="polite" data-viewport className="mt-6 bg-ink p-4">
        <p className="text-small text-sky">Output</p>
        <pre className="mt-2 min-h-11 whitespace-pre-wrap break-words font-mono text-body text-paper">
          {result === null
            ? running
              ? "Running."
              : "Press Run the code."
            : result.lines.join("\n")}
        </pre>
        {result?.truncated ? (
          <p className="mt-2 text-small text-sky">The output was cut short at 200 lines.</p>
        ) : null}
        {result?.error ? (
          <p className="mt-2 text-body text-orange">Error: {result.error}</p>
        ) : null}
        {result?.stopped ? (
          <p className="mt-2 text-body text-orange">
            Stopped: the code ran for more than {LIMIT_MS / 1000} seconds.
          </p>
        ) : null}
      </div>
    </div>
  );
}
