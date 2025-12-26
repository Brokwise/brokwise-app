import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { toast } from "sonner";
import { BookingFormValues } from "@/validators/booking";

interface CreateBookingParams {
  plotId: string;
  projectId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
  };
  notes?: string;
}

export const useCreateBooking = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingParams) => {
      const response = await api.post("/bookings/create", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking created successfully");
      queryClient.invalidateQueries({ queryKey: ["project-plots"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });
};
