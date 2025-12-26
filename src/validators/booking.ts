import { z } from "zod";

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number is required"),
  customerAlternatePhone: z.string().optional(),
  customerAddress: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
