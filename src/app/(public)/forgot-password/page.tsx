"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, ArrowRight, Mail, Clock, UserX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { checkUserExistsByEmail } from "@/models/api/user";
import { useTranslation } from "react-i18next";
import { detectLanguage, changeLanguage } from "@/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { firebaseAuth } from "@/config/firebase";
import { FirebaseError } from "firebase/app";

// --- Rate Limiting Constants ---
const STORAGE_KEY = "brokwise_password_reset_attempts";
const MAX_ATTEMPTS_PER_HOUR = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

// Progressive cooldown in seconds: 30s, 60s, 120s, 300s (5 min)
const COOLDOWN_TIERS = [30, 60, 120, 300];

interface RateLimitState {
  attempts: number[];
  lastAttemptTime: number;
}

// --- Schema ---
const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("invalid_email") }),
  });

type FormSchemaType = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

// --- Helper Functions ---
const getRateLimitState = (): RateLimitState => {
  if (typeof window === "undefined") {
    return { attempts: [], lastAttemptTime: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid JSON, reset state
  }
  return { attempts: [], lastAttemptTime: 0 };
};

const saveRateLimitState = (state: RateLimitState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const getAttemptsInLastHour = (attempts: number[]): number[] => {
  const oneHourAgo = Date.now() - HOUR_IN_MS;
  return attempts.filter((timestamp) => timestamp > oneHourAgo);
};

const getCooldownSeconds = (attemptCount: number): number => {
  if (attemptCount <= 1) return 0;
  const tierIndex = Math.min(attemptCount - 2, COOLDOWN_TIERS.length - 1);
  return COOLDOWN_TIERS[tierIndex];
};

type PageState = "form" | "email_sent" | "user_not_found";

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS_PER_HOUR);

  // Detect saved language preference
  useEffect(() => {
    detectLanguage();
  }, []);

  // Initialize and update rate limit state
  const updateRateLimitDisplay = useCallback(() => {
    const state = getRateLimitState();
    const validAttempts = getAttemptsInLastHour(state.attempts);

    // Update attempts remaining
    setAttemptsRemaining(MAX_ATTEMPTS_PER_HOUR - validAttempts.length);

    // Calculate cooldown if needed
    if (state.lastAttemptTime > 0 && validAttempts.length > 0) {
      const cooldownDuration = getCooldownSeconds(validAttempts.length);
      const timeSinceLastAttempt = Math.floor((Date.now() - state.lastAttemptTime) / 1000);
      const remaining = cooldownDuration - timeSinceLastAttempt;
      setCooldownRemaining(Math.max(0, remaining));
    }
  }, []);

  useEffect(() => {
    updateRateLimitDisplay();
  }, [updateRateLimitDisplay]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const formSchema = React.useMemo(() => getForgotPasswordSchema(t), [t]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const canSendEmail = (): boolean => {
    const state = getRateLimitState();
    const validAttempts = getAttemptsInLastHour(state.attempts);

    // Check max attempts
    if (validAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      return false;
    }

    // Check cooldown
    if (state.lastAttemptTime > 0 && validAttempts.length > 0) {
      const cooldownDuration = getCooldownSeconds(validAttempts.length);
      const timeSinceLastAttempt = (Date.now() - state.lastAttemptTime) / 1000;
      if (timeSinceLastAttempt < cooldownDuration) {
        return false;
      }
    }

    return true;
  };

  const recordAttempt = () => {
    const state = getRateLimitState();
    const validAttempts = getAttemptsInLastHour(state.attempts);
    const now = Date.now();

    const newState: RateLimitState = {
      attempts: [...validAttempts, now],
      lastAttemptTime: now,
    };

    saveRateLimitState(newState);

    // Update display
    const newValidAttempts = getAttemptsInLastHour(newState.attempts);
    setAttemptsRemaining(MAX_ATTEMPTS_PER_HOUR - newValidAttempts.length);

    // Set next cooldown
    const nextCooldown = getCooldownSeconds(newValidAttempts.length);
    setCooldownRemaining(nextCooldown);
  };

  const onSubmit = async (data: FormSchemaType) => {
    // Check rate limiting
    if (!canSendEmail()) {
      if (attemptsRemaining <= 0) {
        toast.error(
          t("max_attempts_reached") ||
          "Maximum attempts reached. Please try again in an hour."
        );
      } else {
        toast.error(
          t("please_wait_cooldown") ||
          `Please wait ${cooldownRemaining} seconds before trying again.`
        );
      }
      return;
    }

    try {
      setLoading(true);

      // First check if user exists in our database via API
      // NOTE: This requires the backend /broker/checkEmail endpoint to be implemented
      try {
        const { exists } = await checkUserExistsByEmail(data.email);
        if (!exists) {
          recordAttempt();
          setPageState("user_not_found");
          return;
        }
      } catch (apiError) {
        // Backend endpoint not available - fall back to Firebase
        // TODO: Implement /broker/checkEmail endpoint on backend to prevent emails to non-existent users
        console.warn(
          "[Password Reset] /broker/checkEmail endpoint not available. Falling back to Firebase behavior.",
          apiError
        );
      }

      // User exists, send password reset email
      await sendPasswordResetEmail(firebaseAuth, data.email);

      // Record this attempt after success
      recordAttempt();

      setPageState("email_sent");
      toast.success(
        t("password_reset_email_sent") || "Password reset email sent!"
      );
    } catch (error) {
      console.error("Password reset error:", error);
      const firebaseError = error as FirebaseError;
      let errorMessage =
        t("generic_error") || "An error occurred. Please try again.";

      if (firebaseError.code === "auth/user-not-found") {
        // Show user not found state with option to create account
        recordAttempt();
        setPageState("user_not_found");
        return;
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = t("invalid_email") || "Invalid email address.";
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage =
          t("too_many_requests") ||
          "Too many requests. Please try again later.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canSendEmail()) {
      if (attemptsRemaining <= 0) {
        toast.error(
          t("max_attempts_reached") ||
          "Maximum attempts reached. Please try again in an hour."
        );
      } else if (cooldownRemaining > 0) {
        toast.error(
          `${t("please_wait") || "Please wait"} ${cooldownRemaining}s`
        );
      }
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  };

  const isDisabled = loading || cooldownRemaining > 0 || attemptsRemaining <= 0;

  return (
    <div className="flex h-dvh w-full font-host-grotesk overflow-hidden bg-zinc-950">
      {/* Left Side - Image (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src="/images/login.jpg"
            alt="Real estate office"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </motion.div>

        {/* Quote/Testimonial Area */}
        <div className="absolute bottom-0 left-0 p-10 w-full z-10">
          <div className="max-w-lg backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl rounded-2xl p-8">
            <h2 className="text-3xl font-instrument-serif text-white leading-snug mb-2">
              Brokwise
            </h2>
            <p className="text-zinc-300">
              {t("forgot_password_quote") ||
                "Recover your account access securely."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className="flex-1 h-full overflow-hidden relative bg-zinc-950"
        style={{
          background:
            "radial-gradient(ellipse at top right, #18181b 0%, #09090b 50%, #09090b 100%)",
        }}
      >
        <div className="h-full w-full flex flex-col items-center px-6 lg:px-16">
          {/* Header */}
          <div className="w-full max-w-md shrink-0 pt-7 lg:pt-10 relative">
            <div className="flex justify-between items-start mb-12">
              <Link
                href="/login"
                className="flex items-center text-zinc-400 hover:text-white transition-colors group"
              >
                <ArrowLeft
                  size={20}
                  className="mr-2 group-hover:-translate-x-1 transition-transform"
                />
                {t("back_to_login") || "Back to Login"}
              </Link>

              <Select
                onValueChange={(value) => changeLanguage(value)}
                value={
                  i18n.resolvedLanguage || i18n.language?.split("-")[0] || "en"
                }
              >
                <SelectTrigger className="w-[140px] text-white border-zinc-700 bg-zinc-800/50 h-9 text-xs">
                  <SelectValue placeholder={t("select_language")} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-left space-y-3 mb-8">
              <h1 className="text-4xl lg:text-5xl font-instrument-serif text-white tracking-tight">
                {pageState === "email_sent"
                  ? t("check_email") || "Check your email"
                  : pageState === "user_not_found"
                    ? t("account_not_found") || "Account Not Found"
                    : t("forgot_password_title") || "Forgot Password?"}
              </h1>
              <p className="text-zinc-400 text-base">
                {pageState === "email_sent"
                  ? t("reset_link_sent_desc") ||
                  "We have sent a password reset link to your email address."
                  : pageState === "user_not_found"
                    ? t("account_not_found_desc") ||
                    "We couldn't find an account with this email address."
                    : t("forgot_password_desc") ||
                    "Enter your email address and we'll send you a link to reset your password."}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md flex-1 overflow-y-auto pb-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              {pageState === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium">
                              {t("email_label")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <Input
                                  placeholder="name@example.com"
                                  type="text"
                                  autoComplete="email"
                                  inputMode="email"
                                  {...field}
                                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold mt-2"
                        disabled={isDisabled}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        )}
                        {cooldownRemaining > 0 ? (
                          <>
                            <Clock className="mr-2 h-5 w-5" />
                            {t("wait") || "Wait"} {formatTime(cooldownRemaining)}
                          </>
                        ) : attemptsRemaining <= 0 ? (
                          t("max_attempts_reached_short") || "Try again later"
                        ) : (
                          <>
                            {t("send_reset_link") || "Send Reset Link"}
                            {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                          </>
                        )}
                      </Button>

                      {/* Rate limit info */}
                      {attemptsRemaining < MAX_ATTEMPTS_PER_HOUR && (
                        <p className="text-zinc-500 text-xs text-center">
                          {t("attempts_remaining") || "Attempts remaining"}:{" "}
                          <span
                            className={
                              attemptsRemaining <= 2
                                ? "text-amber-500"
                                : "text-zinc-400"
                            }
                          >
                            {attemptsRemaining}/{MAX_ATTEMPTS_PER_HOUR}
                          </span>
                        </p>
                      )}
                    </form>
                  </Form>
                </motion.div>
              )}

              {pageState === "email_sent" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-zinc-300 mb-4">
                      {t("email_sent_to") || "We sent an email to"}{" "}
                      <span className="text-white font-medium">
                        {form.getValues("email")}
                      </span>
                    </p>
                    <p className="text-zinc-500 text-sm mb-6">
                      {t("check_spam_folder") || "Can't find it? Check your spam or junk folder."}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                      onClick={() => setPageState("form")}
                    >
                      {t("try_another_email") || "Try another email"}
                    </Button>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-zinc-500 text-sm">
                      {t("didnt_receive_email") || "Didn't receive the email?"}{" "}
                      {cooldownRemaining > 0 ? (
                        <span className="text-zinc-400">
                          {t("resend_in") || "Resend in"}{" "}
                          <span className="text-primary font-medium">
                            {formatTime(cooldownRemaining)}
                          </span>
                        </span>
                      ) : attemptsRemaining <= 0 ? (
                        <span className="text-amber-500 text-xs">
                          {t("max_attempts_reached_short") || "Try again later"}
                        </span>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={loading || cooldownRemaining > 0}
                          className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("click_to_resend") || "Click to resend"}
                        </button>
                      )}
                    </p>

                    {/* Rate limit info on success screen */}
                    {attemptsRemaining < MAX_ATTEMPTS_PER_HOUR && (
                      <p className="text-zinc-600 text-xs">
                        {t("attempts_remaining") || "Attempts remaining"}:{" "}
                        <span
                          className={
                            attemptsRemaining <= 2
                              ? "text-amber-500"
                              : "text-zinc-500"
                          }
                        >
                          {attemptsRemaining}/{MAX_ATTEMPTS_PER_HOUR}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {pageState === "user_not_found" && (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                      <UserX className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-zinc-300 mb-2">
                      {t("no_account_with_email") || "No account exists with"}{" "}
                      <span className="text-white font-medium">
                        {form.getValues("email")}
                      </span>
                    </p>
                    <p className="text-zinc-500 text-sm mb-6">
                      {t("create_account_suggestion") || "Would you like to create a new account instead?"}
                    </p>
                    <div className="w-full space-y-3">
                      <Link href="/create-account" className="block w-full">
                        <Button className="w-full h-11 text-base font-semibold">
                          {t("create_account_button") || "Create Account"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={() => setPageState("form")}
                      >
                        {t("try_another_email") || "Try another email"}
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-zinc-500 text-sm">
                      {t("already_have_account") || "Already have an account?"}{" "}
                      <Link
                        href="/login"
                        className="text-primary hover:underline font-medium"
                      >
                        {t("toggle_login") || "Login"}
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
