"use client";

import { useState } from "react";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Book3D } from "@/components/book-3d";
import { InteractiveReader } from "@/components/interactive-reader";
import { PricingTiers } from "@/components/pricing-tiers";
import { AuthorSection } from "@/components/author-section";
import { FaqSection } from "@/components/faq-section";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";

const LESSONS = [
  {
    title: "Talk so AI understands — and pushes back",
    body: "The Leading Prompt: why asking for five clarifying questions before it starts beats a one-shot command.",
  },
  {
    title: "Set up Projects so you never re-explain context",
    body: "Upload your brand voice, contact sheets, and past examples once. Stop re-typing who you are every session.",
  },
  {
    title: "Automate seven real workflows",
    body: "Inbox triage, weekly status reports, research synthesis, applications, content pipelines, ad copy, follow-up.",
  },
];

const CONTENTS = [
  {
    part: "Part one",
    range: "Chapters 1–5",
    title: "Foundations",
    items: [
      "What this handbook will do for you",
      "The two ways: Chat vs. Cowork",
      "How to actually talk to Claude",
      "Choosing the right model",
      "Projects, files, and connectors",
    ],
  },
  {
    part: "Part two",
    range: "Chapters 6–12",
    title: "The recipes",
    items: [
      "Email assistant: daily inbox triage",
      "Weekly reports from calendar and sent mail",
      "Research and synthesis with counter-arguments",
      "Job and scholarship applications",
      "Content pipeline (Notion + Sheets)",
      "Ad copy and creative variations",
      "Customer follow-up, personalised at scale",
    ],
  },
  {
    part: "Part three",
    range: "Chapters 13–15",
    title: "Going further",
    items: [
      "Managing usage and token limits",
      "Common problems, data privacy, fixes",
      "The 30-day execution roadmap",
    ],
  },
];

export default function Home() {
  const [readerOpen, setReaderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<"standard" | "deluxe">(
    "standard"
  );

  const openCheckout = (tier: "standard" | "deluxe" = "standard") => {
    setCheckoutTier(tier);
    setCheckoutOpen(true);
  };

  return (
    <div id="top" className="flex min-h-full flex-col">
      <SiteHeader
        onOpenSample={() => setReaderOpen(true)}
        onOpenCheckout={() => openCheckout("standard")}
      />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
          <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-20 sm:py-28 md:grid-cols-2 md:gap-16">
            <div className="relative max-w-[34ch] space-y-6">
              <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
                <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
                A practitioner&apos;s handbook by Shammah Nei
              </p>

              <h1 className="text-5xl font-semibold text-foreground sm:text-6xl">
                Automating with AI
              </h1>

              <p className="text-lg leading-relaxed text-muted-foreground">
                A scenario-based introduction to getting AI to do real work for
                you — the prompting craft, the project setup, and the systems
                thinking behind it. No code required.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => openCheckout("standard")}
                  className="group h-11 gap-2 rounded-md bg-gold font-semibold text-ocean-deep hover:bg-gold/90"
                >
                  Get the handbook — $19
                  <ArrowRight weight="bold" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setReaderOpen(true)}
                  className="h-11 gap-2 rounded-md text-foreground hover:bg-secondary"
                >
                  <BookOpen weight="bold" className="size-4" />
                  Read a sample
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                38 pages · PDF and EPUB · DRM-free · instant download
              </p>
            </div>

            <div className="relative flex justify-center md:justify-end">
              <Book3D onSampleClick={() => setReaderOpen(true)} />
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        <FadeIn>
        <section id="learn" className="scroll-mt-16 border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
              Why this book
            </p>
            <h2 className="mt-4 max-w-[28ch] text-3xl font-semibold text-foreground sm:text-4xl">
              Stop chatting. Start delegating real work.
            </h2>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
              AI has crossed a threshold. It isn&apos;t autocompleting your
              sentences anymore — it can run whole workflows in the background.
              This handbook is about getting it to.
            </p>

            <dl className="mt-14 grid gap-8 sm:grid-cols-3">
              {LESSONS.map((lesson, idx) => (
                <div
                  key={lesson.title}
                  className="space-y-2.5 border-t border-border pt-5"
                >
                  <dt className="text-base font-semibold text-foreground">
                    <span
                      aria-hidden="true"
                      className="mr-2.5 text-xs font-semibold tabular-nums text-gold-ink"
                    >
                      0{idx + 1}
                    </span>
                    {lesson.title}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {lesson.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        </FadeIn>

        {/* Contents */}
        <FadeIn>
        <section
          id="contents"
          className="scroll-mt-16 border-b border-border bg-secondary"
        >
          <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
              Table of contents
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
              What&apos;s inside
            </h2>
            <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
              Fifteen chapters, built as a recipe book. Read the first five,
              then jump to whichever workflow you need this week.
            </p>

            <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
              {CONTENTS.map((part) => (
                <div key={part.part}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {part.title}
                    </h3>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {part.range}
                    </span>
                  </div>
                  <ol className="mt-4 space-y-1 text-sm leading-relaxed text-muted-foreground">
                    {part.items.map((item) => (
                      <li
                        key={item}
                        className="-mx-2 rounded px-2 py-1 transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setReaderOpen(true)}
              className="mt-12 h-11 gap-2 rounded-md"
            >
              <BookOpen weight="bold" className="size-4" />
              Read the free chapters
            </Button>
          </div>
        </section>
        </FadeIn>

        <FadeIn>
        <PricingTiers
          onSelectTier={openCheckout}
          onOpenSample={() => setReaderOpen(true)}
        />
        </FadeIn>

        <FadeIn>
        <AuthorSection />
        </FadeIn>

        <FadeIn>
        <FaqSection />
        </FadeIn>
      </main>

      <SiteFooter />

      <InteractiveReader
        open={readerOpen}
        onOpenChange={setReaderOpen}
        onBuyClick={() => openCheckout("standard")}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        initialTier={checkoutTier}
      />
    </div>
  );
}
