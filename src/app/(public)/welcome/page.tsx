"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const WelcomeScreen = () => {
  const { t } = useTranslation();

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
