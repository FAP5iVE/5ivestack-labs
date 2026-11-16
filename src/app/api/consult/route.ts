import { privacy } from "@/content/privacy";
import { site } from "@/content/site";
import { consultEnabled } from "@/lib/consult-config";
import { ORG_OPTIONS, SERVICE_OPTIONS, labelFor, validate } from "@/lib/consult";

/*
  Consultation request endpoint (decisions D-40, D-41). Sends one plain-text email
  through the Resend REST API. No database; nothing is stored here. Personal data is
  never written to logs. Required environment variables are listed in .env.example.
*/

const hits = new Map<string, number[]>();

// Light per-instance rate limit: at most 5 requests per IP per hour. Serverless
// instances do not share memory, so this only blunts casual abuse.
function limited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const fail = (status: number, error: string) =>
  Response.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  if (!consultEnabled()) return fail(503, "unavailable");

  // Same-origin only.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return fail(403, "forbidden");
    } catch {
      return fail(403, "forbidden");
    }
  }

  const forwarded = request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return fail(429, "rate_limited");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "bad_request");
  }
  const record = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  // Honeypot: a real visitor never fills this hidden field. Pretend it worked.
  if (typeof record["website"] === "string" && record["website"].trim() !== "") {
    return Response.json({ ok: true });
  }
  // Time trap: a form completed in under three seconds is a script.
  const elapsed = Number(record["elapsedMs"]);
  if (!Number.isFinite(elapsed) || elapsed < 3000) return fail(400, "too_fast");

  const result = validate(record);
  if (!result.ok) {
    return Response.json({ ok: false, error: "invalid", fields: result.errors }, { status: 422 });
  }
  const v = result.value;

  const key = process.env.RESEND_API_KEY;
  if (!key) return fail(503, "unavailable");
  const to = process.env.CONSULT_TO || site.email;
  const from = process.env.CONSULT_FROM || "5iveStack Labs <onboarding@resend.dev>";

  const text = [
    "New consultation request from the website.",
    "",
    `Name: ${v.name}`,
    `Email: ${v.email}`,
    `Phone: ${v.phone || "not given"}`,
    `Organisation type: ${labelFor(ORG_OPTIONS, v.org)}`,
    "Interested in:",
    ...v.services.map((s) => `- ${labelFor(SERVICE_OPTIONS, s)}`),
    "",
    "Message:",
    v.message,
    "",
    `Consent: the visitor ticked the Privacy Notice checkbox on ${new Date().toISOString()}.`,
    `Privacy notice last updated: ${privacy.lastUpdated ?? "not recorded"}.`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: [v.email],
      subject: `Consultation request from ${v.name}`,
      text,
    }),
  });

  if (!response.ok) {
    // Status only. Never log the request body or the visitor's details.
    console.error("consult: email provider returned status", response.status);
    return fail(502, "send_failed");
  }
  return Response.json({ ok: true });
}
