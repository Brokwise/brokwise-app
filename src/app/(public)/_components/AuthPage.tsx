"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Building2,
  User2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sun,
  Moon,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { PrivacyScreen } from "@capacitor/privacy-screen";


import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithCredential,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { detectLanguage, changeLanguage } from "@/i18n";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  loginFormSchema,
  signupFormSchema,
  getLoginFormSchema,
  getSignupFormSchema,
} from "@/validators/onboarding";
import { Config } from "@/config";
import { firebaseAuth, getUserDoc, setUserDoc } from "@/config/firebase";
import { createUser } from "@/models/api/user";
import { logError } from "@/utils/errors";
import { useIsMobile } from "@/hooks/use-mobile";
// import { tr } from "zod/v4/locales";

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
  disabled?: boolean;
}

const AccountTypeCard = ({
  disabled = false,
  selected,
  onSelect,
  icon,
  title,
  description,
}: AccountTypeCardProps) => (
  <button
    type="button"
    onClick={disabled ? undefined : onSelect}
    disabled={disabled}
    className={`
      relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 w-full
      ${selected
        ? "border-accent bg-primary/5 ring-2 ring-accent ring-offset-2 ring-offset-background"
        : "border-border bg-card hover:border-accent/50"
      }
    `}
  >
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
        <Check size={12} className="text-primary-foreground" />
      </div>
    )}
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${selected
        ? "bg-primary/20 text-primary"
        : "bg-muted text-muted-foreground"
        }`}
    >
      {icon}
    </div>
    <p className="text-xs text-muted-foreground mt-1">{disabled ? "Coming Soon" : ""}</p>
    <p
      className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"
        }`}
    >
      {title}
    </p>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
  </button>
);

export default function AuthPage({
  initialMode = "login",
}: {
  initialMode?: AuthMode;
}) {
  const { t, i18n } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>("broker");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const currentLang = i18n.language;
  const getSafeTarget = React.useCallback((target: string | null) => {
    if (!target || typeof target !== "string") return "/";
    if (!target.startsWith("/") || target.startsWith("//")) return "/";
    return target;
  }, []);
  const targetPath = getSafeTarget(searchParams.get("target"));
  const welcomePath =
    targetPath && targetPath !== "/"
      ? `/welcome?target=${encodeURIComponent(targetPath)}`
      : "/welcome";

  React.useEffect(() => {
    detectLanguage();
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMobile === true && searchParams.get("fromWelcome") !== "true") {
      router.replace(welcomePath);
    }
  }, [isMobile, searchParams, router, welcomePath]);


  const activeTheme = mounted ? resolvedTheme ?? theme : undefined;
  const authMenuItemClass =
    "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground";
  const authMenuSelectedItemClass =
    "bg-muted text-foreground font-semibold focus:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground";
  // const isSystemTheme = mounted && theme === "system";

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
    setShowPassword(false);
    setShowConfirmPassword(false);
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
      router.push(targetPath);
    } catch (err) {
      handleAuthError(err as FirebaseError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        setLoading(true);

        // Disable PrivacyScreen before Google Sign-In to prevent it from
        // presenting an overlay on top of the ASWebAuthenticationSession,
        // which blocks the Google sign-in UI on iOS.
        try {
          await PrivacyScreen.disable();
        } catch {
          // PrivacyScreen might not be available, ignore
        }

        let result;
        try {
          result = await FirebaseAuthentication.signInWithGoogle();
        } catch (error: unknown) {
          // Re-enable PrivacyScreen after sign-in failure
          try { await PrivacyScreen.enable(); } catch { /* ignore */ }

          // User cancelled the sign-in flow
          const errMsg = error instanceof Error ? error.message : String(error);
          if (
            errMsg.includes("canceled") ||
            errMsg.includes("cancelled") ||
            errMsg.includes("The user canceled the sign-in flow")
          ) {
            console.log("Google sign-in cancelled by user");
            return;
          }
          console.error("Google sign-in error:", error);
          throw error;
        }

        // Re-enable PrivacyScreen after sign-in completes
        try { await PrivacyScreen.enable(); } catch { /* ignore */ }

        if (!result) {
          return;
        }

        // With skipNativeAuth: false, the plugin signs in to Firebase natively
        // and syncs auth state to the web SDK. We still handle the credential
        // case as a fallback to ensure the web SDK is signed in.
        let user: User | null = null;

        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          const userCredential = await signInWithCredential(firebaseAuth, credential);
          user = userCredential.user;
        } else {
          // Native auth handled sign-in; wait for web SDK to sync
          user = await new Promise<User>((resolve, reject) => {
            const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
              if (authUser) {
                unsubscribe();
                resolve(authUser);
              }
            });
            setTimeout(() => {
              unsubscribe();
              reject(new Error("Auth state sync timed out"));
            }, 10000);
          });
        }

        if (!user) {
          throw new Error("No user returned from Google Sign-In");
        }

        // Create user in DB if first time
        await createUserInDb(user, user.displayName ?? "");

        // Clear forgot password rate limit state on successful login
        localStorage.removeItem("brokwise_password_reset_attempts");

        toast.success(t("logged_in_success"));
        router.push(targetPath);
      } else {
        // Web OAuth flow
        if (!Config.googleOauthClientId) {
          toast.error(t("google_oauth_not_configured"));
          return;
        }

        const target = targetPath;
        const redirectUrlStr = `${Config.frontendUrl}/google-oauth`;
        const redirectUri = encodeURIComponent(redirectUrlStr);

        const scope = encodeURIComponent(
          "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        );

        const statePayload = `false---${target}`;

        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${Config.googleOauthClientId
          }&response_type=token&scope=${scope}&redirect_uri=${redirectUri}&state=${encodeURIComponent(
            statePayload
          )}`;

        window.open(authUrl, "_self");
      }
    } catch (error) {
      logError({
        description: "Error signing up with Google",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      console.error("Google auth error:", error);
      toast.error(t("google_auth_failed"));
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Left Side - Image & Value Prop (Fixed) */}
      <div
        className={`hidden lg:flex lg:w-1/2 h-full relative overflow-hidden transition-colors duration-500 ${activeTheme === "light" ? "bg-slate-100" : "bg-black"
          }`}
      >
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
              className={`object-cover transition-opacity duration-500 ${activeTheme === "light" ? "opacity-100" : "opacity-70"
                }`}
              priority
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t transition-colors duration-500 ${activeTheme === "light"
                ? "from-white/70 via-transparent to-transparent"
                : "from-black/90 via-black/40 to-black/20"
                }`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Glassmorphism Testimonial Card */}
        <div className="absolute bottom-0 left-0 p-10 w-full z-10">
          <div
            className={`max-w-lg backdrop-blur-lg border shadow-2xl rounded-2xl p-8 transition-all duration-500 ${activeTheme === "light"
              ? "bg-white/90 border-slate-200 shadow-slate-300/50"
              : "bg-black/20 border-white/10"
              }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContent.quote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className={`text-3xl leading-snug mb-6 transition-colors duration-500 ${activeTheme === "light" ? "text-slate-900" : "text-white"
                    }`}
                >
                  &ldquo;{activeContent.quote}&rdquo;
                </h2>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-lg transition-colors duration-500 ${activeTheme === "light"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-white/10 border-white/20 text-white"
                      }`}
                  >
                    B
                  </div>
                  <div>
                    <p
                      className={`font-semibold transition-colors duration-500 ${activeTheme === "light"
                        ? "text-slate-900"
                        : "text-white"
                        }`}
                    >
                      Brokwise Team
                    </p>
                    <p
                      className={`text-sm transition-colors duration-500 ${activeTheme === "light"
                        ? "text-slate-500"
                        : "text-zinc-400"
                        }`}
                    >
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
        className={`flex-1 h-full overflow-hidden relative flex flex-col transition-colors duration-500 ${activeTheme === "light" ? "bg-[#FDFCF8]" : "bg-background"
          }`}
      >
        {/* Safe area spacer - fixed at top with same background */}
        <div
          className={`shrink-0 ${activeTheme === "light" ? "bg-[#FDFCF8]" : "bg-background"}`}
          style={{ height: "env(safe-area-inset-top, 0px)" }}
        />

        {isMobile && (
          <div className="absolute left-4 z-50" style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(welcomePath)}
              className="rounded-full"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Language and Theme Toggle - Top Right */}
        <div className="absolute right-4 z-50" style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm border">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  setTheme(activeTheme === "light" ? "dark" : "light")
                }
                className={authMenuItemClass}
              >
                {activeTheme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                {activeTheme === "light" ? "Dark Mode" : "Light Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => changeLanguage("en")}
                className={`${authMenuItemClass} ${currentLang === "en" ? authMenuSelectedItemClass : ""}`}
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage("hi")}
                className={`${authMenuItemClass} ${currentLang === "hi" ? authMenuSelectedItemClass : ""}`}
              >
                हिंदी
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 w-full flex flex-col items-center px-6 lg:px-16 overflow-auto">
          {/* Fixed header area (prevents the Brokwise title from jumping when mode changes) */}
          <div className="w-full max-w-md shrink-0 pt-7 lg:pt-10">
            <div className="text-center space-y-3">
              <h1 className="text-5xl lg:text-6xl text-foreground tracking-tight">
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
                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-200 rounded-full ${mode === "login"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t("toggle_login")}
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors duration-200 rounded-full ${mode === "signup"
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
            className="w-full max-w-md flex-1 overflow-y-auto pt-4 pb-8 scrollbar-hide px-2"
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
                      disabled={true}
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
                              className="h-11 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
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
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                {...field}
                                className="h-11 pr-10 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={
                                  showPassword ? "Hide password" : "Show password"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
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
                              <div className="relative">
                                <Input
                                  placeholder="••••••••"
                                  type={showConfirmPassword ? "text" : "password"}
                                  {...field}
                                  className="h-11 pr-10 border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmPassword((prev) => !prev)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label={
                                    showConfirmPassword
                                      ? "Hide confirm password"
                                      : "Show confirm password"
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
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
                    {t("or")}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 font-semibold bg-card border-border text-foreground hover:bg-muted/50 hover:text-foreground transition-all"
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
          <div className="w-full max-w-md shrink-0 text-center text-sm text-muted-foreground pb-4 lg:pb-8 space-y-3">
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
            <p className="text-xs text-muted-foreground/70">
              By continuing, you agree to our{" "}
              <Link href="/terms-and-conditions" className="text-primary/80 hover:text-primary hover:underline">Terms & Conditions</Link>
              {" "}and{" "}
              <Link href="/privacy-policy" className="text-primary/80 hover:text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
