
"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { useCredits } from "@/hooks/useCredits";
import { CREDITS_PRICE } from "@/config/tier_limits";
import { useQueryClient } from "@tanstack/react-query";

import { createEnquirySchema, CreateEnquiryFormValues, BUDGET_MIN, BUDGET_MAX } from "@/models/schemas/enquirySchema";
import LocationSection from "./_components/LocationSection";
import PropertyDetailsSection from "./_components/PropertyDetailsSection";
import BudgetSection from "./_components/BudgetSection";
import AdditionalDetailsSection from "./_components/AdditionalDetailsSection";


const CreateEnquiryPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { companyData } = useApp();
  const { createEnquiry, isPending: isBrokerPending } = useCreateEnquiry();
  const { createEnquiry: createCompanyEnquiry, isPending: isCompanyPending } =
    useCreateCompanyEnquiry();
  const { balance } = useCredits();
  const queryClient = useQueryClient();

  const isPending = companyData ? isCompanyPending : isBrokerPending;
  const [showUrgentConfirmation, setShowUrgentConfirmation] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] =
    useState<CreateEnquiryFormValues | null>(null);

  const form = useForm<CreateEnquiryFormValues>({
    resolver: zodResolver(createEnquirySchema) as any,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mode: "onBlur", // Changed to onBlur for less noisy validation
    defaultValues: {
      locationMode: "search",
      isCompany: false,
      address: "",
      addressPlaceId: "",
      city: "",
      localities: [],
      budget: { min: BUDGET_MIN, max: BUDGET_MAX },
      description: "",
      urgent: false,
    },
  });

  const { reset, setValue, watch, handleSubmit } = form;
  const selectedCategory = watch("enquiryCategory");

  // Sync isCompany
  useEffect(() => {
    setValue("isCompany", !!companyData);
  }, [companyData, setValue]);


  // Reset type-specific fields when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    // We clear these to avoid sending incompatible data to backend
    const fieldsToReset: (keyof CreateEnquiryFormValues)[] = [
      "enquiryType", "size", "plotType", "facing",
      "frontRoadWidth", "bhk", "washrooms", "preferredFloor",
      "society", "rooms", "beds", "rentalIncome", "purpose", "areaType",
      "isCorner", "roadFacingSides", "roadWidths"
    ];

    fieldsToReset.forEach(field => {
      // @ts-ignore - straightforward reset
      setValue(field, undefined, { shouldValidate: false });
    });

  }, [selectedCategory, setValue]);


  const handleSubmission = (data: CreateEnquiryFormValues) => {
    // Transform to DTO
    const payload: Record<string, unknown> = {
      ...data,
    };
    // Remove internal flags
    delete payload.addressPlaceId;
    delete payload.locationMode;
    delete payload.isCompany;
    delete payload.isCorner; // internal UI flag, though we send specific corner fields

    // If NOT corner, ensure we don't send corner specific trash data if it lingered
    if (!data.isCorner) {
      delete payload.roadFacingSides;
      delete payload.roadWidths;
    }

    const finalPayload = payload as unknown as CreateEnquiryDTO;

    const onSuccess = () => {
      toast.success("Enquiry created successfully!");
      reset();
      router.replace("/enquiries/create/success");
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    };

    const onError = (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create enquiry");
    };

    if (companyData) {
      createCompanyEnquiry(finalPayload, { onSuccess, onError });
    } else {
      createEnquiry(finalPayload, { onSuccess, onError });
    }
  };

  const onSubmit = (data: CreateEnquiryFormValues) => {
    if (data.urgent) {
      if (balance < CREDITS_PRICE.MARK_ENQUIRY_AS_URGENT) {
        toast.error("Insufficient credits to mark as Urgent");
        return;
      }
      setPendingSubmissionData(data);
      setShowUrgentConfirmation(true);
    } else {
      handleSubmission(data);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("Form Errors:", errors);
    toast.error("Please fill in all required fields and correct errors.");
  };

  return (
    <PageShell>
      <PageHeader
        title={t("page_create_enquiry_title")}
        description={t("page_create_enquiry_subtitle")}
      />

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 md:space-y-8 pb-6">

          <LocationSection isPending={isPending} />

          <PropertyDetailsSection />

          <BudgetSection />

          <AdditionalDetailsSection />

          {/* Sticky Footer Action */}
          <div className="sticky bottom-6 z-40 px-4 pb-0 flex justify-center pointer-events-none mt-8">
            {/* Floating Island Container - Smaller & Compact */}
            <div className="inline-flex items-center bg-background/90 backdrop-blur-xl backdrop-saturate-150 border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full p-1.5 gap-2 pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">
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
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {isPending ? t("submitting") : t("action_submit_enquiry")}
              </Button>
            </div>
          </div>

        </form>
      </FormProvider>

      {/* Confirmation Dialog for Urgent */}
      <AlertDialog open={showUrgentConfirmation} onOpenChange={setShowUrgentConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Urgent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deduct {CREDITS_PRICE.MARK_ENQUIRY_AS_URGENT} credits from your wallet.
              Urgent enquiries get higher visibility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSubmissionData) {
                  handleSubmission(pendingSubmissionData);
                }
              }}
            >
              Confirm & Deduct
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};

export default CreateEnquiryPage;
