import { customFetch } from "@/models/api";

import {
  CreateUserRequest,
  CreateUserResponse,
  SubmitUserDetailsRequest,
  SubmitUserDetailsResponse,
  GetBrokerDetailsRequest,
  GetBrokerDetailsResponse,
} from "../types/user";
import { ApiFunction } from "../types";

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
