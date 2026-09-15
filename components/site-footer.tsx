"use client";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Shammah Nei. The New Way of Work.
          </p>
          <nav className="flex items-center gap-4">
            <a
              href="#learn"
              className="rounded-sm transition-colors hover:text-foreground"
            >
              About
            </a>
            <a
              href="mailto:hello@shammahnei.com"
              className="rounded-sm transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
