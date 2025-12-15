import { useEffect, useRef } from "react";
import { useGetConversationDetails, useSendMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Spinner } from "@/components/ui/spinner";
import { UserData } from "@/context/AppContext";

interface ChatWindowProps {
  conversationId: string;
  currentUser: UserData | null;
  currentUserId?: string;
}

export const ChatWindow = ({
  conversationId,
  currentUserId,
}: ChatWindowProps) => {
  const { conversationDetails, isLoadingDetails, errorDetails } =
    useGetConversationDetails(conversationId);
  const { sendMessage, isSendingMessage } = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationDetails?.messages]);

  if (isLoadingDetails) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (errorDetails) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error loading chat
      </div>
    );
  }

  const handleSend = (content: string) => {
    sendMessage({ conversationId, content });
  };

  const messages = conversationDetails?.messages || [];
  // Reverse messages if backend returns newest first (common in pagination)
  // Backend code: .sort({ createdAt: -1 }) -> So newest first.
  // We want to display oldest at top, newest at bottom.
  // So we need to reverse the array for display.
  const displayMessages = [...messages].reverse();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No messages yet. Start a conversation!
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return <MessageBubble key={msg._id} message={msg} isMe={isMe} />;
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isSendingMessage} />
    </div>
  );
};
