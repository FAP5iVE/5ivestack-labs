"use client";

import { useEffect, useRef, useState } from "react";
import { nf, Slider, token } from "./LabControls";

/*
  Device link reliability (Lab, decision D-54, layer L2 Reliability). A simplified model of
  a battery or solar device that sends one report a minute over a lossy radio link
  (GSM, LoRa, Wi-Fi). Each attempt fails independently with the chosen probability; the
  device retries up to a set number of times; a monitor raises an "offline" alert after
  some reports in a row never arrive. Real links lose packets in bursts, which this model
  ignores, so it explains the trade-off rather than predicting a real network.
  Runs in the browser only; sends and stores nothing.
*/

export const REPORTS_PER_DAY = 1440; // one report a minute
const SHOWN = 60; // one hour of reports drawn
const COLUMNS = 20;

// Repeatable pseudo-random number from 0 to 1 for report r, attempt a.
export function unit(r: number, a: number): number {
  const x = Math.sin((r + 1) * 12.9898 + (a + 1) * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function odds(lossPct: number, retries: number, missedLimit: number) {
  const p = lossPct / 100;
  const tries = retries + 1;
  const lostReport = p ** tries; // every attempt failed
  const attempts = p >= 1 ? tries : (1 - p ** tries) / (1 - p); // average attempts per report
  return {
    delivered: 1 - lostReport,
    attempts,
    lostPerDay: REPORTS_PER_DAY * lostReport,
    falseAlertsPerDay: REPORTS_PER_DAY * (1 - lostReport) * lostReport ** missedLimit,
  };
}

// 0 = lost, otherwise the number of attempts the report needed.
export function simulate(lossPct: number, retries: number, count = SHOWN): number[] {
  const p = lossPct / 100;
  const result: number[] = [];
  for (let r = 0; r < count; r += 1) {
    let used = 0;
    for (let a = 0; a <= retries; a += 1) {
      if (unit(r, a) >= p) {
        used = a + 1;
        break;
      }
    }
    result.push(used);
  }
  return result;
}

// Positions in the list where the monitor raises an offline alert (the report that completes a run).
export function offlineAlerts(hour: number[], limit: number): number[] {
  const at: number[] = [];
  let run = 0;
  for (let i = 0; i < hour.length; i += 1) {
    run = hour[i] === 0 ? run + 1 : 0;
    if (run === limit) at.push(i);
  }
  return at;
}

export default function LinkReliability() {
  const [loss, setLoss] = useState(30); // % of attempts lost
  const [retries, setRetries] = useState(2);
  const [missed, setMissed] = useState(3);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const o = odds(loss, retries, missed);
  const hour = simulate(loss, retries);
  const first = hour.filter((n) => n === 1).length;
  const later = hour.filter((n) => n > 1).length;
  const lost = hour.filter((n) => n === 0).length;
  const alertAt = offlineAlerts(hour, missed);
  const alerts = alertAt.length;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const rows = Math.ceil(SHOWN / COLUMNS);
    const pad = 12;
    const cell = (width - pad * 2) / COLUMNS;
    const height = Math.round(rows * cell + pad * 2);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = token("ink");
    ctx.fillRect(0, 0, width, height);
    const inset = Math.max(2, cell * 0.14);
    hour.forEach((n, i) => {
      const x = pad + (i % COLUMNS) * cell + inset;
      const y = pad + Math.floor(i / COLUMNS) * cell + inset;
      const size = cell - inset * 2;
      if (n === 1) {
        ctx.fillStyle = token("paper");
        ctx.fillRect(x, y, size, size);
      } else if (n > 1) {
        ctx.fillStyle = token("orange");
        ctx.fillRect(x, y, size, size);
      } else {
        ctx.strokeStyle = token("sky");
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.75, y + 0.75, size - 1.5, size - 1.5);
      }
      if (alertAt.includes(i)) {
        ctx.strokeStyle = token("orange");
        ctx.lineWidth = 2;
        ctx.strokeRect(x - inset * 0.8, y - inset * 0.8, size + inset * 1.6, size + inset * 1.6);
      }
    });
  });

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        A remote device sends one report a minute over a radio link that drops some messages. It
        can try again when a report is lost, but every retry uses battery. Each square below is
        one report in an hour.
      </p>

      <div ref={boxRef} data-viewport className="mt-6 w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`One hour of reports: ${first} arrived first time, ${later} arrived after a retry, ${lost} never arrived, ${alerts} offline alerts.`}
          className="block w-full"
        />
      </div>
      <p className="mt-2 max-w-[var(--measure)] text-small text-ink-muted">
        White square: arrived first time. Orange square: arrived after a retry. Outline: never
        arrived. Orange ring: the monitor raises an offline alert.
      </p>

      <p role="status" aria-live="polite" className="mt-4 max-w-[var(--measure)] text-body font-medium">
        {`In this hour: ${first} reports arrived first time, ${later} after a retry and ${lost} never arrived, which raised ${alerts} offline ${alerts === 1 ? "alert" : "alerts"}.`}
      </p>
      <p className="mt-2 max-w-[var(--measure)] text-body">
        Each report arrives with a {nf(o.delivered * 100, 1)}% chance, using {nf(o.attempts, 2)}{" "}
        attempts on average, so the radio works {nf((o.attempts - 1) * 100)}% more than with no
        retries. Over a day about {nf(o.lostPerDay)} of {nf(REPORTS_PER_DAY)} reports never
        arrive, and the monitor would raise about {nf(o.falseAlertsPerDay, 2)} false offline
        alerts a day for a device that is in fact working.
      </p>

      <div className="mt-6 border-b border-rule md:max-w-[40rem]">
        <Slider id="link-loss" label="Message loss" min={0} max={70} step={1} value={loss}
          onChange={setLoss} display={`${loss}%`} />
        <Slider id="link-retries" label="Retries" min={0} max={5} step={1} value={retries}
          onChange={setRetries} display={`${retries}`} />
        <Slider id="link-missed" label="Alert after" min={1} max={6} step={1} value={missed}
          onChange={setMissed} display={`${missed} missed`} />
      </div>
    </div>
  );
}
