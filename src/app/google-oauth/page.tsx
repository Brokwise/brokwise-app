"use client";

import { Loader } from "@/components/ui/loader";
import { firebaseAuth, getUserDoc, setUserDoc } from "@/config/firebase";
import { createUser } from "@/models/api/user";
import {
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithCredential,
  User,
} from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { Capacitor } from "@capacitor/core";

const GoogleOauthPage = () => {
  const defaultMessage = "Authenticating with google";
  const [message, setMessage] = useState(defaultMessage);
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasAttemptedLoginRef = React.useRef(false);
  const sanitizeTarget = useCallback((target: string | null | undefined) => {
    if (!target || typeof target !== "string") return "/";
    if (!target.startsWith("/") || target.startsWith("//")) return "/";
    return target;
  }, []);
  const redirectUser = useCallback(
    ({
      isDesktopApp,
      isError,
      target,
      delay,
      url,
    }: {
      isError?: boolean;
      isDesktopApp: boolean;
      target: string;
      delay?: number;
      url?: string;
    }) => {
      setTimeout(() => {
        if (url) {
          window.location.assign(url);
          return;
        }
        const encodedTarget = encodeURIComponent(target ?? "");
        if (isError) {
          if (isDesktopApp) {
            window.location.href = "brokwise://";
            return;
          }
          router.push(`/login?target=${encodedTarget}`);
          return;
        }
        router.push(target || "/");
      }, delay ?? 0);
    },
    [router]
  );
  const createUserInDb = useCallback(
    async (user: User, accountType?: "broker" | "company") => {
      try {
        const userDocRef = getUserDoc(user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return;
        }

        if (accountType !== "company") {
          await createUser({
            email: user.email ?? "",
            uid: user.uid ?? "",
          });
        }

        await setUserDoc(userDocRef, {
          uid: user.uid ?? "",
          firstName: user.displayName ?? "",
          lastName: "",
          email: user.email ?? "",
          userType: accountType ?? "broker",
        });

        if (accountType === "company") {
          localStorage.setItem("userType", "company");
        }
      } catch (error) {
        console.log(error);
        logError({
          error: error as Error,
          slackChannel: "frontend-errors",
          description: "Failed to create user in db",
        });
        toast.error("Failed to create user in db");
      }
    },
    []
  );

  const sendVerificationLink = useCallback(async (user: User) => {
    try {
      if (user?.emailVerified) {
        return;
      }
      const actionCodeSettings = {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      toast.success(
        "Verification email sent! Check your inbox and spam folder."
      );
    } catch (error) {
      console.error("Email verification error:", error);
      const firebaseError = error as Error & { code?: string };
      logError({
        error: error as Error,
        slackChannel: "frontend-errors",
        description: `Failed to send verification link to ${user.email}. Error code: ${firebaseError.code}, Message: ${firebaseError.message}`,
      });
      if (firebaseError.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    }
  }, []);

  const verifyGoogleUser = useCallback(
    async (accessToken: string, accountType?: "broker" | "company") => {
      try {
        const credential = GoogleAuthProvider.credential(null, accessToken);
        const { user } = await signInWithCredential(firebaseAuth, credential);
        await createUserInDb(user, accountType);
        await sendVerificationLink(user);
      } catch (error) {
        const firebaseError = error as Error & { code?: string };
        logError({
          error: error as Error,
          slackChannel: "frontend-errors",
          description: `Failed to verify google user. Code: ${firebaseError.code}, Message: ${firebaseError.message}`,
        });

        // Handle specific Firebase errors
        if (
          firebaseError.code === "auth/account-exists-with-different-credential"
        ) {
          toast.error(
            "An account already exists with this email. Please sign in with email/password instead."
          );
        } else if (firebaseError.code === "auth/invalid-credential") {
          toast.error("Invalid credentials. Please try again.");
        } else {
          toast.error("Failed to verify Google user. Please try again.");
        }
        throw error; // Re-throw to be caught by the caller
      }
    },
    [createUserInDb, sendVerificationLink]
  );

  const login = useCallback(async () => {
    try {
      const params = new URLSearchParams(
        typeof window !== "undefined"
          ? window.location.search.slice(1)
          : searchParams.toString()
      );

      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        hashParams.forEach((value, key) => {
          if (!params.has(key)) {
            params.append(key, value);
          }
        });
      }
      const accessToken = params.get("access_token");
      const stateParam = params.get("state");
      let isDesktopRequested = false;
      let target = "/";
      const isNativePlatform =
        typeof window !== "undefined" && Capacitor.isNativePlatform();
      let accountType: "broker" | "company" | undefined = "broker";

      if (stateParam) {
        const decodedState = decodeURIComponent(stateParam);
        if (decodedState.includes("---")) {
          const [desktopFlag, ...targetParts] = decodedState.split("---");
          isDesktopRequested = desktopFlag === "true";
          target = sanitizeTarget(targetParts.join("---"));
        } else {
          try {
            const state = JSON.parse(decodedState);
            if (state && typeof state === "object") {
              if (typeof state.accountType === "string") {
                if (state.accountType === "broker" || state.accountType === "company") {
                  accountType = state.accountType;
                }
              }
              if (typeof state.target === "string") {
                target = sanitizeTarget(state.target);
              }
              if (typeof state.isDesktopApp === "boolean") {
                isDesktopRequested = state.isDesktopApp;
              } else if (typeof state.desktop === "boolean") {
                isDesktopRequested = state.desktop;
              }
            }
          } catch {
            if (decodedState === "true" || decodedState === "false") {
              isDesktopRequested = decodedState === "true";
            }
          }
        }
      }
      const shouldOpenNativeApp = isDesktopRequested && !isNativePlatform;

      if (!accessToken) {
        setMessage("Invalid Credentials! Please try again.");
        redirectUser({
          isDesktopApp: shouldOpenNativeApp,
          isError: true,
          delay: 3000,
          target: "/sign-up",
        });
        return;
      }

      // If we initiated login from a non-native context (e.g., browser/Safari tab),
      // bounce back into the native app. Once inside the native app (Capacitor),
      // proceed with verification without re-triggering the deep link.
      if (shouldOpenNativeApp) {
        window.location.href = `brokwise://google-oauth?access_token=${accessToken}`;
        return;
      }

      await verifyGoogleUser(accessToken, accountType);

      // Clear forgot password rate limit state on successful login
      localStorage.removeItem("brokwise_password_reset_attempts");

      setTimeout(() => {
        redirectUser({
          isDesktopApp: shouldOpenNativeApp,
          isError: false,
          target,
          delay: 0,
        });
      }, 200);
    } catch (error) {
      logError({
        error: error as Error,
        slackChannel: "frontend-errors",
        description: "Failed to verify google user",
      });
      setMessage("Something went wrong");
    }
  }, [redirectUser, verifyGoogleUser, searchParams, sanitizeTarget]);

  useEffect(() => {
    if (hasAttemptedLoginRef.current) return;
    hasAttemptedLoginRef.current = true;
    login();
  }, [login, searchParams]);
  return (
    <main className="flex flex-col items-center justify-center w-svw h-dvh p-4xl bg-surface-1 enable-drag">
      <div className="flex items-center justify-center w-full mb-6xl gap-sm">
        {/* <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
          <Image src="/logo.png" alt="Brokwise" width={20} height={20} />
        </div> */}
        <h1 className="text-4xl font-semibold mx-3.5">Brokwise</h1>
      </div>
      <h1 className="flex flex-col md:flex-row items-center justify-center text-xl md:text-3xl gap-sm ">
        {message}
        {message === "Authenticating with google" && (
          <Loader
            type="dot"
            size={"1.5rem"}
            className="[&_>_div]:bg-slate-600 mt-lg"
          />
        )}
      </h1>
    </main>
  );
};

export default GoogleOauthPage;
