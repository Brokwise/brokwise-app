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
  commercialPropertySchema,
  CommercialPropertyFormData,
} from "@/validators/property";
import { useAddProperty } from "@/hooks/useProperty";
import { uploadFileToFirebase, generateFilePath } from "@/utils/upload";
import { Loader2, X, MapPin, Wand2Icon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { LocationPicker } from "../_components/locationPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CommercialWizardProps {
  onBack: () => void;
}

export const CommercialWizard: React.FC<CommercialWizardProps> = ({
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { addProperty, isLoading } = useAddProperty();
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [isLocalityDialogOpen, setIsLocalityDialogOpen] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const form = useForm<CommercialPropertyFormData>({
    resolver: zodResolver(commercialPropertySchema),
    defaultValues: {
      propertyCategory: "COMMERCIAL",
      propertyType: "SHOP",
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

  const propertyType = form.watch("propertyType");
  const plotType = form.watch("plotType");

  const onSubmit = (data: CommercialPropertyFormData) => {
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
      0: ["propertyType", "address"],
      1: ["size", "sizeUnit"],
      2: ["location.coordinates"], // Location step
      3: ["rate", "totalPrice"],
      4: [], // Features step
      5: ["description", "featuredMedia", "images"],
      6: [], // Review step
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="SHOWROOM">Showroom</SelectItem>
                <SelectItem value="HOTEL">Hotel</SelectItem>
                <SelectItem value="HOSTEL">Hostel</SelectItem>
                <SelectItem value="SHOP">Shop</SelectItem>
                <SelectItem value="OFFICE_SPACE">Office Space</SelectItem>
              </SelectContent>
            </Select>
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
                placeholder="Enter complete property address"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SQ_FT">Square Feet</SelectItem>
                  <SelectItem value="SQ_METER">Square Meter</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ground">Ground Floor</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5">5th Floor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
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
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beds" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50].map(
                      (num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Beds
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
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
                    type="number"
                    placeholder="Enter number of rooms"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Land">Land</SelectItem>
                  <SelectItem value="Constructed">Constructed</SelectItem>
                </SelectContent>
              </Select>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          <FormField
            control={form.control}
            name="facing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Front Facing</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing direction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NORTH">North</SelectItem>
                    <SelectItem value="SOUTH">South</SelectItem>
                    <SelectItem value="EAST">East</SelectItem>
                    <SelectItem value="WEST">West</SelectItem>
                  </SelectContent>
                </Select>
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
                    type="number"
                    placeholder="Enter front road width"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select side facing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NORTH">North</SelectItem>
                        <SelectItem value="SOUTH">South</SelectItem>
                        <SelectItem value="EAST">East</SelectItem>
                        <SelectItem value="WEST">West</SelectItem>
                      </SelectContent>
                    </Select>
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
                        type="number"
                        placeholder="Enter side road width"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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

      {/* Google Maps Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add Location</h3>
        <FormField
          control={form.control}
          name="location.coordinates"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <LocationPicker
                  value={field.value as [number, number]}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Localities */}
      <FormField
        control={form.control}
        name="localities"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Add Localities</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLocalityDialogOpen(true)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Pick from Map
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Enter nearby localities separated by commas (e.g., MI Road, Pink City, Bani Park)"
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
              Enter multiple localities separated by commas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Dialog
        open={isLocalityDialogOpen}
        onOpenChange={setIsLocalityDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Pick a Locality</DialogTitle>
            <DialogDescription>
              Search or click on the map to select a locality to add.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px]">
            <LocationPicker
              value={form.getValues("location.coordinates") as [number, number]}
              onChange={() => {}}
              onLocationSelect={(details) => {
                const currentLocalities = form.getValues("localities") || [];
                if (!currentLocalities.includes(details.placeName)) {
                  form.setValue(
                    "localities",
                    [...currentLocalities, details.placeName],
                    { shouldValidate: true }
                  );
                  toast.success(`Added ${details.placeName}`);
                } else {
                  toast.info(`${details.placeName} is already added`);
                }
                setIsLocalityDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Step 4: Pricing & Commercial Details
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

      {/* Purpose */}
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
      />

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
                        checked={field.value?.includes(amenity)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, amenity]
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
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(", ").filter((item) => item.trim())
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
            <strong>Address:</strong> {form.watch("address") || "Not provided"}
          </div>
          <div>
            <strong>Size:</strong> {form.watch("size") || "0"}{" "}
            {form.watch("sizeUnit") || ""}
          </div>
          <div>
            <strong>Total Price:</strong> ₹
            {form.watch("totalPrice")?.toLocaleString() || "0"}
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
            </>
          )}
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
      description: "Size and property details",
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
      id: "pricing",
      title: "Pricing",
      description: "Rate and commercial details",
      component: PricingStep,
      isCompleted: completedSteps.has(3),
    },
    {
      id: "features",
      title: "Features",
      description: "Amenities and special features",
      component: FeaturesStep,
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
        isLoading={isLoading}
      />
    </Form>
  );
};
