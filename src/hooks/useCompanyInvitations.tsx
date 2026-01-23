import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCompanyInvitations,
  acceptCompanyInvitation,
  rejectCompanyInvitation,
} from "@/models/api/invitation";
import { InvitationStatus } from "@/models/types/invitation";
import { toast } from "sonner";
import i18n from "@/i18n";

export const useCompanyInvitations = (
  status?: InvitationStatus,
  options?: { enabled?: boolean }
) => {
  const {
    data: invitations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companyInvitations", status],
    queryFn: async () => {
      const response = await getCompanyInvitations({ status });
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
  return { invitations, isLoading, error };
};

export const useAcceptCompanyInvitation = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (invitationId: string) => {
      return await acceptCompanyInvitation({ invitationId });
    },
    onSuccess: () => {
      toast.success(i18n.t("toast_invitation_accepted"));
      queryClient.invalidateQueries({ queryKey: ["companyInvitations"] });
      // Invalidate broker profile as well since status changed
      queryClient.invalidateQueries({ queryKey: ["brokerDetails"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toast_error_invitation_accept"));
    },
  });
  return { acceptInvitation: mutate, isPending, error };
};

export const useRejectCompanyInvitation = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (invitationId: string) => {
      return await rejectCompanyInvitation({ invitationId });
    },
    onSuccess: () => {
      toast.success(i18n.t("toast_invitation_rejected"));
      queryClient.invalidateQueries({ queryKey: ["companyInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toast_error_invitation_reject"));
    },
  });
  return { rejectInvitation: mutate, isPending, error };
};

