import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Booking, BookingResponse } from "@/models/types/booking";

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

interface CreateOrderParams {
  plotIds: string[];
  blockId?: string;
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

interface CreateOrderResponse {
  status: string;
  data: {
    order: {
      id: string;
      entity: string;
      amount: number;
      amount_paid: number;
      amount_due: number;
      currency: string;
      receipt: string;
      status: string;
      attempts: number;
      created_at: number;
    };
    key_id: string;
    amount: number;
    currency: string;
    bookings: Booking[];
  };
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

export const useCreateBookingOrder = () => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (data: CreateOrderParams) => {
      const response = await api.post<CreateOrderResponse>(
        "/bookings/create-order",
        data
      );
      return response.data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to initiate booking"
      );
    },
  });
};

export const useHoldPlot = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingParams) => {
      const response = await api.post("/bookings/hold", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Plot held successfully");
      queryClient.invalidateQueries({ queryKey: ["project-plots"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to hold plot");
    },
  });
};

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
export const useGetBooking = (id: string) => {
  const api = useAxios();

  return useQuery({
    queryKey: ["booking"],
    queryFn: async () => {
      const response = await api.get("/bookings/" + id);
      return response.data.data;
    },
  });
};
