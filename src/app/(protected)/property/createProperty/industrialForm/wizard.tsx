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
  industrialPropertySchema,
  IndustrialPropertyFormData,
} from "@/validators/property";

interface IndustrialWizardProps {
  onBack: () => void;
}

export const IndustrialWizard: React.FC<IndustrialWizardProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<IndustrialPropertyFormData>({
    resolver: zodResolver(industrialPropertySchema),
    defaultValues: {
      propertyCategory: "INDUSTRIAL",
      propertyType: "WAREHOUSE",
      address: "",
      rate: 0,
      totalPrice: 0,
      description: "",
      isPriceNegotiable: false,
      isFeatured: false,
    },
    mode: "onChange",
  });

  const propertyType = form.watch("propertyType");

  const onSubmit = (data: IndustrialPropertyFormData) => {
    console.log("Industrial Property Data:", data);
    // Handle form submission here
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const stepValidations: { [key: number]: string[] } = {
      0: ["propertyType", "address"],
      1: ["size", "sizeUnit"],
      2: [], // Location step
      3: ["rate", "totalPrice"],
      4: [], // Features step
      5: ["description"],
      6: [], // Review step
    };

    const fieldsToValidate = stepValidations[currentStep] || [];
    const result = await form.trigger(fieldsToValidate as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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
        name="propertyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industrial Property Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="INDUSTRIAL_PARK">Industrial Park</SelectItem>
                <SelectItem value="INDUSTRIAL_LAND">Industrial Land</SelectItem>
                <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
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
                placeholder="Enter complete property address including industrial area details"
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
                  <SelectItem value="ACRES">Acres</SelectItem>
                  <SelectItem value="HECTARE">Hectare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Purpose */}
      <FormField
        control={form.control}
        name="purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Manufacturing, Storage, Processing, Distribution" {...field} />
            </FormControl>
            <FormDescription>
              Specify the intended use of the industrial property
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Area Type */}
      <FormField
        control={form.control}
        name="areaType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select area type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NEAR_RING_ROAD">Near Ring Road</SelectItem>
                <SelectItem value="RIICO_AREA">RIICO Area</SelectItem>
                <SelectItem value="SEZ">SEZ (Special Economic Zone)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Google Maps Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add Location</h3>
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            🗺️ Google Maps Integration
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to select industrial location on map
          </p>
          <Button variant="outline" className="mt-4" type="button">
            Select Location
          </Button>
        </div>
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
                placeholder="Enter nearby localities separated by commas (e.g., RIICO Industrial Area, Bhiwadi, Neemrana)"
                {...field}
                value={field.value?.join(", ") || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value
                      .split(", ")
                      .filter((item) => item.trim())
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
            <FormLabel>About Property</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the industrial property - facilities, infrastructure, connectivity, power supply, etc."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide detailed information about the industrial property (minimum 10 characters)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Media Files */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Media Files</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Featured Media</label>
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                📷 Upload JPEG image or 🎥 MP4 video
              </p>
              <Button variant="outline" size="sm" className="mt-2" type="button">
                Choose File
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Images List</label>
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                🖼️ Upload multiple JPEG images
              </p>
              <Button variant="outline" size="sm" className="mt-2" type="button">
                Choose Files
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Site Plan</label>
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
              <p className="text-sm text-muted-foreground">
                📄 Upload PDF or JPEG
              </p>
              <Button variant="outline" size="sm" className="mt-2" type="button">
                Choose File
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 7: Review
  const ReviewStep = (
    <div className="space-y-6">
      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Review Your Industrial Property</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Property Type:</strong> {propertyType}
          </div>
          <div>
            <strong>Address:</strong> {form.watch("address") || "Not provided"}
          </div>
          <div>
            <strong>Size:</strong> {form.watch("size") || "0"} {form.watch("sizeUnit") || ""}
          </div>
          <div>
            <strong>Total Price:</strong> ₹{form.watch("totalPrice")?.toLocaleString() || "0"}
          </div>
          <div>
            <strong>Purpose:</strong> {form.watch("purpose") || "Not provided"}
          </div>
          <div>
            <strong>Area Type:</strong> {form.watch("areaType") || "Not selected"}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Please review all the information above. Click "Create Property" to submit your industrial property listing.
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
      description: "Size, purpose, and area type",
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
        canProceed={true}
      />
    </Form>
  );
};
