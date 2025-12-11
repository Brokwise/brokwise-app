import { customFetch } from "@/models/api";
import {
  CreateCompanyRequest,
  CreateCompanyResponse,
  GetCompanyDetailsRequest,
  GetCompanyDetailsResponse,
  UpdateCompanyProfileRequest,
  UpdateCompanyProfileResponse,
} from "../types/company";
import { ApiFunction } from "../types";
import { BrokerStatus } from "@/stores/authStore";
import {
  AddBrokerRequest,
  AddBrokerResponse,
  GetCompanyBrokersRequest,
  GetCompanyBrokersResponse,
} from "../types/company"; // We need to add these types

export const createCompany: ApiFunction<
  CreateCompanyResponse,
  CreateCompanyRequest
> = async (data) => {
  return await customFetch({
    method: "POST",
    path: "/company/create",
    body: data,
    isProtected: false,
  });
};

export const getCompanyDetails: ApiFunction<
  GetCompanyDetailsResponse,
  GetCompanyDetailsRequest
> = async ({ uid }) => {
  return await customFetch({
    method: "GET",
    path: `/company/getCompanyDetails?uid=${uid}`,
    isProtected: true,
  });
};

export const updateCompanyProfile: ApiFunction<
  UpdateCompanyProfileResponse,
  UpdateCompanyProfileRequest
> = async (data) => {
  return await customFetch({
    method: "PUT",
    path: "/company/updateProfile",
    body: data,
    isProtected: true,
  });
};

export const addBroker: ApiFunction<
  AddBrokerResponse,
  AddBrokerRequest
> = async (data) => {
  return await customFetch({
    method: "POST",
    path: "/company/broker/add",
    body: data,
    isProtected: true,
  });
};

export const getCompanyBrokers: ApiFunction<
  GetCompanyBrokersResponse,
  GetCompanyBrokersRequest
> = async ({ status }) => {
  const query = status ? `?status=${status}` : "";
  return await customFetch({
    method: "GET",
    path: `/company/brokers${query}`,
    isProtected: true,
  });
};

export const removeBrokerFromCompany: ApiFunction<
  Record<string, never>,
  { brokerId: string }
> = async ({ brokerId }) => {
  return await customFetch({
    method: "DELETE",
    path: `/company/broker/${brokerId}`,
    isProtected: true,
  });
};
