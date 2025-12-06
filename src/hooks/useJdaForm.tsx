import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export const useJDAForm = () => {
  const api = useAxios();
  const {
    data: formsData,
    isLoading: isLoadingForms,
    error: errorForms,
  } = useQuery({
    queryKey: ["jda-form"],
    queryFn: async () => {
      return (await api.get("/broker/forms")).data.data;
    },
  });

  return { formsData, isLoadingForms, errorForms };
};
