/*
  Facts the privacy notice and the consultation form depend on. Everything that is
  null is still unknown and is shown on /privacy as "[... to be confirmed]" under a
  DRAFT banner. The consultation form stays switched off until `reviewed` is true
  (see src/lib/consult-config.ts). Source text and legal references:
  docs/privacy-notice-draft.md.
*/
export const privacy = {
  /** Set to true ONLY after a Malawian lawyer has reviewed /privacy and the facts below are filled in. */
  reviewed: true, // owner confirmed on 16 Nov 2026 that a Malawian lawyer reviewed the notice the night before

  /** e.g. "20 November 2026" */
  lastUpdated: "18 November 2026" as string | null, // 16 Nov 2026 went live after lawyer review; 18 Nov 2026 filled the legal name, log and contract retention and dropped "trading as" (D-58). Ask counsel to glance at those changes
  /** Registered legal name of the business, e.g. "5iveStack Labs Limited". HANDOFF Q-13. */
  legalEntity: "5iveStack Labs" as string | null, // owner confirmed on 18 Nov 2026: the registered name is exactly "5iveStack Labs" (same as the project name)
  /** Registered address, including "Malawi". HANDOFF Q-13. */
  address: "M & L Attorneys, Private Bag 202, Blantyre" as string | null, // supplied by the owner; owner confirmed on 18 Nov 2026 that this is the registered office
  /** A phrase that completes "We keep them ...", e.g. "for up to 24 months after our last contact". */
  retentionEnquiries: "for up to 1 year after our last contact" as string | null,
  /** e.g. "30 days". Confirm with the hosting provider. */
  retentionLogs: "up to 30 days" as string | null, // owner chose the standard recommended period on 18 Nov 2026 (draft suggestion, docs/privacy-notice-draft.md); a ceiling, the host may keep logs for less
  /** e.g. "the life of the contract and then for the period the law requires". */
  retentionContract: "for the life of the contract and then for the period required by law or by our legal obligations" as string | null, // owner chose the standard recommended wording on 18 Nov 2026 (draft suggestion); no fixed number invented
  /** Complaint contact for the Data Protection Authority (MACRA). Get it from MACRA directly. */
  macraContact:
    "Malawi Communications Regulatory Authority, 9 Salmin Amour Road, Private Bag 261, Blantyre, Malawi; macra.mw" as string | null, // from MACRA's complaints page, 16 Nov 2026
} as const;

export const missingPrivacyFacts: string[] = [
  ["last updated date", privacy.lastUpdated],
  ["legal entity name", privacy.legalEntity],
  ["registered address", privacy.address],
  ["retention period for enquiries", privacy.retentionEnquiries],
  ["retention period for server logs", privacy.retentionLogs],
  ["retention period for contract records", privacy.retentionContract],
  ["MACRA contact details", privacy.macraContact],
]
  .filter(([, value]) => value === null)
  .map(([label]) => label as string);
