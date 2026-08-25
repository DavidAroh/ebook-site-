"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Book3D } from "@/components/book-3d";
import { AuthorSection } from "@/components/author-section";
import { EmailSignup } from "@/components/email-signup";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LESSONS = [
  {
    title: "Talk so AI understands",
    body: "The Leading Prompt: why asking for five clarifying questions before it starts beats a one-shot command.",
    image: "https://picsum.photos/seed/prompting/600/400",
  },
  {
    title: "Set up Projects",
    body: "Upload your brand voice, contact sheets, and past examples once. Stop re-typing who you are every session.",
    image: "https://picsum.photos/seed/projects/600/400",
  },
  {
    title: "Automate workflows",
    body: "Inbox triage, weekly status reports, research synthesis, applications, content pipelines, ad copy, follow-up.",
    image: "https://picsum.photos/seed/automation/600/400",
  },
];

export default function Home() {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text scrub-in
      if (heroTextRef.current) {
        const words = heroTextRef.current.querySelectorAll(".hero-word");
        gsap.fromTo(
          words,
          { opacity: 0.1 },
          {
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: heroTextRef.current,
              start: "top 80%",
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      }

      // Hero image scale-in
      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heroImageRef.current,
              start: "top 85%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }

      // Feature cards stagger
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            delay: i * 0.12,
          }
        );
      });

      // Email section reveal
      if (emailRef.current) {
        gsap.fromTo(
          emailRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: emailRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="overflow-x-hidden w-full max-w-full">
      <SiteHeader />

      {/* Hero — Editorial Split */}
      <section className="relative min-h-[90vh] border-b border-border">
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

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pt-32 pb-20 md:grid-cols-[1fr_auto] md:gap-20 md:pt-40 md:pb-32">
          {/* Text */}
          <div ref={heroTextRef} className="max-w-3xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-clay-ink">
              A practitioner&apos;s handbook by Shammah Nei
            </p>

            <h1 className="text-[clamp(3rem,5vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
              {"Automating with AI".split(" ").map((word, i) => (
                <span key={i} className="hero-word inline-block mr-[0.25em]">
                  {word}
                </span>
              ))}
            </h1>

            <p className="mt-8 max-w-[55ch] text-lg leading-relaxed text-muted-foreground">
              A scenario-based introduction to getting AI to do real work for
              you. The prompting craft, the project setup, and the systems
              thinking behind it. No code required.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-ink transition-all hover:bg-clay/90 hover:scale-[0.98] active:scale-95"
              >
                Get the free chapters
                <ArrowDown weight="bold" className="size-4" />
              </a>
            </div>
          </div>

          {/* Book image */}
          <div
            ref={heroImageRef}
            className="flex justify-center md:justify-end"
          >
            <Book3D />
          </div>
        </div>
      </section>

      {/* Bento Grid — Why this book */}
      <section id="learn" className="scroll-mt-24 border-b border-border py-32 md:py-48">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-clay-ink">
            Why this book
          </p>
          <h2 className="max-w-4xl text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            Stop chatting. Start delegating real work.
          </h2>
          <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-muted-foreground">
            AI has crossed a threshold. It can run whole workflows in the
            background. This handbook is about getting it to.
          </p>

          {/* Gapless bento grid */}
          <div className="mt-16 grid grid-flow-dense gap-4 sm:grid-cols-3">
            {LESSONS.map((lesson, i) => (
              <div
                key={lesson.title}
                ref={(el) => { featureRefs.current[i] = el; }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${
                  i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
              >
                {/* Inline micro-image */}
                <div className="relative h-48 overflow-hidden sm:h-full sm:min-h-[200px]">
                  <img
                    src={lesson.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <span className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-clay">
                    0{i + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {lesson.title}
                  </h3>
                  <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-white/70">
                    {lesson.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email CTA */}
      <section
        id="download"
        ref={emailRef}
        className="scroll-mt-24 border-b border-border bg-secondary py-32 md:py-48"
      >
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-clay-ink">
            Free chapters
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            Start reading today
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Chapters 1 through 3 and the universal prompt template, sent as a
            PDF.
          </p>
          <div className="mt-10">
            <EmailSignup />
          </div>
        </div>
      </section>

      {/* Author */}
      <section className="py-32 md:py-48">
        <AuthorSection />
      </section>

      <SiteFooter />
    </main>
  );
}
