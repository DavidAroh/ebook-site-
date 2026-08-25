"use client";

import { ArrowDown } from "@phosphor-icons/react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Book3D } from "@/components/book-3d";
import { AuthorSection } from "@/components/author-section";
import { EmailSignup } from "@/components/email-signup";
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

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col">
      <SiteHeader />

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

              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-md bg-clay px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-clay/90"
              >
                Get the free chapters
                <ArrowDown weight="bold" className="size-4" />
              </a>
            </div>

            <div className="relative flex justify-center md:justify-end">
              <Book3D />
            </div>
          </div>
        </section>

        {/* Why this book */}
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

        {/* Download / Email CTA */}
        <FadeIn>
        <section id="download" className="scroll-mt-16 border-b border-border bg-secondary">
          <div className="mx-auto max-w-xl px-6 py-20 sm:py-28 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
              Free chapters
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
              Start reading today
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Chapters 1–3 and the universal prompt template, sent as a PDF.
            </p>
            <div className="mt-8">
              <EmailSignup />
            </div>
          </div>
        </section>
        </FadeIn>

        {/* Author */}
        <FadeIn>
        <AuthorSection />
        </FadeIn>
      </main>

      <SiteFooter />
    </div>
  );
}
