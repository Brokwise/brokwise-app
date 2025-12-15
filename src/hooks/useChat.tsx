import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "./useAxios";
import {
  Conversation,
  ConversationDetails,
  Message,
} from "@/models/types/chat";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApp } from "@/context/AppContext";

const useChatPrefix = () => {
  const { userData } = useApp();
  // If userType is company, use /company, otherwise use /broker (default for broker/admin).
  if (userData?.userType === "company") {
    return "/company";
  }
  return "/broker";
};

export const useGetConversations = (page = 1, limit = 10) => {
  const api = useAxios();
  const prefix = useChatPrefix();

  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: errorConversations,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations", page, limit, prefix],
    queryFn: async () => {
      // The endpoint is just /conversations under the prefix router
      // e.g. /company/conversations or /broker/conversations
      return (
        await api.get(`${prefix}/conversations?page=${page}&limit=${limit}`)
      ).data.data;
    },
    enabled: !!prefix,
  });

  return { conversations, isLoadingConversations, errorConversations };
};

export const useGetConversationDetails = (
  conversationId: string,
  page = 1,
  limit = 50,
  enabled = true
) => {
  const api = useAxios();
  const prefix = useChatPrefix();

  const {
    data: conversationDetails,
    isLoading: isLoadingDetails,
    error: errorDetails,
    refetch,
  } = useQuery<ConversationDetails>({
    queryKey: ["conversation", conversationId, page, limit, prefix],
    queryFn: async () => {
      return (
        await api.get(
          `${prefix}/conversations/${conversationId}?page=${page}&limit=${limit}`
        )
      ).data.data;
    },
    enabled: !!conversationId && enabled && !!prefix,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  return { conversationDetails, isLoadingDetails, errorDetails, refetch };
};

export const useCreateConversation = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const prefix = useChatPrefix();

  const {
    mutate: createConversation,
    isPending: isCreatingConversation,
    error: createConversationError,
  } = useMutation<
    Conversation,
    AxiosError<{ message: string }>,
    { participantId: string; participantType: "Broker" | "Company" }
  >({
    mutationFn: async (data) => {
      return (await api.post(`${prefix}/createConversation`, data)).data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create conversation"
      );
    },
  });

  return {
    createConversation,
    isCreatingConversation,
    createConversationError,
  };
};

export const useSendMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const prefix = useChatPrefix();

  const {
    mutate: sendMessage,
    isPending: isSendingMessage,
    error: sendMessageError,
  } = useMutation<
    Message,
    AxiosError<{ message: string }>,
    { conversationId: string; content: string }
  >({
    mutationFn: async (data) => {
      return (await api.post(`${prefix}/conversation/sendMessage`, data)).data
        .data;
    },
    onSuccess: (newMessage, variables) => {
      // Invalidate specific conversation to fetch new message
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
      // Also invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  return { sendMessage, isSendingMessage, sendMessageError };
};

export const useDeleteMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const prefix = useChatPrefix();

  const {
    mutate: deleteMessage,
    isPending: isDeletingMessage,
    error: deleteMessageError,
  } = useMutation<
    void,
    AxiosError<{ message: string }>,
    { messageId: string; conversationId: string }
  >({
    mutationFn: async ({ messageId }) => {
      await api.delete(`${prefix}/deleteMessage/${messageId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
      toast.success("Message deleted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete message");
    },
  });

  return { deleteMessage, isDeletingMessage, deleteMessageError };
};

export const useUpdateMessage = () => {
  const api = useAxios();
  const queryClient = useQueryClient();
  const prefix = useChatPrefix();

  const {
    mutate: updateMessage,
    isPending: isUpdatingMessage,
    error: updateMessageError,
  } = useMutation<
    Message,
    AxiosError<{ message: string }>,
    { messageId: string; content: string; conversationId: string }
  >({
    mutationFn: async ({ messageId, content }) => {
      return (
        await api.put(`${prefix}/updateMessage/${messageId}`, { content })
      ).data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
      toast.success("Message updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update message");
    },
  });

  return { updateMessage, isUpdatingMessage, updateMessageError };
};
