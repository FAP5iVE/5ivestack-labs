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
  lastUpdated: "16 November 2026" as string | null, // date this reviewed version went live; edit if counsel gave a different date
  /** Registered legal name of the business, e.g. "5iveStack Labs Limited". HANDOFF Q-13. */
  legalEntity: null as string | null,
  /** Registered address, including "Malawi". HANDOFF Q-13. */
  address: "M & L Attorneys, Private Bag 202, Blantyre" as string | null, // supplied by the owner; confirm whether this is the registered office or the law firm's contact (HANDOFF Q-13)
  /** A phrase that completes "We keep them ...", e.g. "for up to 24 months after our last contact". */
  retentionEnquiries: "for up to 1 year after our last contact" as string | null,
  /** e.g. "30 days". Confirm with the hosting provider. */
  retentionLogs: null as string | null,
  /** e.g. "the life of the contract and then for the period the law requires". */
  retentionContract: null as string | null,
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
