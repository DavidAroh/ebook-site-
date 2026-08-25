"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setStatus("sent");
    toast.success("Chapters 1–3 are on the way.");
  }

  if (status === "sent") {
    return (
      <p
        role="status"
        className="flex items-start gap-2.5 pt-1 text-sm text-muted-foreground"
      >
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-gold-ink"
        />
        <span>
          Sent to{" "}
          <span className="font-medium text-foreground">{email}</span>. Check
          your inbox for the download link.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1 sm:flex-row">
      <label htmlFor="signup-email" className="sr-only">
        Email address
      </label>
      <Input
        id="signup-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-10 rounded-md text-sm"
      />
      <Button
        type="submit"
        className="h-10 shrink-0 rounded-md bg-gold px-4 text-sm font-semibold text-ocean-deep hover:bg-gold/90"
      >
        Send it
      </Button>
    </form>
  );
}
