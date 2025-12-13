"use client";

import { sendEmailVerification } from "firebase/auth";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth, getUserDoc, setUserDoc } from "@/config/firebase";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { LogOutIcon } from "lucide-react";
import { logError } from "@/utils/errors";
import { createUser } from "@/models/api/user";
import { getDoc } from "firebase/firestore";
// import ilumierLogoDark from "@/assets/logo/ilumierDark.png";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export const Verification = () => {
  const [user] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);
  const router = useRouter();
  const [timer, setTimer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUserData } = useApp();
  useEffect(() => {
    const onFocus = async () => {
      await user?.reload();
      if (user?.emailVerified) {
        try {
          const userDocRef = getUserDoc(user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const pendingName = localStorage.getItem(
              `pendingUserName_${user.uid}`
            );
            const fullName = user.displayName ?? pendingName ?? "";
            await createUser({
              email: user.email ?? "",
              uid: user.uid ?? "",
            });

            await setUserDoc(userDocRef, {
              email: user.email ?? "",
              uid: user.uid ?? "",
              firstName: fullName,
              lastName: "",
            });

            localStorage.removeItem(`pendingUserName_${user.uid}`);

            console.log("User account created successfully after verification");
          }
        } catch (error) {
          console.error(
            "Failed to create user account after verification:",
            error
          );
          logError({
            error: error as Error,
            description: `Failed to create user account after email verification for ${user.email}`,
            slackChannel: "frontend-errors",
          });
          toast.error(
            "Failed to complete account setup. Please contact support."
          );
          return; // Don't reload if account creation failed
        }
      }

      window.location.reload();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (timer === null) {
      const timestamp = localStorage.getItem("lastVerification");
      if (timestamp) {
        const timeElapsed = Math.floor((Date.now() - +timestamp) / 1000);
        setTimer(Math.max(60 - timeElapsed, 0));
      } else {
        setTimer(0);
      }
    } else if (timer > 0) {
      timeoutId = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timer]);

  const handleSendVerificationLink = async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const actionCodeSettings = {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      toast.success(
        "Verification email sent! Please check your inbox and spam folder."
      );
      setTimer(60);
      localStorage.setItem("lastVerification", Date.now().toString());
    } catch (err) {
      const error = err as FirebaseError;
      console.error("Email verification error:", error);
      logError({
        error: error as Error,
        description: `Failed to send verification email to ${user.email}. Error code: ${error.code}`,
        slackChannel: "frontend-errors",
      });
      switch (error.code) {
        case "auth/too-many-requests":
          toast.error(
            "Too many requests. Please wait a few minutes before trying again."
          );
          break;
        case "auth/invalid-continue-uri":
        case "auth/unauthorized-continue-uri":
          toast.error(
            "Configuration error. Please contact support@brokwise.com"
          );
          break;
        case "auth/missing-email":
          toast.error(
            "Email address is missing. Please sign out and try again."
          );
          break;
        case "auth/user-disabled":
          toast.error(
            "This account has been disabled. Please contact support."
          );
          break;
        default:
          toast.error(
            "Failed to send verification email. Please check your connection and try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setUserData(null);
      await signOut();
    } catch (err) {
      logError({
        error: err as Error,
        description: "Failed to logout",
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with Logo */}
      <header className="w-full px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer w-fit"
          >
            <div className="flex items-center h-[30px] w-[50px] sm:h-[60px] sm:w-[100px] lg:h-[65px] lg:w-[120px] relative">
              {/* <Image
                src={ilumierLogoDark}
                alt="Ilumiera"
                fill
                className="object-contain"
              /> */}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* <Image
                src="https://www.zerogpt.com/favicon.png"
                alt="Brokwise"
                width={24}
                height={24}
                className="sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              /> */}
              <span className="text-sm sm:text-lg lg:text-2xl font-semibold font-roboto text-foreground">
                Brokwise
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Icon/Title Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* <Image src={logo} alt="Logo" width={30} height={30} className="mb-2" /> */}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-foreground font-serif">
              Verify Your Email
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
              A verification link has been sent to{" "}
              <span className="font-semibold text-foreground">
                {user?.email}
              </span>
            </p>
          </div>

          {/* Instructions Card */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4">
            <div className="space-y-3 text-center">
              <p className="text-base text-muted-foreground">
                Please check your inbox (and spam folder) for an email from{" "}
                <span className="font-semibold text-foreground">
                  dev@brokwise.com
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the verification link in the email to activate your
                account and continue.
              </p>
            </div>

            {/* Resend Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-col items-center justify-center gap-2">
                {timer ? (
                  <p className="text-base text-muted-foreground">
                    Resend verification link in{" "}
                    <span className="font-semibold text-foreground">
                      {timer} seconds
                    </span>
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2 text-base">
                    <span className="text-muted-foreground">
                      Didn&apos;t receive the email?
                    </span>
                    <button
                      onClick={handleSendVerificationLink}
                      disabled={loading}
                      className="btn text-sm sm:text-base px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-300 hover:scale-105"
                    >
                      {loading ? "Sending..." : "Resend verification link"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => router.back()}
              className="btn-outline flex items-center gap-2 px-6 py-3 text-base transition-all duration-300 hover:border-primary/50 hover:text-foreground group"
            >
              <svg
                className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back</span>
            </button>
            <button
              onClick={handleSignOut}
              className="btn-outline flex items-center gap-2 px-6 py-3 text-base transition-all duration-300 hover:border-primary/50 hover:text-foreground group"
            >
              <LogOutIcon className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
