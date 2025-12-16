"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, ArrowRight, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { detectLanguage, changeLanguage } from "@/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { firebaseAuth } from "@/config/firebase";
import { FirebaseError } from "firebase/app";

// --- Schema ---
const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("invalid_email") }),
  });

type FormSchemaType = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Detect saved language preference
  React.useEffect(() => {
    detectLanguage();
  }, []);

  const formSchema = React.useMemo(
    () => getForgotPasswordSchema(t),
    [t]
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(firebaseAuth, data.email);
      setEmailSent(true);
      toast.success(t("password_reset_email_sent") || "Password reset email sent!");
    } catch (error) {
      console.error("Password reset error:", error);
      const firebaseError = error as FirebaseError;
      let errorMessage = t("generic_error") || "An error occurred. Please try again.";
      
      if (firebaseError.code === "auth/user-not-found") {
        errorMessage = t("user_not_found") || "No user found with this email.";
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = t("invalid_email") || "Invalid email address.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-full font-host-grotesk overflow-hidden bg-zinc-950">
      {/* Left Side - Image (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src="/images/login.jpg"
            alt="Real estate office"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </motion.div>

        {/* Quote/Testimonial Area - Optional, keeping it simple or reusing */}
        <div className="absolute bottom-0 left-0 p-10 w-full z-10">
           <div className="max-w-lg backdrop-blur-md bg-black/20 border border-white/10 shadow-2xl rounded-2xl p-8">
            <h2 className="text-3xl font-instrument-serif text-white leading-snug mb-2">
              Brokwise
            </h2>
            <p className="text-zinc-300">
               {t("forgot_password_quote") || "Recover your account access securely."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className="flex-1 h-full overflow-hidden relative bg-zinc-950"
        style={{
          background:
            "radial-gradient(ellipse at top right, #18181b 0%, #09090b 50%, #09090b 100%)",
        }}
      >
        <div className="h-full w-full flex flex-col items-center px-6 lg:px-16">
          {/* Header */}
          <div className="w-full max-w-md shrink-0 pt-7 lg:pt-10 relative">
             <div className="flex justify-between items-start mb-12">
                <Link 
                    href="/login" 
                    className="flex items-center text-zinc-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    {t("back_to_login") || "Back to Login"}
                </Link>

                 <Select
                    onValueChange={(value) => changeLanguage(value)}
                    value={i18n.resolvedLanguage || i18n.language?.split("-")[0] || "en"}
                  >
                    <SelectTrigger className="w-[140px] text-white border-zinc-700 bg-zinc-800/50 h-9 text-xs">
                      <SelectValue placeholder={t("select_language")} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    </SelectContent>
                  </Select>
             </div>

            <div className="text-left space-y-3 mb-8">
              <h1 className="text-4xl lg:text-5xl font-instrument-serif text-white tracking-tight">
                {emailSent ? (t("check_email") || "Check your email") : (t("forgot_password_title") || "Forgot Password?")}
              </h1>
              <p className="text-zinc-400 text-base">
                {emailSent 
                    ? (t("reset_link_sent_desc") || "We have sent a password reset link to your email address.") 
                    : (t("forgot_password_desc") || "Enter your email address and we'll send you a link to reset your password.")}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md flex-1 overflow-y-auto pb-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium">
                              {t("email_label")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <Input
                                  placeholder="name@example.com"
                                  type="email"
                                  {...field}
                                  className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary/20"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-semibold mt-2"
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {t("send_reset_link") || "Send Reset Link"}
                        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-zinc-300 mb-6">
                            {t("email_sent_to") || "We sent an email to"} <span className="text-white font-medium">{form.getValues("email")}</span>
                        </p>
                        <Button
                            variant="outline"
                            className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                            onClick={() => setEmailSent(false)}
                        >
                            {t("try_another_email") || "Try another email"}
                        </Button>
                    </div>
                     <div className="text-center">
                         <p className="text-zinc-500 text-sm">
                             {t("didnt_receive_email") || "Didn't receive the email?"}{" "}
                             <button 
                                onClick={form.handleSubmit(onSubmit)} 
                                disabled={loading}
                                className="text-primary hover:underline font-medium disabled:opacity-50"
                            >
                                {t("click_to_resend") || "Click to resend"}
                             </button>
                         </p>
                     </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
