/*
  Selected work shown in the Work section. Facts come from the owner's own
  description (Resources.zip, 15 Nov 2026). Nothing here is invented: there are
  no outcome numbers because none were supplied (HANDOFF Q-04). The owner stated
  they have permission to show these projects.
*/
export type WorkImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type WorkProject = {
  slug: string;
  name: string;
  summary: string;
  role: string;
  /** Technology, only when the owner has said what it was. */
  builtWith?: string;
  liveUrl: string;
  images: readonly WorkImage[];
};

export const projects: readonly WorkProject[] = [
  {
    slug: "sms-malawi",
    name: "SMS Malawi",
    summary:
      "A web-based school management system that digitises school administration, academic operations, financial management, communication and student services. Administrators, teachers, finance officers and students work from role-based dashboards and workflows.",
    role: "Developer",
    liveUrl: "https://sms-malawi.vercel.app",
    images: [
      {
        src: "/work/sms-malawi/school-website-home.webp",
        width: 1400,
        height: 712,
        alt: "Public website of Chikangawa Hills Academy, a boarding and day secondary school, showing the school building behind the school name and two buttons.",
      },
      {
        src: "/work/sms-malawi/portal-sign-in-dark.webp",
        width: 1400,
        height: 712,
        alt: "SMS Malawi portal sign-in page in dark mode, with a hill-contour illustration and a sign-in form for authorised students and staff.",
      },
      {
        src: "/work/sms-malawi/portal-sign-in-light.webp",
        width: 1400,
        height: 712,
        alt: "The same sign-in page in light mode.",
      },
      {
        src: "/work/sms-malawi/student-application-form.webp",
        width: 1400,
        height: 714,
        alt: "Online admission application form, personal details step, with a list of steps down the left side.",
      },
    ],
  },
  {
    slug: "saviour-digital-solutions",
    name: "Saviour Digital Solutions",
    summary:
      "A mobile-first business website for a digital agency in Blantyre, Malawi. It presents web development, digital marketing and data collection services and tiered pricing packages, with interactive small-business demos, WhatsApp click-to-chat and a dynamic quote request form for local entrepreneurs.",
    role: "Developer",
    builtWith: "HTML, CSS and JavaScript",
    liveUrl: "https://saviourdigitalsolutions.netlify.app/",
    images: [
      {
        src: "/work/saviour/home-hero.webp",
        width: 1400,
        height: 695,
        alt: "Saviour Digital Solutions home page with the headline 'Your business, online and easy to find.' and buttons to get a free quote or see their work.",
      },
      {
        src: "/work/saviour/services.webp",
        width: 1400,
        height: 677,
        alt: "Services page listing website design and development, starter sites for small businesses, online shops and Google Business Profile setup.",
      },
      {
        src: "/work/saviour/packages.webp",
        width: 1400,
        height: 679,
        alt: "Packages page with three pricing tiers named Starter, Business and Growth.",
      },
      {
        src: "/work/saviour/footer-contact.webp",
        width: 1400,
        height: 688,
        alt: "Page footer with contact details for Blantyre, Malawi above a large blue Saviour Digital Solutions wordmark.",
      },
    ],
  },
] as const;
