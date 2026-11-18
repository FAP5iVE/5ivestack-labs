import type { Metadata } from "next";
import type { ReactNode } from "react";
import { missingPrivacyFacts, privacy } from "@/content/privacy";
import { site } from "@/content/site";

/*
  Privacy Notice (decision D-42). Text follows docs/privacy-notice-draft.md Part B,
  whose Malawi Data Protection Act, 2024 section references were checked against the
  Act's published text on 15 Nov 2026. Facts still unknown (src/content/privacy.ts)
  show as "[... to be confirmed]" under a DRAFT banner until the notice is reviewed.
*/

export const metadata: Metadata = {
  title: "Privacy Notice",
  alternates: { canonical: "/privacy" },
};

const link = "text-cobalt underline underline-offset-4";

function Fact({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <strong>[{label}: to be confirmed]</strong>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12 border-t border-rule pt-8">
      <h2 id={id} className="font-display text-title font-semibold">
        {title}
      </h2>
      <div className="mt-4 max-w-[var(--measure)] space-y-4 text-body">{children}</div>
    </section>
  );
}

const collected = [
  {
    what: "Enquiry details you give us through our consultation form: name, email address, phone number if you give one, type of organisation, the services you are interested in, and your message.",
    why: "To reply to you, understand what you need, and prepare a consultation or quotation.",
    basis:
      "Steps taken at your request before entering a contract, and your consent (Act, section 8(2)(b)(i) and 8(2)(a); GDPR Article 6(1)(b) and 6(1)(a)).",
  },
  {
    what: "Messages you send us by email, phone or WhatsApp: your contact details and what you tell us.",
    why: "To reply to you and keep a record of our conversation.",
    basis: "The same as above.",
  },
  {
    what: "Technical data when you visit the site: IP address, browser and device type, pages requested, date and time.",
    why: "To keep the site secure and working, and to find and fix faults.",
    basis:
      "Our legitimate interests in running a secure website (Act, section 8(2)(b)(vii); GDPR Article 6(1)(f)).",
  },
  {
    what: "Form-abuse checks: a hidden field and the time taken to complete the form.",
    why: "To block automated spam.",
    basis: "Our legitimate interests, as above.",
  },
  {
    what: "Your display choice: if you turn on Simple mode, a setting is saved in your own browser.",
    why: "To remember that choice. It is stored on your device only and is not used to identify or track you.",
    basis: "Needed to provide the feature you asked for.",
  },
] as const;

export default function PrivacyPage() {
  const draft = !privacy.reviewed || missingPrivacyFacts.length > 0;
  return (
    <main id="main" tabIndex={-1} className="py-12 focus:outline-none md:py-16">
      <div className="grid-page">
        <div className="col-span-full">
          {draft ? (
            <div role="note" className="mb-8 max-w-[var(--measure)] border-2 border-ink p-4">
              <p className="text-body font-medium">Draft: not yet reviewed.</p>
              <p className="mt-2 text-small">
                This notice is still being finalised and must be reviewed by a lawyer before it is
                relied on.
                {missingPrivacyFacts.length > 0
                  ? ` Still to be confirmed: ${missingPrivacyFacts.join(", ")}.`
                  : ""}
              </p>
            </div>
          ) : null}

          <h1 className="font-display font-wide text-display font-bold">Privacy Notice</h1>
          <p className="mt-4 text-body text-ink-muted">
            {site.name}. Last updated: <Fact value={privacy.lastUpdated} label="date" />
          </p>

          <Section id="who" title="1. Who we are">
            <p>
              <Fact value={privacy.legalEntity} label="legal entity name" />
              {privacy.legalEntity === site.name ? null : <>, trading as {site.name}</>}, of{" "}
              <Fact value={privacy.address} label="registered address" />, Malawi (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;), is the data controller for the personal data described in this
              notice.
            </p>
            <p>
              You can contact us about privacy at{" "}
              <a href={site.emailHref} className={link}>
                {site.email}
              </a>{" "}
              or on{" "}
              <a href={site.phoneHref} className={link}>
                {site.phoneDisplay}
              </a>
              .
            </p>
          </Section>

          <Section id="law" title="2. The law we follow">
            <p>
              We process personal data in line with the Data Protection Act, 2024 of Malawi (Act No.
              3 of 2024) (&ldquo;the Act&rdquo;). Where the law of another country also applies to
              you, including the EU General Data Protection Regulation (Regulation (EU) 2016/679)
              and the UK General Data Protection Regulation, we follow its requirements as well.
            </p>
          </Section>

          <Section id="collect" title="3. What we collect, why, and our lawful basis">
            <dl>
              {collected.map((row) => (
                <div key={row.what} className="border-t border-rule py-4">
                  <dt className="font-medium">{row.what}</dt>
                  <dd className="mt-2">
                    <span className="text-ink-muted">Why: </span>
                    {row.why}
                  </dd>
                  <dd className="mt-2">
                    <span className="text-ink-muted">Lawful basis: </span>
                    {row.basis}
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              We do not use advertising cookies or analytics tools on this site at present. If that
              changes, we will update this notice before we begin.
            </p>
            <p>
              We do not ask for sensitive personal data (as defined in section 2 of the Act:
              biometric data, race or ethnic origin, religious or other belief, health status,
              political opinion). Please do not include any in your messages.
            </p>
            <p>
              Our services are for businesses and organisations. We do not knowingly collect
              personal data from anyone under 18. Where a child&rsquo;s data is involved and consent
              is the basis, the Act requires the consent of a parent or legal guardian (section 17).
            </p>
          </Section>

          <Section id="consent" title="4. Consent">
            <p>
              Where we rely on your consent, you may withdraw it at any time by emailing us.
              Withdrawal does not affect processing that took place before you withdrew (Act,
              section 14(3) and (4); GDPR Article 7(3)). We ask for your consent separately for each
              purpose, and we do not make the service depend on consent we do not need.
            </p>
          </Section>

          <Section id="recipients" title="5. Who receives your data">
            <p>
              We share personal data only with providers who process it for us under written terms,
              and only as needed:
            </p>
            <ul>
              <li className="border-t border-rule py-3">
                <strong>Hosting:</strong> Vercel Inc., which hosts this website.
              </li>
              <li className="border-t border-rule py-3">
                <strong>Email delivery:</strong> Resend, which sends your form submission to our
                inbox.
              </li>
              <li className="border-t border-rule py-3">
                <strong>Email inbox:</strong> Google (Gmail), where we receive and answer enquiries.
              </li>
              <li className="border-y border-rule py-3">
                <strong>WhatsApp:</strong> if you choose to message us on WhatsApp, WhatsApp (Meta)
                processes that conversation under its own terms and privacy policy. Please read them
                before you use it.
              </li>
            </ul>
            <p>
              We do not sell personal data. We may disclose it where a law or a court order
              requires.
            </p>
          </Section>

          <Section id="transfers" title="6. Transfers outside Malawi">
            <p>
              Yes. Our hosting and email providers may process personal data outside Malawi,
              including in the United States. We transfer personal data only where the recipient is
              subject to a law, binding corporate rules, contractual clauses or another mechanism
              that gives an adequate level of protection, or where another condition in section
              39(4) of the Act applies (Act, sections 38 and 39). For people in the UK and EEA we
              rely on appropriate safeguards such as standard contractual clauses (GDPR Article 46).
              We keep a record of the basis for each transfer (section 38(2)).
            </p>
          </Section>

          <Section id="retention" title="7. How long we keep it">
            <ul>
              <li className="border-t border-rule py-3">
                Enquiries that do not lead to a contract:{" "}
                <Fact value={privacy.retentionEnquiries} label="retention period for enquiries" />,
                then deleted or made anonymous.
              </li>
              <li className="border-t border-rule py-3">
                If we enter into a contract with you:{" "}
                <Fact value={privacy.retentionContract} label="retention period for contract records" />.
              </li>
              <li className="border-y border-rule py-3">
                Server logs:{" "}
                <Fact value={privacy.retentionLogs} label="retention period for server logs" />.
              </li>
            </ul>
            <p>We do not keep personal data longer than necessary for its purpose (Act, section 12).</p>
          </Section>

          <Section id="security" title="8. How we protect it">
            <p>
              We use HTTPS encryption in transit, limit access to people who need it, and collect
              only what we need. If a personal data breach occurs, we will notify the Data
              Protection Authority within 72 hours and, where there is a high risk to you, tell you
              within 72 hours (Act, sections 36 and 37).
            </p>
          </Section>

          <Section id="rights" title="9. Your rights">
            <p>
              Under Part IV of the Act (sections 19 to 25), and under Articles 15 to 22 of the GDPR
              where it applies, you have the right to:
            </p>
            <ul>
              <li className="border-t border-rule py-3">
                <strong>Access</strong> your personal data and receive a copy, normally within 30
                days and free of charge where practicable (section 19).
              </li>
              <li className="border-t border-rule py-3">
                <strong>Receive it in a portable format</strong> and have it sent to another
                controller (section 20).
              </li>
              <li className="border-t border-rule py-3">
                <strong>Correct</strong> errors or complete incomplete data. We act within 14 days
                (section 21).
              </li>
              <li className="border-t border-rule py-3">
                <strong>Have it erased</strong> in the circumstances the Act lists (section 22).
              </li>
              <li className="border-t border-rule py-3">
                <strong>Restrict</strong> our processing (section 23).
              </li>
              <li className="border-t border-rule py-3">
                <strong>Object</strong> to processing based on legitimate interests, and to direct
                marketing (section 24).
              </li>
              <li className="border-y border-rule py-3">
                <strong>Not be subject to a decision based solely on automated processing</strong>{" "}
                that has a legal or similarly significant effect (section 25). We make no such
                decisions.
              </li>
            </ul>
            <p>
              To use any right, email{" "}
              <a href={site.emailHref} className={link}>
                {site.email}
              </a>
              . We may ask you to confirm your identity first. Some rights can be limited in the
              cases listed in section 26 of the Act.
            </p>
          </Section>

          <Section id="complaints" title="10. Complaints">
            <p>
              If you are unhappy with how we handle your personal data, please contact us first so
              we can put it right. You also have the right to complain, in writing, to the Data
              Protection Authority, which is the Malawi Communications Regulatory Authority (MACRA){" "}
              (<Fact value={privacy.macraContact} label="MACRA contact details" />). A complaint
              should be lodged within 90 days of the action or inaction you complain about (Act,
              section 44). You may also bring a civil claim for loss or harm caused by a breach of
              the Act (section 47). If you live in the UK or EEA, you may complain to your local data
              protection supervisory authority (GDPR Article 77).
            </p>
          </Section>

          <Section id="links" title="11. Links to other services">
            <p>
              Links to WhatsApp, email and other services are provided for convenience. Their own
              privacy policies apply once you leave this site.
            </p>
          </Section>

          <Section id="changes" title="12. Changes to this notice">
            <p>
              We will publish changes on this page and update the date above. If a change affects
              how we use data you have already given us, we will tell you before it takes effect
              where we can.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
