import useAxios from "@/hooks/useAxios";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Notification {
  _id: string;
  title: string;
  description: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

export const useNotification = () => {
  const api = useAxios();
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      return (await api.get("/notifications")).data?.data;
    },
  });
  return { notificationsData, isLoading, error };
};

export const useUpdateNotification = () => {
  const api = useAxios();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ["updateNotification"],
    mutationFn: async (data: { read: boolean; _id: string }) => {
      return await api.put("/notifications/", data);
    },
  });
  return { mutate, isPending, error };
};
