export interface Message {
  _id: string;
  content?: string;
  type: "text" | "image" | "file";
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  read: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  conversationId: string;
  senderId: string;
  senderType: "Admin" | "Broker" | "Company";
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  participantId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        firstName?: string;
        lastName?: string;
        companyName?: string;
      };
  participantType: "Broker" | "Company";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetails {
  conversation: Conversation;
  messages: Message[];
}
