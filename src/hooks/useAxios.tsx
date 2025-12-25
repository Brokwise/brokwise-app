import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/config/firebase";
import { useEffect, useMemo, useRef } from "react";
const useAxios = () => {
  const router = useRouter();
  const routerRef = useRef(router);

  // Keep the latest router instance for interceptors without re-creating axios.
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Note: 401/403 will land in the error handler (not the success handler).
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          try {
            await firebaseAuth.signOut();
          } catch {
            // Ignore sign-out errors; still route user to login.
          }
          toast.error("Session expired, please login again");
          routerRef.current.push("/login");
        }
        return Promise.reject(error);
      }
    );

    instance.interceptors.request.use(
      async (config) => {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          config.headers = config.headers ?? {};
          // Axios header typing differs across versions; keep this resilient.
          (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, []);

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
