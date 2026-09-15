"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Book3D } from "@/components/book-3d";
import { AuthorSection } from "@/components/author-section";
import { SubscribeCard } from "@/components/subscribe-card";
import { PromptIcon, ProjectIcon, FlowIcon } from "@/components/lesson-icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LESSONS = [
  {
    title: "Talk so AI understands",
    body: "The Leading Prompt: why asking for five clarifying questions before it starts beats a one-shot command.",
    Icon: PromptIcon,
  },
  {
    title: "Set up Projects",
    body: "Upload your brand voice, contact sheets, and past examples once. Stop re-typing who you are every session.",
    Icon: ProjectIcon,
  },
  {
    title: "Automate workflows",
    body: "Inbox triage, weekly status reports, research synthesis, applications, content pipelines, ad copy, follow-up.",
    Icon: FlowIcon,
  },
];

/* What subscribing actually gets you. The three rows replace a lede that said
   "chapters 1 through 3 and the universal prompt template" while the note under
   the form said it a second time and the eyebrow above it a third. Enumerating
   once, plainly, is shorter than promising the same thing three ways. */
const INCLUDED = [
  {
    term: "Chapters 1–3",
    detail: "The prompting craft, Projects, and your first real automation.",
  },
  {
    term: "The prompt template",
    detail: "The Leading Prompt, written out and ready to paste anywhere.",
  },
  {
    term: "The newsletter",
    detail: "New issues on working with AI. One click to leave.",
  },
];

export default function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    /* Motion is opt-in. The reduced-motion rule in globals.css cannot reach
       GSAP's inline styles, so the preference has to be honoured here. Each
       reveal keeps its hidden state inside the tween rather than in CSS, so
       skipping the tween leaves a section fully visible rather than blank. */
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero text drifts up slightly as the section scrolls away.
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: heroTextRef.current,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }

      /* No scroll tween on the book. It is the LCP element and it already
         carries its own pointer-driven motion. The scrubbed opacity reveal that
         used to live here began partway through its own range above the fold,
         so at mobile widths the cover painted at roughly 36% opacity and only
         resolved once the reader scrolled. */

      /* Feature cards stagger.

         The tween is built inside onEnter rather than declared with a
         scrollTrigger, because gsap.fromTo writes its "from" vars the moment it
         is created. Declared up front, every card below the fold was pinned at
         opacity 0 until a scroll event arrived — so a full-page screenshot, a
         print render, or any headless snapshot got three blank cards. Creating
         the tween on entry means the untriggered state is the natural, visible
         one, and the reveal only ever enhances it. */
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 95%",
          once: true,
          onEnter: () =>
            gsap.fromTo(
              el,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                delay: i * 0.12,
              }
            ),
        });
      });

      // Email section reveal, same lazily-created shape as the cards above.
      if (emailRef.current) {
        const el = emailRef.current;
        ScrollTrigger.create({
          trigger: el,
          start: "top 95%",
          once: true,
          onEnter: () =>
            gsap.fromTo(
              el,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
            ),
        });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <SiteHeader />

      {/* Hero — Editorial Split.

          No min-height any more, because it was never what set this section's
          size. Book3D is 2.03x its cover width tall once the canvas overhang is
          counted, so at 1440 the book alone was 730px of a 1018px hero and the
          90vh floor never bound. Which is why the compression below is padding
          and overlap rather than a smaller book: the book is bigger here than it
          was. */}
      <section className="relative">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 75% 35%, var(--clay), transparent 70%)",
            opacity: 0.06,
          }}
        />

        {/* Splits at lg, not md. The book column is the cover plus the room the
            WebGL canvas needs to overhang it — about 487px at full size — so a
            two-column hero at 768px would leave the copy roughly 200px and break
            the h1 into three lines. Tablet gets the stacked hero instead. */}
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-28 pb-14 lg:grid-cols-[1fr_auto] lg:gap-20 md:pt-32 md:pb-20">
          {/* Text */}
          <div ref={heroTextRef} className="max-w-3xl">
            {/* Two lines at desktop, and that is the point rather than a
                tolerated wrap: "The New / Way of Work" is how the cover sets it,
                so the title beside it now stacks the same way. text-balance is
                what makes the break even, and the 4.5rem cap is what keeps the
                second line inside the 659px the wider book leaves. */}
            <h1 className="text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-balance text-foreground">
              The New Way of Work
            </h1>

            {/* Was a tracked uppercase eyebrow above the title. It is a byline,
                so it now sits where a byline sits — under the title, in the
                same sentence case as everything else. Nothing on this page is
                an eyebrow any more. */}
            <p className="mt-5 text-sm text-muted-foreground">
              First edition &middot; by{" "}
              <span className="font-medium text-foreground">Shammah Nei</span>
            </p>

            <p className="mt-7 max-w-[55ch] text-lg leading-relaxed text-muted-foreground">
              A practical guide to automate, amplify and work smarter with AI.
              The prompting craft, the project setup, and the systems thinking
              behind it. No code required.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-ink transition-all hover:bg-clay/90 hover:scale-[0.98] active:scale-95"
              >
                Get the free chapters
                <ArrowDown weight="bold" className="size-4" />
              </a>
            </div>
          </div>

          {/* The overhang doubles as the section's air.

              Book3D reserves 26% of the cover width above and below the cover
              box so the canvas can draw outside it, and that reserve is empty
              transparent space. Letting it overlap the section's own padding
              costs nothing visible and takes 160px out of the hero at xl. The
              margin stays under the reserve on purpose — 80px of 105px — so the
              canvas still cannot reach the section below or eat its clicks. */}
          <div className="flex justify-center -my-6 lg:-my-14 lg:justify-end xl:-my-20">
            <Book3D />
          </div>
        </div>
      </section>

      {/* Why this book.

          Three peers under three rules, no boxes. The bento this replaces gave
          item one a 2x2 card whose tinted icon panel was about 250px of near
          empty space, and the two siblings beside it were denser than it in a
          third of the area — which is how a 1406px section ended up carrying
          roughly 400px of content. Without a panel to fill, the icons hold their
          presence at two thirds the size.

          A rule per column rather than one rule across the group: the gutters
          break it, so each column gets its own short rule aligned to its own
          text, and the same markup reads correctly stacked.

          The roomiest of the three body sections. It is the page's argument, and
          the only one built from short columns rather than long-form blocks. */}
      <section id="learn" className="scroll-mt-24 border-b border-border py-24 md:py-40">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="max-w-4xl text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            Stop chatting. Start delegating real work.
          </h2>
          <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-muted-foreground">
            AI has crossed a threshold. It can run whole workflows in the
            background. This handbook is about getting it to.
          </p>

          <div className="mt-14 grid gap-x-10 sm:grid-cols-3">
            {LESSONS.map((lesson, i) => (
              <div
                key={lesson.title}
                ref={(el) => { featureRefs.current[i] = el; }}
                className="border-t border-border pt-7 pb-9 sm:pb-0"
              >
                <lesson.Icon className="size-16 sm:size-18" />
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {lesson.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {lesson.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email CTA.

          This band went out to a form of our own and came back to the Substack
          iframe it started as. What it learned in between is where the white goes.
          The first version pinned the light palette across the section's whole
          width so the immovably white embed would have no seam against it, which
          removed one seam and created a worse one: a full-bleed white slab between
          two cream sections in light mode, and a section that stayed light while
          the rest of the page went dark. The frame is back, but its white is now
          contained to a bordered, rounded panel of its own — so this section
          follows the theme like every other one, and the embed reads as embedded
          third-party content instead of a hole cut in the page.

          bg-secondary rather than bg-background, because it is the one section
          here asking the reader for something.

          Two columns, left-aligned, rather than a centred stack. Centred, the
          panel hung at the bottom of a narrow column with nothing beside it, so
          the section disagreed with itself about alignment. Side by side, the
          pitch and the signup share a top line and the empty width is gone.

          Padding sits between its neighbours', and the three body sections now
          descend 160 / 128 / 112px as they get denser rather than all carrying
          the same 192. This one is two columns and a third-party frame, so it
          needs less air than the argument above it and more than the bio below
          it. */}
      <section
        id="download"
        ref={emailRef}
        className="scroll-mt-24 border-b border-border bg-secondary py-24 md:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_30rem] lg:items-start lg:gap-16">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
              Get the chapters by email
            </h2>
            {/* Names the mechanism once, because the page no longer hands the
                file over itself: the panel beside this is Substack's, and the
                only thing that reaches a reader after it is the welcome email
                that publication sends. */}
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              One email address, no payment. Subscribe on Substack and the
              chapters arrive in your first email.
            </p>

            {/* Ruled rows, not cards and not a column of checkmarks. Three items
                do not need three boxes, and the rules already do the separating
                a border would. */}
            <dl className="mt-10 border-t border-border">
              {INCLUDED.map((item) => (
                <div
                  key={item.term}
                  className="grid gap-1 border-b border-border py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-semibold text-foreground">
                    {item.term}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <SubscribeCard />
        </div>
      </section>

      {/* Author. The tightest padding on the page: it is two columns of the
          longest prose here, and the footer's own rule closes it. */}
      <section className="py-20 md:py-28">
        <AuthorSection />
      </section>

      <SiteFooter />
    </main>
  );
}
