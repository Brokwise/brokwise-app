"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coerceStringArray } from "@/utils/helper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  commercialPropertySchema,
  CommercialPropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";

import { toast } from "sonner";

import { Enquiry } from "@/models/types/enquiry";
import { CommercialBasicInfo } from "./steps/commercial-basic-info";
import { CommercialPropertySpecs } from "./steps/commercial-property-specs";
import { CommercialFeatures } from "./steps/commercial-features";
import { CommercialMedia } from "./steps/commercial-media";
import { CommercialReview } from "./steps/commercial-review";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type CommercialPropertyType =
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE";

interface CommercialWizardProps {
  onBack: () => void;
  initialData?: Partial<CommercialPropertyFormData> & { _id?: string };
  onSubmit?: (data: CommercialPropertyFormData) => void;
  onSaveDraft?: (data: CommercialPropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
  enquiry?: Enquiry;
  draftCount?: number;
  isEditingDraft?: boolean;
  listingPurpose?: "SALE" | "RENT";
}

export const CommercialWizard: React.FC<CommercialWizardProps> = ({
  onBack,
  initialData,
  onSubmit: onSubmitProp,
  onSaveDraft: onSaveDraftProp,
  submitLabel,
  externalIsLoading,
  enquiry,
  draftCount,
  isEditingDraft,
  listingPurpose = "SALE",
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

  const form = useForm<CommercialPropertyFormData>({
    resolver: zodResolver(commercialPropertySchema),
    defaultValues: {
      propertyCategory: "COMMERCIAL",
      listingPurpose: listingPurpose,
      address: {
        state: "",
        city: "",
        address: "",
        pincode: "",
      },
      rentalIncome: {
        min: 0,
        max: 0,
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
      roadWidthUnit: "FEET",
      ...initialData,
      propertyType: initialData?.propertyType || "SHOP",
      images: coerceStringArray(initialData?.images),
      floorPlans: coerceStringArray(initialData?.floorPlans),
      amenities: coerceStringArray(initialData?.amenities),
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setValue("listingPurpose", listingPurpose, { shouldValidate: false });
  }, [listingPurpose, form]);

  const watchedPropertyType = form.watch("propertyType");
  const propertyType = (watchedPropertyType ||
    "SHOP") as CommercialPropertyType;
  const plotType = form.watch("plotType");

  React.useEffect(() => {
    if (!watchedPropertyType) {
      form.setValue("propertyType", "SHOP", { shouldValidate: false });
    }
  }, [watchedPropertyType, form]);

  const onSubmit = async (data: CommercialPropertyFormData, shouldUseCredits: boolean) => {
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

  useEffect(() => {
    if (currentStep === 2 && !propertyType) {
      setCurrentStep(0);
    }
  }, [currentStep, propertyType]);

  const validateCurrentStep = async (): Promise<boolean> => {
    const isRent = listingPurpose === "RENT";
    const pricingFields = isRent
      ? ["monthlyRent", "securityDeposit", "agreementDuration"]
      : ["rate"];

    const stepRequiredFields: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "address.state",
        "address.city",
        "address.address",
        "address.pincode",
        "size",
        "sizeUnit",
        ...(propertyType === "HOTEL" ? ["rooms", "floor"] : []),
        ...(propertyType === "HOSTEL" ? ["beds", "rooms"] : []),
        ...(propertyType === "SHOWROOM" ? ["floor"] : []),
        ...(propertyType === "SHOP"
          ? ["propertyStatus", "plotType", "facing", "frontRoadWidth"]
          : []),
        ...(propertyType === "SHOP" && plotType === "CORNER"
          ? ["sideFacing", "sideRoadWidth"]
          : []),
        ...(propertyType === "OFFICE_SPACE" ? ["projectArea"] : []),
        "purpose",
        ...pricingFields,
      ],
      1: ["description", "featuredMedia", "floorPlans"],
      2: [],
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
          propertyType: "Please select a property type",
          "address.state": "State is required",
          "address.city": "City is required",
          "address.address": "Address is required",
          "address.pincode": "Pincode is required",
          size: "Property size is required",
          sizeUnit: "Please select a size unit",
          floor: "Please select a floor",
          rooms: "Number of rooms is required",
          beds: "Please select number of beds",
          propertyStatus: "Please select property status",
          plotType: "Please select plot access type (single-side or corner)",
          facing: "Please select front facing direction",
          frontRoadWidth: "Front road width is required",
          sideFacing: "Please select side facing direction",
          sideRoadWidth: "Side road width is required",
          projectArea: "Project area is required",
          purpose: "Purpose is required",
          rate: "Rate per unit is required",
          description: "Description is required",
          featuredMedia: "Featured media is required",
          floorPlans: "Floor plans are required",
        };

        form.setError(field as keyof CommercialPropertyFormData, {
          type: "required",
          message: fieldMessages[field] || `${field} is required`,
        });
      }
    }

    const schemaResult = await form.trigger(
      fieldsToValidate as (keyof CommercialPropertyFormData)[]
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
      description: "Basic info, specs and pricing",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Basic Information
            </h3>
            <CommercialBasicInfo form={form} enquiry={enquiry} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Specifications & Pricing
            </h3>
            <CommercialPropertySpecs
              enquiry={enquiry}
              form={form}
              propertyType={propertyType}
              listingPurpose={listingPurpose}
            />
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(0),
    },
    {
      id: "features-media",
      title: "Features & Media",
      description: "Amenities, photos and description",
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Features & Amenities
            </h3>
            <CommercialFeatures propertyType={propertyType} form={form} />
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Media & Description
            </h3>
            <CommercialMedia
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
      component: <CommercialReview propertyType={propertyType} form={form} isEnquiry={enquiry !== undefined} />,
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
