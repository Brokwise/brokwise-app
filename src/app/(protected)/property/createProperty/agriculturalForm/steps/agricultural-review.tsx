import { formatIndianNumber } from "@/utils/helper";
import React from "react";
import useCredits from "@/hooks/useCredits";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { CREDITS_PRICE } from "@/config/tier_limits";
import { Loader2 } from "lucide-react";

interface AgriculturalReviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

const AgriculturalReview: React.FC<AgriculturalReviewProps> = ({ form }) => {
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const FEATURED_COST = CREDITS_PRICE.MARK_PROPERTY_AS_FEATURED;
  const hasSufficientCredits = (balance || 0) >= FEATURED_COST;

  return (
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
            <strong>Land Size:</strong> {form.watch("size") || "0"}{" "}
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
              ? `${form.watch("frontRoadWidth")} ft`
              : "Not provided"}
          </div>
          <div>
            <strong>Jamabandi URL:</strong>{" "}
            {form.watch("jamabandiUrl") ? "Provided" : "Not provided"}
          </div>
          <div>
            <strong>Khasra Plan URL:</strong>{" "}
            {form.watch("khasraPlanUrl") ? "Provided" : "Not provided"}
          </div>
          <div className="col-span-2">
            <strong>Description:</strong>{" "}
            <p className="mt-1 text-muted-foreground">
              {form.watch("description") || "Not provided"}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
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
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Please review all the information above. Click &quot;Create
        Property&quot; to submit your agricultural land listing.
      </div>
    </div>
  );
};

export default AgriculturalReview;
