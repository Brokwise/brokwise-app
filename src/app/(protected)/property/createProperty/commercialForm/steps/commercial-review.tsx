"use client";
import React from "react";
import { formatIndianNumber } from "@/utils/helper";
import { UseFormReturn } from "react-hook-form";
import { CommercialPropertyFormData } from "@/validators/property";

type CommercialPropertyType =
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE";

interface CommercialReviewProps {
  form: UseFormReturn<CommercialPropertyFormData>;
  propertyType: CommercialPropertyType;
}

export const CommercialReview: React.FC<CommercialReviewProps> = ({
  form,
  propertyType,
}) => {
  return (
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

          {propertyType === "HOTEL" && (
            <div>
              <strong>Rooms:</strong> {form.watch("rooms") || "Not provided"}
            </div>
          )}

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
};
