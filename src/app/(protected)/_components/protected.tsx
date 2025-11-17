"use client";
import { firebaseAuth } from "@/config/firebase";
import { setCookie } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import pkg from "../../../../package.json";
import { Verification } from "@/app/(protected)/_components/verification";
import { OnboardingDetails } from "@/app/(protected)/_components/onboarding/onboardingDetails";
import { StatusDisplay } from "@/app/(protected)/_components/statusDisplay";
import { useApp } from "@/context/AppContext";

import { logError } from "@/utils/errors";

export const ProtectedPage = ({ children }: { children: React.ReactNode }) => {
  const [user, loading, error] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);
  const router = useRouter();
  const { brokerData, brokerDataLoading } = useApp();
  console.log("brokerData", brokerData);
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

  if (loading || !user || brokerDataLoading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user.emailVerified) {
    return <Verification />;
  }

  // Check broker status and render appropriate component
  if (brokerData) {
    switch (brokerData.status) {
      case "incomplete":
        return <OnboardingDetails />;
      case "pending":
      case "blacklisted":
        return <StatusDisplay />;
      case "approved":
        // For approved users, show the main app
        break;
      default:
        return <StatusDisplay />;
    }
  }

  return children;
};
