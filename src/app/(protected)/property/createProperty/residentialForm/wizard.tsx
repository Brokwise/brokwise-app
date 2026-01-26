"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coerceStringArray } from "@/utils/helper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { Form } from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
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
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0);
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
      propertyType: initialData?.propertyType || "FLAT",
      images: coerceStringArray(initialData?.images),
      floorPlans: coerceStringArray(initialData?.floorPlans),
      amenities: coerceStringArray(initialData?.amenities),
    },
    mode: "onChange",
  });

  const watchedPropertyType = form.watch("propertyType");
  const propertyType = watchedPropertyType || "FLAT";

  React.useEffect(() => {
    if (!watchedPropertyType) {
      form.setValue("propertyType", "FLAT", { shouldValidate: false });
    }
  }, [watchedPropertyType, form]);

  const onSubmit = async (data: ResidentialPropertyFormData, shouldUseCredits: boolean) => {
    if (onSubmitProp) {
      onSubmitProp(data);
    } else {
      try {
        setIsSubmitting(true);
        await addPropertyAsync({ property: data, shouldUseCredits });
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
    const stepRequiredFields: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "address.state",
        "address.city",
        "address.address",
        "address.pincode",
        "size",
        "sizeUnit",
        ...(propertyType === "FLAT" || propertyType == "VILLA" ? ["bhk", "washrooms"] : ["plotType"]),
        ...(propertyType === "LAND" && plotType
          ? [
            "facing",
            ...(plotType === "CORNER" ? ["sideFacing"] : []),
            "frontRoadWidth",
            ...(plotType === "CORNER" ? ["sideRoadWidth"] : []),
          ]
          : []),
        "rate",
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
          bhk: "Please select number of BHK",
          washrooms: "Please select number of washrooms",
          plotType: "Please select a plot type",
          facing: "Please select a front facing direction",
          sideFacing: "Please select a corner facing direction",
          frontRoadWidth: "Front road width is required",
          sideRoadWidth: "Side road width is required",
          rate: "Rate per unit is required",
          description: "Description is required",
          featuredMedia: "Featured media is required",
          floorPlans: propertyType === "LAND" ? "Site plan is required" : "Floor plans are required",
        };

        form.setError(field as keyof ResidentialPropertyFormData, {
          type: "required",
          message: fieldMessages[field] || `${field} is required`,
        });
      }
    }

    const schemaResult = await form.trigger(
      fieldsToValidate as (keyof ResidentialPropertyFormData)[]
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
      form.handleSubmit((data) => { onSubmit(data, shouldUseCredits) })();
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
      component: <ResidentialReview propertyType={propertyType} form={form} />,
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
