"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { coerceStringArray } from "@/utils/helper";

import { Form } from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  agriculturalPropertySchema,
  AgriculturalPropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";

import { toast } from "sonner";

import { Enquiry } from "@/models/types/enquiry";
import { AgriculturalBasicInfo } from "./steps/agricultural-basic-info";
import { AgriculturalLandSpecs } from "./steps/agricultural-land-specs";
import { AgriculturalLocation } from "./steps/agricultural-location";
import { AgriculturalLegalDocs } from "./steps/agricultural-legal-docs";
import { AgriculturalMedia } from "./steps/agricultural-media";
import AgriculturalReview from "./steps/agricultural-review";

interface AgriculturalWizardProps {
  onBack: () => void;
  initialData?: Partial<AgriculturalPropertyFormData> & { _id?: string };
  onSubmit?: (data: AgriculturalPropertyFormData) => void;
  onSaveDraft?: (data: AgriculturalPropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
  enquiry?: Enquiry;
}

export const AgriculturalWizard: React.FC<AgriculturalWizardProps> = ({
  onBack,
  initialData,
  onSubmit: onSubmitProp,
  onSaveDraft: onSaveDraftProp,
  submitLabel,
  externalIsLoading,
  enquiry,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPropertyAsync, isLoading } = useAddProperty();
  const { savePropertyAsDraft, isPending: isSavingDraft } =
    useSavePropertyAsDraft();
  const [draftId, setDraftId] = useState<string | undefined>(initialData?._id);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const form = useForm<AgriculturalPropertyFormData>({
    resolver: zodResolver(agriculturalPropertySchema),
    defaultValues: {
      propertyCategory: "AGRICULTURAL",
      propertyType: "AGRICULTURAL_LAND",
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

  const onSubmit = async (data: AgriculturalPropertyFormData) => {
    if (onSubmitProp) {
      onSubmitProp(data);
    } else {
      try {
        setIsSubmitting(true);
        await addPropertyAsync(data);
        form.reset();
        setCompletedSteps(new Set());
        setCurrentStep(0);
        router.replace("/property/createProperty/success");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit property. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepRequiredFields: { [key: number]: string[] } = {
      0: [
        "address.state",
        "address.city",
        "address.pincode",
        "address.address",
        "size",
        "sizeUnit",
        "rate",
      ],
      1: ["description", "featuredMedia", "images"],
      2: [], // Review step
    };

    const fieldsToValidate = stepRequiredFields[currentStep] || [];

    const values = form.getValues();
    let hasEmptyRequired = false;
    const emptyFields: string[] = [];

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
          "address.state": "State is required",
          "address.city": "City is required",
          "address.address": "Address is required",
          "address.pincode": "Pincode is required",
          size: "Land size is required",
          sizeUnit: "Please select a size unit",
          rate: "Rate per unit is required",
          description: "Description is required",
          featuredMedia: "Featured media is required",
          images: "At least one image is required",
        };

        form.setError(field as keyof AgriculturalPropertyFormData, {
          type: "required",
          message: fieldMessages[field] || `${field} is required`,
        });
      }
    }

    const schemaResult = await form.trigger(
      fieldsToValidate as (keyof AgriculturalPropertyFormData)[]
    );

    const isValid = schemaResult && !hasEmptyRequired;

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
          `Please fix: ${errorMessages.slice(0, 3).join(", ")}${
            errorMessages.length > 3
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

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(onSubmit)();
    } else {
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
          `Missing required fields: ${errorMessages.slice(0, 3).join(", ")}${
            errorMessages.length > 3
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
      description: "Basic info, specs & location",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Basic Information
            </h3>
            <AgriculturalBasicInfo form={form} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Land Details</h3>
            <AgriculturalLandSpecs form={form} enquiry={enquiry} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Location & Accessibility
            </h3>
            <AgriculturalLocation form={form} />
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(0),
    },
    {
      id: "media-docs",
      title: "Media & Docs",
      description: "Uploads and legal info",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <AgriculturalLegalDocs form={form} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Media & Description
            </h3>
            <AgriculturalMedia
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
      component: <AgriculturalReview form={form} />,
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
      />
    </Form>
  );
};
