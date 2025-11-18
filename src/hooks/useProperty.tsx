import useAxios from "@/hooks/useAxios";
import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";

export const useProperties = () => {
  const api = useAxios();
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      return (await api.get("/property")).data.data;
    },
  });
  return { properties, isLoading, error };
};
