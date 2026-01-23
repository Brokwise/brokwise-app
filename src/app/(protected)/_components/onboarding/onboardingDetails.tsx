import React, { useState, useEffect } from "react";
import { submitProfileDetails } from "@/validators/onboarding";
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
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Computer,
  Camera,
  User,
} from "lucide-react";
import { submitUserDetails, updateProfileDetails } from "@/models/api/user";
import { useApp } from "@/context/AppContext";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cities } from "@/constants/cities";
import { COUNTRY_CODES } from "@/constants";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import useAxios from "@/hooks/useAxios";

// Required field indicator component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </span>
);

export const OnboardingDetails = ({
  isEditing = false,
  onCancel,
}: {
  isEditing?: boolean;
  onCancel?: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [isNotifying, setIsNotifying] = useState(false);
  const { t } = useTranslation();

  const isIndianNumber = selectedCountry === "+91";

  const { brokerData, setBrokerData } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const api = useAxios();
  const [signOut] = useSignOut(firebaseAuth);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? theme : undefined;
  const isSystemTheme = mounted && theme === "system";

  const stepFields = {
    1: ["profilePhoto", "firstName", "lastName", "mobile"],
    2: ["companyName", "gstin", "yearsOfExperience"],
    3: ["city", "officeAddress", "reraNumber"],
  };

  const form = useForm<z.infer<typeof submitProfileDetails>>({
    resolver: zodResolver(submitProfileDetails),
    mode: "onChange",
    defaultValues: {
      profilePhoto: brokerData?.profilePhoto,
      firstName:
        brokerData?.firstName || user?.displayName?.split(" ")[0] || "",
      lastName: brokerData?.lastName || user?.displayName?.split(" ")[1] || "",
      mobile: brokerData?.mobile || user?.phoneNumber || "",
      companyName: brokerData?.companyName || "",
      gstin: brokerData?.gstin || "",
      yearsOfExperience: brokerData?.yearsOfExperience ?? undefined,
      city: brokerData?.city || "",
      officeAddress: brokerData?.officeAddress || "",
      reraNumber: brokerData?.reraNumber || "",
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
    data: z.infer<typeof submitProfileDetails>
  ) => {
    if (!user || !brokerData) {
      toast.error("User or broker data not found");
      return;
    }
    console.log(data);

    try {
      setLoading(true);

      if (isEditing) {
        await updateProfileDetails({
          _id: brokerData._id,
          ...data,
        });

        setBrokerData({
          ...brokerData,
          ...data,
        });

        toast.success("Profile updated successfully!");
        if (onCancel) onCancel();
      } else {
        await submitUserDetails({
          uid: user.uid,
          firstName: data.firstName,
          lastName: data.lastName,
          email: user.email || "",
          _id: brokerData._id,
          mobile: data.mobile,
          companyName: data.companyName,
          gstin: data.gstin,
          yearsOfExperience: data.yearsOfExperience,
          city: data.city,
          officeAddress: data.officeAddress,
          reraNumber: data.reraNumber,
          profilePhoto: data.profilePhoto,
        });

        // Update broker data in context
        setBrokerData({
          ...brokerData,
          ...data,
          status: "pending",
        });

        toast.success(
          "Profile details submitted successfully! Your account is now pending approval."
        );
      }
    } catch (error) {
      logError({
        description: "Error submitting profile details",
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
        source: "broker-onboarding",
      });
      toast.success(t("notify_me_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("generic_error"));
    } finally {
      setIsNotifying(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setImageUploading(true);
      const path = generateFilePath(file.name, `users/${user?.uid}/profile`);
      const url = await uploadFileToFirebase(file, path);
      form.setValue("profilePhoto", url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Profile photo uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photo");
    } finally {
      setImageUploading(false);
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
    ] as (keyof z.infer<typeof submitProfileDetails>)[];
    const isStepValid = await form.trigger(fields);

    if (!isStepValid) return;

    if (step === 3) {
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
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <section className="min-h-screen flex items-center justify-center p-4  transition-colors duration-500">
      {/* Theme Toggles - Absolute Positioning preserved but styled better */}
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
                      <span className="text-[#0F766E] italic">profile</span>
                    </>
                  )}
                </h1>
                <span className="hidden sm:block text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Step {step} of {totalSteps}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Please provide your personal details to get started.
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
                      <div className="flex flex-col items-center justify-center gap-4 mb-6">
                        <div className="relative group">
                          <Avatar className="h-24 w-24 border-4 border-white shadow-lg dark:border-slate-800">
                            <AvatarImage
                              src={form.watch("profilePhoto")}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400">
                              <User className="h-10 w-10" />
                            </AvatarFallback>
                          </Avatar>
                          <label
                            htmlFor="profile-photo-upload"
                            className="absolute bottom-0 right-0 p-2 bg-[#0F172A] text-white rounded-full cursor-pointer hover:bg-[#1E293B] transition-colors shadow-sm dark:bg-white dark:text-slate-900"
                          >
                            {imageUploading ? (
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                            <input
                              id="profile-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={imageUploading}
                            />
                          </label>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Profile Photo
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Click the camera icon to upload
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <RequiredLabel>First Name</RequiredLabel>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                  placeholder="e.g. John"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <RequiredLabel>Last Name</RequiredLabel>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                  placeholder="e.g. Doe"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              <RequiredLabel>Mobile Number</RequiredLabel>
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
                                  placeholder="e.g. 9876543210"
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
                                {t("mobile_aadhaar_hint")}
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
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Company Name{" "}
                              <span className="text-slate-400 text-xs ml-1 font-normal">
                                (Optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                placeholder="Your agency name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="gstin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                GSTIN{" "}
                                <span className="text-slate-400 text-xs ml-1 font-normal">
                                  (Optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  maxLength={15}
                                  className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all uppercase placeholder:normal-case"
                                  placeholder="GSTIN Number"
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
                          name="yearsOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <RequiredLabel>Experience</RequiredLabel>
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(e) =>
                                    field.onChange(parseInt(e))
                                  }
                                  value={
                                    field.value !== undefined
                                      ? field.value.toString()
                                      : undefined
                                  }
                                >
                                  <SelectTrigger className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all">
                                    <SelectValue placeholder="Years" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[...Array(16)].map((_, index) => (
                                      <SelectItem
                                        key={index}
                                        value={index.toString()}
                                      >
                                        {index === 15 ? "15+" : index}{" "}
                                        {index === 1 ? "year" : "years"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              City
                            </FormLabel>
                            <Popover open={openCity} onOpenChange={setOpenCity}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCity}
                                    className={cn(
                                      "w-full justify-between h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? field.value
                                      : "Select city..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search city..."
                                    onValueChange={setCityQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      <p className="p-2 text-sm text-muted-foreground">
                                        No city found.
                                      </p>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start h-auto p-2 text-sm"
                                        onClick={() => {
                                          field.onChange(cityQuery);
                                          setOpenCity(false);
                                        }}
                                      >
                                        Use &quot;{cityQuery}&quot;
                                      </Button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {cities.map((city) => (
                                        <CommandItem
                                          key={city}
                                          value={city}
                                          onSelect={(currentValue) => {
                                            field.onChange(
                                              currentValue === field.value
                                                ? ""
                                                : currentValue
                                            );
                                            setOpenCity(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value?.toLowerCase() ===
                                                city.toLowerCase()
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {city}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
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
                              <AddressAutocomplete
                                valueLabel={field.value || ""}
                                valueId={field.value || ""}
                                placeholder="Search office address..."
                                className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                onSelect={(item) =>
                                  field.onChange(item.place_name)
                                }
                                onClear={() => field.onChange("")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="reraNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              RERA Number{" "}
                              <span className="text-slate-400 text-xs ml-1 font-normal">
                                (Optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                maxLength={50}
                                className="h-12 bg-white border-slate-200 text-slate-900 focus:border-[#0F766E] focus:ring-[#0F766E]/20 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-100 dark:focus:border-[#0F766E] transition-all"
                                placeholder="RERA ID"
                              />
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
                    step === 3 && !isValid && !loading
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
                    {step === 3
                      ? isEditing
                        ? "Update Profile"
                        : "Complete Setup"
                      : "Continue"}
                    {step < 3 && <ArrowRight className="h-4 w-4" />}
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
