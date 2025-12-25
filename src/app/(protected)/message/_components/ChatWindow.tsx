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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateIsNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 120;
  };

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const latestMessageId = conversationDetails?.messages?.[0]?._id;

  // Auto-scroll only when a NEW message arrives AND the user is already near the bottom.
  // This avoids fighting the user while they're scrolling older messages (especially with polling).
  useEffect(() => {
    if (!latestMessageId) return;
    if (!isNearBottomRef.current) return;
    scrollToBottom(true);
  }, [latestMessageId]);

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

  const handleSend = (data: {
    content?: string;
    type?: "text" | "image" | "file";
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    fileSize?: number;
  }) => {
    sendMessage({ conversationId, ...data });
  };

  const messages = conversationDetails?.messages || [];
  // Reverse messages if backend returns newest first (common in pagination)
  // Backend code: .sort({ createdAt: -1 }) -> So newest first.
  // We want to display oldest at top, newest at bottom.
  // So we need to reverse the array for display.
  const displayMessages = [...messages].reverse();

  return (
    <div className="flex flex-col h-full bg-background">
      <div
        ref={scrollContainerRef}
        onScroll={updateIsNearBottom}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin"
      >
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground opacity-50">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
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
