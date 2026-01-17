import { z } from "zod";

export const createCompanyFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(128),
  gstin: z
    .string()
    .length(15, { message: "GSTIN must be exactly 15 characters" }),
  officeAddress: z
    .string()
    .min(3, { message: "Address must be at least 3 characters" }),
  mobile: z.string().min(10, { message: "Mobile must be at least 10 digits" }),
  noOfEmployees: z
    .number()
    .min(0, { message: "Number of employees must be positive" }),
  city: z.string().min(3, { message: "City must be at least 3 characters" }),
});

export const updateCompanyProfileSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .optional()
    .or(z.literal("")),
  mobile: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits long" })
    .optional()
    .or(z.literal("")),
  gstin: z
    .string()
    .length(15, { message: "GSTIN must be exactly 15 characters" })
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(3, { message: "City must be at least 3 characters long" })
    .optional()
    .or(z.literal("")),
  officeAddress: z
    .string()
    .min(3, { message: "Office address must be at least 3 characters long" })
    .optional()
    .or(z.literal("")),
  noOfEmployees: z.number().min(0).optional(),
});

const addBrokerEmailSchema = z.string().email();
const addBrokerPhoneSchema = z.string().refine(
  (value) => {
    const normalized = value.trim();
    if (!/^[0-9+().\s-]+$/.test(normalized)) {
      return false;
    }
    const digitsOnly = normalized.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  },
  { message: "Enter a valid phone number" }
);

export const addBrokerSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Provide an email or phone number" })
    .refine(
      (value) =>
        addBrokerEmailSchema.safeParse(value).success ||
        addBrokerPhoneSchema.safeParse(value).success,
      { message: "Enter a valid email or phone number" }
    ),
});
