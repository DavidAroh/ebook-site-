"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  onOpenSample?: () => void;
  onOpenCheckout?: () => void;
}

const NAV_ITEMS = [
  { label: "What you'll learn", href: "#learn" },
  { label: "Contents", href: "#contents" },
  { label: "Author", href: "#author" },
  { label: "FAQ", href: "#faq" },
];

export function SiteHeader({ onOpenSample, onOpenCheckout }: SiteHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="#top"
          className="whitespace-nowrap rounded-sm text-[15px] font-semibold tracking-tight text-foreground"
        >
          Automating with AI
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Sections"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-9 rounded-md text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Moon weight="bold" className="size-4" /> : <Sun weight="bold" className="size-4" />}
            <span className="sr-only">
              Switch to {isDark ? "light" : "dark"} theme
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={onOpenSample}
            className="hidden h-9 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            Sample
          </Button>

          <Button
            onClick={onOpenCheckout}
            className="h-9 rounded-md bg-gold px-4 text-sm font-semibold text-ocean-deep hover:bg-gold/90"
          >
            Get it — $19
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="size-9 rounded-md lg:hidden"
          >
            {menuOpen ? <X weight="bold" className="size-5" /> : <List weight="bold" className="size-5" />}
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Sections"
          className="border-t border-border bg-background px-6 py-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-sm py-2.5 text-sm text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSample?.();
                }}
                className="block rounded-sm py-2.5 text-sm text-foreground"
              >
                Read a sample
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
