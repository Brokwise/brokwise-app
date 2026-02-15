import { customFetch } from "@/models/api";

import {
  CreateUserRequest,
  CreateUserResponse,
  SubmitUserDetailsRequest,
  SubmitUserDetailsResponse,
  GetBrokerDetailsRequest,
  GetBrokerDetailsResponse,
  UpdateProfileDetailsRequest,
  UpdateProfileDetailsResponse,
} from "../types/user";
import { ApiFunction } from "../types";
import type { LegalConsentsPayload } from "@/constants/legal";

// Check if a user (broker or company) exists by email (unprotected endpoint)
export const checkUserExistsByEmail = async (
  email: string
): Promise<{ exists: boolean }> => {
  // Backend returns { success: true, data: { exists: boolean } }
  const response = await customFetch<
    { success: boolean; data: { exists: boolean } },
    object
  >({
    method: "GET",
    path: `/broker/checkEmail?email=${encodeURIComponent(email)}`,
    isProtected: false,
  });
  return response.data;
};

export const createUser: ApiFunction<
  CreateUserResponse,
  CreateUserRequest
> = async ({ email, uid }) => {
  return await customFetch({
    method: "POST",
    path: "/broker/create",
    body: {
      email,
      uid,
    },
    isProtected: false,
  });
};

export const submitLegalConsents: ApiFunction<
  { success: boolean; data: { legalConsents: LegalConsentsPayload } },
  { legalConsents: LegalConsentsPayload }
> = async ({ legalConsents }) => {
  return await customFetch({
    method: "POST",
    path: "/broker/legal-consent",
    body: { legalConsents },
    isProtected: true,
  });
};
export const submitUserDetails: ApiFunction<
  SubmitUserDetailsResponse,
  SubmitUserDetailsRequest
> = async ({
  uid,
  firstName,
  lastName,
  email,
  _id,
  mobile,
  profilePhoto,
  companyName,
  gstin,
  yearsOfExperience,
  city,
  officeAddress,
  reraNumber,
}) => {
    return await customFetch({
      method: "POST",
      path: "/broker/submitProfileDetails",
      body: {
        uid,
        firstName,
        lastName,
        email,
        _id,
        mobile,
        profilePhoto,
        companyName,
        gstin,
        yearsOfExperience,
        city,
        officeAddress,
        reraNumber,
      },
      isProtected: true,
    });
  };

export const updateProfileDetails: ApiFunction<
  UpdateProfileDetailsResponse,
  UpdateProfileDetailsRequest
> = async (data) => {
  console.log("DATA", data);
  return await customFetch({
    method: "PUT",
    path: "/broker/updateProfileDetails",
    body: data,
    isProtected: true,
  });
};

export const getBrokerDetails: ApiFunction<
  GetBrokerDetailsResponse,
  GetBrokerDetailsRequest
> = async ({ uid }) => {
  return await customFetch({
    method: "GET",
    path: `/broker/getBrokerDetails?uid=${uid}`,
    isProtected: true,
  });
};
