import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface CreateBookingParams {
  plotId: string;
  blockId: string;
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
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });
};
import { BookingResponse } from "@/models/types/booking";

export const useGetAllBookings = () => {
  const api = useAxios();

  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await api.get<BookingResponse>("/bookings/all");
      return response.data;
    },
  });
};
