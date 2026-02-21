import React, { useState, useEffect, useCallback, useRef } from "react";
import Script from "next/script";
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
  Crown,
  Zap,
  Rocket,
  Check,
  Sparkles,
  CreditCard,
  Loader2,
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
import { TIER } from "@/models/types/subscription";
import {
  ACTIVATION_PLANS,
  ACTIVATION_TIER_INFO,
  ACTIVATION_LIMITS,
} from "@/config/tier_limits";
import { usePurchaseActivation, useVerifyActivation } from "@/hooks/useSubscription";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DisclaimerNotice } from "@/components/ui/disclaimer-notice";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";
import { Separator } from "@/components/ui/separator";
import {
  trackMetaEvent,
  isPaymentTracked,
  markPaymentTracked,
  isRegistrationTracked,
  markRegistrationTracked,
} from "@/utils/tracking";

const KYC_STORAGE_KEY = "bw_kyc_verification_id";
const KYC_URL_STORAGE_KEY = "bw_kyc_digilocker_url";
const SELECTED_TIER_KEY = "bw_onboarding_tier";

// ─── Tier icons & colors ─────────────────────────────────────────────────────
const tierIcons: Record<TIER, React.ReactNode> = {
  BASIC: <Zap className="h-6 w-6" />,
  ESSENTIAL: <Rocket className="h-6 w-6" />,
  PRO: <Crown className="h-6 w-6" />,
};

const tierColors: Record<TIER, string> = {
  BASIC: "from-gray-500 to-gray-600",
  ESSENTIAL: "from-blue-500 to-blue-600",
  PRO: "from-amber-500 to-amber-600",
};

// ─── Plan Selection Step (Step 4) ────────────────────────────────────────────
const PlanSelectionStep = ({
  selectedTier,
  onSelect,
}: {
  selectedTier: TIER | null;
  onSelect: (tier: TIER) => void;
}) => {
  const { t } = useTranslation();
  const tiers: TIER[] = ["BASIC", "ESSENTIAL", "PRO"];

  return (
    <div className="space-y-6">
      {/* <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {t("onboarding_choose_plan_title") || "Choose Your Activation Plan"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("onboarding_choose_plan_desc") || "Start with a 1-month activation pack to explore the platform"}
        </p>
      </div> */}

      <div className="grid grid-cols-1 gap-4">
        {tiers.map((tier) => {
          const info = ACTIVATION_TIER_INFO[tier];
          const plan = ACTIVATION_PLANS[tier];
          const isSelected = selectedTier === tier;
          const limits = ACTIVATION_LIMITS[tier];

          return (
            <Card
              key={tier}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-lg border-primary",
                info.recommended && !isSelected && "border-blue-200 dark:border-blue-800"
              )}
              onClick={() => onSelect(tier)}
            >
              {info.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    {t("onboarding_recommended") || "Popular"}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r text-white shrink-0",
                      tierColors[tier]
                    )}
                  >
                    {tierIcons[tier]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{info.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {info.description}
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      ₹{plan.displayAmount}
                    </div>
                    <div className="text-xs text-slate-500">{t("onboarding_per_month") || "for 1 month"}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{limits.PROPERTY_LISTING}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_listings") || "Listings"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{limits.ENQUIRY_LISTING}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_enquiries") || "Enquiries"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                    <p className="text-sm font-bold">{plan.credits}</p>
                    <p className="text-[10px] text-slate-500">{t("onboarding_credits") || "Credits"}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 pb-4">
                <div className="w-full flex items-center justify-center">
                  {isSelected ? (
                    <Badge className="bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 mr-1" /> {t("onboarding_selected") || "Selected"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">{t("onboarding_tap_to_select") || "Tap to select"}</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── Welcome Step (Step 5) ───────────────────────────────────────────────────
const WelcomeStep = ({
  selectedTier,
  loading,
}: {
  selectedTier: TIER;
  loading: boolean;
}) => {
  const { t } = useTranslation();
  const plan = ACTIVATION_PLANS[selectedTier];
  const info = ACTIVATION_TIER_INFO[selectedTier];

  return (
    <div className="space-y-8 text-center">
      {/* Welcome Illustration */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r text-white shadow-lg",
            tierColors[selectedTier]
          )}
        >
          {tierIcons[selectedTier]}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t("onboarding_welcome_title", "Welcome to Brokwise!")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t("onboarding_welcome_desc", "You are almost done. Complete your activation to start using the platform.")}
          </p>
        </div>
      </div>

      {/* Plan Summary */}
      <Card className="text-left border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r text-white",
                  tierColors[selectedTier]
                )}
              >
                {React.cloneElement(tierIcons[selectedTier] as React.ReactElement, {
                  className: "h-4 w-4",
                })}
              </div>
              <div>
                <CardTitle className="text-base">{info.name} {t("onboarding_activation_pack", "Activation Pack")}</CardTitle>
                <CardDescription className="text-xs">{t("onboarding_1_month_access", "1 Month Access")}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">₹{plan.displayAmount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Separator className="mb-3" />
          <ul className="space-y-1.5">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <CreditCard className="h-3.5 w-3.5" />
          <span>{t("onboarding_secure_razorpay", "Secure payment via Razorpay")}</span>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("onboarding_processing", "Processing...")}</span>
          </div>
        )}
      </div>
    </div>
  );
};


// ─── Main Onboarding Component ───────────────────────────────────────────────
export const OnboardingDetails = ({
  isEditing = false,
  onCancel,
}: {
  isEditing?: boolean;
  onCancel?: () => void;
}) => {
  // Steps: 1=Personal, 2=Business, 3=Location, 4=Plan, 5=Welcome+Pay
  // Edit mode uses steps 1-3
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

  // Plan selection state
  const [selectedTier, setSelectedTier] = useState<TIER | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SELECTED_TIER_KEY);
      if (saved === "BASIC" || saved === "ESSENTIAL" || saved === "PRO") return saved;
    }
    return null;
  });

  // Activation hooks
  const { purchaseActivation, isPending: activationPending } = usePurchaseActivation();
  const { verifyActivation, isPending: verifyPending } = useVerifyActivation();

  // ─── KYC State ───────────────────────────────────────────────────────────────
  const [kycState, setKycState] = useState<KycState>({ status: "not_started" });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? theme : undefined;

  // Persist selected tier
  useEffect(() => {
    if (selectedTier) {
      localStorage.setItem(SELECTED_TIER_KEY, selectedTier);
    }
  }, [selectedTier]);

  // Validation field groups per step
  const stepFields: Record<number, (keyof z.infer<typeof submitProfileDetails>)[]> = {
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



  useEffect(() => {
    if (!isIndianNumber) {
      form.setValue("mobile", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [form, isIndianNumber, selectedCountry]);

  // ─── Restore KYC state from localStorage on mount ────────────────────────────
  useEffect(() => {
    if (isEditing) return;
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
          if (pollingRef.current) clearInterval(pollingRef.current);
          localStorage.removeItem(KYC_STORAGE_KEY);
          localStorage.removeItem(KYC_URL_STORAGE_KEY);

          const userDetails = response.data.userDetails;
          setKycState({
            status: "verified",
            verificationId: kycState.verificationId,
            userDetails,
          });

          trackMetaEvent({ eventName: "KYCCompleted", plan: "broker_onboarding_kyc_completed" });

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
          trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "kyc_failed" });
        }
      } catch (error) {
        console.error("Error polling KYC status:", error);
      }
    };

    poll();
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
      trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "kyc_failed" });
      toast.error(t("kyc_initiate_error"));
      logError({
        description: "Error initiating DigiLocker KYC",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
    }
  }, [t]);

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

  // ─── Submit profile + initiate activation payment ─────────────────────────
  const handleCompleteOnboarding = async () => {
    if (!user || !brokerData || !selectedTier) {
      console.log("Missing required data", user, brokerData, selectedTier);
      toast.error("Missing required data");
      return;
    }

    const data = form.getValues();

    try {
      setLoading(true);

      // 1. Submit profile details
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

      // 2. Initiate activation payment via Razorpay (one-time order)
      const activationResult = await purchaseActivation({ tier: selectedTier });
      const { orderId, amount, keyId } = activationResult.razorpay;

      // 3. Open Razorpay checkout in order mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount,
        currency: "INR",
        name: "Brokwise",
        description: `${selectedTier} Activation Pack`,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: user.email || "",
          contact: data.mobile,
        },
        theme: { color: "#3399cc" },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await verifyActivation({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!isPaymentTracked()) {
              trackMetaEvent({ eventName: "Purchase", plan: selectedTier });
              markPaymentTracked();
            }
            if (!isRegistrationTracked()) {
              trackMetaEvent({ eventName: "CompleteRegistration", plan: "broker_onboarding_completed" });
              markRegistrationTracked();
            }

            localStorage.removeItem(SELECTED_TIER_KEY);
            setBrokerData({
              ...brokerData,
              ...data,
              status: "approved",
            });
            toast.success("Activation successful! Welcome to Brokwise.");
          } catch {
            if (!isPaymentTracked()) {
              trackMetaEvent({ eventName: "Purchase", plan: selectedTier });
              markPaymentTracked();
            }
            if (!isRegistrationTracked()) {
              trackMetaEvent({ eventName: "CompleteRegistration", plan: "broker_onboarding_completed" });
              markRegistrationTracked();
            }

            localStorage.removeItem(SELECTED_TIER_KEY);
            setBrokerData({
              ...brokerData,
              ...data,
              status: "approved",
            });
            toast.info("Payment received. Verification in progress — you can start using the app.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Please complete the payment to start using the app.");
          },
        },
      });

      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "payment_failed" });
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "initiate_checkout_failed" });
      logError({
        description: "Error during onboarding completion",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Edit mode submission (profile update only) ─────────────────────────────
  const onSubmitProfileEdit = async (
    data: z.infer<typeof submitProfileDetails>
  ) => {
    if (!user || !brokerData) {
      toast.error("User or broker data not found");
      return;
    }

    try {
      setLoading(true);
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
    } catch (error) {
      logError({
        description: "Error updating profile details",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to update profile details. Please try again.");
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

  // 5 steps for new users, 3 steps for edit mode (personal, business, location)
  const totalSteps = isEditing ? 3 : 5;

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate current step fields
    const fields = stepFields[step];
    if (fields) {
      const isStepValid = await form.trigger(fields);
      if (!isStepValid) return;
    }

    // Save details at each step (1, 2, 3)
    if (step >= 1 && step <= 3 && brokerData?._id) {
      try {
        setLoading(true);
        const data = form.getValues();

        // Construct payload based on step
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any = { _id: brokerData._id };

        if (step === 1) {
          payload = {
            ...payload,
            firstName: data.firstName,
            lastName: data.lastName,
            mobile: data.mobile,
            profilePhoto: data.profilePhoto
          };
        } else if (step === 2) {
          payload = {
            ...payload,
            companyName: data.companyName,
            gstin: data.gstin,
            reraNumber: data.reraNumber,
            yearsOfExperience: data.yearsOfExperience
          };
        } else if (step === 3) {
          payload = {
            ...payload,
            city: data.city,
            officeAddress: data.officeAddress
          };
        }

        await updateProfileDetails(payload);

        // Update local context
        setBrokerData({
          ...brokerData,
          ...data,
        });

        if (step === 1) {
          trackMetaEvent({ eventName: "PhoneSubmitted", plan: "broker_onboarding_phone_submitted" });
        } else if (step === 3) {
          trackMetaEvent({ eventName: "LocationSubmitted", plan: "broker_onboarding_location_submitted" });
        }
      } catch (error) {
        console.error("Error saving step details:", error);
        if (step === 1) {
          trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "phone_submit_failed" });
        } else if (step === 3) {
          trackMetaEvent({ eventName: "OnboardingStepFailed", plan: "location_submit_failed" });
        }
        toast.error("Failed to save details. Please try again.");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    if (isEditing) {
      // Edit mode uses steps 1-3
      if (step === 3) {
        // Last edit step - submit (calls updateProfileDetails again with all data)
        onSubmitProfileEdit(form.getValues());
      } else {
        setDirection(1);
        setStep(step + 1);
      }
      return;
    }

    // New user flow: 1=Personal, 2=Business, 3=Location, 4=Plan, 5=Welcome+Pay
    if (step === 4) { // Plan Selection
      if (!selectedTier) {
        toast.error(t("onboarding_select_plan_error") || "Please select an activation plan");
        return;
      }
      trackMetaEvent({ eventName: "AddToCart", plan: selectedTier });
      setDirection(1);
      setStep(5);
    } else if (step === 5) {
      trackMetaEvent({ eventName: "InitiateCheckout", plan: selectedTier! });
      await handleCompleteOnboarding();
    } else {
      setDirection(1);
      setStep(step + 1);
    }
  };

  useEffect(() => {
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

  // For edit mode, map steps 1-3
  const displayStep = step;
  const watchedFirstName = form.watch("firstName");
  const watchedLastName = form.watch("lastName");
  const watchedMobile = form.watch("mobile");
  const shouldShowReverificationWarning =
    isEditing &&
    !!brokerData &&
    (watchedFirstName !== (brokerData.firstName || "") ||
      watchedLastName !== (brokerData.lastName || "") ||
      watchedMobile !== (brokerData.mobile || ""));
  const progress = (displayStep / totalSteps) * 100;

  const getStepTitle = () => {
    if (isEditing) return t("onboarding_update_profile");
    switch (step) {
      case 1:
        return (
          <>
            {(t("onboarding_setup_profile") || "Setup profile").split("profile")[0]}
            <span className="text-primary">profile</span>
          </>
        );
      case 2:
        return t("onboarding_business_step_title", "Business details");
      case 3:
        return t("onboarding_location_step_title", "Location");
      case 4:
        return (
          <>
            {t("onboarding_choose_your", "Choose your")}{" "}
            <span className="text-primary">{t("onboarding_plan_word", "plan")}</span>
          </>
        );
      case 5:
        return t("onboarding_welcome_step_title", "Welcome!");
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    if (isEditing) return t("onboarding_profile_details_desc");
    switch (step) {
      case 1:
        return t("onboarding_profile_details_desc", "Tell us a bit about yourself");
      case 2:
        return t("onboarding_business_step_desc", "Tell us about your business");
      case 3:
        return t("onboarding_location_step_desc", "Where are you based?");
      case 4:
        return t("onboarding_plan_step_desc", "Start with a 1-month activation pack to explore the platform");
      case 5:
        return t("onboarding_welcome_step_desc", "Review your plan and complete the setup");
      default:
        return "";
    }
  };

  const getNextButtonLabel = () => {
    if (isEditing) {
      if (step === 3) {
        return loading ? t("onboarding_updating", "Updating...") : t("onboarding_update_profile_btn", "Update Profile");
      }
      return t("onboarding_continue", "Continue");
    }
    switch (step) {
      case 5:
        return loading || activationPending || verifyPending
          ? (t("onboarding_processing", "Processing..."))
          : `${t("onboarding_proceed_to_pay", "Proceed to Pay")} ₹${selectedTier ? ACTIVATION_PLANS[selectedTier].displayAmount : ""}`;
      default:
        return t("onboarding_continue", "Continue");
    }
  };

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden md:overflow-y-auto transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Theme & Language Toggles */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] right-4 z-50">
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
            <DropdownMenuLabel>{t("onboarding_settings", "Settings")}</DropdownMenuLabel>
            <DropdownMenuSeparator />

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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() => { })}
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
                      {getStepTitle()}
                    </h1>
                    {!isEditing && (
                      <span className="hidden sm:block text-xs font-bold tracking-widest text-slate-400 uppercase">
                        {t("onboarding_step_of", { step: displayStep, total: totalSteps })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                    {getStepDescription()}
                  </p>
                </div>

                {/* Step Content */}
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
                      {/* ── Step 1: Personal Details (KYC optional) ─────── */}
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

                      {/* ── Step 2: Business Details ────────────────────── */}
                      {step === 2 && (
                        <Step2 form={form} />
                      )}

                      {/* ── Step 3: Location ────────────────────────────── */}
                      {step === 3 && (
                        <Step3 form={form} />
                      )}

                      {/* ── Step 4: Plan Selection ──────────────────────── */}
                      {!isEditing && step === 4 && (
                        <PlanSelectionStep
                          selectedTier={selectedTier}
                          onSelect={setSelectedTier}
                        />
                      )}

                      {/* ── Step 5: Welcome + Pay ──────────────────────── */}
                      {!isEditing && step === 5 && selectedTier && (
                        <WelcomeStep
                          selectedTier={selectedTier}
                          loading={loading || activationPending || verifyPending}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 md:p-12 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#0F172A] z-20">
              {shouldShowReverificationWarning && (
                <div className="mb-4">
                  <DisclaimerNotice text={DISCLAIMER_TEXT.profileReverification} />
                </div>
              )}
              <div className="flex items-center justify-between">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={handlePrev}
                    disabled={loading || activationPending}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("onboarding_back")}
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  onClick={handleNext}
                  type="button"
                  disabled={
                    loading ||
                    activationPending ||
                    verifyPending || !kycState.userDetails ||
                    (step === 4 && !selectedTier) ||
                    (step === 1 && !isIndianNumber && !isEditing)
                  }
                  className={cn(
                    "h-12 px-8 font-medium",
                    "bg-primary text-white hover:bg-[#1E293B]",
                    "dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200",
                    "transition-all duration-300",
                    step === 5
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white"
                      : "",
                    (loading || activationPending || verifyPending)
                      ? "opacity-80"
                      : "hover:shadow-lg hover:-translate-y-0.5"
                  )}
                >
                  {(loading || activationPending || verifyPending) ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {getNextButtonLabel()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {step === 5 && !isEditing && <CreditCard className="h-4 w-4" />}
                      {getNextButtonLabel()}
                      {((step < 5 && !isEditing) || (isEditing && step < 3)) && <ArrowRight className="h-4 w-4" />}
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
