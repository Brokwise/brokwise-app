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
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { logError } from "@/utils/errors";

const GoogleOauthPage = () => {
  const defaultMessage = "Authenticating with google";
  const [message, setMessage] = useState(defaultMessage);
  const router = useRouter();
  const redirectUser = useCallback(
    ({
      isError,
      target,
      delay,
    }: {
      isError: boolean;
      target: string;
      delay: number;
    }) => {
      setMessage(isError ? "Something went wrong" : target);
      setTimeout(() => {
        router.push(target);
      }, delay);
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
        logError({
          error: error as Error,
          slackChannel: "frontend-errors",
          description: "Failed to verify google user",
        });
        toast.error("Failed to verify google user");
      }
    },
    [createUserInDb, sendVerificationLink]
  );

  const login = useCallback(async () => {
    try {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const stateParam = params.get("state");

      let accountType: "broker" | "company" | undefined = "broker";

      if (stateParam) {
        try {
          const state = JSON.parse(decodeURIComponent(stateParam));
          accountType = state.accountType;
        } catch {
          // fallback to raw string check if legacy or simple string
          if (stateParam === "true" || stateParam === "false") {
            // legacy behavior, assume broker
            accountType = "broker";
          }
        }
      }

      if (!accessToken) {
        setMessage("Invalid Crendentials! Please try again.");
        redirectUser({
          isError: true,
          target: "/sign-up",
          delay: 3000,
        });
        return;
      }
      await verifyGoogleUser(accessToken, accountType);

      // Clear forgot password rate limit state on successful login
      localStorage.removeItem("brokwise_password_reset_attempts");

      setTimeout(() => {
        redirectUser({
          isError: false,
          target: "/",
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
  }, [redirectUser, verifyGoogleUser]);

  useEffect(() => {
    login();
  }, [login]);
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
