/*
  Facts the privacy notice and the consultation form depend on. Everything that is
  null is still unknown and is shown on /privacy as "[... to be confirmed]" under a
  DRAFT banner. The consultation form stays switched off until `reviewed` is true
  (see src/lib/consult-config.ts). Source text and legal references:
  docs/privacy-notice-draft.md.
*/
export const privacy = {
  /** Set to true ONLY after a Malawian lawyer has reviewed /privacy and the facts below are filled in. */
  reviewed: false,

  /** e.g. "20 November 2026" */
  lastUpdated: null as string | null,
  /** Registered legal name of the business, e.g. "5iveStack Labs Limited". HANDOFF Q-13. */
  legalEntity: null as string | null,
  /** Registered address, including "Malawi". HANDOFF Q-13. */
  address: null as string | null,
  /** A phrase that completes "We keep them ...", e.g. "for up to 24 months after our last contact". */
  retentionEnquiries: null as string | null,
  /** e.g. "30 days". Confirm with the hosting provider. */
  retentionLogs: null as string | null,
  /** e.g. "the life of the contract and then for the period the law requires". */
  retentionContract: null as string | null,
  /** Complaint contact for the Data Protection Authority (MACRA). Get it from MACRA directly. */
  macraContact: null as string | null,
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
