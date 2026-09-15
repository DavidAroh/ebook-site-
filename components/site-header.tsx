"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, List, X } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { label: "Why this book", href: "#learn" },
  { label: "Author", href: "#author" },
];

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Floating glass pill nav */}
      <nav
        aria-label="Main"
        className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 sm:top-5"
      >
        {/* Logo — always visible */}
        <Link
          href="#top"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-foreground/5 sm:px-4"
        >
          The New Way of Work
        </Link>

        {/* Desktop nav links */}
        <span className="mx-1 hidden h-4 w-px bg-border lg:block" aria-hidden="true" />
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <span className="mx-1 hidden h-4 w-px bg-border lg:block" aria-hidden="true" />

        {/* Desktop CTA */}
        <a
          href="#download"
          className="hidden whitespace-nowrap rounded-full bg-clay px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-clay/90 lg:inline-flex"
        >
          Get it free
        </a>

        {/* Theme toggle. Both states are rendered and CSS picks one, including
            the accessible name: branching on the resolved theme during render is
            what made the server and client disagree, since next-themes has no
            theme on the server. SSR emitted the sun, the client hydrated a moon,
            and React logged a hydration mismatch on every load. */}
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Sun weight="bold" className="size-3.5 dark:hidden" />
          <Moon weight="bold" className="hidden size-3.5 dark:block" />
          <span className="sr-only dark:hidden">Switch to dark theme</span>
          <span className="sr-only hidden dark:inline">
            Switch to light theme
          </span>
        </button>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
        >
          {menuOpen ? (
            <X weight="bold" className="size-4" />
          ) : (
            <List weight="bold" className="size-4" />
          )}
          <span className="sr-only">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-border/60 bg-background/90 p-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-foreground transition-colors hover:bg-foreground/5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-border/60 pt-3">
            <a
              href="#download"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-xl bg-clay px-4 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-clay/90"
            >
              Get it free
            </a>
          </div>
        </div>
      )}
    </>
  );
}
