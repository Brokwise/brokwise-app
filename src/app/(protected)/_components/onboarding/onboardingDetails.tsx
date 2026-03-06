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
  CreditCard,
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
import { Step4Plan } from "./steps/step4Plan";
import { Step4IosCompletion } from "./steps/step4IosCompletion";
import { Step5Welcome } from "./steps/step5Welcome";
import { KycState } from "@/models/types/kyc";
import {
  initiateDigiLockerVerification,
  getDigiLockerStatus,
} from "@/models/api/kyc";
import { TIER } from "@/models/types/subscription";
import {
  ACTIVATION_PLANS,
} from "@/config/tier_limits";
import { usePurchaseActivation, useVerifyActivation } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { DisclaimerNotice } from "@/components/ui/disclaimer-notice";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";
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
  const isIOSNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

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

  // Reload page when user tabs back in (e.g. after completing DigiLocker KYC)
  useEffect(() => {
    if (isEditing || step !== 1) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    let appStateListener: { remove: () => void } | undefined;
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/app").then(({ App }) => {
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) window.location.reload();
        }).then((listener) => {
          appStateListener = listener;
        });
      });
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      appStateListener?.remove();
    };
  }, [isEditing, step]);

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

  // ─── Hydrate KYC state from server-side brokerData on load ───────────────────
  useEffect(() => {
    if (isEditing) return;
    const kyc = brokerData?.kycVerification;
    if (!kyc) return;

    setKycState((prev) => {
      // Never override an active in-progress or verified state
      if (prev.status === "pending" || prev.status === "verified") return prev;

      if (kyc.cashfreeStatus === "AUTHENTICATED" && kyc.userDetails) {
        return { status: "verified", userDetails: kyc.userDetails };
      }
      if (kyc.cashfreeStatus === "FAILURE" || kyc.duplicateReason) {
        return {
          status: "failed",
          duplicateReason: kyc.duplicateReason,
          userDetails: kyc.userDetails,
        };
      }
      if (kyc.cashfreeStatus === "EXPIRED") {
        return { status: "expired" };
      }
      if (kyc.cashfreeStatus === "CONSENT_DENIED") {
        return { status: "failed" };
      }
      // PENDING without a localStorage key — restore from API data
      if (kyc.cashfreeStatus === "PENDING" && !localStorage.getItem(KYC_STORAGE_KEY)) {
        return {
          status: "pending",
          verificationId: kyc.verificationId,
          digiLockerUrl: kyc.digiLockerUrl,
        };
      }
      return prev;
    });

    // Pre-fill form fields from KYC user details when available
    const userDetails = kyc.userDetails;
    if (userDetails && (kyc.cashfreeStatus === "AUTHENTICATED" || kyc.cashfreeStatus === "FAILURE")) {
      const nameParts = userDetails.name.trim().split(/\s+/);
      const lastName = nameParts.length > 1 ? nameParts.pop()! : "";
      const firstName = nameParts.join(" ");
      if (!form.getValues("firstName")) {
        form.setValue("firstName", firstName, { shouldValidate: true, shouldDirty: true });
      }
      if (!form.getValues("lastName")) {
        form.setValue("lastName", lastName, { shouldValidate: true, shouldDirty: true });
      }
      const mobile = (userDetails.mobile || "").replace(/\D/g, "").slice(-10);
      if (mobile.length === 10 && !form.getValues("mobile")) {
        form.setValue("mobile", mobile, { shouldValidate: true, shouldDirty: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokerData, isEditing]);

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

          let firstName = "";
          let lastName = "";
          let mobile = "";

          if (userDetails) {
            const nameParts = userDetails.name.trim().split(/\s+/);
            lastName = nameParts.length > 1 ? nameParts.pop()! : "";
            firstName = nameParts.join(" ");

            form.setValue("firstName", firstName, {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("lastName", lastName, {
              shouldValidate: true,
              shouldDirty: true,
            });

            mobile = (userDetails.mobile || "").replace(/\D/g, "").slice(-10);
            if (mobile.length === 10) {
              form.setValue("mobile", mobile, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }

          trackMetaEvent({
            eventName: "KYCCompleted",
            plan: "broker_onboarding_kyc_completed",
            firstName,
            lastName,
            phoneNumber: mobile
          });

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
          trackMetaEvent({ eventName: "OnboardingStepFailed", step: "kyc_failed" });
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
      trackMetaEvent({ eventName: "OnboardingStepFailed", step: "kyc_failed" });
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
              trackMetaEvent({
                eventName: "Purchase",
                plan: selectedTier,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.mobile,
                email: user.email || ""
              });
              markPaymentTracked();
            }
            if (!isRegistrationTracked()) {
              trackMetaEvent({
                eventName: "CompleteRegistration",
                plan: "broker_onboarding_completed",
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.mobile,
                email: user.email || ""
              });
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
              trackMetaEvent({
                eventName: "Purchase",
                plan: selectedTier,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.mobile,
                email: user.email || ""
              });
              markPaymentTracked();
            }
            if (!isRegistrationTracked()) {
              trackMetaEvent({
                eventName: "CompleteRegistration",
                plan: "broker_onboarding_completed",
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.mobile,
                email: user.email || ""
              });
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
        trackMetaEvent({ eventName: "OnboardingStepFailed", step: "payment_failed", reason: response.error.description });
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      trackMetaEvent({ eventName: "OnboardingStepFailed", step: "initiate_checkout_failed", reason: (error as Error).message });
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
  const totalSteps = isEditing ? 3 : isIOSNative ? 4 : 5;

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
          trackMetaEvent({ eventName: "PhoneSubmitted", phoneNumber: data.mobile || "" });
        } else if (step === 3) {
          trackMetaEvent({ eventName: "LocationSubmitted", city: data.city });
        }
      } catch (error) {
        console.error("Error saving step details:", error);
        if (step === 1) {
          trackMetaEvent({ eventName: "OnboardingStepFailed", step: "phone_submit_failed", reason: (error as Error).message });
        } else if (step === 3) {
          trackMetaEvent({ eventName: "OnboardingStepFailed", step: "location_submit_failed", reason: (error as Error).message });
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

    // iOS: skip plan selection and payment (Apple guidelines)
    if (isIOSNative) {
      if (step === 4) {
        if (!user || !brokerData) {
          toast.error("Missing required data");
          return;
        }
        try {
          setLoading(true);
          const data = form.getValues();
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
          setBrokerData({ ...brokerData, ...data });
          toast.success(t("onboarding_profile_saved_toast", "Profile saved successfully!"));
        } catch (error) {
          logError({
            description: "Error during iOS onboarding completion",
            error: error as Error,
            slackChannel: "frontend-errors",
          });
          toast.error("Failed to save profile. Please try again.");
        } finally {
          setLoading(false);
        }
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
      const data = form.getValues();
      trackMetaEvent({
        eventName: "AddToCart",
        plan: selectedTier,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.mobile,
        city: data.city
      });
      setDirection(1);
      setStep(5);
    } else if (step === 5) {
      const data = form.getValues();
      trackMetaEvent({
        eventName: "InitiateCheckout",
        plan: selectedTier!,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.mobile,
        city: data.city
      });
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
        if (isIOSNative) return t("onboarding_almost_done", "Almost done!");
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
        if (isIOSNative) return t("onboarding_ios_step4_desc", "Your profile has been set up successfully");
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
    if (isIOSNative && step === 4) {
      return loading ? t("onboarding_saving", "Saving...") : t("onboarding_done", "Done");
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
      {!isIOSNative && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}

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

                      {/* ── Step 4: iOS Completion ─────────────────────── */}
                      {!isEditing && isIOSNative && step === 4 && (
                        <Step4IosCompletion />
                      )}

                      {/* ── Step 4: Plan Selection (non-iOS) ──────────── */}
                      {!isEditing && !isIOSNative && step === 4 && (
                        <Step4Plan
                          selectedTier={selectedTier}
                          onSelect={setSelectedTier}
                        />
                      )}

                      {/* ── Step 5: Welcome + Pay (non-iOS) ──────────── */}
                      {!isEditing && !isIOSNative && step === 5 && selectedTier && (
                        <Step5Welcome
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
                    verifyPending || !kycState.userDetails || kycState.duplicateReason !== undefined ||
                    (!isIOSNative && step === 4 && !selectedTier) ||
                    (step === 1 && !isEditing && (!isIndianNumber || kycState.status !== "verified"))
                  }
                  className={cn(
                    "h-12 px-8 font-medium",
                    "bg-primary text-white hover:bg-[#1E293B]",
                    "dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200",
                    "transition-all duration-300",
                    !isEditing && step === totalSteps
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
                      {step === 5 && !isEditing && !isIOSNative && <CreditCard className="h-4 w-4" />}
                      {getNextButtonLabel()}
                      {((step < totalSteps && !isEditing) || (isEditing && step < 3)) && <ArrowRight className="h-4 w-4" />}
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
