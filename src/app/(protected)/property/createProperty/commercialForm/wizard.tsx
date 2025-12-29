"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PincodeInput } from "@/components/ui/pincode-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PROPERTY_LIMITS,
  coerceStringArray,
  formatIndianNumber,
  parseIntegerWithMax,
  parseRoadWidthInput,
} from "@/utils/helper";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wizard, WizardStep } from "@/components/ui/wizard";
import {
  commercialPropertySchema,
  CommercialPropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/utils/upload";
import { Loader2, Wand2Icon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { LocationPicker } from "../_components/locationPicker";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CommercialWizardProps {
  onBack: () => void;
  initialData?: Partial<CommercialPropertyFormData> & { _id?: string };
  onSubmit?: (data: CommercialPropertyFormData) => void;
  onSaveDraft?: (data: CommercialPropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
}

export const CommercialWizard: React.FC<CommercialWizardProps> = ({
  onBack,
  initialData,
  onSubmit: onSubmitProp,
  onSaveDraft: onSaveDraftProp,
  submitLabel,
  externalIsLoading,
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
  const [generatingDescription, setGeneratingDescription] = useState(false);

  // Normalize any legacy / draft payloads where arrays may come through as strings.
  const initialAmenities = coerceStringArray(initialData?.amenities);
  const initialImages = coerceStringArray(initialData?.images);
  const initialFloorPlans = coerceStringArray(initialData?.floorPlans);

  const form = useForm<CommercialPropertyFormData>({
    resolver: zodResolver(commercialPropertySchema),
    defaultValues: {
      propertyCategory: "COMMERCIAL",
      propertyType: "SHOP",
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
      images: initialImages,
      floorPlans: initialFloorPlans,
      amenities: initialAmenities,
    },
    mode: "onChange",
  });

  const propertyType = form.watch("propertyType");
  const plotType = form.watch("plotType");
  const size = form.watch("size");
  const rate = form.watch("rate");

  React.useEffect(() => {
    const calculatedPrice = (size || 0) * (rate || 0);
    if (calculatedPrice > 0) {
      form.setValue("totalPrice", calculatedPrice, { shouldValidate: true });
    }
  }, [size, rate, form]);

  const onSubmit = (data: CommercialPropertyFormData) => {
    if (onSubmitProp) {
      onSubmitProp(data);
    } else {
      (async () => {
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
      })();
    }
  };

  const handleFileUpload = async (
    files: FileList | null,
    fieldName: "featuredMedia" | "images" | "floorPlans"
  ) => {
    if (!files || files.length === 0) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const convertedFile = await convertImageToWebP(file);
        const path = generateFilePath(
          convertedFile.name,
          `property-${fieldName}`
        );
        return await uploadFileToFirebase(convertedFile, path);
      });

      const urls = await Promise.all(uploadPromises);

      if (fieldName === "featuredMedia") {
        form.setValue(fieldName, urls[0], { shouldValidate: true });
      } else {
        const currentUrls = form.getValues(fieldName) || [];
        form.setValue(fieldName, [...currentUrls, ...urls], {
          shouldValidate: true,
        });
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      toast.error(`Error uploading ${fieldName}: ${error}`);
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const removeFile = (
    fieldName: "featuredMedia" | "images" | "floorPlans",
    index?: number
  ) => {
    if (fieldName === "featuredMedia") {
      form.setValue(fieldName, "", { shouldValidate: true });
    } else {
      const currentUrls = form.getValues(fieldName) || [];
      if (typeof index === "number") {
        const newUrls = [...currentUrls];
        newUrls.splice(index, 1);
        form.setValue(fieldName, newUrls, { shouldValidate: true });
      }
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepValidations: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "address.state",
        "address.city",
        "address.pincode",
        "address.address",
      ],
      1: [
        "size",
        "sizeUnit",
        "rate",
        "totalPrice",
        ...(propertyType === "HOTEL" ? ["rooms"] : []),
        ...(propertyType === "HOSTEL" ? ["beds"] : []),
      ],
      2: [], // Location step
      3: [], // Features step
      4: ["description", "featuredMedia", "images"],
      5: [], // Review step
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const result = await form.trigger(
      fieldsToValidate as (keyof CommercialPropertyFormData)[]
    );
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => {
        const newCompleted = new Set(prev);
        newCompleted.add(currentStep);
        return newCompleted;
      });
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      // Show feedback when validation fails with specific field errors
      const errors = form.formState.errors;
      const errorMessages: string[] = [];
      
      const flattenErrors = (obj: Record<string, unknown>, prefix = ""): void => {
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
        toast.error(`Please fix: ${errorMessages.slice(0, 3).join(", ")}${errorMessages.length > 3 ? ` (+${errorMessages.length - 3} more)` : ""}`);
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
      console.log("Step validation errors:", errors);
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

  const handleGenerateDescription = async () => {
    try {
      setGeneratingDescription(true);
      const response = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ data: form.getValues() }),
      });
      const data = await response.json();
      form.setValue("description", data.description, { shouldValidate: true });
      setGeneratingDescription(false);
      toast.success("Description generated successfully");
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Error generating description");
      setGeneratingDescription(false);
    }
  };

  const handleLocationSelect = (details: {
    coordinates: [number, number];
    placeName: string;
    pincode?: string;
    context?: { id: string; text: string }[];
  }) => {
    form.setValue("location.coordinates", details.coordinates, {
      shouldValidate: true,
    });
    form.setValue("address.address", details.placeName, {
      shouldValidate: true,
    });

    // Use the extracted pincode directly if available
    if (details.pincode) {
      form.setValue("address.pincode", details.pincode, { shouldValidate: true });
    }

    if (details.context) {
      details.context.forEach((item: { id: string; text: string }) => {
        if (item.id.startsWith("region")) {
          form.setValue("address.state", item.text, { shouldValidate: true });
        }
        if (item.id.startsWith("place")) {
          form.setValue("address.city", item.text, { shouldValidate: true });
        }
        // Fallback: if pincode wasn't directly provided, try from context
        if (!details.pincode && item.id.startsWith("postcode")) {
          const numericPincode = item.text.replace(/\D/g, "").slice(0, 6);
          if (numericPincode.length === 6) {
            form.setValue("address.pincode", numericPincode, { shouldValidate: true });
          }
        }
      });
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(onSubmit)();
    } else {
      // Show feedback when validation fails with specific field errors
      const errors = form.formState.errors;
      const errorMessages: string[] = [];
      
      const flattenErrors = (obj: Record<string, unknown>, prefix = ""): void => {
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
        toast.error(`Missing required fields: ${errorMessages.slice(0, 3).join(", ")}${errorMessages.length > 3 ? ` (+${errorMessages.length - 3} more)` : ""}`);
      } else {
        toast.error("Please complete all required fields before submitting.");
      }
      console.log("Form validation errors:", errors);
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

  // Step 1: Basic Information
  const BasicInfoStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commercial Property Type</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "SHOWROOM", label: "Showroom" },
                  { value: "HOTEL", label: "Hotel" },
                  { value: "HOSTEL", label: "Hostel" },
                  { value: "SHOP", label: "Shop" },
                  { value: "OFFICE_SPACE", label: "Office Space" },
                  { value: "OTHER_SPACE", label: "Other Space" },
                ].map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    variant="selection"
                    onClick={() => field.onChange(item.value)}
                    className={cn(
                      field.value === item.value
                        ? "bg-primary text-primary-foreground"
                        : ""
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Address Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Property Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address.pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <PincodeInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter 6-digit pincode"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter complete property address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Right Column: Map */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Locate on Map</h3>
          <FormField
            control={form.control}
            name="location.coordinates"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <LocationPicker
                    value={field.value as [number, number]}
                    onChange={field.onChange}
                    onLocationSelect={handleLocationSelect}
                    className="h-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Property Specifications
  const PropertySpecsStep = (
    <div className="space-y-6">
      {/* Size and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter size"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sizeUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size Unit</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "SQ_FT", label: "Square Feet" },
                    { value: "SQ_METER", label: "Square Meter" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(item.value)}
                      className={cn(
                        field.value === item.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Floor for Showroom/Hotel */}
      {(propertyType === "SHOWROOM" || propertyType === "HOTEL") && (
        <FormField
          control={form.control}
          name="floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "Ground", label: "Ground Floor" },
                    { value: "1", label: "1st Floor" },
                    { value: "2", label: "2nd Floor" },
                    { value: "3", label: "3rd Floor" },
                    { value: "4", label: "4th Floor" },
                    { value: "5", label: "5th Floor" },
                    { value: "Custom", label: "Custom" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(item.value)}
                      className={cn(
                        field.value === item.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Hotel specific - Rooms */}
      {propertyType === "HOTEL" && (
        <FormField
          control={form.control}
          name="rooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Rooms</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="1-1000"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(parseIntegerWithMax(e.target.value, 1000))
                  }
                />
              </FormControl>
              <FormDescription>
                Required for hotel listings (minimum 1)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Hostel specific - Beds and Rooms */}
      {propertyType === "HOSTEL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Beds</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50].map(
                      (num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : "w-12"
                          )}
                        >
                          {num}
                        </Button>
                      )
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1-1000"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(parseIntegerWithMax(e.target.value, 1000))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Shop specific - Property Status */}
      {propertyType === "SHOP" && (
        <FormField
          control={form.control}
          name="propertyStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Status</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "Land", label: "Land" },
                    { value: "Constructed", label: "Constructed" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(item.value)}
                      className={cn(
                        field.value === item.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Office Space - Project Area */}
      {propertyType === "OFFICE_SPACE" && (
        <FormField
          control={form.control}
          name="projectArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Area (sq ft)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter project area"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="pt-6 border-t space-y-6">
        <h3 className="text-lg font-medium">Pricing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate per Unit (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter rate per unit"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter total price"
                    {...field}
                    disabled
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Auto-calculated based on size and rate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rental Income for Showroom/Hotel */}
        {(propertyType === "SHOWROOM" ||
          propertyType === "HOTEL" ||
          propertyType === "HOSTEL") && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rental Income (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rentalIncome.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Rental Income (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          max="2500000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Range: 0 to 25L</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentalIncome.max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Rental Income (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2500000"
                          max="2500000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Range: 0 to 25L</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

        <FormField
          control={form.control}
          name="isPriceNegotiable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Price Negotiable</FormLabel>
                <FormDescription>
                  Check if the price is open for negotiation
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Step 3: Location & Plot Details
  const LocationStep = (
    <div className="space-y-6">
      {/* Shop specific plot details */}
      {propertyType === "SHOP" && (
        <>
          <FormField
            control={form.control}
            name="plotType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot Type</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "ROAD", label: "Road Facing" },
                      { value: "CORNER", label: "Corner Plot" },
                    ].map((item) => (
                      <Button
                        key={item.value}
                        type="button"
                        variant="selection"
                        onClick={() => field.onChange(item.value)}
                        className={cn(
                          field.value === item.value
                            ? "bg-primary text-primary-foreground"
                            : ""
                        )}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Front Facing</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {["NORTH", "SOUTH", "EAST", "WEST"].map((dir) => (
                      <Button
                        key={dir}
                        type="button"
                        variant="selection"
                        onClick={() => field.onChange(dir)}
                        className={cn(
                          field.value === dir
                            ? "bg-primary text-primary-foreground"
                            : ""
                        )}
                      >
                        {dir.charAt(0) + dir.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frontRoadWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Front Road Width (in feet)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder={`Enter front road width (max ${PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)`}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseRoadWidthInput(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {plotType === "CORNER" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sideFacing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side Facing</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {["NORTH", "SOUTH", "EAST", "WEST"].map((dir) => (
                          <Button
                            key={dir}
                            type="button"
                            variant="selection"
                            onClick={() => field.onChange(dir)}
                            className={cn(
                              field.value === dir
                                ? "bg-primary text-primary-foreground"
                                : ""
                            )}
                          >
                            {dir.charAt(0) + dir.slice(1).toLowerCase()}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sideRoadWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side Road Width (in feet)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder={`Enter side road width (max ${PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH} ft)`}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(parseRoadWidthInput(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  {
    /* Purpose */
  }
  <FormField
    control={form.control}
    name="purpose"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Purpose</FormLabel>
        <FormControl>
          <Input
            placeholder={
              propertyType === "SHOWROOM"
                ? "e.g., Retail, Display, Sales"
                : propertyType === "HOTEL"
                  ? "e.g., Hospitality, Tourism, Business"
                  : "Enter purpose"
            }
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />;

  // Step 5: Features & Amenities
  const AmenitiesList = {
    HOTEL: [
      "Reception Lobby Area",
      "Daily Housekeeping",
      "On Site Dining Restaurant",
      "Conference Meeting Rooms",
      "Elevator Lift",
      "Fitness Center",
      "Spa Massage Services",
      "Laundry Service",
      "Business Center",
      "High Speed Wi Fi",
      "Parking Space",
      "Airport Shuttle",
      "Cctv Surveillance",
      "Fire Safety Equipment",
    ],
    HOSTEL: [
      "Shared Kitchen",
      "Common Lounge Area",
      "Dormitory Private Rooms",
      "Study Work Zones",
      "Lockers For Each Bed",
      "Shared Bathrooms",
      "24 7 Security",
      "Laundry Facilities",
      "Wi Fi",
      "Housekeeping",
      "Cctv Surveillance",
      "Bicycle Parking",
      "Social Activities Zone",
      "Meal Options Available",
      "Air Conditioning Fans",
    ],
    OFFICE_SPACE: [
      "Furnished Cabins Workstations",
      "Conference Meeting Rooms",
      "High Speed Internet",
      "Air Conditioning",
      "24 7 Security Surveillance",
      "Reception Front Desk",
      "Pantry Cafeteria",
      "Power Backup",
      "Printing Scanning Services",
      "Parking Area",
      "Elevator Lift",
      "Fire Safety Exit Routes",
      "Cleaning Maintenance",
      "Access Control System",
      "Networking It Support Infrastructure",
    ],
    SHOWROOM: [
      "Large Display Windows",
      "High Ceilings",
      "Air Conditioning",
      "Parking Space",
      "Security System",
      "Storage Area",
      "Restrooms",
      "Loading/Unloading Area",
      "Power Backup",
      "Fire Safety System",
    ],
    SHOP: [
      "Display Area",
      "Storage Space",
      "Shutters",
      "Power Backup",
      "Water Connection",
      "Parking Availability",
      "Security",
    ],
  };

  const FeaturesStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{propertyType} Amenities</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {AmenitiesList[propertyType as keyof typeof AmenitiesList]?.map(
                  (amenity) => (
                    <div
                      key={amenity}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <Checkbox
                        checked={
                          Array.isArray(field.value) &&
                          field.value.includes(amenity)
                        }
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          const current = Array.isArray(field.value)
                            ? field.value
                            : [];
                          const updated = isChecked
                            ? Array.from(new Set([...current, amenity]))
                            : current.filter((value) => value !== amenity);
                          field.onChange(updated);
                        }}
                      />
                      <FormLabel className="font-normal">{amenity}</FormLabel>
                    </div>
                  )
                ) || (
                    <Textarea
                      placeholder="Enter amenities"
                      {...field}
                      value={coerceStringArray(field.value).join(", ")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  )}
              </div>
            </FormControl>
            <FormDescription>Select available amenities</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Step 6: Media & Description
  const MediaStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About Property</FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  placeholder="Describe the property features, amenities, and other details"
                  className="min-h-[120px]"
                  {...field}
                />
                <Button
                  disabled={generatingDescription}
                  onClick={() => handleGenerateDescription()}
                  className="absolute bottom-2 right-2 h-8 text-sm "
                >
                  {generatingDescription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Generate Description <Wand2Icon />
                    </>
                  )}
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              Provide detailed information about the property (minimum 10
              characters)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Media Files */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Media Files</h3>

        <FormField
          control={form.control}
          name="featuredMedia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Media</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {!field.value ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        disabled={uploading["featuredMedia"]}
                        onChange={(e) =>
                          handleFileUpload(e.target.files, "featuredMedia")
                        }
                      />
                      {uploading["featuredMedia"] && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full max-w-sm aspect-video rounded-lg border overflow-hidden">
                      <Image
                        src={field.value as string}
                        alt="Featured Media"
                        className="object-cover w-full h-full"
                        width={100}
                        height={100}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeFile("featuredMedia")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploading["images"]}
                      onChange={(e) =>
                        handleFileUpload(e.target.files, "images")
                      }
                    />
                    {uploading["images"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {field.value.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg border overflow-hidden group"
                        >
                          <Image
                            src={url}
                            alt={`Property image ${index + 1}`}
                            className="object-cover w-full h-full"
                            width={100}
                            height={100}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile("images", index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floorPlans"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor Plans</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploading["floorPlans"]}
                      onChange={(e) =>
                        handleFileUpload(e.target.files, "floorPlans")
                      }
                    />
                    {uploading["floorPlans"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {field.value.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg border overflow-hidden group"
                        >
                          <Image
                            src={url}
                            alt={`Floor plan ${index + 1}`}
                            className="object-cover w-full h-full"
                            width={100}
                            height={100}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile("floorPlans", index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Step 7: Review
  const ReviewStep = (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          Review Your Commercial Property
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Property Type:</strong> {propertyType}
          </div>
          <div>
            <strong>State:</strong>{" "}
            {form.watch("address.state") || "Not provided"}
          </div>
          <div>
            <strong>City:</strong>{" "}
            {form.watch("address.city") || "Not provided"}
          </div>
          <div>
            <strong>Pincode:</strong>{" "}
            {form.watch("address.pincode") || "Not provided"}
          </div>
          <div>
            <strong>Address:</strong>{" "}
            {form.watch("address.address") || "Not provided"}
          </div>
          <div>
            <strong>Size:</strong> {form.watch("size") || "0"}{" "}
            {form.watch("sizeUnit") || ""}
          </div>
          {(propertyType === "SHOWROOM" || propertyType === "HOTEL") && (
            <div>
              <strong>Floor:</strong> {form.watch("floor") || "Not selected"}
            </div>
          )}
          <div>
            <strong>Rate:</strong> ₹
            {formatIndianNumber(form.watch("rate") || 0)}
          </div>
          <div>
            <strong>Total Price:</strong> ₹
            {formatIndianNumber(form.watch("totalPrice") || 0)}
          </div>
          {(propertyType === "SHOWROOM" ||
            propertyType === "HOTEL" ||
            propertyType === "HOSTEL") && (
              <>
                <div>
                  <strong>Min Rental Income:</strong> ₹
                  {formatIndianNumber(form.watch("rentalIncome.min") || 0)}
                </div>
                <div>
                  <strong>Max Rental Income:</strong> ₹
                  {formatIndianNumber(form.watch("rentalIncome.max") || 0)}
                </div>
              </>
            )}
          <div>
            <strong>Price Negotiable:</strong>{" "}
            {form.watch("isPriceNegotiable") ? "Yes" : "No"}
          </div>

          {propertyType === "HOSTEL" && (
            <>
              <div>
                <strong>Beds:</strong> {form.watch("beds") || "Not selected"}
              </div>
              <div>
                <strong>Rooms:</strong> {form.watch("rooms") || "Not provided"}
              </div>
            </>
          )}

          {propertyType === "SHOP" && (
            <>
              <div>
                <strong>Plot Type:</strong>{" "}
                {form.watch("plotType") || "Not selected"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {form.watch("propertyStatus") || "Not provided"}
              </div>
              <div>
                <strong>Front Facing:</strong>{" "}
                {form.watch("facing") || "Not selected"}
              </div>
              <div>
                <strong>Front Road Width:</strong>{" "}
                {form.watch("frontRoadWidth")
                  ? `${form.watch("frontRoadWidth")} ft`
                  : "Not provided"}
              </div>
              {form.watch("plotType") === "CORNER" && (
                <>
                  <div>
                    <strong>Side Facing:</strong>{" "}
                    {form.watch("sideFacing") || "Not selected"}
                  </div>
                  <div>
                    <strong>Side Road Width:</strong>{" "}
                    {form.watch("sideRoadWidth")
                      ? `${form.watch("sideRoadWidth")} ft`
                      : "Not provided"}
                  </div>
                </>
              )}
            </>
          )}

          {propertyType === "OFFICE_SPACE" && (
            <div>
              <strong>Project Area:</strong>{" "}
              {form.watch("projectArea")
                ? `${form.watch("projectArea")} sq ft`
                : "Not provided"}
            </div>
          )}

          <div>
            <strong>Purpose:</strong> {form.watch("purpose") || "Not provided"}
          </div>

          <div className="col-span-2">
            <strong>Amenities:</strong>{" "}
            {(() => {
              const amenities = form.watch("amenities");
              return Array.isArray(amenities) && amenities.length
                ? amenities.join(", ")
                : "None selected";
            })()}
          </div>

          <div className="col-span-2">
            <strong>Description:</strong>{" "}
            <p className="mt-1 text-muted-foreground">
              {form.watch("description") || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Please review all the information above. Click &apos;Create
        Property&apos; to submit your listing.
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    {
      id: "basic-info",
      title: "Basic Info",
      description: "Property type and address",
      component: BasicInfoStep,
      isCompleted: completedSteps.has(0),
    },
    {
      id: "specifications",
      title: "Specifications",
      description: "Size, pricing and property details",
      component: PropertySpecsStep,
      isCompleted: completedSteps.has(1),
    },
    {
      id: "location",
      title: "Location",
      description: "Location and accessibility",
      component: LocationStep,
      isCompleted: completedSteps.has(2),
    },
    {
      id: "features",
      title: "Features",
      description: "Amenities and special features",
      component: FeaturesStep,
      isCompleted: completedSteps.has(3),
    },
    {
      id: "media",
      title: "Media",
      description: "Photos, videos, and description",
      component: MediaStep,
      isCompleted: completedSteps.has(4),
    },
    {
      id: "review",
      title: "Review",
      description: "Review and submit",
      component: ReviewStep,
      isCompleted: completedSteps.has(5),
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
