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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
const Signupcard = ({ isSignup = false }: { isSignup?: boolean }) => {
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
        url: `${window.location.origin}/app`,
        handleCodeInApp: false,
      };
      await sendEmailVerification(user, actionCodeSettings);
      localStorage.setItem("lastVerification", Date.now().toString());
      toast.success(
        "Verification email sent! Check your inbox and spam folder."
      );
    } catch (error) {
      console.error("Email verification error:", error);
      const firebaseError = error as FirebaseError;
      logError({
        description: `Error sending verification link to ${user.email}. Error code: ${firebaseError.code}, Message: ${firebaseError.message}`,
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      if (firebaseError.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  const handleSignUpError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/invalid-password":
      case "auth/wrong-password":
        setInputError({
          ...inputError,
          password: "Incorrect email or password.",
        });
        break;
      case "auth/email-already-exists":
      case "auth/email-already-in-use":
        setInputError({
          ...inputError,
          email: "Email already in use.",
        });
        break;
      case "auth/invalid-email":
        setInputError({
          ...inputError,
          email: "Invalid email address.",
        });
        break;
      case "auth/too-many-requests":
        toast.error("Too many failed requests. Please try again later.");
        break;
      default:
        toast.error("Failed to create your account. Please try again.");
    }
  };

  const handleSignInError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/wrong-password":
      case "auth/invalid-password":
      case "auth/invalid-login-credentials":
      case "auth/invalid-credentials":
      case "auth/invalid-credential":
        setInputError({
          ...inputError,
          password: "Incorrect email or password.",
        });
        break;
      case "auth/invalid-email":
        setInputError({
          ...inputError,
          email: "Invalid email address.",
        });
        break;
      case "auth/user-not-found":
        setInputError({
          ...inputError,
          email: "User not found.",
        });
        break;
      case "auth/too-many-requests":
        toast.error("Too many failed requests. Please try again later.");
        break;
      default:
        toast.error("Sign in failed. Please try again.");
    }
  };
  const handleGoogleSignUp = () => {
    try {
      if (!Config.googleOauthClientId) {
        toast.error("Google OAuth is not configured. Please contact support.");
        return;
      }

      const redirectUri = encodeURIComponent(
        `${Config.frontendUrl}/google-oauth`
      );
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
      );

      window.open(
        `https://accounts.google.com/o/oauth2/auth?client_id=${Config.googleOauthClientId}&response_type=token&scope=${scope}&redirect_uri=${redirectUri}&state=${isSignup}`,
        "_self"
      );
    } catch (error) {
      logError({
        description: "Error signing up with Google",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      console.error(error);
      toast.error("Google authentication failed, Something went wrong");
    }
  };

  return (
    <div>
      {" "}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {isSignup && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button
            type="button"
            className={`w-full ${!isValid && !loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
            {isSignup ? "Sign up" : "Login"}
          </Button>
        </form>
      </Form>
      {!isSignup && (
        <div className="text-right">
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>
      )}
      <div className="flex items-center gap-2 flex-col w-full relative">
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 left-0"></div>
        <span className="text-gray-500 z-10">Or continue with</span>
        <div className="w-1/4 h-[1px] bg-gray-200 absolute top-1/2 right-0"></div>
      </div>
      <Button
        onClick={handleGoogleSignUp}
        size={"lg"}
        variant="outline"
        className="w-full"
      >
        <Image src="/icons/google.svg" alt="google" width={24} height={24} />
        <span>Google</span>
      </Button>
    </div>
  );
};

export default Signupcard;
