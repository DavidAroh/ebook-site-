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
  /* TODO: point this at the real deployed origin. It is only used to expand the
     relative OG/Twitter image paths below into absolute URLs, so while it is
     wrong those tags advertise a domain that is not this site. */
  metadataBase: new URL("https://automatingwithai.com"),
  title: "The New Way of Work — by Shammah Nei",
  description:
    "A practical guide to automate, amplify and work smarter with AI. The prompting craft, the project setup, and the systems thinking behind real AI workflows. No code required.",
  openGraph: {
    title: "The New Way of Work — by Shammah Nei",
    description:
      "A practical guide to automate, amplify and work smarter with AI. First edition, by Shammah Nei.",
    type: "website",
    siteName: "The New Way of Work",
    images: [
      {
        /* The cover is 2:3 portrait. Most platforms crop OG images to roughly
           1.91:1, so this gets centre-cropped hard. A dedicated landscape
           opengraph-image.tsx is the real fix. */
        url: "/images/the-new-way-of-work-cover.jpg",
        width: 1024,
        height: 1536,
        alt: "Cover of The New Way of Work by Shammah Nei",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The New Way of Work — by Shammah Nei",
    description:
      "A practical guide to automate, amplify and work smarter with AI. First edition, by Shammah Nei.",
    images: ["/images/the-new-way-of-work-cover.jpg"],
  },
};

export const viewport: Viewport = {
  /* Matches --background in globals.css for each theme. The single #080c10 that
     used to sit here was left over from the pre-Claude palette. */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
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
