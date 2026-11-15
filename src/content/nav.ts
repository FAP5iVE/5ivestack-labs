export type NavItem = {
  label: string;
  href: `#${string}`;
  keywords?: string[];
};

/*
  Only sections that exist on the page belong here (header links and the command
  palette both read this list). Planned items, to add as their milestone lands:
    Systems #systems (M3), Work #work (M3), Lab #lab (M3), Consult #consult (M4)
*/
export const navItems: readonly NavItem[] = [
  { label: "Layers", href: "#layers", keywords: ["services", "what we do", "hardware", "software"] },
];
