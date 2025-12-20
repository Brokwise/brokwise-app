import React, { useState } from "react";
import { createCompanyFormSchema } from "@/validators/company";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createCompany, updateCompanyProfile } from "@/models/api/company";
import { useApp } from "@/context/AppContext";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/config/firebase";
import { toast } from "sonner";
import { logError } from "@/utils/errors";
import { motion, AnimatePresence } from "framer-motion";

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
  const { companyData, setCompanyData } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);

  const stepFields = {
    1: ["name", "mobile", "city"],
    2: ["gstin", "noOfEmployees", "officeAddress"],
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
              company profile
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
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
                          <FormLabel>Mobile Number</FormLabel>
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
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN</FormLabel>
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
                      name="noOfEmployees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Employees</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
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
                          <FormLabel>Office Address</FormLabel>
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

          <div className="flex justify-between mt-4 pt-4 z-10 relative">
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
                step === 2 && !isValid && !loading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Submitting..."
                : step === 2
                ? isEditing
                  ? "Update"
                  : "Submit"
                : "Next"}
              {step < 2 && !loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};
