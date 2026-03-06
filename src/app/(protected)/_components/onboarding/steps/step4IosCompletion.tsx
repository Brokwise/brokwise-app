import React, { useState, useCallback } from "react";
import { Check, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { createTransferToken } from "@/models/api/session";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { logError } from "@/utils/errors";

export const Step4IosCompletion: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const openUrl = useCallback(async (url: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url, presentationStyle: "popover" });
      } catch {
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  }, []);

  const handleOpenWebApp = useCallback(async () => {
    try {
      setLoading(true);
      const result = await createTransferToken();
      const token = result.data.customToken;
      await openUrl(
        `https://app.brokwise.com/auth/token-login?token=${encodeURIComponent(token)}`
      );
    } catch (error) {
      logError({
        description: "Failed to generate auth transfer token for iOS web redirect",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      await openUrl("https://app.brokwise.com");
      toast.info(
        t("onboarding_ios_login_fallback", "Please log in on the web app to continue.")
      );
    } finally {
      setLoading(false);
    }
  }, [openUrl, t]);

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <Check className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t("onboarding_profile_saved_title", "Profile Saved!")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t(
              "onboarding_ios_manage_account",
              "Manage your account at"
            )}
          </p>
          <Button
            onClick={handleOpenWebApp}
            disabled={loading}
            variant="outline"
            className="mt-2 gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t("onboarding_ios_opening", "Opening...")}
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                app.brokwise.com
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
