import { Address } from "@/types/property";
import { Capacitor } from "@capacitor/core";

export const setCookie = (
  key: string,
  value: Record<string, string | number | boolean | undefined | null>,
  expiryDays: number
) => {
  const stringValue = encodeURIComponent(JSON.stringify(value));
  const expires = new Date();
  expires.setTime(expires.getTime() + expiryDays * 24 * 60 * 60 * 1000);

  document.cookie = `${key}=${stringValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict;`;
};

export const formatIndianNumber = (num: number | string): string => {
  const value = Number(num);
  if (isNaN(value)) return "0";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatAddress = (address: Address | string | undefined) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  const parts = [
    address.address,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return parts.join(", ");
};

export const formatEnquiryLocation = (enquiry: {
  address?: string;
  preferredLocations?: { address: string; city?: string; locality?: string }[];
  city?: string;
  localities?: string[];
}) => {
  // Use first preferred location if available
  if (enquiry.preferredLocations && enquiry.preferredLocations.length > 0) {
    return enquiry.preferredLocations[0].address || "";
  }
  const address = formatAddress(enquiry.address);
  if (address) return address;
  const localities = Array.isArray(enquiry.localities)
    ? enquiry.localities
    : [];
  if (localities.length > 0) return localities.join(", ");
  return enquiry.city ?? "";
};

export const formatAllEnquiryLocations = (enquiry: {
  address?: string;
  preferredLocations?: { address: string; city?: string; locality?: string }[];
  city?: string;
  localities?: string[];
}) => {
  if (enquiry.preferredLocations && enquiry.preferredLocations.length > 0) {
    return enquiry.preferredLocations.map((loc) => loc.address).filter(Boolean);
  }
  const primary = formatEnquiryLocation(enquiry);
  return primary ? [primary] : [];
};

export const getEnquiryLocationCount = (enquiry: {
  preferredLocations?: { address: string }[];
}) => {
  return enquiry.preferredLocations?.length ?? 1;
};

export const getCityFromAddress = (address?: string) => {
  const formatted = formatAddress(address);
  if (!formatted) return "";
  const parts = formatted
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 4) return parts[1];
  return parts[0] ?? "";
};

export const formatCurrencyEnquiry = (amount: number) => {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`;
  }
  return amount.toLocaleString("en-IN");
};

// Formats price in shortened Cr/L format with ₹ symbol
export const formatPriceShort = (amount: number) => {
  if (amount >= 10000000) {
    const value = amount / 10000000;
    // Remove trailing zeros: 12.00 -> 12, 12.50 -> 12.5
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  }
  if (amount >= 100000) {
    const value = amount / 100000;
    const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400";
    case "closed":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300";
    case "expired":
      return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
  }
};

// Sanitizes integer-like user input by stripping non-digits and leading zeros.
export const sanitizeIntegerInput = (value: string) => {
  if (!value) return "";
  const digitsOnly = value.replace(/\D+/g, "");
  return digitsOnly.replace(/^0+(?=\d)/, "");
};

// Parses sanitized input into a number, returning undefined when empty.
export const parseIntegerOrUndefined = (value: string) => {
  const normalized = sanitizeIntegerInput(value);
  if (normalized === "") return undefined;
  return Number(normalized);
};

// Parses and clamps integer input to a max value. Prevents typing beyond max.
export const parseIntegerWithMax = (value: string, max: number) => {
  const normalized = sanitizeIntegerInput(value);
  if (normalized === "") return undefined;
  const num = Number(normalized);
  // Clamp to max value - prevents typing beyond the limit
  return Math.min(num, max);
};

// Constants for property form validations
export const PROPERTY_LIMITS = {
  PINCODE_LENGTH: 6,
  MAX_FLOOR: 20,
  MAX_FRONT_ROAD_WIDTH: 300,
} as const;

// Parse floor input with max validation (200)
export const parseFloorInput = (value: string) => {
  return parseIntegerWithMax(value, PROPERTY_LIMITS.MAX_FLOOR);
};

// Parse front road width with max validation (300 feet)
export const parseRoadWidthInput = (value: string) => {
  return parseIntegerWithMax(value, PROPERTY_LIMITS.MAX_FRONT_ROAD_WIDTH);
};

export const ROAD_WIDTH_CONVERSION = {
  FEET_TO_METER: 0.3048,
  METER_TO_FEET: 3.28084,
} as const;

export const convertRoadWidth = (
  value: number,
  fromUnit: "FEET" | "METER"
) => {
  if (!Number.isFinite(value)) return undefined;

  if (fromUnit === "FEET") {
    return value * ROAD_WIDTH_CONVERSION.FEET_TO_METER;
  }

  return value * ROAD_WIDTH_CONVERSION.METER_TO_FEET;
};

export const formatRoadWidthConversion = (
  value: number | undefined,
  fromUnit: "FEET" | "METER"
) => {
  if (value === undefined) return undefined;

  const convertedValue = convertRoadWidth(value, fromUnit);
  if (convertedValue === undefined) return undefined;

  const targetUnit = fromUnit === "FEET" ? "m" : "ft";
  return `${convertedValue.toFixed(2)} ${targetUnit}`;
};

export const getRoadWidthUnitLabel = (
  unit: "FEET" | "METER" | undefined
) => {
  return unit === "FEET" ? "ft" : "m";
};

// Sanitize and limit pincode to 6 numeric digits
export const sanitizePincode = (value: string) => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, PROPERTY_LIMITS.PINCODE_LENGTH);
};

// Coerces unknown values into a string array.
// - Accepts: string[] | string (comma-separated or JSON array string)
// - Returns: string[] (trimmed, non-empty)
export const coerceStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    // If it's a JSON array string, try to parse it.
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return coerceStringArray(parsed);
      } catch {
        // Fall back to comma-separated parsing.
      }
    }

    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
};

export const isNativeIOS = () => {
  const isNative = Capacitor.isNativePlatform();
  const isiOS = Capacitor.getPlatform() === "ios";
  return isNative && isiOS;
};
