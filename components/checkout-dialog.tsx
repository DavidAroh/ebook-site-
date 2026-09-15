"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudArrowDown,
  CheckCircle,
  Lock,
  Sparkle,
  CreditCard,
  DeviceMobile,
  Copy,
  Check,
  Tag,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTier?: "standard" | "deluxe";
}

export function CheckoutDialog({
  open,
  onOpenChange,
  initialTier = "standard",
}: CheckoutDialogProps) {
  const [tier, setTier] = useState<"standard" | "deluxe">(initialTier);
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const basePrice = tier === "standard" ? 19 : 39;
  const finalPrice = discountApplied ? Math.max(0, basePrice - 5) : basePrice;

  const applyDiscount = () => {
    if (discountCode.trim().toUpperCase() === "CLAUDE2026" || discountCode.trim().toUpperCase() === "SHAMMAH") {
      setDiscountApplied(true);
      toast.success("Discount code applied! $5.00 off.");
    } else {
      toast.error("Invalid coupon code. Try 'CLAUDE2026'");
    }
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email to receive your handbook files.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Payment confirmed! Your handbook files are unlocked.");
    }, 1200);
  };

  const copyToken = () => {
    navigator.clipboard.writeText("AI-AUTO-DRM-FREE-SHAMMAH-NEI-2026");
    setCopied(true);
    toast.success("License token copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetModal = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setDiscountApplied(false);
    setDiscountCode("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setTimeout(resetModal, 300);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-border bg-card shadow-[0_2px_20px_rgba(0,0,0,0.05)]">
        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-secondary/40">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-semibold text-gold uppercase tracking-wider">
                  Direct DRM-Free Purchase
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                  <Lock weight="bold" className="size-3 text-gold" />
                  <span>256-bit Encrypted</span>
                </span>
              </div>
              <DialogTitle className="text-xl font-sans font-bold text-foreground">
                Unlock The New Way of Work
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Instant delivery · DRM-Free PDF + EPUB files · Free lifetime updates
              </DialogDescription>
            </div>

            {/* Form */}
            <form onSubmit={handlePurchase} className="p-6 space-y-5">
              {/* Edition Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-mono font-semibold text-foreground">
                  Select Edition
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTier("standard")}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      tier === "standard"
                        ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="block text-xs font-bold text-foreground">
                      Standard Edition
                    </span>
                    <span className="block text-sm font-mono font-bold text-gold mt-1">
                      $19
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      Full 38p Handbook
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTier("deluxe")}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                      tier === "deluxe"
                        ? "border-gold bg-gold/10 text-foreground ring-1 ring-gold/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="block text-xs font-bold text-foreground">
                      Deluxe Suite
                    </span>
                    <span className="block text-sm font-mono font-bold text-gold mt-1">
                      $39
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      Handbook + Prompt Vault
                    </span>
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-mono font-semibold text-foreground"
                >
                  Delivery Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
                <span className="text-[11px] text-muted-foreground font-mono">
                  Your direct download link will be emailed immediately.
                </span>
              </div>

              {/* Coupon / Discount Code */}
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code (try CLAUDE2026)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="h-9 rounded-xl font-mono text-xs uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyDiscount}
                    className="h-9 px-3 rounded-xl text-xs font-mono shrink-0"
                  >
                    <Tag weight="bold" className="size-3 text-gold mr-1" />
                    Apply
                  </Button>
                </div>
                {discountApplied && (
                  <span className="text-[11px] font-mono text-emerald-500 block">
                    ✓ $5.00 discount applied to order!
                  </span>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-xs font-mono font-semibold text-foreground">
                  Payment Method
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono transition-all",
                      paymentMethod === "card"
                        ? "border-gold bg-gold/10 text-foreground font-semibold"
                        : "border-border bg-secondary/40 text-muted-foreground"
                    )}
                  >
                    <CreditCard weight="bold" className="size-3.5 text-gold" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("apple")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono transition-all",
                      paymentMethod === "apple"
                        ? "border-gold bg-gold/10 text-foreground font-semibold"
                        : "border-border bg-secondary/40 text-muted-foreground"
                    )}
                  >
                    <DeviceMobile weight="bold" className="size-3.5 text-gold" />
                    <span>Apple / Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold/90 text-ocean-deep font-bold text-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Sparkle weight="fill" className="size-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock weight="bold" className="size-4" />
                    <span>Pay ${finalPrice}.00 & Unlock Handbook</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_1px_8px_rgba(0,0,0,0.04)] animate-in zoom-in-50">
              <CheckCircle weight="fill" className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-gold uppercase tracking-wider font-bold">
                Order Confirmed · DRM-Free
              </span>
              <h3 className="text-2xl font-sans font-bold text-foreground">
                Your Handbook is Ready!
              </h3>
              <p className="text-xs text-muted-foreground font-mono max-w-xs mx-auto">
                Receipt and backup links sent to <strong className="text-foreground">{email}</strong>
              </p>
            </div>

            {/* Direct Download Button */}
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
              {/* Was a direct link to public/downloads — which served the same PDF
                  the email gate protects, to anyone who guessed the URL. The only
                  delivery path is the signed link, so this funnels to the form
                  that mints one. */}
              <a
                href="#download"
                onClick={() => onOpenChange(false)}
                className="w-full h-12 rounded-xl bg-gold hover:bg-gold/90 text-ocean-deep font-bold text-sm shadow-[0_1px_6px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 transition-all"
              >
                <CloudArrowDown weight="bold" className="size-4.5" />
                <span>Email Me the Download Link</span>
              </a>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                <span>Format: PDF + EPUB</span>
                <span>DRM: Unlocked (100% Free)</span>
              </div>
            </div>

            {/* License Token Box */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground truncate mr-2">
                Token: AI-AUTO-DRM-FREE-SHAMMAH-NEI-2026
              </span>
              <button
                onClick={copyToken}
                className="text-gold hover:underline flex items-center gap-1 shrink-0"
              >
                {copied ? <Check weight="bold" className="size-3.5" /> : <Copy weight="bold" className="size-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 rounded-xl font-mono text-xs"
            >
              Done & Return to Site
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
