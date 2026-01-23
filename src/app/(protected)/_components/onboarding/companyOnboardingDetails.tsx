import React, { useState, useEffect } from "react";
import { createCompanyFormSchema } from "@/validators/company";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { COUNTRY_CODES } from "@/constants";
import useAxios from "@/hooks/useAxios";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Computer,
  User,
  Users,
  Building2,
  Landmark,
} from "lucide-react";
import { createCompany, updateCompanyProfile } from "@/models/api/company";
import { useApp } from "@/context/AppContext";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export const CompanyOnboardingDetails = ({
  isEditing = false,
  onCancel,
}: {
  isEditing?: boolean;
  onCancel?: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [isNotifying, setIsNotifying] = useState(false);
  const { t } = useTranslation();

  const isIndianNumber = selectedCountry === "+91";

  const { companyData, setCompanyData } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const api = useAxios();
  const [signOut] = useSignOut(firebaseAuth);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? theme : undefined;
  const isSystemTheme = mounted && theme === "system";

  const stepFields = {
    1: ["name", "mobile", "city"],
    2: ["gstin", "noOfEmployees", "officeAddress"],
  };

  const employeeRanges = [
    {
      id: "solo",
      label: "Solo",
      range: "1",
      value: 1,
      icon: User,
    },
    {
      id: "small",
      label: "Small",
      range: "2-10",
      value: 5,
      icon: Users,
    },
    {
      id: "mid",
      label: "Mid-sized",
      range: "10-100",
      value: 50,
      icon: Building2,
    },
    {
      id: "large",
      label: "Large",
      range: "100+",
      value: 150,
      icon: Landmark,
    },
  ];

  const getSelectedRange = (val: number) => {
    if (!val) return null;
    if (val === 1) return "solo";
    if (val >= 2 && val <= 10) return "small";
    if (val > 10 && val <= 100) return "mid";
    if (val > 100) return "large";
    return "mid"; // Default fallback if weird number
  };

  const form = useForm<z.infer<typeof createCompanyFormSchema>>({
    resolver: zodResolver(createCompanyFormSchema),
    mode: "onChange",
    defaultValues: {
      name: companyData?.name || "",
      mobile: companyData?.mobile || user?.phoneNumber || "",
      city: companyData?.city || "",
      gstin: companyData?.gstin || "",
      noOfEmployees: companyData?.noOfEmployees || 0,
      officeAddress: companyData?.officeAddress || "",
    },
  });
  const { formState } = form;
  const { isValid } = formState;

  useEffect(() => {
    if (!isIndianNumber) {
      form.setValue("mobile", "", { shouldValidate: true, shouldDirty: true });
    }
  }, [form, isIndianNumber]);

  const onSubmitProfileDetails = async (
    data: z.infer<typeof createCompanyFormSchema>
  ) => {
    if (!user) {
      toast.error("User not found");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && companyData) {
        await updateCompanyProfile({
          _id: companyData._id,
          ...data,
        });

        // Update company data in context
        setCompanyData({
          ...companyData,
          ...data,
        });

        toast.success("Profile updated successfully!");
        if (onCancel) onCancel();
      } else {
        const newCompany = await createCompany({
          uid: user.uid,
          email: user.email || "",
          ...data,
        });

        // Update company data in context
        setCompanyData(newCompany.data);

        toast.success(
          "Company profile submitted successfully! Your account is now pending approval."
        );
      }
    } catch (error) {
      logError({
        description: "Error submitting company profile details",
        error: error as Error,
        slackChannel: "frontend-errors",
      });
      toast.error("Failed to submit profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyMe = async () => {
    setIsNotifying(true);
    try {
      await api.post("/notify", {
        countryCode: selectedCountry,
        countryLabel:
          COUNTRY_CODES.find((country) => country.value === selectedCountry)
            ?.label ?? "",
        email: user?.email ?? "",
        phone: user?.phoneNumber ?? "",
        userId: user?.uid ?? "",
        source: "company-onboarding",
      });
      toast.success(t("notify_me_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("generic_error"));
    } finally {
      setIsNotifying(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const fields = stepFields[
      step as keyof typeof stepFields
    ] as (keyof z.infer<typeof createCompanyFormSchema>)[];
    const isStepValid = await form.trigger(fields);

    if (!isStepValid) return;

    if (step === 2) {
      onSubmitProfileDetails(form.getValues());
    } else {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  // Calculate progress
  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  return (
    <section className="min-h-screen flex items-center justify-center p-4  transition-colors duration-500">
      {/* Theme Toggles */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <div className="flex gap-0.5 border border-slate-200 dark:border-slate-800 rounded-full p-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("light")}
            className={`h-7 w-7 rounded-full transition-all ${
              activeTheme === "light"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("dark")}
            className={`h-7 w-7 rounded-full transition-all ${
              activeTheme === "dark"
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme("system")}
            className={`h-7 w-7 rounded-full transition-all ${
              isSystemTheme
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Computer className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={() => (isEditing && onCancel ? onCancel() : signOut())}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          {isEditing ? "Cancel" : "Logout"}
        </Button>
      </div>

      {/* Executive Card */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitProfileDetails)}
          className="relative max-w-2xl w-full bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-[#0F766E]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h1 className="text-3xl md:text-4xl font-instrument-serif text-slate-900 dark:text-slate-50">
                  {isEditing ? (
                    "Update your profile"
                  ) : (
                    <>
                      Let&apos;s setup your{" "}
                      <span className="text-[#0F766E] italic">
                        company profile
                      </span>
                    </>
                  )}
                </h1>
                <span className="hidden sm:block text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Step {step} of {totalSteps}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Provide your company details to verify your agency.
              </p>
            </div>

            {/* Form Fields */}
            <div className="relative min-h-[300px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="space-y-6"
                >
                  {step === 1 && (
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Company Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                placeholder="Your registered company name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Mobile Number
                              </FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Select
                                    value={selectedCountry}
                                    onValueChange={setSelectedCountry}
                                  >
                                    <SelectTrigger className="w-[140px] h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {COUNTRY_CODES.map((country) => (
                                        <SelectItem
                                          key={country.code}
                                          value={country.value}
                                        >
                                          {country.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Input
                                    {...field}
                                    type="tel"
                                    maxLength={10}
                                    className="flex-1 h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all disabled:opacity-60"
                                    placeholder="Contact number"
                                    disabled={!isIndianNumber}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              {isIndianNumber && (
                                <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                  {t("mobile_company_hint")}
                                </FormDescription>
                              )}
                              {!isIndianNumber && (
                                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                                  <span className="flex-1 leading-snug">
                                    {t("coming_soon_country")}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={handleNotifyMe}
                                    disabled={isNotifying}
                                  >
                                    {isNotifying ? t("submitting") : t("notify_me")}
                                  </Button>
                                </div>
                              )}
                              {isIndianNumber && <FormMessage />}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                City
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                  placeholder="Headquarters City"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="gstin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                GSTIN
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  maxLength={15}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all uppercase placeholder:normal-case"
                                  placeholder="GST Identification Number"
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .toUpperCase()
                                      .slice(0, 15);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="officeAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Office Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                  placeholder="Registered office address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="noOfEmployees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Team Size
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {employeeRanges.map((option) => {
                                  const isSelected =
                                    getSelectedRange(field.value) === option.id;
                                  return (
                                    <div
                                      key={option.id}
                                      onClick={() =>
                                        field.onChange(option.value)
                                      }
                                      className={`
                                          cursor-pointer relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                          ${
                                            isSelected
                                              ? "border-[#0F766E] bg-[#0F766E]/5 dark:bg-[#0F766E]/10"
                                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-[#0F766E]/50 hover:bg-slate-50 dark:hover:bg-slate-900"
                                          }
                                        `}
                                    >
                                      <option.icon
                                        className={`h-6 w-6 mb-2 ${
                                          isSelected
                                            ? "text-[#0F766E]"
                                            : "text-slate-400"
                                        }`}
                                      />
                                      <span
                                        className={`text-sm font-semibold ${
                                          isSelected
                                            ? "text-[#0F766E]"
                                            : "text-slate-700 dark:text-slate-200"
                                        }`}
                                      >
                                        {option.label}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {option.range}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handlePrev}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div /> // Spacer
              )}

              <Button
                onClick={handleNext}
                type="button"
                disabled={loading || (step === 1 && !isIndianNumber)}
                className={`
                  h-12 px-8 font-medium
                  bg-[#0F172A] text-white hover:bg-[#1E293B]
                  dark:bg-white dark:text-[#0F172A] dark:hover:bg-slate-200
                  transition-all duration-300
                  ${
                    step === 2 && !isValid && !loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-lg hover:-translate-y-0.5"
                  }
                `}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isEditing ? "Updating..." : "Submitting..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {step === 2
                      ? isEditing
                        ? "Update Profile"
                        : "Complete Setup"
                      : "Continue"}
                    {step < 2 && <ArrowRight className="h-4 w-4" />}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};
