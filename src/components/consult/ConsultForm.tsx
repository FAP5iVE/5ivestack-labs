"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { privacy } from "@/content/privacy";
import { site } from "@/content/site";
import {
  ORG_OPTIONS,
  SERVICE_OPTIONS,
  validate,
  type ConsultField,
  type FieldErrors,
} from "@/lib/consult";

/*
  Three-step consultation form (decisions D-40 to D-42), one question group per
  screen so it works on any phone. Steps are a real sequence, so "Step 1 of 3" is
  used. Plain controls at 44px or more, 16px or larger text (no iOS zoom), errors
  stated in words (not colour alone), focus moves to each step's heading.
  The server re-validates everything; this component only gives quick feedback.
*/

type Values = {
  services: string[];
  org: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const EMPTY: Values = {
  services: [],
  org: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

const STEP_FIELDS: Record<1 | 2 | 3, ConsultField[]> = {
  1: ["services"],
  2: ["org", "name", "email", "phone"],
  3: ["message", "consent"],
};
const STEP_TITLES: Record<1 | 2 | 3, string> = {
  1: "What do you need?",
  2: "About you",
  3: "Your message",
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-control border border-ink bg-paper px-4 text-body";
const optionClass =
  "flex min-h-11 cursor-pointer items-center gap-4 border-t border-rule py-2 text-body";
const buttonSecondary =
  "inline-flex min-h-11 items-center rounded-control border border-ink px-6 text-body font-medium";
const buttonPrimary =
  "inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink disabled:opacity-60";

export function ConsultForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [notice, setNotice] = useState("");
  const [trap, setTrap] = useState("");
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // After the first step change, move focus to the new heading so screen readers and keyboards follow.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step, status]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const toggleService = (id: string) =>
    set(
      "services",
      values.services.includes(id)
        ? values.services.filter((s) => s !== id)
        : [...values.services, id],
    );

  function errorsForStep(target: 1 | 2 | 3): FieldErrors {
    const result = validate(values);
    if (result.ok) return {};
    const subset: FieldErrors = {};
    for (const field of STEP_FIELDS[target]) {
      const message = result.errors[field];
      if (message) subset[field] = message;
    }
    return subset;
  }

  function goTo(target: 1 | 2 | 3) {
    moved.current = true;
    setStep(target);
  }

  function next() {
    const stepErrors = errorsForStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0 && step < 3) goTo((step + 1) as 2 | 3);
  }

  async function send() {
    const result = validate(values);
    if (!result.ok) {
      setErrors(result.errors);
      const first = ([1, 2, 3] as const).find((s) =>
        STEP_FIELDS[s].some((f) => result.errors[f]),
      );
      if (first) goTo(first);
      return;
    }
    setStatus("sending");
    setNotice("");
    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: trap,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        fields?: FieldErrors;
      };
      if (response.ok && data.ok) {
        moved.current = true;
        setStatus("done");
        return;
      }
      if (response.status === 422 && data.fields) {
        setErrors(data.fields);
        const first = ([1, 2, 3] as const).find((s) =>
          STEP_FIELDS[s].some((f) => data.fields?.[f]),
        );
        setStatus("idle");
        if (first) goTo(first);
        return;
      }
      setNotice(
        response.status === 429
          ? "Too many requests from this connection. Please try again later, or contact us directly."
          : "We could not send your request. Please try again, or contact us directly.",
      );
      setStatus("error");
    } catch {
      setNotice("We could not reach the server. Check your connection and try again, or contact us directly.");
      setStatus("error");
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    if (step < 3) next();
    else void send();
  }

  const entity = privacy.legalEntity
    ? `${privacy.legalEntity}, trading as ${site.name}`
    : site.name;
  const retention = privacy.retentionEnquiries ?? "for no longer than we need to deal with your request";

  if (status === "done") {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-title font-semibold focus:outline-none"
        >
          Thank you{values.name ? `, ${values.name.split(" ")[0]}` : ""}.
        </h3>
        <p className="mt-4 max-w-[var(--measure)] text-body">
          We have your request and will reply to {values.email}. If you do not hear from us,
          email{" "}
          <a href={site.emailHref} className="text-cobalt underline underline-offset-4">
            {site.email}
          </a>{" "}
          or message us on{" "}
          <a
            href={site.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cobalt underline underline-offset-4"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  const fieldError = (field: ConsultField) =>
    errors[field] ? (
      <p id={`err-${field}`} role="alert" className="mt-2 text-small font-medium">
        Problem: {errors[field]}
      </p>
    ) : null;
  const invalid = (field: ConsultField) => (errors[field] ? "border-2" : "");

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Consultation request">
      {/* Honeypot: hidden from people, tempting to scripts. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </label>
      </div>

      <p className="font-mono text-small tabular-nums text-ink-muted">Step {step} of 3</p>
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-title font-semibold focus:outline-none"
      >
        {STEP_TITLES[step]}
      </h3>

      {step === 1 ? (
        <fieldset className="mt-6" aria-describedby={errors.services ? "err-services" : undefined}>
          <legend className="max-w-[var(--measure)] text-body text-ink-muted">
            Choose everything that applies.
          </legend>
          <div className="mt-4 border-b border-rule">
            {SERVICE_OPTIONS.map((option) => (
              <label key={option.id} className={optionClass}>
                <input
                  type="checkbox"
                  className="h-6 w-6 shrink-0 accent-ink"
                  checked={values.services.includes(option.id)}
                  onChange={() => toggleService(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {fieldError("services")}
        </fieldset>
      ) : null}

      {step === 2 ? (
        <div className="mt-6">
          <fieldset aria-describedby={errors.org ? "err-org" : undefined}>
            <legend className="text-body font-medium">Who are you?</legend>
            <div className="mt-2 border-b border-rule">
              {ORG_OPTIONS.map((option) => (
                <label key={option.id} className={optionClass}>
                  <input
                    type="radio"
                    name="org"
                    className="h-6 w-6 shrink-0 accent-ink"
                    checked={values.org === option.id}
                    onChange={() => set("org", option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {fieldError("org")}
          </fieldset>

          <div className="mt-8">
            <label htmlFor="consult-name" className="text-body font-medium">
              Your name <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <input
              id="consult-name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "err-name" : undefined}
              className={`${inputClass} ${invalid("name")}`}
            />
            {fieldError("name")}
          </div>

          <div className="mt-6">
            <label htmlFor="consult-email" className="text-body font-medium">
              Email address <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <input
              id="consult-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "err-email" : undefined}
              className={`${inputClass} ${invalid("email")}`}
            />
            {fieldError("email")}
          </div>

          <div className="mt-6">
            <label htmlFor="consult-phone" className="text-body font-medium">
              Phone number <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="consult-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "err-phone" : undefined}
              className={`${inputClass} ${invalid("phone")}`}
            />
            {fieldError("phone")}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6">
          <label htmlFor="consult-message" className="text-body font-medium">
            Tell us about your project or problem{" "}
            <span className="font-normal text-ink-muted">(required)</span>
          </label>
          <textarea
            id="consult-message"
            rows={6}
            required
            maxLength={2000}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "err-message" : undefined}
            className={`${inputClass} py-3 ${invalid("message")}`}
          />
          {fieldError("message")}

          <p className="mt-8 max-w-[var(--measure)] text-small text-ink-muted">
            <strong className="font-medium text-ink">How we use your details.</strong> {entity} will
            use what you enter only to reply to your request. Our lawful basis is your request and
            your consent. We keep your details {retention}. Our hosting and email providers process
            them for us, some outside Malawi. You can access, correct or delete your data, withdraw
            consent at any time, and complain to the Malawi Communications Regulatory Authority.
            Read the full{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cobalt underline underline-offset-4"
            >
              Privacy Notice (opens in a new tab)
            </a>
            . Questions: {site.email}.
          </p>

          <label className={`${optionClass} mt-4 border-b`}>
            <input
              type="checkbox"
              className="h-6 w-6 shrink-0 accent-ink"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "err-consent" : undefined}
            />
            <span>
              I have read the Privacy Notice and agree that {site.name} may use my details to reply
              to this request.
            </span>
          </label>
          {fieldError("consent")}
        </div>
      ) : null}

      {status === "error" ? (
        <p role="alert" className="mt-6 max-w-[var(--measure)] text-body font-medium">
          {notice}{" "}
          <a href={site.emailHref} className="text-cobalt underline underline-offset-4">
            {site.email}
          </a>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4">
        {step > 1 ? (
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => goTo((step - 1) as 1 | 2)}
          >
            Back
          </button>
        ) : null}
        <button type="submit" className={buttonPrimary} disabled={status === "sending"}>
          {step < 3 ? "Next" : status === "sending" ? "Sending" : "Send request"}
        </button>
      </div>
    </form>
  );
}
