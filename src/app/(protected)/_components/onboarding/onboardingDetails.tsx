import React, { useState } from "react";
import { submitProfileDetails } from "@/validators/onboarding";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Required field indicator component
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </span>
);
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { submitUserDetails, updateProfileDetails } from "@/models/api/user";
import { useApp } from "@/context/AppContext";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { brokerData, setBrokerData, brokerDataLoading } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);

  const stepFields = {
    1: ["firstName", "lastName", "mobile"],
    2: ["companyName", "gstin", "yearsOfExperience"],
    3: ["city", "officeAddress", "reraNumber"],
  };

  const form = useForm<z.infer<typeof submitProfileDetails>>({
    resolver: zodResolver(submitProfileDetails),
    mode: "onChange",
    defaultValues: {
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

  const onSubmitProfileDetails = async (
    data: z.infer<typeof submitProfileDetails>
  ) => {
    console.log(user);
    console.log(brokerData);
    if (!user || !brokerData) {
      toast.error("User or broker data not found");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await updateProfileDetails({
          _id: brokerData._id,
          ...data,
        });

        // Update broker data in context
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

  return (
    <section className="flex flex-col justify-center items-center h-screen w-full">
      <Button
        variant={"link"}
        onClick={() => (isEditing && onCancel ? onCancel() : signOut())}
        className="absolute top-4 right-4"
      >
        {isEditing ? "Cancel" : "Logout"}
      </Button>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitProfileDetails)}
          className="w-[50vw] lg:w-[30vw] relative bg-[#0f0f11] border border-white/10 
        rounded-2xl 
        shadow-2xl 
        flex flex-col p-xl overflow-hidden"
        >
          <h1 className="text-3xl">
            {isEditing ? "Update your" : "Let's setup your"}
            <span className="text-primary font-instrument-serif italic">
              {" "}
              profile
            </span>
          </h1>
          <div className="grid grid-cols-1">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4 col-start-1 row-start-1"
              >
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <RequiredLabel>First Name</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>
                            <RequiredLabel>Last Name</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <RequiredLabel>Mobile Number</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              maxLength={10}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-400">
                            Company Name{" "}
                            <span className="text-zinc-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-400">
                            GSTIN{" "}
                            <span className="text-zinc-500">(Optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={15}
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
                          <FormLabel>
                            <RequiredLabel>Years of Experience</RequiredLabel>
                          </FormLabel>
                          <FormControl>
                            <Select
                              {...field}
                              onValueChange={(e) => {
                                field.onChange(parseInt(e));
                              }}
                              value={
                                field.value !== undefined
                                  ? field.value.toString()
                                  : undefined
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Years of Experience" />
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
                  </>
                )}

                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Office Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>RERA Number (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-4 pt-4  z-10 relative">
            {step > 1 ? (
              <Button
                variant={"outline"}
                type="button"
                onClick={handlePrev}
                size={"lg"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              type="button"
              size={"lg"}
              disabled={loading}
              className={
                step === 3 && !isValid && !loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Submitting..."
                : step === 3
                ? isEditing
                  ? "Update"
                  : "Submit"
                : "Next"}
              {step < 3 && !loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};
