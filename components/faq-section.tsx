"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Do I need coding skills?",
    answer:
      "None. If you can write an email, you can do everything in this guide. There is no code or programming involved — you type normal English sentences and your computer does work for you.",
  },
  {
    question: "Do I need Claude Pro, or does the free tier work?",
    answer:
      "Every prompting technique and Chat Mode workflow works on the free tier. Scheduled autonomous Cowork jobs — inbox triage running at 7:30am while your laptop is closed — need Claude Pro at $20/month.",
  },
  {
    question: "Does this apply to ChatGPT, Gemini, or other models?",
    answer:
      "Yes. Claude is the working case study because of its Projects, Artifacts, and Cowork systems, but the underlying craft — leading prompts, negative constraints, context isolation, model selection — carries over to any capable model.",
  },
  {
    question: "How are the files delivered?",
    answer:
      "You get direct download links for the DRM-free PDF and EPUB on the confirmation screen immediately after checkout, plus a permanent backup link by email.",
  },
  {
    question: "What does it say about token limits?",
    answer:
      "Chapter 13 covers usage management: the three causes of mid-week lockouts — mega-chats, reaching for the largest model on simple classification, and redundant uploads — and the rules that stretch a quota.",
  },
  {
    question: "Is my business data private?",
    answer:
      "Chapter 14 covers data safety. Connectors only fetch records a specific prompt asks for, and you'll learn how to redact sensitive details while still giving the model enough context to draft well.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-16">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-ink">
          Before you buy
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Questions
        </h2>

        <div className="mt-12 border-t border-border">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={faq.question} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    id={`faq-trigger-${idx}`}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left text-base font-medium text-foreground transition-colors hover:text-gold-ink"
                  >
                    <span>{faq.question}</span>
                    <Plus
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-45"
                      )}
                    />
                  </button>
                </h3>

                <div
                  id={`faq-panel-${idx}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${idx}`}
                  hidden={!isOpen}
                  className="max-w-[62ch] pb-6 pr-8 text-sm leading-relaxed text-muted-foreground"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
