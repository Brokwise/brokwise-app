"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { coerceStringArray, formatIndianNumber } from "@/utils/helper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { PincodeInput } from "@/components/ui/pincode-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
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
  residentialPropertySchema,
  ResidentialPropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/utils/upload";
import {
  Building2,
  House,
  LandPlot,
  Loader2,
  Wand2Icon,
  X,
  Wind,
  Bath,
  Archive,
  Fan,
  Snowflake,
  Coffee,
  CarFront,
  Users,
  Video,
  Utensils,
  BatteryCharging,
  Shield,
  Sofa,
  Waves,
  Gamepad2,
  Martini,
  Armchair,
  Bell,
  Dumbbell,
  Film,
  Droplets,
  Flower2,
  ShieldCheck,
  Sun,
  Wifi,
  User,
  Dog,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { LocationPicker } from "../_components/locationPicker";
import { cn } from "@/lib/utils";
import { Enquiry } from "@/models/types/enquiry";
import { AmenitiesSelector } from "@/components/property/amenities-selector";

interface ResidentialWizardProps {
  onBack: () => void;
  initialData?: Partial<ResidentialPropertyFormData> & { _id?: string };
  onSubmit?: (data: ResidentialPropertyFormData) => void;
  onSaveDraft?: (data: ResidentialPropertyFormData) => void;
  submitLabel?: string;
  externalIsLoading?: boolean;
  enquiry?: Enquiry;
}

const FLAT_AMENITIES = [
  { label: "Balcony", icon: Wind },
  { label: "Attached Washroom", icon: Bath },
  { label: "Cupboard", icon: Archive },
  { label: "Desert Cooler", icon: Fan },
  { label: "Air Conditioning", icon: Snowflake },
  { label: "Cafeteria", icon: Coffee },
  { label: "Car Parking", icon: CarFront },
  { label: "Club House", icon: Users },
  { label: "High Security (CCTV)", icon: Video },
  { label: "Modular Kitchen", icon: Utensils },
  { label: "Power Backup", icon: BatteryCharging },
  { label: "Security Guard", icon: Shield },
  { label: "Semi Furnished", icon: Sofa },
  { label: "Swimming Pool", icon: Waves },
  { label: "Wooden Wardroom", icon: Archive },
  { label: "Children Play Area", icon: Gamepad2 },
  { label: "CLUB & LOUNGE", icon: Martini },
  { label: "Fully Furnished", icon: Armchair },
  { label: "Fire Alarm System", icon: Bell },
  { label: "Gym", icon: Dumbbell },
  { label: "MULTIPLEX", icon: Film },
  { label: "Rain Water Harvesting", icon: Droplets },
];

const VILLA_AMENITIES = [
  { label: "Private Swimming Pool", icon: Waves },
  { label: "Garden Lawn", icon: Flower2 },
  { label: "Private Parking", icon: CarFront },
  { label: "Fully Equipped Kitchen", icon: Utensils },
  { label: "Barbecue Area", icon: Flame }, // Flame/FirePit
  { label: "Security System", icon: ShieldCheck },
  { label: "Terrace Balcony", icon: Sun },
  { label: "Furnished Interiors", icon: Sofa },
  { label: "Air Conditioning", icon: Snowflake },
  { label: "Wi Fi", icon: Wifi },
  { label: "Power Backup", icon: BatteryCharging },
  { label: "Staff Quarters", icon: User },
  { label: "Pet Friendly", icon: Dog },
  { label: "Jacuzzi Spa", icon: Bath },
  { label: "Fire Pit", icon: Flame },
];

export const ResidentialWizard: React.FC<ResidentialWizardProps> = ({
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
  const [generatingDescription, setGeneratingDescription] = useState(false);
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
      // Ensure propertyType is never undefined (fallback after spread)
      propertyType: initialData?.propertyType || "FLAT",
      images: coerceStringArray(initialData?.images),
      floorPlans: coerceStringArray(initialData?.floorPlans),
      amenities: coerceStringArray(initialData?.amenities),
    },
    mode: "onChange",
  });

  const watchedPropertyType = form.watch("propertyType");
  const propertyType = watchedPropertyType || "FLAT";
  const size = form.watch("size");
  const rate = form.watch("rate");

  // Ensure propertyType is always set in the form
  React.useEffect(() => {
    if (!watchedPropertyType) {
      form.setValue("propertyType", "FLAT", { shouldValidate: false });
    }
  }, [watchedPropertyType, form]);

  React.useEffect(() => {
    const calculatedPrice = (size || 0) * (rate || 0);
    if (calculatedPrice > 0) {
      form.setValue("totalPrice", calculatedPrice, { shouldValidate: true });
    }
  }, [size, rate, form]);

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

  const onSubmit = async (data: ResidentialPropertyFormData) => {
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

  useEffect(() => {
    if (currentStep === 2 && !propertyType) {
      setCurrentStep(0);
    }
  }, [currentStep, propertyType]);

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepValidations: { [key: number]: string[] } = {
      0: [
        "propertyType",
        "address.state",
        "address.city",
        "address.address",
        "address.pincode",
        ...(propertyType === "FLAT"
          ? ["size", "sizeUnit", "bhk", "washrooms"]
          : ["size", "sizeUnit", "plotType", "facing", "frontRoadWidth"]),
        "rate",
        "totalPrice",
      ],
      1: ["description", "featuredMedia", "images"],
      2: [], // Review step
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const result = await form.trigger(
      fieldsToValidate as (keyof ResidentialPropertyFormData)[]
    );
    return result;
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

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      form.handleSubmit(onSubmit)();
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
      form.setValue("address.pincode", details.pincode, {
        shouldValidate: true,
      });
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
            form.setValue("address.pincode", numericPincode, {
              shouldValidate: true,
            });
          }
        }
      });
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
            <FormLabel>Property Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "FLAT", label: "Flat/Apartment", icon: House },
                    { value: "VILLA", label: "Villa", icon: Building2 },
                    { value: "LAND", label: "Land", icon: LandPlot },
                  ].map((item) => {
                    const isDisabled =
                      enquiry && enquiry.enquiryType !== item.value;
                    return (
                      <Button
                        key={item.value}
                        type="button"
                        variant="selection"
                        disabled={isDisabled}
                        onClick={() => field.onChange(item.value)}
                        className={cn(
                          field.value === item.value
                            ? "bg-primary text-primary-foreground"
                            : "",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </FormControl>
            </Select>
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
                <NumberInput
                  placeholder="Enter size"
                  {...field}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
              {enquiry?.size &&
                field.value &&
                (field.value < enquiry.size.min ||
                  field.value > enquiry.size.max) && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Enquiry size range: {enquiry.size.min} -{" "}
                      {enquiry.size.max}.
                    </span>
                  </div>
                )}
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
                  {(propertyType === "FLAT"
                    ? [
                        { value: "SQ_FT", label: "Square Feet" },
                        { value: "SQ_METER", label: "Square Meter" },
                      ]
                    : [
                        { value: "SQ_FT", label: "Square Feet" },
                        { value: "SQ_YARDS", label: "Square Yards" },
                        { value: "ACRES", label: "Acres" },
                        { value: "BIGHA", label: "Bigha" },
                        { value: "SQ_METER", label: "Square Meter" },
                        { value: "HECTARE", label: "Hectare" },
                      ]
                  ).map((item) => (
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

      {/* FLAT Specific */}
      {propertyType === "FLAT" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bhk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BHK</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : ""
                          )}
                        >
                          {num} BHK
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {enquiry?.bhk &&
                    field.value &&
                    field.value !== enquiry.bhk && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Enquiry requirement is {enquiry.bhk} BHK. You selected{" "}
                          {field.value} BHK.
                        </span>
                      </div>
                    )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="washrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Washrooms</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="selection"
                          onClick={() => field.onChange(num)}
                          className={cn(
                            field.value === num
                              ? "bg-primary text-primary-foreground"
                              : "w-10"
                          )}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {enquiry?.washrooms &&
                    field.value &&
                    field.value !== enquiry.washrooms && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          Enquiry requirement is {enquiry.washrooms} Washrooms.
                          You selected {field.value} Washrooms.
                        </span>
                      </div>
                    )}
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="society"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Society Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter society name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Area (sq ft)</FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="Enter project area"
                    {...field}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* VILLA/LAND Specific */}
      {(propertyType === "VILLA" || propertyType === "LAND") && (
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
                  ].map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant="selection"
                      onClick={() => field.onChange(type.value)}
                      className={cn(
                        field.value === type.value
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
              {enquiry?.plotType &&
                field.value &&
                field.value !== enquiry.plotType && (
                  <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Enquiry requires {enquiry.plotType}. You selected{" "}
                      {field.value}.
                    </span>
                  </div>
                )}
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
                  <NumberInput
                    placeholder="Enter rate per unit"
                    {...field}
                    onChange={field.onChange}
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
                  <NumberInput
                    placeholder="Enter total price"
                    {...field}
                    disabled
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Auto-calculated based on size and rate
                </FormDescription>
                <FormMessage />
                {enquiry?.budget &&
                  field.value &&
                  (field.value < enquiry.budget.min ||
                    field.value > enquiry.budget.max) && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Enquiry budget range:{" "}
                        {formatIndianNumber(enquiry.budget.min)} -{" "}
                        {formatIndianNumber(enquiry.budget.max)}.
                      </span>
                    </div>
                  )}
              </FormItem>
            )}
          />
        </div>

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

  // Step 3: Features & Amenities
  const getAmenitiesList = () => {
    if (propertyType === "FLAT") return FLAT_AMENITIES;
    if (propertyType === "VILLA") return VILLA_AMENITIES;
    return [];
  };

  const FeaturesStep = (
    <div className="space-y-6">
      {propertyType === "FLAT" && (
        <>
          <FormField
            control={form.control}
            name="isPenthouse"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Penthouse</FormLabel>
                  <FormDescription>
                    Check if this is a penthouse apartment
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="possessionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possession Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : field.value?.toString() || ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Select possession date or leave empty for immediate possession
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <AmenitiesSelector
            value={coerceStringArray(field.value)}
            onChange={field.onChange}
            options={getAmenitiesList()}
            label={
              propertyType === "FLAT"
                ? "Flat Amenities"
                : propertyType === "VILLA"
                ? "Villa Amenities"
                : "Property Amenities"
            }
          />
        )}
      />
    </div>
  );

  // Step 4: Media & Description
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
                        width={100}
                        height={100}
                        src={field.value}
                        alt="Featured Media"
                        className="object-cover w-full h-full"
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
                            width={100}
                            height={100}
                            src={url}
                            alt={`Property image ${index + 1}`}
                            className="object-cover w-full h-full"
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

  // Step 5: Review
  const ReviewStep = (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          Review Your Property Details
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
          <div>
            <strong>Rate:</strong> ₹
            {formatIndianNumber(form.watch("rate") || 0)}
          </div>
          <div>
            <strong>Total Price:</strong> ₹
            {formatIndianNumber(form.watch("totalPrice") || 0)}
          </div>
          <div>
            <strong>Price Negotiable:</strong>{" "}
            {form.watch("isPriceNegotiable") ? "Yes" : "No"}
          </div>
          <div>
            <strong>Featured:</strong> {form.watch("isFeatured") ? "Yes" : "No"}
          </div>

          {propertyType === "FLAT" && (
            <>
              <div>
                <strong>BHK:</strong> {form.watch("bhk") || "Not selected"}
              </div>
              <div>
                <strong>Washrooms:</strong>{" "}
                {form.watch("washrooms") || "Not selected"}
              </div>
              <div>
                <strong>Society:</strong>{" "}
                {form.watch("society") || "Not provided"}
              </div>
              <div>
                <strong>Project Area:</strong>{" "}
                {form.watch("projectArea")
                  ? `${form.watch("projectArea")} sq ft`
                  : "Not provided"}
              </div>
              <div>
                <strong>Penthouse:</strong>{" "}
                {form.watch("isPenthouse") ? "Yes" : "No"}
              </div>
              <div>
                <strong>Possession Date:</strong>{" "}
                {form.watch("possessionDate") instanceof Date
                  ? (form.watch("possessionDate") as Date).toLocaleDateString()
                  : (form.watch("possessionDate") as string) || "Immediate"}
              </div>
            </>
          )}

          {(propertyType === "VILLA" || propertyType === "LAND") && (
            <>
              <div>
                <strong>Plot Type:</strong>{" "}
                {form.watch("plotType") || "Not selected"}
              </div>
              <div>
                <strong>Facing:</strong>{" "}
                {form.watch("facing") || "Not selected"}
              </div>
              <div>
                <strong>Front Road Width:</strong>{" "}
                {form.watch("frontRoadWidth")
                  ? `${form.watch("frontRoadWidth")} ft`
                  : "Not provided"}
              </div>
            </>
          )}

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
        Please review all the information above. Click &quot;Create
        Property&quot; to submit your listing.
      </div>
    </div>
  );

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
            {BasicInfoStep}
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Specifications & Pricing
            </h3>
            {PropertySpecsStep}
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
            {FeaturesStep}
          </div>
          <div className="w-full h-px bg-border" />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">
              Media & Description
            </h3>
            {MediaStep}
          </div>
        </div>
      ),
      isCompleted: completedSteps.has(1),
    },
    {
      id: "review",
      title: "Review",
      description: "Review and submit",
      component: ReviewStep,
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
