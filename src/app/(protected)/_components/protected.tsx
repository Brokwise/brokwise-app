"use client";
import { firebaseAuth } from "@/config/firebase";
import { setCookie } from "@/utils/helper";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import pkg from "../../../../package.json";
import { Verification } from "@/app/(protected)/_components/verification";
import { OnboardingDetails } from "@/app/(protected)/_components/onboarding/onboardingDetails";
import { CompanyOnboardingDetails } from "@/app/(protected)/_components/onboarding/companyOnboardingDetails";
import { StatusDisplay } from "@/app/(protected)/_components/statusDisplay";
import { useApp } from "@/context/AppContext";
import { PushNotificationsService } from "@/app/services/pushNotifications";

import { logError } from "@/utils/errors";
import WaveBackground from "@/components/ui/waveBackground";
import { Loader2 } from "lucide-react";

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
                router.push("/login");
                break;
              }
            }
          }
        }

        if (!loading && !user) {
          setTimeout(() => {
            if (!firebaseAuth.currentUser) {
              router.push("/login");
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
  }, [user, loading, error, signOut, router]);

  // Route restriction for Company
  useEffect(() => {
    if (companyData && companyData.status === "approved") {
      const allowedPaths = [
        "/message",
        "/company-brokers",
        "/company-dashboard",
        "/profile",
        "/company-properties",
        "/company-enquiries",
        "/enquiries/create",
        "/property",
        "/company-brokers/",
      ];
      const isAllowed = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );

      if (!isAllowed) {
        router.replace("/company-dashboard");
      }
    }
  }, [companyData, pathname, router]);

  if (loading || !user || brokerDataLoading || companyDataLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user.emailVerified) {
    return <Verification />;
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
          <StatusDisplay
            data={companyData}
            type="company"
            onEdit={() => setIsEditing(true)}
          />
        );
      case "blacklisted":
        return <StatusDisplay data={companyData} type="company" />;
      case "approved":
        // For approved users, show the main app
        // The useEffect above handles redirection if they are on wrong page.
        // But we must render children so the router can actually switch to /brokers
        // However, if we are on /properties (default /), we show children which is Properties page.
        // We want to avoid flash of content.
        // But since useEffect runs after render, there might be a flash.
        // We can return null if path is not allowed.
        const allowedPaths = [
          "/company-brokers",
          "/profile",
          "/company-properties",
          "/company-enquiries",
          "/company-dashboard",
          "/property",
          "/enquiries/create",
          "/message",
        ];
        const isAllowed = allowedPaths.some(
          (path) => pathname === path || pathname.startsWith(`${path}/`)
        );
        if (!isAllowed) return null; // Or a loader

        return children;
      default:
        return <StatusDisplay />;
    }
  }

  // Check broker status and render appropriate component
  if (brokerData) {
    if (isEditing) {
      return (
        <WaveBackground>
          <OnboardingDetails
            isEditing={true}
            onCancel={() => setIsEditing(false)}
          />
        </WaveBackground>
      );
    }
    switch (brokerData.status) {
      case "incomplete":
        return (
          <WaveBackground>
            <OnboardingDetails />
          </WaveBackground>
        );
      case "pending":
        return <StatusDisplay onEdit={() => setIsEditing(true)} />;
      case "blacklisted":
        return <StatusDisplay />;
      case "approved":
        // For approved users, show the main app
        break; // falls through to children at end of function, but wait, if companyData was null and we are here
      default:
        return <StatusDisplay />;
    }
    // If broker is approved, we break from switch and go to return children
    // But we need to make sure we don't return children if we returned above.
    // The switch returns for other statuses. For approved it breaks.
  }

  // If we have brokerData approved, we fall through.
  if (brokerData?.status === "approved") return children;

  // If no data found, check userType from Firestore
  if (userData?.userType === "company") {
    return (
      <WaveBackground>
        <CompanyOnboardingDetails />
      </WaveBackground>
    );
  }

  // Default fallback to Broker Onboarding if no profile and not identified as company
  if (!brokerData && !companyData) {
    return (
      <WaveBackground>
        <OnboardingDetails />
      </WaveBackground>
    );
  }

  return children;
};
