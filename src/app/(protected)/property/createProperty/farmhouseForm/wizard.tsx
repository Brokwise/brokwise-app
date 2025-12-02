"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
  farmHousePropertySchema,
  FarmHousePropertyFormData,
} from "@/validators/property";
import { useAddProperty, useSavePropertyAsDraft } from "@/hooks/useProperty";
import {
  uploadFileToFirebase,
  generateFilePath,
  convertImageToWebP,
} from "@/utils/upload";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { LocationPicker } from "../_components/locationPicker";
import { cn } from "@/lib/utils";

interface FarmHouseWizardProps {
  onBack: () => void;
  initialData?: Partial<FarmHousePropertyFormData> & { _id?: string };
}

export const FarmHouseWizard: React.FC<FarmHouseWizardProps> = ({
  onBack,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { addProperty, isLoading } = useAddProperty();
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
      images: [],
      ...initialData,
    },
    mode: "onChange",
  });

  const size = form.watch("size");
  const rate = form.watch("rate");

  React.useEffect(() => {
    const calculatedPrice = (size || 0) * (rate || 0);
    if (calculatedPrice > 0) {
      form.setValue("totalPrice", calculatedPrice, { shouldValidate: true });
    }
  }, [size, rate, form]);

  const onSubmit = (data: FarmHousePropertyFormData) => {
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
        "propertyStatus",
      ],
      1: ["size", "sizeUnit", "rate", "totalPrice"],
      2: [], // Location step
      3: [], // Features step
      4: ["description", "featuredMedia", "images"],
      5: [], // Review step
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const result = await form.trigger(
      fieldsToValidate as (keyof FarmHousePropertyFormData)[]
    );
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

  const handleSaveDraft = async () => {
    const data = form.getValues();
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
    context?: { id: string; text: string }[];
  }) => {
    form.setValue("location.coordinates", details.coordinates, {
      shouldValidate: true,
    });
    form.setValue("address.address", details.placeName, {
      shouldValidate: true,
    });

    if (details.context) {
      details.context.forEach((item: { id: string; text: string }) => {
        if (item.id.startsWith("region")) {
          form.setValue("address.state", item.text, { shouldValidate: true });
        }
        if (item.id.startsWith("place")) {
          form.setValue("address.city", item.text, { shouldValidate: true });
        }
        if (item.id.startsWith("postcode")) {
          form.setValue("address.pincode", item.text, { shouldValidate: true });
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
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "FARM_HOUSE", label: "Farm House" },
                  { value: "INDIVIDUAL", label: "Individual Property" },
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
                  <Input placeholder="Pincode" {...field} />
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
                    placeholder="Enter complete farm house address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Status</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Ready to Move, Under Construction"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Current status and condition of the farm house
                </FormDescription>
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
              <FormLabel>Property Area</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter total area"
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
              <FormLabel>Area Unit</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "ACRES", label: "Acres" },
                    { value: "HECTARE", label: "Hectare" },
                    { value: "BIGHA", label: "Bigha" },
                    { value: "SQ_FT", label: "Square Feet" },
                    { value: "SQ_METER", label: "Square Meter" },
                    { value: "SQ_YARDS", label: "Square Yards" },
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
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "NORTH", label: "North" },
                    { value: "SOUTH", label: "South" },
                    { value: "EAST", label: "East" },
                    { value: "WEST", label: "West" },
                    { value: "NORTH_EAST", label: "North East" },
                    { value: "NORTH_WEST", label: "North West" },
                    { value: "SOUTH_EAST", label: "South East" },
                    { value: "SOUTH_WEST", label: "South West" },
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
              Width of the main access road to the farm house
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  // Step 4: Pricing
  // Pricing merged into Specifications

  // Step 5: Farm House Amenities
  const AmenitiesStep = (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Farm House Amenities</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List amenities separated by commas (e.g., Garden, Parking, Security, Water Tank, Electricity, Bore Well, Swimming Pool, Guest Rooms, Kitchen, Caretaker Room, Boundary Wall, Gate, CCTV, Generator)"
                className="min-h-[100px]"
                {...field}
                value={field.value?.join(", ") || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value.split(", ").filter((item) => item.trim())
                  )
                }
              />
            </FormControl>
            <FormDescription>
              Enter amenities separated by commas
            </FormDescription>
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
            <FormLabel>About Farm House</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the farm house - rooms, facilities, garden area, water source, electricity, security, etc."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide detailed information about the farm house including
              structure, amenities, and surrounding area (minimum 10 characters)
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
                        src={field.value}
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
          Review Your Farm House Property
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Property Type:</strong> {form.watch("propertyType")}
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
            <strong>Status:</strong>{" "}
            {form.watch("propertyStatus") || "Not provided"}
          </div>
          <div>
            <strong>Area:</strong> {form.watch("size") || "0"}{" "}
            {form.watch("sizeUnit") || ""}
          </div>
          <div>
            <strong>Rate:</strong> ₹
            {form.watch("rate")?.toLocaleString() || "0"}
          </div>
          <div>
            <strong>Total Price:</strong> ₹
            {form.watch("totalPrice")?.toLocaleString() || "0"}
          </div>
          <div>
            <strong>Price Negotiable:</strong>{" "}
            {form.watch("isPriceNegotiable") ? "Yes" : "No"}
          </div>
          <div>
            <strong>Facing:</strong> {form.watch("facing") || "Not selected"}
          </div>
          <div>
            <strong>Plot Type:</strong>{" "}
            {form.watch("plotType") || "Not selected"}
          </div>
          <div>
            <strong>Front Road Width:</strong>{" "}
            {form.watch("frontRoadWidth")
              ? `${form.watch("frontRoadWidth")} ft`
              : "Not provided"}
          </div>
          <div className="col-span-2">
            <strong>Amenities:</strong>{" "}
            {form.watch("amenities")?.length
              ? form.watch("amenities")?.join(", ")
              : "None selected"}
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
        Property&quot; to submit your farm house listing.
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    {
      id: "basic-info",
      title: "Basic Info",
      description: "Property type, address, and status",
      component: BasicInfoStep,
      isCompleted: completedSteps.has(0),
    },
    {
      id: "specifications",
      title: "Specifications",
      description: "Area, pricing and property details",
      component: PropertySpecsStep,
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
      id: "amenities",
      title: "Amenities",
      description: "Farm house facilities and features",
      component: AmenitiesStep,
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
        onSaveDraft={handleSaveDraft}
        isSavingDraft={isSavingDraft}
        canProceed={!Object.values(uploading).some(Boolean)}
        isLoading={isLoading}
      />
    </Form>
  );
};
