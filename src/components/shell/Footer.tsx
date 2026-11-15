import { site } from "@/content/site";
import { SimpleModeToggle } from "./SimpleModeToggle";

/* Footer: contact details (supplied by the owner) and the Simple mode toggle. */
const linkClass = "inline-flex min-h-11 items-center text-body text-cobalt underline underline-offset-4";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule py-12">
      <div className="grid-page items-start gap-y-12">
        <div className="col-span-full md:col-span-4">
          <p className="text-body font-medium">{site.name}</p>
          <ul className="mt-4 flex flex-col">
            <li>
              <a href={site.emailHref} className={linkClass}>
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className={linkClass}>
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div className="col-span-full md:col-span-4 md:justify-self-end">
          <SimpleModeToggle />
        </div>
      </div>
    </footer>
  );
}
