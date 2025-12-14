import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCompanyInvitations,
  acceptCompanyInvitation,
  rejectCompanyInvitation,
} from "@/models/api/invitation";
import { InvitationStatus } from "@/models/types/invitation";
import { toast } from "sonner";

export const useCompanyInvitations = (status?: InvitationStatus) => {
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
      toast.success("Invitation accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["companyInvitations"] });
      // Invalidate broker profile as well since status changed
      queryClient.invalidateQueries({ queryKey: ["brokerDetails"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept invitation");
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
      toast.success("Invitation rejected");
      queryClient.invalidateQueries({ queryKey: ["companyInvitations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject invitation");
    },
  });
  return { rejectInvitation: mutate, isPending, error };
};

