"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/config/firebase";
import { useEffect, useMemo, useRef } from "react";
import { getSessionId } from "@/lib/session";
import {
  forceLogoutDueToSession,
  isSessionErrorCode,
} from "@/lib/authSession";
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

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const code = error?.response?.data?.code;

        if (status === 401 && isSessionErrorCode(code)) {
          await forceLogoutDueToSession({ router: routerRef.current });
        }

        return Promise.reject(error);
      }
    );

    instance.interceptors.request.use(
      async (config) => {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          config.headers = config.headers ?? {};
          (
            config.headers as Record<string, string>
          ).Authorization = `Bearer ${token}`;
        }

        const sessionId = getSessionId();
        if (sessionId) {
          config.headers = config.headers ?? {};
          (config.headers as Record<string, string>)["x-session-id"] =
            sessionId;
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
