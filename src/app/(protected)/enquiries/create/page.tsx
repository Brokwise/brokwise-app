
"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Key, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateEnquiry } from "@/hooks/useEnquiry";
import { useCreateCompanyEnquiry } from "@/hooks/useCompany";
import { CreateEnquiryDTO } from "@/models/types/enquiry";
import { useApp } from "@/context/AppContext";
import { useCredits, useGetCreditPrices } from "@/hooks/useCredits";
import { useGetRemainingQuota } from "@/hooks/useSubscription";
import { useQueryClient } from "@tanstack/react-query";
import { EnquiryCreateUseCredits } from "@/components/ui/enquiry-create-use-credits";
import { DisclaimerAcknowledge } from "@/components/ui/disclaimer-acknowledge";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

import { createEnquirySchema, CreateEnquiryFormValues, BUDGET_MIN, BUDGET_MAX, RENT_MIN, RENT_MAX } from "@/models/schemas/enquirySchema";
import LocationSection from "./_components/LocationSection";
import PropertyDetailsSection from "./_components/PropertyDetailsSection";
import BudgetSection from "./_components/BudgetSection";
import RentalBudgetSection from "./_components/RentalBudgetSection";
import AdditionalDetailsSection from "./_components/AdditionalDetailsSection";


const CreateEnquiryPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { companyData } = useApp();
  const { createEnquiry, isPending: isBrokerPending } = useCreateEnquiry();
  const { createEnquiry: createCompanyEnquiry, isPending: isCompanyPending } =
    useCreateCompanyEnquiry();
  const { balance } = useCredits();
  const { prices } = useGetCreditPrices();
  const { remaining, isLoading: isQuotaLoading } = useGetRemainingQuota();
  const queryClient = useQueryClient();

  const isPending = companyData ? isCompanyPending : isBrokerPending;
  const [purposeSelected, setPurposeSelected] = useState(false);
  const [showUrgentConfirmation, setShowUrgentConfirmation] = useState(false);
  const [shouldUseCredits, setShouldUseCredits] = useState(false);
  const [isEnquiryDisclaimerAccepted, setIsEnquiryDisclaimerAccepted] =
    useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] =
    useState<CreateEnquiryFormValues | null>(null);

  const form = useForm<CreateEnquiryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createEnquirySchema) as any,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      locationMode: "search",
      isCompany: false,
      enquiryPurpose: "BUY",
      preferredLocations: [{ address: "", placeId: "", city: "", locality: "" }],
      address: "",
      addressPlaceId: "",
      city: "",
      localities: [],
      budget: { min: BUDGET_MIN, max: BUDGET_MAX },
      monthlyRentBudget: { min: RENT_MIN, max: RENT_MAX },
      description: "",
      urgent: false,
    },
  });

  const { reset, setValue, watch, handleSubmit } = form;
  const selectedCategory = watch("enquiryCategory");
  const enquiryPurpose = watch("enquiryPurpose") || "BUY";

  useEffect(() => {
    setValue("isCompany", !!companyData);
  }, [companyData, setValue]);


  useEffect(() => {
    if (!selectedCategory) return;

    const fieldsToReset: (keyof CreateEnquiryFormValues)[] = [
      "enquiryType", "size", "plotType", "facing",
      "frontRoadWidth", "bhk", "washrooms", "preferredFloor",
      "society", "rooms", "beds", "rentalIncome", "purpose", "areaType",
      "isCorner", "roadFacingSides", "roadWidths",
      "possessionType", "possessionDate", "tenantDetails"
    ];

    fieldsToReset.forEach(field => {
      setValue(field, undefined, { shouldValidate: false });
    });

  }, [selectedCategory, setValue]);


  const handleSubmission = (data: CreateEnquiryFormValues) => {
    const payload: Record<string, unknown> = {
      ...data,
      shouldUseCredits,
      enquiryDisclaimerAccepted: isEnquiryDisclaimerAccepted,
    };
    delete payload.addressPlaceId;
    delete payload.locationMode;
    delete payload.isCompany;
    delete payload.isCorner;

    if (!data.isCorner) {
      delete payload.roadFacingSides;
      delete payload.roadWidths;
    }

    const purpose = data.enquiryPurpose || "BUY";
    if (purpose === "RENT") {
      delete payload.budget;
    } else {
      delete payload.monthlyRentBudget;
      delete payload.possessionType;
      delete payload.possessionDate;
      delete payload.tenantDetails;
    }

    const cleanedLocations = (data.preferredLocations ?? [])
      .filter((loc) => loc.address && loc.address.trim().length >= 3)
      .map(({ placeId, ...rest }) => rest);
    payload.preferredLocations = cleanedLocations;

    if (cleanedLocations.length > 0) {
      payload.address = cleanedLocations[0].address;
    }

    const finalPayload = payload as unknown as CreateEnquiryDTO;

    const onSuccess = () => {
      toast.success("Enquiry created successfully!");
      reset();
      router.replace("/enquiries/create/success");
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    };

    const onError = (error: unknown) => {
      // @ts-expect-error - axios error shape
      toast.error(error?.response?.data?.message || "Failed to create enquiry");
    };

    if (companyData) {
      createCompanyEnquiry(finalPayload, { onSuccess, onError });
    } else {
      createEnquiry(finalPayload, { onSuccess, onError });
    }
  };

  const onSubmit = (data: CreateEnquiryFormValues) => {
    if (!isEnquiryDisclaimerAccepted) {
      toast.error(DISCLAIMER_TEXT.mandatoryLabel);
      return;
    }

    if (data.urgent) {
      if (balance < prices.MARK_ENQUIRY_AS_URGENT) {
        toast.error("Insufficient credits to mark as Urgent");
        return;
      }
      setPendingSubmissionData(data);
      setShowUrgentConfirmation(true);
    } else {
      handleSubmission(data);
    }
  };

  const onInvalid = (errors: FieldErrors<CreateEnquiryFormValues>) => {
    console.log("Form Errors:", errors);
    toast.error("Please fill in all required fields and correct errors.");
  };

  const handlePurposeSelect = (purpose: "BUY" | "RENT") => {
    setValue("enquiryPurpose", purpose, { shouldValidate: false });
    setPurposeSelected(true);
  };

  return (
    <PageShell className="flex-none pb-6 md:pb-8">
      {!purposeSelected ? (
        <>
          <PageHeader
            title={t("page_create_enquiry_title")}
            description={t("page_create_enquiry_subtitle")}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <section className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  What are you looking for?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose the type of requirement
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  type="button"
                  onClick={() => handlePurposeSelect("BUY")}
                  className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border/60 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">To Buy</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Looking to purchase a property
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  type="button"
                  onClick={() => handlePurposeSelect("RENT")}
                  className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border/60 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">To Rent</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Looking for a rental property
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </div>
            </section>
          </motion.div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPurposeSelected(false)}
              className="group pl-0 hover:pl-2 transition-all hover:bg-transparent hover:text-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <Badge variant="secondary" className={`text-[10px] px-2 py-0 h-5 ${enquiryPurpose === "RENT" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
              {enquiryPurpose === "RENT" ? "For Rent" : "To Buy"}
            </Badge>
          </div>

          <PageHeader
            title={t("page_create_enquiry_title")}
            description={t("page_create_enquiry_subtitle")}
          />

          <FormProvider {...form}>
            <form
              id="create-enquiry-form"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-6 md:space-y-8 px-2 pb-2 md:pb-4"
            >

              <LocationSection isPending={isPending} />

              <PropertyDetailsSection enquiryPurpose={enquiryPurpose} />

              {enquiryPurpose === "BUY" ? (
                <BudgetSection />
              ) : (
                <RentalBudgetSection />
              )}

              <AdditionalDetailsSection />

              {/* Form Actions */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <EnquiryCreateUseCredits
                  shouldUseCredits={shouldUseCredits}
                  setShouldUseCredits={setShouldUseCredits}
                />
                <div className="w-full max-w-2xl">
                  <DisclaimerAcknowledge
                    text={DISCLAIMER_TEXT.enquiryProposal}
                    checked={isEnquiryDisclaimerAccepted}
                    onCheckedChange={setIsEnquiryDisclaimerAccepted}
                    checkboxLabel={DISCLAIMER_TEXT.acknowledgeLabel}
                    showRequiredMessage
                  />
                </div>
                <div className="inline-flex items-center bg-background/95 backdrop-blur-xl backdrop-saturate-150 border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full p-1.5 gap-2 ring-1 ring-black/5 dark:ring-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isPending}
                    className="text-muted-foreground hover:bg-muted/50 rounded-full px-4 h-9 text-sm font-medium"
                  >
                    {t("action_cancel")}
                  </Button>

                  <Button
                    type="submit"
                    className="rounded-full px-6 h-9 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 bg-primary"
                    disabled={
                      isPending ||
                      isQuotaLoading ||
                      !isEnquiryDisclaimerAccepted ||
                      (remaining?.enquiry_listing === 0 && !shouldUseCredits)
                    }
                  >
                    {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    {isPending ? t("submitting") : t("action_submit_enquiry")}
                  </Button>
                </div>
              </div>

            </form>
          </FormProvider>
        </>
      )}

      {/* Confirmation Dialog for Urgent */}
      <AlertDialog open={showUrgentConfirmation} onOpenChange={setShowUrgentConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog_mark_as_urgent_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog_mark_as_urgent_description", { credits: prices.MARK_ENQUIRY_AS_URGENT })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("action_cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSubmissionData) {
                  handleSubmission(pendingSubmissionData);
                }
              }}
            >
              {t("action_confirm_deduct")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};

export default CreateEnquiryPage;
