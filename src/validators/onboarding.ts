import { z } from "zod";

export const submitProfileDetails = z.object({
  firstName: z
    .string()
    .min(3, { message: "First name must be at least 3 characters long" }),
  lastName: z
    .string()
    .min(3, { message: "Last name must be at least 3 characters long" }),
  mobile: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits long" }),
  companyName: z
    .string()
    .min(3, { message: "Company name must be at least 3 characters long" }),
  gstin: z
    .string()
    .min(15, { message: "GSTIN must be at least 15 characters long" }),
  yearsOfExperience: z
    .number()
    .min(0, { message: "Years of experience must be >= 0" }),
  city: z
    .string()
    .min(3, { message: "City must be at least 3 characters long" }),
  officeAddress: z
    .string()
    .min(3, { message: "Office address must be at least 3 characters long" }),
  reraNumber: z.string(),
});

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
