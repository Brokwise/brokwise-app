import { Address } from "@/types/property";

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

export const formatCurrencyEnquiry = (amount: number) => {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`;
  }
  return amount.toLocaleString("en-IN");
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
