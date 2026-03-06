"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { firebaseAuth } from "@/config/firebase";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { rotateSessionId } from "@/lib/session";
import { activateSession } from "@/models/api/session";
import { logError } from "@/utils/errors";
import Image from "next/image";

function TokenLoginContent() {
  const [message, setMessage] = useState("Signing you in...");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setMessage("Invalid link. Please log in manually.");
      setIsLoading(false);
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    (async () => {
      try {
        await signInWithCustomToken(firebaseAuth, token);

        const sessionId = rotateSessionId();
        if (sessionId) {
          await activateSession(sessionId);
        }

        toast.success("Signed in successfully!");
        const step = searchParams.get("step");
        router.push(step ? `/?step=${step}` : "/");
      } catch (error) {
        logError({
          description: "Token-based login failed",
          error: error as Error,
          slackChannel: "frontend-errors",
        });
        setMessage("Sign-in link expired or invalid. Please log in manually.");
        setIsLoading(false);
        setTimeout(() => router.push("/login"), 3000);
      }
    })();
  }, [searchParams, router]);

  return (
    <main className="flex flex-col items-center justify-center w-svw h-dvh p-4 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-3 mb-8">
        <Image src="/logo.webp" height={40} width={40} alt="Brokwise" className="rounded-full" />
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Brokwise</h1>
      </div>
      <div className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-400">
        {message}
        {isLoading && (
          <Loader type="dot" size="1.5rem" className="[&_>_div]:bg-slate-600 ml-2" />
        )}
      </div>
    </main>
  );
}

export default function TokenLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex flex-col justify-center items-center gap-4">
          <Image src="/logo.webp" height={52} width={52} alt="Brokwise" className="rounded-full" />
          <h1 className="text-2xl text-center">Loading...</h1>
        </div>
      }
    >
      <TokenLoginContent />
    </Suspense>
  );
}
