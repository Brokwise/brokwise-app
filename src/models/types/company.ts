import { Broker } from "@/stores/authStore";

export type CompanyStatus =
  | "approved"
  | "pending"
  | "incomplete"
  | "blacklisted";

export interface Company {
  name: string;
  email: string;
  _id: string;
  uid: string;
  mobile: string;
  gstin: string;
  city: string;
  officeAddress: string;
  status: CompanyStatus;
  createdAt: string;
  noOfEmployees: number;
}

export type CreateCompanyRequest = {
  email: string;
  name: string;
  uid: string;
  gstin: string;
  officeAddress: string;
  mobile: string;
  noOfEmployees: number;
  city: string;
};

export type CreateCompanyResponse = {
  data: Company;
};

export type GetCompanyDetailsRequest = {
  uid: string;
};

export type GetCompanyDetailsResponse = {
  data: Company;
};

export type UpdateCompanyProfileRequest = {
  _id: string;
  name?: string;
  mobile?: string;
  gstin?: string;
  city?: string;
  officeAddress?: string;
  noOfEmployees?: number;
};

export type UpdateCompanyProfileResponse = {
  data: Company;
};

export type AddBrokerRequest = {
  email: string;
};

export type AddBrokerResponse = {
  data: Broker;
};

export type GetCompanyBrokersRequest = {
  status?: string;
};

export type GetCompanyBrokersResponse = {
  data: Broker[];
};
