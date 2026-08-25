"use client";

import Image from "next/image";

export function AuthorSection() {
  return (
    <section
      id="author"
      className="scroll-mt-16 border-b border-border bg-secondary"
    >
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 md:grid-cols-[200px_1fr] md:items-start md:gap-14">
          <div className="relative aspect-square w-40 overflow-hidden rounded-md border border-border ring-2 ring-gold/20 md:w-full">
            <Image
              src="/images/shammah-author.jpg"
              alt="Shammah Nei"
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>

          <div className="max-w-[62ch] space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
              About the author
            </p>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
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
    </section>
  );
}
