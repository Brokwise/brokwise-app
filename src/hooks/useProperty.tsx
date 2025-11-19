import { useMutation, useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";
import { PropertyFormData } from "@/validators/property";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Property } from "@/types/property";
import { useRouter } from "next/navigation";

export const useAddProperty = () => {
  const router = useRouter();
  const api = useAxios();
  const {
    mutate: addProperty,
    isPending: isLoading,
    error,
  } = useMutation<unknown, AxiosError<{ message: string }>, PropertyFormData>({
    mutationFn: async (property: PropertyFormData) => {
      return (await api.post("/property/create", property)).data.data;
    },
    onSuccess: (data) => {
      toast.success("Property created successfully");
      console.log(data);
      // router.push(`/property/details/${data?.id}`);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred while creating the property.";
      toast.error(errorMessage);
    },
  });
  return { addProperty, isLoading, error };
};

export const useGetProperty = (id: string) => {
  const api = useAxios();
  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: async () => {
      return (await api.get(`/property/details/${id}`)).data.data;
    },
  });
  return { property, isLoading, error };
};
