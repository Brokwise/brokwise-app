import { customFetch } from "@/models/api";
import { ApiFunction } from "../types";
import {
  AcceptCompanyInvitationRequest,
  AcceptCompanyInvitationResponse,
  GetCompanyInvitationsRequest,
  GetCompanyInvitationsResponse,
  RejectCompanyInvitationRequest,
  RejectCompanyInvitationResponse,
} from "../types/invitation";

export const getCompanyInvitations: ApiFunction<
  GetCompanyInvitationsResponse,
  GetCompanyInvitationsRequest
> = async ({ status }) => {
  const query = status ? `?status=${status}` : "";
  return await customFetch({
    method: "GET",
    path: `/broker/invitations${query}`,
    isProtected: true,
  });
};

export const acceptCompanyInvitation: ApiFunction<
  AcceptCompanyInvitationResponse,
  AcceptCompanyInvitationRequest
> = async ({ invitationId }) => {
  return await customFetch({
    method: "POST",
    path: `/broker/invitations/${invitationId}/accept`,
    isProtected: true,
  });
};

export const rejectCompanyInvitation: ApiFunction<
  RejectCompanyInvitationResponse,
  RejectCompanyInvitationRequest
> = async ({ invitationId }) => {
  return await customFetch({
    method: "POST",
    path: `/broker/invitations/${invitationId}/reject`,
    isProtected: true,
  });
};

