"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useSearchParams } from "next/navigation";
import { LEGAL_DOC_LINKS } from "@/constants/legal";

const WelcomeScreenContent = () => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentLang = i18n.language;
  const searchParams = useSearchParams();
  const target = searchParams.get("target") ?? undefined;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !Capacitor.isNativePlatform()) return;

    const updateStatusBar = async () => {
      try {
        await StatusBar.show();
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (error) {
        console.error("Error updating status bar:", error);
      }
    };

    updateStatusBar();
  }, [mounted]);

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden flex flex-col items-center justify-end pb-10 bg-[#0a2f61]">
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/login.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      </div>

      {mounted && (
        <div className="absolute right-4 z-50 flex items-center gap-2" style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}>
          <div className="flex items-center gap-1 border border-white/20 rounded-full px-1 py-0.5 bg-black/30 backdrop-blur-sm">
            <Button
              variant={currentLang === "en" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 rounded-full text-xs font-medium ${currentLang !== "en" ? "text-white hover:text-white hover:bg-white/20" : ""
                }`}
              onClick={() => changeLanguage("en")}
            >
              EN
            </Button>
            <Button
              variant={currentLang === "hi" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 rounded-full text-xs font-medium ${currentLang !== "hi" ? "text-white hover:text-white hover:bg-white/20" : ""
                }`}
              onClick={() => changeLanguage("hi")}
            >
              हिं
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
          >
            {resolvedTheme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center space-y-6">
        <div className="space-y-2 mb-4">
          <h1 className="text-5xl text-white tracking-tight">
            Brokwise
          </h1>
          <p className="text-white/80 text-lg font-light">
            The ultimate tool for real estate professionals.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-white/90"
          >
            <Link
              href={{
                pathname: "/login",
                query: { fromWelcome: "true", ...(target ? { target } : {}) },
              }}
            >
              {t("signin_button") || "Log In"}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-transparent border-white text-white hover:bg-white/10 hover:text-white"
          >
            <Link
              href={{
                pathname: "/create-account",
                query: { fromWelcome: "true", ...(target ? { target } : {}) },
              }}
            >
              {t("create_account_button") || "Create Account"}
            </Link>
          </Button>
        </div>

        <p className="text-white/60 text-xs mt-4">
          By continuing, you agree to our{" "}
          <Link
            href={LEGAL_DOC_LINKS.masterTerms}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Master Platform Terms
          </Link>
          {", "}
          <Link
            href={LEGAL_DOC_LINKS.brokerTerms}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Terms of Use for Brokers
          </Link>
          {", and "}
          <Link
            href={LEGAL_DOC_LINKS.privacyPolicy}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

const WelcomeScreenFallback = () => (
  <div className="h-[100svh] w-full bg-[#0a2f61]" />
);

export default function WelcomeScreen() {
  return (
    <Suspense fallback={<WelcomeScreenFallback />}>
      <WelcomeScreenContent />
    </Suspense>
  );
}
