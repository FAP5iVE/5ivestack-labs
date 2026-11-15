"use client";

import { Command } from "cmdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { navItems } from "@/content/nav";
import { site } from "@/content/site";
import { getLenis, lockScroll } from "@/lib/scroll";
import { setSimpleMode, useTierState } from "@/lib/tier";

/*
  Command palette (decisions D-20). A visible Menu button opens it on every
  screen size, so touch and mouse users never need the keyboard shortcut.
  Phone: full-screen sheet. md and up: centred dialog. Ctrl+K or Cmd+K toggles it.
  While open, Lenis is paused so the page behind does not scroll.
*/

const itemClass =
  "flex min-h-11 cursor-pointer items-center px-4 text-body data-[selected=true]:bg-ink data-[selected=true]:text-paper";
const groupClass =
  "[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:text-small [&_[cmdk-group-heading]]:text-ink-muted";

function headerHeight(): number {
  return document.querySelector("header")?.getBoundingClientRect().height ?? 0;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
  const { simple } = useTierState();

  const changeOpen = useCallback((next: boolean) => {
    openRef.current = next;
    setOpen(next);
    if (next) {
      releaseRef.current ??= lockScroll();
    } else {
      releaseRef.current?.();
      releaseRef.current = null;
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        changeOpen(!openRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      releaseRef.current?.(); // never leave smooth scrolling paused after unmount
      releaseRef.current = null;
    };
  }, [changeOpen]);

  const goTo = useCallback(
    (href: string) => {
      changeOpen(false);
      // Wait one frame so the dialog has unmounted and released its own scroll lock.
      window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(target, { offset: -headerHeight() });
        } else {
          // Native path (phones, Simple mode): html has scroll-padding-top for the header.
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
        window.history.replaceState(null, "", href);
      });
    },
    [changeOpen],
  );

  const openContact = useCallback(
    (href: string, external: boolean) => {
      // Run in the same user gesture so pop-up blockers allow it.
      if (external) window.open(href, "_blank", "noopener,noreferrer");
      else window.location.assign(href);
      changeOpen(false);
    },
    [changeOpen],
  );

  const toTop = useCallback(() => {
    changeOpen(false);
    window.requestAnimationFrame(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }, [changeOpen]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => changeOpen(true)}
        className="inline-flex min-h-11 items-center gap-3 rounded-control border border-ink px-4 text-body font-medium"
      >
        <span>Menu</span>
        <span aria-hidden className="hidden font-mono text-small text-ink-muted md:inline">
          Ctrl K
        </span>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={changeOpen}
        label="Site menu"
        loop
        className="flex min-h-0 flex-1 flex-col"
        overlayClassName="fixed inset-0 z-50 bg-ink/60"
        contentClassName="fixed inset-0 z-50 flex flex-col bg-paper pt-[var(--safe-top)] pb-[var(--safe-bottom)] md:inset-auto md:left-1/2 md:top-24 md:max-h-[32rem] md:w-[36rem] md:-translate-x-1/2 md:rounded-control md:border md:border-ink"
      >
        <div className="flex items-center gap-2 border-b border-ink">
          {/* text-body is 16px or larger, so iOS does not zoom the page on focus */}
          <Command.Input
            autoFocus
            placeholder="Go to a section or change a setting"
            className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-body placeholder:text-ink-muted focus-visible:-outline-offset-2"
          />
          <button
            type="button"
            onClick={() => changeOpen(false)}
            className="min-h-11 min-w-11 px-4 text-body font-medium"
          >
            Close
          </button>
        </div>

        <Command.List
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
        >
          <Command.Empty className="px-4 py-6 text-body text-ink-muted">
            Nothing matches that.
          </Command.Empty>

          <Command.Group heading="Go to" className={groupClass}>
            {navItems.map((item) => (
              <Command.Item
                key={item.href}
                value={item.label}
                keywords={item.keywords}
                onSelect={() => goTo(item.href)}
                className={itemClass}
              >
                {item.label}
              </Command.Item>
            ))}
            <Command.Item value="Back to top" onSelect={toTop} className={itemClass}>
              Back to top
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Contact" className={groupClass}>
            <Command.Item
              value="WhatsApp"
              keywords={["message", "chat"]}
              onSelect={() => openContact(site.whatsappHref, true)}
              className={itemClass}
            >
              WhatsApp {site.phoneDisplay}
            </Command.Item>
            <Command.Item
              value="Call"
              keywords={["phone", "telephone"]}
              onSelect={() => openContact(site.phoneHref, false)}
              className={itemClass}
            >
              Call {site.phoneDisplay}
            </Command.Item>
            <Command.Item
              value="Email"
              keywords={["mail", "gmail"]}
              onSelect={() => openContact(site.emailHref, false)}
              className={itemClass}
            >
              Email {site.email}
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Settings" className={groupClass}>
            <Command.Item
              value="Simple mode"
              keywords={["plain", "motion", "3d", "performance", "accessibility"]}
              onSelect={() => {
                setSimpleMode(!simple);
                changeOpen(false);
              }}
              className={itemClass}
            >
              {simple ? "Turn off Simple mode" : "Turn on Simple mode (no 3D, no smooth scrolling)"}
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
