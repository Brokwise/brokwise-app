"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const WelcomeScreen = () => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentLang = i18n.language;

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-dvh w-full overflow-hidden flex flex-col items-center justify-end pb-10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/login.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      </div>

      {/* Language and Theme Toggle - Top Right */}
      {mounted && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 border border-white/20 rounded-full px-1 py-0.5 bg-black/30 backdrop-blur-sm">
            <Button
              variant={currentLang === "en" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 rounded-full text-xs font-medium ${
                currentLang !== "en" ? "text-white hover:text-white hover:bg-white/20" : ""
              }`}
              onClick={() => changeLanguage("en")}
            >
              EN
            </Button>
            <Button
              variant={currentLang === "hi" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2.5 rounded-full text-xs font-medium ${
                currentLang !== "hi" ? "text-white hover:text-white hover:bg-white/20" : ""
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
            className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white"
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
          <h1 className="text-5xl font-instrument-serif text-white tracking-tight">
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
            <Link href="/login?fromWelcome=true">
              {t("signin_button") || "Log In"}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-transparent border-white text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/create-account?fromWelcome=true">
              {t("create_account_button") || "Create Account"}
            </Link>
          </Button>
        </div>

        <p className="text-white/60 text-xs mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
