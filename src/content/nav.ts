export type NavItem = {
  label: string;
  href: `#${string}`;
  keywords?: string[];
};

/*
  Only sections that exist on the page belong here (header links and the command
  palette both read this list). Planned items, to add as their milestone lands:
    (none outstanding)
*/
export const navItems: readonly NavItem[] = [
  { label: "Systems", href: "#systems", keywords: ["layers", "services", "what we do", "hardware", "software"] },
  { label: "Work", href: "#work", keywords: ["projects", "portfolio", "case studies", "sms malawi", "saviour"] },
  { label: "Lab", href: "#lab", keywords: ["tools", "experiments", "demo", "cctv", "planner", "coverage"] },
  { label: "Consult", href: "#consult", keywords: ["contact", "quote", "enquiry", "request", "talk"] },
];
