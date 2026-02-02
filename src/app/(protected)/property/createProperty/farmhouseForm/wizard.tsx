"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { coerceStringArray } from "@/utils/helper";

import { Form } from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  farmHousePropertySchema,
  FarmHousePropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";

import { toast } from "sonner";

import { Enquiry } from "@/models/types/enquiry";
import { FarmhouseBasicInfo } from "./steps/farmhouse-basic-info";
import { FarmhousePropertySpecs } from "./steps/farmhouse-property-specs";
import { FarmhouseFeatures } from "./steps/farmhouse-features";
import { FarmhouseMedia } from "./steps/farmhouse-media";
import FarmhouseReview from "./steps/farmhouse-review";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface FarmHouseWizardProps {
  onBack: () => void;
  initialData?: Partial<FarmHousePropertyFormData> & { _id?: string };
  onSubmit?: (data: FarmHousePropertyFormData) => void;
  onSaveDraft?: (data: FarmHousePropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
  enquiry?: Enquiry;
  draftCount?: number;
  isEditingDraft?: boolean;
}

export const FarmHouseWizard: React.FC<FarmHouseWizardProps> = ({
  onBack,
  initialData,
  onSubmit: onSubmitProp,
  onSaveDraft: onSaveDraftProp,
  submitLabel,
  externalIsLoading,
  enquiry,
  draftCount,
  isEditingDraft,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPropertyAsync, isLoading } = useAddProperty();
  const { savePropertyAsDraft, isPending: isSavingDraft } =
    useSavePropertyAsDraft();
  const [draftId, setDraftId] = useState<string | undefined>(initialData?._id);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const form = useForm<FarmHousePropertyFormData>({
    resolver: zodResolver(farmHousePropertySchema),
    defaultValues: {
      propertyCategory: "FARM_HOUSE",
      propertyType: "FARM_HOUSE",
      address: {
        state: "",
        city: "",
        address: "",
        pincode: "",
      },
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      featuredMedia: "",
      ...initialData,
      images: coerceStringArray(initialData?.images),
      floorPlans: coerceStringArray(initialData?.floorPlans),
      amenities: coerceStringArray(initialData?.amenities),
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FarmHousePropertyFormData, shouldUseCredits: boolean) => {
    if (onSubmitProp) {
      onSubmitProp(data);
    } else {
      try {
        setIsSubmitting(true);
        await addPropertyAsync({ property: data, shouldUseCredits });
        form.reset();
        setCompletedSteps(new Set());
        setCurrentStep(0);
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        router.replace("/property/createProperty/success");
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to create property"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepRequiredFields: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "address.state",
        "address.city",
        "address.pincode",
        "address.address",
        "propertyStatus",
        "size",
        "sizeUnit",
        "rate",
      ],
      1: ["description", "featuredMedia", "floorPlans"],
      2: [], // Review step - no validation needed
    };

    const fieldsToValidate = stepRequiredFields[currentStep] || [];

    const values = form.getValues();
    let hasEmptyRequired = false;
    const emptyFields: string[] = [];

    // Check for empty required fields
    for (const field of fieldsToValidate) {
      const parts = field.split(".");
      let value: unknown = values;
      for (const part of parts) {
        value = (value as Record<string, unknown>)?.[part];
      }

      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        value === 0 ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        hasEmptyRequired = true;
        emptyFields.push(field);

        const fieldMessages: Record<string, string> = {
          propertyType: "Please select a property type",
          "address.state": "State is required",
          "address.city": "City is required",
          "address.address": "Address is required",
          "address.pincode": "Pincode is required",
          propertyStatus: "Property status is required",
          size: "Property area is required",
          sizeUnit: "Please select an area unit",
          rate: "Rate per unit is required",
          description: "Description is required",
          featuredMedia: "Featured media is required",
          floorPlans: "Floor plans are required",
        };

        form.setError(field as keyof FarmHousePropertyFormData, {
          type: "required",
          message: fieldMessages[field] || `${field} is required`,
        });
      }
    }

    // Also run schema validation
    const schemaResult = await form.trigger(
      fieldsToValidate as (keyof FarmHousePropertyFormData)[]
    );

    const isValid = schemaResult && !hasEmptyRequired;

    // Scroll to first error field
    if (!isValid) {
      const errors = form.formState.errors;
      const firstErrorField =
        emptyFields[0] ||
        fieldsToValidate.find((field) => {
          const parts = field.split(".");
          let error: unknown = errors;
          for (const part of parts) {
            error = (error as Record<string, unknown>)?.[part];
          }
          return !!error;
        });

      if (firstErrorField) {
        const fieldName = firstErrorField.replace(/\./g, "-");
        const element =
          document.querySelector(`[name="${firstErrorField}"]`) ||
          document.querySelector(`[data-field="${firstErrorField}"]`) ||
          document.getElementById(fieldName);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          if (element instanceof HTMLElement && "focus" in element) {
            setTimeout(() => (element as HTMLElement).focus(), 300);
          }
        }
      }
    }

    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set([...Array.from(prev), currentStep]));
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      // Show feedback when validation fails with specific field errors
      const errors = form.formState.errors;
      const errorMessages: string[] = [];

      const flattenErrors = (
        obj: Record<string, unknown>,
        prefix = ""
      ): void => {
        for (const key in obj) {
          const value = obj[key] as Record<string, unknown>;
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (value?.message && typeof value.message === "string") {
            errorMessages.push(value.message);
          } else if (typeof value === "object" && value !== null) {
            flattenErrors(value, fullKey);
          }
        }
      };

      flattenErrors(errors as Record<string, unknown>);

      if (errorMessages.length > 0) {
        toast.error(
          `Please fix: ${errorMessages.slice(0, 3).join(", ")}${errorMessages.length > 3
            ? ` (+${errorMessages.length - 3} more)`
            : ""
          }`
        );
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("Step validation errors:", errors);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async (shouldUseCredits: boolean) => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit((data) => onSubmit(data, shouldUseCredits))();
    } else {
      // Show feedback when validation fails with specific field errors
      const errors = form.formState.errors;
      const errorMessages: string[] = [];

      const flattenErrors = (
        obj: Record<string, unknown>,
        prefix = ""
      ): void => {
        for (const key in obj) {
          const value = obj[key] as Record<string, unknown>;
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (value?.message && typeof value.message === "string") {
            errorMessages.push(value.message);
          } else if (typeof value === "object" && value !== null) {
            flattenErrors(value, fullKey);
          }
        }
      };

      flattenErrors(errors as Record<string, unknown>);

      if (errorMessages.length > 0) {
        toast.error(
          `Missing required fields: ${errorMessages.slice(0, 3).join(", ")}${errorMessages.length > 3
            ? ` (+${errorMessages.length - 3} more)`
            : ""
          }`
        );
      } else {
        toast.error("Please complete all required fields before submitting.");
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("Form validation errors:", errors);
      }
    }
  };

  const handleSaveDraft = async () => {
    const data = form.getValues();

    if (onSaveDraftProp) {
      onSaveDraftProp(data);
      return;
    }

    const payload = { ...data, _id: draftId };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedProperty = await savePropertyAsDraft(payload as any);
      if (savedProperty?._id) {
        setDraftId(savedProperty._id);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const steps: WizardStep[] = [
    {
      id: "property-details",
      title: "Property Details",
      description: "Basic info, specs & pricing",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Basic Information
            </h3>
            <FarmhouseBasicInfo form={form} enquiry={enquiry} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Specifications & Pricing
            </h3>
            <FarmhousePropertySpecs form={form} enquiry={enquiry} />
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(0),
    },
    {
      id: "features-media",
      title: "Features & Media",
      description: "Location, amenities and photos",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <FarmhouseFeatures form={form} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Media & Description
            </h3>
            <FarmhouseMedia
              form={form}
              setUploading={setUploading}
              uploading={uploading}
            />
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(1),
    },
    {
      id: "review",
      title: "Review",
      description: "Review and submit",
      component: <FarmhouseReview form={form} isEnquiry={enquiry !== undefined} />,
      isCompleted: completedSteps.has(2),
    },
  ];

  return (
    <Form {...form}>
      <Wizard
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onStepClick={handleStepClick}
        onCancel={onBack}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        canProceed={!Object.values(uploading).some(Boolean)}
        isLoading={externalIsLoading ?? isLoading}
        isSubmitting={isSubmitting}
        draftCount={draftCount}
        isEditingDraft={isEditingDraft}
      />
    </Form>
  );
};
