"use client";

import { useEffect, useRef, useState } from "react";

/*
  Sensor sampling explorer (Lab, decision D-50). A simplified, ideal model of what an
  analog-to-digital converter (ADC) in an embedded or IoT device does to a sensor
  signal: it measures the voltage at regular instants (the sample rate) and rounds
  each measurement to one of 2^bits steps (the resolution).
  Model: a sine wave centred in a 0 to 3.3 V range (amplitude 45% of the range) plus a
  repeatable pseudo-random noise value added at each sample. No real-converter errors,
  no sample-and-hold effects, no anti-alias filter. Runs in the browser only; sends
  and stores nothing.
*/

const VREF = 3.3; // volts
const AMPLITUDE = 0.45 * VREF;
const MID = VREF / 2;

// Repeatable pseudo-random value from -1 to 1 for sample number i.
function noise(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}

const nf = (n: number, digits = 0) =>
  n.toLocaleString("en-GB", { maximumFractionDigits: digits });

const sliderRow = "grid grid-cols-[6rem_1fr_5rem] items-center gap-2 border-t border-rule py-2 md:grid-cols-[8rem_1fr_6rem] md:gap-4";

export default function SignalScope() {
  const [freq, setFreq] = useState(500); // signal frequency, Hz
  const [rate, setRate] = useState(8000); // sample rate, Hz
  const [bits, setBits] = useState(6);
  const [noisePct, setNoisePct] = useState(2); // % of the full range
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const levels = 2 ** bits;
  const step = VREF / (levels - 1); // volts per code
  const nyquist = rate / 2;
  const aliased = freq > nyquist;
  const apparent = Math.abs(freq - rate * Math.round(freq / rate));
  const bitRate = rate * bits;

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
    const height = Math.round(width * 0.5);
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

    const margin = 10;
    const yOf = (volts: number) => height - margin - (volts / VREF) * (height - 2 * margin);
    const windowSec = Math.max(4 / freq, 16 / rate);
    const xOf = (t: number) => (t / windowSec) * width;
    const analog = (t: number) => MID + AMPLITUDE * Math.sin(2 * Math.PI * freq * t);

    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, width, height);

    // Faint lines at each converter step, when there are few enough to read.
    if (levels <= 32) {
      ctx.strokeStyle = paper;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      for (let code = 0; code < levels; code += 1) {
        const y = yOf(code * step);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // The real (analog) signal.
    ctx.strokeStyle = sky;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const y = yOf(analog((px / width) * windowSec));
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // What the converter reports: one rounded value per sample, held until the next sample.
    const count = Math.floor(windowSec * rate) + 1;
    const points: { x: number; y: number }[] = [];
    ctx.strokeStyle = paper;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < count; k += 1) {
      const t = k / rate;
      const noisy = analog(t) + noise(k) * (noisePct / 100) * VREF;
      const clipped = Math.min(VREF, Math.max(0, noisy));
      const code = Math.round(clipped / step);
      const volts = code * step;
      const x = xOf(t);
      const nextX = Math.min(width, xOf((k + 1) / rate));
      const y = yOf(volts);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      ctx.lineTo(nextX, y);
      points.push({ x, y });
    }
    ctx.stroke();

    ctx.fillStyle = orange;
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [width, freq, rate, bits, noisePct, levels, step]);

  const status = aliased
    ? `Aliasing: the ${nf(freq)} Hz signal is above the Nyquist limit of ${nf(nyquist)} Hz, so the converter reports it as a false ${nf(apparent)} Hz signal.`
    : `The ${nf(freq)} Hz signal is below the Nyquist limit of ${nf(nyquist)} Hz, so its frequency is captured correctly.`;

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        A sensor produces a smooth voltage (blue). The device measures it at regular moments
        (orange dots) and rounds each measurement to one of a limited number of steps (the white
        line). Change the settings and watch what is lost.
      </p>

      <div ref={boxRef} data-viewport className="mt-6 w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Chart of a smooth sensor signal and the stepped values a converter reports for it"
          className="block w-full"
        />
      </div>

      <p role="status" aria-live="polite" className="mt-4 max-w-[var(--measure)] text-body font-medium">
        {status}
      </p>
      <p className="mt-2 max-w-[var(--measure)] text-body">
        {nf(levels)} levels, {nf(step * 1000, 1)} mV per step, so each reading is within about{" "}
        {nf((step / 2) * 1000, 1)} mV of the true value. The device produces{" "}
        {nf(bitRate / 1000, 1)} kbit/s of data.
      </p>

      <div className="mt-6 border-b border-rule md:max-w-[40rem]">
        <div className={sliderRow}>
          <label htmlFor="scope-freq" className="text-body">Signal</label>
          <input id="scope-freq" type="range" min={50} max={5000} step={10} value={freq}
            onChange={(e) => setFreq(Number(e.target.value))} className="h-11 w-full accent-ink" />
          <output htmlFor="scope-freq" className="font-mono text-small tabular-nums">{nf(freq)} Hz</output>
        </div>
        <div className={sliderRow}>
          <label htmlFor="scope-rate" className="text-body">Sample rate</label>
          <input id="scope-rate" type="range" min={500} max={20000} step={100} value={rate}
            onChange={(e) => setRate(Number(e.target.value))} className="h-11 w-full accent-ink" />
          <output htmlFor="scope-rate" className="font-mono text-small tabular-nums">{nf(rate)} Hz</output>
        </div>
        <div className={sliderRow}>
          <label htmlFor="scope-bits" className="text-body">Resolution</label>
          <input id="scope-bits" type="range" min={2} max={12} step={1} value={bits}
            onChange={(e) => setBits(Number(e.target.value))} className="h-11 w-full accent-ink" />
          <output htmlFor="scope-bits" className="font-mono text-small tabular-nums">{bits} bits</output>
        </div>
        <div className={sliderRow}>
          <label htmlFor="scope-noise" className="text-body">Noise</label>
          <input id="scope-noise" type="range" min={0} max={10} step={1} value={noisePct}
            onChange={(e) => setNoisePct(Number(e.target.value))} className="h-11 w-full accent-ink" />
          <output htmlFor="scope-noise" className="font-mono text-small tabular-nums">{noisePct}%</output>
        </div>
      </div>
    </div>
  );
}
