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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { submitUserDetails } from "@/models/api/user";
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

export const OnboardingDetails = ({}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const { brokerData, setBrokerData } = useApp();
  const [user] = useAuthState(firebaseAuth);
  const [signOut] = useSignOut(firebaseAuth);

  const stepFields = {
    1: ["firstName", "lastName", "mobile"],
    2: ["companyName", "gstin", "yearsOfExperience"],
    3: ["city", "officeAddress", "reraNumber"],
  };

  const form = useForm<z.infer<typeof submitProfileDetails>>({
    resolver: zodResolver(submitProfileDetails),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      companyName: "",
      gstin: "",
      yearsOfExperience: 0,
      city: "",
      officeAddress: "",
      reraNumber: "",
    },
  });

  const onSubmitProfileDetails = async (
    data: z.infer<typeof submitProfileDetails>
  ) => {
    if (!user || !brokerData) {
      toast.error("User or broker data not found");
      return;
    }

    try {
      setLoading(true);

      await submitUserDetails({
        uid: user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: user.email || "",
        _id: brokerData._id,
        mobile: data.mobile,
        companyName: data.companyName || "",
        gstin: data.gstin || "",
        yearsOfExperience: data.yearsOfExperience,
        city: data.city,
        officeAddress: data.officeAddress || "",
        reraNumber: data.reraNumber || "",
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
        onClick={() => signOut()}
        className="absolute top-4 right-4"
      >
        Logout
      </Button>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitProfileDetails)}
          className="w-[30vw] relative 
        bg-[#0f0f11] 
        border border-white/10 
        rounded-2xl 
        shadow-2xl 
        flex flex-col p-xl overflow-hidden"
        >
          <h1 className="text-3xl">
            Let&apos;s setup your
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
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
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
                              className=""
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
                          <FormLabel>Company Name (Optional)</FormLabel>
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
                          <FormLabel>GSTIN (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Years of Experience (Required)</FormLabel>
                          <FormControl>
                            {/* <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            /> */}
                            <Select
                              {...field}
                              onValueChange={(e) => {
                                field.onChange(parseInt(e) || 0);
                              }}
                              value={field.value.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Years of Experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="7">7</SelectItem>
                                <SelectItem value="8">8</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="13">13</SelectItem>
                                <SelectItem value="14">14</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="16">16</SelectItem>
                                <SelectItem value="17">17</SelectItem>
                                <SelectItem value="18">18</SelectItem>
                                <SelectItem value="19">19</SelectItem>
                                <SelectItem value="20">20</SelectItem>
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
              type={step === 3 ? "submit" : "button"}
              onClick={handleNext}
              size={"lg"}
              disabled={loading || !form.formState.isValid}
            >
              {loading ? "Submitting..." : step === 3 ? "Submit" : "Next"}
              {step < 3 && !loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};
