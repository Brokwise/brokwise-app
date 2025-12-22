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

// Check if a user exists by email (unprotected endpoint)
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
