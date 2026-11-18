/*
  Company facts and copy used across the site.
  Contact details were supplied by the owner on 15 Nov 2026.
  Description copy: approved by the owner on 18 Nov 2026 and polished the same day (D-51).
*/
export const site = {
  name: "5iveStack Labs",
  url: "https://5ivestack-labs.vercel.app", // live since 15 Nov 2026; replace when a custom domain exists (HANDOFF Q-09)

  // Approved by the owner on 18 Nov 2026. "Registered" is the owner's own statement that the company is registered with the Malawi government.
  description:
    "We are a registered Malawian technology company. We design, build and install complete systems: custom software and Android apps, embedded and IoT hardware, networks and CCTV security, with IT consultation across all of it.",

  email: "fivestacklabs@gmail.com",
  emailHref: "mailto:fivestacklabs@gmail.com",
  // Used by the hero button: opens a new email with a subject already filled in.
  emailEnquiryHref:
    "mailto:fivestacklabs@gmail.com?subject=Enquiry%20from%20the%205iveStack%20Labs%20website",
  phoneDisplay: "+265 991 974 388",
  phoneHref: "tel:+265991974388",
  whatsappHref: "https://wa.me/265991974388",
} as const;
