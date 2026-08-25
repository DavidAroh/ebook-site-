"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sliders,
  Bookmark,
  ArrowRight,
  Sparkles,
  DownloadCloud,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InteractiveReaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyClick?: () => void;
}

type ReaderTheme = "obsidian" | "midnight" | "cream" | "sepia";

const THEME_STYLES: Record<
  ReaderTheme,
  { bg: string; text: string; accent: string; panel: string; codeBg: string }
> = {
  obsidian: {
    bg: "bg-[#060a0f]",
    text: "text-[#cbd5e1]",
    accent: "text-[#e5853f]",
    panel: "bg-[#0d141f] border-[#1c2838]",
    codeBg: "bg-[#0a0f18] border-[#1e2a3b]",
  },
  midnight: {
    bg: "bg-[#0f1722]",
    text: "text-[#e2e8f0]",
    accent: "text-[#e5853f]",
    panel: "bg-[#172332] border-[#25394e]",
    codeBg: "bg-[#131c28] border-[#27394f]",
  },
  cream: {
    bg: "bg-[#fbf8f2]",
    text: "text-[#1c1917]",
    accent: "text-[#c25e19]",
    panel: "bg-[#f2ece0] border-[#dfd5c4]",
    codeBg: "bg-[#eae3d5] border-[#d8cdb9]",
  },
  sepia: {
    bg: "bg-[#f4ecd8]",
    text: "text-[#382b1c]",
    accent: "text-[#9a4b15]",
    panel: "bg-[#e8dcbf] border-[#d4c39e]",
    codeBg: "bg-[#dfd1af] border-[#c9b78f]",
  },
};

export function InteractiveReader({
  open,
  onOpenChange,
  onBuyClick,
}: InteractiveReaderProps) {
  const [activeChapter, setActiveChapter] = useState<1 | 2 | 3>(1);
  const [theme, setTheme] = useState<ReaderTheme>("obsidian");
  const [fontSize, setFontSize] = useState<number>(17);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("sans");
  const [showSettings, setShowSettings] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const currentTheme = THEME_STYLES[theme];

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300 shadow-2xl",
          currentTheme.bg,
          currentTheme.text
        )}
      >
        {/* Reader Top Controls Toolbar */}
        <DialogHeader
          className={cn(
            "px-5 sm:px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0",
            currentTheme.panel
          )}
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold">
              <BookOpen className="size-4.5" />
            </div>
            <div>
              <DialogTitle
                className={cn(
                  "text-base font-sans font-bold tracking-tight",
                  currentTheme.text
                )}
              >
                Automating with AI
              </DialogTitle>
              <DialogDescription className="font-mono text-xs opacity-75">
                Shammah Nei · Beginner Practitioner Edition
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {/* Reading Preference Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "h-8 px-2.5 rounded-lg border font-mono text-xs flex items-center gap-1.5",
                currentTheme.panel
              )}
            >
              <Sliders className="size-3.5" />
              <span className="hidden sm:inline">Preferences</span>
            </Button>

            {/* Bookmark button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(
                  isBookmarked ? "Bookmark removed" : "Chapter bookmarked!"
                );
              }}
              className={cn(
                "size-8 rounded-lg",
                isBookmarked ? "text-gold bg-gold/15" : "opacity-75"
              )}
              title={isBookmarked ? "Bookmarked" : "Add bookmark"}
            >
              <Bookmark className={cn("size-4", isBookmarked && "fill-gold")} />
            </Button>
          </div>
        </DialogHeader>

        {/* Chapter Tabs Strip */}
        <div
          className={cn(
            "px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs font-mono",
            currentTheme.panel
          )}
        >
          <span className="text-[11px] opacity-60 uppercase tracking-wider shrink-0 mr-1">
            Jump:
          </span>
          {[
            { id: 1, label: "1. What this handbook will do" },
            { id: 2, label: "2. The Two Ways: Chat vs. Cowork" },
            { id: 3, label: "3. How to Actually Talk to AI" },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(ch.id as 1 | 2 | 3)}
              className={cn(
                "px-3 py-1 rounded-lg transition-all shrink-0 font-medium",
                activeChapter === ch.id
                  ? "bg-gold text-ocean-deep font-bold shadow-sm"
                  : "opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              )}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Display Settings Floating Subheader */}
        {showSettings && (
          <div
            className={cn(
              "px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 text-xs font-mono transition-all animate-in slide-in-from-top-2",
              currentTheme.panel
            )}
          >
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <span className="opacity-75">Theme:</span>
              {(
                [
                  { id: "obsidian", label: "Obsidian" },
                  { id: "midnight", label: "Midnight" },
                  { id: "cream", label: "Parchment" },
                  { id: "sepia", label: "Sepia" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all",
                    theme === t.id
                      ? "border-gold text-gold font-semibold shadow-sm"
                      : "border-transparent opacity-65 hover:opacity-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Font Type & Size */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="opacity-75">Font:</span>
                <button
                  onClick={() => setFontFamily("sans")}
                  className={cn(
                    "px-2 py-0.5 rounded font-sans text-xs",
                    fontFamily === "sans" ? "font-bold underline text-gold" : "opacity-60"
                  )}
                >
                  Clean Sans
                </button>
                <button
                  onClick={() => setFontFamily("serif")}
                  className={cn(
                    "px-2 py-0.5 rounded font-serif text-xs",
                    fontFamily === "serif" ? "font-bold underline text-gold" : "opacity-60"
                  )}
                >
                  Editorial Serif
                </button>
              </div>

              <div className="flex items-center gap-1.5 border-l pl-3">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                  className="size-6 rounded border flex items-center justify-center font-bold"
                  title="Smaller text"
                >
                  A-
                </button>
                <span className="w-6 text-center">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(23, fontSize + 1))}
                  className="size-6 rounded border flex items-center justify-center font-bold"
                  title="Larger text"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Reading Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-16 py-8 selection:bg-gold/30 selection:text-current">
          <div
            className={cn(
              "mx-auto max-w-[68ch] space-y-6 leading-relaxed transition-all",
              fontFamily === "serif" ? "font-serif" : "font-sans"
            )}
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* CHAPTER 1 */}
            {activeChapter === 1 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="text-center pb-6 border-b border-current/15 mb-6">
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold mb-2">
                    Part 1 · Chapter 1
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight mb-2">
                    What this handbook will do for you
                  </h1>
                  <p className="font-mono text-xs opacity-60">
                    A Practitioner&apos;s Handbook by Shammah Nei
                  </p>
                </div>

                <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-sans first-letter:text-6xl first-letter:font-bold first-letter:leading-none first-letter:text-gold">
                  AI has crossed a threshold. It&apos;s not just autocompleting
                  your sentences anymore — it can run whole workflows, draft
                  your emails, sort your inbox, write your weekly reports from
                  real data, and follow up with your customers in your voice.
                  This handbook is the map for making that real in your own work
                  — no hype, no mystique, just the craft.
                </p>

                <div
                  className={cn(
                    "p-4 rounded-xl border font-sans text-sm space-y-2",
                    currentTheme.panel
                  )}
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-gold font-bold block">
                    A note on the case study
                  </span>
                  <p className="opacity-90 leading-normal">
                    Claude — the AI system built by Anthropic — is the working
                    example throughout this handbook. It&apos;s what I use daily
                    and know deeply. But the underlying principles — how to
                    prompt well, how to think in projects, how to pick the right
                    model for a task, how to build automations that don&apos;t
                    drift over time — apply to any capable AI system. AI
                    systems will keep changing; the craft will outlast any of
                    them.
                  </p>
                </div>

                <p>
                  <strong>You don&apos;t need to be technical.</strong> If you
                  can write an email, you can do everything in this guide. There
                  is no code. You will type normal sentences into a chat box, and
                  your computer will do work for you.
                </p>

                <h3 className="text-xl font-bold pt-4 text-gold font-sans">
                  Three Promises
                </h3>
                <p>By the end of this guide, you will know:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>How to talk to Claude</strong> so it actually
                    understands what you want — and pushes back when
                    something&apos;s unclear.
                  </li>
                  <li>
                    <strong>How to set up Claude Projects</strong> so you
                    don&apos;t keep re-explaining the same context over and over.
                  </li>
                  <li>
                    <strong>How to automate seven real workflows</strong> —
                    daily email triage, weekly reports, research, applications,
                    content creation, ads, customer follow-up — using both Chat
                    and Cowork.
                  </li>
                </ul>

                <h3 className="text-xl font-bold pt-4 text-gold font-sans">
                  How to read this
                </h3>
                <p>
                  The first five chapters are the foundation. Don&apos;t skip
                  them. They teach you the few skills that make every scenario in
                  Part 2 work. Once you&apos;ve read those, jump to whichever
                  scenario in Part 2 fits what you actually need to do this week.
                  Build that one. Then come back for the next.
                </p>
                <blockquote
                  className={cn(
                    "border-l-4 border-gold pl-4 italic opacity-95 my-4",
                    currentTheme.accent
                  )}
                >
                  &ldquo;Treat this like a recipe book, not a textbook. Don&apos;t
                  try to memorize. The goal is to use it, get a result, and
                  iterate. By month two you&apos;ll be inventing your own
                  scenarios.&rdquo;
                </blockquote>
              </div>
            )}

            {/* CHAPTER 2 */}
            {activeChapter === 2 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="text-center pb-6 border-b border-current/15 mb-6">
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold mb-2">
                    Part 1 · Chapter 2
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight mb-2">
                    The two ways to use Claude
                  </h1>
                  <p className="font-mono text-xs opacity-60">
                    Chat Mode vs. Cowork Mode
                  </p>
                </div>

                <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-sans first-letter:text-6xl first-letter:font-bold first-letter:leading-none first-letter:text-gold">
                  Claude gives you two modes of working: Chat and Cowork. They
                  look similar and live in the same app. They do different
                  things. Picking the right one for each task saves you hours of
                  frustration.
                </p>

                {/* Comparison Table */}
                <div className="overflow-x-auto rounded-xl border border-current/20 my-6">
                  <table className="w-full text-left text-sm">
                    <thead className={cn("border-b font-mono text-xs", currentTheme.panel)}>
                      <tr>
                        <th className="p-3">Feature</th>
                        <th className="p-3 text-gold">Chat Mode</th>
                        <th className="p-3 text-gold">Cowork Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-current/15 font-sans">
                      <tr>
                        <td className="p-3 font-semibold">How you use it</td>
                        <td className="p-3 opacity-90">
                          You open a chat and type. Every task starts with you.
                        </td>
                        <td className="p-3 opacity-90">
                          You describe a task and hand it off. Cowork plans,
                          works, and comes back with finished output.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">What it can do</td>
                        <td className="p-3 opacity-90">
                          Answer, write, draft, research, brainstorm, work
                          through problems with you.
                        </td>
                        <td className="p-3 opacity-90">
                          Take on multi-step tasks on its own. Work across files
                          and connected apps. Run on a schedule.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">Best for</td>
                        <td className="p-3 opacity-90">
                          Writing, thinking, one-off questions, drafting,
                          conversation.
                        </td>
                        <td className="p-3 opacity-90">
                          Recurring jobs, scheduled tasks, multi-step work that
                          would take you an hour.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">In plain language</td>
                        <td className="p-3 italic">
                          Smart assistant you talk to.
                        </td>
                        <td className="p-3 italic text-gold font-medium">
                          Smart assistant you delegate to.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-bold pt-2 text-gold font-sans">
                  The Simple Rule
                </h3>
                <p>
                  If you would describe the task as{" "}
                  <em>&ldquo;help me think through this&rdquo;</em> or{" "}
                  <em>&ldquo;write this one thing&rdquo;</em> — that&apos;s{" "}
                  <strong>Chat</strong>. If you would describe it as{" "}
                  <em>&ldquo;go do this whole job for me&rdquo;</em> or{" "}
                  <em>&ldquo;do this every Monday&rdquo;</em> — that&apos;s{" "}
                  <strong>Cowork</strong>.
                </p>

                <h3 className="text-xl font-bold pt-2 text-gold font-sans">
                  Where does Cowork actually run?
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>In the cloud (default):</strong> Tasks run on
                    Anthropic servers. You can start a job on your laptop, close
                    the lid, and it keeps running.
                  </li>
                  <li>
                    <strong>On your computer (desktop app):</strong> Needed
                    when the task must touch files on your local machine or
                    drive your browser directly.
                  </li>
                </ul>
              </div>
            )}

            {/* CHAPTER 3 */}
            {activeChapter === 3 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="text-center pb-6 border-b border-current/15 mb-6">
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold mb-2">
                    Part 1 · Chapter 3
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight mb-2">
                    How to actually talk to Claude
                  </h1>
                  <p className="font-mono text-xs opacity-60">
                    Prompting Craft & The Leading Prompt
                  </p>
                </div>

                <div
                  className={cn(
                    "p-5 rounded-2xl border-2 border-gold/40 space-y-3",
                    currentTheme.panel
                  )}
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-gold font-bold flex items-center gap-1.5">
                    <Sparkles className="size-4" />
                    The Single Most Powerful Prompting Trick
                  </span>
                  <p className="text-lg font-bold">
                    Ask Claude to ask you questions before doing the work.
                  </p>
                  <p className="text-sm opacity-90">
                    When the task is complex, instead of trying to write a
                    perfect prompt on the first try, just paste this leading prompt:
                  </p>
                  <div
                    className={cn(
                      "p-3 rounded-lg border font-mono text-xs relative group flex items-start justify-between gap-2",
                      currentTheme.codeBg
                    )}
                  >
                    <code>
                      &ldquo;I want to [your goal]. Before you do anything, ask me
                      5 questions to make sure you understand what I actually
                      need. Don&apos;t make assumptions — wait for my answers, then
                      proceed.&rdquo;
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyText(
                          "I want to [your goal]. Before you do anything, ask me 5 questions to make sure you understand what I actually need. Don't make assumptions — wait for my answers, then proceed.",
                          "leading"
                        )
                      }
                      className="h-7 px-2 text-xs font-mono shrink-0 gap-1 text-gold"
                    >
                      {copiedPrompt === "leading" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span>Copy</span>
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold pt-2 text-gold font-sans">
                  The Universal Prompt Template
                </h3>
                <p>
                  When in doubt, copy this structure into your chat window:
                </p>

                <div
                  className={cn(
                    "p-4 rounded-xl border font-mono text-xs space-y-2 relative",
                    currentTheme.codeBg
                  )}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-current/15 mb-2">
                    <span className="font-bold text-gold">Universal Template</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyText(
                          `I am [who you are].\nI am trying to [what you're trying to do].\nThe audience or context is [who this is for / situation].\nSpecifically, I need [the exact thing].\nFormat: [how the answer should look].\nConstraints: [anything to avoid; length limits; tone].\nBefore you start, ask me any clarifying questions if something is unclear.`,
                          "universal"
                        )
                      }
                      className="h-7 px-2 text-xs font-mono gap-1 text-gold"
                    >
                      {copiedPrompt === "universal" ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span>Copy Template</span>
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">
{`I am [who you are].
I am trying to [what you're trying to do].
The audience or context is [who this is for / situation].
Specifically, I need [the exact thing].
Format: [how the answer should look].
Constraints: [anything to avoid; length limits; tone].
Before you start, ask me any clarifying questions if something is unclear.`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold pt-2 text-gold font-sans">
                  Other Prompt Moves That Work
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>&ldquo;Think step by step&rdquo;:</strong> For math,
                    logic, or planning — catches errors before final answer.
                  </li>
                  <li>
                    <strong>&ldquo;Show, don&apos;t tell&rdquo;:</strong> Paste
                    3 examples of past good work instead of 10 adjectives.
                  </li>
                  <li>
                    <strong>The Skeptic Check:</strong> Ask{" "}
                    <em>&ldquo;What is the strongest counter-argument to this draft?&rdquo;</em>
                  </li>
                  <li>
                    <strong>Iterate, don&apos;t restart:</strong> A 70% answer
                    takes 1 refinement message to reach 95%.
                  </li>
                </ul>
              </div>
            )}

            {/* End of Excerpt / Call to Action */}
            <div
              className={cn(
                "mt-12 p-8 rounded-2xl border text-center space-y-4 shadow-lg",
                currentTheme.panel
              )}
            >
              <div className="size-12 rounded-full bg-gold/20 text-gold mx-auto flex items-center justify-center">
                <Sparkles className="size-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-sans font-bold">
                Unlock All 15 Chapters & 7 Workflow Blueprints
              </h3>
              <p className="max-w-md mx-auto text-sm opacity-85">
                Get instant access to the complete 38-page handbook, the 50+
                Prompt Vault, and step-by-step Cowork automations.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    onOpenChange(false);
                    onBuyClick?.();
                  }}
                  className="bg-gold text-ocean-deep hover:bg-gold/90 font-bold px-6 h-11 rounded-xl shadow-md gap-2"
                >
                  <DownloadCloud className="size-4" />
                  <span>Get Full Handbook — $19</span>
                  <ArrowRight className="size-4" />
                </Button>
                <a
                  href="/downloads/automating-with-ai-beginner-handbook.pdf"
                  download="automating-with-ai-beginner-handbook.pdf"
                  className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-current/20 font-mono text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <DownloadCloud className="size-3.5 text-gold" />
                  <span>Download Free PDF Sample</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
