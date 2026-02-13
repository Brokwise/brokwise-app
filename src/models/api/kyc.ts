import { customFetch } from "@/models/api";
import {
  InitiateDigiLockerRequest,
  InitiateDigiLockerResponse,
  DigiLockerStatusResponse,
} from "../types/kyc";


export const initiateDigiLockerVerification = async (
  platform: InitiateDigiLockerRequest["platform"]
): Promise<InitiateDigiLockerResponse> => {
  return await customFetch({
    method: "POST",
    path: "/kyc/digilocker/initiate",
    body: { platform },
    isProtected: true,
  });
};


export const getDigiLockerStatus = async (
  verificationId: string
): Promise<DigiLockerStatusResponse> => {
  return await customFetch({
    method: "GET",
    path: `/kyc/digilocker/status/${encodeURIComponent(verificationId)}`,
    isProtected: true,
  });
};
