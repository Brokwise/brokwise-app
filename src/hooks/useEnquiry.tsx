import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  CreateEnquiryDTO,
  Enquiry,
  MarketplaceEnquiry,
} from "@/models/types/enquiry";

export const useGetMarketPlaceEnquiries = () => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<MarketplaceEnquiry[]>({
    queryKey: ["market-place-enquiries"],
    queryFn: async () => {
      return (await api.get("/broker/enquiry/marketplace")).data.data.enquiries;
    },
  });
  return { marketPlaceEnquiries: data, isPending, error };
};

export const useCreateEnquiry = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation<
    Enquiry,
    Error,
    CreateEnquiryDTO
  >({
    mutationFn: async (enquiry) => {
      return (await api.post("/broker/enquiry", enquiry)).data.data;
    },
  });
  return { createEnquiry: mutate, isPending, error };
};
export const useGetMyEnquiries = () => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<Enquiry[]>({
    queryKey: ["my-enquiries"],
    queryFn: async () => {
      return (await api.get("/broker/enquiry/my-requirements")).data.data
        .enquiries;
    },
  });
  return { myEnquiries: data, isPending, error };
};
export const useGetEnquiryById = (id: string) => {
  const api = useAxios();
  const { data, isPending, error } = useQuery<Enquiry>({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      return (await api.get(`/broker/enquiry/${id}`)).data.data;
    },
  });
  return { enquiry: data, isPending, error };
};
