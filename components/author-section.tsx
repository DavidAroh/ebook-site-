"use client";

import Image from "next/image";

export function AuthorSection() {
  return (
    <div id="author" className="scroll-mt-24 mx-auto max-w-7xl px-6">
      <div className="grid items-start gap-12 md:grid-cols-[240px_1fr] md:gap-16">
        <div className="relative aspect-square w-48 overflow-hidden rounded-2xl border border-border md:w-full">
          <Image
            src="/images/shammah-author.jpg"
            alt="Shammah Nei"
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>

        <div className="max-w-[55ch] space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-clay-ink">
            About the author
          </p>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            No hype, no math, no code
          </h2>

          <p className="text-lg leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Shammah Nei
            </strong>{" "}
            is an automation practitioner who advises founders, operations
            leads, and creators on building AI workflows that hold up in
            production.
          </p>

          <p className="text-lg leading-relaxed text-muted-foreground">
            After watching hundreds of capable people type shallow prompts
            into chatbots for a week and give up, he wrote down the craft that
            actually separates them from the people getting real leverage:
            projects, connectors, and scheduled work.
          </p>

          <p className="pt-2 text-sm text-muted-foreground">
            <a
              href="mailto:hello@shammahnei.com"
              className="rounded-sm underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              hello@shammahnei.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
