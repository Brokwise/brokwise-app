"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coerceStringArray, coerceFloorPlanDocs } from "@/utils/helper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { Form, FormStepValidationProvider } from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import { useWizardStepValidation } from "@/hooks/useWizardStepValidation";
import {
  residentialPropertySchema,
  ResidentialPropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";

import { toast } from "sonner";

import { Enquiry } from "@/models/types/enquiry";
import { ResidentialBasicInfo } from "./steps/residential-basic-info";
import { ResidentialProperySpecs } from "./steps/residential-property-specs";
import ResidentialReview from "./steps/residential-review";
import { ResidentialMedia } from "./steps/residential-media";
import { ResidentialFeatures } from "./steps/residential-features";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface ResidentialWizardProps {
  onBack: () => void;
  initialData?: Partial<ResidentialPropertyFormData> & { _id?: string };
  onSubmit?: (data: ResidentialPropertyFormData) => void;
  onSaveDraft?: (data: ResidentialPropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
  enquiry?: Enquiry;
  draftCount?: number;
  isEditingDraft?: boolean;
  listingPurpose?: "SALE" | "RENT";
}

export const ResidentialWizard: React.FC<ResidentialWizardProps> = ({
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
  const { t } = useTranslation();
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0);
  const { stepValidationAttempted, onValidationFailed } = useWizardStepValidation(currentStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPropertyAsync, isLoading } = useAddProperty();
  const { savePropertyAsDraft, isPending: isSavingDraft } =
    useSavePropertyAsDraft();
  const [draftId, setDraftId] = useState<string | undefined>(initialData?._id);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const form = useForm<ResidentialPropertyFormData>({
    resolver: zodResolver(residentialPropertySchema),
    defaultValues: {
      propertyCategory: "RESIDENTIAL",
      listingPurpose: listingPurpose,
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
      roadWidthUnit: "FEET",
      ...initialData,
      propertyType: initialData?.propertyType || "FLAT",
      images: coerceStringArray(initialData?.images),
      floorPlans: coerceFloorPlanDocs(initialData?.floorPlans),
      amenities: coerceStringArray(initialData?.amenities),
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setValue("listingPurpose", listingPurpose, { shouldValidate: false });
  }, [listingPurpose, form]);

  const watchedPropertyType = form.watch("propertyType");
  const propertyType = watchedPropertyType || "FLAT";

  React.useEffect(() => {
    if (!watchedPropertyType) {
      form.setValue("propertyType", "FLAT", { shouldValidate: false });
    }
  }, [watchedPropertyType, form]);

  const onSubmit = async (data: ResidentialPropertyFormData, shouldUseCredits: boolean) => {
    if (!data.featuredMedia && data.images && data.images.length > 0) {
      data.featuredMedia = data.images[0];
    }
    const { _id, ...propertyData } = data;
    if (onSubmitProp) {
      onSubmitProp(data);
    } else {
      try {
        setIsSubmitting(true);
        await addPropertyAsync({ property: propertyData as ResidentialPropertyFormData, shouldUseCredits });
        form.reset();
        setCompletedSteps(new Set());
        setCurrentStep(0);
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] })
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

  const plotType = form.watch("plotType");

  useEffect(() => {
    if (currentStep === 2 && !propertyType) {
      setCurrentStep(0);
    }
  }, [currentStep, propertyType]);

  const validateCurrentStep = async (): Promise<boolean> => {
    const isRentMedia = listingPurpose === "RENT";
    const mediaStepFields = isRentMedia
      ? ["description", "images"]
      : propertyType === "LAND"
        ? ["description", "floorPlans"]
        : ["description", "featuredMedia", "floorPlans"];

    const isRent = listingPurpose === "RENT";
    const pricingFields = isRent
      ? ["monthlyRent", "securityDeposit", "agreementDuration"]
      : ["rate"];

    const stepRequiredFields: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "location.coordinates",
        "address.state",
        "address.city",
        "address.address",
        "address.pincode",
        "size",
        "sizeUnit",
        ...(propertyType === "FLAT" || propertyType === "VILLA"
          ? ["bhk", "washrooms"]
          : ["plotType"]),
        ...(propertyType === "LAND" && plotType
          ? [
            "facing",
            ...(plotType === "CORNER" ? ["sideFacing"] : []),
            "frontRoadWidth",
            ...(plotType === "CORNER" ? ["sideRoadWidth"] : []),
          ]
          : []),
        ...pricingFields,
      ],
      1: mediaStepFields,
      2: [],
    };

    const fieldsToValidate = stepRequiredFields[currentStep] || [];

    const values = form.getValues();
    let hasEmptyRequired = false;
    const emptyFields: string[] = [];

    const fieldMessages: Record<string, string> = {
      propertyType: "Please select a property type",
      "location.coordinates": "Please select a property location",
      "address.state": "State is required",
      "address.city": "City is required",
      "address.address": "Address is required",
      "address.pincode": "Pincode is required",
      size: "Property size is required",
      sizeUnit: "Please select a size unit",
      bhk: "Please select number of BHK",
      washrooms: "Please select number of washrooms",
      plotType: "Please select plot access type (single-side or corner)",
      facing: "Please select a front facing direction",
      sideFacing: "Please select a corner facing direction",
      frontRoadWidth: "Front road width is required",
      sideRoadWidth: "Side road width is required",
      rate: "Rate per unit is required",
      monthlyRent: "Monthly rent is required",
      securityDeposit: "Security deposit is required",
      agreementDuration: "Agreement duration is required",
      description: "Description is required",
      images: "At least one image is required",
      featuredMedia:
        propertyType === "LAND" || isRentMedia
          ? "Featured media is optional"
          : "Featured media is required",
      floorPlans: isRentMedia ? "Documents are optional for rentals" : "Documents are required",
    };

    for (const field of fieldsToValidate) {
      const parts = field.split(".");
      let value: unknown = values;
      for (const part of parts) {
        value = (value as Record<string, unknown>)?.[part];
      }

      const isZeroCoords =
        field === "location.coordinates" &&
        Array.isArray(value) &&
        value.every((v) => v === 0);
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        value === 0 ||
        (Array.isArray(value) && value.length === 0) ||
        isZeroCoords;

      if (isEmpty) {
        hasEmptyRequired = true;
        emptyFields.push(field);
      }
    }

    const schemaResult = await form.trigger(
      fieldsToValidate as (keyof ResidentialPropertyFormData)[]
    );

    for (const field of emptyFields) {
      form.setError(field as keyof ResidentialPropertyFormData, {
        type: "required",
        message: fieldMessages[field] || `${field} is required`,
      });
    }

    const isValid = schemaResult && !hasEmptyRequired;

    if (!isValid) {
      onValidationFailed();
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
    console.log("isValid", isValid);
    if (isValid) {
      form.handleSubmit((data) => { console.log("data", data); onSubmit(data, shouldUseCredits) })();
    } else {
      console.log("errors", form.formState.errors);
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
      const savedProperty = await savePropertyAsDraft(payload);
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
      title: t("wizard_step_property_details"),
      description: t("wizard_step_property_details_desc"),
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t("wizard_basic_info")}
            </h3>
            {<ResidentialBasicInfo form={form} enquiry={enquiry} />}
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t("wizard_specs_pricing")}
            </h3>
            {
              <ResidentialProperySpecs
                enquiry={enquiry}
                form={form}
                propertyType={propertyType}
                listingPurpose={listingPurpose}
              />
            }
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(0),
    },
    {
      id: "features-media",
      title: t("wizard_step_features_media"),
      description: t("wizard_step_features_media_desc"),
      component: (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t("wizard_features_amenities")}
            </h3>
            {<ResidentialFeatures propertyType={propertyType} form={form} />}
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              {t("wizard_media_description")}
            </h3>
            {
              <ResidentialMedia
                form={form}
                setUploading={setUploading}
                uploading={uploading}
                propertyType={propertyType}
                listingPurpose={listingPurpose}
              />
            }
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(1),
    },
    {
      id: "review",
      title: t("wizard_step_review"),
      description: t("wizard_step_review_desc"),
      component: <ResidentialReview propertyType={propertyType} form={form} isEnquiry={enquiry !== undefined} />,
      isCompleted: completedSteps.has(2),
    },
  ];

  return (
    <FormStepValidationProvider value={stepValidationAttempted}>
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
    </FormStepValidationProvider>
  );
};
