import Image from "next/image";
import Link from "next/link";
import { layers } from "@/content/layers";
import { navItems } from "@/content/nav";
import { site } from "@/content/site";
import { SimpleModeToggle } from "./SimpleModeToggle";

/*
  Footer (decision D-52). A dark ink surface, like the dark viewports, in four bands:
  a call to action, the five values, link columns, and a legal line. No cards, gradients,
  shadows or glow: structure comes from hairlines, type size and the orange accent.
  `data-viewport` flips the focus ring to paper (see globals.css). Colours on ink follow
  D-05: paper for text, sky for secondary text and lines, orange for the action.
  Links to sections use "/#id" so they also work from /privacy.
*/

const columnTitle = "text-small font-medium text-sky";
// Orange underline on hover or focus; transparent otherwise so nothing shifts.
const linkClass =
  "inline-flex min-h-11 items-center border-b-2 border-transparent text-body text-paper transition-colors duration-300 hover:border-orange";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-viewport className="mt-24 bg-ink text-paper">
      {/* 1. Call to action */}
      <div className="grid-page gap-y-8 pb-12 pt-16 md:pb-16 md:pt-24">
        <div className="col-span-full lg:col-span-9">
          <p className={columnTitle}>Start a project</p>
          <p className="mt-4 font-display font-wide text-display font-bold">
            Have a system in mind? Let&rsquo;s build it together.
          </p>
        </div>
        <div className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={site.emailEnquiryHref}
            className="inline-flex min-h-11 items-center rounded-control bg-orange px-6 text-body font-medium text-ink"
          >
            Email us
          </a>
          <Link
            href="/#consult"
            className="inline-flex min-h-11 items-center text-body text-sky underline underline-offset-4"
          >
            Start a consultation
          </Link>
        </div>
      </div>

      {/* 2. The five values, one segment each */}
      <div className="border-t border-paper/25">
        <div className="grid-page py-12">
          <ul className="col-span-full grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5 md:gap-x-6">
            {[...layers]
              .sort((a, b) => a.level - b.level)
              .map((layer) => (
                <li key={layer.level} className="group">
                  <span aria-hidden className="relative block h-1 w-full bg-sky/40">
                    <span className="absolute inset-y-0 left-0 block w-0 bg-orange transition-[width] duration-500 group-hover:w-full" />
                  </span>
                  <span className="mt-4 block font-mono text-small tabular-nums text-sky">
                    L{layer.level}
                  </span>
                  <span className="mt-1 block text-body font-medium">{layer.value}</span>
                  <span className="block text-small text-sky">{layer.name}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* 3. Link columns */}
      <div className="border-t border-paper/25">
        <div className="grid-page gap-y-12 py-16">
          <div className="col-span-full lg:col-span-4">
            <Link href="/" aria-label="5iveStack Labs, home" className="inline-block">
              <Image
                src="/brand/5iveStack-Labs_horizontal_reverse.svg"
                alt=""
                width={680}
                height={205}
                className="h-auto w-56 md:w-64"
              />
            </Link>
            <p className="mt-4 max-w-[28rem] text-body text-sky">
              Hardware, software, networks and security from one team. Registered in Malawi.
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-full md:col-span-4 lg:col-span-2">
            <h2 className={columnTitle}>Explore</h2>
            <ul className="mt-4 flex flex-col">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={`/${item.href}`} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-full md:col-span-4 lg:col-span-3">
            <h2 className={columnTitle}>Contact</h2>
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
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-full md:col-span-4 lg:col-span-3 lg:justify-self-end">
            <h2 className={columnTitle}>Display and legal</h2>
            <div className="mt-4">
              <SimpleModeToggle onDark />
            </div>
            <Link href="/privacy" className={`${linkClass} mt-4`}>
              Privacy Notice
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Legal line */}
      <div className="border-t border-paper/25">
        <div className="grid-page pb-[calc(2rem+var(--safe-bottom))] pt-8">
          <div className="col-span-full flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <p className="text-small text-sky">
              &copy; {year} {site.name}. Registered in Malawi.
            </p>
            <a href="#main" className={`${linkClass} text-small`}>
              Back to top
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 13V3M3 7l5-5 5 5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
