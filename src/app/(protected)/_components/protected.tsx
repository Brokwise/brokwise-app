"use client";
import { firebaseAuth } from "@/config/firebase";
import { setCookie } from "@/utils/helper";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import pkg from "../../../../package.json";
import { Verification } from "@/app/(protected)/_components/verification";
import { OnboardingDetails } from "@/app/(protected)/_components/onboarding/onboardingDetails";
import { CompanyOnboardingDetails } from "@/app/(protected)/_components/onboarding/companyOnboardingDetails";
import { StatusDisplay } from "@/app/(protected)/_components/statusDisplay";
import { useApp } from "@/context/AppContext";
import { PushNotificationsService } from "@/app/services/pushNotifications";
import { ChatbotWidget } from "@/components/chatbot";

import { logError } from "@/utils/errors";
import WaveBackground from "@/components/ui/waveBackground";
import { Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import Image from "next/image";
import { SafeAreaWrapper } from "@/components/ui/safe-area";
import { ActivationPendingGate } from "./activationPendingGate";
import { LegalConsentGate } from "./legalConsentGate";
import { hasRequiredLegalConsents } from "@/constants/legal";
import { getSessionId } from "@/lib/session";
import {
  extractApiErrorCode,
  forceLogoutDueToSession,
  isSessionErrorCode,
} from "@/lib/authSession";
import { getCurrentSession } from "@/models/api/session";

const AUTH_TIMEOUT_MS = 10000;
const SESSION_HEARTBEAT_INTERVAL_MS = 45000;
const SESSION_NOT_ACTIVE_GRACE_MS = 10000;
const SESSION_NOT_ACTIVE_RETRIES = 2;



export const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const [user, loading, error] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);
  const router = useRouter();
  const pathname = usePathname();
  const {
    brokerData,
    brokerDataLoading,
    companyData,
    companyDataLoading,
    userData,
  } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionHeartbeatInFlightRef = useRef(false);
  const sessionGraceUntilRef = useRef(0);
  const networkHeartbeatFailureCountRef = useRef(0);

  const getLoginUrlWithTarget = useCallback(() => {
    if (typeof window === "undefined") return "/login";
    const target = `${window.location.pathname}${window.location.search}`;
    return `/login?target=${encodeURIComponent(target)}`;
  }, []);

  const runSessionHeartbeat = useCallback(async () => {
    if (!firebaseAuth.currentUser) return;

    const sessionId = getSessionId();
    if (!sessionId) {
      await forceLogoutDueToSession({
        router,
        message: "Session expired. Please log in again.",
      });
      return;
    }

    if (sessionHeartbeatInFlightRef.current) return;
    sessionHeartbeatInFlightRef.current = true;

    try {
      for (let attempt = 0; attempt <= SESSION_NOT_ACTIVE_RETRIES; attempt++) {
        try {
          await getCurrentSession();
          networkHeartbeatFailureCountRef.current = 0;
          return;
        } catch (err) {
          const code = extractApiErrorCode(err);

          const canRetryForPropagationLag =
            code === "SESSION_NOT_ACTIVE" &&
            Date.now() <= sessionGraceUntilRef.current &&
            attempt < SESSION_NOT_ACTIVE_RETRIES;

          if (canRetryForPropagationLag) {
            const delay = 400 * (attempt + 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          if (isSessionErrorCode(code)) {
            await forceLogoutDueToSession({ router });
            return;
          }

          networkHeartbeatFailureCountRef.current += 1;
          if (networkHeartbeatFailureCountRef.current >= 3) {
            console.warn(
              "Session heartbeat failing repeatedly due to non-session errors"
            );
          }
          return;
        }
      }
    } catch {
      networkHeartbeatFailureCountRef.current += 1;
    } finally {
      sessionHeartbeatInFlightRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    if (!user?.uid) return;
    sessionGraceUntilRef.current = Date.now() + SESSION_NOT_ACTIVE_GRACE_MS;
  }, [user?.uid]);

  useEffect(() => {
    if (loading || !user) return;

    if (getSessionId()) return;

    void forceLogoutDueToSession({
      router,
      message: "Please log in again to continue.",
    });
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user?.uid) return;

    void runSessionHeartbeat();

    const interval = setInterval(() => {
      void runSessionHeartbeat();
    }, SESSION_HEARTBEAT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runSessionHeartbeat();
      }
    };

    const onFocus = () => {
      void runSessionHeartbeat();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [loading, user?.uid, runSessionHeartbeat]);


  useEffect(() => {
    if (loading || brokerDataLoading || companyDataLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn("Auth/data loading timed out, redirecting to login");
        setAuthTimedOut(true);
        router.push(getLoginUrlWithTarget());
      }, AUTH_TIMEOUT_MS);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, brokerDataLoading, companyDataLoading, router, getLoginUrlWithTarget]);

  useEffect(() => {
    if (!user?.uid) return;

    PushNotificationsService.initalize(user.uid);

    return () => {
      PushNotificationsService.removeAllListeners();
    };
  }, [user?.uid]);

  useEffect(() => {
    (async () => {
      try {
        const localVersion = localStorage.getItem("version");

        if (user) {
          setCookie(
            "auth_session",
            {
              email: user.email,
              userId: user.uid,
              refreshToken: user.refreshToken,
            },
            100
          );
        }

        if (localVersion !== pkg.version) {
          localStorage.setItem("version", pkg.version);

          if (user && localVersion) {
            switch (localVersion) {
              case "0.1.0":
              case "0.1.1":
              case "0.1.2":
              case "0.1.3":
              case "0.1.4":
              case "0.1.5":
              case "0.1.6":
                break;
              default: {
                await signOut();
                localStorage.clear();
                sessionStorage.clear();
                router.push(getLoginUrlWithTarget());
                break;
              }
            }
          }
        }

        if (!loading && !user) {
          setTimeout(() => {
            if (!firebaseAuth.currentUser) {
              router.push(getLoginUrlWithTarget());
            }
          }, 100);
        }
      } catch (err) {
        logError({
          error: err as Error,
          description: "Error in ProtectedPage useEffect",
          slackChannel: "frontend-errors",
        });
      }
    })();
  }, [user, loading, error, signOut, router, getLoginUrlWithTarget]);

  useEffect(() => {
    if (companyData && companyData.status === "approved") {
      const allowedPaths = [
        "/message",
        "/company-brokers",
        "/company-dashboard",
        "/profile",
        "/company-properties",
        "/company-enquiries",
        "/company-enquiries/marketplace",
        "/company-marketplace",
        "/enquiries/create",
        "/enquiries",
        "/property",
        "/company-brokers/",
        "/company-marketplace/",
        "/bookmarks",
        "/",
      ];
      const isAllowed = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );

      if (!isAllowed || pathname === "/") {
        router.replace("/company-dashboard");
      }
    }
  }, [companyData, pathname, router]);

  // If auth timed out, don't show loading - the redirect is happening
  if (authTimedOut) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin h-10 w-10" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  if (loading || !user || brokerDataLoading || companyDataLoading) {
    const loadingStates = [];
    if (loading) loadingStates.push("auth");
    if (!user && !loading) loadingStates.push("no-user");
    if (brokerDataLoading) loadingStates.push("broker");
    if (companyDataLoading) loadingStates.push("company");

    return (
      <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
        <div className="relative flex items-center justify-center">
          <Loader size="5rem" className="absolute" />
          <Image
            src={"/logo.webp"}
            height={52}
            width={52}
            alt="Brokwise"
            className="rounded-full z-10"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user.emailVerified) {
    return (
      <SafeAreaWrapper>
        <Verification />
      </SafeAreaWrapper>
    );
  }

  // Check company status
  if (companyData) {
    if (isEditing) {
      return (
        <WaveBackground>
          <CompanyOnboardingDetails
            isEditing={true}
            onCancel={() => setIsEditing(false)}
          />
        </WaveBackground>
      );
    }
    switch (companyData.status) {
      case "incomplete":
        return (
          <WaveBackground>
            <CompanyOnboardingDetails />
          </WaveBackground>
        );
      case "pending":
        return (
          <SafeAreaWrapper>
            <StatusDisplay
              data={companyData}
              type="company"
              onEdit={() => setIsEditing(true)}
            />
          </SafeAreaWrapper>
        );
      case "blacklisted":
        return (
          <SafeAreaWrapper>
            <StatusDisplay data={companyData} type="company" />
          </SafeAreaWrapper>
        );
      case "approved":
        const allowedPaths = [
          "/company-brokers",
          "/profile",
          "/company-properties",
          "/company-enquiries",
          "/company-dashboard",
          "/company-marketplace",
          "/property",
          "/enquiries/create",
          "/enquiries/create/success",
          "/enquiries",
          "/bookmarks",
          "/message",
        ];
        const isAllowed = allowedPaths.some(
          (path) => pathname === path || pathname.startsWith(`${path}/`)
        );
        if (!isAllowed) return null;

        return children;
      default:
        return (
          <SafeAreaWrapper>
            <StatusDisplay />
          </SafeAreaWrapper>
        );
    }
  }

  // Check broker status and render appropriate component
  if (brokerData) {
    const shouldGateForLegalConsent =
      brokerData.status === "approved" ||
      brokerData.status === "pending" ||
      brokerData.status === "incomplete";

    if (
      shouldGateForLegalConsent &&
      !hasRequiredLegalConsents(brokerData.legalConsents)
    ) {
      return <LegalConsentGate />;
    }

    if (isEditing) {
      return (
        <WaveBackground>
          <OnboardingDetails
            isEditing={true}
            onCancel={() => setIsEditing(false)}
          />
          <ChatbotWidget isOnboarding={true} />
        </WaveBackground>
      );
    }
    switch (brokerData.status) {
      case "incomplete":
        return (
          <WaveBackground>
            <OnboardingDetails />
            <ChatbotWidget isOnboarding={true} />
          </WaveBackground>
        );
      case "pending":
        // Direct approval: treat pending as approved (no admin review needed)
        break;
      case "rejected":
        return (
          <SafeAreaWrapper>
            <StatusDisplay onEdit={() => setIsEditing(true)} />
          </SafeAreaWrapper>
        );
      case "blacklisted":
        return (
          <SafeAreaWrapper>
            <StatusDisplay />
          </SafeAreaWrapper>
        );
      case "approved":
        break;
      default:
        return (
          <SafeAreaWrapper>
            <StatusDisplay />
          </SafeAreaWrapper>
        );
    }

  }

  // Direct approval: both "approved" and "pending" statuses proceed,
  // but first check if activation payment is still pending.
  if (brokerData?.status === "approved" || brokerData?.status === "pending") {
    return <ActivationPendingGate>{children}</ActivationPendingGate>;
  }

  if (userData?.userType === "company") {
    return (
      <WaveBackground>
        <CompanyOnboardingDetails />
        <ChatbotWidget isOnboarding={true} />
      </WaveBackground>
    );
  }

  if (!brokerData && !companyData) {
    return (
      <>
        <OnboardingDetails />
        <ChatbotWidget isOnboarding={true} />
      </>

    );
  }

  return children;
};
