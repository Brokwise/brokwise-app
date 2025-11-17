import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
const useAxios = () => {
  const router = useRouter();
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      if (response.status === 401 || response.status === 403) {
        useAuthStore.getState().logout();
        toast.error("Session expired, please login again");
        router.push("/login");
      }
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return axiosInstance;
};
export default useAxios;
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  data: T;
}
export interface ApiError {
  response: {
    data: {
      message: string;
    };
  };
}
