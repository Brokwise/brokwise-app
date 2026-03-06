import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Step4IosCompletion: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <Check className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t("onboarding_profile_saved_title", "Profile Saved!")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t("onboarding_ios_manage_account", "Manage your account at")}
          </p>
          <p className="text-base font-semibold text-primary select-all">
            <Link href="https://app.brokwise.com" target="_blank" className="underline">
              app.brokwise.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
