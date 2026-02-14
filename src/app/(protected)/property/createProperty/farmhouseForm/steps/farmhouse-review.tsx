import { formatIndianNumber, getRoadWidthUnitLabel } from "@/utils/helper";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FarmHousePropertyFormData } from "@/validators/property";
import useCredits, { useGetCreditPrices } from "@/hooks/useCredits";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface FarmhouseReviewProps {
  form: UseFormReturn<FarmHousePropertyFormData>;
  isEnquiry?: boolean
}

const FarmhouseReview: React.FC<FarmhouseReviewProps> = ({ form, isEnquiry }) => {
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const { prices } = useGetCreditPrices();
  const FEATURED_COST = prices.MARK_PROPERTY_AS_FEATURED;
  const hasSufficientCredits = (balance || 0) >= FEATURED_COST;
  const roadWidthUnitLabel = getRoadWidthUnitLabel(
    form.watch("roadWidthUnit") || "FEET"
  );

  return (
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
            <strong>Facing:</strong> {form.watch("facing") || "Not selected"}
          </div>
          <div>
            <strong>Plot Type:</strong>{" "}
            {form.watch("plotType") || "Not selected"}
          </div>
          <div>
            <strong>Front Road Width:</strong>{" "}
            {form.watch("frontRoadWidth")
              ? `${form.watch("frontRoadWidth")} ${roadWidthUnitLabel}`
              : "Not provided"}
          </div>
          {form.watch("sideFacing") && (
            <div>
              <strong>Side Facing:</strong> {form.watch("sideFacing")}
            </div>
          )}
          {form.watch("sideRoadWidth") !== undefined &&
            form.watch("sideRoadWidth") !== null && (
            <div>
              <strong>Side Road Width:</strong> {form.watch("sideRoadWidth")} {roadWidthUnitLabel}
            </div>
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

        {!isEnquiry && <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-base font-medium mb-4">Promotion</h4>
          {isCreditsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking credit balance...
            </div>
          ) : (
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!hasSufficientCredits && !field.value}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Featured Property</FormLabel>
                    <FormDescription>
                      Promote this property to get more visibility. Cost:{" "}
                      {FEATURED_COST} Credits. (Available: {balance} Credits)
                      {!hasSufficientCredits && !field.value && (
                        <span className="block text-destructive mt-1">
                          Insufficient credits. Please purchase more credits to
                          use this feature.
                        </span>
                      )}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>}
      </div>

      <div className="text-sm text-muted-foreground">
        Please review all the information above. Click &quot;Create
        Property&quot; to submit your farm house listing.
      </div>
    </div>
  );
};

export default FarmhouseReview;
