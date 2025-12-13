import { Broker } from "@/stores/authStore";

export type InvitationStatus = "pending" | "accepted" | "rejected";

export interface CompanyInvitation {
  _id: string;
  companyId: string;
  brokerId: string;
  brokerEmail: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  company: {
    _id: string;
    name: string;
    email: string;
    city: string;
    officeAddress: string;
  } | null;
}

export type GetCompanyInvitationsRequest = {
  status?: InvitationStatus;
};

export type GetCompanyInvitationsResponse = {
  data: CompanyInvitation[];
};

export type AcceptCompanyInvitationRequest = {
  invitationId: string;
};

export type AcceptCompanyInvitationResponse = {
  data: {
    invitation: CompanyInvitation;
    broker: Broker;
  };
};

export type RejectCompanyInvitationRequest = {
  invitationId: string;
};

export type RejectCompanyInvitationResponse = {
  data: CompanyInvitation;
};

