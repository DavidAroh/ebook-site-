import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://automatingwithai.com"),
  title: "Automating with AI: Beginner Handbook — by Shammah Nei",
  description:
    "A gentle, scenario-based introduction to using AI to do real work for you with prompting craft, project design, and systems thinking. Instant DRM-Free PDF + EPUB.",
  openGraph: {
    title: "Automating with AI: Beginner Handbook — by Shammah Nei",
    description:
      "A gentle, scenario-based guide to automating 7 real workflows with Claude (Anthropic). 100% DRM-Free instant edition.",
    type: "website",
    siteName: "Automating with AI",
    images: [
      {
        url: "/images/ai-book-cover.jpg",
        width: 1200,
        height: 800,
        alt: "Automating with AI Book Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automating with AI: Beginner Handbook — by Shammah Nei",
    description:
      "A gentle, scenario-based guide to automating 7 real workflows with Claude (Anthropic). Instant DRM-Free PDF + EPUB.",
    images: ["/images/ai-book-cover.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080c10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-clay selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
