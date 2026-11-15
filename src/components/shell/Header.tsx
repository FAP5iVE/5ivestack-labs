import Image from "next/image";
import Link from "next/link";
import { navItems } from "@/content/nav";
import { CommandPalette } from "./CommandPalette";

/*
  Sticky header. Height is 4rem plus the top safe-area inset (--header-h in
  globals.css). Links show from lg upward; below that, the Menu button opens
  the command palette as a full-screen sheet. The orange bar is the page
  progress indicator, driven by --page-progress (see ScrollEngine).
*/
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper pt-[var(--safe-top)]">
      <div className="grid-page">
        <div className="col-span-full flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="5iveStack Labs, home" className="inline-flex min-h-11 items-center">
            <Image
              src="/brand/5iveStack-Labs_horizontal_color.svg"
              alt=""
              width={584}
              height={109}
              priority
              className="h-auto w-40"
            />
          </Link>
          <div className="flex items-center gap-8">
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex min-h-11 items-center text-body underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <CommandPalette />
          </div>
        </div>
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-orange"
        style={{ transform: "scaleX(var(--page-progress, 0))" }}
      />
    </header>
  );
}
