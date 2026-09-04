"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { ApiClientError } from "@/lib/api-client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

type Step = "email" | "code";
const RESEND_COOLDOWN_SECONDS = 30;

export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    setError(null);
    setIsSubmitting(true);
    try {
      await requestOtp({ email });
      setStep("code");
      startCooldown();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    await sendCode();
  }

  async function handleResendCode() {
    if (cooldown > 0) return;
    setOtp("");
    await sendCode();
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyOtp({ email, otp });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-sm"
    >
      <p className="font-display text-2xl text-ink mb-1">
        {step === "email" ? "Welcome to Spendly" : "Check your email"}
      </p>
      <h1 className="text-ink-soft text-sm mb-8">
        {step === "email"
          ? "Enter your email to get a login code"
          : `We sent a 6-digit code to ${email}`}
      </h1>

      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="email-step"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSendCode}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>

            {error && <p className="text-sm text-clay-dark">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-forest text-white py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending code..." : "Send code"}
            </motion.button>

            <div className="my-2 flex items-center gap-3">
              <div className="flex-1 border-t border-line" />
              <span className="text-xs text-ink-soft">OR</span>
              <div className="flex-1 border-t border-line" />
            </div>

            <GoogleSignInButton />
          </motion.form>
        ) : (
          <motion.form
            key="code-step"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerifyCode}
            className="space-y-4"
          >
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-ink mb-1">
                6-digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-ink font-mono-figures text-lg tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>

            {error && <p className="text-sm text-clay-dark">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full rounded-md bg-forest text-white py-2 font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Verify and log in"}
            </motion.button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                }}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                Use a different email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={cooldown > 0 || isSubmitting}
                className="text-forest font-medium hover:underline disabled:text-ink-soft disabled:no-underline disabled:cursor-default"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}