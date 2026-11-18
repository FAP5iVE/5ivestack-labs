"use client";

import { useEffect, useRef, useState } from "react";
import { nf, Slider, token } from "./LabControls";

/*
  Server capacity planner (Lab, decision D-54, layer L4 Scalability). A simplified queueing
  model: requests arrive at random, are spread evenly over identical servers, and each
  server works through them one at a time (an M/M/1 queue per server). Average response
  time is 1 / (capacity per server minus arrival rate per server) while the servers keep
  up. It ignores caching, databases, bursts and slow requests, so it explains why response
  time collapses near full load rather than predicting a real system.
  Runs in the browser only; sends and stores nothing.
*/

const TARGET = 0.7; // a comfortable level of use: 70% busy
const Y_MAX_MS = 500;

export function model(users: number, perMinute: number, perServer: number, servers: number) {
  const arrivals = (users * perMinute) / 60; // requests per second
  const capacity = servers * perServer;
  const busy = arrivals / capacity; // fraction of capacity in use
  const seconds = busy < 1 ? 1 / (perServer - arrivals / servers) : Infinity;
  return {
    arrivals,
    capacity,
    busy,
    responseMs: seconds * 1000,
    usersAtTarget: Math.floor((TARGET * capacity * 60) / perMinute),
    serversAtTarget: Math.ceil(arrivals / (TARGET * perServer)),
  };
}

export function verdict(busy: number): string {
  if (busy >= 1) return "Overloaded: requests arrive faster than the servers can finish them, so the queue grows without end.";
  if (busy >= 0.85) return "Close to the limit: a small rise in traffic will make everything slow.";
  if (busy >= 0.6) return "Busy but coping: there is some room left for a rise in traffic.";
  return "Comfortable: there is plenty of room for a rise in traffic.";
}

export default function CapacityPlanner() {
  const [users, setUsers] = useState(1500); // people using the system at the same time
  const [perMinute, setPerMinute] = useState(6); // requests per person per minute
  const [perServer, setPerServer] = useState(100); // requests per second one server can finish
  const [servers, setServers] = useState(2);
  const [width, setWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const m = model(users, perMinute, perServer, servers);

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

    const margin = 12;
    const usersAtLimit = (m.capacity * 60) / perMinute; // users at which load equals capacity
    const xMax = Math.max(usersAtLimit * 1.25, users * 1.1);
    const xOf = (u: number) => margin + (u / xMax) * (width - 2 * margin);
    const yOf = (ms: number) => height - margin - (Math.min(ms, Y_MAX_MS) / Y_MAX_MS) * (height - 2 * margin);
    const msAt = (u: number) => model(u, perMinute, perServer, servers).responseMs;

    ctx.fillStyle = token("ink");
    ctx.fillRect(0, 0, width, height);

    // The point where the servers run out of capacity.
    ctx.strokeStyle = token("paper");
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xOf(usersAtLimit), margin);
    ctx.lineTo(xOf(usersAtLimit), height - margin);
    ctx.stroke();

    // Average response time against the number of users.
    ctx.strokeStyle = token("sky");
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = margin; px <= width - margin; px += 2) {
      const u = ((px - margin) / (width - 2 * margin)) * xMax;
      const ms = msAt(u);
      const y = yOf(ms);
      if (!started) {
        ctx.moveTo(px, y);
        started = true;
      } else ctx.lineTo(px, y);
      if (ms >= Y_MAX_MS) break;
    }
    ctx.stroke();

    // Your setting.
    ctx.fillStyle = token("orange");
    ctx.beginPath();
    ctx.arc(xOf(users), yOf(m.responseMs), 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const response = Number.isFinite(m.responseMs)
    ? `Average response time: about ${nf(m.responseMs, m.responseMs < 10 ? 1 : 0)} ms.`
    : "Average response time: no limit, because the queue never empties.";

  return (
    <div>
      <p className="max-w-[var(--measure)] text-body text-ink-muted">
        As more people use a system, response time stays flat for a while and then collapses.
        Set the number of users, how busy each one is, and what your servers can do, and see how
        close you are to the edge.
      </p>

      <div ref={boxRef} data-viewport className="mt-6 w-full overflow-hidden bg-ink">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Chart of average response time against the number of users"
          className="block w-full"
        />
      </div>
      <p className="mt-2 max-w-[var(--measure)] text-small text-ink-muted">
        Blue line: average response time as users are added (up to {Y_MAX_MS} ms). White line:
        where the servers run out of capacity. Orange dot: your settings.
      </p>

      <p role="status" aria-live="polite" className="mt-4 max-w-[var(--measure)] text-body font-medium">
        {verdict(m.busy)}
      </p>
      <p className="mt-2 max-w-[var(--measure)] text-body">
        {nf(m.arrivals, 1)} requests a second arrive and {servers === 1 ? "the server" : `your ${servers} servers`} can
        finish {nf(m.capacity)}, so {servers === 1 ? "it is" : "they are"} {nf(m.busy * 100)}% busy.{" "}
        {response} At 70% busy this setup serves about {nf(m.usersAtTarget)} users; for{" "}
        {nf(users)} users you would want {nf(m.serversAtTarget)} {m.serversAtTarget === 1 ? "server" : "servers"}.
      </p>

      <div className="mt-6 border-b border-rule md:max-w-[40rem]">
        <Slider id="cap-users" label="Users at once" min={500} max={50000} step={500} value={users}
          onChange={setUsers} display={nf(users)} />
        <Slider id="cap-rate" label="Requests each" min={1} max={30} step={1} value={perMinute}
          onChange={setPerMinute} display={`${perMinute} a minute`} />
        <Slider id="cap-speed" label="One server does" min={20} max={400} step={10} value={perServer}
          onChange={setPerServer} display={`${perServer} a second`} />
        <Slider id="cap-servers" label="Servers" min={1} max={12} step={1} value={servers}
          onChange={setServers} display={`${servers}`} />
      </div>
    </div>
  );
}
