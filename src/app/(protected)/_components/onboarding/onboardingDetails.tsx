import React, { useState, useEffect, useCallback, useRef } from "react";
import { submitProfileDetails } from "@/validators/onboarding";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { StatusBar, Style } from "@capacitor/status-bar";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  MoreVertical,
  Languages,
  LogOut,
  Palette,
} from "lucide-react";
import { submitUserDetails, updateProfileDetails } from "@/models/api/user";
import { useApp } from "@/context/AppContext";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Capacitor } from "@capacitor/core";
import { Step1 } from "./steps/step1";
import { Step2 } from "./steps/step2";
import { Step3 } from "./steps/step3";
import { KycState } from "@/models/types/kyc";
import {
  initiateDigiLockerVerification,
  getDigiLockerStatus,
} from "@/models/api/kyc";

const KYC_STORAGE_KEY = "bw_kyc_verification_id";
const KYC_URL_STORAGE_KEY = "bw_kyc_digilocker_url";



export const OnboardingDetails = ({
  isEditing = false,
  onCancel,
}: {
  isEditing?: boolean;
  onCancel?: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("+91");
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const isIndianNumber = selectedCountry === "+91";

  const { brokerData, setBrokerData } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ─── KYC State ───────────────────────────────────────────────────────────────
  const [kycState, setKycState] = useState<KycState>({ status: "not_started" });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? theme : undefined;

  const stepFields = {
    1: ["profilePhoto", "firstName", "lastName", "mobile"],
    2: ["companyName", "gstin", "reraNumber", "yearsOfExperience"],
    3: ["city", "officeAddress"],
  };

  const form = useForm<z.infer<typeof submitProfileDetails>>({
    resolver: zodResolver(submitProfileDetails),
    mode: "onChange",
    defaultValues: {
      profilePhoto: brokerData?.profilePhoto,
      firstName:
        brokerData?.firstName || user?.displayName?.split(" ")[0] || "",
      lastName: brokerData?.lastName || user?.displayName?.split(" ")[1] || "",
      mobile: brokerData?.mobile || user?.phoneNumber || "",
      companyName: brokerData?.companyName || "",
      gstin: brokerData?.gstin || "",
      yearsOfExperience: brokerData?.yearsOfExperience ?? undefined,
      city: brokerData?.city || "",
      officeAddress: brokerData?.officeAddress || "",
      reraNumber: brokerData?.reraNumber || "",
    },
  });
  const { formState } = form;
  const { isValid } = formState;

  useEffect(() => {
    if (!isIndianNumber) {
      form.setValue("mobile", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [form, isIndianNumber, selectedCountry]);

  // ─── Restore KYC state from localStorage on mount ────────────────────────────
  useEffect(() => {
    if (isEditing) return; // Skip for edit mode
    const savedVerificationId = localStorage.getItem(KYC_STORAGE_KEY);
    if (savedVerificationId && kycState.status === "not_started") {
      const savedUrl = localStorage.getItem(KYC_URL_STORAGE_KEY) || undefined;
      setKycState({
        status: "pending",
        verificationId: savedVerificationId,
        digiLockerUrl: savedUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // ─── KYC Polling ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (kycState.status !== "pending" || !kycState.verificationId) return;

    const poll = async () => {
      try {
        const response = await getDigiLockerStatus(kycState.verificationId!);
        const status = response.data.status;

        if (status === "AUTHENTICATED") {
          // Clear polling & localStorage
          if (pollingRef.current) clearInterval(pollingRef.current);
          localStorage.removeItem(KYC_STORAGE_KEY);
          localStorage.removeItem(KYC_URL_STORAGE_KEY);

          const userDetails = response.data.userDetails;
          setKycState({
            status: "verified",
            verificationId: kycState.verificationId,
            userDetails,
          });

          // Auto-fill form fields from Aadhaar
          if (userDetails) {
            const nameParts = userDetails.name.trim().split(/\s+/);
            const lastName = nameParts.length > 1 ? nameParts.pop()! : "";
            const firstName = nameParts.join(" ");

            form.setValue("firstName", firstName, {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("lastName", lastName, {
              shouldValidate: true,
              shouldDirty: true,
            });

            // Extract 10-digit mobile
            const mobile = (userDetails.mobile || "").replace(/\D/g, "").slice(-10);
            if (mobile.length === 10) {
              form.setValue("mobile", mobile, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }

          toast.success(t("kyc_verified_title"));
        } else if (status === "EXPIRED") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          localStorage.removeItem(KYC_STORAGE_KEY);
          localStorage.removeItem(KYC_URL_STORAGE_KEY);
          setKycState({ status: "expired" });
        } else if (status === "CONSENT_DENIED" || status === "FAILURE") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          localStorage.removeItem(KYC_STORAGE_KEY);
          localStorage.removeItem(KYC_URL_STORAGE_KEY);
          setKycState({ status: "failed" });
        }
      } catch (error) {
        console.error("Error polling KYC status:", error);
      }
    };

    // Initial check
    poll();
    // Then poll every 3 seconds
    pollingRef.current = setInterval(poll, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycState.status, kycState.verificationId]);

  const handleStartKyc = useCallback(async () => {
    try {
      setKycState((prev) => ({ ...prev, status: "initiating" }));

      const platform = Capacitor.isNativePlatform()
        ? Capacitor.getPlatform() === "ios"
          ? "ios" as const
          : "android" as const
        : "web" as const;

      const response = await initiateDigiLockerVerification(platform);
      const { verificationId, url } = response.data;

      localStorage.setItem(KYC_STORAGE_KEY, verificationId);
      localStorage.setItem(KYC_URL_STORAGE_KEY, url);

      setKycState({
        status: "pending",
        verificationId,
        digiLockerUrl: url,
      });

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
    } catch (error) {
      console.error("Error initiating KYC:", error);
      setKycState({ status: "failed" });
      toast.error(t("kyc_initiate_error"));
      logError({
        description: "Error initiating DigiLocker KYC",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
    }
  }, [t]);

  // ─── Re-open DigiLocker URL ──────────────────────────────────────────────────
  const handleOpenDigiLocker = useCallback(() => {
    const url =
      kycState.digiLockerUrl ||
      localStorage.getItem(KYC_URL_STORAGE_KEY);
    if (url) {
      if (Capacitor.isNativePlatform()) {
        import("@capacitor/browser")
          .then(({ Browser }) => Browser.open({ url }))
          .catch(() => window.open(url, "_blank"));
      } else {
        window.open(url, "_blank");
      }
    }
  }, [kycState.digiLockerUrl]);

  const onSubmitProfileDetails = async (
    data: z.infer<typeof submitProfileDetails>
  ) => {
    if (!user || !brokerData) {
      toast.error("User or broker data not found");
      return;
    }
    console.log(data);

    try {
      setLoading(true);

      if (isEditing) {
        await updateProfileDetails({
          _id: brokerData._id,
          ...data,
        });

        setBrokerData({
          ...brokerData,
          ...data,
        });

        toast.success("Profile updated successfully!");
        if (onCancel) onCancel();
      } else {
        await submitUserDetails({
          uid: user.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: user.email || "",
          _id: brokerData._id,
          mobile: data.mobile,
          companyName: data.companyName,
          gstin: data.gstin,
          yearsOfExperience: data.yearsOfExperience,
          city: data.city,
          officeAddress: data.officeAddress,
          reraNumber: data.reraNumber,
          profilePhoto: data.profilePhoto,
        });

        // Update broker data in context
        setBrokerData({
          ...brokerData,
          ...data,
          status: "pending",
        });

        toast.success(
          "Profile details submitted successfully! Your account is now pending approval."
        );
      }
    } catch (error) {
      logError({
        description: "Error submitting profile details",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to submit profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Require KYC for Step 1 (Indian users, non-editing mode)
    if (
      step === 1 &&
      isIndianNumber &&
      !isEditing &&
      kycState.status !== "verified"
    ) {
      toast.error(t("kyc_required_error"));
      return;
    }

    const fields = stepFields[
      step as keyof typeof stepFields
    ] as (keyof z.infer<typeof submitProfileDetails>)[];
    const isStepValid = await form.trigger(fields);

    if (!isStepValid) return;

    if (step === 3) {
      onSubmitProfileDetails(form.getValues());
    } else {
      setDirection(1);
      setStep(step + 1);
    }
  };
  React.useEffect(() => {
    if (!mounted || !Capacitor.isNativePlatform()) return;

    const updateStatusBar = async () => {
      try {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        await StatusBar.show();
        await StatusBar.setOverlaysWebView({ overlay: false });
        if (currentTheme === "dark") {
          await StatusBar.setStyle({ style: Style.Dark });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
        }
      } catch (error) {
        console.error("Error updating status bar:", error);
      }
    };

    updateStatusBar();
  }, [mounted, theme, resolvedTheme]);


  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden md:overflow-y-auto transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
      {/* Theme & Language Toggles */}
      <div className="absolute top-[calc(env(safe-area-inset-top))] right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("onboarding_settings") || "Settings"}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Language Selection */}
            <DropdownMenuItem className="flex justify-between cursor-pointer" onSelect={(e) => e.preventDefault()}>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>{t("onboarding_language") || "Language"}</span>
              </div>
              <div className="flex items-center gap-1 border rounded-full px-1 py-0.5 bg-slate-100 dark:bg-slate-800">
                <Button
                  variant={currentLang === "en" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 rounded-full text-[10px] font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage("en");
                  }}
                >
                  EN
                </Button>
                <Button
                  variant={currentLang === "hi" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 rounded-full text-[10px] font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage("hi");
                  }}
                >
                  हिं
                </Button>
              </div>
            </DropdownMenuItem>

            {/* Theme Toggle */}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setTheme(activeTheme === "light" ? "dark" : "light")}
            >
              <Palette className="mr-2 h-4 w-4" />
              <span>{activeTheme === "light" ? "Dark Mode" : "Light Mode"}</span>
              {activeTheme === "light" ? (
                <Moon className="ml-auto h-4 w-4" />
              ) : (
                <Sun className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout/Cancel */}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => (isEditing && onCancel ? onCancel() : signOut())}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isEditing ? t("onboarding_cancel") : t("onboarding_logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex min-h-full items-center justify-center p-0 md:p-4">
        {/* Executive Card */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitProfileDetails)}
            className="relative w-full md:max-w-2xl bg-white dark:bg-[#0F172A] md:rounded-2xl shadow-none md:shadow-2xl md:shadow-slate-200/50 dark:shadow-none border-0 md:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[100dvh] md:h-auto md:min-h-0 my-0 md:my-10"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800 z-10">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden max-w-full">
              <div className="p-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] md:p-12 md:pt-12 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h1 className="text-2xl md:text-4xl text-slate-900 dark:text-slate-50 font-semibold">
                      {isEditing ? (
                        t("onboarding_update_profile")
                      ) : (
                        <>
                          {t("onboarding_setup_profile").split("profile")[0]}
                          <span className="text-primary">profile</span>
                        </>
                      )}
                    </h1>
                    <span className="hidden sm:block text-xs font-bold tracking-widest text-slate-400 uppercase">
                      {t("onboarding_step_of", { step, total: totalSteps })}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                    {t("onboarding_profile_details_desc")}
                  </p>
                </div>

                {/* Form Fields */}
                <div className="relative min-h-[300px]">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="space-y-6"
                    >
                      {step === 1 && (
                        <Step1
                          form={form}
                          selectedCountry={selectedCountry}
                          setSelectedCountry={setSelectedCountry}
                          kycState={kycState}
                          onStartKyc={handleStartKyc}
                          onOpenDigiLocker={handleOpenDigiLocker}
                          isEditing={isEditing}
                        />
                      )}

                      {step === 2 && (
                        <Step2 form={form} />
                      )}

                      {step === 3 && (
                        <Step3 form={form} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 md:p-12 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0F172A] z-20">
              <div className="flex items-center justify-between">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handlePrev}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("onboarding_back")}
                  </Button>
                ) : (
                  <div /> // Spacer
                )}

                <Button
                  onClick={handleNext}
                  type="button"
                  disabled={loading || (step === 1 && !isIndianNumber)}
                  className={`
                  h-12 px-8 font-medium
                  bg-primary text-white hover:bg-[#1E293B]
                  dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200
                  transition-all duration-300
                  ${step === 3 && !isValid && !loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:-translate-y-0.5"
                    }
                `}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isEditing ? t("onboarding_updating") : t("onboarding_submitting")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {step === 3
                        ? isEditing
                          ? t("onboarding_update_profile_btn")
                          : t("onboarding_complete_setup")
                        : t("onboarding_continue")}
                      {step < 3 && <ArrowRight className="h-4 w-4" />}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};
