import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, signupFormSchema } from "@/validators/onboarding";
import { Config } from "@/config";
import { logError } from "@/utils/errors";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { firebaseAuth, getUserDoc, setUserDoc } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { createUser } from "@/models/api/user";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { buildAcceptedLegalConsents } from "@/constants/legal";

const Signupcard = ({ isSignup = false }: { isSignup?: boolean }) => {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const [inputError, setInputError] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const formSchema = isSignup ? signupFormSchema : loginFormSchema;
  type FormSchemaType =
    | z.infer<typeof signupFormSchema>
    | z.infer<typeof loginFormSchema>;
  const defaultValues = isSignup
    ? {
      email: "",
      password: "",
      confirmPassword: "",
    }
    : {
      email: "",
      password: "",
    };
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });
  const { formState, trigger } = form;
  const { isValid } = formState;
  const createUserInDb = async (user: User, name: string) => {
    const isFirstTimeUser =
      user.metadata.creationTime === user.metadata.lastSignInTime;
    if (isFirstTimeUser) {
      await createUser({
        email: user.email ?? "",
        uid: user.uid ?? "",
        legalConsents: buildAcceptedLegalConsents("signup"),
      });
      const userDoc = getUserDoc(user.uid);
      await setUserDoc(userDoc, {
        email: user.email ?? "",
        uid: user.uid ?? "",
        firstName: user.displayName ?? name ?? "",
        lastName: "",
      });
    }
  };
  const handleSubmit = async (data: FormSchemaType) => {
    try {
      setLoading(true);

      const { email, password } = data;
      const { user } = await (isSignup
        ? createUserWithEmailAndPassword(firebaseAuth, email, password)
        : signInWithEmailAndPassword(firebaseAuth, email, password)
      ).catch((error) => {
        throw error;
      });
      if (isSignup) {
        await createUserInDb(user, "");
        await sendVerificatinLink(user);
      } else {
        if (!user.emailVerified) {
          await sendVerificatinLink(user);
        }
      }
      router.push("/");
    } catch (err) {
      const error = err as FirebaseError;
      if (isSignup) {
        handleSignUpError(error);
      } else {
        handleSignInError(error);
      }
    } finally {
      setLoading(false);
    }
  };
  const sendVerificatinLink = async (user: User) => {
    try {
      if (user.emailVerified) {
        return;
      }
      const actionCodeSettings = {
        url: `https://app.brokwise.com`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      localStorage.setItem("lastVerification", Date.now().toString());
      toast.success(t("verification_email_sent"));
    } catch (error) {
      console.error("Email verification error:", error);
      const firebaseError = error as FirebaseError;
      logError({
        description: `Error sending verification link to ${user.email}. Error code: ${firebaseError.code}, Message: ${firebaseError.message}`,
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      if (firebaseError.code === "auth/network-request-failed") {
        toast.error(t("network_error"));
      }
    }
  };

  const handleSignUpError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/invalid-password":
      case "auth/wrong-password":
        setInputError((prev) => ({
          ...prev,
          password: t("incorrect_email_password"),
        }));
        break;
      case "auth/email-already-exists":
      case "auth/email-already-in-use":
        setInputError((prev) => ({
          ...prev,
          email: t("email_in_use"),
        }));
        break;
      case "auth/invalid-email":
        setInputError((prev) => ({
          ...prev,
          email: t("invalid_email"),
        }));
        break;
      case "auth/too-many-requests":
        toast.error(t("too_many_requests"));
        break;
      default:
        toast.error(t("failed_create_account"));
    }
  };

  const handleSignInError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/wrong-password":
      case "auth/invalid-password":
      case "auth/invalid-login-credentials":
      case "auth/invalid-credentials":
      case "auth/invalid-credential":
        setInputError((prev) => ({
          ...prev,
          password: t("incorrect_email_password"),
        }));
        break;
      case "auth/invalid-email":
        setInputError((prev) => ({
          ...prev,
          email: t("invalid_email"),
        }));
        break;
      case "auth/user-not-found":
        setInputError((prev) => ({
          ...prev,
          email: t("user_not_found"),
        }));
        break;
      case "auth/too-many-requests":
        toast.error(t("too_many_requests"));
        break;
      default:
        toast.error(t("signin_failed"));
    }
  };
  const handleGoogleSignUp = async () => {
    try {
      if (!Config.googleOauthClientId) {
        toast.error(t("google_oauth_not_configured"));
        return;
      }

      const isNative = Capacitor.isNativePlatform();
      const redirectUrlStr = `${Config.frontendUrl}/google-oauth`;
      const target = searchParams.get("target") ?? "";

      const redirectUri = encodeURIComponent(redirectUrlStr);
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
      );

      const statePayload = `${isNative}---${target}`;
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${Config.googleOauthClientId
        }&response_type=token&scope=${scope}&redirect_uri=${redirectUri}&state=${encodeURIComponent(
          statePayload
        )}`;

      if (isNative) {
        await Browser.open({ url: authUrl });
      } else {
        window.open(authUrl, "_self");
      }
    } catch (error) {
      logError({
        description: "Error signing up with Google",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      console.error(error);
      toast.error(t("google_auth_failed"));
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select
          onValueChange={(value) => i18n.changeLanguage(value)}
          defaultValue={i18n.language}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email_label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("email_placeholder")}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (inputError.email) {
                        setInputError((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
                {inputError.email && (
                  <p className="text-sm font-medium text-destructive">
                    {inputError.email}
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password_label")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("password_placeholder")}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (inputError.password) {
                        setInputError((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
                {inputError.password && (
                  <p className="text-sm font-medium text-destructive">
                    {inputError.password}
                  </p>
                )}
              </FormItem>
            )}
          />
          {isSignup && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirm_password_label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("confirm_password_placeholder")}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (inputError.confirmPassword) {
                          setInputError((prev) => ({
                            ...prev,
                            confirmPassword: undefined,
                          }));
                        }
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                  {inputError.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {inputError.confirmPassword}
                    </p>
                  )}
                </FormItem>
              )}
            />
          )}
          <Button
            type="button"
            className={`w-full ${!isValid && !loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            size={"lg"}
            disabled={loading}
            onClick={async () => {
              const valid = await trigger();
              if (valid) {
                form.handleSubmit(handleSubmit)();
              }
            }}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignup ? t("signup_button") : t("login_button")}
          </Button>
        </form>
      </Form>
      {!isSignup && (
        <div className="text-right">
          <Link href="/forgot-password">{t("forgot_password")}</Link>
        </div>
      )}
      <div className="flex items-center gap-2 flex-col w-full relative">
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 left-0"></div>
        <span className="text-gray-500 z-10">{t("or")}</span>
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 right-0"></div>
      </div>
      <Button
        onClick={handleGoogleSignUp}
        size={"lg"}
        variant="outline"
        className="w-full"
      >
        <Image src="/icons/google.svg" alt="google" width={24} height={24} />
        <span>{t("google_button")}</span>
      </Button>
    </div>
  );
};

export default Signupcard;
