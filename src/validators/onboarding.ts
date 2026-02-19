import { z } from "zod";

export const submitProfileDetails = z.object({
  profilePhoto: z.string().optional(),
  firstName: z
    .string()
    .min(3, { message: "First name must be at least 3 characters long" }),
  lastName: z
    .string()
    .min(3, { message: "Last name must be at least 3 characters long" }),
  mobile: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits long" })
    .max(10, { message: "Mobile number must be at most 10 digits long" }),
  companyName: z
    .string()
    .min(3, { message: "Company name must be at least 3 characters long" })
    .regex(/[a-zA-Z]/, {
      message: "Company name must contain at least one letter",
    })
    .optional()
    .or(z.literal("")),
  gstin: z
    .string()
    .length(15, { message: "GSTIN must be exactly 15 characters" })
    .optional()
    .or(z.literal("")),
  yearsOfExperience: z
    .number({ message: "Please select years of experience" })
    .min(0, { message: "Years of experience must be >= 0" })
    .max(15, { message: "Years of experience must be <= 15" }),
  city: z
    .string()
    .min(3, { message: "City must be at least 3 characters long" }),
  officeAddress: z
    .string()
    .min(3, { message: "Office address must be at least 3 characters long" })
    .optional(),
  reraNumber: z
    .string()
    .min(12, { message: "RERA number must be at least 12 characters" })
    .max(50, { message: "RERA number must not exceed 50 characters" })
    .optional()
    .or(z.literal("")),
});

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const getLoginFormSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("invalid_email") }),
    password: z.string().min(8, { message: t("password_min_length") }),
  });

export const signupFormSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    legalConsent: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const getSignupFormSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z.string().email({ message: t("invalid_email") }),
      password: z.string().min(8, { message: t("password_min_length") }),
      confirmPassword: z.string().min(8, { message: t("password_min_length") }),
      legalConsent: z.boolean().refine((value) => value === true, {
        message: t("legal_consent_required"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwords_do_not_match"),
      path: ["confirmPassword"],
    });
