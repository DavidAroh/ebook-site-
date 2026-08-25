"use client";

import Link from "next/link";
import { EmailSignup } from "@/components/email-signup";

const LINKS = [
  { label: "What you'll learn", href: "#learn" },
  { label: "Contents", href: "#contents" },
  { label: "Editions", href: "#buy" },
  { label: "Author", href: "#author" },
  { label: "FAQ", href: "#faq" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="max-w-[42ch] space-y-3">
            <p className="text-base font-semibold text-foreground">
              Free chapters by email
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chapters 1–3 and the universal prompt template, sent as a PDF.
            </p>
            <EmailSignup />
          </div>

          <nav aria-label="Footer" className="md:justify-self-end">
            <ul className="space-y-2.5 text-sm">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:hello@shammahnei.com"
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  hello@shammahnei.com
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Shammah Nei. Automating with AI.
          </p>
          <p>DRM-free · 30-day money-back guarantee</p>
        </div>
      </div>
    </footer>
  );
}
