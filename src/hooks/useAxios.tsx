"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/config/firebase";
import { useEffect, useMemo, useRef } from "react";
const useAxios = () => {
  const router = useRouter();
  const routerRef = useRef(router);

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
    // instance.interceptors.response.use(
    //   (response) => response,
    //   async (error) => {
    //     const status = error?.response?.status;
    //     // Only 401 implies an invalid/expired token.
    //     // 403 can be a valid authorization failure; don't force logout on it.
    //     if (status === 401) {
    //       if (isHandlingAuthErrorRef.current) {
    //         return Promise.reject(error);
    //       }
    //       isHandlingAuthErrorRef.current = true;
    //       try {
    //         await firebaseAuth.signOut();
    //       } catch {
    //         // Ignore sign-out errors; still route user to login.
    //       }
    //       toast.error("Session expired, please login again");
    //       routerRef.current.push("/login");
    //       // Reset after a delay so fresh 401s (e.g., after re-login) are handled.
    //       setTimeout(() => {
    //         isHandlingAuthErrorRef.current = false;
    //       }, 2000);
    //     }
    //     return Promise.reject(error);
    //   }
    // );

    instance.interceptors.request.use(
      async (config) => {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          config.headers = config.headers ?? {};
          (
            config.headers as Record<string, string>
          ).Authorization = `Bearer ${token}`;
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
