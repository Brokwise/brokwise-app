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
export const OnboardingDetails = ({}) => {
  const [step, setStep] = useState(1);
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
  return (
    <section className="flex flex-col justify-center items-center h-screen w-full">
      <Button variant={"link"} onClick={() => signOut()}>
        Logout
      </Button>
      <h1 className="text-2xl font-bold">Onboarding Details</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitProfileDetails)}
          className="space-y-4 w-[30vw]"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "firstName"
                  )
                    ? "block"
                    : "hidden"
                }
              >
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
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "lastName"
                  )
                    ? "block"
                    : "hidden"
                }
              >
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
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes("mobile")
                    ? "block"
                    : "hidden"
                }
              >
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "companyName"
                  )
                    ? "block"
                    : "hidden"
                }
              >
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
            name="gstin"
            render={({ field }) => (
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes("gstin")
                    ? "block"
                    : "hidden"
                }
              >
                <FormLabel>GSTIN</FormLabel>
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
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "yearsOfExperience"
                  )
                    ? "block"
                    : "hidden"
                }
              >
                <FormLabel>Years of Experience</FormLabel>
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
            name="city"
            render={({ field }) => (
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes("city")
                    ? "block"
                    : "hidden"
                }
              >
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
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "officeAddress"
                  )
                    ? "block"
                    : "hidden"
                }
              >
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
              <FormItem
                className={
                  stepFields[step as keyof typeof stepFields].includes(
                    "reraNumber"
                  )
                    ? "block"
                    : "hidden"
                }
              >
                <FormLabel>RERA Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            {step > 1 && (
              <Button
                variant={"outline"}
                type="button"
                onClick={() => setStep(step - 1)}
                size={"lg"}
              >
                <ArrowLeft />
                Previous
              </Button>
            )}
            <Button
              type={
                stepFields[step as keyof typeof stepFields].length === 3
                  ? "submit"
                  : "button"
              }
              onClick={(e) => {
                e.preventDefault();
                if (step === 3) {
                  onSubmitProfileDetails(form.getValues());
                } else {
                  setStep(step + 1);
                }
              }}
              size={"lg"}
              className=""
              disabled={loading}
            >
              {loading ? "Submitting..." : step === 3 ? "Submit" : "Next"}
              {step < 3 && !loading && <ArrowRight />}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};
