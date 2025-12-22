"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Building2, User2, ArrowRight, Check, Sun, Moon, Computer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { detectLanguage, changeLanguage } from "@/i18n";
import { useTheme } from "next-themes";

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

import {
  loginFormSchema,
  signupFormSchema,
  getLoginFormSchema,
  getSignupFormSchema,
} from "@/validators/onboarding";
import { Config } from "@/config";
import { firebaseAuth, getUserDoc, setUserDoc } from "@/config/firebase";
import { createUser } from "@/models/api/user";
import { logError } from "@/utils/errors";

// --- Types ---

type AuthMode = "login" | "signup";
type AccountType = "broker" | "company";

// --- Account Type Card Component ---

interface AccountTypeCardProps {
  type: AccountType;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AccountTypeCard = ({
  selected,
  onSelect,
  icon,
  title,
  description,
}: AccountTypeCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={`
      relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 w-full
      ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
      }
    `}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <Check size={12} className="text-white" />
      </div>
    )}
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
        selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      {icon}
    </div>
    <p className={`font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
      {title}
    </p>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
  </button>
);

// --- AuthPage Component ---

export default function AuthPage({
  initialMode = "login",
}: {
  initialMode?: AuthMode;
}) {
  const { t, i18n } = useTranslation();
  const { setTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>("broker");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);

  // Detect saved language preference after hydration to avoid SSR mismatch
  React.useEffect(() => {
    detectLanguage();
  }, []);

  const contentConfig = useMemo(() => {
    return {
      broker: {
        image: "/images/login.jpg",
        alt: "Professional broker reviewing real estate documents",
        quote: t("broker_quote"),
        role: t("broker_role"),
      },
      company: {
        image: "/images/propertyCategory/commercial.jpg",
        alt: "Modern commercial real estate building",
        quote: t("company_quote"),
        role: t("company_role"),
      },
    };
  }, [t]);

  // 1. Form Setup
  const formSchema = useMemo(
    () => (mode === "signup" ? getSignupFormSchema(t) : getLoginFormSchema(t)),
    [mode, t]
  );
  type FormSchemaType =
    | z.infer<typeof signupFormSchema>
    | z.infer<typeof loginFormSchema>;

  const defaultValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  const { reset } = form;

  // Reset form when switching modes
  React.useEffect(() => {
    reset();
  }, [mode, reset]);

  // Keep the header position stable by ensuring the scrollable area resets on mode switch
  React.useEffect(() => {
    // Use 'auto' to avoid invalid ScrollBehavior values; we just want to reset position.
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [mode]);

  // Preload company image to avoid flash when switching account types
  React.useEffect(() => {
    const img = new window.Image();
    img.src = contentConfig.company.image;
  }, [contentConfig.company.image]);

  // Determine active content based on mode and account type
  const activeContent = useMemo(
    () =>
      mode === "signup" && accountType === "company"
        ? contentConfig.company
        : contentConfig.broker,
    [mode, accountType, contentConfig]
  );

  // 2. Logic Functions (Adapted from existing code)

  const createUserInDb = async (user: User, name: string) => {
    const isFirstTimeUser =
      user.metadata.creationTime === user.metadata.lastSignInTime;

    if (isFirstTimeUser) {
      if (accountType === "broker") {
        await createUser({
          email: user.email ?? "",
          uid: user.uid ?? "",
        });
      }

      const userDoc = getUserDoc(user.uid);
      await setUserDoc(userDoc, {
        email: user.email ?? "",
        uid: user.uid ?? "",
        firstName: user.displayName ?? name ?? "",
        lastName: "",
        userType: accountType,
      });

      if (accountType === "company") {
        localStorage.setItem("userType", "company");
      }
    }
  };

  const sendVerificatinLink = async (user: User) => {
    try {
      if (user.emailVerified) return;

      const actionCodeSettings = {
        url: `${window.location.origin}/app`,
        handleCodeInApp: false,
      };

      await sendEmailVerification(user, actionCodeSettings);
      localStorage.setItem("lastVerification", Date.now().toString());
      toast.success(t("verification_email_sent"));
    } catch (error) {
      console.error("Email verification error:", error);
      const firebaseError = error as FirebaseError;
      logError({
        description: `Error sending verification link`,
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      if (firebaseError.code === "auth/network-request-failed") {
        toast.error(t("network_error"));
      }
    }
  };

  const handleAuthError = (error: FirebaseError) => {
    const errorCode = error.code;
    let errorMessage = "An error occurred. Please try again.";

    if (mode === "signup") {
      if (errorCode === "auth/email-already-in-use")
        errorMessage = t("email_in_use");
      else if (errorCode === "auth/invalid-email")
        errorMessage = t("invalid_email");
    } else {
      if (
        [
          "auth/wrong-password",
          "auth/user-not-found",
          "auth/invalid-credential",
        ].includes(errorCode)
      ) {
        errorMessage = t("incorrect_email_password");
      }
    }

    if (errorCode === "auth/too-many-requests")
      errorMessage = t("too_many_requests");

    toast.error(errorMessage);

    if (errorMessage.includes("Email") || errorMessage.includes("User")) {
      form.setError("email", { message: errorMessage });
    } else if (errorMessage.includes("password")) {
      form.setError("password", { message: errorMessage });
    }
  };

  const onSubmit = async (data: FormSchemaType) => {
    try {
      setLoading(true);
      const { email, password } = data;

      const { user } = await (mode === "signup"
        ? createUserWithEmailAndPassword(firebaseAuth, email, password)
        : signInWithEmailAndPassword(firebaseAuth, email, password));

      if (mode === "signup") {
        await createUserInDb(user, "");
        await sendVerificatinLink(user);
      } else {
        if (!user.emailVerified) {
          await sendVerificatinLink(user);
        }
      }

      // Clear forgot password rate limit state on successful login
      localStorage.removeItem("brokwise_password_reset_attempts");

      toast.success(
        mode === "signup"
          ? t("account_created_success")
          : t("logged_in_success")
      );
      router.push("/");
    } catch (err) {
      handleAuthError(err as FirebaseError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    try {
      if (!Config.googleOauthClientId) {
        toast.error(t("google_oauth_not_configured"));
        return;
      }

      const redirectUri = encodeURIComponent(
        `${Config.frontendUrl}/google-oauth`
      );
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
      );
      const state = encodeURIComponent(
        JSON.stringify({
          isSignup: mode === "signup",
          accountType: mode === "signup" ? accountType : undefined,
        })
      );

      window.open(
        `https://accounts.google.com/o/oauth2/auth?client_id=${Config.googleOauthClientId}&response_type=token&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`,
        "_self"
      );
    } catch (error) {
      logError({
        description: "Error signing up with Google",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error(t("google_auth_failed"));
    }
  };

  // --- Render ---

  return (
    <div className="flex h-dvh w-full font-host-grotesk overflow-hidden bg-background">
      {/* Left Side - Image & Value Prop (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeContent.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={activeContent.image}
              alt={activeContent.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-70"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Glassmorphism Testimonial Card */}
        <div className="absolute bottom-0 left-0 p-10 w-full z-10">
          <div className="max-w-lg backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl rounded-2xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContent.quote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-instrument-serif text-white leading-snug mb-6">
                  &ldquo;{activeContent.quote}&rdquo;
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                    B
                  </div>
                  <div>
                    <p className="text-white font-semibold">Brokwise Team</p>
                    <p className="text-zinc-400 text-sm">
                      {activeContent.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form (Scrollable) */}
      <div
        className="flex-1 h-full overflow-hidden relative bg-background"
      >
        <div className="h-full w-full flex flex-col items-center px-6 lg:px-16">
          {/* Fixed header area (prevents the Brokwise title from jumping when mode changes) */}
          <div className="w-full max-w-md shrink-0 pt-7 lg:pt-10">
            <div className="flex items-center gap-2 mb-4 absolute top-2 right-2 z-50">
               <div className="flex gap-1 border rounded-full px-2 py-1 bg-background/50 backdrop-blur-sm shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setTheme("system")}
                >
                  <Computer className="h-4 w-4" />
                </Button>
              </div>
              <Select
                onValueChange={(value) => changeLanguage(value)}
                value={
                  i18n.resolvedLanguage || i18n.language?.split("-")[0] || "en"
                }
              >
                <SelectTrigger className="w-[180px] bg-background border-input">
                  <SelectValue placeholder={t("select_language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-5xl lg:text-6xl font-instrument-serif text-foreground tracking-tight">
                Brokwise
              </h1>
              <p className="text-muted-foreground text-base">
                {mode === "login"
                  ? t("welcome_back_login")
                  : t("create_account_start")}
              </p>
            </div>

            <div className="mt-8 flex p-1.5 bg-muted rounded-full relative border border-border">
              <div
                className="absolute h-[calc(100%-12px)] top-1.5 bottom-1.5 rounded-full bg-background border border-border shadow-sm transition-all duration-300 ease-in-out"
                style={{
                  width: "calc(50% - 6px)",
                  left: mode === "login" ? "6px" : "calc(50%)",
                }}
              />
              <button
                onClick={() => setMode("login")}
                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-200 rounded-full ${
                  mode === "login"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("toggle_login")}
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-200 rounded-full ${
                  mode === "signup"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("toggle_signup")}
              </button>
            </div>
          </div>

          {/* Scrollable content area (scrollbar hidden) */}
          <div
            ref={scrollAreaRef}
            className="w-full max-w-md flex-1 overflow-y-auto pt-8 pb-8 scrollbar-hide px-2"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-4">
                    <AccountTypeCard
                      type="broker"
                      selected={accountType === "broker"}
                      onSelect={() => setAccountType("broker")}
                      icon={<User2 size={24} />}
                      title={t("account_type_broker")}
                      description={t("account_type_broker_desc")}
                    />
                    <AccountTypeCard
                      type="company"
                      selected={accountType === "company"}
                      onSelect={() => setAccountType("company")}
                      icon={<Building2 size={24} />}
                      title={t("account_type_company")}
                      description={t("account_type_company_desc")}
                    />
                  </div>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            {t("email_label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@example.com"
                              type="email"
                              {...field}
                              className="h-11 bg-muted/20 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            {t("password_label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              className="h-11 bg-muted/20 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {mode === "signup" && (
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">
                              {t("confirm_password_label")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="••••••••"
                                type="password"
                                {...field}
                                className="h-11 bg-muted/20 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {mode === "login" && (
                      <div className="flex justify-end">
                        <Link
                          href="/forgot-password"
                          className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                        >
                          {t("forgot_password")}
                        </Link>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold mt-2"
                      disabled={loading}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      )}
                      {mode === "login"
                        ? t("signin_button")
                        : t("create_account_button")}
                      {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {t("or_continue_with")}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 font-semibold bg-card border-border text-foreground hover:bg-muted/50 transition-all"
                  onClick={handleGoogleAuth}
                >
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  {t("continue_with_google")}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom link pinned outside the scroll area */}
          <div className="w-full max-w-md shrink-0 text-center text-sm text-muted-foreground pb-4 lg:pb-8">
            <p>
              {mode === "login"
                ? t("dont_have_account")
                : t("already_have_account")}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                {mode === "login" ? t("toggle_signup") : t("toggle_login")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
