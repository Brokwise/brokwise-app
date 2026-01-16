"use client";
import React from "react";
import { FormField } from "@/components/ui/form";
import {
  AmenitiesSelector,
  AmenityOption,
} from "@/components/property/amenities-selector";
import { coerceStringArray } from "@/utils/helper";
import { UseFormReturn } from "react-hook-form";
import { CommercialPropertyFormData } from "@/validators/property";

type CommercialPropertyType =
  | "SHOWROOM"
  | "HOTEL"
  | "HOSTEL"
  | "SHOP"
  | "OFFICE_SPACE"
  | "OTHER_SPACE";

interface CommercialFeaturesProps {
  form: UseFormReturn<CommercialPropertyFormData>;
  propertyType: CommercialPropertyType;
}

const COMMERCIAL_AMENITIES_LIST: Record<string, AmenityOption[]> = {
  HOTEL: [
    { label: "Reception Lobby Area" },
    { label: "Daily Housekeeping" },
    { label: "On Site Dining Restaurant" },
    { label: "Conference Meeting Rooms" },
    { label: "Elevator Lift" },
    { label: "Fitness Center" },
    { label: "Spa Massage Services" },
    { label: "Laundry Service" },
    { label: "Business Center" },
    { label: "High Speed Wi Fi" },
    { label: "Parking Space" },
    { label: "Airport Shuttle" },
    { label: "Cctv Surveillance" },
    { label: "Fire Safety Equipment" },
  ],
  HOSTEL: [
    { label: "Shared Kitchen" },
    { label: "Common Lounge Area" },
    { label: "Dormitory Private Rooms" },
    { label: "Study Work Zones" },
    { label: "Lockers For Each Bed" },
    { label: "Shared Bathrooms" },
    { label: "24 7 Security" },
    { label: "Laundry Facilities" },
    { label: "Wi Fi" },
    { label: "Housekeeping" },
    { label: "Cctv Surveillance" },
    { label: "Bicycle Parking" },
    { label: "Social Activities Zone" },
    { label: "Meal Options Available" },
    { label: "Air Conditioning Fans" },
  ],
  OFFICE_SPACE: [
    { label: "Furnished Cabins Workstations" },
    { label: "Conference Meeting Rooms" },
    { label: "High Speed Internet" },
    { label: "Air Conditioning" },
    { label: "24 7 Security Surveillance" },
    { label: "Reception Front Desk" },
    { label: "Pantry Cafeteria" },
    { label: "Power Backup" },
    { label: "Printing Scanning Services" },
    { label: "Parking Area" },
    { label: "Elevator Lift" },
    { label: "Fire Safety Exit Routes" },
    { label: "Cleaning Maintenance" },
    { label: "Access Control System" },
    { label: "Networking It Support Infrastructure" },
  ],
  SHOWROOM: [
    { label: "Large Display Windows" },
    { label: "High Ceilings" },
    { label: "Air Conditioning" },
    { label: "Parking Space" },
    { label: "Security System" },
    { label: "Storage Area" },
    { label: "Restrooms" },
    { label: "Loading/Unloading Area" },
    { label: "Power Backup" },
    { label: "Fire Safety System" },
  ],
  SHOP: [
    { label: "Display Area" },
    { label: "Storage Space" },
    { label: "Shutters" },
    { label: "Power Backup" },
    { label: "Water Connection" },
    { label: "Parking Availability" },
    { label: "Security" },
  ],
  OTHER_SPACE: [
    { label: "Power Backup" },
    { label: "Water Connection" },
    { label: "Parking" },
    { label: "Security" },
    { label: "Fire Safety" },
  ],
};

export const CommercialFeatures: React.FC<CommercialFeaturesProps> = ({
  form,
  propertyType,
}) => {
  const getAmenitiesList = () => {
    return COMMERCIAL_AMENITIES_LIST[propertyType] || [];
  };

  const getAmenitiesLabel = () => {
    const labels: Record<CommercialPropertyType, string> = {
      HOTEL: "Hotel Amenities",
      HOSTEL: "Hostel Amenities",
      OFFICE_SPACE: "Office Space Amenities",
      SHOWROOM: "Showroom Amenities",
      SHOP: "Shop Amenities",
      OTHER_SPACE: "Property Amenities",
    };
    return labels[propertyType] || "Property Amenities";
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <AmenitiesSelector
            value={coerceStringArray(field.value)}
            onChange={field.onChange}
            options={getAmenitiesList()}
            label={getAmenitiesLabel()}
          />
        )}
      />
    </div>
  );
};
