import { formatIndianNumber } from "@/utils/helper";
import React from "react";
interface ResidentialReviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  propertyType: string;
}
const ResidentialReview: React.FC<ResidentialReviewProps> = ({
  form,
  propertyType,
}) => {
  return (
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
              {form.watch("plotType") === "CORNER" && (
                <div>
                  <strong>Corner Facing:</strong>{" "}
                  {form.watch("sideFacing") || "Not selected"}
                </div>
              )}
              <div>
                <strong>Front Road Width:</strong>{" "}
                {form.watch("frontRoadWidth")
                  ? `${form.watch("frontRoadWidth")} m`
                  : "Not provided"}
              </div>
              {form.watch("plotType") === "CORNER" && (
                <div>
                  <strong>Side Road Width:</strong>{" "}
                  {form.watch("sideRoadWidth")
                    ? `${form.watch("sideRoadWidth")} m`
                    : "Not provided"}
                </div>
              )}
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
};

export default ResidentialReview;
