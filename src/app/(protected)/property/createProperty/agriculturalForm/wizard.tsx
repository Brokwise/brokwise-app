"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  agriculturalPropertySchema,
  AgriculturalPropertyFormData,
} from "@/validators/property";
import { useAddProperty } from "@/hooks/useProperty";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface AgriculturalWizardProps {
  onBack: () => void;
}

export const AgriculturalWizard: React.FC<AgriculturalWizardProps> = ({
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { addProperty, isLoading } = useAddProperty();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const form = useForm<AgriculturalPropertyFormData>({
    resolver: zodResolver(agriculturalPropertySchema),
    defaultValues: {
      propertyCategory: "AGRICULTURAL",
      propertyType: "AGRICULTURAL_LAND",
      address: "",
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
      images: [],
    },
    mode: "onChange",
  });

  const onSubmit = (data: AgriculturalPropertyFormData) => {
    addProperty(data);
  };

  const handleFileUpload = async (
    files: FileList | null,
    fieldName: "featuredMedia" | "images" | "floorPlans"
  ) => {
    if (!files || files.length === 0) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const path = generateFilePath(file.name, `property-${fieldName}`);
        return await uploadFileToFirebase(file, path);
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
      0: ["address"],
      1: ["size", "sizeUnit"],
      2: ["location.coordinates.0", "location.coordinates.1"], // Location step
      3: ["rate", "totalPrice"],
      4: [], // Legal documents step
      5: ["description", "featuredMedia", "images"],
      6: [], // Review step
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const result = await form.trigger(fieldsToValidate as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set([...Array.from(prev), currentStep]));
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
    }
  };

  // Step 1: Basic Information
  const BasicInfoStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="propertyTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter property title" {...field} />
            </FormControl>
            <FormDescription>
              Provide a descriptive title for the agricultural property
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Address</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter complete property address including village, tehsil, district"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Step 2: Land Specifications
  const LandSpecsStep = (
    <div className="space-y-6">
      {/* Size and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Land Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter land size"
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACRES">Acres</SelectItem>
                  <SelectItem value="HECTARE">Hectare</SelectItem>
                  <SelectItem value="BIGHA">Bigha</SelectItem>
                  <SelectItem value="SQ_FT">Square Feet</SelectItem>
                  <SelectItem value="SQ_METER">Square Meter</SelectItem>
                  <SelectItem value="SQ_YARDS">Square Yards</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  // Step 3: Location & Accessibility
  const LocationStep = (
    <div className="space-y-6">
      {/* Facing and Plot Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="facing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facing Direction</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NORTH">North</SelectItem>
                  <SelectItem value="SOUTH">South</SelectItem>
                  <SelectItem value="EAST">East</SelectItem>
                  <SelectItem value="WEST">West</SelectItem>
                  <SelectItem value="NORTH_EAST">North East</SelectItem>
                  <SelectItem value="NORTH_WEST">North West</SelectItem>
                  <SelectItem value="SOUTH_EAST">South East</SelectItem>
                  <SelectItem value="SOUTH_WEST">South West</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plotType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plot Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ROAD">Road Facing</SelectItem>
                  <SelectItem value="CORNER">Corner Plot</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="frontRoadWidth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Front Road Width (in feet)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter road width"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Width of the road adjacent to the agricultural land
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Google Maps Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location.coordinates.1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Latitude"
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
            name="location.coordinates.0"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Longitude"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>
          Enter coordinates manually (Map integration coming soon)
        </FormDescription>
      </div>

      {/* Localities */}
      <FormField
        control={form.control}
        name="localities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Add Localities</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter nearby localities separated by commas (e.g., Village Name, Tehsil, District)"
                {...field}
                value={field.value?.join(", ") || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter((item) => item)
                  )
                }
              />
            </FormControl>
            <FormDescription>
              Enter multiple localities separated by commas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Step 4: Pricing
  const PricingStep = (
    <div className="space-y-6">
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
              <FormDescription>
                Price per acre/bigha/hectare as per selected unit
              </FormDescription>
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
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
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
  );

  // Step 5: Legal Documents
  const LegalDocumentsStep = (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Legal Documents (Optional)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="jamabandiUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jamabandi Document URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/jamabandi.pdf"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Upload and provide URL for Jamabandi document
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="khasraPlanUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Khasra Plan Document URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/khasra-plan.pdf"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Upload and provide URL for Khasra Plan document
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="isFeatured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Featured Property</FormLabel>
              <FormDescription>
                Mark as featured property for better visibility
              </FormDescription>
            </div>
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
            <FormLabel>About Agricultural Land</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the agricultural land - soil type, water source, crops grown, irrigation facilities, etc."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide detailed information about the agricultural land including
              soil quality, water availability, and farming potential (minimum
              10 characters)
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
                      <img
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
                          <img
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
                          <img
                            src={url}
                            alt={`Floor plan ${index + 1}`}
                            className="object-cover w-full h-full"
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
          Review Your Agricultural Property
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Property Title:</strong>{" "}
            {form.watch("propertyTitle") || "Not provided"}
          </div>
          <div>
            <strong>Address:</strong> {form.watch("address") || "Not provided"}
          </div>
          <div>
            <strong>Land Size:</strong> {form.watch("size") || "0"}{" "}
            {form.watch("sizeUnit") || ""}
          </div>
          <div>
            <strong>Total Price:</strong> ₹
            {form.watch("totalPrice")?.toLocaleString() || "0"}
          </div>
          <div>
            <strong>Facing:</strong> {form.watch("facing") || "Not selected"}
          </div>
          <div>
            <strong>Plot Type:</strong>{" "}
            {form.watch("plotType") || "Not selected"}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Please review all the information above. Click "Create Property" to
        submit your agricultural land listing.
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    {
      id: "basic-info",
      title: "Basic Info",
      description: "Property title and address",
      component: BasicInfoStep,
      isCompleted: completedSteps.has(0),
    },
    {
      id: "land-specs",
      title: "Land Details",
      description: "Size and land specifications",
      component: LandSpecsStep,
      isCompleted: completedSteps.has(1),
    },
    {
      id: "location",
      title: "Location",
      description: "Location and accessibility details",
      component: LocationStep,
      isCompleted: completedSteps.has(2),
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Rate and total price",
      component: PricingStep,
      isCompleted: completedSteps.has(3),
    },
    {
      id: "legal",
      title: "Legal Docs",
      description: "Legal documents and features",
      component: LegalDocumentsStep,
      isCompleted: completedSteps.has(4),
    },
    {
      id: "media",
      title: "Media",
      description: "Photos, videos, and description",
      component: MediaStep,
      isCompleted: completedSteps.has(5),
    },
    {
      id: "review",
      title: "Review",
      description: "Review and submit",
      component: ReviewStep,
      isCompleted: completedSteps.has(6),
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
        canProceed={!Object.values(uploading).some(Boolean)}
      />
    </Form>
  );
};
