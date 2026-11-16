/*
  Shared by the consultation form (client) and the API route (server). The server
  result is authoritative; the client runs the same function only to give quick feedback.
  No dependencies.
*/
export const SERVICE_OPTIONS = [
  { id: "software", label: "Custom software or a web platform" },
  { id: "android", label: "An Android app" },
  { id: "embedded", label: "Embedded systems or IoT hardware" },
  { id: "network", label: "Network design or enterprise hardware setup" },
  { id: "cctv", label: "CCTV and physical security" },
  { id: "consultation", label: "IT or technical consultation" },
] as const;

export const ORG_OPTIONS = [
  { id: "school", label: "School or education" },
  { id: "small-business", label: "Small business" },
  { id: "enterprise", label: "Enterprise or organisation" },
  { id: "partner", label: "Partner or reseller" },
  { id: "other", label: "Something else" },
] as const;

const SERVICE_IDS: readonly string[] = SERVICE_OPTIONS.map((o) => o.id);
const ORG_IDS: readonly string[] = ORG_OPTIONS.map((o) => o.id);

export type ConsultField =
  | "services"
  | "org"
  | "name"
  | "email"
  | "phone"
  | "message"
  | "consent";
export type FieldErrors = Partial<Record<ConsultField, string>>;

export type ConsultClean = {
  services: string[];
  org: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

/** One line of text: control characters and line breaks become spaces. */
export function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Multi-line text: keeps line breaks, removes other control characters. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9][0-9\s()-]{5,28}$/;

export function validate(
  raw: unknown,
): { ok: true; value: ConsultClean } | { ok: false; errors: FieldErrors } {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const services = Array.isArray(r["services"])
    ? [
        ...new Set(
          r["services"].filter(
            (s): s is string => typeof s === "string" && SERVICE_IDS.includes(s),
          ),
        ),
      ]
    : [];
  if (services.length === 0) errors.services = "Choose at least one option.";

  const orgRaw = r["org"];
  const org = typeof orgRaw === "string" && ORG_IDS.includes(orgRaw) ? orgRaw : "";
  if (!org) errors.org = "Choose the option that fits you best.";

  const name = cleanLine(r["name"], 100);
  if (name.length < 2) errors.name = "Enter your name.";

  const email = cleanLine(r["email"], 254);
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";

  const phone = cleanLine(r["phone"], 30);
  if (phone && !PHONE.test(phone)) {
    errors.phone = "Use digits, spaces and a leading + only, or leave this empty.";
  }

  const message = cleanText(r["message"], 2000);
  if (message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";

  if (r["consent"] !== true) {
    errors.consent = "Tick the box to confirm you have read the Privacy Notice.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { services, org, name, email, phone, message } };
}

export function labelFor(
  options: readonly { id: string; label: string }[],
  id: string,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}
